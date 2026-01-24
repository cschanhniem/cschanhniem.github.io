import { useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { teachings } from '@/data/teachings/index'
import { ArrowLeft, User, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { PrintButton } from '@/components/PrintButton'
import { usePageMeta } from '@/lib/seo'
import { useTranslation } from 'react-i18next'

export function TeachingDetail() {
    const { t } = useTranslation()
    const { teachingId } = useParams<{ teachingId: string }>()
    const printRef = useRef<HTMLDivElement>(null)
    const teaching = teachings.find((t) => t.id === teachingId)

    usePageMeta({
        title: teaching ? teaching.title : t('library.notFound'),
        description: teaching?.summary || t('library.metaDescription'),
        url: teaching ? `/giao-phap/${teaching.id}` : undefined,
        jsonLd: teaching
            ? {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: teaching.title,
                description: teaching.summary,
                author: {
                    '@type': 'Person',
                    name: teaching.author
                }
            }
            : undefined,
        jsonLdId: teaching ? `teaching-${teaching.id}` : 'teaching-missing'
    })

    if (!teaching) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Không tìm thấy tài liệu</h2>
                    <p className="text-muted-foreground mb-4">Tài liệu bạn đang tìm kiếm không tồn tại.</p>
                    <Link
                        to="/phap-bao"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại Kho Tàng Pháp Bảo
                    </Link>
                </div>
            </div>
        )
    }

    const difficultyLabels = {
        beginner: 'Sơ cấp',
        intermediate: 'Trung cấp',
        advanced: 'Cao cấp'
    }

    const typeLabels = {
        manual: 'Sổ tay thực hành',
        commentary: 'Chú giải',
        discourse: 'Pháp thoại',
        guide: 'Hướng dẫn',
        foundation: 'Nền tảng',
        practical: 'Thực hành đời sống'
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    to="/phap-bao"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại Kho Tàng Pháp Bảo
                </Link>

                <PrintButton contentRef={printRef} title={teaching.title} />
            </div>

            {/* Printable Content Wrapper */}
            <div ref={printRef} className="print:p-4">
                {/* Header */}
                <div className="bg-card rounded-lg border border-border p-6 mb-6 print:border-none print:shadow-none print:p-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium print:border print:border-gray-200">
                            {typeLabels[teaching.type]}
                        </span>
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full print:border print:border-gray-200">
                            {difficultyLabels[teaching.difficulty]}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {teaching.title}
                    </h1>

                    {teaching.titlePali && (
                        <p className="text-lg text-muted-foreground italic font-serif mb-4">
                            {teaching.titlePali}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{teaching.author}</span>
                        </div>
                        {teaching.translator && (
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span>Dịch giả: {teaching.translator}</span>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-muted-foreground">
                        {teaching.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 print:hidden">
                        {teaching.themes.map((theme) => (
                            <span
                                key={theme}
                                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                            >
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-card rounded-lg border border-border p-6 print:border-none print:shadow-none print:p-0">
                    {teaching.chapters && teaching.chapters.length > 0 ? (
                        <>
                            {/* Table of Contents - Hide on print to save paper? Or keep? Keeping for now but maybe styled simpler */}
                            <div className="mb-12 p-6 bg-muted/30 rounded-lg border border-border/50 print:border print:bg-gray-50">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Mục Lục
                                </h3>
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    {teaching.chapters.map((chapter) => (
                                        <li key={chapter.id}>
                                            <a
                                                href={`#${chapter.id}`}
                                                className="text-primary hover:underline text-sm print:text-black print:no-underline"
                                            >
                                                {chapter.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Chapters */}
                            <div className="space-y-12">
                                {teaching.chapters.map((chapter, index) => (
                                    <article key={chapter.id} id={chapter.id} className="scroll-mt-24 break-inside-avoid">

                                        <div className="prose prose-neutral dark:prose-invert max-w-none print:prose-black">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    h1: ({ children }) => (
                                                        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">{children}</h3>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h4 className="text-lg font-bold text-foreground mt-6 mb-3">{children}</h4>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h5 className="text-base font-bold text-foreground mt-5 mb-2">{children}</h5>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p className="text-foreground/90 leading-relaxed mb-4 text-justify">{children}</p>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-foreground/90">{children}</li>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-semibold text-foreground">{children}</strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="italic text-muted-foreground">{children}</em>
                                                    ),
                                                    a: ({ href, children }) => (
                                                        <a href={href} className="text-primary hover:underline print:text-black print:no-underline">{children}</a>
                                                    ),
                                                    table: ({ children }) => (
                                                        <div className="overflow-x-auto my-6">
                                                            <table className="w-full border-collapse text-sm">{children}</table>
                                                        </div>
                                                    ),
                                                    thead: ({ children }) => (
                                                        <thead className="bg-muted text-muted-foreground">{children}</thead>
                                                    ),
                                                    tbody: ({ children }) => (
                                                        <tbody className="divide-y divide-border">{children}</tbody>
                                                    ),
                                                    tr: ({ children }) => (
                                                        <tr className="hover:bg-muted/50 transition-colors">{children}</tr>
                                                    ),
                                                    th: ({ children }) => (
                                                        <th className="border border-border p-3 text-left font-semibold">{children}</th>
                                                    ),
                                                    td: ({ children }) => (
                                                        <td className="border border-border p-3 align-top">{children}</td>
                                                    ),
                                                    hr: () => <hr className="my-8 border-border" />,
                                                }}
                                            >
                                                {chapter.content}
                                            </ReactMarkdown>
                                        </div>

                                        {index < (teaching.chapters?.length || 0) - 1 && (
                                            <div className="flex justify-center mt-12 print:hidden">
                                                <span className="text-muted-foreground/30 text-xl">***</span>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Nội dung đang được cập nhật.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
