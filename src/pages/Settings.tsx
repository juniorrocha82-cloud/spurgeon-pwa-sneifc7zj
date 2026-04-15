import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Palette, Type, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchSettings, saveSettings, UserSettings } from '@/services/settings'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const FONTS = [
  { value: 'Arial', label: 'Arial (Padrão)' },
  { value: 'Times New Roman', label: 'Times New Roman (Clássico)' },
  { value: 'Georgia', label: 'Georgia (Elegante)' },
  { value: 'Verdana', label: 'Verdana (Moderna)' },
  { value: 'Courier New', label: 'Courier New (Máquina)' },
]

const COLORS = [
  { hex: '#d97706', name: 'Âmbar' },
  { hex: '#2563eb', name: 'Azul' },
  { hex: '#16a34a', name: 'Verde' },
  { hex: '#dc2626', name: 'Vermelho' },
  { hex: '#7c3aed', name: 'Roxo' },
  { hex: '#0f172a', name: 'Escuro' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    primaryColor: '#d97706',
    fontFamily: 'Arial',
  })

  useEffect(() => {
    if (user) {
      fetchSettings()
        .then((data) => {
          setSettings(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande', { description: 'O logo deve ter no máximo 2MB.' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setSettings((prev) => ({ ...prev, logoBase64: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logoBase64: undefined }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings(settings)
      toast.success('Configurações salvas!', {
        description: 'Seus estilos foram atualizados e serão aplicados nas próximas gerações.',
      })
    } catch (error) {
      toast.error('Erro ao salvar', { description: 'Tente novamente mais tarde.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        aria-busy="true"
        aria-label="Carregando configurações"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    )
  }

  return (
    <main
      className="flex-1 w-full max-w-3xl mx-auto pb-12 animate-fade-in-up"
      aria-labelledby="settings-title"
    >
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        onClick={() => navigate(-1)}
        aria-label="Voltar para a página anterior"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Voltar
      </Button>

      <header className="mb-8">
        <h1 id="settings-title" className="text-3xl font-serif font-bold text-foreground">
          Gerenciador de Estilos
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Defina as cores, fontes e logo padrão para suas apresentações.
        </p>
      </header>

      <div className="space-y-8">
        <Card
          className="border-border/50 shadow-sm"
          as="section"
          aria-labelledby="primary-color-title"
        >
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-serif" id="primary-color-title">
              <Palette className="w-5 h-5 mr-2 text-primary" aria-hidden="true" />
              Cor Primária
            </CardTitle>
            <CardDescription>
              Esta cor será usada nos títulos e elementos de destaque dos seus slides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-wrap gap-4"
              role="radiogroup"
              aria-label="Selecione a cor primária"
            >
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSettings({ ...settings, primaryColor: c.hex })}
                  role="radio"
                  aria-checked={settings.primaryColor === c.hex}
                  aria-label={`Selecionar cor ${c.name}`}
                  className={cn(
                    'w-12 h-12 rounded-full border-2 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus:outline-none focus:ring-2 focus:ring-offset-2',
                    settings.primaryColor === c.hex
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <div className="flex items-center gap-2 ml-4">
                <Label htmlFor="custom-color" className="text-sm font-medium">
                  Outra:
                </Label>
                <Input
                  id="custom-color"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-12 p-1 cursor-pointer focus-visible:ring-primary focus-visible:outline-none"
                  aria-label="Escolher uma cor primária personalizada"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border/50 shadow-sm"
          as="section"
          aria-labelledby="font-family-title"
        >
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-serif" id="font-family-title">
              <Type className="w-5 h-5 mr-2 text-primary" aria-hidden="true" />
              Fonte do Texto
            </CardTitle>
            <CardDescription>
              Escolha a fonte que mais combina com a identidade da sua igreja.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.fontFamily}
              onValueChange={(val) => setSettings({ ...settings, fontFamily: val })}
            >
              <SelectTrigger
                aria-label="Selecione a fonte principal dos textos da apresentação"
                className="w-full md:w-[300px] focus-visible:ring-primary focus-visible:outline-none"
              >
                <SelectValue placeholder="Selecione uma fonte" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card
          className="border-border/50 shadow-sm"
          as="section"
          aria-labelledby="logo-upload-title"
        >
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-serif" id="logo-upload-title">
              <ImageIcon className="w-5 h-5 mr-2 text-primary" aria-hidden="true" />
              Logo do Ministério
            </CardTitle>
            <CardDescription>
              Faça o upload do seu logo para que ele apareça automaticamente nos slides. (Máx 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              {settings.logoBase64 ? (
                <div className="relative group">
                  <div className="w-32 h-32 rounded-lg border border-border flex items-center justify-center bg-muted/30 p-2 overflow-hidden">
                    <img
                      src={settings.logoBase64}
                      alt="Pré-visualização do logo selecionado"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus:opacity-100"
                    onClick={handleRemoveLogo}
                    aria-label="Remover logo do ministério"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/10 text-muted-foreground"
                  aria-hidden="true"
                >
                  Sem logo
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Escolher Imagem
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                  aria-label="Fazer upload de um arquivo de imagem para o logo"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full md:w-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-busy={saving}
            aria-label="Salvar configurações de estilo"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-5 h-5 mr-2" aria-hidden="true" />
            )}
            Salvar Configurações
          </Button>
        </footer>
      </div>
    </main>
  )
}
