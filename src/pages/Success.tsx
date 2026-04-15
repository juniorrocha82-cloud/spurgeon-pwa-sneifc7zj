import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isCanceled = searchParams.get('canceled') === 'true'
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // If there is no session_id and it's not canceled, redirect to home to prevent direct access
    if (!sessionId && !isCanceled) {
      navigate('/')
    }
  }, [sessionId, isCanceled, navigate])

  return (
    <main
      className="flex-1 flex items-center justify-center min-h-[70vh] p-4 animate-fade-in-up"
      aria-labelledby="success-title"
    >
      <div className="max-w-md w-full bg-card border border-border shadow-elevation rounded-2xl p-8 text-center space-y-6">
        {isCanceled ? (
          <>
            <div
              className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
              aria-hidden="true"
            >
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 id="success-title" className="text-3xl font-serif font-bold text-foreground">
              Assinatura Cancelada
            </h1>
            <p className="text-muted-foreground text-lg">
              O processo de pagamento foi interrompido. Nenhuma cobrança foi realizada no seu
              cartão.
            </p>
            <Button
              className="w-full mt-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              onClick={() => navigate('/planos')}
              aria-label="Voltar para a página de planos"
            >
              Voltar para Planos
            </Button>
          </>
        ) : (
          <>
            <div
              className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
              aria-hidden="true"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 id="success-title" className="text-3xl font-serif font-bold text-foreground">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground text-lg">
              Sua assinatura foi ativada com sucesso. Aproveite todos os recursos premium do
              Spurgeon para preparar pregações incríveis.
            </p>
            <Button
              className="w-full mt-4 btn-gold-glow focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              onClick={() => navigate('/')}
              aria-label="Ir para a página inicial e gerar um sermão"
            >
              Começar a Gerar
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
