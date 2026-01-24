import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { suttas } from '@/data/suttas/index'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { ChevronLeft, Bookmark, Type, Minus, Plus, Columns, FileText } from 'lucide-react'
import { useAppState } from '@/hooks/useAppState'
import { useKatexCSS } from '@/hooks/useKatexCSS'

// Lazy load PrintButton to reduce initial bundle size
const PrintButton = lazy(() => import('@/components/PrintButton').then(m => ({ default: m.PrintButton })))
import { DhammaShareCard } from '@/components/growth/DhammaShareCard'
import { usePageMeta } from '@/lib/seo'
import { trackEvent } from '@/lib/analytics'

type FontSize = 'small' | 'medium' | 'large'
type ViewMode = 'single' | 'parallel'

const fontSizeClasses: Record<FontSize, string> = {
  small: 'prose-sm',
  medium: 'prose-base',
  large: 'prose-lg'
}

export function SuttaDetail() {
  const { suttaId } = useParams<{ suttaId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state, toggleBookmark } = useAppState()
  useKatexCSS()
  const [shareQuote, setShareQuote] = useState('')
  const [hasTrackedRead, setHasTrackedRead] = useState(false)

  // Reading settings
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('nhapluu_font_size')
    return (saved as FontSize) || 'medium'
  })
  const [viewMode, setViewMode] = useState<ViewMode>('single')

  // Reading progress
  const [progress, setProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const progressKey = `nhapluu_progress_${suttaId}`
  const lastReadKey = `nhapluu_lastread_${suttaId}`

  // Save font size preference
  useEffect(() => {
    localStorage.setItem('nhapluu_font_size', fontSize)
  }, [fontSize])

  // Load saved scroll position
  useEffect(() => {
    const savedProgress = localStorage.getItem(progressKey)
    if (savedProgress && contentRef.current) {
      const scrollTop = (parseFloat(savedProgress) / 100) * contentRef.current.scrollHeight
      window.scrollTo(0, scrollTop)
    }
  }, [progressKey])

  // Track reading progress
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return

    const element = contentRef.current
    const scrollTop = window.scrollY - element.offsetTop
    const scrollHeight = element.scrollHeight - window.innerHeight
    const newProgress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))

    setProgress(newProgress)
    localStorage.setItem(progressKey, newProgress.toString())
    localStorage.setItem(lastReadKey, Date.now().toString())

    if (!hasTrackedRead && newProgress >= 80 && suttaId) {
      setHasTrackedRead(true)
      trackEvent('read_sutta', { suttaId, progress: Math.round(newProgress) })
    }
  }, [progressKey, lastReadKey, hasTrackedRead, suttaId])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const sutta = suttas.find((s) => s.id === suttaId)
  const suttaSummary = sutta?.summary ?? ''

  usePageMeta({
    title: sutta ? sutta.title : t('library.notFound'),
    description: sutta?.summary || t('library.metaDescription'),
    url: sutta ? `/phap-bao/${sutta.id}` : undefined,
    jsonLd: sutta
      ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: sutta.title,
        description: sutta.summary,
        author: {
          '@type': 'Organization',
          name: 'NhapLuu'
        }
      }
      : undefined,
    jsonLdId: sutta ? `sutta-${sutta.id}` : 'sutta-missing'
  })

  useEffect(() => {
    if (suttaSummary) {
      setShareQuote(suttaSummary)
    }
  }, [suttaSummary])

  if (!sutta) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('library.notFound')}</h1>
          <Link to="/phap-bao" className="text-primary hover:underline">
            ← {t('library.backToLibrary')}
          </Link>
        </div>
      </div>
    )
  }

  const hasPaliContent = !!sutta.contentPali

  const cycleFontSize = (direction: 'up' | 'down') => {
    const sizes: FontSize[] = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf(fontSize)
    if (direction === 'up' && currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    } else if (direction === 'down' && currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }

  const proseClasses = `
    prose prose-slate max-w-none ${fontSizeClasses[fontSize]}
    prose-headings:font-bold prose-headings:text-foreground
    prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8 prose-h1:border-b prose-h1:border-border prose-h1:pb-2
    prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
    prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
    prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-3
    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
    prose-strong:text-foreground prose-strong:font-semibold
    prose-em:text-foreground prose-em:italic
    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
    prose-li:text-foreground prose-li:mb-1
    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
    prose-blockquote:text-muted-foreground prose-blockquote:my-4
    prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
    prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
    prose-a:text-primary prose-a:underline prose-a:hover:text-primary/80
    prose-hr:border-border prose-hr:my-8
    prose-table:border-collapse prose-table:w-full
    prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2
    prose-td:border prose-td:border-border prose-td:p-2
  `

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50 print:hidden">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        onClick={() => navigate('/phap-bao')}
        className="flex items-center gap-2 text-primary hover:underline mb-6 print:hidden"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('library.backToLibrary')}
      </button>

      {/* Printable Wrapper */}
      <div ref={printRef} className="print:p-4">
        {/* Header Card */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6 print:border-none print:shadow-none print:p-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-sm text-primary font-medium mb-2">{sutta.code}</div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{sutta.title}</h1>
              {sutta.titlePali && (
                <p className="text-lg text-muted-foreground italic font-serif mb-4">
                  {sutta.titlePali}
                </p>
              )}
            </div>
            <button
              onClick={() => toggleBookmark(sutta.id)}
              className="p-2 hover:bg-muted rounded-md transition-colors print:hidden"
              aria-label={
                state.bookmarkedSuttas.includes(sutta.id)
                  ? t('library.removeBookmark')
                  : t('library.addBookmark')
              }
            >
              <Bookmark
                className={`h-6 w-6 ${state.bookmarkedSuttas.includes(sutta.id)
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground'
                  }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 print:hidden">
            {sutta.themes.map((theme) => (
              <span
                key={theme}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-md mb-6 print:bg-gray-50 print:text-black">
            <p className="text-foreground font-medium">{sutta.summary}</p>
          </div>

          <div className="mb-6 print:hidden">
            <DhammaShareCard
              quote={shareQuote}
              source={`${sutta.code} • ${sutta.title}`}
              onQuoteChange={setShareQuote}
            />
          </div>

          {/* Reading Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border print:hidden">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Font Size Control */}
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mr-2">{t('library.fontSize')}</span>
                <button
                  onClick={() => cycleFontSize('down')}
                  disabled={fontSize === 'small'}
                  className="p-1.5 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium w-16 text-center">
                  {t(`library.fontSizes.${fontSize}`)}
                </span>
                <button
                  onClick={() => cycleFontSize('up')}
                  disabled={fontSize === 'large'}
                  className="p-1.5 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* View Mode Toggle (only if Pāli content available) */}
              {hasPaliContent && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('single')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'single'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <FileText className="h-4 w-4" />
                    {t('library.singleView')}
                  </button>
                  <button
                    onClick={() => setViewMode('parallel')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'parallel'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Columns className="h-4 w-4" />
                    {t('library.parallelView')}
                  </button>
                </div>
              )}
            </div>

            {/* Print & Progress */}
            <div className="flex items-center gap-4">
              <Suspense fallback={<div className="w-8 h-8" />}>
                <PrintButton contentRef={printRef} title={sutta.title} />
              </Suspense>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t('library.progress')}: {Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="bg-card rounded-lg border border-border p-6 print:border-none print:shadow-none print:p-0">
          {viewMode === 'parallel' && hasPaliContent ? (
            // Parallel View
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pāli Column */}
              <div className="border-r border-border pr-6">
                <div className="sticky top-4 mb-4 print:static">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded print:border print:border-gray-200">
                    Pāli
                  </span>
                </div>
                <article className={`${proseClasses} font-serif print:prose-black`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {sutta.contentPali || ''}
                  </ReactMarkdown>
                </article>
              </div>

              {/* Vietnamese Column */}
              <div className="pl-6">
                <div className="sticky top-4 mb-4 print:static">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded print:border print:border-gray-200">
                    Việt
                  </span>
                </div>
                <article className={`${proseClasses} print:prose-black`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {sutta.content || ''}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          ) : (
            // Single View
            <article className={`${proseClasses} print:prose-black`}>
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{sutta.content || ''}</ReactMarkdown>
            </article>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex justify-between print:hidden">
        <button
          onClick={() => navigate('/phap-bao')}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('library.backToLibrary')}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-primary hover:underline"
        >
          {t('library.backToTop')} ↑
        </button>
      </div>
    </div>
  )
}
