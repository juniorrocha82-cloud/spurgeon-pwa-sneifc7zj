import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    console.error('Erro 404: Rota não encontrada:', location.pathname)
  }, [location.pathname])

  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] flex-col animate-fade-in text-center px-4 w-full">
      <BookOpen className="w-20 h-20 text-muted-foreground/20 mb-6" />
      <h1 className="text-6xl font-serif font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-serif text-foreground mb-4">Caminho não encontrado</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." - Salmos 119:105
        <br />
        <br />
        Mas parece que nos desviamos do caminho por aqui. A página que você está procurando não
        existe.
      </p>
      <Button
        onClick={() => navigate('/')}
        size="lg"
        className="btn-gold-glow font-medium font-serif tracking-wide px-8"
      >
        Retornar ao Início
      </Button>
    </div>
  )
}

export default NotFound
