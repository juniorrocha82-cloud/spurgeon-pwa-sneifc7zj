CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_id TEXT,
    generation_limit INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to all users" ON public.subscription_plans;
CREATE POLICY "Allow read access to all users" ON public.subscription_plans
    FOR SELECT USING (true);

INSERT INTO public.subscription_plans (id, name, price_id, generation_limit) 
VALUES 
    ('free', 'Gratuito', NULL, 3),
    ('pro', 'Pro', 'price_1TIZIFCYB9cVw8vZVZMLoQ6u', 15),
    ('enterprise', 'Enterprise', 'price_1TIZIFCYB9cVw8vZpoeG8zmp', NULL)
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    price_id = EXCLUDED.price_id,
    generation_limit = EXCLUDED.generation_limit,
    updated_at = NOW();
