import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '@/hooks/useAppState'
import { suttas } from '@/data/suttas/index'
import { teachings } from '@/data/teachings/index'
import { BookOpen, Bookmark, Search, ChevronRight, GraduationCap, ScrollText } from 'lucide-react'
import { usePageMeta } from '@/lib/seo'
import { useTranslation } from 'react-i18next'

type TabType = 'suttas' | 'teachings'

export function DhammaLibrary() {
    const { t } = useTranslation()
    const { state } = useAppState()
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<TabType>('suttas')
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

    const filteredTeachings = teachings.filter((teaching) => {
        const matchesSearch =
            teaching.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teaching.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teaching.summary.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDifficulty = selectedDifficulty === 'all' || teaching.difficulty === selectedDifficulty

        return matchesSearch && matchesDifficulty
    })

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

    usePageMeta({
        title: t('library.metaTitle'),
        description: t('library.metaDescription')
    })

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    Kho Tàng Pháp Bảo
                </h1>
                <p className="text-muted-foreground">
                    Kinh tạng Pāli và các tài liệu hướng dẫn thực hành
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('suttas')}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'suttas'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                        }
          `}
                >
                    <ScrollText className="h-4 w-4" />
                    Kinh Tạng ({suttas.length})
                </button>
                <button
                    onClick={() => setActiveTab('teachings')}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'teachings'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                        }
          `}
                >
                    <GraduationCap className="h-4 w-4" />
                    Giáo Pháp ({teachings.length})
                </button>
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
                                placeholder={activeTab === 'suttas' ? "Tìm kiếm kinh..." : "Tìm kiếm giáo pháp..."}
                                className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {activeTab === 'suttas' && (
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
                    )}

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

                    <div className="bg-card rounded-lg border border-border p-4">
                        <h3 className="font-semibold text-foreground mb-3">Đã Đánh Dấu</h3>
                        <p className="text-sm text-muted-foreground">
                            {state.bookmarkedSuttas.length} kinh đã lưu
                        </p>
                    </div>
                </div>

                {/* Content List */}
                <div className="md:col-span-2">
                    {activeTab === 'suttas' ? (
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
                    ) : (
                        <div className="space-y-3">
                            {filteredTeachings.length === 0 ? (
                                <div className="bg-card rounded-lg border border-border p-8 text-center">
                                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">Không tìm thấy giáo pháp nào phù hợp</p>
                                </div>
                            ) : (
                                filteredTeachings.map((teaching) => (
                                    <Link
                                        key={teaching.id}
                                        to={`/giao-phap/${teaching.id}`}
                                        className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">
                                                        {typeLabels[teaching.type]}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                                        {difficultyLabels[teaching.difficulty]}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                                    {teaching.title}
                                                </h3>
                                                {teaching.titlePali && (
                                                    <p className="text-sm text-muted-foreground italic font-serif mb-1">
                                                        {teaching.titlePali}
                                                    </p>
                                                )}
                                                <p className="text-sm text-primary/80 mb-2">
                                                    {teaching.author}
                                                </p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {teaching.summary}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {teaching.themes.slice(0, 4).map((theme) => (
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
                    )}
                </div>
            </div>
        </div>
    )
}
