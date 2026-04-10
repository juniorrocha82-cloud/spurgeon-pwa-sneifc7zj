import { supabase } from '@/lib/supabase/client'

export interface ContactMessagePayload {
  name: string
  email: string
  subject: string
  message: string
}

export const submitContactMessage = async (
  payload: ContactMessagePayload,
  userId: string | null,
) => {
  const { data, error } = await supabase.from('contact_messages').insert([
    {
      user_id: userId,
      ...payload,
    },
  ])

  if (!error) {
    supabase.functions
      .invoke('send-contact-email', {
        body: payload,
      })
      .catch((err) => console.error('Erro ao disparar email de contato:', err))
  }

  return { data, error }
}
