import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const canceled = searchParams.get('canceled') === 'true'
  const { user } = useAuth()

  const [loading, setLoading] = useState(!!sessionId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (canceled) {
      toast.error('Pagamento cancelado', {
        description: 'Você cancelou o processo de pagamento.',
      })
      return
    }

    if (sessionId && user) {
      const fetchSubscription = async () => {
        try {
          let attempts = 0
          let subData = null

          while (attempts < 10 && !subData) {
            const { data } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            // Check if updated in the last 5 minutes to ensure it's the new one (webhook has processed)
            if (data && new Date(data.updated_at).getTime() > Date.now() - 5 * 60 * 1000) {
              subData = data
              break
            }

            attempts++
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }

          if (subData) {
            setSubscription(subData)
            toast.success('Assinatura ativada com sucesso!', {
              description: 'Bem-vindo(a) ao seu novo plano no Spurgeon.',
            })
          } else {
            toast.info('Processando assinatura', {
              description: 'Sua conta será atualizada em instantes.',
            })
          }
        } catch (error) {
          console.error('Error fetching subscription:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchSubscription()
    } else if (sessionId && !user) {
      setLoading(false)
    }
  }, [sessionId, canceled, user])

  const planNames: Record<string, string> = {
    pro: 'Plano Pro',
    enterprise: 'Plano Enterprise',
  }

  if (canceled) {
    return (
      <div className="container mx-auto py-20 px-4 flex items-center justify-center min-h-[70vh] animate-fade-in-up">
        <Card className="max-w-md w-full text-center border-destructive/20 shadow-lg">
          <CardHeader className="pt-8">
            <div className="mx-auto bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold">Pagamento Cancelado</CardTitle>
            <CardDescription className="text-lg mt-2">
              O processo de assinatura não foi concluído.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Você cancelou o pagamento ou ocorreu um erro durante o processamento. Nenhuma cobrança
              foi realizada no seu cartão.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8">
            <Button asChild className="w-full">
              <Link to="/planos">Tentar Novamente</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Voltar para o Início</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-20 px-4 flex items-center justify-center min-h-[70vh] animate-fade-in-up">
      <Card className="max-w-md w-full text-center border-primary/20 shadow-lg">
        <CardHeader className="pt-8">
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            {loading ? (
              <Loader2 className="h-10 w-10 text-green-600 dark:text-green-500 animate-spin" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {loading ? 'Processando...' : 'Pagamento Confirmado!'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {loading
              ? 'Aguardando confirmação do Stripe...'
              : 'Sua assinatura foi processada e ativada com sucesso.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && subscription ? (
            <div className="bg-muted/50 p-4 rounded-lg text-left space-y-4 mb-4 border border-border/50">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Plano Contratado</p>
                <p className="font-semibold text-lg text-foreground">
                  {planNames[subscription.plan_id] || 'Plano Premium'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Data de Expiração</p>
                <p className="font-medium text-foreground">
                  {format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          ) : (
            !loading && (
              <p className="text-muted-foreground text-sm mb-4">
                Sua conta já está sendo atualizada. Você poderá aproveitar todos os recursos e
                benefícios exclusivos do seu novo plano.
              </p>
            )
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button asChild className="w-full" disabled={loading}>
            <Link to="/">Voltar para Gerador de Sermões</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" disabled={loading}>
            <Link to="/profile">Ver meu Perfil</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
