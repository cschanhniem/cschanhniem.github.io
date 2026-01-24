import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, MapPin, PlusCircle, ExternalLink } from 'lucide-react'
import { DEFAULT_RETREATS } from '@/data/retreats'
import type { RetreatEvent } from '@/types/growth'
import { usePageMeta } from '@/lib/seo'

const STORAGE_KEY = 'nhapluu_retreats'

function loadRetreats(): RetreatEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_RETREATS
  try {
    return [...DEFAULT_RETREATS, ...(JSON.parse(raw) as RetreatEvent[])]
  } catch {
    return DEFAULT_RETREATS
  }
}

function saveRetreats(retreats: RetreatEvent[]) {
  const custom = retreats.filter(r => !DEFAULT_RETREATS.find(d => d.id === r.id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
}

export function Retreats() {
  const { t } = useTranslation()
  const [retreats, setRetreats] = useState<RetreatEvent[]>(() => loadRetreats())
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<'all' | RetreatEvent['type']>('all')

  usePageMeta({
    title: t('growth.retreats.metaTitle'),
    description: t('growth.retreats.metaDescription')
  })

  const filtered = useMemo(() => {
    const items = filter === 'all' ? retreats : retreats.filter(r => r.type === filter)
    return items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [retreats, filter])

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const newEvent: RetreatEvent = {
      id: `retreat-${Date.now()}`,
      title: String(data.get('title') || ''),
      location: String(data.get('location') || ''),
      startDate: String(data.get('startDate') || ''),
      endDate: String(data.get('endDate') || ''),
      tradition: String(data.get('tradition') || ''),
      organizer: String(data.get('organizer') || ''),
      link: String(data.get('link') || '') || undefined,
      description: String(data.get('description') || ''),
      type: (data.get('type') as RetreatEvent['type']) || 'retreat'
    }
    const next = [newEvent, ...retreats]
    setRetreats(next)
    saveRetreats(next)
    setShowCreate(false)
    form.reset()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('growth.retreats.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('growth.retreats.subtitle')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {(['all', 'retreat', 'meetup', 'online'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {t(`growth.retreats.filters.${type}`)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          {t('growth.retreats.create')}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input name="title" required placeholder={t('growth.retreats.form.title')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="location" required placeholder={t('growth.retreats.form.location')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="startDate" type="date" required className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="endDate" type="date" required className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="tradition" placeholder={t('growth.retreats.form.tradition')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="organizer" placeholder={t('growth.retreats.form.organizer')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <select name="type" className="px-3 py-2 border border-input rounded-md bg-background">
              <option value="retreat">{t('growth.retreats.filters.retreat')}</option>
              <option value="meetup">{t('growth.retreats.filters.meetup')}</option>
              <option value="online">{t('growth.retreats.filters.online')}</option>
            </select>
          </div>
          <input name="link" placeholder={t('growth.retreats.form.link')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <textarea name="description" placeholder={t('growth.retreats.form.description')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">
            {t('growth.retreats.form.submit')}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(event => (
          <div key={event.id} className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-lg font-semibold text-foreground mb-1">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarDays className="h-4 w-4" />
              {event.startDate} → {event.endDate}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            <div className="text-xs text-muted-foreground">
              {event.organizer} • {event.tradition}
            </div>
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-primary text-sm hover:underline"
              >
                {t('growth.retreats.visit')}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
