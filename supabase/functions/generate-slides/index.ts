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
          error: 'API Key do Gemini não encontrada.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { sermon, slideCount, hasImages } = await req.json()

    const systemPrompt = `Você é um especialista em criar apresentações de slides impactantes para pregações cristãs.
A partir do sermão fornecido, crie um roteiro de slides.
Número de slides desejado: ${slideCount === 'auto' ? 'Aproximadamente 6 a 8' : slideCount}.
Incluir sugestão de imagens: ${hasImages === 'yes' ? 'Sim' : 'Não'}.

Retorne OBRIGATORIAMENTE em formato JSON com a seguinte estrutura:
{
  "slides": [
    {
      "title": "Título do slide (curto e impactante)",
      "content": "Tópicos ou texto para o slide (máximo 3 linhas para ficar legível durante a apresentação)",
      "imageQuery": "termo de busca em inglês para imagem realista e elegante (ex: 'cross silhouette', 'praying hands', 'bible study', 'nature landscape') - apenas se hasImages for yes, senão deixe vazio"
    }
  ]
}`

    const userPrompt = JSON.stringify({
      titulo: sermon.title,
      textoBase: sermon.baseText,
      introducao: sermon.content.intro,
      pontos: sermon.content.points,
      conclusao: sermon.content.conclusion,
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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

    let responseText = data.candidates[0].content.parts[0].text

    // Safety clean
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
