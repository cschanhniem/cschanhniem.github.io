// Meditation Session Types
export interface MeditationSession {
  id: string
  date: string // ISO date string
  duration: number // minutes
  type: 'anapanasati' | 'vipassana' | 'walking' | 'other'
  notes?: string
  quality?: 1 | 2 | 3 | 4 | 5 // 1 = difficult, 5 = very good
  ambientSound?: 'rain' | 'forest' | 'temple' | 'stream' // v5: ambient sound used
}

// Precepts Tracking
export interface PreceptsRecord {
  id: string
  date: string
  type: 'five' | 'eight'
  precepts: {
    [key: number]: boolean // precept number to observance
  }
  notes?: string
}

// 90-Day Program
export interface ProgramProgress {
  startDate: string
  currentWeek: number
  completedDays: string[] // array of ISO date strings
  milestones: {
    week: number
    completed: boolean
    date?: string
  }[]
}

// Sutta Data
export interface Sutta {
  id: string
  code: string // e.g., "MN 118"
  title: string
  titlePali?: string
  collection: 'DN' | 'MN' | 'SN' | 'AN' | 'KN'
  summary: string
  summaryPali?: string // v5: Pāli summary for parallel display
  content?: string
  contentPali?: string // v5: Pāli content for parallel display
  themes: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

// Reading Progress (v5)
export interface SuttaProgress {
  suttaId: string
  scrollPosition: number // scroll percentage 0-100
  lastRead: string // ISO date
}

// Teaching Data (meditation manuals, commentaries)
export interface Teaching {
  id: string
  title: string
  titlePali?: string
  author: string
  translator?: string
  summary: string
  content: string
  themes: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'manual' | 'commentary' | 'discourse'
}

// User Stats
export interface UserStats {
  totalMeditations: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  preceptsDaysObserved: number
  programDaysCompleted: number
}

// Insight Journal Entry
export interface InsightEntry {
  id: string
  date: string
  title?: string
  content: string
  contemplation?: 'anicca' | 'dukkha' | 'anatta' | 'general'
  tags?: string[]
}

// App State
export interface AppState {
  meditationSessions: MeditationSession[]
  preceptsRecords: PreceptsRecord[]
  programProgress: ProgramProgress | null
  insightEntries: InsightEntry[]
  bookmarkedSuttas: string[]
  settings: {
    theme: 'light' | 'dark'
    language: 'vi' | 'en'
  }
}
