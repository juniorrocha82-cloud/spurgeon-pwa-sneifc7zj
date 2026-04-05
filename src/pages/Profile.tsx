import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await signOut()
      if (error) throw error
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível encerrar a sessão.',
        variant: 'destructive',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e sessão da conta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados da Conta
          </CardTitle>
          <CardDescription>Informações básicas do seu perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{user?.email}</p>
          </div>

          <div className="pt-6 border-t mt-4">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
