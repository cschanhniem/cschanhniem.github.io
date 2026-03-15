import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { buildPracticeMinutesByDate } from '@/components/charts/practice-data'

interface HeatmapCalendarProps {
  sessions: Array<{ date: string; duration: number }>
  checkIns: Array<{ date: Date; duration: number }>
}

export function HeatmapCalendar({ sessions, checkIns }: HeatmapCalendarProps) {
  const { t, i18n } = useTranslation()

  const data = useMemo(() => {
    const now = new Date()
    const minutesByDate = buildPracticeMinutesByDate(sessions, checkIns)
    const formatter = new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' })
    const calendar: Array<{
      date: string
      minutes: number
      level: 0 | 1 | 2 | 3 | 4
      month: string
      day: number
    }> = []

    // Generate last 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().slice(0, 10)
      const totalMinutes = minutesByDate.get(dateStr) || 0

      // Determine intensity level
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (totalMinutes > 0) level = 1
      if (totalMinutes >= 15) level = 2
      if (totalMinutes >= 30) level = 3
      if (totalMinutes >= 60) level = 4

      calendar.push({
        date: dateStr,
        minutes: totalMinutes,
        level,
        month: formatter.format(date),
        day: date.getDate()
      })
    }

    return calendar
  }, [sessions, checkIns, i18n.language])

  // Group by weeks (7 days each)
  const weeks = useMemo(() => {
    const result: typeof data[] = []
    for (let i = 0; i < data.length; i += 7) {
      result.push(data.slice(i, i + 7))
    }
    return result
  }, [data])

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; col: number }> = []
    let lastMonth = ''
    data.forEach((d, i) => {
      if (d.month !== lastMonth) {
        labels.push({ month: d.month, col: Math.floor(i / 7) })
        lastMonth = d.month
      }
    })
    return labels
  }, [data])

  const dayLabels = i18n.language === 'vi'
    ? ['', 'T2', '', 'T4', '', 'T6', '']
    : ['', 'Mon', '', 'Wed', '', 'Fri', '']

  const levelColors = [
    'bg-muted',
    'bg-primary/25',
    'bg-primary/50',
    'bg-primary/75',
    'bg-primary'
  ]

  const activeDays = data.filter(d => d.minutes > 0).length
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0)

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t('dashboard.heatmap.title')}
        </h3>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">{activeDays}</span> {t('dashboard.heatmap.activeDays')} • <span className="font-medium text-primary">{totalMinutes}</span> {t('dashboard.heatmap.totalMin')}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex ml-8 mb-1 text-xs text-muted-foreground">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="absolute"
                style={{ marginLeft: `${label.col * 14 + 32}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex gap-1 mt-6">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1 text-xs text-muted-foreground">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-3 w-6 text-right pr-1 leading-3">
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${levelColors[day.level]} transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50`}
                    title={`${day.date}: ${day.minutes} ${t('dashboard.heatmap.minutes')}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>{t('dashboard.heatmap.less')}</span>
        {levelColors.map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>{t('dashboard.heatmap.more')}</span>
      </div>
    </div>
  )
}
