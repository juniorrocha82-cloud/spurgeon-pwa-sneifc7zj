import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Youtube } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface PlaylistInfo {
  channel_name: string
  playlist_name: string
  description: string | null
  thumbnail_url: string | null
}

export default function ChannelPage() {
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const playlistId = 'PLS7Kqj3rKpLyS3kTsPtaQVj3MQWNhenWq'

  useEffect(() => {
    const fetchPlaylistPreview = async () => {
      try {
        setLoading(true)
        // Default behavior of supabase.functions.invoke with body is a POST request
        const { data, error: invokeError } = await supabase.functions.invoke(
          'get-playlist-preview',
          {
            body: { playlist_id: playlistId },
          },
        )

        if (invokeError) throw new Error(invokeError.message)
        if (data?.error) throw new Error(data.error)

        setPlaylistInfo(data)
      } catch (err: any) {
        console.error('Error fetching playlist preview:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylistPreview()
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-8">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <Youtube className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Canal Oficial</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe as últimas mensagens e pregações em vídeo diretamente do nosso canal.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Main Card with Metadata */}
        {error ? (
          <Card className="overflow-hidden border-destructive/50 shadow-elevation bg-destructive/10">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-destructive font-medium">
                  Não foi possível carregar a playlist.
                </p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card className="overflow-hidden border-border/50 shadow-elevation">
            <CardHeader className="flex flex-col sm:flex-row items-start gap-6">
              <Skeleton className="w-full sm:w-48 aspect-video rounded-md flex-shrink-0" />
              <div className="space-y-3 flex-1 w-full">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardHeader>
          </Card>
        ) : (
          <Card className="overflow-hidden border-border/50 shadow-elevation">
            {playlistInfo && (
              <CardHeader className="flex flex-col sm:flex-row items-start gap-6">
                {playlistInfo.thumbnail_url && (
                  <img
                    src={playlistInfo.thumbnail_url}
                    alt={playlistInfo.playlist_name}
                    className="w-full sm:w-48 aspect-video object-cover rounded-md shadow-sm flex-shrink-0"
                  />
                )}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Youtube className="w-5 h-5 text-red-600" />
                    <span className="font-medium">{playlistInfo.channel_name}</span>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-serif">
                    {playlistInfo.playlist_name}
                  </CardTitle>
                  {playlistInfo.description && (
                    <CardDescription className="text-base text-foreground/80 mt-2 whitespace-pre-wrap">
                      {playlistInfo.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
            )}
          </Card>
        )}

        {/* Featured Video */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold px-1">Vídeo em Destaque</h2>
          <Card className="overflow-hidden border-border/50 shadow-elevation">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/JgiRvrw1CVg"
                  title="Vídeo em Destaque"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Playlist */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold px-1">Playlist Completa</h2>
          <Card className="overflow-hidden border-border/50 shadow-elevation">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
                  title="YouTube playlist player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
