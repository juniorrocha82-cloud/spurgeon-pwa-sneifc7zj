DO $
BEGIN
  -- Criação da tabela para armazenar as mensagens de contato
  CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Habilitar RLS
  ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

  -- Criar política para permitir que usuários autenticados insiram mensagens
  DROP POLICY IF EXISTS "Users can insert their own messages" ON public.contact_messages;
  CREATE POLICY "Users can insert their own messages" ON public.contact_messages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
END $;
