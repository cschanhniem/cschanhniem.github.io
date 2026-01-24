import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, MapPin, PlusCircle, CheckCircle2 } from 'lucide-react'
import { DEFAULT_CIRCLES } from '@/data/sangha-circles'
import type { SanghaCircle, CircleMembership } from '@/types/growth'
import { trackEvent } from '@/lib/analytics'
import { usePageMeta } from '@/lib/seo'

const CIRCLES_KEY = 'nhapluu_circles'
const MEMBERSHIP_KEY = 'nhapluu_circle_memberships'

function loadCircles(): SanghaCircle[] {
  const raw = localStorage.getItem(CIRCLES_KEY)
  if (!raw) return DEFAULT_CIRCLES
  try {
    return [...DEFAULT_CIRCLES, ...(JSON.parse(raw) as SanghaCircle[])]
  } catch {
    return DEFAULT_CIRCLES
  }
}

function saveCircles(circles: SanghaCircle[]) {
  const custom = circles.filter(c => !DEFAULT_CIRCLES.find(d => d.id === c.id))
  localStorage.setItem(CIRCLES_KEY, JSON.stringify(custom))
}

function loadMemberships(): CircleMembership[] {
  const raw = localStorage.getItem(MEMBERSHIP_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as CircleMembership[]
  } catch {
    return []
  }
}

function saveMemberships(memberships: CircleMembership[]) {
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(memberships))
}

export function SanghaCircles() {
  const { t } = useTranslation()
  const [circles, setCircles] = useState<SanghaCircle[]>(() => loadCircles())
  const [memberships, setMemberships] = useState<CircleMembership[]>(() => loadMemberships())
  const [filter, setFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  usePageMeta({
    title: t('growth.circles.metaTitle'),
    description: t('growth.circles.metaDescription')
  })

  const joinedIds = useMemo(() => new Set(memberships.map(m => m.circleId)), [memberships])

  const filtered = circles.filter(circle =>
    circle.name.toLowerCase().includes(filter.toLowerCase()) ||
    circle.location.toLowerCase().includes(filter.toLowerCase())
  )

  const handleJoin = (circle: SanghaCircle) => {
    if (joinedIds.has(circle.id)) {
      const next = memberships.filter(m => m.circleId !== circle.id)
      setMemberships(next)
      saveMemberships(next)
      return
    }
    const next = [...memberships, { circleId: circle.id, joinedAt: new Date().toISOString() }]
    setMemberships(next)
    saveMemberships(next)
    trackEvent('join_circle', { circleId: circle.id })
  }

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const newCircle: SanghaCircle = {
      id: `circle-${Date.now()}`,
      name: String(data.get('name') || ''),
      location: String(data.get('location') || ''),
      language: (data.get('language') as SanghaCircle['language']) || 'vi',
      schedule: String(data.get('schedule') || ''),
      focus: String(data.get('focus') || '').split(',').map(s => s.trim()).filter(Boolean),
      capacity: Number(data.get('capacity') || 10),
      members: 1,
      isPublic: true,
      description: String(data.get('description') || '')
    }
    const next = [newCircle, ...circles]
    setCircles(next)
    saveCircles(next)
    setShowCreate(false)
    form.reset()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('growth.circles.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('growth.circles.subtitle')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('growth.circles.search')}
          className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          {t('growth.circles.create')}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input name="name" required placeholder={t('growth.circles.form.name')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="location" required placeholder={t('growth.circles.form.location')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="schedule" required placeholder={t('growth.circles.form.schedule')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <select name="language" className="px-3 py-2 border border-input rounded-md bg-background">
              <option value="vi">VI</option>
              <option value="en">EN</option>
              <option value="mixed">MIX</option>
            </select>
            <input name="capacity" type="number" min={2} defaultValue={10} className="px-3 py-2 border border-input rounded-md bg-background" />
          </div>
          <input name="focus" placeholder={t('growth.circles.form.focus')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <textarea name="description" placeholder={t('growth.circles.form.description')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">
            {t('growth.circles.form.submit')}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(circle => {
          const joined = joinedIds.has(circle.id)
          const displayMembers = circle.members + (joined ? 1 : 0)
          const isFull = !joined && displayMembers >= circle.capacity
          return (
            <div key={circle.id} className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{circle.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {circle.location} • {circle.schedule}
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(circle)}
                  disabled={isFull}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                    joined ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t(joined ? 'growth.circles.joined' : isFull ? 'growth.circles.full' : 'growth.circles.join')}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{circle.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                {displayMembers}/{circle.capacity}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {t('growth.circles.language')}: {circle.language.toUpperCase()}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {circle.focus.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
