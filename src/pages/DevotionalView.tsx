import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookHeart, Calendar, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDevotionalById, Devotional } from '@/services/devotionals'
import { useToast } from '@/hooks/use-toast'

export default function DevotionalViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadDevotional(id)
    }
  }, [id])

  const loadDevotional = async (devId: string) => {
    try {
      setIsLoading(true)
      const data = await getDevotionalById(devId)
      setDevotional(data)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar o devocional.',
      })
      navigate('/devotionals')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <div className="w-16 h-16 bg-primary/20 rounded-full mb-4"></div>
        <div className="h-6 w-48 bg-muted rounded mb-2"></div>
        <div className="h-4 w-32 bg-muted/50 rounded"></div>
      </div>
    )
  }

  const handleShare = async () => {
    if (!devotional) return

    const url = window.location.href
    const shareText = `📖 *${devotional.title}*\n${devotional.base_text}\n\n*Leitura do Dia:*\n"${devotional.content.reading}"\n\n*Reflexão:*\n${devotional.content.reflection}\n\n*Oração:*\n${devotional.content.prayer}\n\nLeia este e outros devocionais no Spurgeon:\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: devotional.title,
          text: shareText,
        })
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareText)
        }
      }
    } else {
      copyToClipboard(shareText)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copiado!',
        description: 'Texto copiado para a área de transferência.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível copiar o texto.',
      })
    }
  }

  if (!devotional) return null

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fade-in-up pb-12">
      <Button
        variant="ghost"
        className="self-start mb-6 text-muted-foreground hover:text-foreground pl-0"
        onClick={() => navigate('/devotionals')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Devocionais
      </Button>

      <div className="mb-8 text-center">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1">
          <Calendar className="w-3.5 h-3.5 mr-2" />
          {new Date(devotional.date).toLocaleDateString('pt-BR')}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
          {devotional.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
          <BookHeart className="w-4 h-4 text-primary" />
          {devotional.base_text}
        </div>
      </div>

      <div className="space-y-8">
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-subtle">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg font-serif font-semibold text-primary mb-3">Leitura do Dia</h3>
            <p className="text-lg leading-relaxed text-foreground/90 italic border-l-2 border-primary/30 pl-4">
              "{devotional.content.reading}"
            </p>
          </CardContent>
        </Card>

        <div className="px-2 md:px-8">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center">
            Reflexão
          </h3>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground space-y-6">
            {devotional.content.reflection.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5 mt-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-serif font-semibold text-foreground mb-4 flex items-center">
              <Heart className="w-5 h-5 text-primary mr-2" />
              Oração
            </h3>
            <p className="text-lg leading-relaxed text-foreground/90">
              {devotional.content.prayer}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-8 pb-4">
          <Button
            onClick={handleShare}
            size="lg"
            className="rounded-full px-8 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Compartilhar Devocional
          </Button>
        </div>
      </div>
    </div>
  )
}
