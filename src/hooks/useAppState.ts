import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppState, MeditationSession, PreceptsRecord, ProgramProgress, InsightEntry } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { syncData } from '@/lib/api'

const STORAGE_KEY = 'nhapluu-app-state'

const defaultState: AppState = {
  meditationSessions: [],
  preceptsRecords: [],
  programProgress: null,
  insightEntries: [],
  bookmarkedSuttas: [],
  settings: {
    theme: 'light',
    language: 'vi'
  }
}

export function useAppState() {
  const { token } = useAuth()
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultState
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)
  const syncTimerRef = useRef<number | undefined>(undefined)

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Auto-sync to cloud after 5 seconds of inactivity
  useEffect(() => {
    if (!token) return

    // Clear previous timer
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
    }

    // Set new timer
    syncTimerRef.current = window.setTimeout(() => {
      syncToCloud()
    }, 5000)

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
      }
    }
  }, [state, token])

  // Sync to cloud
  const syncToCloud = useCallback(async () => {
    if (!token || isSyncing) return

    setIsSyncing(true)
    try {
      await syncData(
        token,
        {
          meditationSessions: state.meditationSessions,
          preceptsRecords: state.preceptsRecords,
          programProgress: state.programProgress || undefined
        },
        lastSyncTime
      )
      setLastSyncTime(Date.now())
      console.log('✅ Synced to cloud')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [token, state, lastSyncTime, isSyncing])

  // Meditation Sessions
  const addMeditationSession = (session: Omit<MeditationSession, 'id'>) => {
    const newSession: MeditationSession = {
      ...session,
      id: Date.now().toString()
    }
    setState(prev => ({
      ...prev,
      meditationSessions: [newSession, ...prev.meditationSessions]
    }))
  }

  const deleteMeditationSession = (id: string) => {
    setState(prev => ({
      ...prev,
      meditationSessions: prev.meditationSessions.filter(s => s.id !== id)
    }))
  }

  // Precepts
  const addPreceptsRecord = (record: Omit<PreceptsRecord, 'id'>) => {
    const newRecord: PreceptsRecord = {
      ...record,
      id: Date.now().toString()
    }
    setState(prev => ({
      ...prev,
      preceptsRecords: [newRecord, ...prev.preceptsRecords]
    }))
  }

  // Program Progress
  const startProgram = () => {
    const newProgress: ProgramProgress = {
      startDate: new Date().toISOString(),
      currentWeek: 1,
      completedDays: [],
      milestones: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        completed: false
      }))
    }
    setState(prev => ({ ...prev, programProgress: newProgress }))
  }

  const markDayComplete = (date: string) => {
    setState(prev => {
      if (!prev.programProgress) return prev

      const completedDays = [...prev.programProgress.completedDays]
      if (!completedDays.includes(date)) {
        completedDays.push(date)
      }

      // Calculate current week based on start date
      const start = new Date(prev.programProgress.startDate)
      const current = new Date(date)
      const daysDiff = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const currentWeek = Math.min(Math.floor(daysDiff / 7) + 1, 12)

      return {
        ...prev,
        programProgress: {
          ...prev.programProgress,
          completedDays,
          currentWeek
        }
      }
    })
  }

  // Insights
  const addInsightEntry = (entry: Omit<InsightEntry, 'id'>) => {
    const newEntry: InsightEntry = {
      ...entry,
      id: Date.now().toString()
    }
    setState(prev => ({
      ...prev,
      insightEntries: [newEntry, ...prev.insightEntries]
    }))
  }

  const deleteInsightEntry = (id: string) => {
    setState(prev => ({
      ...prev,
      insightEntries: prev.insightEntries.filter(e => e.id !== id)
    }))
  }

  // Bookmarks
  const toggleBookmark = (suttaId: string) => {
    setState(prev => ({
      ...prev,
      bookmarkedSuttas: prev.bookmarkedSuttas.includes(suttaId)
        ? prev.bookmarkedSuttas.filter(id => id !== suttaId)
        : [...prev.bookmarkedSuttas, suttaId]
    }))
  }

  // Statistics
  const getStats = () => {
    const totalMeditations = state.meditationSessions.length
    const totalMinutes = state.meditationSessions.reduce((sum, s) => sum + s.duration, 0)

    // Calculate streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const sortedSessions = [...state.meditationSessions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const uniqueDates = [...new Set(sortedSessions.map(s => s.date.split('T')[0]))]

    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = new Date(uniqueDates[i])
      sessionDate.setHours(0, 0, 0, 0)

      if (i === 0) {
        const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 1) {
          currentStreak = 1
          tempStreak = 1
        }
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        const diffDays = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          tempStreak++
          if (i === 1 || currentStreak > 0) {
            currentStreak = tempStreak
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          tempStreak = 1
        }
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
    }
    if (currentStreak === 0 && longestStreak > 0) {
      currentStreak = 0
    }

    const preceptsDaysObserved = state.preceptsRecords.length
    const programDaysCompleted = state.programProgress?.completedDays.length || 0

    return {
      totalMeditations,
      totalMinutes,
      currentStreak,
      longestStreak,
      preceptsDaysObserved,
      programDaysCompleted
    }
  }

  return {
    state,
    addMeditationSession,
    deleteMeditationSession,
    addPreceptsRecord,
    startProgram,
    markDayComplete,
    addInsightEntry,
    deleteInsightEntry,
    toggleBookmark,
    getStats,
    syncToCloud,
    isSyncing
  }
}
