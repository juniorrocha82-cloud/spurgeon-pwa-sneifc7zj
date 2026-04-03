import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      toast.success('Assinatura ativada com sucesso!', {
        description: 'Bem-vindo(a) ao seu novo plano no Spurgeon.',
      })
    }
  }, [sessionId])

  return (
    <div className="container mx-auto py-20 px-4 flex items-center justify-center min-h-[70vh] animate-fade-in">
      <Card className="max-w-md w-full text-center border-primary/20 shadow-lg">
        <CardHeader className="pt-8">
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Sua assinatura foi processada e ativada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Sua conta já foi atualizada. Você agora pode aproveitar todos os recursos e benefícios
            exclusivos do seu novo plano para criar pregações ainda mais inspiradoras.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button asChild className="w-full">
            <Link to="/">Voltar para o Início</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/profile">Ver meu Perfil</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
