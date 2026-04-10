import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
          const supabase = createClient(supabaseUrl, supabaseKey)
          const token = authHeader.replace('Bearer ', '')
          const {
            data: { user },
          } = await supabase.auth.getUser(token)
          if (user) {
            // Admin tem acesso ilimitado
            if (user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
              const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('plan_id, sermons_generated')
                .eq('user_id', user.id)
                .maybeSingle()

              if (sub && sub.plan_id === 'free') {
                const generated = sub.sermons_generated || 0
                if (generated >= 3) {
                  return new Response(
                    JSON.stringify({
                      error: 'Limite de 3 sermões atingido. Faça upgrade para continuar',
                    }),
                    {
                      status: 403,
                      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    },
                  )
                }
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

IMPORTANT: All generated content (title, intro, points, conclusion, insights) MUST be translated to and written in ${langName}.

A estrutura do sermão DEVE seguir rigorosamente a homilética cristã:
1. Introdução
2. Proposição (A ideia central do sermão)
3. Tópicos Principais (Desenvolvimento, mínimo de 3)
4. Ilustração
5. Aplicação Prática (A ponte entre a verdade bíblica e a vida dos ouvintes)
6. Conclusão

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "title": "Um título chamativo e profundo para o sermão (in ${langName})",
  "content": {
    "intro": "Texto da introdução... (in ${langName})",
    "proposition": "Texto da proposição... (in ${langName})",
    "points": [
      { "title": "Título do ponto 1 (in ${langName})", "text": "Desenvolvimento do ponto 1... (in ${langName})" }
    ],
    "illustration": "Texto da ilustração... (in ${langName})",
    "application": "Texto da aplicação prática... (in ${langName})",
    "conclusion": "Texto da conclusão e apelo... (in ${langName})"
  },
  "insights": [
    "Dica prática para o pregador 1... (in ${langName})"
  ],
  "references": [
    "Livro Capítulo:Versículo - Breve explicação da relevância (in ${langName})"
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
