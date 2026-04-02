import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Youtube, PlayCircle, ListVideo } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const mockPlaylist = [
  {
    id: '1',
    title: 'Sinta a Presença de Deus em Rio de Amor',
    date: 'Momento com Deus Sounds',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=river%20sunlight&color=green',
  },
  {
    id: '2',
    title: 'Paz Interior e Meditação Profunda',
    date: 'Momento com Deus Sounds',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=nature%20peace',
  },
  {
    id: '3',
    title: 'Oração da Manhã - Comece Bem o Dia',
    date: 'Momento com Deus Sounds',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=morning%20sun',
  },
  {
    id: '4',
    title: 'Sons da Natureza para Dormir e Relaxar',
    date: 'Momento com Deus Sounds',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=night%20forest',
  },
  {
    id: '5',
    title: 'Louvor e Adoração Instrumental',
    date: 'Momento com Deus Sounds',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=worship%20instrumental',
  },
  {
    id: '6',
    title: 'Tempo de Busca - Fundo Musical',
    date: 'Momento com Deus Sounds',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=praying%20hands',
  },
]

export default function ChannelPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Section */}
        <div className="lg:col-span-2 flex flex-col gap-4">
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
                  src="https://www.youtube.com/embed/videoseries?list=PLS7Kqj3rKpLyS3kTsPtaQVj3MQWNhenWq"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Playlist Section */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <Card className="h-full border-border/50 shadow-elevation flex flex-col mt-4 lg:mt-0">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-primary" />
                Rio de Amor
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Playlist • Momento com Deus Sounds
              </p>
            </div>
            <CardContent className="p-0 flex-1 relative min-h-[300px]">
              <ScrollArea className="absolute inset-0 w-full h-full">
                <div className="p-4 flex flex-col gap-4">
                  {mockPlaylist.map((video) => (
                    <div
                      key={video.id}
                      className="flex gap-3 group cursor-pointer rounded-md hover:bg-secondary/50 p-2 transition-colors"
                    >
                      <div className="relative w-32 aspect-video bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                          <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-start overflow-hidden py-1">
                        <h4 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-1">{video.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
