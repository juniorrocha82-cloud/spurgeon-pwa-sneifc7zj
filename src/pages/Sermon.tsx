import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Copy,
  Download,
  Edit,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react'
import { useSermonStore } from '@/store/SermonContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

export default function SermonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getSermon } = useSermonStore()
  const { toast } = useToast()

  const sermon = getSermon(id || '')

  useEffect(() => {
    if (!sermon) {
      navigate('/history')
    }
  }, [sermon, navigate])

  if (!sermon) return null

  const handleCopy = () => {
    let textToCopy = `${sermon.title}\n\n`
    textToCopy += `Introdução:\n${sermon.content.intro}\n\n`
    sermon.content.points.forEach((p, i) => {
      textToCopy += `${i + 1}. ${p.title}\n${p.text}\n\n`
    })
    textToCopy += `Conclusão:\n${sermon.content.conclusion}`

    navigator.clipboard.writeText(textToCopy)
    toast({
      title: 'Copiado com sucesso',
      description: 'O sermão foi copiado para a área de transferência.',
    })
  }

  const handleExport = () => {
    window.print()
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-fade-in-up pb-24 md:pb-0">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2 hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground line-clamp-1">
            {sermon.title}
          </h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5">
              {sermon.version}
            </Badge>
            <Badge variant="secondary" className="bg-secondary/80">
              {sermon.duration} min
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(sermon.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sermon" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start bg-card border border-border/50 p-1 mb-6 rounded-xl overflow-x-auto overflow-y-hidden shadow-sm">
          <TabsTrigger
            value="sermon"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2.5 text-sm md:text-base transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Sermão Completo
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2.5 text-sm md:text-base transition-all"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights do Pregador
          </TabsTrigger>
          <TabsTrigger
            value="references"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2.5 text-sm md:text-base transition-all"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Referências
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 bg-card border border-border/50 rounded-xl shadow-elevation overflow-hidden relative">
          <ScrollArea className="h-full absolute inset-0">
            <div className="p-6 md:p-10">
              <TabsContent value="sermon" className="mt-0 outline-none print:block">
                <article className="max-w-prose mx-auto font-sans text-foreground/90 leading-relaxed text-lg print:text-black">
                  <div className="mb-10">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4 print:text-black">
                      Introdução
                    </h2>
                    <p className="whitespace-pre-wrap">{sermon.content.intro}</p>
                  </div>

                  <div className="space-y-10">
                    {sermon.content.points.map((point, index) => (
                      <div key={index}>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4 print:text-black">
                          {index + 1}. {point.title}
                        </h2>
                        <p className="whitespace-pre-wrap">{point.text}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-10 bg-border/50" />

                  <div className="mb-10">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-4 print:text-black">
                      Conclusão
                    </h2>
                    <p className="whitespace-pre-wrap">{sermon.content.conclusion}</p>
                  </div>
                </article>
              </TabsContent>

              <TabsContent value="insights" className="mt-0 outline-none">
                <div className="max-w-2xl mx-auto space-y-6">
                  {sermon.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex p-5 rounded-xl bg-background border border-border shadow-sm"
                    >
                      <div className="bg-primary/20 p-2 rounded-lg h-fit mr-4">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-foreground/90 leading-relaxed pt-1">{insight}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="references" className="mt-0 outline-none">
                <div className="max-w-2xl mx-auto space-y-4">
                  {sermon.references.map((ref, index) => {
                    const [verse, desc] = ref.split(' - ')
                    return (
                      <div
                        key={index}
                        className="flex items-start p-5 rounded-xl bg-background border border-border shadow-sm"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary mr-4 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-serif font-bold text-lg text-foreground mb-1">
                            {verse}
                          </h4>
                          <p className="text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>

      {/* Floating Action Bar */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 flex flex-col md:flex-row gap-3 z-40 print:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg border border-border"
          onClick={() => navigate('/')}
          title="Novo Sermão"
        >
          <Edit className="w-5 h-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg border border-border"
          onClick={handleCopy}
          title="Copiar Texto"
        >
          <Copy className="w-5 h-5" />
        </Button>
        <Button
          className="h-12 w-12 md:w-auto md:px-6 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] btn-gold-glow border border-primary/50"
          onClick={handleExport}
        >
          <Download className="w-5 h-5 md:mr-2" />
          <span className="hidden md:inline font-medium">Exportar PDF</span>
        </Button>
      </div>
    </div>
  )
}
