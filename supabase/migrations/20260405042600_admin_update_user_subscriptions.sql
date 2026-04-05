DO $$
BEGIN
  -- Permite que o ID do administrador atualize a tabela user_subscriptions diretamente
  DROP POLICY IF EXISTS "admin_update_user_subscriptions" ON public.user_subscriptions;
  CREATE POLICY "admin_update_user_subscriptions" ON public.user_subscriptions
    FOR UPDATE TO authenticated
    USING (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
    WITH CHECK (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid);
END $$;
