import { useState, useEffect, useMemo } from 'react'
import { Book as BookIcon, Share2, Copy, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

const VERSIONS = [
  { id: 'pt_acf', name: 'ACF (Almeida Corrigida Fiel)' },
  { id: 'pt_ara', name: 'ARA (Almeida Revista e Atualizada)' },
  { id: 'pt_nvi', name: 'NVI (Nova Versão Internacional)' },
]

const BIBLE_BOOKS = [
  { id: 'gn', name: 'Gênesis', chapters: 50 },
  { id: 'ex', name: 'Êxodo', chapters: 40 },
  { id: 'lv', name: 'Levítico', chapters: 27 },
  { id: 'nm', name: 'Números', chapters: 36 },
  { id: 'dt', name: 'Deuteronômio', chapters: 34 },
  { id: 'js', name: 'Josué', chapters: 24 },
  { id: 'jz', name: 'Juízes', chapters: 21 },
  { id: 'rt', name: 'Rute', chapters: 4 },
  { id: '1sm', name: '1 Samuel', chapters: 31 },
  { id: '2sm', name: '2 Samuel', chapters: 24 },
  { id: '1rs', name: '1 Reis', chapters: 22 },
  { id: '2rs', name: '2 Reis', chapters: 25 },
  { id: '1cr', name: '1 Crônicas', chapters: 29 },
  { id: '2cr', name: '2 Crônicas', chapters: 36 },
  { id: 'ed', name: 'Esdras', chapters: 10 },
  { id: 'ne', name: 'Neemias', chapters: 13 },
  { id: 'et', name: 'Ester', chapters: 10 },
  { id: 'job', name: 'Jó', chapters: 42 },
  { id: 'sl', name: 'Salmos', chapters: 150 },
  { id: 'pv', name: 'Provérbios', chapters: 31 },
  { id: 'ec', name: 'Eclesiastes', chapters: 12 },
  { id: 'ct', name: 'Cânticos', chapters: 8 },
  { id: 'is', name: 'Isaías', chapters: 66 },
  { id: 'jr', name: 'Jeremias', chapters: 52 },
  { id: 'lm', name: 'Lamentações', chapters: 5 },
  { id: 'ez', name: 'Ezequiel', chapters: 48 },
  { id: 'dn', name: 'Daniel', chapters: 12 },
  { id: 'os', name: 'Oséias', chapters: 14 },
  { id: 'jl', name: 'Joel', chapters: 3 },
  { id: 'am', name: 'Amós', chapters: 9 },
  { id: 'ob', name: 'Obadias', chapters: 1 },
  { id: 'jn', name: 'Jonas', chapters: 4 },
  { id: 'mq', name: 'Miquéias', chapters: 7 },
  { id: 'na', name: 'Naum', chapters: 3 },
  { id: 'hc', name: 'Habacuque', chapters: 3 },
  { id: 'sf', name: 'Sofonias', chapters: 3 },
  { id: 'ag', name: 'Ageu', chapters: 2 },
  { id: 'zc', name: 'Zacarias', chapters: 14 },
  { id: 'ml', name: 'Malaquias', chapters: 4 },
  { id: 'mt', name: 'Mateus', chapters: 28 },
  { id: 'mc', name: 'Marcos', chapters: 16 },
  { id: 'lc', name: 'Lucas', chapters: 24 },
  { id: 'jo', name: 'João', chapters: 21 },
  { id: 'at', name: 'Atos', chapters: 28 },
  { id: 'rm', name: 'Romanos', chapters: 16 },
  { id: '1co', name: '1 Coríntios', chapters: 16 },
  { id: '2co', name: '2 Coríntios', chapters: 13 },
  { id: 'gl', name: 'Gálatas', chapters: 6 },
  { id: 'ef', name: 'Efésios', chapters: 6 },
  { id: 'fp', name: 'Filipenses', chapters: 4 },
  { id: 'cl', name: 'Colossenses', chapters: 4 },
  { id: '1ts', name: '1 Tessalonicenses', chapters: 5 },
  { id: '2ts', name: '2 Tessalonicenses', chapters: 3 },
  { id: '1tm', name: '1 Timóteo', chapters: 6 },
  { id: '2tm', name: '2 Timóteo', chapters: 4 },
  { id: 'tt', name: 'Tito', chapters: 3 },
  { id: 'fm', name: 'Filemom', chapters: 1 },
  { id: 'hb', name: 'Hebreus', chapters: 13 },
  { id: 'tg', name: 'Tiago', chapters: 5 },
  { id: '1pe', name: '1 Pedro', chapters: 5 },
  { id: '2pe', name: '2 Pedro', chapters: 3 },
  { id: '1jo', name: '1 João', chapters: 5 },
  { id: '2jo', name: '2 João', chapters: 1 },
  { id: '3jo', name: '3 João', chapters: 1 },
  { id: 'jd', name: 'Judas', chapters: 1 },
  { id: 'ap', name: 'Apocalipse', chapters: 22 },
]

interface BibleBook {
  abbrev: string
  name: string
  chapters: string[][]
}

const bibleCache: Record<string, BibleBook[]> = {}

export default function BiblePage() {
  const { toast } = useToast()

  const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0].id)
  const [bibleData, setBibleData] = useState<BibleBook[] | null>(null)

  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[0].id)
  const [selectedChapter, setSelectedChapter] = useState('1')
  const [selectedVerses, setSelectedVerses] = useState<number[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setSelectedVerses([])
  }, [selectedBook, selectedChapter, selectedVersion])

  useEffect(() => {
    const fetchBible = async () => {
      if (bibleCache[selectedVersion]) {
        setBibleData(bibleCache[selectedVersion])
        return
      }

      try {
        setLoading(true)
        setError(null)
        let response = await fetch(
          `https://raw.githubusercontent.com/gpalleschi/holybible_api/master/json/${selectedVersion}.json`,
        )

        if (!response.ok) {
          response = await fetch(
            `https://raw.githubusercontent.com/gpalleschi/holybible_api/main/json/${selectedVersion}.json`,
          )
        }

        if (!response.ok) {
          throw new Error(`Falha ao baixar a versão da Bíblia (Status: ${response.status}).`)
        }
        const data = await response.json()
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Dados da Bíblia inválidos.')
        }
        bibleCache[selectedVersion] = data
        setBibleData(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Erro ao carregar a versão da Bíblia.')
        toast({
          title: 'Erro de Leitura',
          description: err.message || 'Erro ao carregar a versão da Bíblia.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBible()
  }, [selectedVersion, retryCount, toast])

  const currentStaticBook = useMemo(
    () => BIBLE_BOOKS.find((b) => b.id === selectedBook) || BIBLE_BOOKS[0],
    [selectedBook],
  )

  const currentJsonBook = useMemo(() => {
    if (!bibleData) return null
    return bibleData.find((b) => b.abbrev === selectedBook) || bibleData[0]
  }, [bibleData, selectedBook])

  const chapterOptions = useMemo(() => {
    const chaptersCount = currentJsonBook
      ? currentJsonBook.chapters.length
      : currentStaticBook.chapters
    return Array.from({ length: chaptersCount }, (_, i) => (i + 1).toString())
  }, [currentJsonBook, currentStaticBook])

  useEffect(() => {
    if (currentJsonBook && parseInt(selectedChapter) > currentJsonBook.chapters.length) {
      setSelectedChapter('1')
    }
  }, [currentJsonBook, selectedChapter])

  const verses = useMemo(() => {
    if (!currentJsonBook) return []
    const chapterIndex = parseInt(selectedChapter) - 1
    const chapterVerses = currentJsonBook.chapters[chapterIndex] || []
    return chapterVerses.map((text, index) => ({ verse: index + 1, text }))
  }, [currentJsonBook, selectedChapter])

  const handleShare = async (action: 'share' | 'copy') => {
    if (selectedVerses.length === 0) return

    const sortedVerses = [...selectedVerses].sort((a, b) => a - b)
    const versesText = sortedVerses
      .map((v) => verses.find((verse) => verse.verse === v)?.text)
      .join(' ')

    const bookName = currentStaticBook.name
    const chapter = selectedChapter
    const versionAbbrev = VERSIONS.find((v) => v.id === selectedVersion)?.name.split(' ')[0] || ''

    let verseRef = ''
    if (sortedVerses.length === 1) {
      verseRef = `${sortedVerses[0]}`
    } else {
      const isContinuous =
        sortedVerses[sortedVerses.length - 1] - sortedVerses[0] === sortedVerses.length - 1
      if (isContinuous) {
        verseRef = `${sortedVerses[0]}-${sortedVerses[sortedVerses.length - 1]}`
      } else {
        verseRef = sortedVerses.join(', ')
      }
    }

    const shareTitle = `${bookName} ${chapter}:${verseRef}`
    const shareText = `"${versesText}"\n\n${bookName} ${chapter}:${verseRef} (${versionAbbrev})`
    const shareUrl = 'https://spurgeon.one'
    const fullText = `${shareText}\n\nLeia a Bíblia diariamente em:\n${shareUrl}`

    if (action === 'share' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: fullText,
        })
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error(e)
          toast({
            title: 'Erro',
            description: 'Não foi possível compartilhar o versículo.',
            variant: 'destructive',
          })
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText)
        toast({
          title: 'Copiado!',
          description: 'Versículo(s) copiado(s) para a área de transferência.',
        })
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'Não foi possível copiar o texto.',
          variant: 'destructive',
        })
      }
    }
    setSelectedVerses([])
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
            <BookIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Bíblia Sagrada</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Leia e medite na Palavra de Deus com navegação offline instantânea.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Versão</label>
            <Select value={selectedVersion} onValueChange={setSelectedVersion} disabled={loading}>
              <SelectTrigger className="bg-card border-border shadow-subtle h-12">
                <SelectValue placeholder="Selecione a versão" />
              </SelectTrigger>
              <SelectContent>
                {VERSIONS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Livro</label>
            <Select value={selectedBook} onValueChange={setSelectedBook} disabled={loading}>
              <SelectTrigger className="bg-card border-border shadow-subtle h-12">
                <SelectValue placeholder="Selecione o livro" />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_BOOKS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Capítulo</label>
            <Select
              value={selectedChapter}
              onValueChange={setSelectedChapter}
              disabled={!selectedBook || loading}
            >
              <SelectTrigger className="bg-card border-border shadow-subtle h-12">
                <SelectValue placeholder="Capítulo" />
              </SelectTrigger>
              <SelectContent>
                {chapterOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    Capítulo {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden border-border/50 shadow-elevation bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 md:p-10 min-h-[400px] flex flex-col justify-center">
            {loading ? (
              <div className="space-y-4 w-full h-full">
                <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-6 ${i % 3 === 0 ? 'w-[95%]' : i % 2 === 0 ? 'w-full' : 'w-[90%]'}`}
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12 w-full animate-fade-in">
                <BookIcon className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-lg">{error}</p>
                <button
                  onClick={() => setRetryCount((r) => r + 1)}
                  className="mt-4 px-4 py-2 border border-border bg-card rounded-md shadow-sm hover:bg-accent transition-colors text-foreground"
                >
                  Recarregar Versão
                </button>
              </div>
            ) : verses.length > 0 ? (
              <div className="relative w-full h-full animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground/90 mb-8 text-center border-b border-border/50 pb-4">
                  {currentStaticBook.name} {selectedChapter}
                </h2>
                <div className="font-serif text-lg md:text-xl leading-relaxed md:leading-[2.2] text-foreground/90 text-justify">
                  {verses.map((v) => {
                    const isSelected = selectedVerses.includes(v.verse)
                    return (
                      <span
                        key={v.verse}
                        onClick={() => {
                          setSelectedVerses((prev) =>
                            prev.includes(v.verse)
                              ? prev.filter((id) => id !== v.verse)
                              : [...prev, v.verse],
                          )
                        }}
                        className={cn(
                          'mr-2 inline-block mb-1 cursor-pointer rounded px-1 transition-colors',
                          isSelected ? 'bg-primary/20 text-foreground' : 'hover:bg-accent',
                        )}
                      >
                        <sup
                          className={cn(
                            'font-sans font-bold mr-1.5 select-none text-[0.65rem] md:text-xs',
                            isSelected ? 'text-foreground' : 'text-primary',
                          )}
                        >
                          {v.verse}
                        </sup>
                        {v.text}
                      </span>
                    )
                  })}
                </div>

                <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center h-12 px-6"
                    onClick={async () => {
                      const text = verses.map((v) => `${v.verse} ${v.text}`).join('\n')
                      const fullText = `${currentStaticBook.name} ${selectedChapter}\n\n${text}\n\nLeia a Bíblia diariamente em:\nhttps://spurgeon.one`
                      try {
                        await navigator.clipboard.writeText(fullText)
                        toast({
                          title: 'Copiado!',
                          description: 'Capítulo copiado para a área de transferência.',
                        })
                      } catch (e) {
                        toast({
                          title: 'Erro',
                          description: 'Não foi possível copiar o capítulo.',
                          variant: 'destructive',
                        })
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Capítulo Completo
                  </Button>
                  {typeof navigator.share === 'function' && (
                    <Button
                      variant="default"
                      className="w-full sm:w-auto flex items-center justify-center h-12 px-6"
                      onClick={async () => {
                        const text = verses.map((v) => `${v.verse} ${v.text}`).join('\n')
                        const fullText = `${currentStaticBook.name} ${selectedChapter}\n\n${text}\n\nLeia a Bíblia diariamente em:\nhttps://spurgeon.one`
                        try {
                          await navigator.share({
                            title: `${currentStaticBook.name} ${selectedChapter}`,
                            text: fullText,
                          })
                        } catch (e: any) {
                          if (e.name !== 'AbortError') {
                            toast({
                              title: 'Erro',
                              description: 'Não foi possível compartilhar o capítulo.',
                              variant: 'destructive',
                            })
                          }
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar Capítulo
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12 w-full animate-fade-in">
                <p className="text-muted-foreground">Nenhum versículo encontrado neste capítulo.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedVerses.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-elevation rounded-full px-4 py-2 flex items-center space-x-2 md:space-x-4 animate-fade-in-up z-[9999]">
          <span className="text-sm font-medium bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
            {selectedVerses.length}
          </span>
          <span className="text-sm font-medium hidden sm:inline-block whitespace-nowrap">
            Selecionado(s)
          </span>
          <div className="flex items-center space-x-1 border-l border-border pl-2 md:pl-4">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-full px-3"
              onClick={() => handleShare('copy')}
            >
              <Copy className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline-block">Copiar</span>
            </Button>
            {typeof navigator.share === 'function' && (
              <Button
                size="sm"
                variant="default"
                className="h-8 rounded-full px-3"
                onClick={() => handleShare('share')}
              >
                <Share2 className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline-block">Compartilhar</span>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full ml-1 flex-shrink-0"
              onClick={() => setSelectedVerses([])}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
