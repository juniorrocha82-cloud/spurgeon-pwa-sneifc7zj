import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User, BookOpen, FileText, Lock } from 'lucide-react'

export default function ProfilePage() {
  const { user, updatePassword } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState({ sermons: 0, devotionals: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (!user) return
      try {
        const [sermonsRes, devotionalsRes] = await Promise.all([
          supabase
            .from('sermons')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('devotionals')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ])

        setStats({
          sermons: sermonsRes.count || 0,
          devotionals: devotionalsRes.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
  }, [user])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas diferentes',
        description: 'A nova senha e a confirmação não coincidem.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setLoadingPassword(true)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) throw error
      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi alterada com sucesso.',
      })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais e acompanhe seu histórico no Spurgeon.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados da Conta
            </CardTitle>
            <CardDescription>Informações básicas do seu perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">
                O e-mail não pode ser alterado no momento.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Membro desde</Label>
              <Input
                value={
                  user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : ''
                }
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Seu Impacto
            </CardTitle>
            <CardDescription>Resumo de tudo que você já produziu.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-6 bg-primary/10 rounded-xl border border-primary/20">
                  <BookOpen className="h-8 w-8 text-primary mb-2" />
                  <span className="text-3xl font-bold">{stats.sermons}</span>
                  <span className="text-sm font-medium text-muted-foreground text-center">
                    Pregações
                    <br />
                    Geradas
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-3xl font-bold">{stats.devotionals}</span>
                  <span className="text-sm font-medium text-muted-foreground text-center">
                    Devocionais
                    <br />
                    Salvos
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Atualize sua senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loadingPassword || !newPassword || !confirmPassword}>
                {loadingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
