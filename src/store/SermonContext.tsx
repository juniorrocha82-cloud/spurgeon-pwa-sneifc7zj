import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type SermonPoint = {
  title: string
  text: string
}

export type SermonContent = {
  intro: string
  points: SermonPoint[]
  conclusion: string
}

export type Sermon = {
  id: string
  title: string
  baseText: string
  version: string
  duration: number
  date: string
  content: SermonContent
  insights: string[]
  references: string[]
}

interface SermonContextType {
  sermons: Sermon[]
  addSermon: (sermon: Sermon) => void
  getSermon: (id: string) => Sermon | undefined
  deleteSermon: (id: string) => void
}

const SermonContext = createContext<SermonContextType | undefined>(undefined)

import { fetchUserSermons, deleteSermonFromDb } from '@/services/sermons'
import { useAuth } from '@/hooks/use-auth'

export function SermonProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSermons()
    } else {
      setSermons([])
      setIsLoading(false)
    }
  }, [user])

  const loadSermons = async () => {
    try {
      setIsLoading(true)
      const data = await fetchUserSermons()
      setSermons(data)
    } catch (error) {
      console.error('Failed to fetch sermons', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSermon = (sermon: Sermon) => {
    setSermons((prev) => [sermon, ...prev])
  }

  const getSermon = (id: string) => {
    return sermons.find((s) => s.id === id)
  }

  const deleteSermon = async (id: string) => {
    try {
      await deleteSermonFromDb(id)
      setSermons((prev) => prev.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Failed to delete sermon', error)
      throw error
    }
  }

  return (
    <SermonContext.Provider value={{ sermons, addSermon, getSermon, deleteSermon }}>
      {children}
    </SermonContext.Provider>
  )
}

export function useSermonStore() {
  const context = useContext(SermonContext)
  if (context === undefined) {
    throw new Error('useSermonStore must be used within a SermonProvider')
  }
  return context
}
