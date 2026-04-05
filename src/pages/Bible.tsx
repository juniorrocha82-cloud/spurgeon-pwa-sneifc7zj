import { useState, useEffect, useMemo } from 'react'
import { Book } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const VERSIONS = [
  { id: 'NVI', name: 'NVI - Nova Versão Internacional' },
  { id: 'ARA', name: 'ARA - Almeida Revista e Atualizada' },
  { id: 'ARC', name: 'ARC - Almeida Revista e Corrigida' },
  { id: 'NVT', name: 'NVT - Nova Versão Transformadora' },
]

const BOOKS = [
  { id: 'gen', name: 'Gênesis', chapters: 50 },
  { id: 'exo', name: 'Êxodo', chapters: 40 },
  { id: 'psa', name: 'Salmos', chapters: 150 },
  { id: 'pro', name: 'Provérbios', chapters: 31 },
  { id: 'isa', name: 'Isaías', chapters: 66 },
  { id: 'mat', name: 'Mateus', chapters: 28 },
  { id: 'mrk', name: 'Marcos', chapters: 16 },
  { id: 'luk', name: 'Lucas', chapters: 24 },
  { id: 'jhn', name: 'João', chapters: 21 },
  { id: 'rom', name: 'Romanos', chapters: 16 },
  { id: 'rev', name: 'Apocalipse', chapters: 22 },
]

const generateMockVerses = (bookId: string, chapter: number) => {
  if (bookId === 'gen' && chapter === 1) {
    return [
      { number: 1, text: 'No princípio criou Deus os céus e a terra.' },
      {
        number: 2,
        text: 'A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.',
      },
      { number: 3, text: 'Disse Deus: Haja luz; e houve luz.' },
      { number: 4, text: 'E viu Deus que a luz era boa; e fez separação entre a luz e as trevas.' },
      {
        number: 5,
        text: 'Chamou Deus à luz Dia e às trevas, Noite. Houve tarde e manhã, o primeiro dia.',
      },
      {
        number: 6,
        text: 'E disse Deus: Haja um firmamento no meio das águas, que separe águas de águas.',
      },
      {
        number: 7,
        text: 'Fez, pois, Deus o firmamento e separou as águas que estavam debaixo do firmamento das que estavam por cima do firmamento. E assim se fez.',
      },
      {
        number: 8,
        text: 'E chamou Deus ao firmamento Céus. E foi a tarde e a manhã, o dia segundo.',
      },
      {
        number: 9,
        text: 'E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca; e assim foi.',
      },
      {
        number: 10,
        text: 'E chamou Deus à porção seca Terra; e ao ajuntamento das águas chamou Mares; e viu Deus que era bom.',
      },
    ]
  }

  const bookName = BOOKS.find((b) => b.id === bookId)?.name
  return Array.from({ length: 15 }).map((_, i) => ({
    number: i + 1,
    text: `Este é o texto simulado para o versículo ${i + 1} do capítulo ${chapter} do livro de ${bookName}. A formatação tipográfica foi pensada para proporcionar uma leitura confortável, mantendo o foco na Palavra e minimizando distrações.`,
  }))
}

export default function BiblePage() {
  const [selectedVersion, setSelectedVersion] = useState(VERSIONS[0].id)
  const [selectedBook, setSelectedBook] = useState(BOOKS[0].id)
  const [selectedChapter, setSelectedChapter] = useState('1')
  const [loading, setLoading] = useState(false)

  const currentBook = useMemo(
    () => BOOKS.find((b) => b.id === selectedBook) || BOOKS[0],
    [selectedBook],
  )
  const chapterOptions = useMemo(
    () => Array.from({ length: currentBook.chapters }, (_, i) => (i + 1).toString()),
    [currentBook],
  )

  const verses = useMemo(
    () => generateMockVerses(selectedBook, parseInt(selectedChapter)),
    [selectedBook, selectedChapter],
  )

  useEffect(() => {
    if (parseInt(selectedChapter) > currentBook.chapters) {
      setSelectedChapter('1')
    }
  }, [selectedBook, currentBook.chapters, selectedChapter])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [selectedVersion, selectedBook, selectedChapter])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
          <Book className="w-8 h-8 text-primary" />
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
              {BOOKS.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground pl-1">Capítulo</label>
          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
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
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className={`h-6 ${i % 2 === 0 ? 'w-full' : 'w-[90%]'}`} />
              ))}
            </div>
          ) : (
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground/90 mb-8 text-center border-b border-border/50 pb-4">
                {currentBook.name} {selectedChapter}
              </h2>
              <div className="font-serif text-lg md:text-xl leading-relaxed md:leading-[2.2] text-foreground/90 text-justify">
                {verses.map((v) => (
                  <span key={v.number} className="mr-2">
                    <sup className="text-primary font-sans font-bold mr-1 select-none text-[0.65rem] md:text-xs">
                      {v.number}
                    </sup>
                    {v.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
