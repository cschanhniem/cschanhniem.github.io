type AnalyticsEvent = {
  name: string
  timestamp: string
  payload?: Record<string, unknown>
}

const STORAGE_KEY = 'nhapluu_events'
const MAX_EVENTS = 500

function readEvents(): AnalyticsEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as AnalyticsEvent[]
  } catch {
    return []
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
}

export function trackEvent(name: string, payload?: Record<string, unknown>) {
  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    payload
  }

  const events = readEvents()
  events.push(event)
  writeEvents(events)

  if (typeof window !== 'undefined') {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    if (gtag) {
      gtag('event', name, payload || {})
    }
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT
  if (endpoint && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(event)], { type: 'application/json' })
    navigator.sendBeacon(endpoint, blob)
  }
}
