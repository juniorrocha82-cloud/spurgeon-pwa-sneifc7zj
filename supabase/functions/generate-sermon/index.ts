import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

async function generateHash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

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
    let language = 'pt'
    let langName = 'Portuguese'
    const authHeader = req.headers.get('Authorization')

    let supabaseClient: any = null
    let currentUser: any = null

    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        if (supabaseUrl && supabaseKey) {
          supabaseClient = createClient(supabaseUrl, supabaseKey, {
            global: {
              headers: { Authorization: authHeader },
            },
          })
          const token = authHeader.replace('Bearer ', '')
          const {
            data: { user },
          } = await supabaseClient.auth.getUser(token)
          if (user) {
            currentUser = user
            // Admin tem acesso ilimitado
            if (user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
              const { data: sub } = await supabaseClient
                .from('user_subscriptions')
                .select('plan_id, status, expires_at, usage_reset_at')
                .eq('user_id', user.id)
                .maybeSingle()

              const planId = sub?.plan_id || 'free'
              const status = sub?.status || 'active'
              const expiresAt = sub?.expires_at ? new Date(sub.expires_at) : null
              const now = new Date()

              // Fallback para free se o plano pago estiver vencido ou inativo
              const isPaidAndValid =
                planId !== 'free' && status === 'active' && expiresAt && expiresAt > now
              const activePlan = isPaidAndValid ? planId : 'free'

              let isBlocked = false
              let blockMessage = ''

              if (activePlan === 'free') {
                let startDate = new Date()
                startDate.setDate(startDate.getDate() - 7)
                if (sub?.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
                  startDate = new Date(sub.usage_reset_at)
                }

                const { count } = await supabaseClient
                  .from('generation_logs')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('resource_type', 'sermon')
                  .gte('created_at', startDate.toISOString())

                if ((count || 0) >= 3) {
                  isBlocked = true
                  blockMessage =
                    'Você atingiu o limite de 3 sermões do plano Gratuito nos últimos 7 dias. Que tal fazer um upgrade para continuar inspirando vidas com pregações ilimitadas?'
                }
              } else if (activePlan === 'pro') {
                let startDate = new Date()
                startDate.setDate(startDate.getDate() - 30)
                if (sub?.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
                  startDate = new Date(sub.usage_reset_at)
                }

                const { count } = await supabaseClient
                  .from('generation_logs')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('resource_type', 'sermon')
                  .gte('created_at', startDate.toISOString())

                if ((count || 0) >= 15) {
                  isBlocked = true
                  blockMessage =
                    'Você atingiu o limite de 15 sermões do plano Pro neste mês. Continue seu excelente trabalho fazendo um upgrade para o Enterprise ou aguarde a renovação do ciclo.'
                }
              }

              if (isBlocked) {
                return new Response(
                  JSON.stringify({ error: 'LIMIT_REACHED', message: blockMessage }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
                )
              }
            }

            const { data: settings } = await supabaseClient
              .from('user_settings')
              .select('language')
              .eq('user_id', user.id)
              .maybeSingle()
            if (settings?.language) {
              language = settings.language
            }
          }
        }
      } catch (e) {
        console.error('Error fetching user settings ou checando limites:', e)
      }
    }

    if (language === 'en') langName = 'English'
    if (language === 'es') langName = 'Spanish'

    const {
      baseText,
      version,
      duration,
      sermonType = 'Expositivo',
      customOutline,
      custom_outline,
    } = await req.json()

    const outline = custom_outline || customOutline || ''

    const systemPrompt = `Você é um assistente teológico homilético experiente.
Sua tarefa é gerar um sermão estruturado com base no texto ou tema fornecido, utilizando a versão bíblica solicitada (${version}).
O estilo da pregação será: ${sermonType} (Expositivo ou Temático).
A duração estimada é de ${duration} minutos.

Responda SEMPRE em português brasileiro. Não use inglês em nenhuma circunstância. Gere a pregação completa em português.

A estrutura do sermão DEVE seguir rigorosamente a homilética cristã:
1. Introdução
2. Proposição (A ideia central do sermão)
3. Tópicos Principais (Desenvolvimento, mínimo de 3)
4. Ilustração
5. Aplicação Prática (A ponte entre a verdade bíblica e a vida dos ouvintes)
6. Conclusão

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "title": "Um título chamativo e profundo para o sermão",
  "content": {
    "intro": "Texto da introdução...",
    "proposition": "Texto da proposição...",
    "points": [
      { "title": "Título do ponto 1", "text": "Desenvolvimento do ponto 1..." }
    ],
    "illustration": "Texto da ilustração...",
    "application": "Texto da aplicação prática...",
    "conclusion": "Texto da conclusão e apelo..."
  },
  "insights": [
    "Dica prática para o pregador 1..."
  ],
  "references": [
    "Livro Capítulo:Versículo - Breve explicação da relevância"
  ]
}`

    const userPrompt = `Tema/Texto Base: ${baseText}\nVersão Bíblica: ${version}\nEstilo: ${sermonType}\nDuração estimada: ${duration} minutos.${outline ? `\n\nUse o seguinte roteiro de pregação como base para estruturar o sermão: ${outline}` : ''}`

    const promptForHash = systemPrompt + userPrompt + language
    const promptHash = await generateHash(promptForHash)

    if (supabaseClient) {
      const { data: cachedData } = await supabaseClient
        .from('gemini_cache')
        .select('response')
        .eq('prompt_hash', promptHash)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (cachedData) {
        if (currentUser && currentUser.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
          await (supabaseClient as any).from('generation_logs').insert({
            user_id: currentUser.id,
            resource_type: 'sermon',
            provider_used: 'cache',
            metadata: { provider_used: 'cache', tempo_total: 0, tentativas: 0 },
          })
        }
        return new Response(JSON.stringify(cachedData.response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    const routerRes = await fetch(`${supabaseUrl}/functions/v1/route-api-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader || `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!routerRes.ok) {
      if (routerRes.status === 429) {
        return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const errText = await routerRes.text()
      console.error('Router error:', errText)
      throw new Error('Erro ao chamar o roteador de APIs')
    }

    const routerData = await routerRes.json()
    if (routerData.error) {
      throw new Error(routerData.error)
    }

    const textResponse = routerData.content

    if (!textResponse) {
      throw new Error('Nenhuma resposta válida gerada pela API.')
    }

    const cleanTextResponse = textResponse.replace(/```json\n?|\n?```/gi, '').trim()
    const generatedContent = JSON.parse(cleanTextResponse)
    const providerUsed = routerData.provider || 'unknown'
    const metadata = {
      provider_used: providerUsed,
      tempo_total: 0,
      tentativas: routerData.logs?.length || 1,
      logs: routerData.logs,
    }

    // Salvar no cache
    if (supabaseClient) {
      try {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        await supabaseClient.from('gemini_cache').upsert(
          {
            prompt_hash: promptHash,
            response: generatedContent,
            expires_at: expiresAt.toISOString(),
          },
          { onConflict: 'prompt_hash' },
        )
      } catch (e) {
        console.error('Erro ao salvar no cache:', e)
      }
    }

    // Registrar o uso no banco de dados
    if (supabaseClient && currentUser) {
      try {
        if (currentUser.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
          await (supabaseClient as any).from('generation_logs').insert({
            user_id: currentUser.id,
            resource_type: 'sermon',
            provider_used: providerUsed,
            metadata: metadata,
          })
        }
      } catch (e) {
        console.error('Erro ao registrar log de geração:', e)
      }
    }

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    const isRateLimit =
      error.message &&
      (error.message.includes('Quota exceeded') ||
        error.message.includes('429') ||
        error.message.includes('RESOURCE_EXHAUSTED'))

    if (isRateLimit) {
      return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
