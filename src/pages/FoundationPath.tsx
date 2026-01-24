import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, PlayCircle, CalendarCheck2, RotateCcw } from 'lucide-react'
import type { FoundationProgress, FoundationDay } from '@/types/growth'
import { trackEvent } from '@/lib/analytics'
import { usePageMeta } from '@/lib/seo'

const STORAGE_KEY = 'nhapluu_foundation_path'

function loadProgress(): FoundationProgress | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as FoundationProgress
  } catch {
    return null
  }
}

function saveProgress(progress: FoundationProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function FoundationPath() {
  const { t } = useTranslation()
  const [progress, setProgress] = useState<FoundationProgress | null>(() => loadProgress())

  usePageMeta({
    title: t('growth.foundation.metaTitle'),
    description: t('growth.foundation.metaDescription')
  })

  const days = useMemo(
    () => t('growth.foundation.days', { returnObjects: true }) as FoundationDay[],
    [t]
  )

  const currentDay = useMemo(() => {
    if (!progress) return 1
    const start = new Date(progress.startDate)
    const diff = Math.floor((Date.now() - start.getTime()) / 86400000)
    return Math.min(7, Math.max(1, diff + 1))
  }, [progress])

  const completedDays = progress?.completedDays || []

  const handleStart = () => {
    const newProgress: FoundationProgress = {
      startDate: new Date().toISOString(),
      completedDays: []
    }
    saveProgress(newProgress)
    setProgress(newProgress)
    trackEvent('start_program', { program: 'foundation_7_day' })
  }

  const toggleComplete = (day: number) => {
    if (!progress) return
    const updated = completedDays.includes(day)
      ? completedDays.filter(d => d !== day)
      : [...completedDays, day]
    const next = { ...progress, completedDays: updated }
    saveProgress(next)
    setProgress(next)
    if (!completedDays.includes(day)) {
      trackEvent('complete_day', { program: 'foundation_7_day', day })
    }
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProgress(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('growth.foundation.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('growth.foundation.subtitle')}
        </p>
      </div>

      {!progress && (
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-4">
            {t('growth.foundation.intro')}
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            <PlayCircle className="h-5 w-5" />
            {t('growth.foundation.start')}
          </button>
        </div>
      )}

      {progress && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card rounded-lg border border-border p-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('growth.foundation.currentDay')}</p>
              <p className="text-xl font-semibold text-foreground">
                {t('growth.foundation.dayLabel', { day: currentDay })}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80"
            >
              <RotateCcw className="h-4 w-4" />
              {t('growth.foundation.reset')}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {days.map((day) => {
              const isCompleted = completedDays.includes(day.day)
              return (
                <div key={day.day} className="bg-card rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarCheck2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        {t('growth.foundation.dayLabel', { day: day.day })}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleComplete(day.day)}
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t(isCompleted ? 'growth.foundation.completed' : 'growth.foundation.markComplete')}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {day.focus}
                  </p>
                  <ul className="text-sm text-foreground space-y-1">
                    {day.tasks.map(task => (
                      <li key={task}>• {task}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
