import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppState } from '@/hooks/useAppState'
import { suttas } from '@/data/suttas/index'
import { BookOpen, Bookmark, Search, ChevronRight, ArrowRight } from 'lucide-react'

export function Library() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const filteredSuttas = suttas.filter((sutta) => {
    const matchesSearch =
      sutta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sutta.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sutta.summary.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCollection = selectedCollection === 'all' || sutta.collection === selectedCollection
    const matchesDifficulty = selectedDifficulty === 'all' || sutta.difficulty === selectedDifficulty

    return matchesSearch && matchesCollection && matchesDifficulty
  })

  const difficultyLabels = {
    beginner: t('library.filters.beginner'),
    intermediate: t('library.filters.intermediate'),
    advanced: t('library.filters.advanced')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Kinh Tạng Pāli
        </h1>
        <p className="text-muted-foreground">
          Lời Phật dạy nguyên gốc, con đường dẫn đến giải thoát
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold text-foreground mb-3">Tìm Kiếm</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm kinh..."
                className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold text-foreground mb-3">Bộ Kinh</h3>
            <div className="space-y-2">
              {['all', 'DN', 'MN', 'SN', 'AN', 'KN'].map((collection) => (
                <button
                  key={collection}
                  onClick={() => setSelectedCollection(collection)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${selectedCollection === collection
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                    }
                  `}
                >
                  {collection === 'all' ? 'Tất cả' :
                    collection === 'DN' ? 'Trường Bộ (DN)' :
                      collection === 'MN' ? 'Trung Bộ (MN)' :
                        collection === 'SN' ? 'Tương Ưng Bộ (SN)' :
                          collection === 'AN' ? 'Tăng Chi Bộ (AN)' : 'Tiểu Bộ (KN)'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold text-foreground mb-3">Mức Độ</h3>
            <div className="space-y-2">
              {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${selectedDifficulty === difficulty
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                    }
                  `}
                >
                  {difficulty === 'all' ? 'Tất cả' : difficultyLabels[difficulty as keyof typeof difficultyLabels]}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/danh-dau"
            className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                {t('bookmarks.title')}
              </h3>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('bookmarks.subtitle', { count: state.bookmarkedSuttas.length })}
            </p>
          </Link>
        </div>

        {/* Suttas List */}
        <div className="md:col-span-2">
          <div className="space-y-3">
            {filteredSuttas.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Không tìm thấy kinh nào phù hợp</p>
              </div>
            ) : (
              filteredSuttas.map((sutta) => (
                <Link
                  key={sutta.id}
                  to={`/phap-bao/${sutta.id}`}
                  className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary">
                          {sutta.code}
                        </span>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                          {difficultyLabels[sutta.difficulty]}
                        </span>
                        {state.bookmarkedSuttas.includes(sutta.id) && (
                          <Bookmark className="h-3 w-3 fill-primary text-primary" />
                        )}
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
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
