import { useParams, Link, useNavigate } from 'react-router-dom'
import { suttas } from '@/data/suttas/index'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronLeft, Bookmark } from 'lucide-react'
import { useAppState } from '@/hooks/useAppState'

export function SuttaDetail() {
  const { suttaId } = useParams<{ suttaId: string }>()
  const navigate = useNavigate()
  const { state, toggleBookmark } = useAppState()

  const sutta = suttas.find((s) => s.id === suttaId)

  if (!sutta) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy kinh này</h1>
          <Link to="/kinh-tang" className="text-primary hover:underline">
            ← Quay lại Kinh Tạng
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/kinh-tang')}
        className="flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Kinh Tạng
      </button>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
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
            className="p-2 hover:bg-muted rounded-md transition-colors"
            aria-label={
              state.bookmarkedSuttas.includes(sutta.id) ? 'Bỏ đánh dấu' : 'Đánh dấu'
            }
          >
            <Bookmark
              className={`h-6 w-6 ${
                state.bookmarkedSuttas.includes(sutta.id)
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {sutta.themes.map((theme) => (
            <span
              key={theme}
              className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>

        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-foreground font-medium">{sutta.summary}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <article className="prose prose-slate prose-lg max-w-none
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
          prose-td:border prose-td:border-border prose-td:p-2"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{sutta.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
