import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "API Key da OpenAI não encontrada. Por favor, configure a secret 'OPENAI_API_KEY' no painel do Supabase Edge Functions.",
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { baseText, version, duration, sermonType = 'Expositivo' } = await req.json()

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

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura:
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Tema/Texto Base: ${baseText}\nVersão Bíblica: ${version}\nEstilo: ${sermonType}\nDuração estimada: ${duration} minutos.`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao chamar OpenAI')
    }

    const generatedContent = JSON.parse(data.choices[0].message.content)

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
