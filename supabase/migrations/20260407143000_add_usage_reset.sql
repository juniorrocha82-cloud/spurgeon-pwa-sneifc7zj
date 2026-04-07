ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS usage_reset_at TIMESTAMPTZ;

DROP TRIGGER IF EXISTS on_reset_usage_before ON public.user_subscriptions;

CREATE OR REPLACE FUNCTION public.handle_reset_usage()
RETURNS trigger AS $$
BEGIN
  -- Se o admin atualizou explicitamente o sermons_generated para 0 via Painel Admin, 
  -- marcamos o momento do reset. Essa data sera usada para ignorar logs anteriores a este momento.
  IF NEW.sermons_generated = 0 THEN
    NEW.usage_reset_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- O trigger dispara APENAS quando a coluna sermons_generated for parte do comando UPDATE
CREATE TRIGGER on_reset_usage_before
  BEFORE UPDATE OF sermons_generated ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reset_usage();
