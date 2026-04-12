import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Copy, Calendar, BookOpen, Heart, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function DevotionalViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [devotional, setDevotional] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        if (!id) return
        const { data, error } = await supabase.from('devotionals').select('*').eq('id', id).single()

        if (error) throw error
        setDevotional(data)
      } catch (err: any) {
        console.error(err)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o devocional.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDevotional()
  }, [id, toast])

  const getShareText = () => {
    if (!devotional) return ''
    const content = devotional.content as any
    const title = devotional.title
    const baseText = devotional.base_text
    const reading = content.reading || ''
    const reflection = content.reflection || ''
    const prayer = content.prayer || ''

    return `*${title}*\n📖 ${baseText}\n\n${reading}\n\n*Reflexão*\n${reflection}\n\n*Oração*\n${prayer}\n\nLeia mais em:\nhttps://spurgeon.one/devotional/${id}`
  }

  const handleShare = async () => {
    if (!devotional) return
    const shareText = getShareText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: devotional.title,
          text: shareText,
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err)
          toast({
            title: 'Erro',
            description: 'Erro ao compartilhar.',
            variant: 'destructive',
          })
        }
      }
    } else {
      handleCopy()
    }
  }

  const handleCopy = async () => {
    if (!devotional) return
    try {
      await navigator.clipboard.writeText(getShareText())
      toast({
        title: 'Copiado!',
        description: 'Devocional copiado para a área de transferência.',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o texto.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        <Button
          variant="ghost"
          disabled
          className="mb-4"
          aria-label="Voltar para a página anterior"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Voltar
        </Button>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!devotional) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground mb-4">Devocional não encontrado</h2>
        <Button onClick={() => navigate('/devotionals')}>Voltar para Devocionais</Button>
      </div>
    )
  }

  const content = devotional.content as any
  const devDate = new Date(devotional.date || devotional.created_at)

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate('/devotionals')}
        className="mb-6 hover:bg-accent"
        aria-label="Voltar para a lista de Devocionais"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Voltar para Devocionais
      </Button>

      <Card className="overflow-hidden border-border/50 shadow-elevation bg-card">
        <CardContent className="p-6 md:p-10">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>
              {devDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8 leading-tight">
            {devotional.title}
          </h1>

          <div className="space-y-10">
            <section className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-lg text-foreground">{devotional.base_text}</h3>
              </div>
              <p className="text-foreground/80 font-serif text-lg leading-relaxed italic">
                "{content.reading}"
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-xl text-foreground">Reflexão</h3>
              </div>
              <div className="text-foreground/90 font-serif text-lg leading-[1.8] whitespace-pre-wrap">
                {content.reflection}
              </div>
            </section>

            <section className="bg-accent/50 rounded-xl p-6 border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-xl text-foreground">Oração</h3>
              </div>
              <p className="text-foreground/90 font-serif text-lg leading-relaxed italic">
                {content.prayer}
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center h-12 px-6"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Devocional Completo
            </Button>
            {typeof navigator.share === 'function' && (
              <Button
                className="w-full sm:w-auto flex items-center justify-center h-12 px-6"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar Devocional
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
