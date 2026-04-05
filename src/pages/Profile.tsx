import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { User, LogOut, CreditCard, Zap, CheckCircle2 } from 'lucide-react'

const ADMIN_ID = '911d1666-978b-4ead-9be2-5a49028c767f'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    const fetchProfileData = async () => {
      try {
        setLoading(true)

        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (subData) {
          setSubscription(subData)
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', subData.plan_id)
            .maybeSingle()

          if (planData) {
            setPlan(planData)
          } else {
            setPlan({
              id: subData.plan_id,
              name:
                subData.plan_id === 'pro'
                  ? 'Pro'
                  : subData.plan_id === 'enterprise'
                    ? 'Enterprise'
                    : 'Gratuito',
              generation_limit:
                subData.plan_id === 'pro' ? 15 : subData.plan_id === 'enterprise' ? null : 3,
              features: [],
            })
          }
        } else {
          setSubscription({
            status: 'active',
            sermons_generated: 0,
            plan_id: 'free',
          })
          setPlan({
            id: 'free',
            name: 'Gratuito',
            generation_limit: 3,
            features: ['3 gerações em 7 dias', 'Acesso básico aos recursos', 'Suporte comunitário'],
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const isAdmin = user?.id === ADMIN_ID

  const sermonsGenerated = subscription?.sermons_generated || 0
  const generationLimit = plan?.generation_limit
  const isUnlimited = isAdmin || generationLimit === null
  const usagePercentage = isUnlimited
    ? 0
    : Math.min(100, (sermonsGenerated / (generationLimit || 1)) * 100)

  const hasReachedLimit = !isUnlimited && sermonsGenerated >= (generationLimit || 0)

  return (
    <div className="container max-w-5xl py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Sua Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações e assinatura.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados da Conta
            </CardTitle>
            <CardDescription>Informações básicas do seu perfil.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-10 w-[120px]" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-base font-medium">{user?.email}</p>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Detalhes do Plano
            </CardTitle>
            <CardDescription>Informações atuais da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                    {isAdmin ? (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                        {plan?.name || 'Gratuito'}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold">
                    {isAdmin ? 'Administrador' : plan?.name || 'Gratuito'}
                  </h3>
                </div>

                <div className="pt-6 mt-auto">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/planos')}>
                    Renovar / Alterar Plano
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Uso e Limites
            </CardTitle>
            <CardDescription>Acompanhe suas gerações do plano.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[180px]" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Gerações utilizadas</span>
                    {isAdmin ? (
                      <span className="text-primary">Acesso Ilimitado</span>
                    ) : isUnlimited ? (
                      <span className="text-primary">{sermonsGenerated} / Ilimitado</span>
                    ) : (
                      <span className={hasReachedLimit ? 'text-destructive font-bold' : ''}>
                        <span className={hasReachedLimit ? '' : 'text-primary'}>
                          {sermonsGenerated}
                        </span>{' '}
                        / {generationLimit} pregações
                      </span>
                    )}
                  </div>

                  {!isAdmin && !isUnlimited && (
                    <Progress
                      value={usagePercentage}
                      className={hasReachedLimit ? 'bg-destructive/20 [&>div]:bg-destructive' : ''}
                    />
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    O que está incluído no {isAdmin ? 'seu perfil' : plan?.name || 'seu plano'}:
                  </p>

                  <ul className="space-y-3">
                    {isAdmin ? (
                      <>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Acesso ilimitado a todas as funcionalidades</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Gerenciamento de usuários</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Reset de contadores</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Sem restrições</span>
                        </li>
                      </>
                    ) : plan?.features &&
                      Array.isArray(plan.features) &&
                      plan.features.length > 0 ? (
                      plan.features.map((feature: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{typeof feature === 'string' ? feature : feature.name}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        {plan?.id === 'free' && (
                          <>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>3 gerações em 7 dias</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Acesso básico aos recursos</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Suporte comunitário</span>
                            </li>
                          </>
                        )}
                        {plan?.id === 'pro' && (
                          <>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>15 gerações de pregações por mês</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Geração de Slides (PPTX)</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Geração de Devocionais</span>
                            </li>
                          </>
                        )}
                        {plan?.id === 'enterprise' && (
                          <>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Gerações Ilimitadas</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Todos os recursos do Pro</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Suporte prioritário</span>
                            </li>
                          </>
                        )}
                      </>
                    )}
                  </ul>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button className="flex-1" onClick={() => navigate('/')}>
                    Gerar Nova Pregação
                  </Button>
                  {hasReachedLimit && (
                    <Button
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary/10"
                      onClick={() => navigate('/planos')}
                    >
                      Ver todos os planos
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
