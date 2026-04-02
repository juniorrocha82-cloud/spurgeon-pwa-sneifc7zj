import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import PptxGenJS from 'npm:pptxgenjs@3.12.0'

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

    const { sermon, slideCount, hasImages, theme } = await req.json()

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
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro detalhado da API do Gemini:', data)
      throw new Error(
        `Erro na API do Gemini: ${data.error?.message || response.statusText || 'Erro desconhecido'}`,
      )
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('A API do Gemini não retornou nenhum conteúdo válido.')
    }

    let responseText = data.candidates[0].content.parts[0].text
    responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '')

    const generatedContent = JSON.parse(responseText)

    // Fetch images from Pexels if requested
    if (hasImages === 'yes') {
      const pexelsApiKey = Deno.env.get('PEXELS_API_KEY')
      if (pexelsApiKey && generatedContent.slides) {
        for (const slide of generatedContent.slides) {
          if (slide.imageQuery) {
            try {
              const pexelsRes = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(slide.imageQuery)}&per_page=1&orientation=landscape`,
                {
                  headers: {
                    Authorization: pexelsApiKey,
                  },
                },
              )
              if (pexelsRes.ok) {
                const pexelsData = await pexelsRes.json()
                if (pexelsData.photos && pexelsData.photos.length > 0) {
                  const imgUrl = pexelsData.photos[0].src.large2x || pexelsData.photos[0].src.large
                  slide.imageUrl = imgUrl

                  // Convert to base64 for PPTX embedding
                  const imgFetch = await fetch(imgUrl)
                  const arrayBuffer = await imgFetch.arrayBuffer()
                  const bytes = new Uint8Array(arrayBuffer)
                  const CHUNK_SIZE = 8192
                  let binary = ''
                  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
                    binary += String.fromCharCode.apply(
                      null,
                      Array.from(bytes.subarray(i, i + CHUNK_SIZE)),
                    )
                  }
                  const base64 = btoa(binary)
                  slide.imageBase64 = `data:${imgFetch.headers.get('content-type') || 'image/jpeg'};base64,${base64}`
                }
              }
            } catch (e) {
              console.error('Error fetching from Pexels:', e)
            }
          }
        }
      }
    }

    // Generate PPTX
    try {
      const pres = new PptxGenJS()
      pres.layout = 'LAYOUT_16x9'

      const isDark = theme === 'dark'
      const bgColor = isDark ? '0F172A' : 'FFFFFF'
      const textColor = isDark ? 'F8FAFC' : '0F172A'
      const accentColor = 'D97706' // amber-600

      // Title Slide
      const titleSlide = pres.addSlide()
      titleSlide.background = { color: bgColor }
      titleSlide.addText(sermon.title, {
        x: 0.5,
        y: 2.0,
        w: '90%',
        h: 1.5,
        fontSize: 44,
        color: accentColor,
        bold: true,
        align: 'center',
      })
      titleSlide.addText(`${sermon.baseText} - ${sermon.version}`, {
        x: 0.5,
        y: 3.5,
        w: '90%',
        h: 1.0,
        fontSize: 24,
        color: textColor,
        align: 'center',
      })

      // Content Slides
      for (const slideData of generatedContent.slides) {
        const slide = pres.addSlide()

        if (hasImages === 'yes' && slideData.imageBase64) {
          slide.background = { data: slideData.imageBase64 }
          slide.addShape(pres.ShapeType.rect, {
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            fill: { color: isDark ? '000000' : 'FFFFFF', transparency: 40 },
          })
        } else {
          slide.background = { color: bgColor }
        }

        slide.addText(slideData.title, {
          x: 0.5,
          y: 0.8,
          w: '90%',
          h: 1.5,
          fontSize: 36,
          color: accentColor,
          bold: true,
          align: 'center',
        })

        slide.addText(slideData.content.replace(/<br\/>/g, '\n'), {
          x: 1.0,
          y: 2.5,
          w: '80%',
          h: 3.5,
          fontSize: 28,
          color: textColor,
          align: 'center',
          valign: 'middle',
        })
      }

      const pptxBase64 = await pres.write({ outputType: 'base64' })
      generatedContent.pptxBase64 = pptxBase64
    } catch (e) {
      console.error('Erro ao gerar PPTX:', e)
    }

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Exceção capturada:', error.message)
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro interno no processamento da geração de slides.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
