import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { MeditationSession } from '@/types'
import { registerUser, loginUser, pullData } from '@/lib/api'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }

    setIsLoading(false)
  }, [])

  const register = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await registerUser(email, password)

      setUser(response.user)
      setToken(response.token)

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await loginUser(email, password)

      setUser(response.user)
      setToken(response.token)

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))

      // Pull data from server after login and merge with local
      if (response.token) {
        try {
          const serverData = await pullData(response.token)
          const localData = localStorage.getItem('nhapluu-app-state')

          if (serverData.meditationSessions?.length) {
            if (localData) {
              const parsed = JSON.parse(localData)
              // Merge: Server data takes precedence, but keep local data that's not on server
              const serverIds = new Set(serverData.meditationSessions.map(s => s.id))
              const localOnly = (parsed.meditationSessions as MeditationSession[] | undefined)?.filter((s) => !serverIds.has(s.id)) || []

              // Combine server data + local-only data, sorted by date
              const merged = [...serverData.meditationSessions, ...localOnly].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              )

              parsed.meditationSessions = merged
              localStorage.setItem('nhapluu-app-state', JSON.stringify(parsed))
              console.log(`✅ Synced: ${serverData.meditationSessions.length} from server + ${localOnly.length} local`)
            } else {
              // No local data, just use server data
              localStorage.setItem('nhapluu-app-state', JSON.stringify({
                meditationSessions: serverData.meditationSessions,
                preceptsRecords: [],
                programProgress: null,
                insightEntries: [],
                bookmarkedSuttas: [],
                settings: { theme: 'light', language: 'vi' }
              }))
              console.log(`✅ Loaded ${serverData.meditationSessions.length} sessions from server`)
            }
          }
        } catch (error) {
          console.error('Failed to pull data from server:', error)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    // Don't clear appState - keep local data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
