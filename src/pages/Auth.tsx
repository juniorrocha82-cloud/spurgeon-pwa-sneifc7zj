import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
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
)

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('junior.rocha82@gmail.com')
  const [password, setPassword] = useState('Spurgeon123!')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar',
        description: error.message,
      })
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message,
      })
    } else {
      toast({
        title: 'Cadastro realizado',
        description: 'Verifique seu e-mail para confirmar a conta ou faça login imediatamente.',
      })
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
      setLoading(false)
    }
  }

  const benefits = [
    'Gere pregações com estrutura homilética',
    'Crie apresentações em PowerPoint',
    'Edite online e exporte em PDF',
    'Acesse devocionais diários',
    'Assista nosso canal no YouTube',
  ]

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* CTA Section */}
      <div className="flex flex-col justify-center px-6 py-12 md:p-12 lg:p-16 bg-[#1a233a] relative overflow-hidden order-1">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent z-0"></div>
        <div className="z-10 max-w-lg mx-auto md:mx-0 w-full">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-white leading-tight">
            Prepare Pregações Inspiradas
          </h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Spurgeon é uma plataforma de IA que ajuda pastores e pregadores a preparar pregações
            bíblicas estruturadas
          </p>

          <ul className="space-y-6">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mr-4 mt-0.5" />
                <span className="text-slate-200 text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center p-6 md:p-12 relative order-2 py-12 md:py-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>

        <Card className="w-full max-w-md z-10 shadow-elevation border-border/50 bg-card/80 backdrop-blur-md">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-serif text-foreground">Spurgeon</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-md font-medium btn-gold-glow mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar na plataforma'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-md font-medium btn-gold-glow mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Cadastrando...' : 'Criar minha conta'}
                  </Button>
                </form>
              </TabsContent>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-background hover:bg-muted"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon className="w-5 h-5 mr-2" />
                Google
              </Button>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
