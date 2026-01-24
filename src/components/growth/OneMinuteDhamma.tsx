import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Volume2, PauseCircle, BookOpen } from 'lucide-react'
import { suttas } from '@/data/suttas/index'
import { trackEvent } from '@/lib/analytics'
import { useTranslation } from 'react-i18next'

function getDayIndex() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return diff
}

export function OneMinuteDhamma() {
  const { t } = useTranslation()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  const dailySutta = useMemo(() => {
    const index = getDayIndex() % suttas.length
    return suttas[index]
  }, [])

  const summary = dailySutta?.summary || ''

  const handleSpeak = () => {
    if (!summary || !canSpeak) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(summary)
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
    trackEvent('one_minute_dhamma_play', { suttaId: dailySutta.id })
  }

  if (!dailySutta) return null

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('growth.oneMinute.label')}
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            {dailySutta.title}
          </h3>
          <p className="text-xs text-muted-foreground">{dailySutta.code}</p>
        </div>
        <button
          onClick={handleSpeak}
          disabled={!canSpeak}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('growth.oneMinute.listen')}
        >
          {isSpeaking ? <PauseCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {t(isSpeaking ? 'growth.oneMinute.stop' : 'growth.oneMinute.listen')}
        </button>
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-4">
        {summary}
      </p>
      <Link
        to={`/phap-bao/${dailySutta.id}`}
        className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
        onClick={() => trackEvent('read_sutta', { suttaId: dailySutta.id, source: 'one_minute' })}
      >
        <BookOpen className="h-4 w-4" />
        {t('growth.oneMinute.readMore')}
      </Link>
    </div>
  )
}
