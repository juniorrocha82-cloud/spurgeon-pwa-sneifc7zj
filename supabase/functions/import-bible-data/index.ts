import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configurações do Supabase ausentes no ambiente.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Sem autorização');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    // Validate Admin user
    if (authError || !user || user.id !== '911d1666-978b-4ead-9be2-5a49028c767f') {
       throw new Error('Acesso não autorizado');
    }

    const { version } = await req.json();

    const BIBLE_VERSIONS = {
      'pt_acf': { 
        name: 'Almeida Corrigida Fiel', 
        abbrev: 'ACF', 
        lang: 'pt-BR',
        url: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_acf.json'
      },
      'pt_nvi': { 
        name: 'Nova Versão Internacional', 
        abbrev: 'NVI', 
        lang: 'pt-BR',
        url: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pt_nvi.json'
      },
      'en_kjv': { 
        name: 'King James Version', 
        abbrev: 'KJV', 
        lang: 'en-US',
        url: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
      }
    };

    const verInfo = BIBLE_VERSIONS[version as keyof typeof BIBLE_VERSIONS];
    if (!verInfo) {
      throw new Error('Versão inválida. Escolha pt_acf, pt_nvi ou en_kjv.');
    }

    const res = await fetch(verInfo.url);
    if (!res.ok) {
      throw new Error(`Falha ao baixar JSON da versão ${version} (${res.status} ${res.statusText})`);
    }
    const books = await res.json();

    let { data: versionData } = await supabase
      .from('bible_versions')
      .select('id')
      .eq('abbreviation', verInfo.abbrev)
      .maybeSingle();

    if (!versionData) {
      const { data: newVer, error: verErr } = await supabase
        .from('bible_versions')
        .insert({
          name: verInfo.name,
          abbreviation: verInfo.abbrev,
          language: verInfo.lang
        })
        .select('id')
        .single();
      if (verErr) throw verErr;
      versionData = newVer;
    } else {
      await supabase.from('bible_books').delete().eq('version_id', versionData.id);
    }

    const versionId = versionData.id;

    let booksCount = 0;
    let chaptersCount = 0;
    let versesCount = 0;

    for (let bIndex = 0; bIndex < books.length; bIndex++) {
      const book = books[bIndex];
      const testament = bIndex < 39 ? 'VT' : 'NT';
      
      const { data: bookData, error: bookErr } = await supabase
        .from('bible_books')
        .insert({
          version_id: versionId,
          book_number: bIndex + 1,
          name: book.name,
          abbreviation: book.abbrev,
          testament: testament,
          chapters_count: book.chapters.length
        })
        .select('id')
        .single();

      if (bookErr) throw bookErr;
      booksCount++;

      const bookId = bookData.id;
      const versesToInsert = [];
      const chaptersToInsert = [];

      for (let cIndex = 0; cIndex < book.chapters.length; cIndex++) {
        const chapterId = crypto.randomUUID();
        const chapterVerses = book.chapters[cIndex];
        
        chaptersToInsert.push({
          id: chapterId,
          book_id: bookId,
          chapter_number: cIndex + 1,
          verses_count: chapterVerses.length
        });
        chaptersCount++;

        for (let vIndex = 0; vIndex < chapterVerses.length; vIndex++) {
          versesToInsert.push({
            chapter_id: chapterId,
            verse_number: vIndex + 1,
            text: chapterVerses[vIndex]
          });
          versesCount++;
        }
      }

      const { error: chErr } = await supabase.from('bible_chapters').insert(chaptersToInsert);
      if (chErr) throw chErr;

      for (let i = 0; i < versesToInsert.length; i += 1000) {
         const batch = versesToInsert.slice(i, i + 1000);
         const { error: vErr } = await supabase.from('bible_verses').insert(batch);
         if (vErr) throw vErr;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      version: verInfo.name, 
      books: booksCount, 
      chapters: chaptersCount, 
      verses: versesCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Erro na importação:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
