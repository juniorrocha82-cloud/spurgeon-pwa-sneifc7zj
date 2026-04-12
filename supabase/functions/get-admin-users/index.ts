import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase ausentes.')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Sem autorização' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user || user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
      return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    })
    if (authError) throw authError
    const users = authData.users || []

    const { data: subs, error: subsError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
    if (subsError) throw subsError

    const { data: plans, error: plansError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
    if (plansError) throw plansError

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('generation_logs')
      .select('user_id, created_at, resource_type')
      .gte('created_at', thirtyDaysAgo.toISOString())
    if (logsError) throw logsError

    const ADMIN_ID = '911d1666-978b-4ead-9be2-5a49028c767f'

    const mergedData = users.map((user) => {
      const sub = subs?.find((s) => s.user_id === user.id)

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

      if (genLimit === undefined && sub.plan_id) {
        if (sub.plan_id === 'pro') genLimit = 15
        else if (sub.plan_id === 'free') genLimit = 3
        else if (sub.plan_id === 'enterprise') genLimit = null
      }

      if (user.id === ADMIN_ID) genLimit = null

      let startDate = new Date()
      if (sub.plan_id === 'pro') {
        startDate.setDate(startDate.getDate() - 30)
      } else {
        startDate.setDate(startDate.getDate() - 7)
      }

      if (sub.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
        startDate = new Date(sub.usage_reset_at)
      }

      let realCount = 0
      if (sub.plan_id !== 'enterprise' && user.id !== ADMIN_ID) {
        const userLogs = logs?.filter(
          (log) =>
            log.user_id === user.id &&
            log.resource_type === 'sermon' &&
            new Date(log.created_at) >= startDate,
        )
        realCount = userLogs?.length || 0
      }

      return {
        id: user.id,
        email: user.email,
        plan_name: planName || sub.plan_id || null,
        status: sub.status || null,
        sermons_generated: realCount,
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
      status: 500,
    })
  }
})
