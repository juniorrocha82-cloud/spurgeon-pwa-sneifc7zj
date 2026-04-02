import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Youtube } from 'lucide-react'

export default function ChannelPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up">
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

      <Card className="overflow-hidden border-border/50 shadow-elevation">
        <CardHeader className="bg-secondary/30 pb-4 border-b border-border/50">
          <CardTitle className="text-xl font-serif flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            Mensagem em Destaque
          </CardTitle>
          <CardDescription>Assista à nossa última pregação disponível no YouTube.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/FLZ4T8ZP9Ck?si=uS-E9ZlM0kioopoR"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-4 pb-8">
        <p className="text-sm text-muted-foreground">
          Inscreva-se no canal para receber notificações de novos vídeos e pregações.
        </p>
      </div>
    </div>
  )
}
