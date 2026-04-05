import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase ausentes.')
    }

    // Usando a SERVICE_ROLE_KEY para ignorar RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Buscar todos os usuários
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError
    const users = authData.users || []

    // 2. Buscar assinaturas e planos correspondentes
    const { data: subs, error: subsError } = await supabase.from('user_subscriptions').select(`
        user_id,
        status,
        sermons_generated,
        plan:subscription_plans(name, generation_limit)
      `)
    if (subsError) throw subsError

    // 3. Cruzar os dados
    const mergedData = users.map((user) => {
      const sub = subs?.find((s) => s.user_id === user.id)
      const planData = sub?.plan

      const planName = Array.isArray(planData) ? planData[0]?.name : planData?.name
      let genLimit = Array.isArray(planData)
        ? planData[0]?.generation_limit
        : planData?.generation_limit

      const planId = sub?.plan_id
      if (genLimit === undefined) {
        if (planId === 'pro') genLimit = 15
        else if (planId === 'free') genLimit = 3
        else if (planId === 'enterprise') genLimit = null
      }

      return {
        id: user.id,
        email: user.email,
        plan_name: planName || 'Nenhum',
        status: sub?.status || 'inactive',
        sermons_generated: sub?.sermons_generated || 0,
        generation_limit: genLimit ?? null,
      }
    })

    return new Response(JSON.stringify(mergedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro na Edge Function get-admin-users:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
