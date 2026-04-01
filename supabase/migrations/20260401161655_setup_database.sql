DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed initial user for testing (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'junior.rocha82@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'junior.rocha82@gmail.com',
      crypt('Spurgeon123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    base_text TEXT NOT NULL,
    version TEXT NOT NULL,
    duration INTEGER NOT NULL,
    content JSONB NOT NULL,
    insights JSONB NOT NULL,
    references_list JSONB NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own sermons" ON public.sermons;
CREATE POLICY "Users can insert their own sermons" ON public.sermons 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own sermons" ON public.sermons;
CREATE POLICY "Users can view their own sermons" ON public.sermons 
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sermons" ON public.sermons;
CREATE POLICY "Users can update their own sermons" ON public.sermons 
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sermons" ON public.sermons;
CREATE POLICY "Users can delete their own sermons" ON public.sermons 
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
