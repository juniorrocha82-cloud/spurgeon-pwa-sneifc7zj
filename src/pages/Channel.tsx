import { Card, CardContent } from '@/components/ui/card'
import { Youtube } from 'lucide-react'

export default function ChannelPage() {
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
      </div>
    </div>
  )
}
