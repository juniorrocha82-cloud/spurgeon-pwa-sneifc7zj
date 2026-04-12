import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTab } from '@/components/admin/UsersTab'
import { ApiProvidersTab } from '@/components/admin/ApiProvidersTab'
import { SystemTab } from '@/components/admin/SystemTab'

const ADMIN_ID = '911d1666-978b-4ead-9be2-5a49028c767f'

export default function AdminPage() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user || user.id !== ADMIN_ID) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie usuários, APIs e sistema da plataforma.</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="apis">APIs de IA</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <UsersTab />
        </TabsContent>

        <TabsContent value="apis" className="mt-0">
          <ApiProvidersTab />
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
