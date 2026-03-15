// Nikaya Detail Page
// Sutta detail view with version switching and comparison

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronLeft, Type, Minus, Plus, Bookmark, ExternalLink } from 'lucide-react'
import type { NikayaLanguage, NikayaVersionType, SCSuttaplex } from '@/types/nikaya'
import { NIKAYA_LANGUAGES, NIKAYA_COLLECTIONS } from '@/types/nikaya'
import { getSuttaMetadata } from '@/lib/suttacentralApi'
import { fetchLocalSuttaHtml, hasLocalContent, initLocalData } from '@/lib/suttacentralLocal'
import { getImprovedTranslation, hasImprovedTranslation } from '@/data/nikaya-improved'
import { normalizeSuttaId } from '@/data/nikaya-improved/availability'
import { NikayaVersionSwitcher } from '@/components/NikayaVersionSwitcher'
import { NikayaComparisonView } from '@/components/NikayaComparisonView'
import { useAppState } from '@/hooks/useAppState'
import { useKatexCSS } from '@/hooks/useKatexCSS'
import {
    getNikayaCollectionFromSuttaId,
    getNikayaCollectionPath,
    getNikayaDetailPath,
    isNikayaCollection,
    resolveNikayaBackPath,
} from '@/lib/nikaya-routes'
import { usePageMeta } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '@/lib/analytics'

type FontSize = 'small' | 'medium' | 'large'

const fontSizeClasses = {
    small: 'prose-sm',
    medium: 'prose-base',
    large: 'prose-lg'
}

export function NikayaDetail() {
    const { t } = useTranslation()
    const location = useLocation()
    const { collection: collectionParam, suttaId } = useParams<{ collection: string; suttaId: string }>()
    const navigate = useNavigate()
    const { state, toggleBookmark } = useAppState()
    useKatexCSS()
    const contentRef = useRef<HTMLDivElement>(null)
    const normalizedSuttaId = suttaId ? normalizeSuttaId(suttaId) : ''
    const inferredCollection = normalizedSuttaId ? getNikayaCollectionFromSuttaId(normalizedSuttaId) : null
    const routeCollection = collectionParam && isNikayaCollection(collectionParam) ? collectionParam : null
    const canonicalPath = normalizedSuttaId && inferredCollection
        ? getNikayaDetailPath(normalizedSuttaId, inferredCollection)
        : '/nikaya'
    const backPath = resolveNikayaBackPath(
        location.state,
        inferredCollection ? getNikayaCollectionPath(inferredCollection) : '/nikaya'
    )
    const coverage = {
        hasOriginalEn: normalizedSuttaId ? hasLocalContent(normalizedSuttaId, 'en') : false,
        hasOriginalVi: normalizedSuttaId ? hasLocalContent(normalizedSuttaId, 'vi') : false,
        hasImprovedVi: normalizedSuttaId ? hasImprovedTranslation(normalizedSuttaId, 'vi') : false,
    }
    const hasCompleteTriad = coverage.hasOriginalEn && coverage.hasOriginalVi && coverage.hasImprovedVi

    // Sutta metadata
    const [metadata, setMetadata] = useState<SCSuttaplex | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [manifestReady, setManifestReady] = useState(false)

    // Initialize local data manifest
    useEffect(() => {
        initLocalData().then(() => setManifestReady(true))
    }, [])

    // Version state
    const [selectedVersion, setSelectedVersion] = useState<{ lang: NikayaLanguage; type: NikayaVersionType }>({
        lang: 'vi',
        type: 'original'
    })
    const [secondVersion, setSecondVersion] = useState<{ lang: NikayaLanguage; type: NikayaVersionType }>({
        lang: 'vi',
        type: 'improved'
    })
    const [comparisonMode, setComparisonMode] = useState(false)

    // Content
    const [primaryContent, setPrimaryContent] = useState<string>('')
    const [secondaryContent, setSecondaryContent] = useState<string>('')
    const [loadingContent, setLoadingContent] = useState(false)

    // Reading settings
    const [fontSize, setFontSize] = useState<FontSize>(() => {
        const saved = localStorage.getItem('nhapluu_font_size')
        return (saved as FontSize) || 'medium'
    })
    const [progress, setProgress] = useState(0)
    const [hasTrackedRead, setHasTrackedRead] = useState(false)

    // Available versions
    const [availableVersions, setAvailableVersions] = useState<{
        lang: NikayaLanguage
        type: NikayaVersionType
        author: string
        available: boolean
    }[]>([])

    const getPreferredAvailableVersion = useCallback((
        versions: typeof availableVersions,
        preferred?: { lang: NikayaLanguage; type: NikayaVersionType },
        exclude?: { lang: NikayaLanguage; type: NikayaVersionType }
    ) => {
        const preferredMatch = preferred
            ? versions.find(
                (version) =>
                    version.available &&
                    version.lang === preferred.lang &&
                    version.type === preferred.type
              )
            : null

        if (preferredMatch) {
            return { lang: preferredMatch.lang, type: preferredMatch.type }
        }

        const fallback = versions.find(
            (version) =>
                version.available &&
                (!exclude || version.lang !== exclude.lang || version.type !== exclude.type)
        )

        return fallback ? { lang: fallback.lang, type: fallback.type } : null
    }, [])

    usePageMeta({
        title: metadata ? (metadata.translated_title || metadata.original_title) : t('nikaya.metaTitle'),
        description: metadata?.blurb || t('nikaya.metaDescription'),
        url: normalizedSuttaId ? canonicalPath : undefined,
        jsonLd: metadata
            ? [
                {
                    '@type': 'Article',
                    '@id': `${SITE_URL}${canonicalPath}#article`,
                    headline: metadata.translated_title || metadata.original_title,
                    description: metadata.blurb || t('nikaya.metaDescription'),
                    url: `${SITE_URL}${canonicalPath}`,
                    inLanguage: 'vi',
                    author: {
                        '@type': 'Organization',
                        name: 'SuttaCentral / Nhập Lưu',
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'Nhập Lưu',
                    },
                },
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Trang chủ',
                            item: SITE_URL,
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: 'Kinh Điển Pāli',
                            item: `${SITE_URL}/nikaya`,
                        },
                        ...(inferredCollection
                            ? [{
                                '@type': 'ListItem',
                                position: 3,
                                name: NIKAYA_COLLECTIONS[inferredCollection].vi,
                                item: `${SITE_URL}${getNikayaCollectionPath(inferredCollection)}`,
                            }]
                            : []),
                        {
                            '@type': 'ListItem',
                            position: inferredCollection ? 4 : 3,
                            name: metadata.translated_title || metadata.original_title,
                            item: `${SITE_URL}${canonicalPath}`,
                        },
                    ],
                },
            ]
            : undefined,
        jsonLdId: normalizedSuttaId ? `nikaya-${normalizedSuttaId}` : 'nikaya-detail',
        author: 'SuttaCentral / Nhập Lưu',
    })

    // Fetch sutta metadata
    useEffect(() => {
        if (!normalizedSuttaId) return

        const fetchMetadata = async () => {
            setLoading(true)
            setError(null)

            try {
                const data = await getSuttaMetadata(normalizedSuttaId)
                if (!data) {
                    setError('Không tìm thấy kinh này')
                    return
                }
                setMetadata(data)

                // Build available versions list
                const versions: typeof availableVersions = []
                const supportedLangs: NikayaLanguage[] = ['vi', 'en', 'zh', 'es']

                for (const lang of supportedLangs) {
                    const langInfo = NIKAYA_LANGUAGES[lang]

                    // Check if original version has local readable content
                    const hasLocalOriginal = hasLocalContent(normalizedSuttaId, lang)
                    versions.push({
                        lang,
                        type: 'original',
                        author: langInfo.originalAuthor,
                        available: hasLocalOriginal
                    })

                    // Check if improved version available locally
                    versions.push({
                        lang,
                        type: 'improved',
                        author: 'NhậpLưu 2026',
                        available: hasImprovedTranslation(normalizedSuttaId, lang)
                    })
                }

                setAvailableVersions(versions)
            } catch {
                setError('Lỗi khi tải thông tin kinh')
            } finally {
                setLoading(false)
            }
        }

        fetchMetadata()
    }, [normalizedSuttaId, manifestReady])

    useEffect(() => {
        if (availableVersions.length === 0) return

        const nextPrimary = getPreferredAvailableVersion(availableVersions, selectedVersion)
        if (
            nextPrimary &&
            (nextPrimary.lang !== selectedVersion.lang || nextPrimary.type !== selectedVersion.type)
        ) {
            setSelectedVersion(nextPrimary)
        }

        const nextSecondary = getPreferredAvailableVersion(availableVersions, secondVersion, nextPrimary ?? selectedVersion)
        if (
            nextSecondary &&
            (nextSecondary.lang !== secondVersion.lang || nextSecondary.type !== secondVersion.type)
        ) {
            setSecondVersion(nextSecondary)
        }
    }, [availableVersions, getPreferredAvailableVersion, secondVersion, selectedVersion])

    // Fetch content when version changes
    const fetchContent = useCallback(async (
        lang: NikayaLanguage,
        type: NikayaVersionType
    ): Promise<string> => {
        if (!normalizedSuttaId) return ''

        if (type === 'improved') {
            // Get from local improved data (markdown)
            const improved = getImprovedTranslation(normalizedSuttaId, lang)
            return improved?.content || '*Bản dịch cải tiến đang được phát triển...*'
        }

        // Get original from local JSON data first (HTML)
        const localHtml = await fetchLocalSuttaHtml(normalizedSuttaId, lang)
        if (localHtml) {
            return localHtml
        }

        // Fallback message if not available locally
        return `*Bản gốc ${NIKAYA_LANGUAGES[lang].nativeName} chưa được nhập vào thư viện địa phương.*

Bạn có thể xem trực tiếp trên [SuttaCentral](https://suttacentral.net/${normalizedSuttaId}/${lang}).`
    }, [normalizedSuttaId])

    // Load primary content
    useEffect(() => {
        const loadContent = async () => {
            setLoadingContent(true)
            const content = await fetchContent(selectedVersion.lang, selectedVersion.type)
            setPrimaryContent(content)
            setLoadingContent(false)
        }
        loadContent()
    }, [selectedVersion, fetchContent])

    // Load secondary content (comparison mode)
    useEffect(() => {
        if (!comparisonMode) return

        const loadContent = async () => {
            const content = await fetchContent(secondVersion.lang, secondVersion.type)
            setSecondaryContent(content)
        }
        loadContent()
    }, [comparisonMode, secondVersion, fetchContent])

    // Track reading progress
    const handleScroll = useCallback(() => {
        if (!contentRef.current) return
        const element = contentRef.current
        const scrollTop = window.scrollY - element.offsetTop
        const scrollHeight = element.scrollHeight - window.innerHeight
        const newProgress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))
        setProgress(newProgress)
        if (!hasTrackedRead && newProgress >= 80 && normalizedSuttaId) {
            setHasTrackedRead(true)
            trackEvent('read_sutta', { suttaId: normalizedSuttaId, progress: Math.round(newProgress), source: 'nikaya' })
        }
    }, [hasTrackedRead, normalizedSuttaId])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // Save font size preference
    useEffect(() => {
        localStorage.setItem('nhapluu_font_size', fontSize)
    }, [fontSize])

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
    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
    prose-strong:text-foreground prose-strong:font-semibold
    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
    prose-li:text-foreground prose-li:mb-1
    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
    prose-blockquote:text-muted-foreground prose-blockquote:my-4
    prose-hr:border-border prose-hr:my-8
  `

    if (normalizedSuttaId && (routeCollection !== inferredCollection || suttaId !== normalizedSuttaId)) {
        return <Navigate to={canonicalPath} replace state={location.state} />
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-12 w-96 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (error || !metadata) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">{error || 'Không tìm thấy kinh'}</h1>
                    <Link to={backPath} className="text-primary hover:underline">
                        ← Quay lại Kinh Điển
                    </Link>
                </div>
            </div>
        )
    }

    const collection = (inferredCollection || metadata.uid.slice(0, 2).toLowerCase()) as keyof typeof NIKAYA_COLLECTIONS
    const collectionInfo = NIKAYA_COLLECTIONS[collection]

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
                <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Back link */}
            <button
                onClick={() => navigate(backPath)}
                className="flex items-center gap-2 text-primary hover:underline mb-6"
            >
                <ChevronLeft className="h-4 w-4" />
                Quay lại Kinh Điển
            </button>

            {/* Header Card */}
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-bold text-primary">{metadata.acronym}</span>
                            {collectionInfo && (
                                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                    {collectionInfo.vi}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {metadata.translated_title || metadata.original_title}
                        </h1>
                        <p className="text-lg text-muted-foreground italic font-serif mb-4">
                            {metadata.original_title}
                        </p>
                        {metadata.blurb && (
                            <p className="text-muted-foreground">{metadata.blurb}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`https://suttacentral.net/${normalizedSuttaId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title="Xem trên SuttaCentral"
                        >
                            <ExternalLink className="h-5 w-5 text-muted-foreground" />
                        </a>
                        <button
                            onClick={() => toggleBookmark(normalizedSuttaId)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title={state.bookmarkedSuttas.includes(normalizedSuttaId) ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                        >
                            <Bookmark
                                className={`h-5 w-5 ${state.bookmarkedSuttas.includes(normalizedSuttaId)
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {collectionInfo && (
                    <div className="mb-4 rounded-lg border border-border bg-muted/40 p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`rounded px-2 py-1 text-xs font-medium ${coverage.hasOriginalEn ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                {t('nikaya.coverage.originalEnShort')}
                            </span>
                            <span className={`rounded px-2 py-1 text-xs font-medium ${coverage.hasOriginalVi ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                {t('nikaya.coverage.originalViShort')}
                            </span>
                            <span className={`rounded px-2 py-1 text-xs font-medium ${coverage.hasImprovedVi ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {t('nikaya.coverage.manual2026Short')}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {hasCompleteTriad
                                ? t('nikaya.coverage.detailReady', {
                                    collection: collectionInfo.vi,
                                    suttaId: metadata.acronym,
                                })
                                : t('nikaya.coverage.detailMissing', {
                                    collection: collectionInfo.vi,
                                    suttaId: metadata.acronym,
                                    missing: [
                                        !coverage.hasOriginalEn ? t('nikaya.coverage.originalEn') : null,
                                        !coverage.hasOriginalVi ? t('nikaya.coverage.originalVi') : null,
                                        !coverage.hasImprovedVi ? t('nikaya.coverage.manual2026') : null,
                                    ].filter(Boolean).join(', '),
                                })}
                        </p>
                    </div>
                )}

                {/* Version Switcher */}
                <NikayaVersionSwitcher
                    availableVersions={availableVersions}
                    selectedVersion={selectedVersion}
                    onVersionChange={(lang, type) => setSelectedVersion({ lang, type })}
                    comparisonMode={comparisonMode}
                    onComparisonToggle={setComparisonMode}
                    secondVersion={secondVersion}
                    onSecondVersionChange={(lang, type) => setSecondVersion({ lang, type })}
                />

                {/* Reading Controls */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-4 mt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                        {/* Font Size Control */}
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground mr-2">Cỡ chữ</span>
                            <button
                                onClick={() => cycleFontSize('down')}
                                disabled={fontSize === 'small'}
                                className="p-1.5 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium w-16 text-center">
                                {fontSize === 'small' ? 'Nhỏ' : fontSize === 'medium' ? 'Vừa' : 'Lớn'}
                            </span>
                            <button
                                onClick={() => cycleFontSize('up')}
                                disabled={fontSize === 'large'}
                                className="p-1.5 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Tiến độ: {Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div ref={contentRef}>
                {loadingContent ? (
                    <div className="bg-card rounded-lg border border-border p-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
                        <p className="text-muted-foreground">Đang tải nội dung...</p>
                    </div>
                ) : comparisonMode ? (
                    <NikayaComparisonView
                        leftContent={primaryContent}
                        rightContent={secondaryContent}
                        leftVersion={{
                            lang: selectedVersion.lang,
                            type: selectedVersion.type,
                            author: selectedVersion.type === 'improved'
                                ? 'NhậpLưu 2026'
                                : NIKAYA_LANGUAGES[selectedVersion.lang].originalAuthor
                        }}
                        rightVersion={{
                            lang: secondVersion.lang,
                            type: secondVersion.type,
                            author: secondVersion.type === 'improved'
                                ? 'NhậpLưu 2026'
                                : NIKAYA_LANGUAGES[secondVersion.lang].originalAuthor
                        }}
                        fontSize={fontSize}
                    />
                ) : (
                    <div className="bg-card rounded-lg border border-border p-6">
                        <article className={proseClasses}>
                            {selectedVersion.type === 'original' ? (
                                <div dangerouslySetInnerHTML={{ __html: primaryContent }} />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {primaryContent}
                                </ReactMarkdown>
                            )}
                        </article>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-2 text-primary hover:underline"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại Kinh Điển
                </button>
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-primary hover:underline"
                >
                    Về đầu trang ↑
                </button>
            </div>
        </div>
    )
}
