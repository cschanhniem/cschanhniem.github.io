import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppState } from '@/hooks/useAppState'
import { suttas } from '@/data/suttas/index'
import { BookOpen, Bookmark, BookmarkX, ChevronRight, Search, ArrowLeft } from 'lucide-react'

export function Bookmarks() {
  const { t } = useTranslation()
  const { state, toggleBookmark } = useAppState()
  const [searchTerm, setSearchTerm] = useState('')

  // Get bookmarked suttas
  const bookmarkedSuttas = suttas.filter((sutta) =>
    state.bookmarkedSuttas.includes(sutta.id)
  )

  // Filter by search
  const filteredSuttas = bookmarkedSuttas.filter((sutta) =>
    sutta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sutta.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sutta.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const difficultyLabels = {
    beginner: t('library.filters.beginner'),
    intermediate: t('library.filters.intermediate'),
    advanced: t('library.filters.advanced')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/phap-bao"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('bookmarks.backToLibrary')}
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {t('bookmarks.title')}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t('bookmarks.subtitle', { count: bookmarkedSuttas.length })}
        </p>
      </div>

      {/* Search */}
      {bookmarkedSuttas.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('bookmarks.searchPlaceholder')}
              className="w-full pl-10 pr-3 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Bookmarked Suttas */}
      {bookmarkedSuttas.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {t('bookmarks.empty.title')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('bookmarks.empty.description')}
          </p>
          <Link
            to="/phap-bao"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            {t('bookmarks.empty.browseLibrary')}
          </Link>
        </div>
      ) : filteredSuttas.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('bookmarks.noResults')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuttas.map((sutta) => (
            <div
              key={sutta.id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <Link
                  to={`/kinh-tang/${sutta.id}`}
                  className="flex-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-primary">
                      {sutta.code}
                    </span>
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                      {difficultyLabels[sutta.difficulty]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {sutta.title}
                  </h3>
                  {sutta.titlePali && (
                    <p className="text-sm text-muted-foreground italic font-serif mb-2">
                      {sutta.titlePali}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {sutta.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sutta.themes.slice(0, 3).map((theme) => (
                      <span
                        key={theme}
                        className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleBookmark(sutta.id)
                    }}
                    className="p-2 text-primary hover:bg-muted rounded-md transition-colors"
                    title={t('bookmarks.removeBookmark')}
                  >
                    <BookmarkX className="h-5 w-5" />
                  </button>
                  <Link to={`/kinh-tang/${sutta.id}`}>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
