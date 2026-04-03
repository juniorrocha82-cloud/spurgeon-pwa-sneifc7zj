CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own generation logs" ON public.generation_logs;
CREATE POLICY "Users can view their own generation logs" ON public.generation_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own generation logs" ON public.generation_logs;
CREATE POLICY "Users can insert their own generation logs" ON public.generation_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
