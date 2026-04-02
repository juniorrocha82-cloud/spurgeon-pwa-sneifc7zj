import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "API Key do YouTube não encontrada. Por favor, configure a secret 'YOUTUBE_API_KEY' no painel do Supabase Edge Functions.",
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { playlistId } = await req.json()

    if (!playlistId) {
      throw new Error('O ID da playlist é obrigatório.')
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao buscar dados do YouTube.')
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Playlist não encontrada ou não é pública.')
    }

    const snippet = data.items[0].snippet
    const thumbnails = snippet.thumbnails

    // Obter a melhor qualidade de thumbnail disponível
    const thumbnail =
      thumbnails?.maxres?.url ||
      thumbnails?.standard?.url ||
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      thumbnails?.default?.url ||
      ''

    const result = {
      title: snippet.title,
      description: snippet.description,
      thumbnail,
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
