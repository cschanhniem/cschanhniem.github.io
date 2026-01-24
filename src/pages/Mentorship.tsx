import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Sparkles } from 'lucide-react'
import type { MentorshipProfile } from '@/types/growth'
import { usePageMeta } from '@/lib/seo'

const STORAGE_KEY = 'nhapluu_mentorship_profiles'

function loadProfiles(): MentorshipProfile[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as MentorshipProfile[]
  } catch {
    return []
  }
}

function saveProfiles(items: MentorshipProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function Mentorship() {
  const { t } = useTranslation()
  const [profiles, setProfiles] = useState<MentorshipProfile[]>(() => loadProfiles())
  const [filter, setFilter] = useState<'all' | 'mentor' | 'mentee'>('all')

  usePageMeta({
    title: t('growth.mentorship.metaTitle'),
    description: t('growth.mentorship.metaDescription')
  })

  const filtered = useMemo(
    () => (filter === 'all' ? profiles : profiles.filter(p => p.role === filter)),
    [profiles, filter]
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const profile: MentorshipProfile = {
      id: `mentor-${Date.now()}`,
      role: (data.get('role') as MentorshipProfile['role']) || 'mentor',
      name: String(data.get('name') || ''),
      location: String(data.get('location') || ''),
      languages: String(data.get('languages') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      practiceYears: Number(data.get('practiceYears') || 0),
      availability: String(data.get('availability') || ''),
      focusAreas: String(data.get('focusAreas') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      bio: String(data.get('bio') || '')
    }
    const next = [profile, ...profiles]
    setProfiles(next)
    saveProfiles(next)
    form.reset()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('growth.mentorship.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('growth.mentorship.subtitle')}
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {t('growth.mentorship.create')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input name="name" required placeholder={t('growth.mentorship.form.name')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <select name="role" className="px-3 py-2 border border-input rounded-md bg-background">
              <option value="mentor">{t('growth.mentorship.form.mentor')}</option>
              <option value="mentee">{t('growth.mentorship.form.mentee')}</option>
            </select>
            <input name="location" placeholder={t('growth.mentorship.form.location')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="languages" placeholder={t('growth.mentorship.form.languages')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="practiceYears" type="number" min={0} placeholder={t('growth.mentorship.form.practiceYears')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <input name="availability" placeholder={t('growth.mentorship.form.availability')} className="px-3 py-2 border border-input rounded-md bg-background" />
          </div>
          <input name="focusAreas" placeholder={t('growth.mentorship.form.focusAreas')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <textarea name="bio" placeholder={t('growth.mentorship.form.bio')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">
            <Sparkles className="h-4 w-4" />
            {t('growth.mentorship.form.submit')}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(['all', 'mentor', 'mentee'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {t(`growth.mentorship.filters.${type}`)}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(profile => (
          <div key={profile.id} className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {t(`growth.mentorship.role.${profile.role}`)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {profile.bio}
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('growth.mentorship.location')}: {profile.location || t('growth.mentorship.unknown')}</div>
              <div>{t('growth.mentorship.languages')}: {profile.languages.join(', ') || '-'}</div>
              <div>{t('growth.mentorship.practiceYears')}: {profile.practiceYears}</div>
              <div>{t('growth.mentorship.availability')}: {profile.availability}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.focusAreas.map(area => (
                <span key={area} className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                  {area}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
