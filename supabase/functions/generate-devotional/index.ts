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
          error:
            "API Key do Gemini não encontrada. Por favor, configure a secret 'GEMINI_API_KEY' no painel do Supabase Edge Functions.",
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
        console.error('Error fetching user settings:', e)
      }
    }

    if (language === 'en') langName = 'English'
    if (language === 'es') langName = 'Spanish'

    const systemPrompt = `Você é um pastor e escritor cristão experiente e inspirador.
Sua tarefa é gerar um devocional diário profundo, reconfortante e prático.

Escolha aleatoriamente um texto bíblico edificante para o devocional de hoje.

IMPORTANT: All generated content (title, baseText, reading, reflection, prayer) MUST be translated to and written in ${langName}.

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "title": "Um título chamativo e reflexivo para o devocional (in ${langName})",
  "baseText": "Referência Bíblica (ex: Salmos 23:1-3)",
  "reading": "O texto bíblico completo da referência (in ${langName})",
  "reflection": "Uma reflexão profunda, encorajadora e prática sobre o texto (aproximadamente 3 ou 4 parágrafos) (in ${langName})",
  "prayer": "Uma oração final curta e inspiradora baseada na reflexão (in ${langName})"
}`

    const userPrompt = 'Gere o devocional diário de hoje.'

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
            temperature: 0.8,
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
