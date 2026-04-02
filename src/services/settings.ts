import { supabase } from '@/lib/supabase/client'

export interface UserSettings {
  primaryColor: string
  fontFamily: string
  logoBase64?: string
}

export const fetchSettings = async (): Promise<UserSettings> => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userData.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error // Lança erro se não for apenas 'not found'
  }

  return {
    primaryColor: data?.primary_color || '#d97706',
    fontFamily: data?.font_family || 'Arial',
    logoBase64: data?.logo_base64 || undefined,
  }
}

export const saveSettings = async (settings: UserSettings) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userData.user.id,
      primary_color: settings.primaryColor,
      font_family: settings.fontFamily,
      logo_base64: settings.logoBase64,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) throw error
}
