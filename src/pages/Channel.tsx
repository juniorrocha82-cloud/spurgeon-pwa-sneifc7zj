import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Youtube } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface PlaylistInfo {
  title: string
  description: string
  thumbnail: string
  playlistId: string
  embedUrl: string
  embedCode: string
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
        const { data, error: invokeError } = await supabase.functions.invoke(
          'get-playlist-preview',
          {
            body: { playlistId },
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

      <div className="flex flex-col gap-6">
        <div className="px-1">
          <h2 className="text-2xl font-serif font-bold mt-4">Vídeo em Destaque</h2>
          <p className="text-muted-foreground mt-2">
            Assista à nossa página no YouTube. Acompanhe as atualizações diárias de músicas e
            compartilhe com seus irmãos!
          </p>
        </div>
        <Card className="overflow-hidden border-border/50 shadow-elevation">
          <CardContent className="p-0">
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/FLZ4T8ZP9Ck?si=3EdKUUnMRBnF60sU"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </CardContent>
        </Card>

        <div className="px-1 mt-4">
          <h2 className="text-2xl font-serif font-bold">Minha Playlist de Adoração</h2>
        </div>

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
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-md hidden sm:block flex-shrink-0" />
              <div className="space-y-3 flex-1 w-full">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="w-full aspect-video rounded-none" />
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-border/50 shadow-elevation">
            {playlistInfo && !error && (
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                {playlistInfo.thumbnail && (
                  <img
                    src={playlistInfo.thumbnail}
                    alt={playlistInfo.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md shadow-sm hidden sm:block flex-shrink-0"
                  />
                )}
                <div className="space-y-2 flex-1 min-w-0">
                  <CardTitle className="text-xl md:text-2xl truncate">
                    {playlistInfo.title}
                  </CardTitle>
                  {playlistInfo.description && (
                    <CardDescription className="line-clamp-3 text-sm md:text-base">
                      {playlistInfo.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
            )}
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {playlistInfo?.embedUrl ? (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={playlistInfo.embedUrl}
                    title="YouTube playlist player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Youtube className="w-8 h-8 opacity-50" />
                    <p>Vídeo indisponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
