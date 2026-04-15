import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Sparkles, Heart, Copy, Calendar, Check } from 'lucide-react'
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
`.trim()

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: 'Copiado!',
      description: 'Devocional copiado para a área de transferência.',
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-pulse">
        <div className="h-6 w-48 bg-card rounded mb-8"></div>
        <div className="h-10 w-3/4 bg-card rounded mb-4"></div>
        <div className="h-64 bg-card/50 rounded-xl mb-8"></div>
        <div className="h-48 bg-card/50 rounded-xl mb-8"></div>
      </div>
    )
  }

  if (!devotional) return null

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full animate-fade-in-up pb-12">
      <Button
        variant="ghost"
        className="self-start text-muted-foreground hover:text-foreground mb-6 -ml-4"
        onClick={() => navigate('/devotionals')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Devocionais
      </Button>

      <div className="mb-8">
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(devotional.date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
          {devotional.title}
        </h1>
      </div>

      <div className="space-y-8">
        {/* Base Text / Reading */}
        <Card className="border border-border/50 shadow-sm bg-card/30">
          <CardContent className="pt-6">
            <h3 className="flex items-center text-lg font-serif font-semibold text-primary mb-4">
              <BookOpen className="w-5 h-5 mr-2" />
              {devotional.base_text}
            </h3>
            <div className="text-muted-foreground leading-relaxed italic text-lg whitespace-pre-wrap">
              "{devotional.content?.reading || 'Texto não encontrado.'}"
            </div>
          </CardContent>
        </Card>

        {/* Reflection */}
        <div>
          <h3 className="flex items-center text-xl font-serif font-bold text-foreground mb-4">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Reflexão
          </h3>
          <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap space-y-4">
            {devotional.content?.reflection || 'Reflexão não encontrada.'}
          </div>
        </div>

        {/* Prayer */}
        <Card className="border-primary/20 bg-primary/5 shadow-inner">
          <CardContent className="pt-6">
            <h3 className="flex items-center text-lg font-serif font-semibold text-primary mb-4">
              <Heart className="w-5 h-5 mr-2" />
              Oração
            </h3>
            <div className="text-foreground/90 leading-relaxed italic text-lg whitespace-pre-wrap">
              {devotional.content?.prayer || 'Oração não encontrada.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center border-t border-border/30 pt-8">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="lg"
          className="w-full md:w-auto min-w-[280px] h-12 text-base font-medium border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Copiado com sucesso!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copiar Devocional Completo
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
