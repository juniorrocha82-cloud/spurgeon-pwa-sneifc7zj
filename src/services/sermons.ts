import { supabase } from '@/lib/supabase/client'
import { Sermon } from '@/store/SermonContext'

export const aiGenerateSermon = async (baseText: string, version: string, duration: number) => {
  const { data, error } = await supabase.functions.invoke('generate-sermon', {
    body: { baseText, version, duration },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)

  return data
}

export const saveSermonToDb = async (sermonData: Omit<Sermon, 'id' | 'date'>): Promise<Sermon> => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('sermons')
    .insert({
      user_id: userData.user.id,
      title: sermonData.title,
      base_text: sermonData.baseText,
      version: sermonData.version,
      duration: sermonData.duration,
      content: sermonData.content,
      insights: sermonData.insights,
      references_list: sermonData.references,
      date: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    title: data.title,
    baseText: data.base_text,
    version: data.version,
    duration: data.duration,
    content: data.content,
    insights: data.insights,
    references: data.references_list,
    date: data.date,
  }
}

export const fetchUserSermons = async (): Promise<Sermon[]> => {
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    baseText: d.base_text,
    version: d.version,
    duration: d.duration,
    content: d.content,
    insights: d.insights,
    references: d.references_list,
    date: d.date,
  }))
}

export const deleteSermonFromDb = async (id: string) => {
  const { error } = await supabase.from('sermons').delete().eq('id', id)
  if (error) throw error
}
