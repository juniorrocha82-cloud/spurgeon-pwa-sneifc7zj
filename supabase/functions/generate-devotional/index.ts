import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

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

    const systemPrompt = `Você é um teólogo, pastor e escritor cristão extremamente experiente e inspirador.
Sua tarefa é gerar um devocional diário com profundidade teológica, rigor bíblico e aplicação prática contundente. O texto total deve ter entre 800 e 1000 palavras.

Escolha aleatoriamente um texto bíblico edificante e rico para o devocional de hoje.

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "title": "Um título chamativo e reflexivo para o devocional",
  "baseText": "Referência Bíblica (ex: Salmos 23:1-3)",
  "reading": "O texto bíblico completo da referência, seguido OBRIGATORIAMENTE por uma explicação detalhada e rica sobre o contexto histórico e cultural da passagem (use quebras de linha \\n\\n para separar os parágrafos).",
  "reflection": "Uma análise teológica profunda (2 a 3 parágrafos robustos), seguida de uma aplicação prática detalhada para a vida moderna, conexões com outros versículos bíblicos relevantes e insights espirituais transformadores (use quebras de linha \\n\\n para separar os parágrafos).",
  "prayer": "Uma oração final extensa, personalizada, profunda e não genérica, que reflita intensamente a mensagem abordada no devocional."
}`

    const userPrompt = 'Gere o devocional diário de hoje com profundidade teológica, contexto histórico, aplicações modernas e no mínimo 800 a 1000 palavras.'

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
            maxOutputTokens: 3000,
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
