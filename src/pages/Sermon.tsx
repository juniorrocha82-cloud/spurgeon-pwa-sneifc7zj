import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Lightbulb,
  Bookmark,
  Quote,
  Presentation,
  Image as ImageIcon,
  FileText,
  Copy,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import { useSermonStore, Sermon } from '@/store/SermonContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SermonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sermons, loading } = useSermonStore()
  const [sermon, setSermon] = useState<Sermon | null>(null)

  // Presentation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [slideCount, setSlideCount] = useState('auto')
  const [hasImages, setHasImages] = useState('yes')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!loading) {
      const found = sermons.find((s) => s.id === id)
      if (found) setSermon(found)
      else navigate('/history')
    }
  }, [id, sermons, loading, navigate])

  const handleCopyText = async () => {
    if (!sermon) return

    const text = `${sermon.title}
Baseado em: ${sermon.baseText} (${sermon.version})

INTRODUÇÃO
${sermon.content.intro}

${sermon.content.proposition ? `PROPOSIÇÃO\n${sermon.content.proposition}\n\n` : ''}DESENVOLVIMENTO
${sermon.content.points.map((p, i) => `${i + 1}. ${p.title}\n${p.text}`).join('\n\n')}

${sermon.content.illustration ? `ILUSTRAÇÃO\n${sermon.content.illustration}\n\n` : ''}CONCLUSÃO
${sermon.content.conclusion}`

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Sermão copiado!', {
        description: 'O texto foi copiado para sua área de transferência.',
      })
    } catch (err) {
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar o texto.',
      })
    }
  }

  const handleGeneratePresentation = async () => {
    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: { sermon, theme, slideCount, hasImages },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      const slides = data.slides
      const isDark = theme === 'dark'
      const bgColor = isDark ? '#0f172a' : '#ffffff'
      const textColor = isDark ? '#f8fafc' : '#0f172a'
      const accentColor = '#d97706' // amber-600

      const slidesHtml = slides
        .map(
          (slide: any) => `
        <div class="slide">
          ${
            hasImages === 'yes' && slide.imageQuery
              ? `<div class="slide-bg" style="background-image: url('https://img.usecurling.com/p/1280/720?q=${encodeURIComponent(
                  slide.imageQuery,
                )}&color=${isDark ? 'black' : 'white'}')"></div>`
              : ''
          }
          <div class="slide-content">
            <h1>${slide.title}</h1>
            <p>${slide.content.replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
      `,
        )
        .join('')

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Apresentação - ${sermon?.title}</title>
<style>
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: ${bgColor}; color: ${textColor}; overflow: hidden; }
  .slide { 
    width: 100vw; height: 100vh; 
    display: flex; flex-direction: column; justify-content: center; align-items: center; 
    text-align: center; padding: 4rem; box-sizing: border-box;
    position: relative; scroll-snap-align: start; flex: 0 0 100vh;
  }
  .slide-bg {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background-size: cover; background-position: center;
    opacity: 0.15; z-index: 0;
  }
  .slide-content { z-index: 1; max-width: 900px; padding: 2.5rem; background: ${
    isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.85)'
  }; border-radius: 1rem; backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  h1 { font-size: 3.5rem; margin-bottom: 1.5rem; color: ${accentColor}; line-height: 1.2; font-weight: 800; }
  p { font-size: 2rem; line-height: 1.5; opacity: 0.9; margin: 0; font-weight: 500; }
  .container { height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory; display: flex; flex-direction: column; }
  ::-webkit-scrollbar { width: 0px; }
  .instructions { position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); z-index: 10; font-size: 0.875rem; opacity: 0.5; background: ${
    isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)'
  }; padding: 0.5rem 1rem; border-radius: 2rem; pointer-events: none; }
</style>
</head>
<body>
  <div class="instructions">Use as setas do teclado (↓ ↑) ou role para navegar. Pressione F11 para tela cheia.</div>
  <div class="container">
    <div class="slide">
      ${
        hasImages === 'yes'
          ? `<div class="slide-bg" style="background-image: url('https://img.usecurling.com/p/1280/720?q=${encodeURIComponent(
              'christian cross faith',
            )}&color=${isDark ? 'black' : 'white'}')"></div>`
          : ''
      }
      <div class="slide-content">
        <h1>${sermon?.title}</h1>
        <p>${sermon?.baseText} - ${sermon?.version}</p>
      </div>
    </div>
    ${slidesHtml}
  </div>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `apresentacao-${sermon?.title.toLowerCase().replace(/\s+/g, '-')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Apresentação Gerada!', {
        description: 'O arquivo foi baixado. Abra no navegador e aperte F11 para apresentar.',
      })
      setIsModalOpen(false)
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao gerar apresentação', {
        description: err.message || 'Tente novamente mais tarde.',
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading || !sermon) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-primary/50 mb-4" />
          <p className="text-muted-foreground">Carregando sermão...</p>
        </div>
      </div>
    )
  }

  const isDarkPreview = theme === 'dark'

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-12 animate-fade-in-up">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground print:hidden"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2 mb-2 print:hidden">
          <Badge variant="outline" className="border-primary/30 text-primary">
            {sermon.version}
          </Badge>
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {sermon.duration} min
          </Badge>
          <Badge variant="secondary" className="bg-secondary/50">
            {sermon.sermonType || 'Expositivo'}
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
          {sermon.title}
        </h1>
        <p className="text-lg text-muted-foreground flex items-center">
          <Bookmark className="w-4 h-4 mr-2" />
          Texto Base: <strong className="ml-1 text-foreground">{sermon.baseText}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-semibold text-primary flex items-center">
              <BookOpen className="w-5 h-5 mr-2" /> Introdução
            </h2>
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {sermon.content.intro}
            </p>
          </section>

          {sermon.content.proposition && (
            <section className="space-y-4 bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-serif font-semibold text-primary flex items-center">
                <Presentation className="w-5 h-5 mr-2" /> Proposição
              </h2>
              <p className="text-lg font-medium leading-relaxed text-foreground/90 italic">
                "{sermon.content.proposition}"
              </p>
            </section>
          )}

          <div className="space-y-8 mt-8">
            <h2 className="text-2xl font-serif font-semibold text-primary flex items-center">
              <Bookmark className="w-5 h-5 mr-2" /> Desenvolvimento
            </h2>
            {sermon.content.points.map((point, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-xl font-serif font-medium text-foreground flex items-baseline">
                  <span className="text-primary text-sm mr-3">{i + 1}.</span>
                  {point.title}
                </h3>
                <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap pl-6">
                  {point.text}
                </p>
              </div>
            ))}
          </div>

          {sermon.content.illustration && (
            <section className="space-y-4 bg-secondary/20 border border-secondary/30 rounded-xl p-6">
              <h2 className="text-xl font-serif font-semibold text-foreground flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-muted-foreground" /> Ilustração
              </h2>
              <p className="text-lg leading-relaxed text-foreground/90">
                {sermon.content.illustration}
              </p>
            </section>
          )}

          <Separator className="my-8" />

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-semibold text-primary flex items-center">
              <Quote className="w-5 h-5 mr-2" /> Conclusão
            </h2>
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {sermon.content.conclusion}
            </p>
          </section>
        </div>

        <div className="space-y-6 print:hidden">
          <Card className="bg-card/50 border-border/50 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-serif">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Insights para o Pregador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {sermon.insights.map((insight, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 mt-1.5 mr-2 shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 shadow-sm sticky top-[400px]">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-serif">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Referências Cruzadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {sermon.references.map((ref, i) => {
                  const [verse, ...descArr] = ref.split(' - ')
                  const desc = descArr.join(' - ')
                  return (
                    <li key={i} className="text-sm">
                      <strong className="block text-foreground font-serif">{verse}</strong>
                      {desc && <span className="text-muted-foreground mt-1 block">{desc}</span>}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium"
        >
          <Presentation className="w-5 h-5 mr-2" />
          Gerar Apresentação
        </Button>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="flex-1 sm:flex-none"
          >
            <FileText className="w-5 h-5 mr-2" />
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopyText}
            className="flex-1 sm:flex-none"
          >
            <Copy className="w-5 h-5 mr-2" />
            Copiar Texto
          </Button>
        </div>
      </div>

      {/* Presentation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-serif">
              <Presentation className="w-6 h-6 mr-2 text-amber-500" />
              Gerar Apresentação
            </DialogTitle>
            <DialogDescription>
              Personalize e gere slides a partir da sua pregação.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-8">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Prévia dos Slides</h4>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={cn(
                    'aspect-[16/9] rounded-md p-4 flex flex-col items-center justify-center text-center shadow-sm border transition-colors',
                    isDarkPreview
                      ? 'bg-[#0f172a] text-slate-50 border-slate-700'
                      : 'bg-white text-slate-900 border-slate-200',
                  )}
                >
                  <BookOpen className="w-6 h-6 mb-2 opacity-80 text-amber-500" />
                  <span className="text-xs font-bold line-clamp-2 leading-tight">
                    {sermon.title}
                  </span>
                  <span className="text-[9px] opacity-70 mt-1">Spurgeon</span>
                </div>
                <div
                  className={cn(
                    'aspect-[16/9] rounded-md p-4 flex flex-col justify-center shadow-sm border transition-colors',
                    isDarkPreview
                      ? 'bg-[#0f172a] text-slate-50 border-slate-700'
                      : 'bg-white text-slate-900 border-slate-200',
                  )}
                >
                  <h5 className="text-[11px] font-bold mb-1.5 text-amber-500">1. Introdução</h5>
                  <p className="text-[9px] opacity-90 line-clamp-4 leading-relaxed">
                    {sermon.content.intro}
                  </p>
                </div>
                <div
                  className={cn(
                    'aspect-[16/9] rounded-md p-4 flex flex-col justify-center shadow-sm border transition-colors',
                    isDarkPreview
                      ? 'bg-[#0f172a] text-slate-50 border-slate-700'
                      : 'bg-white text-slate-900 border-slate-200',
                  )}
                >
                  <h5 className="text-[11px] font-bold mb-1.5 text-amber-500">Insights</h5>
                  <ul className="text-[9px] opacity-90 space-y-1.5">
                    {sermon.insights.slice(0, 3).map((insight, i) => (
                      <li key={i} className="line-clamp-2 flex items-start">
                        <Lightbulb className="w-2.5 h-2.5 mr-1 text-yellow-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Tema</Label>
                <ToggleGroup
                  type="single"
                  value={theme}
                  onValueChange={(v) => v && setTheme(v)}
                  className="justify-start gap-2"
                >
                  <ToggleGroupItem
                    value="light"
                    className="flex-1 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900 data-[state=on]:border-amber-200 dark:data-[state=on]:bg-amber-900/30 dark:data-[state=on]:text-amber-200"
                  >
                    <Sun className="w-4 h-4 mr-2" /> Claro
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="dark"
                    className="flex-1 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-slate-800 data-[state=on]:text-slate-50 data-[state=on]:border-slate-700"
                  >
                    <Moon className="w-4 h-4 mr-2" /> Escuro
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Nº de Slides</Label>
                <Select value={slideCount} onValueChange={setSlideCount}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático (6)</SelectItem>
                    <SelectItem value="10">10 Slides</SelectItem>
                    <SelectItem value="15">15 Slides</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Imagens</Label>
                <ToggleGroup
                  type="single"
                  value={hasImages}
                  onValueChange={(v) => v && setHasImages(v)}
                  className="justify-start gap-2"
                >
                  <ToggleGroupItem
                    value="yes"
                    className="flex-1 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" /> Sim
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="no"
                    className="flex-1 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Não
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleGeneratePresentation}
              className="w-full h-11 text-base font-medium bg-amber-500 hover:bg-amber-600 text-white"
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Presentation className="w-5 h-5 mr-2" />
              )}
              {generating ? 'Gerando...' : 'Gerar Apresentação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
