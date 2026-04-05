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
import { Search, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ADMIN_ID = '911d1666-978b-4ead-9be2-5a49028c767f'

export default function AdminPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.id !== ADMIN_ID) return

    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase.functions.invoke('get-admin-users')

        if (error) throw error

        setData(result || [])
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user || user.id !== ADMIN_ID) {
    return <Navigate to="/" replace />
  }

  const filteredData = data.filter((item) =>
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                      <TableCell>{item.plan_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === 'active' ? 'default' : 'secondary'}
                          className={
                            item.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : ''
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {item.sermons_generated || 0} / {item.generation_limit || '∞'}
                          </span>
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
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar plano</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Suspender</DropdownMenuItem>
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
    </div>
  )
}
