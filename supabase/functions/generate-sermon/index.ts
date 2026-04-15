import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
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

A estrutura do sermão DEVE seguir rigorosamente a homilética cristã:
1. Introdução
2. Proposição (A ideia central do sermão)
3. Tópicos Principais (Desenvolvimento, mínimo de 3)
4. Ilustração
5. Conclusão

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "title": "Um título chamativo e profundo para o sermão",
  "content": {
    "intro": "Texto da introdução...",
    "proposition": "Texto da proposição...",
    "points": [
      { "title": "Título do ponto 1", "text": "Desenvolvimento do ponto 1..." },
      { "title": "Título do ponto 2", "text": "Desenvolvimento do ponto 2..." }
    ],
    "illustration": "Texto da ilustração...",
    "conclusion": "Texto da conclusão e apelo..."
  },
  "insights": [
    "Dica prática para o pregador 1...",
    "Dica prática para o pregador 2..."
  ],
  "references": [
    "Livro Capítulo:Versículo - Breve explicação da relevância",
    "Livro Capítulo:Versículo - Breve explicação da relevância"
  ]
}`

    const userPrompt = `Tema/Texto Base: ${baseText}\nVersão Bíblica: ${version}\nEstilo: ${sermonType}\nDuração estimada: ${duration} minutos.${outline ? `\n\nUse o seguinte roteiro de pregação como base para estruturar o sermão: ${outline}` : ''}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
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

    // Tratamento extra de segurança contra blocos markdown
    responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')

    const generatedContent = JSON.parse(responseText)

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
