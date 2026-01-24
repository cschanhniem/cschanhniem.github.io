export type FoundationDay = {
  day: number
  title: string
  focus: string
  tasks: string[]
}

export type FoundationProgress = {
  startDate: string
  completedDays: number[]
}

export type SanghaCircle = {
  id: string
  name: string
  location: string
  language: 'vi' | 'en' | 'mixed'
  schedule: string
  focus: string[]
  capacity: number
  members: number
  isPublic: boolean
  description: string
}

export type CircleMembership = {
  circleId: string
  joinedAt: string
}

export type RetreatEvent = {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  tradition: string
  organizer: string
  link?: string
  description: string
  type: 'retreat' | 'meetup' | 'online'
}

export type TranslationSubmission = {
  id: string
  suttaId: string
  language: 'vi' | 'en'
  content: string
  notes?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export type MentorshipProfile = {
  id: string
  role: 'mentor' | 'mentee'
  name: string
  location?: string
  languages: string[]
  practiceYears: number
  availability: string
  focusAreas: string[]
  bio: string
}
