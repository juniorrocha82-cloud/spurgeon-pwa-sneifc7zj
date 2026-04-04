import { supabase } from '@/lib/supabase/client'
import { Sermon } from '@/store/SermonContext'

export const aiGenerateSermon = async (
  baseText: string,
  version: string,
  duration: number,
  sermonType: string,
  customOutline?: string,
) => {
  const { data, error } = await supabase.functions.invoke('generate-sermon', {
    body: { baseText, version, duration, sermonType, customOutline },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)

  return data
}

export const saveSermonToDb = async (
  sermonData: Omit<Sermon, 'id' | 'date'> & {
    custom_outline?: string
    use_custom_outline?: boolean
  },
): Promise<Sermon> => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  // Check existing sermons to enforce the limit of 7
  const { data: existingSermons } = await supabase
    .from('sermons')
    .select('id')
    .eq('user_id', userData.user.id)
    .order('date', { ascending: true })

  if (existingSermons && existingSermons.length >= 7) {
    // We want to keep only the 6 newest to make room for the new one
    const toDeleteCount = existingSermons.length - 6
    const idsToDelete = existingSermons.slice(0, toDeleteCount).map((s) => s.id)

    await supabase.from('sermons').delete().in('id', idsToDelete)
  }

  const { data, error } = await supabase
    .from('sermons')
    .insert({
      user_id: userData.user.id,
      title: sermonData.title,
      base_text: sermonData.baseText,
      version: sermonData.version,
      duration: sermonData.duration,
      sermon_type: sermonData.sermonType,
      content: sermonData.content,
      insights: sermonData.insights,
      references_list: sermonData.references,
      date: new Date().toISOString(),
      custom_outline: sermonData.custom_outline || null,
      use_custom_outline: sermonData.use_custom_outline || false,
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
    sermonType: data.sermon_type,
    content: data.content,
    insights: data.insights,
    references: data.references_list,
    date: data.date,
    custom_outline: data.custom_outline,
    use_custom_outline: data.use_custom_outline,
  } as Sermon
}

export const fetchUserSermons = async (): Promise<Sermon[]> => {
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .order('date', { ascending: false })
    .limit(7)

  if (error) throw error

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    baseText: d.base_text,
    version: d.version,
    duration: d.duration,
    sermonType: d.sermon_type || 'Expositivo',
    content: d.content,
    insights: d.insights,
    references: d.references_list,
    date: d.date,
    custom_outline: d.custom_outline,
    use_custom_outline: d.use_custom_outline,
  }))
}

export const deleteSermonFromDb = async (id: string) => {
  const { error } = await supabase.from('sermons').delete().eq('id', id)
  if (error) throw error
}
