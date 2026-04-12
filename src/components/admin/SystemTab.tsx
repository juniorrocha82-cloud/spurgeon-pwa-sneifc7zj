import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function SystemTab() {
  const { toast } = useToast()
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

  return (
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
  )
}
