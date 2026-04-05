-- Ensure the 'free' plan exists
INSERT INTO public.subscription_plans (id, name, generation_limit, features)
VALUES (
  'free',
  'Gratuito',
  3,
  '["Geração de até 3 sermões", "Acesso a recursos básicos"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert default free subscription
  INSERT INTO public.user_subscriptions (user_id, plan_id, status, expires_at, sermons_generated)
  VALUES (
    NEW.id,
    'free',
    'active',
    NOW() + INTERVAL '10 years',
    0
  );

  -- Insert default user settings
  INSERT INTO public.user_settings (user_id, primary_color, font_family)
  VALUES (NEW.id, '#d97706', 'Arial')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users who don't have a subscription
DO $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_id, status, expires_at, sermons_generated)
  SELECT id, 'free', 'active', NOW() + INTERVAL '10 years', 0
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions);
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Backfill existing users who don't have settings
DO $$
BEGIN
  INSERT INTO public.user_settings (user_id, primary_color, font_family)
  SELECT id, '#d97706', 'Arial'
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM public.user_settings)
  ON CONFLICT (user_id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
