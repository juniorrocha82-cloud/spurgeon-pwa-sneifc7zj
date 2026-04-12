import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Timeout de ${timeoutMs}ms excedido.`)
    }
    throw error
  } finally {
    clearTimeout(id)
  }
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

    console.log('[ROUTE] Iniciando roteamento. Modelo solicitado:', model || 'default')

    // 1. Consultar a tabela 'api_providers' e ordenar por priority
    const { data: providers, error: providersError } = await supabase
      .from('api_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (providersError) {
      console.error('[ROUTE] Erro ao buscar provedores:', providersError.message)
      throw new Error(`Erro ao buscar provedores: ${providersError.message}`)
    }

    if (!providers || providers.length === 0) {
      console.warn('[ROUTE] Nenhum provedor ativo encontrado na tabela api_providers.')
      return new Response(JSON.stringify({ error: 'Nenhum provedor de API ativo encontrado.' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const logs: any[] = []
    let successfulResponse = null
    let usedProvider = null

    // 2. Tentar chamar cada API na ordem de prioridade com timeout
    for (const provider of providers) {
      const providerName = provider.provider_name.toLowerCase()
      const envKeyName = `${providerName.toUpperCase()}_API_KEY` // Ex: GROQ_API_KEY, GEMINI_API_KEY

      console.log(
        `[ROUTE] [${provider.provider_name}] Tentando ler a chave de API do Supabase Secrets (${envKeyName}) ou do banco de dados...`,
      )
      let apiKey = Deno.env.get(envKeyName) || provider.api_key

      if (!apiKey) {
        console.error(
          `[ROUTE] [${provider.provider_name}] ERRO: Chave de API não encontrada (${envKeyName}).`,
        )
        return new Response(
          JSON.stringify({
            error: `Chave de API ausente para o provedor ${provider.provider_name}. Verifique se a variável de ambiente ${envKeyName} está configurada no Supabase Secrets.`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      console.log(`[ROUTE] [${provider.provider_name}] Chave de API lida com sucesso.`)
      console.log(`[ROUTE] Tentando provedor: ${provider.provider_name}...`)
      const startTime = Date.now()

      try {
        let resultText = null

        // 3. Chamar a API correspondente
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
          let baseUrl =
            provider.endpoint ||
            `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`

          if (!baseUrl.includes(':generateContent')) {
            if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
            if (baseUrl.includes('/models/')) baseUrl = `${baseUrl}:generateContent`
            else baseUrl = `${baseUrl}/models/${targetModel}:generateContent`
          }

          const fetchUrl = baseUrl.includes('?')
            ? `${baseUrl}&key=${apiKey}`
            : `${baseUrl}?key=${apiKey}`

          console.log(`[ROUTE] [${provider.provider_name}] Chamando ${fetchUrl}`)
          const res = await fetchWithTimeout(
            fetchUrl,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            },
            30000,
          ) // Timeout de 30s

          if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
          const data = await res.json()
          resultText = data.candidates?.[0]?.content?.parts?.[0]?.text
        } else if (providerName === 'groq') {
          const targetModel =
            model?.includes('llama') || model?.includes('mixtral') ? model : 'llama3-70b-8192'
          const baseUrl = provider.endpoint || 'https://api.groq.com/openai/v1/chat/completions'

          console.log(
            `[ROUTE] [${provider.provider_name}] Chamando ${baseUrl} (Modelo: ${targetModel})`,
          )
          const res = await fetchWithTimeout(
            baseUrl,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: targetModel,
                messages,
                temperature: Number(temperature),
                max_tokens: Number(max_tokens),
                response_format: { type: 'json_object' },
              }),
            },
            30000,
          ) // Timeout de 30s

          if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
          const data = await res.json()
          resultText = data.choices?.[0]?.message?.content
        } else if (providerName === 'cohere') {
          const targetModel = model?.includes('command') ? model : 'command-r-plus'
          const baseUrl = provider.endpoint || 'https://api.cohere.ai/v1/chat'

          console.log(
            `[ROUTE] [${provider.provider_name}] Chamando ${baseUrl} (Modelo: ${targetModel})`,
          )
          if (baseUrl.includes('/generate')) {
            const promptStr =
              messages
                .map(
                  (m: any) =>
                    `${m.role === 'system' ? 'System' : m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`,
                )
                .join('\n\n') + '\n\nAssistant:'

            const res = await fetchWithTimeout(
              baseUrl,
              {
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
              },
              30000,
            ) // Timeout de 30s

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

            const res = await fetchWithTimeout(
              baseUrl,
              {
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
              },
              30000,
            ) // Timeout de 30s

            if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
            const data = await res.json()
            resultText = data.text
          }
        } else if (providerName === 'together') {
          const targetModel = model || 'meta-llama/Llama-3-70b-chat-hf'
          const baseUrl = provider.endpoint || 'https://api.together.xyz/v1/chat/completions'

          console.log(
            `[ROUTE] [${provider.provider_name}] Chamando ${baseUrl} (Modelo: ${targetModel})`,
          )
          const res = await fetchWithTimeout(
            baseUrl,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: targetModel,
                messages,
                temperature: Number(temperature),
                max_tokens: Number(max_tokens),
                response_format: { type: 'json_object' },
              }),
            },
            30000,
          ) // Timeout de 30s

          if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`)
          const data = await res.json()
          resultText = data.choices?.[0]?.message?.content
        } else {
          throw new Error(`Provedor não suportado de forma nativa pela função: ${providerName}`)
        }

        if (!resultText) {
          throw new Error('Resposta gerada vazia.')
        }

        const duration = Date.now() - startTime
        console.log(`[ROUTE] Sucesso com o provedor: ${provider.provider_name} em ${duration}ms`)

        successfulResponse = resultText
        usedProvider = provider.provider_name
        logs.push({ provider: provider.provider_name, status: 'success', durationMs: duration })
        break // 4. Sai do loop após o primeiro sucesso
      } catch (err: any) {
        // 4. Se falhar, registra no log e tenta a próxima
        const duration = Date.now() - startTime
        console.error(
          `[ROUTE] Falha no provedor ${provider.provider_name} após ${duration}ms:`,
          err.message,
        )
        logs.push({
          provider: provider.provider_name,
          status: 'error',
          error: err.message,
          durationMs: duration,
        })
      }
    }

    // 5. Se todas falharem, retornar erro 503 com mensagem clara
    if (!successfulResponse) {
      console.error('[ROUTE] Todos os provedores falharam.', JSON.stringify(logs))
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
