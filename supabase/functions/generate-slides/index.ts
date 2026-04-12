import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import PptxGenJS from 'npm:pptxgenjs@3.12.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

async function generateHash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sermon, slideCount, hasImages, theme, settings, customOutline, custom_outline } =
      await req.json()
    const outline = custom_outline || customOutline || sermon?.content?.custom_outline || ''

    let language = 'pt'
    let langName = 'Portuguese'
    const authHeader = req.headers.get('Authorization')

    let supabaseClient: any = null
    let currentUser: any = null

    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
        if (supabaseUrl && supabaseKey) {
          supabaseClient = createClient(supabaseUrl, supabaseKey, {
            global: {
              headers: { Authorization: authHeader },
            },
          })
          const token = authHeader.replace('Bearer ', '')
          const {
            data: { user },
          } = await supabaseClient.auth.getUser(token)
          if (user) {
            currentUser = user
            // Check limits for slide generation
            if (user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
              const { data: sub } = await supabaseClient
                .from('user_subscriptions')
                .select('plan_id, status, expires_at, usage_reset_at')
                .eq('user_id', user.id)
                .maybeSingle()

              const planId = sub?.plan_id || 'free'
              const status = sub?.status || 'active'
              const expiresAt = sub?.expires_at ? new Date(sub.expires_at) : null
              const now = new Date()

              const isPaidAndValid =
                planId !== 'free' && status === 'active' && expiresAt && expiresAt > now
              const activePlan = isPaidAndValid ? planId : 'free'

              let isBlocked = false
              let blockMessage = ''

              if (activePlan === 'free') {
                let startDate = new Date()
                startDate.setDate(startDate.getDate() - 7)
                if (sub?.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
                  startDate = new Date(sub.usage_reset_at)
                }

                const { count } = await supabaseClient
                  .from('generation_logs')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('resource_type', 'slides')
                  .gte('created_at', startDate.toISOString())

                if ((count || 0) >= 3) {
                  isBlocked = true
                  blockMessage =
                    'Você atingiu o limite de 3 apresentações do plano Gratuito nos últimos 7 dias. Faça um upgrade para o Pro e crie recursos visuais incríveis para suas mensagens!'
                }
              } else if (activePlan === 'pro') {
                let startDate = new Date()
                startDate.setDate(startDate.getDate() - 30)
                if (sub?.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
                  startDate = new Date(sub.usage_reset_at)
                }

                const { count } = await supabaseClient
                  .from('generation_logs')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('resource_type', 'slides')
                  .gte('created_at', startDate.toISOString())

                if ((count || 0) >= 15) {
                  isBlocked = true
                  blockMessage =
                    'Você atingiu o limite de 15 apresentações mensais do plano Pro. Considere o plano Enterprise para acesso ilimitado e continue impactando sua congregação.'
                }
              }

              if (isBlocked) {
                return new Response(
                  JSON.stringify({ error: 'LIMIT_REACHED', message: blockMessage }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
                )
              }
            }

            const { data: userSettings } = await supabaseClient
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

Responda SEMPRE em português brasileiro. Não use inglês em nenhuma circunstância. Gere os títulos, subtítulos, conteúdo dos slides e notas em português.
(Exceção técnica: apenas o valor do campo "imageQuery" no JSON deve ser em inglês para a busca de imagens).

Retorne OBRIGATORIAMENTE em formato JSON com a seguinte estrutura:
{
  "slides": [
    {
      "title": "Título do slide (curto e impactante, em português brasileiro)",
      "content": "Tópicos ou texto para o slide (máximo 3 linhas para ficar legível durante a apresentação, em português brasileiro)",
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

    const promptForHash =
      systemPrompt +
      userPromptText +
      language +
      theme +
      (settings?.primaryColor || '') +
      (settings?.fontFamily || '') +
      slideCount +
      hasImages
    const promptHash = await generateHash(promptForHash)

    if (supabaseClient) {
      const { data: cachedData } = await supabaseClient
        .from('gemini_cache')
        .select('response')
        .eq('prompt_hash', promptHash)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (cachedData) {
        if (currentUser && currentUser.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
          await (supabaseClient as any).from('generation_logs').insert({
            user_id: currentUser.id,
            resource_type: 'slides',
            provider_used: 'cache',
            metadata: { provider_used: 'cache', tempo_total: 0, tentativas: 0 },
          })
        }
        return new Response(JSON.stringify(cachedData.response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    const routerRes = await fetch(`${supabaseUrl}/functions/v1/route-api-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader || `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptText },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!routerRes.ok) {
      if (routerRes.status === 429) {
        return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const errText = await routerRes.text()
      console.error('Router error:', errText)
      throw new Error('Erro ao chamar o roteador de APIs')
    }

    const routerData = await routerRes.json()
    if (routerData.error) {
      throw new Error(routerData.error)
    }

    const textResponse = routerData.content

    if (!textResponse) {
      throw new Error('Nenhuma resposta válida gerada pela API.')
    }

    const cleanTextResponse = textResponse.replace(/```json\n?|\n?```/gi, '').trim()
    const generatedContent = JSON.parse(cleanTextResponse)
    const providerUsed = routerData.provider || 'unknown'
    const metadata = {
      provider_used: providerUsed,
      tempo_total: 0,
      tentativas: routerData.logs?.length || 1,
      logs: routerData.logs,
    }

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

    // Salvar no cache
    if (supabaseClient) {
      try {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        await supabaseClient.from('gemini_cache').upsert(
          {
            prompt_hash: promptHash,
            response: generatedContent,
            expires_at: expiresAt.toISOString(),
          },
          { onConflict: 'prompt_hash' },
        )
      } catch (e) {
        console.error('Erro ao salvar no cache:', e)
      }
    }

    // Registrar o uso no banco de dados
    if (supabaseClient && currentUser) {
      try {
        if (currentUser.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
          await (supabaseClient as any).from('generation_logs').insert({
            user_id: currentUser.id,
            resource_type: 'slides',
            provider_used: providerUsed,
            metadata: metadata,
          })
        }
      } catch (e) {
        console.error('Erro ao registrar log de geração de slides:', e)
      }
    }

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Exceção capturada:', error.message)
    const isRateLimit =
      error.message &&
      (error.message.includes('Quota exceeded') ||
        error.message.includes('429') ||
        error.message.includes('RESOURCE_EXHAUSTED'))

    if (isRateLimit) {
      return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

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
