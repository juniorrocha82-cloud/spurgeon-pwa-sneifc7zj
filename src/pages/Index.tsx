import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Sparkles, Clock, Quote } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useSermonStore } from '@/store/SermonContext'
import { useToast } from '@/hooks/use-toast'
import { aiGenerateSermon, saveSermonToDb } from '@/services/sermons'
import { checkGenerationLimit, logGeneration } from '@/services/billing'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const QUOTES = [
  'A Palavra de Deus é viva e eficaz...',
  'Pregue a palavra, esteja preparado a tempo e fora de tempo...',
  'Buscando referências cruzadas...',
  'Estruturando os pontos principais...',
  'Preparando insights para o orador...',
]

export default function Index() {
  const navigate = useNavigate()
  const { addSermon } = useSermonStore()
  const { toast } = useToast()

  const [baseText, setBaseText] = useState('')
  const [version, setVersion] = useState('NVI')
  const [sermonType, setSermonType] = useState('Expositivo')
  const [duration, setDuration] = useState([30])
  const [hasCustomOutline, setHasCustomOutline] = useState(false)
  const [customOutline, setCustomOutline] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isGenerating) {
      interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!baseText.trim()) return

    try {
      const canGenerate = await checkGenerationLimit()
      if (!canGenerate) {
        setShowLimitModal(true)
        return
      }
    } catch (error) {
      console.error('Erro ao checar limite:', error)
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'Não foi possível verificar seu limite de gerações. Tente novamente.',
      })
      return
    }

    setIsGenerating(true)

    try {
      // 1. Generate via AI Edge Function
      const outlineValue = hasCustomOutline ? customOutline : ''
      const generatedData = await aiGenerateSermon(
        baseText,
        version,
        duration[0],
        sermonType,
        outlineValue,
      )

      // 2. Save to Database
      const savedSermon = await saveSermonToDb({
        title: generatedData.title,
        baseText,
        version,
        duration: duration[0],
        sermonType,
        content: {
          ...generatedData.content,
          custom_outline: outlineValue,
        },
        insights: generatedData.insights,
        references: generatedData.references,
      })

      // 3. Log generation
      await logGeneration('sermon')

      // 4. Update local state and redirect
      addSermon(savedSermon)
      navigate(`/sermon/${savedSermon.id}`)
    } catch (error: any) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar pregação',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
      })
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full animate-fade-in-up">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          O que Deus colocou em seu coração?
        </h1>
        <p className="text-muted-foreground text-lg">
          Deixe o Spurgeon auxiliar na estrutura e profundidade da sua mensagem.
        </p>
      </div>

      <Card className="border-border/50 shadow-elevation bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center font-serif text-primary">
            <Sparkles className="w-5 h-5 mr-2" />
            Parâmetros da sua Pregação
          </CardTitle>
          <CardDescription>Defina a base e o estilo da sua pregação.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="baseText" className="text-base">
                Base do Sermão
              </Label>
              <Textarea
                id="baseText"
                placeholder="Ex: João 3:16, ou um tema como 'A graça Inesgotável', ou um esboço prévio, ou seu próprio sermão (ative o botão 'Roteiro próprio de pregação')"
                className="min-h-[120px] resize-none bg-background/50 focus:bg-background border-border focus-visible:ring-primary/50 text-base leading-relaxed"
                value={baseText}
                onChange={(e) => setBaseText(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="custom-outline"
                checked={hasCustomOutline}
                onCheckedChange={setHasCustomOutline}
              />
              <Label htmlFor="custom-outline" className="text-base cursor-pointer">
                Roteiro próprio de pregação
              </Label>
            </div>

            {hasCustomOutline && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="customOutline" className="text-base">
                  Seu Roteiro
                </Label>
                <Textarea
                  id="customOutline"
                  placeholder="Cole aqui seu roteiro de pregação (introdução, pontos principais, conclusão, etc)"
                  className="min-h-[150px] resize-none bg-background/50 focus:bg-background border-border focus-visible:ring-primary/50 text-base leading-relaxed"
                  value={customOutline}
                  onChange={(e) => setCustomOutline(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="version" className="text-base">
                  Versão da Bíblia
                </Label>
                <Select value={version} onValueChange={setVersion}>
                  <SelectTrigger id="version" className="bg-background/50 border-border h-12">
                    <SelectValue placeholder="Selecione a versão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARA">ARA (Almeida Revista e Atualizada)</SelectItem>
                    <SelectItem value="ARC">ARC (Almeida Revista e Corrigida)</SelectItem>
                    <SelectItem value="NAA">NAA (Nova Almeida Atualizada)</SelectItem>
                    <SelectItem value="NVI">NVI (Nova Versão Internacional)</SelectItem>
                    <SelectItem value="NVT">NVT (Nova Versão Transformadora)</SelectItem>
                    <SelectItem value="NTLH">NTLH (Linguagem de Hoje)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="sermonType" className="text-base">
                  Estilo da Pregação
                </Label>
                <Select value={sermonType} onValueChange={setSermonType}>
                  <SelectTrigger id="sermonType" className="bg-background/50 border-border h-12">
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Expositivo">Expositivo</SelectItem>
                    <SelectItem value="Temático">Temático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    Duração Estimada
                  </Label>
                  <span className="text-primary font-medium font-serif">{duration[0]} min</span>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={120}
                  min={10}
                  step={5}
                  className="pt-2"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-serif tracking-wide btn-gold-glow mt-4"
              disabled={!baseText.trim() || isGenerating}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Gerar Pregação
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center mb-12">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full w-32 h-32 mx-auto animate-pulse"></div>
            <BookOpen className="w-20 h-20 text-primary animate-float relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          </div>

          <div className="h-16 flex items-center justify-center px-6 text-center max-w-md">
            <p
              key={quoteIndex}
              className="text-xl md:text-2xl font-serif text-foreground animate-in slide-in-from-bottom-2 fade-in duration-500 flex items-start"
            >
              <Quote className="w-5 h-5 text-primary/50 mr-2 shrink-0 -mt-1" />
              {QUOTES[quoteIndex]}
            </p>
          </div>

          <div className="mt-12 w-48 h-1 bg-secondary rounded-full overflow-hidden">
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

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">
              Limite de gerações atingido
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Você atingiu o limite de gerações do seu plano atual. Faça upgrade para continuar
              criando pregações inspiradoras com o auxílio da IA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLimitModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button onClick={() => navigate('/planos')} className="w-full sm:w-auto btn-gold-glow">
              Ver Planos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
