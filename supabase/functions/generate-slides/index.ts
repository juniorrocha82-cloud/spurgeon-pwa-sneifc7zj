import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import PptxGenJS from 'npm:pptxgenjs@3.12.0'
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

    const { sermon, slideCount, hasImages, theme, settings, customOutline, custom_outline } =
      await req.json()
    const outline = custom_outline || customOutline || sermon?.content?.custom_outline || ''

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
            const { data: userSettings } = await supabase
              .from('user_settings')
              .select('language')
              .eq('user_id', user.id)
              .maybeSingle()
            if (userSettings?.language) {
              language = userSettings.language
            }
          }
        }
      } catch (e) {
        console.error('Error fetching user settings:', e)
      }
    }

    if (language === 'en') langName = 'English'
    if (language === 'es') langName = 'Spanish'

    const systemPrompt = `Você é um especialista em criar apresentações de slides impactantes para pregações cristãs.
A partir do sermão fornecido, crie um roteiro de slides.
Número de slides desejado: ${slideCount === 'auto' ? 'Aproximadamente 6 a 8' : slideCount}.
Incluir sugestão de imagens: ${hasImages === 'yes' ? 'Sim' : 'Não'}.

IMPORTANT: All generated slide content MUST be written in ${langName}. The imageQuery must remain in English.

Retorne OBRIGATORIAMENTE em formato JSON com a seguinte estrutura:
{
  "slides": [
    {
      "title": "Título do slide (curto e impactante, in ${langName})",
      "content": "Tópicos ou texto para o slide (máximo 3 linhas para ficar legível durante a apresentação, in ${langName})",
      "imageQuery": "termo de busca em inglês para imagem realista e elegante (ex: 'cross silhouette', 'praying hands', 'bible study', 'nature landscape') - apenas se hasImages for yes, senão deixe vazio"
    }
  ]
}`

    let userPromptText = JSON.stringify({
      titulo: sermon.title,
      textoBase: sermon.baseText,
      introducao: sermon.content.intro,
      pontos: sermon.content.points,
      aplicacao: sermon.content.application || '',
      conclusao: sermon.content.conclusion,
    })

    if (outline) {
      userPromptText += `\n\nCrie slides que sigam exatamente a estrutura deste roteiro de pregação: ${outline}`
    }

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
              parts: [{ text: userPromptText }],
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

    // Fetch images and convert to Base64 (always do this if hasImages === 'yes' to guarantee parity)
    if (hasImages === 'yes' && generatedContent.slides) {
      const pexelsApiKey = Deno.env.get('PEXELS_API_KEY')
      const isDark = theme === 'dark'

      for (const slide of generatedContent.slides) {
        let imgUrl = ''

        if (slide.imageQuery) {
          if (pexelsApiKey) {
            try {
              const pexelsRes = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(slide.imageQuery)}&per_page=1&orientation=landscape`,
                {
                  headers: { Authorization: pexelsApiKey },
                },
              )
              if (pexelsRes.ok) {
                const pexelsData = await pexelsRes.json()
                if (pexelsData.photos && pexelsData.photos.length > 0) {
                  imgUrl = pexelsData.photos[0].src.large2x || pexelsData.photos[0].src.large
                }
              }
            } catch (e) {
              console.error('Error fetching from Pexels:', e)
            }
          }

          // Fallback to usecurling if Pexels failed or no key
          if (!imgUrl) {
            imgUrl = `https://img.usecurling.com/p/1280/720?q=${encodeURIComponent(slide.imageQuery)}&color=${isDark ? 'black' : 'white'}`
          }

          slide.imageUrl = imgUrl // Keep for reference

          // Convert to base64 for PPTX embedding and HTML parity
          try {
            const imgFetch = await fetch(imgUrl)
            if (imgFetch.ok) {
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
          } catch (e) {
            console.error('Error converting image to base64:', e)
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

      const userPrimaryColor = settings?.primaryColor || '#d97706'
      const accentColor = userPrimaryColor.replace('#', '').toUpperCase()
      const fontFamily = settings?.fontFamily || 'Arial'
      const logoBase64 = settings?.logoBase64

      // Title Slide
      const titleSlide = pres.addSlide()
      titleSlide.background = { color: bgColor }
      titleSlide.addText(sermon.title, {
        x: 0.5,
        y: 2.0,
        w: '90%',
        h: 1.5,
        fontFace: fontFamily,
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
        fontFace: fontFamily,
        fontSize: 24,
        color: textColor,
        align: 'center',
      })
      if (logoBase64) {
        titleSlide.addImage({
          data: logoBase64,
          x: '88%',
          y: '85%',
          w: 1.0,
          h: 1.0,
          sizing: { type: 'contain' },
        })
      }

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
          fontFace: fontFamily,
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
          fontFace: fontFamily,
          fontSize: 28,
          color: textColor,
          align: 'center',
          valign: 'middle',
        })

        if (logoBase64) {
          slide.addImage({
            data: logoBase64,
            x: '88%',
            y: '85%',
            w: 1.0,
            h: 1.0,
            sizing: { type: 'contain' },
          })
        }
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
