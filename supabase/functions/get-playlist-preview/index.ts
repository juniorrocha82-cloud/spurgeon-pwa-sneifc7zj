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
    let playlist_id = ''

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      playlist_id = body.playlist_id || body.playlistId
    } else if (req.method === 'GET') {
      const url = new URL(req.url)
      playlist_id = url.searchParams.get('playlist_id') || url.searchParams.get('playlistId') || ''
    }

    if (!playlist_id) {
      return new Response(JSON.stringify({ error: 'O parâmetro playlist_id é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configurações do Supabase ausentes no ambiente.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('youtube_playlists')
      .select('channel_name, playlist_name, description, thumbnail_url')
      .eq('playlist_id', playlist_id)
      .maybeSingle()

    if (error) {
      throw new Error(`Erro ao consultar banco de dados: ${error.message}`)
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'Playlist não encontrada.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro na Edge Function get-playlist-preview:', error.message)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno no processamento da playlist.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
