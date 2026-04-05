import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, Zap, Calendar, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

const PLAN_FEATURES: Record<string, { price: string; period: string; features: string[] }> = {
  free: {
    price: 'R$ 0,00',
    period: '/ mês',
    features: ['3 gerações em 7 dias', 'Acesso básico aos recursos', 'Suporte comunitário'],
  },
  pro: {
    price: 'R$ 40,00',
    period: '/ mês',
    features: [
      '15 gerações por mês',
      'Exportação em PDF e PPTX',
      'Acesso a todas as ferramentas',
      'Suporte prioritário',
    ],
  },
  enterprise: {
    price: 'R$ 99,00',
    period: '/ mês',
    features: [
      'Gerações ilimitadas',
      'Recursos exclusivos',
      'Treinamento dedicado',
      'Acesso antecipado a novas funções',
    ],
  },
}

export function SubscriptionPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [planDetails, setPlanDetails] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('status, expires_at, sermons_generated, plan_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        setSubscription(sub)

        const activePlanId = sub?.plan_id || 'free'

        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('name, generation_limit')
          .eq('id', activePlanId)
          .maybeSingle()

        setPlanDetails(planData)
      } catch (error) {
        console.error('Error fetching subscription data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in-up duration-500">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
      </div>
    )
  }

  const planId = subscription?.plan_id || 'free'
  const planName =
    planDetails?.name || (planId === 'free' ? 'Gratuito' : planId === 'pro' ? 'Pro' : 'Enterprise')
  const generationLimit =
    planDetails?.generation_limit ?? (planId === 'free' ? 3 : planId === 'pro' ? 15 : null)
  const sermonsGenerated = subscription?.sermons_generated || 0
  const isUnlimited = generationLimit === null

  const uiDetails = PLAN_FEATURES[planId] || PLAN_FEATURES.free

  const isExpired = subscription ? isPast(new Date(subscription.expires_at)) : false
  const isActive = subscription?.status === 'active' && !isExpired
  const usagePercentage = isUnlimited
    ? 0
    : Math.min(100, (sermonsGenerated / generationLimit) * 100)
  const isNearLimit = usagePercentage >= 80

  return (
    <div className="space-y-6 animate-in fade-in-up duration-500">
      {isExpired && subscription && (
        <Alert
          variant="destructive"
          className="border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Plano Expirado</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>
              Sua assinatura {planName} expirou. Reative agora para continuar gerando sermões.
            </span>
            <Button asChild size="sm" variant="destructive">
              <Link to="/planos">Reativar Assinatura</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Detalhes do Plano
              </CardTitle>
              {isActive ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Ativo
                </Badge>
              ) : subscription ? (
                <Badge variant="destructive">Expirado</Badge>
              ) : (
                <Badge variant="secondary">Gratuito</Badge>
              )}
            </div>
            <CardDescription>Informações atuais da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{planName}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {uiDetails.price} {uiDetails.period}
              </p>
            </div>
            {subscription && (
              <div className="space-y-1 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {isExpired ? 'Expirou em' : 'Válido até'}
                </p>
                <p className="text-base font-medium">
                  {format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-6">
            <Button asChild className="w-full" variant={isExpired ? 'default' : 'outline'}>
              <Link to="/planos">
                {isExpired
                  ? 'Reativar Plano'
                  : planId === 'free'
                    ? 'Fazer Upgrade'
                    : 'Renovar / Alterar Plano'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Uso e Limites
            </CardTitle>
            <CardDescription>Acompanhe suas gerações do plano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Gerações utilizadas</span>
                <span>
                  {isUnlimited ? (
                    <span className="text-muted-foreground">Ilimitado</span>
                  ) : (
                    <span className={isNearLimit ? 'text-amber-500' : ''}>
                      {sermonsGenerated} / {generationLimit}
                    </span>
                  )}
                </span>
              </div>
              {!isUnlimited && (
                <Progress
                  value={usagePercentage}
                  className={cn(
                    'h-3',
                    usagePercentage >= 100
                      ? '[&>div]:bg-destructive'
                      : usagePercentage >= 80
                        ? '[&>div]:bg-amber-500'
                        : '',
                  )}
                />
              )}
              {isUnlimited && (
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary opacity-50" />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                O que está incluído no {planName}:
              </h4>
              {uiDetails.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> {feature}
                </div>
              ))}
            </div>
          </CardContent>
          {planId !== 'enterprise' && (
            <CardFooter className="pt-6">
              <Button asChild variant="secondary" className="w-full">
                <Link to="/planos">Ver todos os planos</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
