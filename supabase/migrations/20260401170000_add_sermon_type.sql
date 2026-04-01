ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS sermon_type TEXT NOT NULL DEFAULT 'Expositivo';
