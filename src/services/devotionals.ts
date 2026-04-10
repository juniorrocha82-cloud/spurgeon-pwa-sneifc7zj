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

export const aiGenerateDevotional = async () => {
  const { data, error } = await supabase.functions.invoke('generate-devotional', {
    body: {},
  })

  if (error) {
    if (error.context) {
      try {
        const errBody = await error.context.json()
        if (errBody.error) throw new Error(errBody.error)
      } catch (e) {}
    }
    throw new Error(error.message || 'Erro ao gerar devocional')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
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
