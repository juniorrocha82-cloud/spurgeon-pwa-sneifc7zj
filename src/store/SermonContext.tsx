import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchUserSermons, deleteSermonFromDb } from '@/services/sermons'
import { useAuth } from '@/hooks/use-auth'

export interface SermonContent {
  intro: string
  proposition?: string
  points: { title: string; text: string }[]
  illustration?: string
  conclusion: string
}

export interface Sermon {
  id: string
  title: string
  baseText: string
  version: string
  duration: number
  sermonType: string
  content: SermonContent
  insights: string[]
  references: string[]
  date: string
}

interface SermonContextType {
  sermons: Sermon[]
  addSermon: (sermon: Sermon) => void
  deleteSermon: (id: string) => void
  loading: boolean
}

const SermonContext = createContext<SermonContextType | undefined>(undefined)

export const SermonProvider = ({ children }: { children: ReactNode }) => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Offline support: Load from local storage first
      const cached = localStorage.getItem(`sermons_${user.id}`)
      if (cached) {
        try {
          setSermons(JSON.parse(cached))
        } catch (e) {
          console.error('Failed to parse cached sermons', e)
        }
      }

      // Fetch fresh data
      fetchUserSermons()
        .then((data) => {
          setSermons(data)
          localStorage.setItem(`sermons_${user.id}`, JSON.stringify(data))
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching sermons, relying on cache', err)
          setLoading(false)
        })
    } else {
      setSermons([])
      setLoading(false)
    }
  }, [user])

  const addSermon = (sermon: Sermon) => {
    setSermons((prev) => {
      const updated = [sermon, ...prev]
      if (user) localStorage.setItem(`sermons_${user.id}`, JSON.stringify(updated))
      return updated
    })
  }

  const deleteSermon = async (id: string) => {
    try {
      await deleteSermonFromDb(id)
      setSermons((prev) => {
        const updated = prev.filter((s) => s.id !== id)
        if (user) localStorage.setItem(`sermons_${user.id}`, JSON.stringify(updated))
        return updated
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <SermonContext.Provider value={{ sermons, addSermon, deleteSermon, loading }}>
      {children}
    </SermonContext.Provider>
  )
}

export const useSermonStore = () => {
  const context = useContext(SermonContext)
  if (!context) throw new Error('useSermonStore must be used within SermonProvider')
  return context
}
