import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
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
  login: (email: string) => Promise<void>
  register: (email: string) => Promise<void>
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

  const register = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await registerUser(email)

      setUser(response.user)
      setToken(response.token)

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await loginUser(email)

      setUser(response.user)
      setToken(response.token)

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))

      // Pull data from server after login
      if (response.token) {
        try {
          const serverData = await pullData(response.token)
          // Merge server data with local data
          const localData = localStorage.getItem('appState')
          if (localData) {
            const parsed = JSON.parse(localData)
            // Server data takes precedence
            if (serverData.meditationSessions?.length) {
              parsed.meditationSessions = serverData.meditationSessions
            }
            localStorage.setItem('appState', JSON.stringify(parsed))
          }
        } catch (error) {
          console.error('Failed to pull data from server:', error)
        }
      }
    } catch (error) {
      throw error
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
