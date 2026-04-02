import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Youtube, PlayCircle, ListVideo } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const mockPlaylist = [
  {
    id: '1',
    title: 'A Graça Inexplicável - Série Sermões',
    date: 'Há 2 dias',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=church&color=black',
  },
  {
    id: '2',
    title: 'O Poder da Oração Fervorosa',
    date: 'Há 1 semana',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=pray&color=black',
  },
  {
    id: '3',
    title: 'Caminhando pela Fé na Tempestade',
    date: 'Há 2 semanas',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=bible&color=black',
  },
  {
    id: '4',
    title: 'Esperança Inabalável em Tempos Difíceis',
    date: 'Há 1 mês',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=light&color=black',
  },
  {
    id: '5',
    title: 'O Amor que Transforma Corações',
    date: 'Há 1 mês',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=cross&color=black',
  },
  {
    id: '6',
    title: 'A Verdadeira Adoração',
    date: 'Há 2 meses',
    thumbnail: 'https://img.usecurling.com/p/400/225?q=worship&color=black',
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
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden border-border/50 shadow-elevation">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/FLZ4T8ZP9Ck?si=8t4xCwGPkCMctuw6"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
          <div className="px-1">
            <h2 className="text-2xl font-serif font-bold mt-4">Mensagem em Destaque</h2>
            <p className="text-muted-foreground mt-2">
              Assista à nossa última pregação disponível no YouTube. Acompanhe a mensagem e
              compartilhe com seus irmãos para espalhar a palavra.
            </p>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
          <Card className="h-full border-border/50 shadow-elevation flex flex-col">
            <CardHeader className="bg-secondary/30 pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-red-600" />
                Lista de Reprodução
              </CardTitle>
              <CardDescription>Últimas mensagens do canal</CardDescription>
            </CardHeader>
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
