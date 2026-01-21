import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '@/hooks/useAppState'
import { useCheckIn } from '@/hooks/useCheckIn'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { Timer, MapPin, Flame, Clock, Zap, Award, CheckCircle2, Sparkles, Download, BookOpen, ArrowRight, BookText } from 'lucide-react'
import { WeeklyChart } from '@/components/charts/WeeklyChart'
import { HeatmapCalendar } from '@/components/charts/HeatmapCalendar'
import { suttas } from '@/data/suttas/index'

interface ReadingProgress {
  suttaId: string
  progress: number
  lastRead: number // timestamp
}

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { state, getStats } = useAppState()
  const { points, checkIns, doCheckIn, hasCheckedInToday, getTodayCheckIn } = useCheckIn()
  const stats = getStats()
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null)

  const checkedInToday = hasCheckedInToday()
  const todayCheckIn = getTodayCheckIn()
  const [lastReadSutta, setLastReadSutta] = useState<ReadingProgress | null>(null)

  // Get last read sutta from localStorage
  useEffect(() => {
    const progressKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('nhapluu_progress_')
    )

    if (progressKeys.length === 0) return

    // Find the most recently read sutta
    let mostRecent: ReadingProgress | null = null
    let maxTimestamp = 0

    progressKeys.forEach(key => {
      const suttaId = key.replace('nhapluu_progress_', '')
      const progress = parseFloat(localStorage.getItem(key) || '0')
      const timestampKey = `nhapluu_lastread_${suttaId}`
      const timestamp = parseInt(localStorage.getItem(timestampKey) || '0', 10)

      // Only show suttas that have been read (progress > 0)
      if (progress > 0 && timestamp > maxTimestamp) {
        maxTimestamp = timestamp
        mostRecent = { suttaId, progress, lastRead: timestamp }
      }
    })

    // If no timestamp, use most progress as fallback
    if (!mostRecent) {
      let maxProgress = 0
      progressKeys.forEach(key => {
        const suttaId = key.replace('nhapluu_progress_', '')
        const progress = parseFloat(localStorage.getItem(key) || '0')
        if (progress > maxProgress && progress > 0) {
          maxProgress = progress
          mostRecent = { suttaId, progress, lastRead: Date.now() }
        }
      })
    }

    setLastReadSutta(mostRecent)
  }, [])

  const handleCheckIn = () => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    const result = doCheckIn(null, 30) // Solo check-in for 30 mins
    if (result.success) {
      setCheckInMessage(result.message || t('dashboard.checkInSuccess'))
      setTimeout(() => setCheckInMessage(null), 3000)
    } else {
      setCheckInMessage(result.message || t('dashboard.alreadyCheckedIn'))
    }
  }

  // Handle protected route navigation
  const handleProtectedAction = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate('/auth', { state: { from: { pathname: path } } })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Check-in Hero Card */}
      <div className={`rounded-xl border-2 p-6 mb-8 ${checkedInToday
        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
        : 'bg-primary/5 border-primary/20'
        }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${checkedInToday ? 'bg-green-500' : 'bg-primary'
              }`}>
              {checkedInToday ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {checkedInToday ? t('dashboard.checkedIn') : t('dashboard.checkIn')}
              </h2>
              <p className="text-muted-foreground">
                {checkedInToday
                  ? `${todayCheckIn?.duration || 30} ${t('dashboard.practiceTime')} • ${t('dashboard.streakDays', { count: points.currentStreak })} 🔥`
                  : t('dashboard.practiceRecord')
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Points Display */}
            <div className="text-center px-4 py-2 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-1 text-primary">
                <Zap className="h-4 w-4" />
                <span className="text-2xl font-bold">{points.totalPoints}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t('dashboard.stats.points')}</span>
            </div>

            {!checkedInToday && (
              <Button size="lg" onClick={handleCheckIn} className="gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {t('dashboard.checkInNow')}
              </Button>
            )}
          </div>
        </div>

        {checkInMessage && (
          <div className="mt-4 text-center text-primary font-medium animate-pulse">
            {checkInMessage}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('dashboard.stats.checkIns')}</span>
            <Timer className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{points.checkIns}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('dashboard.stats.totalTime')}</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalMinutes}</div>
          <div className="text-xs text-muted-foreground mt-1">{t('dashboard.stats.minutes')}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('dashboard.stats.currentStreak')}</span>
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-3xl font-bold text-foreground">{points.currentStreak}</div>
          <div className="text-xs text-muted-foreground mt-1">{t('dashboard.stats.days')}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('dashboard.stats.badges')}</span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{points.badges.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{t('dashboard.stats.earned')}</div>
        </div>
      </div>

      {/* Continue Reading Section */}
      {lastReadSutta && (() => {
        const sutta = suttas.find(s => s.id === lastReadSutta.suttaId)
        if (!sutta) return null
        return (
          <div className="mb-8">
            <Link
              to={`/phap-bao/${sutta.id}`}
              className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary">{t('dashboard.continueReading.title')}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{sutta.code}</span>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{sutta.title}</h3>
                    {sutta.titlePali && (
                      <p className="text-sm text-muted-foreground italic font-serif truncate">{sutta.titlePali}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{Math.round(lastReadSutta.progress)}%</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.continueReading.progress')}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${lastReadSutta.progress}%` }}
                />
              </div>
            </Link>
          </div>
        )
      })()}

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <WeeklyChart sessions={state.meditationSessions} checkIns={checkIns} />
        <HeatmapCalendar sessions={state.meditationSessions} checkIns={checkIns} />
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t('dashboard.quickActions.title')}</h2>
          <div className="space-y-3">
            <Link to="/tim-sangha">
              <Button className="w-full justify-start bg-primary text-primary-foreground" size="lg">
                <MapPin className="mr-2 h-5 w-5" />
                {t('dashboard.quickActions.findSangha')}
              </Button>
            </Link>
            <Link to="/thien-dinh" onClick={(e) => handleProtectedAction(e, '/thien-dinh')}>
              <Button className="w-full justify-start" variant="outline">
                <Timer className="mr-2 h-4 w-4" />
                {t('dashboard.quickActions.startMeditation')}
              </Button>
            </Link>
            <Link to="/nhat-ky" onClick={(e) => handleProtectedAction(e, '/nhat-ky')}>
              <Button className="w-full justify-start" variant="outline">
                <BookText className="mr-2 h-4 w-4" />
                {t('dashboard.quickActions.insightJournal')}
              </Button>
            </Link>
            <a href="/nhapluu-book.pdf" download="con-duong-nhap-luu.pdf">
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('dashboard.quickActions.downloadBook')}
              </Button>
            </a>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t('dashboard.recentCheckIns.title')}</h2>
          {points.checkIns === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('dashboard.recentCheckIns.noCheckIns')}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-foreground">{t('dashboard.recentCheckIns.currentStreak')}</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.currentStreak} {t('dashboard.stats.days')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('dashboard.recentCheckIns.longestStreak')}</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.longestStreak} {t('dashboard.stats.days')}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">{t('dashboard.recentCheckIns.totalCheckIns')}</span>
                </div>
                <span className="text-sm font-bold text-primary">{points.checkIns}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stream-entry Summary (Nhập Dòng Giải Thoát) */}
      <div className="mt-12 bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          {t('dashboard.streamEntry.title')}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {t('dashboard.streamEntry.description')} Dòng chảy: Thiện hữu + Nghe Pháp →
          Như lý tác ý → Giới thanh tịnh → Hộ trì căn → Chánh niệm tỉnh giác → Đoạn triền cái →
          Định → Tuệ quán vô thường-khổ-vô ngã → Pháp nhãn khai mở.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">{t('dashboard.streamEntry.fourFactors')}</h3>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>Thiện hữu (SN 55.1)</li>
              <li>Nghe Diệu Pháp (MN 95, MN 47)</li>
              <li>Như lý tác ý (MN 2)</li>
              <li>Hành pháp & tùy pháp (MN 27, DN 2)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">{t('dashboard.streamEntry.pillars')}</h3>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              <li>Năm căn → năm lực (SN 48.10)</li>
              <li>Bảy giác chi quân bình (SN 46.14, MN 118)</li>
              <li>Quán duyên khởi & vô thường (SN 12.2, SN 12.15, SN 12.23)</li>
              <li>Giới & đời sống phạm hạnh thực chứng (DN 2, DN 31)</li>
            </ul>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium text-foreground">{t('dashboard.streamEntry.signs')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.streamEntry.signsDescription')}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('dashboard.streamEntry.reference')}{" "}
          <a
            href="https://budsas.net/dlpp/bai203/index.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            budsas.net • Bài 203
          </a>{" "}
          (liên kết ngoài – không lưu trữ nguyên văn để tôn trọng bản quyền dịch giả).
        </p>
      </div>

      {/* Daily Quote */}
      <div className="mt-8 bg-muted rounded-lg p-6 text-center">
        <blockquote className="text-lg italic text-foreground font-serif mb-2">
          "{t('dashboard.quote.pali')}"
        </blockquote>
        <p className="text-muted-foreground text-sm">
          {t('dashboard.quote.translation')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          — {t('dashboard.quote.source')}
        </p>
      </div>
    </div>
  )
}
