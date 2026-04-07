import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  console.log('--- Iniciando chamada get-admin-users ---')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase ausentes.')
    }

    // 1. Usar a SERVICE_ROLE_KEY para contornar RLS
    console.log('Etapa 1: Inicializando cliente Supabase com SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Buscar todos os usuários da tabela 'auth.users'
    console.log('Etapa 2: Buscando usuários em auth.users')
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    })
    if (authError) {
      console.error('Erro ao buscar usuários:', authError)
      throw authError
    }
    const users = authData.users || []
    console.log(`Etapa 2.1: ${users.length} usuários encontrados.`)

    // 3. Buscar user_subscriptions
    console.log('Etapa 3: Buscando user_subscriptions')
    const { data: subs, error: subsError } = await supabase.from('user_subscriptions').select('*')

    if (subsError) {
      console.error('Erro ao buscar assinaturas:', subsError)
      throw subsError
    }
    console.log(`Etapa 3.1: ${subs?.length || 0} assinaturas encontradas.`)

    // 4. Buscar subscription_plans
    console.log('Etapa 4: Buscando subscription_plans')
    const { data: plans, error: plansError } = await supabase.from('subscription_plans').select('*')

    if (plansError) {
      console.error('Erro ao buscar planos:', plansError)
      throw plansError
    }
    console.log(`Etapa 4.1: ${plans?.length || 0} planos encontrados.`)

    // 5. Retornar um JSON com os campos solicitados
    console.log('Etapa 5: Cruzando dados para formatar o JSON de resposta')
    const mergedData = users.map((user) => {
      const sub = subs?.find((s) => s.user_id === user.id)

      // 6. Se não tiver assinatura, retornar null para os campos
      if (!sub) {
        return {
          id: user.id,
          email: user.email,
          plan_name: null,
          status: null,
          sermons_generated: null,
          generation_limit: null,
        }
      }

      const planData = plans?.find((p) => p.id === sub.plan_id)
      const planName = planData?.name
      let genLimit = planData?.generation_limit

      // Fallback em caso de erro na query interna
      if (genLimit === undefined && sub.plan_id) {
        if (sub.plan_id === 'pro') genLimit = 15
        else if (sub.plan_id === 'free') genLimit = 3
        else if (sub.plan_id === 'enterprise') genLimit = null
      }

      return {
        id: user.id,
        email: user.email,
        plan_name: planName || sub.plan_id || null,
        status: sub.status || null,
        sermons_generated: sub.sermons_generated ?? 0,
        generation_limit: genLimit ?? null,
      }
    })

    console.log('Etapa 6: Dados cruzados com sucesso.')

    // 8. Retornar um status 200 com o array de usuários
    console.log('Etapa 7: Retornando resposta (Status 200)')
    return new Response(JSON.stringify(mergedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    // 7. Adicione console.log() para debugar
    console.error('Erro na Edge Function get-admin-users:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
