import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Sem autorização')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    let date = new Date().toISOString().split('T')[0]
    if (req.method === 'POST') {
      const reqData = await req.json().catch(() => ({}))
      if (reqData.date) date = reqData.date
    } else if (req.method === 'GET') {
      const url = new URL(req.url)
      if (url.searchParams.get('date')) {
        date = url.searchParams.get('date') as string
      }
    }

    // Verifica limite de devocionais do dia
    const { data: existingLimits } = await supabase
      .from('devotional_limits')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    const count = existingLimits?.count || 0

    // Se já gerou 2, retorna os existentes do dia
    if (count >= 2) {
      const { data: existingDevotionals } = await supabase
        .from('devotionals')
        .select('*')
        .eq('user_id', user.id)
        .eq('devotional_date', date)
        .order('created_at', { ascending: false })
        .limit(2)

      return new Response(JSON.stringify({ devotionals: existingDevotionals || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Se não gerou, chama a API Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key do Gemini não encontrada.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let language = 'pt'
    let langName = 'Portuguese'
    const { data: settings } = await supabase
      .from('user_settings')
      .select('language')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settings?.language) {
      language = settings.language
    }

    if (language === 'en') langName = 'English'
    if (language === 'es') langName = 'Spanish'

    const systemPrompt = `Você é um pastor e escritor cristão experiente e inspirador.
Sua tarefa é gerar 2 devocionais diários profundos, reconfortantes e práticos.

Escolha aleatoriamente textos bíblicos edificantes para os devocionais de hoje.

IMPORTANT: All generated content (title, baseText, reading, reflection, prayer) MUST be translated to and written in ${langName}.

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "devotionals": [
    {
      "title": "Um título chamativo e reflexivo para o devocional (in ${langName})",
      "baseText": "Referência Bíblica (ex: Salmos 23:1-3)",
      "reading": "O texto bíblico completo da referência (in ${langName})",
      "reflection": "Uma reflexão profunda, encorajadora e prática sobre o texto (aproximadamente 3 ou 4 parágrafos) (in ${langName})",
      "prayer": "Uma oração final curta e inspiradora baseada na reflexão (in ${langName})"
    },
    {
      "title": "Outro título...",
      "baseText": "Outra Referência...",
      "reading": "...",
      "reflection": "...",
      "prayer": "..."
    }
  ]
}`

    const userPrompt = 'Gere 2 devocionais diários de hoje.'

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
    const generatedDevotionals = generatedContent.devotionals || []

    if (generatedDevotionals.length === 0) {
      throw new Error('Formato inválido retornado pelo Gemini')
    }

    // Insere os devocionais na tabela 'devotionals' com a data do dia
    const devotionalsToInsert = generatedDevotionals.map((dev: any) => ({
      user_id: user.id,
      title: dev.title,
      base_text: dev.baseText,
      content: dev,
      devotional_text: dev.reflection,
      devotional_date: date,
    }))

    const { data: insertedDevotionals, error: insertError } = await supabase
      .from('devotionals')
      .insert(devotionalsToInsert)
      .select()

    if (insertError) {
      throw insertError
    }

    // Atualiza 'devotional_limits' incrementando o contador
    if (existingLimits) {
      await supabase
        .from('devotional_limits')
        .update({ count: count + generatedDevotionals.length })
        .eq('user_id', user.id)
        .eq('date', date)
    } else {
      await supabase
        .from('devotional_limits')
        .insert({ user_id: user.id, date: date, count: generatedDevotionals.length })
    }

    return new Response(JSON.stringify({ devotionals: insertedDevotionals }), {
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
