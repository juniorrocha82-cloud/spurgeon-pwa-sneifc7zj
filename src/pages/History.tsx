import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, Clock, BookOpen, Trash2 } from 'lucide-react'
import { useSermonStore } from '@/store/SermonContext'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function HistoryPage() {
  const { sermons, deleteSermon } = useSermonStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const recentSermons = sermons.slice(0, 7)
  const filteredSermons = recentSermons.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.baseText.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 flex flex-col w-full animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Meus Sermões
          </h1>
          <p className="text-muted-foreground">
            Seu acervo pessoal de pregações geradas (limitado aos 7 mais recentes).
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou base..."
            className="pl-9 bg-card border-border/50 focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {recentSermons.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/30 border border-border/30 rounded-2xl border-dashed">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-medium text-foreground mb-2">
            Nenhum sermão gerado
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Você ainda não gerou nenhuma pregação. Volte ao início para criar sua primeira mensagem.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="btn-gold-glow text-primary-foreground font-medium px-8"
          >
            Gerar Sermão
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {filteredSermons.map((sermon) => (
            <Card
              key={sermon.id}
              className="bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(212,175,55,0.1)] hover:-translate-y-1 group cursor-pointer flex flex-col"
              onClick={() => navigate(`/sermon/${sermon.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="bg-background text-xs text-muted-foreground border-border"
                    >
                      {sermon.version}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-secondary/50 text-xs text-secondary-foreground"
                    >
                      {sermon.sermonType || 'Expositivo'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSermon(sermon.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-serif leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {sermon.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {sermon.content.intro}
                </p>
              </CardContent>
              <CardFooter className="pt-0 border-t border-border/30 mt-auto px-6 py-4 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                  {new Date(sermon.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                  {sermon.duration} min
                </div>
              </CardFooter>
            </Card>
          ))}
          {filteredSermons.length === 0 && recentSermons.length > 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum resultado encontrado para "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  )
}
