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
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API Key do Gemini não encontrada.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    let language = 'pt'
    let langName = 'Portuguese'
    const authHeader = req.headers.get('Authorization')

    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
              headers: { Authorization: authHeader },
            },
          })
          const token = authHeader.replace('Bearer ', '')
          const {
            data: { user },
          } = await supabase.auth.getUser(token)
          if (user) {
            // Admin tem acesso ilimitado
            if (user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
              const { data: sub } = await supabase
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
                const { count } = await supabase
                  .from('generation_logs')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('resource_type', 'sermon')

                if ((count || 0) >= 3) {
                  isBlocked = true
                  blockMessage = 'Seu plano gratuito permite gerar até 3 sermões no total.'
                }
              } else if (activePlan === 'pro') {
                let startDate = new Date()
                startDate.setDate(startDate.getDate() - 30)
                if (sub?.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
                  startDate = new Date(sub.usage_reset_at)
                }

                const { count } = await supabase
                  .from('generation_logs')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('resource_type', 'sermon')
                  .gte('created_at', startDate.toISOString())

                if ((count || 0) >= 15) {
                  isBlocked = true
                  blockMessage = 'Seu plano Pro permite gerar 15 sermões por mês.'
                }
              }

              if (isBlocked) {
                return new Response(
                  JSON.stringify({ error: 'LIMIT_REACHED', message: blockMessage }),
                  { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
                )
              }
            }

            const { data: settings } = await supabase
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao chamar API do Gemini')
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada pela API do Gemini.')
    }

    let responseText = data.candidates[0].content.parts[0].text
    responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')

    const generatedContent = JSON.parse(responseText)

    // Registrar o uso no banco de dados
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
          })
          const token = authHeader.replace('Bearer ', '')
          const {
            data: { user },
          } = await supabase.auth.getUser(token)
          if (user && user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
            await supabase.from('generation_logs').insert({
              user_id: user.id,
              resource_type: 'sermon',
            })
          }
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
