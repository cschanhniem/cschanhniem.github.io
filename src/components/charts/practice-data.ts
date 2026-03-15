export interface PracticeSession {
  date: string
  duration: number
}

export interface PracticeCheckIn {
  date: Date
  duration: number
}

function getDayKey(value: string | Date): string {
  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  return value.toISOString().slice(0, 10)
}

export function buildPracticeMinutesByDate(
  sessions: PracticeSession[],
  checkIns: PracticeCheckIn[]
): Map<string, number> {
  const minutesByDate = new Map<string, number>()

  for (const session of sessions) {
    const key = getDayKey(session.date)
    minutesByDate.set(key, (minutesByDate.get(key) || 0) + session.duration)
  }

  for (const checkIn of checkIns) {
    const key = getDayKey(checkIn.date)
    minutesByDate.set(key, (minutesByDate.get(key) || 0) + checkIn.duration)
  }

  return minutesByDate
}
