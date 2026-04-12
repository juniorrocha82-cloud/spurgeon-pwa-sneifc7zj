CREATE TABLE IF NOT EXISTS public.api_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL UNIQUE,
    api_key TEXT,
    endpoint TEXT,
    rate_limit INTEGER,
    priority INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.api_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.api_providers;
CREATE POLICY "Allow read access for authenticated users" ON public.api_providers
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admin all access" ON public.api_providers;
CREATE POLICY "Allow admin all access" ON public.api_providers
    FOR ALL TO authenticated 
    USING (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid) 
    WITH CHECK (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid);

CREATE OR REPLACE FUNCTION public.handle_api_providers_updated_at()
RETURNS trigger AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_api_providers_updated_at ON public.api_providers;
CREATE TRIGGER set_api_providers_updated_at
  BEFORE UPDATE ON public.api_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_api_providers_updated_at();

INSERT INTO public.api_providers (provider_name, priority, is_active) VALUES
    ('Gemini', 1, true),
    ('Groq', 2, true),
    ('Cohere', 3, true),
    ('Together', 4, true)
ON CONFLICT (provider_name) DO UPDATE 
SET priority = EXCLUDED.priority, is_active = EXCLUDED.is_active;
