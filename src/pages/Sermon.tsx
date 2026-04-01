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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSermonStore, Sermon } from '@/store/SermonContext'

export default function SermonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sermons, loading } = useSermonStore()
  const [sermon, setSermon] = useState<Sermon | null>(null)

  useEffect(() => {
    if (!loading) {
      const found = sermons.find((s) => s.id === id)
      if (found) setSermon(found)
      else navigate('/history')
    }
  }, [id, sermons, loading, navigate])

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

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-12 animate-fade-in-up">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
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

        <div className="space-y-6">
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
    </div>
  )
}
