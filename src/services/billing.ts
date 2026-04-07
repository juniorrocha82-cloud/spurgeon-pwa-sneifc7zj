import { supabase } from '@/lib/supabase/client'

export const getTrueUsageCount = async (userId: string): Promise<number> => {
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan_id, usage_reset_at')
    .eq('user_id', userId)
    .maybeSingle()

  const planId = sub?.plan_id || 'free'

  if (planId === 'enterprise') return 0

  let startDate = new Date()
  if (planId === 'pro') {
    startDate.setDate(startDate.getDate() - 30) // Limite mensal
  } else {
    startDate.setDate(startDate.getDate() - 7) // Limite semanal
  }

  // Se o uso foi zerado pelo admin, consideramos a data do reset como início
  if (sub?.usage_reset_at && new Date(sub.usage_reset_at) > startDate) {
    startDate = new Date(sub.usage_reset_at)
  }

  const { count, error } = await supabase
    .from('generation_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Erro ao calcular uso:', error)
    return 0
  }

  return count || 0
}

export const checkGenerationLimit = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status, expires_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  const planId = sub?.plan_id || 'free'
  if (planId === 'enterprise') return true

  const limit = planId === 'pro' ? 15 : 3
  const currentCount = await getTrueUsageCount(user.id)

  return currentCount < limit
}

export const logGeneration = async (resourceType: string = 'sermon') => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('generation_logs').insert({
    user_id: user.id,
    resource_type: resourceType,
  })
}
