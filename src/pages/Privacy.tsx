import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link
          to="/auth"
          className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
            <p className="mt-2 text-muted-foreground">Última atualização: 15 de Abril de 2026</p>
          </div>

          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <h2>1. Coleta de Dados</h2>
            <p>
              O Spurgeon coleta informações mínimas necessárias para o funcionamento do serviço,
              incluindo seu endereço de e-mail, nome e dados de uso da plataforma. Essas informações
              são coletadas apenas para melhorar o serviço e quando você se cadastra ou utiliza
              nossos recursos.
            </p>

            <h2>2. Uso de Dados</h2>
            <p>
              Utilizamos os dados coletados exclusivamente para fornecer, manter e aprimorar nosso
              serviço de geração de pregações e devocionais. Não vendemos suas informações pessoais
              a terceiros sob nenhuma circunstância.
            </p>

            <h2>3. Integrações de Terceiros</h2>
            <p>Nosso serviço utiliza integrações com provedores confiáveis para operar:</p>
            <ul>
              <li>
                <strong>Google OAuth:</strong> Utilizado para facilitar o seu login de forma segura.
                Temos acesso apenas às informações básicas do seu perfil público do Google.
              </li>
              <li>
                <strong>Stripe:</strong> Responsável pelo processamento de pagamentos. Não
                armazenamos os dados completos do seu cartão de crédito em nossos servidores; todo o
                processo ocorre no ambiente seguro da Stripe.
              </li>
            </ul>

            <h2>4. Segurança</h2>
            <p>
              Empregamos medidas de segurança padrão da indústria para proteger suas informações
              contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>

            <h2>5. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para manter sua sessão ativa e entender
              como você interage com nossa plataforma, visando melhorar a sua experiência geral de
              uso.
            </p>

            <h2>6. Direitos do Usuário</h2>
            <p>
              Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais
              a qualquer momento através das configurações da sua conta ou entrando em contato com
              nossa equipe de suporte.
            </p>

            <h2>7. Contato</h2>
            <p>
              Se você tiver alguma dúvida sobre esta Política de Privacidade ou sobre o tratamento
              dos seus dados, entre em contato conosco através do email{' '}
              <a href="mailto:faleconosco@spurgeon.one">faleconosco@spurgeon.one</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
