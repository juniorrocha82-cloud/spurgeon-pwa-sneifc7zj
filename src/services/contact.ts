import { supabase } from '@/lib/supabase/client'

export interface ContactMessagePayload {
  name: string
  email: string
  subject: string
  message: string
}

export const submitContactMessage = async (payload: ContactMessagePayload, userId: string) => {
  const { data, error } = await supabase.from('contact_messages' as any).insert([
    {
      user_id: userId,
      ...payload,
    },
  ])

  return { data, error }
}
