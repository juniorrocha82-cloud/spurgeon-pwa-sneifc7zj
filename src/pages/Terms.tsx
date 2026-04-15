import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 flex flex-col">
      <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 md:px-8">
        <Link
          to="/auth"
          className="flex items-center group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
          aria-label="Voltar para a página inicial"
        >
          <BookOpen
            className="w-6 h-6 text-primary mr-2 transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="font-serif text-xl font-bold text-primary">Spurgeon</span>
        </Link>
      </header>

      <main
        className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        aria-labelledby="terms-title"
      >
        <Button
          variant="ghost"
          asChild
          className="-ml-4 mb-6 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <Link to="/auth" aria-label="Voltar para página anterior">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Voltar
          </Link>
        </Button>

        <article className="bg-card border border-border shadow-elevation rounded-xl overflow-hidden">
          <header className="px-6 py-8 md:px-10 md:py-12 border-b border-border/50 bg-secondary/30">
            <h1
              id="terms-title"
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-serif"
            >
              Termos de Serviço
            </h1>
            <p className="mt-3 text-muted-foreground">Última atualização: 15 de Abril de 2026</p>
          </header>

          <div className="px-6 py-8 md:px-10 md:py-12 space-y-10 text-foreground/90 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  1
                </span>
                Aceitação dos Termos
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Ao acessar e usar o Spurgeon, você concorda em cumprir e ficar vinculado a estes
                  Termos de Serviço. O Spurgeon é um serviço de geração de pregações bíblicas e
                  devocionais com auxílio de Inteligência Artificial.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  2
                </span>
                Uso Permitido
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Você concorda em usar o serviço apenas para fins legais e de maneira que não
                  infrinja os direitos de terceiros ou restrinja o uso e aproveitamento do serviço
                  por qualquer outra pessoa.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  3
                </span>
                Nossos Planos
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>Oferecemos diferentes níveis de acesso ao nosso serviço:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-primary/50">
                  <li>
                    <strong className="text-foreground">Gratuito:</strong> Acesso básico com limite
                    de gerações por período.
                  </li>
                  <li>
                    <strong className="text-foreground">Pro:</strong> Acesso expandido com maior
                    limite de gerações mensais e recursos adicionais.
                  </li>
                  <li>
                    <strong className="text-foreground">Enterprise:</strong> Acesso ilimitado e
                    recursos exclusivos para igrejas e grandes organizações.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  4
                </span>
                Restrições
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>Você não deve:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-primary/50">
                  <li>Modificar, copiar ou criar trabalhos derivados baseados no serviço.</li>
                  <li>Compartilhar sua conta ou credenciais com terceiros.</li>
                  <li>
                    Tentar contornar quaisquer limitações técnicas ou de faturamento do serviço.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  5
                </span>
                Limitação de Responsabilidade
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  O Spurgeon é uma ferramenta de auxílio. O conteúdo gerado (pregações, devocionais,
                  slides) deve ser revisado pelo usuário. Não nos responsabilizamos por
                  interpretações teológicas ou pelo uso final do conteúdo gerado na plataforma.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  6
                </span>
                Cancelamento
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Você pode cancelar sua assinatura a qualquer momento. O cancelamento interromperá
                  as cobranças futuras, mas não haverá reembolso para períodos já faturados.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  7
                </span>
                Modificações
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento.
                  Notificaremos os usuários sobre mudanças significativas através do email
                  cadastrado ou de um aviso na plataforma.
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
