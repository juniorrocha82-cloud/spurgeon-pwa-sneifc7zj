import {
  BookOpen,
  Target,
  Eye,
  Star,
  Lightbulb,
  Heart,
  Zap,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-16 animate-fade-in-up">
      {/* Header section */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center space-y-4 border border-primary/10">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
          Sobre o <span className="text-primary">Spurgeon</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Conheça a plataforma que está transformando a preparação de pregações
        </p>
      </div>

      <div className="space-y-12">
        {/* Bem-vindo */}
        <section aria-labelledby="welcome-heading" className="space-y-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2 id="welcome-heading" className="text-2xl font-serif font-semibold text-foreground">
              Bem-vindo ao Spurgeon
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg">
            O Spurgeon é uma plataforma inovadora dedicada a transformar a forma como pregações são
            preparadas e compartilhadas. Inspirado em Charles Spurgeon, o "Príncipe dos Pregadores",
            nosso sistema combina tecnologia de inteligência artificial com a profundidade das
            Escrituras Sagradas.
          </p>
        </section>

        {/* Missão */}
        <section aria-labelledby="mission-heading" className="space-y-4">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2 id="mission-heading" className="text-2xl font-serif font-semibold text-foreground">
              Nossa Missão
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Capacitar pregadores, pastores e líderes religiosos a criar pregações bíblicas de
            qualidade, estruturadas e impactantes, economizando tempo e mantendo o rigor teológico.
            Acreditamos que a tecnologia deve servir como ferramenta para aprofundar a mensagem do
            Evangelho, não substituir a inspiração do Espírito Santo.
          </p>
        </section>

        {/* Visão */}
        <section aria-labelledby="vision-heading" className="space-y-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2 id="vision-heading" className="text-2xl font-serif font-semibold text-foreground">
              Nossa Visão
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Ser a plataforma de referência para geração de pregações bíblicas no Brasil e no mundo,
            democratizando o acesso a ferramentas profissionais de preparação de sermões para
            igrejas de todos os tamanhos.
          </p>
        </section>

        {/* Valores */}
        <section aria-labelledby="values-heading" className="space-y-6">
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2 id="values-heading" className="text-2xl font-serif font-semibold text-foreground">
              Nossos Valores
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card shadow-subtle border-border/50 transition-colors hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Fidelidade Bíblica</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Todas as pregações são baseadas na Bíblia Evangélica, respeitando a integridade
                  das Escrituras.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-subtle border-border/50 transition-colors hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Excelência</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Buscamos a qualidade em cada detalhe, desde a estrutura homilética até a
                  apresentação visual.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-subtle border-border/50 transition-colors hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Acessibilidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tornamos a preparação de pregações profissionais acessível a todos os líderes
                  religiosos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-subtle border-border/50 transition-colors hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Inovação</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Utilizamos tecnologia de ponta para potencializar o trabalho ministerial.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-subtle border-border/50 transition-colors hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Comunidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Valorizamos o compartilhamento de conhecimento e experiências entre pregadores.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Como Funciona */}
        <section aria-labelledby="how-it-works-heading" className="space-y-6">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-primary" aria-hidden="true" />
            <h2
              id="how-it-works-heading"
              className="text-2xl font-serif font-semibold text-foreground"
            >
              Como Funciona
            </h2>
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            O Spurgeon utiliza Inteligência artificial avançada para gerar pregações estruturadas
            seguindo a metodologia homilética clássica:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 1, title: 'Captação', desc: 'Uma abertura que prende a atenção' },
              { id: 2, title: 'Introdução', desc: 'Contextualização do tema' },
              { id: 3, title: 'Texto', desc: 'Passagem bíblica base' },
              { id: 4, title: 'Tema', desc: 'Ideia central da pregação' },
              { id: 5, title: 'Pontos', desc: 'Divisões principais (geralmente 3)' },
              { id: 6, title: 'Ilustração', desc: 'Exemplos práticos e histórias' },
              { id: 7, title: 'Aplicação', desc: 'Como aplicar na vida' },
              { id: 8, title: 'Conclusão', desc: 'Fechamento e chamado' },
            ].map((step) => (
              <article
                key={step.id}
                className="flex items-start p-4 bg-card rounded-xl border border-border/50 shadow-subtle transition-all hover:shadow-md hover:border-primary/20 group"
              >
                <div
                  aria-hidden="true"
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  {step.id}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="text-muted-foreground mt-6 p-4 bg-secondary/50 rounded-lg text-sm italic border-l-2 border-primary/40">
            Além disso, o sistema gera automaticamente insights teológicos e referências bíblicas
            complementares, e cria apresentações visuais profissionais com imagens contextualizadas.
          </p>
        </section>

        {/* Por que Spurgeon? */}
        <section
          aria-labelledby="why-spurgeon-heading"
          className="space-y-4 p-8 bg-card border border-primary/20 rounded-2xl shadow-elevation relative overflow-hidden group"
        >
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>
          <div className="flex items-center space-x-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" aria-hidden="true" />
            <h2 id="why-spurgeon-heading" className="text-2xl font-serif font-bold text-foreground">
              Por que Spurgeon?
            </h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed text-lg relative z-10">
            <p>
              Charles Spurgeon (1834-1892) foi um dos maiores pregadores da história cristã.
              Conhecido como o "Príncipe dos Pregadores", Spurgeon pregou mais de 3.500 sermões
              durante sua vida, influenciando gerações de cristãos. Sua dedicação à Palavra de Deus,
              sua clareza na comunicação e sua paixão pelo Evangelho inspiram o desenvolvimento
              desta plataforma.
            </p>
            <p className="font-medium text-foreground border-l-4 border-primary pl-4 py-1 bg-gradient-to-r from-primary/5 to-transparent">
              Assim como Spurgeon dedicou sua vida a proclamar a Palavra com excelência, o Spurgeon
              (plataforma) existe para ajudar pregadores modernos a fazer o mesmo.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
