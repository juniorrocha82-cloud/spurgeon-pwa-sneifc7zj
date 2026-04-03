import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

const stripePubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePubKey ? loadStripe(stripePubKey) : null

const plans = [
  {
    id: 'free',
    name: 'Plano Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para quem está começando a explorar a plataforma.',
    features: ['3 gerações em 7 dias', 'Acesso básico aos recursos', 'Suporte comunitário'],
    current: true,
    stripePriceId: null,
  },
  {
    id: 'pro',
    name: 'Plano Pro',
    price: 'R$ 40',
    period: '/mês',
    description: 'Para pregadores e líderes que precisam de mais recursos.',
    features: [
      '15 gerações por mês',
      'Exportação em PDF e PPTX',
      'Acesso a todas as ferramentas',
      'Suporte prioritário',
    ],
    current: false,
    stripePriceId: 'price_pro_placeholder', // Substitua pelo Price ID real do Stripe
  },
  {
    id: 'enterprise',
    name: 'Plano Enterprise',
    price: 'R$ 99',
    period: '/mês',
    description: 'Para igrejas e ministérios com alta demanda de conteúdo.',
    features: [
      'Gerações ilimitadas',
      'Recursos exclusivos',
      'Treinamento dedicado',
      'Acesso antecipado a novas funções',
    ],
    current: false,
    stripePriceId: 'price_enterprise_placeholder', // Substitua pelo Price ID real do Stripe
  },
]

function PlansContent() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const stripe = useStripe()

  const handleChoosePlan = (plan: (typeof plans)[0]) => {
    if (plan.current) return
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan?.stripePriceId) {
      toast.error('Plano inválido para pagamento.')
      return
    }

    if (!user) {
      toast.error('Você precisa estar logado para assinar um plano.')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          plan_id: selectedPlan.stripePriceId,
          user_id: user.id,
        },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      if (data?.sessionId && stripe) {
        // Redireciona o usuário para a sessão de checkout recorrente usando o Stripe.js
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })
        if (stripeError) {
          throw new Error(stripeError.message)
        }
      } else if (data?.url) {
        // Fallback para redirecionamento direto
        window.location.href = data.url
      } else {
        throw new Error('Sessão de checkout não foi gerada pelo servidor.')
      }
    } catch (err: any) {
      console.error('Erro no fluxo de pagamento:', err)
      toast.error('Erro ao iniciar o pagamento', {
        description: err.message || 'Houve um problema ao contatar o servidor. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 max-w-6xl animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
          Escolha o Plano Ideal para o Seu Ministério
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie todo o potencial do Spurgeon com nossos planos premium e crie pregações ainda
          mais inspiradoras.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col h-full transition-all duration-300 hover:shadow-lg ${plan.id === 'pro' ? 'border-primary shadow-md md:-mt-4 relative' : ''}`}
          >
            {plan.id === 'pro' && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Recomendado
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                className="w-full"
                variant={plan.current ? 'outline' : plan.id === 'pro' ? 'default' : 'secondary'}
                disabled={plan.current}
                onClick={() => handleChoosePlan(plan)}
              >
                {plan.current ? 'Seu Plano Atual' : 'Escolher Plano'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resumo da Assinatura</DialogTitle>
            <DialogDescription>
              Confirme os detalhes do plano selecionado antes de prosseguir para o pagamento seguro.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="bg-muted/50 p-4 rounded-lg my-4 space-y-3 border">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{selectedPlan.name}</span>
                <span className="font-bold text-xl">
                  {selectedPlan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {selectedPlan.period}
                  </span>
                </span>
              </div>
              <div className="text-sm text-muted-foreground pt-3 border-t">
                <span className="font-medium text-foreground mb-2 block">Você terá acesso a:</span>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="sm:mr-2"
            >
              Cancelar
            </Button>
            <Button onClick={handleProceedToPayment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Prosseguir para Pagamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PlansPage() {
  return (
    <Elements stripe={stripePromise}>
      <PlansContent />
    </Elements>
  )
}
