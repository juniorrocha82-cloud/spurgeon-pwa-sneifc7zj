import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        toast({
          title: 'Cadastro realizado!',
          description: 'Verifique seu e-mail para confirmar a conta.',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro na autenticação',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (error: any) {
      toast({
        title: 'Erro no Google Sign In',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-background" aria-label="Página de Autenticação">
      {/* Left Form Section */}
      <section
        className="flex w-full flex-col justify-center px-4 sm:px-8 lg:w-1/2 lg:px-16 xl:px-24"
        aria-labelledby="auth-title"
      >
        <div className="mx-auto w-full max-w-sm animate-in fade-in slide-in-from-left-4 duration-500">
          <header className="mb-8 flex flex-col space-y-2 text-center">
            <h1 id="auth-title" className="text-3xl font-semibold tracking-tight">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? 'Insira suas credenciais para acessar o Spurgeon.'
                : 'Preencha os dados abaixo para se cadastrar.'}
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Formulário de Autenticação"
          >
            <div className="space-y-2 text-left">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                className="focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
                    aria-label="Esqueceu sua senha?"
                  >
                    Esqueceu a senha?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                className="focus-visible:ring-primary focus-visible:outline-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          <div className="relative my-6" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          <Button
            aria-label="Entrar ou cadastrar-se com o Google"
            variant="outline"
            type="button"
            className="w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
              aria-label={isLogin ? 'Alternar para cadastro' : 'Alternar para login'}
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos{' '}
            <Link
              to="/terms"
              className="underline hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
            >
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link
              to="/privacy"
              className="underline hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
            >
              Política de Privacidade
            </Link>
            .
          </div>
        </div>
      </section>

      {/* Right CTA Section */}
      <aside
        className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-12 border-l relative overflow-hidden bg-zinc-950"
        aria-label="Benefícios da plataforma"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="https://img.usecurling.com/p/800/1000?q=bible%20study&color=black&dpr=2"
            alt="Fundo com a imagem de uma pessoa estudando a Bíblia e as escrituras"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-lg text-white animate-in fade-in slide-in-from-right-4 duration-700">
          <h2 className="text-4xl font-bold mb-6 leading-tight text-white">
            Prepare Pregações Inspiradas em Minutos
          </h2>
          <p className="text-lg text-zinc-300 mb-8">
            O Spurgeon é o seu assistente teológico pessoal. Crie sermões bem estruturados, acesse
            devocionais diários e exporte tudo com facilidade.
          </p>
          <div className="space-y-6">
            <article className="flex items-start gap-4">
              <div
                className="bg-primary/20 p-3 rounded-xl border border-primary/30 text-primary"
                aria-hidden="true"
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Inteligência Artificial</h3>
                <p className="text-zinc-400">
                  Gere esboços expositivos e temáticos com base em qualquer texto bíblico.
                </p>
              </div>
            </article>
            <article className="flex items-start gap-4">
              <div
                className="bg-primary/20 p-3 rounded-xl border border-primary/30 text-primary"
                aria-hidden="true"
              >
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Exportação Fácil</h3>
                <p className="text-zinc-400">
                  Baixe suas pregações em PDF ou gere slides para sua apresentação.
                </p>
              </div>
            </article>
            <article className="flex items-start gap-4">
              <div
                className="bg-primary/20 p-3 rounded-xl border border-primary/30 text-primary"
                aria-hidden="true"
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Devocionais Diários</h3>
                <p className="text-zinc-400">
                  Acesse reflexões profundas todos os dias para o seu crescimento espiritual.
                </p>
              </div>
            </article>
          </div>
        </div>
      </aside>
    </main>
  )
}
