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
        <article className="prose prose-slate prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{sutta.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
