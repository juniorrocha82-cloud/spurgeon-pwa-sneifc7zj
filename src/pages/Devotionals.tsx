import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookHeart, Sparkles, Quote, Calendar, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  aiGenerateDevotional,
  getRecentDevotionals,
  deleteDevotional,
  Devotional,
} from '@/services/devotionals'

const QUOTES = [
  'Buscando inspiração celestial...',
  'Meditando na Palavra de Deus...',
  'Preparando sua leitura de hoje...',
  'Separando uma porção de sabedoria...',
]

export default function DevotionalsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [recentDevotionals, setRecentDevotionals] = useState<Devotional[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  useEffect(() => {
    fetchRecent()
  }, [])

  const fetchRecent = async () => {
    try {
      const data = await getRecentDevotionals(3)
      setRecentDevotionals(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isGenerating) {
      interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const generatedData = await aiGenerateDevotional()

      if (generatedData?.devotionals && generatedData.devotionals.length > 0) {
        navigate(`/devotional/${generatedData.devotionals[0].id}`)
      } else {
        await fetchRecent()
      }
    } catch (error: any) {
      console.error('Generate error:', error)
      const errorMsg = error?.message || ''

      if (errorMsg === 'LIMIT_REACHED' || errorMsg.includes('limite')) {
        setShowUpgradeDialog(true)
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao gerar devocional',
          description: errorMsg || 'Ocorreu um erro inesperado. Tente novamente.',
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteDevotional(id)
      setRecentDevotionals((prev) => prev.filter((d) => d.id !== id))
      toast({
        title: 'Devocional excluído',
        description: 'O devocional foi removido com sucesso.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o devocional.',
      })
    }
  }

  return (
    <section
      className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fade-in-up"
      aria-labelledby="page-title"
    >
      <header className="mb-8 text-center md:text-left">
        <h1
          id="page-title"
          className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3"
        >
          Devocionais
        </h1>
        <p className="text-muted-foreground text-lg">
          Uma palavra de Deus estruturada e inspiradora para o seu dia.
        </p>
      </header>

      <Card
        className="border-border/50 shadow-elevation bg-card/50 backdrop-blur-sm mb-12"
        as="article"
      >
        <CardHeader className="pb-4">
          <CardTitle
            className="text-xl flex items-center font-serif text-primary"
            id="generate-section-title"
          >
            <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
            Inspiração Diária
          </CardTitle>
          <CardDescription>
            Clique abaixo para receber uma nova reflexão baseada na Palavra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full h-16 text-lg font-serif tracking-wide btn-gold-glow mt-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            disabled={isGenerating}
            aria-busy={isGenerating}
            aria-label={isGenerating ? 'Gerando devocional...' : 'Gerar Devocional de Hoje'}
          >
            <BookHeart className="mr-3 h-6 w-6" aria-hidden="true" />
            {isGenerating ? 'Gerando...' : 'Gerar Devocional de Hoje'}
          </Button>
        </CardContent>
      </Card>

      <section aria-labelledby="recent-devotionals-title" className="mb-6">
        <h2
          id="recent-devotionals-title"
          className="text-2xl font-serif font-semibold text-foreground"
        >
          Últimos Devocionais
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Seu histórico recente de reflexões.</p>
      </section>

      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse"
          aria-busy="true"
          aria-label="Carregando devocionais recentes"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-card/50 rounded-xl border border-border/50"
              aria-hidden="true"
            ></div>
          ))}
        </div>
      ) : recentDevotionals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/30 border border-border/30 rounded-2xl border-dashed">
          <BookHeart className="w-12 h-12 text-muted-foreground/30 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-serif font-medium text-foreground mb-2">
            Nenhum devocional ainda
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Você ainda não gerou nenhum devocional. Clique no botão acima para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8" role="list">
          {recentDevotionals.map((devotional) => (
            <Card
              key={devotional.id}
              as="article"
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/devotional/${devotional.id}`)
              }}
              className="bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,175,55,0.1)] hover:-translate-y-1 group cursor-pointer flex flex-col focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              onClick={() => navigate(`/devotional/${devotional.id}`)}
              aria-label={`Ver devocional: ${devotional.title}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className="bg-background text-xs text-muted-foreground border-border"
                  >
                    {devotional.base_text}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir devocional: ${devotional.title}`}
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity focus:opacity-100"
                    onClick={(e) => handleDelete(e, devotional.id)}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-serif leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {devotional.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {devotional.content.reflection}
                </p>
              </CardContent>
              <CardFooter className="pt-0 border-t border-border/30 mt-auto px-6 py-4 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" aria-hidden="true" />
                  <time dateTime={devotional.date}>
                    {new Date(devotional.date).toLocaleDateString('pt-BR')}
                  </time>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative flex items-center justify-center mb-12">
            <div
              className="absolute inset-0 bg-primary/20 blur-2xl rounded-full w-32 h-32 mx-auto animate-pulse"
              aria-hidden="true"
            ></div>
            <BookHeart
              className="w-20 h-20 text-primary animate-float relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
              aria-hidden="true"
            />
          </div>

          <div className="h-16 flex items-center justify-center px-6 text-center max-w-md">
            <p
              key={quoteIndex}
              className="text-xl md:text-2xl font-serif text-foreground animate-in slide-in-from-bottom-2 fade-in duration-500 flex items-start"
            >
              <Quote className="w-5 h-5 text-primary/50 mr-2 shrink-0 -mt-1" aria-hidden="true" />
              {QUOTES[quoteIndex]}
            </p>
          </div>

          <div
            className="mt-12 w-48 h-1 bg-secondary rounded-full overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full bg-primary w-1/3 rounded-full animate-[slide-right_1.5s_ease-in-out_infinite] relative"
              style={{ left: '-33%' }}
            ></div>
          </div>
          <style>{`
            @keyframes slide-right {
              0% { left: -33%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      )}

      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent className="border-border shadow-elevation">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl flex items-center text-foreground">
              <Sparkles className="w-5 h-5 mr-2 text-primary" aria-hidden="true" />
              Limite Diário Atingido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              Seu plano gratuito permite gerar <strong>2 devocionais por dia</strong>. Faça o
              upgrade para o plano Pro e tenha acesso ilimitado para continuar se aprofundando na
              Palavra!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/planos')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-label="Ver planos disponíveis"
            >
              Ver Planos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
