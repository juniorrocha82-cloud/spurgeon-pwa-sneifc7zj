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

interface PlanDetails {
  id: string
  name: string
  price: string
  limit: number
  period: string
  isUnlimited: boolean
}

const PLAN_MAP: Record<string, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0,00',
    limit: 3,
    period: 'por semana',
    isUnlimited: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 29,90 / mês',
    limit: 15,
    period: 'por mês',
    isUnlimited: false,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Personalizado',
    limit: 999999,
    period: 'ilimitado',
    isUnlimited: true,
  },
}

export function SubscriptionPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        setSubscription(sub)

        const planId = sub?.plan_id || 'free'
        const startDate = new Date()
        if (planId === 'pro') {
          startDate.setDate(startDate.getDate() - 30)
        } else {
          startDate.setDate(startDate.getDate() - 7)
        }

        const { count } = await supabase
          .from('generation_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())

        setUsage(count || 0)
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
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  const planId = subscription?.plan_id || 'free'
  const plan = PLAN_MAP[planId] || PLAN_MAP.free
  const isExpired = subscription ? isPast(new Date(subscription.expires_at)) : false
  const isActive = subscription?.status === 'active' && !isExpired
  const usagePercentage = plan.isUnlimited ? 0 : Math.min(100, (usage / plan.limit) * 100)
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
              Sua assinatura {plan.name} expirou. Reative agora para continuar gerando sermões.
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
                <span className="text-3xl font-bold">{plan.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.price}</p>
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
            <CardDescription>Acompanhe suas gerações {plan.period}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Gerações utilizadas</span>
                <span>
                  {plan.isUnlimited ? (
                    <span className="text-muted-foreground">{usage} / ∞</span>
                  ) : (
                    <span className={isNearLimit ? 'text-amber-500' : ''}>
                      {usage} / {plan.limit}
                    </span>
                  )}
                </span>
              </div>
              {!plan.isUnlimited && (
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
              {plan.isUnlimited && (
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary opacity-50" />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                O que está incluído no {plan.name}:
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {plan.isUnlimited ? 'Gerações ilimitadas' : `${plan.limit} gerações ${plan.period}`}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Pregações temáticas e
                expositivas
              </div>
              {planId !== 'free' && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Geração de slides automático
                </div>
              )}
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
