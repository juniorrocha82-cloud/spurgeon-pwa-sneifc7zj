import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
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

    // Verifica plano do usuário
    let isFree = true
    if (user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('plan_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (sub && sub.plan_id !== 'free') {
        isFree = false
      }
    } else {
      isFree = false // Admin tem acesso ilimitado
    }

    // Verifica limite de devocionais do dia
    const { data: existingLimits } = await supabase
      .from('devotional_limits')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()

    const count = existingLimits?.count || 0

    // Se for plano gratuito e já gerou 2, bloqueia
    if (isFree && count >= 2) {
      return new Response(
        JSON.stringify({
          error: 'LIMIT_REACHED',
          message:
            'Você atingiu o limite de 2 devocionais diários do plano Gratuito. Faça um upgrade para o plano Pro e mergulhe na Palavra sem restrições!',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Se não gerou, continua a geração
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

Responda SEMPRE em português brasileiro. Não use inglês em nenhuma circunstância.

Responda OBRIGATORIAMENTE em formato JSON com a seguinte estrutura exata:
{
  "devotionals": [
    {
      "title": "Um título chamativo e reflexivo para o devocional",
      "baseText": "Referência Bíblica (ex: Salmos 23:1-3)",
      "reading": "O texto bíblico completo da referência",
      "reflection": "Uma reflexão profunda, encorajadora e prática sobre o texto (aproximadamente 3 ou 4 parágrafos)",
      "prayer": "Uma oração final curta e inspiradora baseada na reflexão"
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

    const promptForHash = systemPrompt + userPrompt + date + language
    const promptHash = await generateHash(promptForHash)

    const { data: cachedData } = await supabase
      .from('gemini_cache')
      .select('response')
      .eq('prompt_hash', promptHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    let generatedDevotionals = []
    let providerUsed = 'cache'
    let metadata: any = { provider_used: 'cache', tempo_total: 0, tentativas: 0 }

    if (cachedData && cachedData.response && (cachedData.response as any).devotionals) {
      generatedDevotionals = (cachedData.response as any).devotionals
    } else {
      const { data: routerData, error: routerError } = await supabase.functions.invoke(
        'route-api-request',
        {
          body: {
            model: 'gemini-1.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 3000,
          },
        },
      )

      if (routerError) {
        let errMsg = 'Erro ao chamar o roteador de APIs'
        if (routerError.context) {
          try {
            const errBody = await routerError.context.json()
            if (errBody.error) errMsg = errBody.error
          } catch (e) {
            // fallback
          }
        }
        console.error('Router error:', routerError)
        throw new Error(errMsg)
      }

      if (routerData?.error) {
        if (routerData.error === 'RATE_LIMIT_EXCEEDED') {
          return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        throw new Error(routerData.error)
      }

      const textResponse = routerData.content

      if (!textResponse) {
        throw new Error('Nenhuma resposta válida gerada pela API.')
      }

      const cleanTextResponse = textResponse.replace(/```json\n?|\n?```/gi, '').trim()
      const generatedContent = JSON.parse(cleanTextResponse)
      providerUsed = routerData.provider || 'unknown'
      metadata = {
        provider_used: providerUsed,
        tempo_total: 0,
        tentativas: routerData.logs?.length || 1,
        logs: routerData.logs,
      }
      generatedDevotionals = generatedContent.devotionals || []

      if (generatedDevotionals.length === 0) {
        throw new Error('Formato inválido retornado pela API')
      }

      // Save to cache
      try {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)
        await supabase.from('gemini_cache').upsert(
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

    if (user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
      try {
        await (supabase as any).from('generation_logs').insert({
          user_id: user.id,
          resource_type: 'devotional',
          provider_used: providerUsed,
          metadata: metadata,
        })
      } catch (e) {
        console.error('Erro ao registrar log de geração de devocionais:', e)
      }
    }

    return new Response(JSON.stringify({ devotionals: insertedDevotionals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
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

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
