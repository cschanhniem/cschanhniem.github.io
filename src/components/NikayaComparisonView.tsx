// Nikaya Comparison View Component
// Side-by-side display of two translation versions

import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link2, Link2Off, Sparkles, Globe } from 'lucide-react'
import type { NikayaLanguage, NikayaVersionType } from '@/types/nikaya'
import { NIKAYA_LANGUAGES } from '@/types/nikaya'

interface NikayaComparisonViewProps {
    leftContent: string
    rightContent: string
    leftVersion: { lang: NikayaLanguage; type: NikayaVersionType; author: string }
    rightVersion: { lang: NikayaLanguage; type: NikayaVersionType; author: string }
    fontSize?: 'small' | 'medium' | 'large'
}

const fontSizeClasses = {
    small: 'prose-sm',
    medium: 'prose-base',
    large: 'prose-lg'
}

export function NikayaComparisonView({
    leftContent,
    rightContent,
    leftVersion,
    rightVersion,
    fontSize = 'medium'
}: NikayaComparisonViewProps) {
    const [syncScroll, setSyncScroll] = useState(true)
    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const isScrolling = useRef(false)

    // Synchronized scrolling
    useEffect(() => {
        if (!syncScroll) return

        const handleScroll = (source: 'left' | 'right') => (e: Event) => {
            if (isScrolling.current) return
            isScrolling.current = true

            const target = e.target as HTMLElement
            const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight)

            const other = source === 'left' ? rightRef.current : leftRef.current
            if (other) {
                other.scrollTop = scrollPercentage * (other.scrollHeight - other.clientHeight)
            }

            requestAnimationFrame(() => {
                isScrolling.current = false
            })
        }

        const leftEl = leftRef.current
        const rightEl = rightRef.current

        if (leftEl && rightEl) {
            leftEl.addEventListener('scroll', handleScroll('left'))
            rightEl.addEventListener('scroll', handleScroll('right'))

            return () => {
                leftEl.removeEventListener('scroll', handleScroll('left'))
                rightEl.removeEventListener('scroll', handleScroll('right'))
            }
        }
    }, [syncScroll])

    const getVersionHeader = (version: typeof leftVersion) => {
        const langInfo = NIKAYA_LANGUAGES[version.lang]
        return (
            <div className="flex items-center gap-2">
                {version.type === 'improved' ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{langInfo.nativeName}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-muted-foreground">{version.author}</span>
                {version.type === 'improved' && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">2026</span>
                )}
            </div>
        )
    }

    const proseClasses = `
    prose prose-slate max-w-none ${fontSizeClasses[fontSize]}
    prose-headings:font-bold prose-headings:text-foreground
    prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
    prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-4
    prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-3
    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-3
    prose-strong:text-foreground
    prose-ul:my-3 prose-ul:list-disc prose-ul:pl-5
    prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-5
    prose-li:text-foreground prose-li:mb-1
    prose-blockquote:border-l-3 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic
    prose-blockquote:text-muted-foreground prose-blockquote:my-3
  `

    return (
        <div className="rounded-lg border border-border overflow-hidden">
            {/* Sync scroll toggle */}
            <div className="flex items-center justify-end p-2 bg-muted/50 border-b border-border">
                <button
                    onClick={() => setSyncScroll(!syncScroll)}
                    className={`
            flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors
            ${syncScroll ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}
          `}
                >
                    {syncScroll ? (
                        <>
                            <Link2 className="h-4 w-4" />
                            Cuộn đồng bộ
                        </>
                    ) : (
                        <>
                            <Link2Off className="h-4 w-4" />
                            Cuộn độc lập
                        </>
                    )}
                </button>
            </div>

            {/* Comparison columns */}
            <div className="grid md:grid-cols-2 divide-x divide-border">
                {/* Left column */}
                <div className="flex flex-col">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        {getVersionHeader(leftVersion)}
                    </div>
                    <div
                        ref={leftRef}
                        className="flex-1 p-4 overflow-y-auto max-h-[70vh]"
                    >
                        <article className={proseClasses}>
                            {leftVersion.type === 'original' ? (
                                <div dangerouslySetInnerHTML={{ __html: leftContent || '<i>Đang tải...</i>' }} />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {leftContent || '*Đang tải...*'}
                                </ReactMarkdown>
                            )}
                        </article>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        {getVersionHeader(rightVersion)}
                    </div>
                    <div
                        ref={rightRef}
                        className="flex-1 p-4 overflow-y-auto max-h-[70vh]"
                    >
                        <article className={proseClasses}>
                            {rightVersion.type === 'original' ? (
                                <div dangerouslySetInnerHTML={{ __html: rightContent || '<i>Đang tải...</i>' }} />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {rightContent || '*Đang tải...*'}
                                </ReactMarkdown>
                            )}
                        </article>
                    </div>
                </div>
            </div>
        </div>
    )
}
