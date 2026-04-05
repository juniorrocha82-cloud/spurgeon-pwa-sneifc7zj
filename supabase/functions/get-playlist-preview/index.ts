import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { playlistId } = await req.json()

    if (!playlistId) {
      throw new Error('O ID da playlist é obrigatório para buscar os dados.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurações do Supabase ausentes no ambiente.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('youtube_playlists')
      .select('*')
      .eq('playlist_id', playlistId)
      .maybeSingle()

    if (error) {
      throw new Error(`Erro ao consultar banco de dados: ${error.message}`)
    }

    if (!data) {
      throw new Error('Playlist não encontrada na base de dados.')
    }

    const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&enablejsapi=1`
    const embedCode = `<iframe width="560" height="315" src="${embedUrl}" title="YouTube playlist player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`

    const result = {
      title: data.playlist_name,
      description: data.description || '',
      thumbnail: data.thumbnail_url || '',
      playlistId: data.playlist_id,
      embedUrl,
      embedCode,
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro na Edge Function get-playlist-preview:', error.message)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido ao processar a playlist.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
