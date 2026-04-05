-- Admin Insert Policy for user_subscriptions
DROP POLICY IF EXISTS "admin_insert_user_subscriptions" ON public.user_subscriptions;
CREATE POLICY "admin_insert_user_subscriptions" ON public.user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid);

-- Ensure base subscription plans have correct limits
UPDATE public.subscription_plans SET generation_limit = 3 WHERE id = 'free' OR name ILIKE '%Gratuito%';
UPDATE public.subscription_plans SET generation_limit = 15 WHERE id = 'pro' OR name ILIKE '%Pro%';

-- Create missing standard plans if they don't exist
INSERT INTO public.subscription_plans (id, name, generation_limit, features)
VALUES 
  ('free', 'Gratuito', 3, '["3 gerações em 7 dias", "Acesso básico aos recursos"]'::jsonb),
  ('pro', 'Pro Plan', 15, '["15 gerações por mês", "Geração de Slides (PPTX)", "Geração de Devocionais"]'::jsonb),
  ('enterprise', 'Enterprise Plan', null, '["Gerações Ilimitadas", "Todos os recursos do Pro", "Suporte prioritário"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
