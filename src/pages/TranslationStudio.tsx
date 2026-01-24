import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertTriangle, Send, Sparkles } from 'lucide-react'
import type { TranslationSubmission } from '@/types/growth'
import { usePageMeta } from '@/lib/seo'

const STORAGE_KEY = 'nhapluu_translation_submissions'

function loadSubmissions(): TranslationSubmission[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as TranslationSubmission[]
  } catch {
    return []
  }
}

function saveSubmissions(items: TranslationSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function TranslationStudio() {
  const { t } = useTranslation()
  const [submissions, setSubmissions] = useState<TranslationSubmission[]>(() => loadSubmissions())
  const [reviewMode, setReviewMode] = useState(() => localStorage.getItem('nhapluu_reviewer') === 'true')

  usePageMeta({
    title: t('growth.translation.metaTitle'),
    description: t('growth.translation.metaDescription')
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const now = new Date().toISOString()
    const submission: TranslationSubmission = {
      id: `translation-${Date.now()}`,
      suttaId: String(data.get('suttaId') || ''),
      language: (data.get('language') as TranslationSubmission['language']) || 'vi',
      content: String(data.get('content') || ''),
      notes: String(data.get('notes') || ''),
      status: 'draft',
      createdAt: now,
      updatedAt: now
    }
    const next = [submission, ...submissions]
    setSubmissions(next)
    saveSubmissions(next)
    form.reset()
  }

  const updateStatus = (id: string, status: TranslationSubmission['status']) => {
    const next = submissions.map(s => (s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s))
    setSubmissions(next)
    saveSubmissions(next)
  }

  const toggleReviewMode = () => {
    const next = !reviewMode
    setReviewMode(next)
    localStorage.setItem('nhapluu_reviewer', next ? 'true' : 'false')
  }

  const pending = useMemo(() => submissions.filter(s => s.status === 'submitted'), [submissions])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('growth.translation.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('growth.translation.subtitle')}
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {t('growth.translation.newSubmission')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input name="suttaId" required placeholder={t('growth.translation.form.suttaId')} className="px-3 py-2 border border-input rounded-md bg-background" />
            <select name="language" className="px-3 py-2 border border-input rounded-md bg-background">
              <option value="vi">{t('growth.translation.form.vi')}</option>
              <option value="en">{t('growth.translation.form.en')}</option>
            </select>
          </div>
          <textarea name="content" required placeholder={t('growth.translation.form.content')} className="w-full min-h-[160px] px-3 py-2 border border-input rounded-md bg-background" />
          <textarea name="notes" placeholder={t('growth.translation.form.notes')} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">
            <Sparkles className="h-4 w-4" />
            {t('growth.translation.form.saveDraft')}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">
          {t('growth.translation.mySubmissions')}
        </h2>
        <button
          onClick={toggleReviewMode}
          className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium"
        >
          {t(reviewMode ? 'growth.translation.disableReview' : 'growth.translation.enableReview')}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {submissions.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">{item.suttaId.toUpperCase()}</p>
                <p className="text-sm text-foreground">{item.language.toUpperCase()}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {t(`growth.translation.status.${item.status}`)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {item.content}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {item.status === 'draft' && (
                <button
                  onClick={() => updateStatus(item.id, 'submitted')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                >
                  <Send className="h-3 w-3" />
                  {t('growth.translation.submit')}
                </button>
              )}
              {reviewMode && item.status === 'submitted' && (
                <>
                  <button
                    onClick={() => updateStatus(item.id, 'approved')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs font-medium"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {t('growth.translation.approve')}
                  </button>
                  <button
                    onClick={() => updateStatus(item.id, 'rejected')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-medium"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {t('growth.translation.reject')}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviewMode && (
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('growth.translation.reviewPanel')}
          </h3>
          {pending.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('growth.translation.noPending')}
            </p>
          )}
          {pending.length > 0 && (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pending.map(item => (
                <li key={item.id}>
                  {item.suttaId.toUpperCase()} • {item.language.toUpperCase()} • {t('growth.translation.status.submitted')}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
