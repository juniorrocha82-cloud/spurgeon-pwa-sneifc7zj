import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) throw error
      navigate('/auth')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: error.message || 'Não foi possível encerrar a sessão.',
      })
    }
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full animate-fade-in-up">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground text-lg">
          Gerencie suas informações e controle sua sessão.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-elevation bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
            <CardDescription>Detalhes de acesso associados à sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="bg-background p-3 rounded-full shadow-sm">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">E-mail Cadastrado</p>
                <p className="text-base font-medium text-foreground">
                  {user?.email || 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="bg-background p-3 rounded-full shadow-sm">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-muted-foreground">ID do Usuário</p>
                <p className="text-xs text-muted-foreground truncate">{user?.id}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/settings')}
                variant="outline"
                className="w-full sm:w-auto h-12"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full sm:w-auto h-12"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
