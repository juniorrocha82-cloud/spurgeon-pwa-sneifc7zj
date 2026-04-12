import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Termos de Serviço</h1>
            <p className="mt-2 text-muted-foreground">Última atualização: 15 de Abril de 2026</p>
          </div>

          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Spurgeon, você concorda em cumprir e ficar vinculado a estes
              Termos de Serviço. O Spurgeon é um serviço de geração de pregações bíblicas e
              devocionais com auxílio de Inteligência Artificial.
            </p>

            <h2>2. Uso Permitido</h2>
            <p>
              Você concorda em usar o serviço apenas para fins legais e de maneira que não infrinja
              os direitos de terceiros ou restrinja o uso e aproveitamento do serviço por qualquer
              outra pessoa.
            </p>

            <h2>3. Nossos Planos</h2>
            <p>Oferecemos diferentes níveis de acesso ao nosso serviço:</p>
            <ul>
              <li>
                <strong>Gratuito:</strong> Acesso básico com limite de gerações por período.
              </li>
              <li>
                <strong>Pro:</strong> Acesso expandido com maior limite de gerações mensais e
                recursos adicionais.
              </li>
              <li>
                <strong>Enterprise:</strong> Acesso ilimitado e recursos exclusivos para igrejas e
                grandes organizações.
              </li>
            </ul>

            <h2>4. Restrições</h2>
            <p>Você não deve:</p>
            <ul>
              <li>Modificar, copiar ou criar trabalhos derivados baseados no serviço.</li>
              <li>Compartilhar sua conta ou credenciais com terceiros.</li>
              <li>Tentar contornar quaisquer limitações técnicas ou de faturamento do serviço.</li>
            </ul>

            <h2>5. Limitação de Responsabilidade</h2>
            <p>
              O Spurgeon é uma ferramenta de auxílio. O conteúdo gerado (pregações, devocionais,
              slides) deve ser revisado pelo usuário. Não nos responsabilizamos por interpretações
              teológicas ou pelo uso final do conteúdo gerado na plataforma.
            </p>

            <h2>6. Cancelamento</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento. O cancelamento interromperá as
              cobranças futuras, mas não haverá reembolso para períodos já faturados.
            </p>

            <h2>7. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os
              usuários sobre mudanças significativas através do email cadastrado ou de um aviso na
              plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
