import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MoreHorizontal, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ApiProvider {
  id: string
  provider_name: string
  api_key: string | null
  endpoint: string | null
  rate_limit: number | null
  priority: number
  is_active: boolean
}

export function ApiProvidersTab() {
  const { toast } = useToast()
  const [providers, setProviders] = useState<ApiProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ApiProvider | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newProv, setNewProv] = useState<Partial<ApiProvider>>({
    provider_name: '',
    priority: 10,
    is_active: true,
    endpoint: '',
    api_key: '',
  })

  const fetchProviders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('api_providers')
      .select('*')
      .order('priority', { ascending: true })
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else setProviders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  const handleSave = async () => {
    try {
      if (editing) {
        const { error } = await supabase
          .from('api_providers')
          .update({
            priority: editing.priority,
            is_active: editing.is_active,
            endpoint: editing.endpoint || null,
            api_key: editing.api_key || null,
          })
          .eq('id', editing.id)
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Provedor atualizado.' })
        setEditing(null)
      } else if (isAdding) {
        if (!newProv.provider_name) throw new Error('O nome é obrigatório')
        const { error } = await supabase.from('api_providers').insert({
          provider_name: newProv.provider_name.toLowerCase(),
          priority: newProv.priority || 10,
          is_active: newProv.is_active ?? true,
          endpoint: newProv.endpoint || null,
          api_key: newProv.api_key || null,
        })
        if (error) throw error
        toast({ title: 'Sucesso', description: 'Provedor adicionado.' })
        setIsAdding(false)
        setNewProv({ provider_name: '', priority: 10, is_active: true, endpoint: '', api_key: '' })
      }
      fetchProviders()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('api_providers').delete().eq('id', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Removido', description: 'Provedor removido com sucesso.' })
      fetchProviders()
    }
  }

  const activeModal = isAdding || !!editing
  const modalData = editing || newProv
  const setModalData = editing ? setEditing : (setNewProv as any)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>APIs de Inteligência Artificial</CardTitle>
          <CardDescription>Gerencie provedores, prioridades e endpoints.</CardDescription>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Provedor
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Endpoint Customizado</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[60px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[40px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : providers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium capitalize">{p.provider_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.is_active ? 'default' : 'secondary'}
                          className={p.is_active ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {p.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.priority}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[200px]">
                        {p.endpoint || 'Padrão'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(p)}>
                              Editar configurações
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => handleDelete(p.id)}
                            >
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={activeModal}
          onOpenChange={(open) => {
            if (!open) {
              setIsAdding(false)
              setEditing(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isAdding ? 'Novo Provedor' : `Editar: ${editing?.provider_name}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {isAdding && (
                <div className="space-y-2">
                  <Label>Nome do Provedor (ex: gemini, groq)</Label>
                  <Input
                    value={modalData.provider_name}
                    onChange={(e) => setModalData({ ...modalData, provider_name: e.target.value })}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <Switch
                  checked={modalData.is_active}
                  onCheckedChange={(c) => setModalData({ ...modalData, is_active: c })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade (menor = executado primeiro)</Label>
                <Input
                  type="number"
                  value={modalData.priority}
                  onChange={(e) =>
                    setModalData({ ...modalData, priority: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Endpoint Customizado (opcional)</Label>
                <Input
                  value={modalData.endpoint || ''}
                  onChange={(e) => setModalData({ ...modalData, endpoint: e.target.value })}
                  placeholder="Deixe em branco para usar o padrão"
                />
              </div>
              <div className="space-y-2">
                <Label>Chave da API (opcional - prefira Supabase Secrets)</Label>
                <Input
                  type="password"
                  value={modalData.api_key || ''}
                  onChange={(e) => setModalData({ ...modalData, api_key: e.target.value })}
                  placeholder="****************"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setEditing(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
