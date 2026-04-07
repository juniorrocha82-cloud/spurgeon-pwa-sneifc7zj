DO $$
BEGIN
  -- 1. Adicionar política de SELECT para o administrador para permitir atualizar informações reais
  DROP POLICY IF EXISTS "admin_select_user_subscriptions" ON public.user_subscriptions;
  CREATE POLICY "admin_select_user_subscriptions" ON public.user_subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid);

  -- 2. Remover assinaturas duplicadas causadas pela ausência da política de leitura, mantendo a mais recente
  DELETE FROM public.user_subscriptions
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
      FROM public.user_subscriptions
    ) t WHERE t.rn = 1
  );

  -- 3. Adicionar constraint UNIQUE para o user_id para evitar a criação de novos duplicados
  ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;
  ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
END $$;
