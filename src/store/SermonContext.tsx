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

export function SermonProvider({ children }: { children: ReactNode }) {
  const [sermons, setSermons] = useState<Sermon[]>(() => {
    const saved = localStorage.getItem('@spurgeon-sermons')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse sermons', e)
        return []
      }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('@spurgeon-sermons', JSON.stringify(sermons))
  }, [sermons])

  const addSermon = (sermon: Sermon) => {
    setSermons((prev) => [sermon, ...prev])
  }

  const getSermon = (id: string) => {
    return sermons.find((s) => s.id === id)
  }

  const deleteSermon = (id: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id))
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
