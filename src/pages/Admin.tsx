import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MoreHorizontal, Database } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ADMIN_ID = '911d1666-978b-4ead-9be2-5a49028c767f'

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [selectedUserForReset, setSelectedUserForReset] = useState<string | null>(null)

  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false)
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<string | null>(null)
  const [newPlanId, setNewPlanId] = useState<string>('free')

  const [importingVersion, setImportingVersion] = useState<string | null>(null)
  const [importResults, setImportResults] = useState<any[]>([])

  const handleImportBible = async (version: string) => {
    setImportingVersion(version)
    try {
      const { data, error } = await supabase.functions.invoke('import-bible-data', {
        body: { version },
      })

      if (error) throw error

      toast({
        title: 'Importação Concluída',
        description: `${data.version}: ${data.books} livros, ${data.chapters} capítulos, ${data.verses} versículos.`,
      })
      setImportResults((prev) => [...prev, data])
    } catch (err: any) {
      toast({
        title: 'Erro na importação',
        description: err.message || 'Ocorreu um erro ao importar os dados.',
        variant: 'destructive',
      })
    } finally {
      setImportingVersion(null)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase.functions.invoke('get-admin-users')

      if (error) throw error

      setData(result || [])
    } catch (err) {
      console.error('Error fetching admin data:', err)
      toast({
        title: 'Erro ao buscar dados',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id !== ADMIN_ID) return
    fetchData()
  }, [user])

  const handleConfirmReset = async () => {
    if (!selectedUserForReset) return
    try {
      const { data: existingSubs, error: selectErr } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', selectedUserForReset)
        .order('created_at', { ascending: false })

      if (selectErr) throw selectErr

      let error
      if (existingSubs && existingSubs.length > 0) {
        const res = await supabase
          .from('user_subscriptions')
          .update({
            sermons_generated: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubs[0].id)
        error = res.error
      } else {
        const res = await supabase.from('user_subscriptions').insert({
          user_id: selectedUserForReset,
          plan_id: 'free',
          status: 'active',
          sermons_generated: 0,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        error = res.error
      }

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'O uso do usuário foi zerado com sucesso.',
      })

      fetchData()
    } catch (err) {
      console.error('Error resetting usage:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível zerar o uso deste usuário.',
        variant: 'destructive',
      })
    } finally {
      setResetModalOpen(false)
      setSelectedUserForReset(null)
    }
  }

  const handleConfirmEditPlan = async () => {
    if (!selectedUserForPlan) return
    try {
      const { data: existingSubs, error: selectErr } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', selectedUserForPlan)
        .order('created_at', { ascending: false })

      if (selectErr) throw selectErr

      let error
      if (existingSubs && existingSubs.length > 0) {
        const res = await supabase
          .from('user_subscriptions')
          .update({
            plan_id: newPlanId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubs[0].id)
        error = res.error
      } else {
        const res = await supabase.from('user_subscriptions').insert({
          user_id: selectedUserForPlan,
          plan_id: newPlanId,
          status: 'active',
          sermons_generated: 0,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        error = res.error
      }

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'O plano do usuário foi atualizado com sucesso.',
      })

      fetchData()
    } catch (err) {
      console.error('Error updating plan:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o plano deste usuário.',
        variant: 'destructive',
      })
    } finally {
      setEditPlanModalOpen(false)
      setSelectedUserForPlan(null)
    }
  }

  if (!user || user.id !== ADMIN_ID) {
    return <Navigate to="/" replace />
  }

  const filteredData = data.filter((item) =>
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getUsageDisplay = (item: any) => {
    if (item.id === ADMIN_ID) return 'Ilimitado (Admin)'

    let limit = item.generation_limit

    if (limit === null || limit === undefined) {
      const planName = (item.plan_name || '').toLowerCase()
      if (planName.includes('free') || planName.includes('gratuito')) limit = 3
      else if (planName.includes('pro')) limit = 15
      else limit = null
    }

    if (limit === null) return 'Ilimitado'
    return `${item.sermons_generated || 0} / ${limit}`
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie usuários e assinaturas da plataforma.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinaturas</CardTitle>
          <CardDescription>
            Visão geral de todos os usuários e seus respectivos planos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uso (Gerados/Limite)</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[60px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.email}</TableCell>
                      <TableCell>
                        {item.plan_name?.toLowerCase() === 'free'
                          ? 'Gratuito'
                          : item.plan_name?.toLowerCase() === 'pro'
                            ? 'Pro Plan'
                            : item.plan_name || 'Gratuito'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === 'active' ? 'default' : 'secondary'}
                          className={
                            item.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : ''
                          }
                        >
                          {item.status || 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getUsageDisplay(item)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForPlan(item.id)
                                const planName = (item.plan_name || '').toLowerCase()
                                const currentPlanId = planName.includes('pro')
                                  ? 'pro'
                                  : planName.includes('enterprise')
                                    ? 'enterprise'
                                    : 'free'
                                setNewPlanId(currentPlanId)
                                setEditPlanModalOpen(true)
                              }}
                            >
                              Editar plano
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForReset(item.id)
                                setResetModalOpen(true)
                              }}
                            >
                              Zerar Uso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Banco de Dados
          </CardTitle>
          <CardDescription>
            Ferramentas de sincronização e importação de dados do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              variant="outline"
              onClick={() => handleImportBible('pt_acf')}
              disabled={importingVersion !== null}
            >
              {importingVersion === 'pt_acf' ? 'Importando ACF...' : 'Importar Bíblia ACF'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleImportBible('pt_nvi')}
              disabled={importingVersion !== null}
            >
              {importingVersion === 'pt_nvi' ? 'Importando NVI...' : 'Importar Bíblia NVI'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleImportBible('en_kjv')}
              disabled={importingVersion !== null}
            >
              {importingVersion === 'en_kjv' ? 'Importando KJV...' : 'Importar Bíblia KJV'}
            </Button>
          </div>

          {importResults.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Resultados da Importação:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {importResults.map((res, i) => (
                  <li key={i} className="flex items-center gap-2 bg-accent/50 p-2 rounded-md">
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      Sucesso
                    </Badge>
                    <span>
                      <strong>{res.version}</strong>: {res.books} livros, {res.chapters} cap.,{' '}
                      {res.verses} versículos.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja zerar o uso deste usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmReset}>
              Zerar Uso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editPlanModalOpen} onOpenChange={setEditPlanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>Selecione o novo plano para este usuário.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newPlanId} onValueChange={setNewPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="pro">Pro Plan</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmEditPlan}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
