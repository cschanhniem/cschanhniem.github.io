import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { buildPracticeMinutesByDate } from '@/components/charts/practice-data'

interface WeeklyChartProps {
  sessions: Array<{ date: string; duration: number }>
  checkIns: Array<{ date: Date; duration: number }>
}

export function WeeklyChart({ sessions, checkIns }: WeeklyChartProps) {
  const { t, i18n } = useTranslation()

  const data = useMemo(() => {
    const now = new Date()
    const minutesByDate = buildPracticeMinutesByDate(sessions, checkIns)
    const formatter = new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'short',
    })
    const days: Array<{ key: string; name: string; minutes: number; isToday: boolean }> = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateKey = date.toISOString().slice(0, 10)

      days.push({
        key: dateKey,
        name: formatter.format(date),
        minutes: minutesByDate.get(dateKey) || 0,
        isToday: i === 0,
      })
    }

    return days
  }, [sessions, checkIns, i18n.language])

  const totalMinutes = data.reduce((sum, day) => sum + day.minutes, 0)
  const avgMinutes = Math.round(totalMinutes / 7)
  const maxMinutes = Math.max(...data.map((day) => day.minutes), 1)

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t('dashboard.weeklyChart.title')}
        </h3>
        <div className="text-sm text-muted-foreground">
          {t('dashboard.weeklyChart.avg')}: <span className="font-medium text-primary">{avgMinutes}</span>{' '}
          {t('dashboard.weeklyChart.minPerDay')}
        </div>
      </div>

      <div className="h-48 rounded-lg bg-muted/20 p-4">
        <div className="grid h-full grid-cols-7 gap-3">
          {data.map((day) => {
            const heightPercent = day.minutes > 0 ? Math.max(10, Math.round((day.minutes / maxMinutes) * 100)) : 0

            return (
              <div key={day.key} className="flex h-full flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{day.minutes}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-md transition-[height,transform] duration-300 ${
                      day.isToday ? 'bg-primary' : 'bg-primary/60'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.name}: ${day.minutes} ${t('dashboard.weeklyChart.minutes')}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/60" />
          <span>{t('dashboard.weeklyChart.previous')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>{t('dashboard.weeklyChart.today')}</span>
        </div>
      </div>
    </div>
  )
}
