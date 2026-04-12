import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configurações do Supabase ausentes no ambiente.')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json().catch(() => ({}))
    const { model, messages, temperature = 0.7, max_tokens = 2048 } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Parâmetro "messages" é obrigatório e deve ser um array.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 1. Consultar a tabela 'api_providers' e ordenar por priority
    const { data: providers, error: providersError } = await supabase
      .from('api_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (providersError) {
      throw new Error(`Erro ao buscar provedores: ${providersError.message}`)
    }

    if (!providers || providers.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum provedor de API ativo encontrado.' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const logs: any[] = []
    let successfulResponse = null
    let usedProvider = null

    // 2. Tentar chamar cada API na ordem de prioridade usando as chaves do Supabase Secrets
    for (const provider of providers) {
      const providerName = provider.provider_name.toLowerCase()
      const envKeyName = `${providerName.toUpperCase()}_API_KEY`
      let apiKey = Deno.env.get(envKeyName)

      if (!apiKey && provider.api_key) {
        apiKey = provider.api_key
      }

      if (!apiKey) {
        console.warn(`[${provider.provider_name}] Chave de API não encontrada em Secrets.`)
        logs.push({
          provider: provider.provider_name,
          status: 'skipped',
          reason: 'Missing API Key in Secrets',
        })
        continue
      }

      console.log(`[ROUTE] Tentando provedor: ${provider.provider_name}...`)

      try {
        let resultText = null

        if (providerName === 'gemini') {
          let systemInstruction
          const geminiMessages = []
          for (const msg of messages) {
            if (msg.role === 'system') {
              systemInstruction = { parts: [{ text: msg.content }] }
            } else {
              geminiMessages.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
              })
            }
          }

          const requestBody: any = {
            contents: geminiMessages,
            generationConfig: {
              temperature: Number(temperature),
              maxOutputTokens: Number(max_tokens),
              responseMimeType: 'application/json',
            },
          }
          if (systemInstruction) requestBody.systemInstruction = systemInstruction

          const targetModel = model?.includes('gemini') ? model : 'gemini-2.5-flash-lite'
          let baseUrl = provider.endpoint

          if (!baseUrl) {
            baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`
          } else if (!baseUrl.includes(':generateContent')) {
            if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
            if (baseUrl.includes('/models/')) {
              baseUrl = `${baseUrl}:generateContent`
            } else {
              baseUrl = `${baseUrl}/models/${targetModel}:generateContent`
            }
          }

          const fetchUrl = baseUrl.includes('?')
            ? `${baseUrl}&key=${apiKey}`
            : `${baseUrl}?key=${apiKey}`
          const res = await fetch(fetchUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })

          if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
          const data = await res.json()
          resultText = data.candidates?.[0]?.content?.parts?.[0]?.text
        } else if (providerName === 'groq') {
          const targetModel =
            model?.includes('llama') || model?.includes('mixtral') ? model : 'llama3-70b-8192'
          const baseUrl = provider.endpoint || 'https://api.groq.com/openai/v1/chat/completions'
          const res = await fetch(baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: targetModel,
              messages,
              temperature: Number(temperature),
              max_tokens: Number(max_tokens),
              response_format: { type: 'json_object' },
            }),
          })
          if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
          const data = await res.json()
          resultText = data.choices?.[0]?.message?.content
        } else if (providerName === 'cohere') {
          const targetModel = model?.includes('command') ? model : 'command-r-plus'
          const baseUrl = provider.endpoint || 'https://api.cohere.ai/v1/chat'

          if (baseUrl.includes('/generate')) {
            const promptStr =
              messages
                .map(
                  (m: any) =>
                    `${m.role === 'system' ? 'System' : m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`,
                )
                .join('\n\n') + '\n\nAssistant:'

            const res = await fetch(baseUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Cohere-Version': '2022-12-06',
              },
              body: JSON.stringify({
                model: targetModel,
                prompt: promptStr,
                temperature: Number(temperature),
                max_tokens: Number(max_tokens),
              }),
            })
            if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
            const data = await res.json()
            resultText = data.generations?.[0]?.text || data.text
          } else {
            let chatHistory: any[] = []
            let message = ''
            let preamble = ''

            for (const msg of messages) {
              if (msg.role === 'system') preamble += msg.content + '\n'
              else if (msg === messages[messages.length - 1]) message = msg.content
              else
                chatHistory.push({
                  role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
                  message: msg.content,
                })
            }

            const res = await fetch(baseUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                model: targetModel,
                message,
                chat_history: chatHistory.length > 0 ? chatHistory : undefined,
                preamble: preamble || undefined,
                temperature: Number(temperature),
                max_tokens: Number(max_tokens),
              }),
            })
            if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
            const data = await res.json()
            resultText = data.text
          }
        } else if (providerName === 'together') {
          const targetModel = model || 'meta-llama/Llama-3-70b-chat-hf'
          const baseUrl = provider.endpoint || 'https://api.together.xyz/v1/chat/completions'
          const res = await fetch(baseUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: targetModel,
              messages,
              temperature: Number(temperature),
              max_tokens: Number(max_tokens),
              response_format: { type: 'json_object' },
            }),
          })
          if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
          const data = await res.json()
          resultText = data.choices?.[0]?.message?.content
        } else {
          throw new Error(`Provedor não suportado: ${providerName}`)
        }

        if (!resultText) {
          throw new Error('Resposta vazia da API')
        }

        // 4. Retornar a resposta da primeira API que funcionar
        successfulResponse = resultText
        usedProvider = provider.provider_name
        logs.push({ provider: provider.provider_name, status: 'success' })
        console.log(`[ROUTE] Sucesso com o provedor: ${provider.provider_name}`)
        break // Sai do loop após o primeiro sucesso
      } catch (err: any) {
        // 3. Se uma API falhar, tentar a próxima (fallback)
        console.error(`[ROUTE] Falha no provedor ${provider.provider_name}:`, err.message)
        logs.push({ provider: provider.provider_name, status: 'error', error: err.message })
      }
    }

    // 5. Se todas falharem, retornar erro 503 com mensagem clara
    if (!successfulResponse) {
      console.error('[ROUTE] Todos os provedores falharam.', logs)
      return new Response(
        JSON.stringify({
          error: 'Servidores sobrecarregados. Todos os provedores de IA falharam.',
          logs,
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        content: successfulResponse,
        provider: usedProvider,
        logs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('[ROUTE] Erro interno:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
