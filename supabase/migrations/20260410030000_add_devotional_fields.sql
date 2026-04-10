DO $$
BEGIN
  -- Validate and add new columns to devotionals table
  ALTER TABLE public.devotionals ADD COLUMN IF NOT EXISTS devotional_text TEXT;
  ALTER TABLE public.devotionals ADD COLUMN IF NOT EXISTS devotional_date DATE;
END $$;

-- Create devotional_limits table
CREATE TABLE IF NOT EXISTS public.devotional_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.devotional_limits ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies for devotional_limits
DROP POLICY IF EXISTS "Users can view their own devotional limits" ON public.devotional_limits;
CREATE POLICY "Users can view their own devotional limits" ON public.devotional_limits
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own devotional limits" ON public.devotional_limits;
CREATE POLICY "Users can insert their own devotional limits" ON public.devotional_limits
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own devotional limits" ON public.devotional_limits;
CREATE POLICY "Users can update their own devotional limits" ON public.devotional_limits
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own devotional limits" ON public.devotional_limits;
CREATE POLICY "Users can delete their own devotional limits" ON public.devotional_limits
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
