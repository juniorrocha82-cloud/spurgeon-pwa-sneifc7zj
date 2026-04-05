DO $$
BEGIN
  UPDATE public.subscription_plans SET generation_limit = 15 WHERE id = 'pro';
  UPDATE public.subscription_plans SET generation_limit = NULL WHERE id = 'enterprise';
END $$;
