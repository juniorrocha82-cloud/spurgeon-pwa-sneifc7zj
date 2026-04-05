import { useState, useEffect, useMemo } from 'react'
import { Book as BookIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

const VERSIONS = [{ id: 'almeida', name: 'João Ferreira de Almeida' }]

const BIBLE_BOOKS = [
  { id: 'gen', name: 'Gênesis', chapters: 50 },
  { id: 'exo', name: 'Êxodo', chapters: 40 },
  { id: 'lev', name: 'Levítico', chapters: 27 },
  { id: 'num', name: 'Números', chapters: 36 },
  { id: 'deu', name: 'Deuteronômio', chapters: 34 },
  { id: 'jos', name: 'Josué', chapters: 24 },
  { id: 'jdg', name: 'Juízes', chapters: 21 },
  { id: 'rut', name: 'Rute', chapters: 4 },
  { id: '1sa', name: '1 Samuel', chapters: 31 },
  { id: '2sa', name: '2 Samuel', chapters: 24 },
  { id: '1ki', name: '1 Reis', chapters: 22 },
  { id: '2ki', name: '2 Reis', chapters: 25 },
  { id: '1ch', name: '1 Crônicas', chapters: 29 },
  { id: '2ch', name: '2 Crônicas', chapters: 36 },
  { id: 'ezr', name: 'Esdras', chapters: 10 },
  { id: 'neh', name: 'Neemias', chapters: 13 },
  { id: 'est', name: 'Ester', chapters: 10 },
  { id: 'job', name: 'Jó', chapters: 42 },
  { id: 'psa', name: 'Salmos', chapters: 150 },
  { id: 'pro', name: 'Provérbios', chapters: 31 },
  { id: 'ecc', name: 'Eclesiastes', chapters: 12 },
  { id: 'sng', name: 'Cânticos', chapters: 8 },
  { id: 'isa', name: 'Isaías', chapters: 66 },
  { id: 'jer', name: 'Jeremias', chapters: 52 },
  { id: 'lam', name: 'Lamentações', chapters: 5 },
  { id: 'ezk', name: 'Ezequiel', chapters: 48 },
  { id: 'dan', name: 'Daniel', chapters: 12 },
  { id: 'hos', name: 'Oséias', chapters: 14 },
  { id: 'jol', name: 'Joel', chapters: 3 },
  { id: 'amo', name: 'Amós', chapters: 9 },
  { id: 'oba', name: 'Obadias', chapters: 1 },
  { id: 'jon', name: 'Jonas', chapters: 4 },
  { id: 'mic', name: 'Miquéias', chapters: 7 },
  { id: 'nam', name: 'Naum', chapters: 3 },
  { id: 'hab', name: 'Habacuque', chapters: 3 },
  { id: 'zep', name: 'Sofonias', chapters: 3 },
  { id: 'hag', name: 'Ageu', chapters: 2 },
  { id: 'zec', name: 'Zacarias', chapters: 14 },
  { id: 'mal', name: 'Malaquias', chapters: 4 },
  { id: 'mat', name: 'Mateus', chapters: 28 },
  { id: 'mrk', name: 'Marcos', chapters: 16 },
  { id: 'luk', name: 'Lucas', chapters: 24 },
  { id: 'jn', name: 'João', chapters: 21 },
  { id: 'act', name: 'Atos', chapters: 28 },
  { id: 'rom', name: 'Romanos', chapters: 16 },
  { id: '1co', name: '1 Coríntios', chapters: 16 },
  { id: '2co', name: '2 Coríntios', chapters: 13 },
  { id: 'gal', name: 'Gálatas', chapters: 6 },
  { id: 'eph', name: 'Efésios', chapters: 6 },
  { id: 'php', name: 'Filipenses', chapters: 4 },
  { id: 'col', name: 'Colossenses', chapters: 4 },
  { id: '1th', name: '1 Tessalonicenses', chapters: 5 },
  { id: '2th', name: '2 Tessalonicenses', chapters: 3 },
  { id: '1ti', name: '1 Timóteo', chapters: 6 },
  { id: '2ti', name: '2 Timóteo', chapters: 4 },
  { id: 'tit', name: 'Tito', chapters: 3 },
  { id: 'phm', name: 'Filemom', chapters: 1 },
  { id: 'heb', name: 'Hebreus', chapters: 13 },
  { id: 'jas', name: 'Tiago', chapters: 5 },
  { id: '1pe', name: '1 Pedro', chapters: 5 },
  { id: '2pe', name: '2 Pedro', chapters: 3 },
  { id: '1jn', name: '1 João', chapters: 5 },
  { id: '2jn', name: '2 João', chapters: 1 },
  { id: '3jn', name: '3 João', chapters: 1 },
  { id: 'jud', name: 'Judas', chapters: 1 },
  { id: 'rev', name: 'Apocalipse', chapters: 22 },
]

interface BibleVerse {
  verse: number
  text: string
}

export default function BiblePage() {
  const { toast } = useToast()

  const [verses, setVerses] = useState<BibleVerse[]>([])

  const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0].id)
  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS[0].id)
  const [selectedChapter, setSelectedChapter] = useState('1')

  const [loadingVerses, setLoadingVerses] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const currentBook = useMemo(() => BIBLE_BOOKS.find((b) => b.id === selectedBook), [selectedBook])

  const chapterOptions = useMemo(
    () => Array.from({ length: currentBook?.chapters || 1 }, (_, i) => (i + 1).toString()),
    [currentBook],
  )

  useEffect(() => {
    if (currentBook && parseInt(selectedChapter) > currentBook.chapters) {
      setSelectedChapter('1')
    }
  }, [selectedBook, currentBook, selectedChapter])

  useEffect(() => {
    if (!selectedBook || !selectedChapter || !selectedVersion) return

    const fetchVerses = async () => {
      try {
        setLoadingVerses(true)
        setError(null)
        const response = await fetch(
          `https://bible-api.com/${selectedBook}+${selectedChapter}?translation=${selectedVersion}`,
        )
        if (!response.ok) {
          if (response.status === 404) throw new Error('Capítulo não encontrado nesta versão.')
          throw new Error(`Falha ao carregar versículos (Status: ${response.status}).`)
        }
        const data = await response.json()
        if (!data || !data.verses) throw new Error('Dados do capítulo inválidos.')
        setVerses(data.verses || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Erro ao carregar o capítulo.')
        toast({
          title: 'Erro de Leitura',
          description: err.message || 'Erro ao carregar o capítulo.',
          variant: 'destructive',
        })
        setVerses([])
      } finally {
        setLoadingVerses(false)
      }
    }

    fetchVerses()
  }, [selectedVersion, selectedBook, selectedChapter, retryCount, toast])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
          <BookIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Bíblia Sagrada</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Leia e medite na Palavra de Deus com uma interface limpa e confortável.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground pl-1">Versão</label>
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
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
          <Select value={selectedBook} onValueChange={setSelectedBook}>
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
            disabled={!selectedBook}
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
          {loadingVerses ? (
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
                Recarregar Capítulo
              </button>
            </div>
          ) : verses.length > 0 ? (
            <div className="relative w-full h-full animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground/90 mb-8 text-center border-b border-border/50 pb-4">
                {currentBook?.name} {selectedChapter}
              </h2>
              <div className="font-serif text-lg md:text-xl leading-relaxed md:leading-[2.2] text-foreground/90 text-justify">
                {verses.map((v) => (
                  <span key={v.verse} className="mr-2 inline-block mb-1">
                    <sup className="text-primary font-sans font-bold mr-1.5 select-none text-[0.65rem] md:text-xs">
                      {v.verse}
                    </sup>
                    {v.text}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
