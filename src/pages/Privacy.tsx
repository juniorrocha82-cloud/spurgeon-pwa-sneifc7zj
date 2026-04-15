import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
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
        aria-labelledby="privacy-title"
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
              id="privacy-title"
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-serif"
            >
              Política de Privacidade
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
                Coleta de Dados
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  O Spurgeon coleta informações mínimas necessárias para o funcionamento do serviço,
                  incluindo seu endereço de e-mail, nome e dados de uso da plataforma. Essas
                  informações são coletadas apenas para melhorar o serviço e quando você se cadastra
                  ou utiliza nossos recursos.
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
                Uso de Dados
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Utilizamos os dados coletados exclusivamente para fornecer, manter e aprimorar
                  nosso serviço de geração de pregações e devocionais. Não vendemos suas informações
                  pessoais a terceiros sob nenhuma circunstância.
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
                Integrações de Terceiros
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>Nosso serviço utiliza integrações com provedores confiáveis para operar:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-primary/50">
                  <li>
                    <strong className="text-foreground">Google OAuth:</strong> Utilizado para
                    facilitar o seu login de forma segura. Temos acesso apenas às informações
                    básicas do seu perfil público do Google.
                  </li>
                  <li>
                    <strong className="text-foreground">Stripe:</strong> Responsável pelo
                    processamento de pagamentos. Não armazenamos os dados completos do seu cartão de
                    crédito em nossos servidores; todo o processo ocorre no ambiente seguro da
                    Stripe.
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
                Segurança
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Empregamos medidas de segurança padrão da indústria para proteger suas informações
                  contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
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
                Cookies
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Utilizamos cookies e tecnologias semelhantes para manter sua sessão ativa e
                  entender como você interage com nossa plataforma, visando melhorar a sua
                  experiência geral de uso.
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
                Direitos do Usuário
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados
                  pessoais a qualquer momento através das configurações da sua conta ou entrando em
                  contato com nossa equipe de suporte.
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
                Contato
              </h2>
              <div className="pl-11 space-y-4 text-muted-foreground">
                <p>
                  Se você tiver alguma dúvida sobre esta Política de Privacidade ou sobre o
                  tratamento dos seus dados, entre em contato conosco através do email{' '}
                  <a
                    href="mailto:faleconosco@spurgeon.one"
                    className="text-primary hover:underline font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
                    aria-label="Enviar email para faleconosco@spurgeon.one"
                  >
                    faleconosco@spurgeon.one
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
