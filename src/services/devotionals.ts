import { supabase } from '@/lib/supabase/client'

export interface Devotional {
  id: string
  title: string
  base_text: string
  content: {
    reading: string
    reflection: string
    prayer: string
  }
  date: string
  created_at: string
}

export const checkDevotionalLimit = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0]

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  const planId = sub?.plan_id || 'free'

  if (planId === 'pro' || planId === 'enterprise') {
    return true
  }

  const { data: limits } = await supabase
    .from('devotional_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (limits && limits.count >= 2) {
    throw new Error('LIMIT_REACHED')
  }

  return true
}

export const incrementDevotionalLimit = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0]

  const { data: limits } = await supabase
    .from('devotional_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (limits) {
    await supabase
      .from('devotional_limits')
      .update({ count: limits.count + 1 })
      .eq('id', limits.id)
  } else {
    await supabase.from('devotional_limits').insert({ user_id: userId, date: today, count: 1 })
  }
}

export const aiGenerateDevotional = async () => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('Usuário não autenticado')

  await checkDevotionalLimit(userData.user.id)

  const { data, error } = await supabase.functions.invoke('generate-devotional', {
    body: {},
  })

  if (error) {
    let errorMessage = error.message || 'Erro ao gerar devocional'
    if (error.context && typeof error.context.json === 'function') {
      try {
        const errBody = await error.context.json()
        if (errBody.error) {
          errorMessage = errBody.error
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    throw new Error(errorMessage)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  const { data: insertedData, error: insertError } = await supabase
    .from('devotionals')
    .insert({
      user_id: userData.user.id,
      title: data.title || 'Devocional Diário',
      base_text: data.baseText || '',
      content: {
        reading: data.reading || '',
        reflection: data.reflection || '',
        prayer: data.prayer || '',
      },
      date: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    throw new Error('Erro ao salvar o devocional gerado no banco de dados.')
  }

  await incrementDevotionalLimit(userData.user.id)

  return { devotionals: [insertedData] }
}

export const getRecentDevotionals = async (limit = 3) => {
  const { data, error } = await supabase
    .from('devotionals' as any)
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data as Devotional[]
}

export const getDevotionalById = async (id: string) => {
  const { data, error } = await supabase
    .from('devotionals' as any)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Devotional
}

export const deleteDevotional = async (id: string) => {
  const { error } = await supabase
    .from('devotionals' as any)
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
