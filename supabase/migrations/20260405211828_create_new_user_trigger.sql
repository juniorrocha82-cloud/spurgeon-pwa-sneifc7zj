-- Create or replace the handle_new_user function to guarantee users get a free plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert default free subscription if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, expires_at, sermons_generated)
    VALUES (
      NEW.id,
      'free',
      'active',
      NOW() + INTERVAL '10 years',
      0
    );
  END IF;

  -- Insert default user settings
  INSERT INTO public.user_settings (user_id, primary_color, font_family)
  VALUES (NEW.id, '#d97706', 'Arial')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, to ensure idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
