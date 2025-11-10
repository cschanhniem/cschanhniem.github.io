import type { MeditationSession, PreceptsRecord, ProgramProgress } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

interface User {
  id: string
  email: string
}

interface AuthResponse {
  success: boolean
  user: User
  token: string
}

interface SyncData {
  meditationSessions?: MeditationSession[]
  preceptsRecords?: PreceptsRecord[]
  programProgress?: ProgramProgress
}

// Auth API
export async function registerUser(email: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Registration failed')
  }

  return response.json()
}

export async function loginUser(email: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }

  return response.json()
}

// Meditation API
export async function getMeditations(token: string): Promise<MeditationSession[]> {
  const response = await fetch(`${API_BASE}/api/meditations`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch meditation sessions')
  }

  const data = await response.json()
  return data.sessions || []
}

export async function createMeditation(
  token: string,
  session: Omit<MeditationSession, 'id'>
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${API_BASE}/api/meditations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(session)
  })

  if (!response.ok) {
    throw new Error('Failed to create meditation session')
  }

  return response.json()
}

// Sync API
export async function syncData(
  token: string,
  data: SyncData,
  lastSync: number
): Promise<{ success: boolean; synced_at: number }> {
  const response = await fetch(`${API_BASE}/api/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ data, lastSync })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Sync failed')
  }

  return response.json()
}

// Pull data from server
export async function pullData(token: string): Promise<SyncData> {
  const sessions = await getMeditations(token)

  return {
    meditationSessions: sessions
  }
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/`)
  return response.json()
}
