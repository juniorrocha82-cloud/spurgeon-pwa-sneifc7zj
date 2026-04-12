import React, { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image as ImageIcon, Copy, Share2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PreviewContentProps {
  title?: string
  text?: string
  devotional?: any
  verse?: any
  author?: string
  reference?: string
  onScreenshotStart?: () => void
  onScreenshotComplete?: () => void
}

export function PreviewContent({
  title,
  text,
  devotional,
  verse,
  author,
  reference,
  onScreenshotStart,
  onScreenshotComplete,
}: PreviewContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fallback de segurança para evitar o erro: "can't access property 'trim', t is undefined"
  const getSafeText = useCallback((t: any): string => {
    if (typeof t !== 'string') {
      if (t && typeof t.toString === 'function') {
        return t.toString().trim()
      }
      return ''
    }
    return t.trim()
  }, [])

  const rawText =
    text || devotional?.content?.reflection || devotional?.devotional_text || verse?.text
  const contentText = getSafeText(rawText)

  const rawTitle = title || devotional?.title
  const displayTitle = getSafeText(rawTitle)

  const rawReference = reference || devotional?.base_text || verse?.reference
  const displayReference = getSafeText(rawReference)

  const takeScreenshot = async () => {
    try {
      setIsGenerating(true)
      if (onScreenshotStart) onScreenshotStart()

      // Proteção garantida usando o fallback de string vazia em vez do trim direto vulnerável
      const t = rawText
      const cleanText = getSafeText(t)

      if (!cleanText) {
        toast({
          title: 'Conteúdo Vazio',
          description: 'Não há texto suficiente para gerar o preview.',
          variant: 'destructive',
        })
        return
      }

      // Simulação da geração de imagem
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Preview Gerado',
        description: 'O preview foi preparado com sucesso.',
      })
    } catch (error: any) {
      console.error('Erro ao gerar screenshot:', error)
      toast({
        title: 'Erro ao gerar imagem',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
      if (onScreenshotComplete) onScreenshotComplete()
    }
  }

  const handleCopy = () => {
    const fullText = [displayTitle, `"${contentText}"`, displayReference]
      .filter(Boolean)
      .join('\n\n')
    navigator.clipboard
      .writeText(fullText)
      .then(() =>
        toast({ title: 'Copiado!', description: 'Texto copiado para a área de transferência.' }),
      )
      .catch(() =>
        toast({ title: 'Erro', description: 'Falha ao copiar texto.', variant: 'destructive' }),
      )
  }

  const handleShare = async () => {
    const fullText = [displayTitle, `"${contentText}"`, displayReference]
      .filter(Boolean)
      .join('\n\n')
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: displayTitle || 'Spurgeon PWA',
          text: fullText,
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast({
            title: 'Erro',
            description: 'Não foi possível compartilhar.',
            variant: 'destructive',
          })
        }
      }
    } else {
      handleCopy()
    }
  }

  if (!contentText && !displayTitle) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
        Nenhum conteúdo disponível para preview.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-lg mx-auto animate-fade-in">
      <Card
        ref={contentRef}
        className="w-full overflow-hidden border-border shadow-elevation bg-card relative"
      >
        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-6 bg-gradient-to-b from-background to-accent/30">
          {displayTitle && (
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground/90 leading-tight">
              {displayTitle}
            </h3>
          )}

          {contentText && (
            <p className="font-serif text-lg md:text-xl leading-relaxed text-foreground/80 italic relative">
              <span className="text-4xl text-primary/20 absolute -top-4 -left-4 font-serif">"</span>
              {contentText}
              <span className="text-4xl text-primary/20 absolute -bottom-6 -right-4 font-serif">
                "
              </span>
            </p>
          )}

          {displayReference && (
            <div className="mt-6 pt-6 border-t border-border/50 w-full flex flex-col items-center justify-center">
              <p className="text-sm md:text-base font-bold text-primary uppercase tracking-widest">
                {displayReference}
              </p>
              {author && (
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {getSafeText(author)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3 w-full">
        <Button
          onClick={takeScreenshot}
          disabled={isGenerating || !contentText}
          className="flex-1 sm:flex-none min-w-[140px] shadow-subtle hover:shadow-elevation transition-all"
        >
          {isGenerating ? (
            <div className="w-4 h-4 mr-2 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4 mr-2" />
          )}
          {isGenerating ? 'Gerando...' : 'Gerar Imagem'}
        </Button>

        <Button
          variant="secondary"
          disabled={isGenerating || !contentText}
          className="flex-1 sm:flex-none min-w-[120px]"
          onClick={handleCopy}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar
        </Button>

        {typeof navigator.share === 'function' && (
          <Button
            variant="outline"
            disabled={isGenerating || !contentText}
            className="flex-1 sm:flex-none min-w-[120px]"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        )}
      </div>
    </div>
  )
}
