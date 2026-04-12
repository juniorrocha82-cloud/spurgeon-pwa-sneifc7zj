import { useState, useEffect, useMemo } from 'react'
import { Book as BookIcon, Share2, Copy, X, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { supabase } from '@/lib/supabase/client'

export default function BiblePage() {
  const { toast } = useToast()

  const [versions, setVersions] = useState<any[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('')

  const [books, setBooks] = useState<any[]>([])
  const [selectedBook, setSelectedBook] = useState<string>('')

  const [chapters, setChapters] = useState<any[]>([])
  const [selectedChapter, setSelectedChapter] = useState<string>('1')

  const [verses, setVerses] = useState<any[]>([])
  const [selectedVerses, setSelectedVerses] = useState<number[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const { data, error } = await supabase.from('bible_versions').select('*').order('name')
        if (error) throw error

        if (data && data.length > 0) {
          setVersions(data)
          setSelectedVersion(data[0].id)
        } else {
          setError(
            'Nenhuma versão da Bíblia encontrada no banco de dados. Por favor, importe os dados no painel administrativo.',
          )
          setLoading(false)
        }
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchVersions()
  }, [])

  useEffect(() => {
    if (!selectedVersion) return
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('bible_books')
          .select('*')
          .eq('version_id', selectedVersion)
          .order('book_number')

        if (error) throw error
        setBooks(data || [])
        if (data && data.length > 0) {
          const currentBook = books.find((b) => b.id === selectedBook)
          const match = currentBook
            ? data.find((b: any) => b.abbreviation === currentBook.abbreviation)
            : null
          setSelectedBook(match ? match.id : data[0].id)
        }
      } catch (err: any) {
        console.error(err)
      }
    }
    fetchBooks()
  }, [selectedVersion])

  useEffect(() => {
    if (!selectedBook) return
    const fetchChapters = async () => {
      try {
        const { data, error } = await supabase
          .from('bible_chapters')
          .select('*')
          .eq('book_id', selectedBook)
          .order('chapter_number')

        if (error) throw error
        setChapters(data || [])
        if (data && data.length > 0) {
          const chExists = data.find((c: any) => c.chapter_number.toString() === selectedChapter)
          if (!chExists) {
            setSelectedChapter('1')
          }
        }
      } catch (err: any) {
        console.error(err)
      }
    }
    fetchChapters()
  }, [selectedBook])

  useEffect(() => {
    if (!selectedBook || !selectedChapter || chapters.length === 0) return
    const fetchVerses = async () => {
      setLoading(true)
      setSelectedVerses([])
      try {
        const chapter = chapters.find((c: any) => c.chapter_number.toString() === selectedChapter)
        if (!chapter) {
          setVerses([])
          return
        }

        const { data, error } = await supabase
          .from('bible_verses')
          .select('*')
          .eq('chapter_id', chapter.id)
          .order('verse_number', { ascending: true })

        if (error) throw error
        setVerses(data || [])
      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVerses()
  }, [selectedChapter, chapters, selectedBook])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (!debouncedSearchTerm || !selectedVersion) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const fetchSearchResults = async () => {
      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from('bible_verses')
          .select(`
            id,
            verse_number,
            text,
            chapter:bible_chapters!inner(
              id,
              chapter_number,
              book:bible_books!inner(
                id,
                name,
                version_id
              )
            )
          `)
          .eq('chapter.book.version_id', selectedVersion)
          .ilike('text', `%${debouncedSearchTerm}%`)
          .limit(100)

        if (error) throw error
        setSearchResults(data || [])
      } catch (err: any) {
        console.error(err)
        toast({
          title: 'Erro na busca',
          description: 'Não foi possível realizar a busca.',
          variant: 'destructive',
        })
      } finally {
        setIsSearching(false)
      }
    }

    fetchSearchResults()
  }, [debouncedSearchTerm, selectedVersion, toast])

  const handleResultClick = (bookId: string, chapterNumber: number) => {
    setSelectedBook(bookId)
    setSelectedChapter(chapterNumber.toString())
    setSearchTerm('')
  }

  const currentBookData = useMemo(
    () => books.find((b) => b.id === selectedBook),
    [books, selectedBook],
  )
  const currentVersionData = useMemo(
    () => versions.find((v) => v.id === selectedVersion),
    [versions, selectedVersion],
  )

  const handleShare = async (action: 'share' | 'copy') => {
    if (selectedVerses.length === 0 || !currentBookData || !currentVersionData) return

    const sortedVerses = [...selectedVerses].sort((a, b) => a - b)
    const versesText = sortedVerses
      .map((vNum) => (verses.find((v) => v.verse_number === vNum)?.text || '').trim())
      .join(' ')

    const bookName = currentBookData.name
    const chapter = selectedChapter
    const versionAbbrev = currentVersionData.abbreviation

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
        await navigator.share({ title: shareTitle, text: fullText })
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          toast({
            title: 'Erro',
            description: 'Não foi possível compartilhar.',
            variant: 'destructive',
          })
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText)
        toast({ title: 'Copiado!', description: 'Versículo(s) copiado(s).' })
      } catch (e) {
        toast({ title: 'Erro', description: 'Não foi possível copiar.', variant: 'destructive' })
      }
    }
    setSelectedVerses([])
  }

  const handleCopyChapter = async () => {
    if (!currentBookData) return
    const text = verses.map((v) => `${v.verse_number} ${(v.text || '').trim()}`).join('\n')
    const fullText = `${currentBookData.name} ${selectedChapter}\n\n${text}\n\nLeia a Bíblia diariamente em:\nhttps://spurgeon.one`
    try {
      await navigator.clipboard.writeText(fullText)
      toast({ title: 'Copiado!', description: 'Capítulo copiado para a área de transferência.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o capítulo.',
        variant: 'destructive',
      })
    }
  }

  const handleShareChapter = async () => {
    if (!currentBookData) return
    const text = verses.map((v) => `${v.verse_number} ${(v.text || '').trim()}`).join('\n')
    const fullText = `${currentBookData.name} ${selectedChapter}\n\n${text}\n\nLeia a Bíblia diariamente em:\nhttps://spurgeon.one`
    try {
      await navigator.share({ title: `${currentBookData.name} ${selectedChapter}`, text: fullText })
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast({
          title: 'Erro',
          description: 'Não foi possível compartilhar.',
          variant: 'destructive',
        })
      }
    }
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
              Leia e medite na Palavra de Deus com navegação instantânea.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Versão</label>
            <Select
              value={selectedVersion}
              onValueChange={setSelectedVersion}
              disabled={loading || versions.length === 0}
            >
              <SelectTrigger className="bg-card border-border shadow-subtle h-12">
                <SelectValue placeholder="Selecione a versão" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Livro</label>
            <Select
              value={selectedBook}
              onValueChange={setSelectedBook}
              disabled={loading || books.length === 0}
            >
              <SelectTrigger className="bg-card border-border shadow-subtle h-12">
                <SelectValue placeholder="Selecione o livro" />
              </SelectTrigger>
              <SelectContent>
                {books.map((b) => (
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
              disabled={loading || chapters.length === 0}
            >
              <SelectTrigger className="bg-card border-border shadow-subtle h-12">
                <SelectValue placeholder="Capítulo" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((c) => (
                  <SelectItem key={c.id} value={c.chapter_number.toString()}>
                    Capítulo {c.chapter_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar versículo por texto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-card border-border shadow-subtle"
            disabled={loading || versions.length === 0}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Card className="overflow-hidden border-border/50 shadow-elevation bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 md:p-10 min-h-[400px] flex flex-col justify-center">
            {searchTerm ? (
              isSearching ? (
                <div className="space-y-4 w-full h-full">
                  <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="w-full h-full animate-fade-in">
                  <h2 className="text-xl font-serif font-bold text-foreground/90 mb-6 border-b border-border/50 pb-2">
                    Resultados para "{debouncedSearchTerm}"
                  </h2>
                  <div className="grid gap-4">
                    {searchResults.map((result: any) => (
                      <div
                        key={result.id}
                        className="p-4 rounded-lg bg-accent/50 hover:bg-accent cursor-pointer transition-colors border border-border/50 text-left"
                        onClick={() =>
                          handleResultClick(result.chapter.book.id, result.chapter.chapter_number)
                        }
                      >
                        <div className="text-sm font-bold text-primary mb-1">
                          {result.chapter.book.name} {result.chapter.chapter_number}:
                          {result.verse_number}
                        </div>
                        <div className="font-serif text-foreground/90">
                          "{(result.text || '').trim()}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12 w-full animate-fade-in">
                  <Search className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">
                    Nenhum resultado encontrado para "{debouncedSearchTerm}".
                  </p>
                </div>
              )
            ) : loading && verses.length === 0 ? (
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
                <p className="text-muted-foreground text-lg max-w-md">{error}</p>
              </div>
            ) : verses.length > 0 && currentBookData ? (
              <div className="relative w-full h-full animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground/90 mb-8 text-center border-b border-border/50 pb-4">
                  {currentBookData.name} {selectedChapter}
                </h2>
                <div className="font-serif text-lg md:text-xl leading-relaxed md:leading-[2.2] text-foreground/90 text-justify">
                  {verses.map((v) => {
                    const isSelected = selectedVerses.includes(v.verse_number)
                    return (
                      <span
                        key={v.id}
                        onClick={() => {
                          setSelectedVerses((prev) =>
                            prev.includes(v.verse_number)
                              ? prev.filter((id) => id !== v.verse_number)
                              : [...prev, v.verse_number],
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
                          {v.verse_number}
                        </sup>
                        {(v.text || '').trim()}
                      </span>
                    )
                  })}
                </div>

                <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-6"
                    onClick={handleCopyChapter}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copiar Capítulo
                  </Button>
                  {typeof navigator.share === 'function' && (
                    <Button className="w-full sm:w-auto h-12 px-6" onClick={handleShareChapter}>
                      <Share2 className="w-4 h-4 mr-2" /> Compartilhar Capítulo
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
              className="h-8 w-8 rounded-full ml-1"
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
