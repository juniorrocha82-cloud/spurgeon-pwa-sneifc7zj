import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Sparkles, Heart, Copy, Calendar, Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { getDevotionalById, Devotional } from '@/services/devotionals'

export default function DevotionalViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        if (!id) return
        const data = await getDevotionalById(id)
        setDevotional(data)
      } catch (error) {
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

    fetchDevotional()
  }, [id, navigate, toast])

  const handleCopy = () => {
    if (!devotional) return

    const textToCopy = `
${devotional.title}
Data: ${new Date(devotional.date).toLocaleDateString('pt-BR')}

📖 ${devotional.base_text}
${devotional.content?.reading || ''}

✨ Reflexão
${devotional.content?.reflection || ''}

🙏 Oração
${devotional.content?.prayer || ''}

Leia o devocional completo em: https://spurgeon.one/devotional/${devotional.id}
`.trim()

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: 'Copiado!',
      description: 'Devocional copiado para a área de transferência.',
    })
  }

  const handleShare = async () => {
    if (!devotional) return

    const textToShare = `
${devotional.title}
Data: ${new Date(devotional.date).toLocaleDateString('pt-BR')}

📖 ${devotional.base_text}
${devotional.content?.reading || ''}

✨ Reflexão
${devotional.content?.reflection || ''}

🙏 Oração
${devotional.content?.prayer || ''}
`.trim()

    const shareData = {
      title: devotional.title,
      text: textToShare,
      url: `https://spurgeon.one/devotional/${devotional.id}`,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        toast({
          title: 'Compartilhado!',
          description: 'Devocional compartilhado com sucesso.',
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err)
          toast({
            variant: 'destructive',
            title: 'Erro ao compartilhar',
            description: 'Ocorreu um erro ao tentar compartilhar o devocional.',
          })
        }
      }
    } else {
      handleCopy()
      toast({
        title: 'Copiado!',
        description:
          'Link e devocional copiados. O compartilhamento nativo não é suportado neste dispositivo.',
      })
    }
  }

  if (isLoading) {
    return (
      <div
        className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-pulse"
        aria-busy="true"
        aria-label="Carregando devocional"
      >
        <div className="h-6 w-48 bg-card rounded mb-8"></div>
        <div className="h-10 w-3/4 bg-card rounded mb-4"></div>
        <div className="h-64 bg-card/50 rounded-xl mb-8"></div>
        <div className="h-48 bg-card/50 rounded-xl mb-8"></div>
      </div>
    )
  }

  if (!devotional) return null

  return (
    <article
      className="flex-1 flex flex-col max-w-3xl mx-auto w-full animate-fade-in-up pb-12"
      aria-labelledby="devotional-title"
    >
      <Button
        variant="ghost"
        className="self-start text-muted-foreground hover:text-foreground mb-6 -ml-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        onClick={() => navigate('/devotionals')}
        aria-label="Voltar para a lista de Devocionais"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Voltar para Devocionais
      </Button>

      <header className="mb-8">
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
          <time dateTime={devotional.date}>
            {new Date(devotional.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </div>
        <h1
          id="devotional-title"
          className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight"
        >
          {devotional.title}
        </h1>
      </header>

      <section className="space-y-8" aria-label="Conteúdo do Devocional">
        {/* Base Text / Reading */}
        <Card
          className="border border-border/50 shadow-sm bg-card/30"
          as="section"
          aria-labelledby="reading-heading"
        >
          <CardContent className="pt-6">
            <h2
              id="reading-heading"
              className="flex items-center text-lg font-serif font-semibold text-primary mb-4"
            >
              <BookOpen className="w-5 h-5 mr-2" aria-hidden="true" />
              {devotional.base_text}
            </h2>
            <div className="text-muted-foreground leading-relaxed italic text-lg whitespace-pre-wrap">
              "{devotional.content?.reading || 'Texto não encontrado.'}"
            </div>
          </CardContent>
        </Card>

        {/* Reflection */}
        <section aria-labelledby="reflection-heading">
          <h2
            id="reflection-heading"
            className="flex items-center text-xl font-serif font-bold text-foreground mb-4"
          >
            <Sparkles className="w-5 h-5 mr-2 text-primary" aria-hidden="true" />
            Reflexão
          </h2>
          <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap space-y-4">
            {devotional.content?.reflection || 'Reflexão não encontrada.'}
          </div>
        </section>

        {/* Prayer */}
        <Card
          className="border-primary/20 bg-primary/5 shadow-inner"
          as="section"
          aria-labelledby="prayer-heading"
        >
          <CardContent className="pt-6">
            <h2
              id="prayer-heading"
              className="flex items-center text-lg font-serif font-semibold text-primary mb-4"
            >
              <Heart className="w-5 h-5 mr-2" aria-hidden="true" />
              Oração
            </h2>
            <div className="text-foreground/90 leading-relaxed italic text-lg whitespace-pre-wrap">
              {devotional.content?.prayer || 'Oração não encontrada.'}
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-12 flex flex-col md:flex-row justify-center gap-4 border-t border-border/30 pt-8">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="lg"
          aria-label="Copiar texto completo do devocional"
          className="w-full md:w-auto min-w-[280px] h-12 text-base font-medium border-border/50 hover:bg-primary/10 hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2 text-green-500" aria-hidden="true" />
              Copiado com sucesso!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" aria-hidden="true" />
              Copiar Devocional Completo
            </>
          )}
        </Button>

        <Button
          onClick={handleShare}
          variant="default"
          size="lg"
          aria-label="Compartilhar devocional"
          className="w-full md:w-auto min-w-[280px] h-12 text-base font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <Share2 className="w-5 h-5 mr-2" aria-hidden="true" />
          Compartilhar Devocional
        </Button>
      </footer>
    </article>
  )
}
