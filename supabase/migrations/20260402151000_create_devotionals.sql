CREATE TABLE IF NOT EXISTS public.devotionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    base_text TEXT NOT NULL,
    content JSONB NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own devotionals" ON public.devotionals;
CREATE POLICY "Users can view their own devotionals" ON public.devotionals
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own devotionals" ON public.devotionals;
CREATE POLICY "Users can insert their own devotionals" ON public.devotionals
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own devotionals" ON public.devotionals;
CREATE POLICY "Users can update their own devotionals" ON public.devotionals
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own devotionals" ON public.devotionals;
CREATE POLICY "Users can delete their own devotionals" ON public.devotionals
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
