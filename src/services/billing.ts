import { supabase } from '@/lib/supabase/client'

export const checkGenerationLimit = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  // 1. Verifique se o usuário tem uma assinatura ativa
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  const planId = sub?.plan_id || 'free'

  if (planId === 'enterprise') return true

  // 2. Conte quantas gerações ele fez
  let startDate = new Date()
  let limit = 3

  if (planId === 'pro') {
    startDate.setDate(startDate.getDate() - 30) // Limite mensal
    limit = 15
  } else {
    startDate.setDate(startDate.getDate() - 7) // Limite semanal
    limit = 3
  }

  const { count, error } = await supabase
    .from('generation_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Erro ao checar limites:', error)
    return false
  }

  return (count || 0) < limit
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
