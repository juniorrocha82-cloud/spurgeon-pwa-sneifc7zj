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

const VERSIONS = [
  { id: 'nvi', name: 'NVI - Nova Versão Internacional' },
  { id: 'acf', name: 'ACF - Almeida Corrigida Fiel' },
  { id: 'ara', name: 'ARA - Almeida Revista e Atualizada' },
  { id: 'arc', name: 'ARC - Almeida Revista e Corrigida' },
]

interface BibleBook {
  abbrev: { pt: string }
  name: string
  chapters: number
}

interface BibleVerse {
  number: number
  text: string
}

export default function BiblePage() {
  const { toast } = useToast()

  const [books, setBooks] = useState<BibleBook[]>([])
  const [verses, setVerses] = useState<BibleVerse[]>([])

  const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0].id)
  const [selectedBook, setSelectedBook] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('1')

  const [loadingBooks, setLoadingBooks] = useState(true)
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentBook = useMemo(
    () => books.find((b) => b.abbrev.pt === selectedBook),
    [books, selectedBook],
  )

  const chapterOptions = useMemo(
    () => Array.from({ length: currentBook?.chapters || 1 }, (_, i) => (i + 1).toString()),
    [currentBook],
  )

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true)
        const response = await fetch('https://www.abibliadigital.com.br/api/books')
        if (!response.ok) throw new Error('Falha ao carregar livros')
        const data = await response.json()
        setBooks(data)
        if (data.length > 0) {
          setSelectedBook(data[0].abbrev.pt)
        }
      } catch (err: any) {
        toast({
          title: 'Erro de Conexão',
          description: 'Não foi possível carregar a lista de livros.',
          variant: 'destructive',
        })
      } finally {
        setLoadingBooks(false)
      }
    }
    fetchBooks()
  }, [toast])

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
          `https://www.abibliadigital.com.br/api/verses/${selectedVersion}/${selectedBook}/${selectedChapter}`,
        )
        if (!response.ok) {
          if (response.status === 404) throw new Error('Capítulo não encontrado nesta versão.')
          throw new Error('Falha ao carregar versículos.')
        }
        const data = await response.json()
        setVerses(data.verses || [])
      } catch (err: any) {
        setError(err.message)
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
  }, [selectedVersion, selectedBook, selectedChapter, toast])

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
          <Select
            value={selectedVersion}
            onValueChange={setSelectedVersion}
            disabled={loadingBooks}
          >
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
          <Select value={selectedBook} onValueChange={setSelectedBook} disabled={loadingBooks}>
            <SelectTrigger className="bg-card border-border shadow-subtle h-12">
              <SelectValue placeholder={loadingBooks ? 'Carregando...' : 'Selecione o livro'} />
            </SelectTrigger>
            <SelectContent>
              {books.map((b) => (
                <SelectItem key={b.abbrev.pt} value={b.abbrev.pt}>
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
            disabled={loadingBooks || !selectedBook}
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
        <CardContent className="p-6 md:p-10 min-h-[400px]">
          {loadingVerses || loadingBooks ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`h-6 ${i % 3 === 0 ? 'w-[95%]' : i % 2 === 0 ? 'w-full' : 'w-[90%]'}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <BookIcon className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg">{error}</p>
            </div>
          ) : verses.length > 0 ? (
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground/90 mb-8 text-center border-b border-border/50 pb-4">
                {currentBook?.name} {selectedChapter}
              </h2>
              <div className="font-serif text-lg md:text-xl leading-relaxed md:leading-[2.2] text-foreground/90 text-justify">
                {verses.map((v) => (
                  <span key={v.number} className="mr-2 inline-block mb-1">
                    <sup className="text-primary font-sans font-bold mr-1.5 select-none text-[0.65rem] md:text-xs">
                      {v.number}
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
