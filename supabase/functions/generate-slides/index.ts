import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_SLIDES') || Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API Key do Gemini (Slides) não encontrada.',
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
      "imageQuery": "Um prompt descritivo em inglês para geração de IA (ex: 'A dramatic silhouette of a cross on a hill at sunset', 'An open old bible with glowing light', 'A serene nature landscape with mountains') - apenas se hasImages for yes, senão deixe vazio"
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

    const textResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    const data = await textResponse.json()

    if (!textResponse.ok) {
      throw new Error(data.error?.message || 'Erro ao chamar API do Gemini (Texto)')
    }

    let responseText = data.candidates[0].content.parts[0].text

    // Safety clean
    responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')

    const generatedContent = JSON.parse(responseText)

    if (hasImages === 'yes' && generatedContent.slides && Array.isArray(generatedContent.slides)) {
      const slidesWithImages = await Promise.all(
        generatedContent.slides.map(async (slide: any) => {
          if (slide.imageQuery) {
            try {
              const imagePrompt = `Create a picture of: ${slide.imageQuery}. Style: photorealistic, elegant, high quality, suitable for a church presentation background, no text.`

              const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
                  }),
                },
              )

              if (imageResponse.ok) {
                const imageData = await imageResponse.json()
                const parts = imageData.candidates?.[0]?.content?.parts
                if (parts && parts.length > 0) {
                  const inlineData = parts.find((p: any) => p.inlineData)?.inlineData
                  if (inlineData) {
                    slide.imageBase64 = `data:${inlineData.mimeType};base64,${inlineData.data}`
                  }
                }
              }
            } catch (err) {
              console.error(`Falha ao gerar imagem para o slide: ${slide.title}`, err)
            }
          }
          return slide
        }),
      )
      generatedContent.slides = slidesWithImages
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
