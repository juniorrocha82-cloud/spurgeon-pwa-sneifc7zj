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
import { useSermonStore } from '@/store/SermonContext'
import { generateSermonMock } from '@/lib/mockAi'

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

  const [baseText, setBaseText] = useState('')
  const [version, setVersion] = useState('NVI')
  const [duration, setDuration] = useState([30])

  const [isGenerating, setIsGenerating] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)

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

    setIsGenerating(true)

    try {
      const generatedData = await generateSermonMock(baseText, version, duration[0])

      const newSermon = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...generatedData,
      }

      addSermon(newSermon)
      navigate(`/sermon/${newSermon.id}`)
    } catch (error) {
      console.error(error)
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
                placeholder="Ex: João 3:16, ou um tema como 'A graça inesgotável', ou um esboço prévio..."
                className="min-h-[120px] resize-none bg-background/50 focus:bg-background border-border focus-visible:ring-primary/50 text-base leading-relaxed"
                value={baseText}
                onChange={(e) => setBaseText(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  )
}
