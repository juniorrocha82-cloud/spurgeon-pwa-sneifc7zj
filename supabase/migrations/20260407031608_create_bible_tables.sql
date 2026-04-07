CREATE TABLE IF NOT EXISTS public.bible_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bible_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES public.bible_versions(id) ON DELETE CASCADE,
  book_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  testament TEXT NOT NULL,
  chapters_count INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bible_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.bible_books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  verses_count INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.bible_chapters(id) ON DELETE CASCADE,
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- RLS Configuration
ALTER TABLE public.bible_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de versões" ON public.bible_versions;
CREATE POLICY "Permitir leitura de versões" ON public.bible_versions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir leitura de livros" ON public.bible_books;
CREATE POLICY "Permitir leitura de livros" ON public.bible_books FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir leitura de capítulos" ON public.bible_chapters;
CREATE POLICY "Permitir leitura de capítulos" ON public.bible_chapters FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir leitura de versículos" ON public.bible_verses;
CREATE POLICY "Permitir leitura de versículos" ON public.bible_verses FOR SELECT TO public USING (true);
