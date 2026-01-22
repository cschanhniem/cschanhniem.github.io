// Nikaya Library Page
// Main listing page for Pali Canon suttas with translation versions

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Globe, Sparkles, ChevronRight, Filter } from 'lucide-react'
import type { NikayaCollection, NikayaSuttaInfo } from '@/types/nikaya'
import { NIKAYA_COLLECTIONS } from '@/types/nikaya'
import { getAvailableImproved } from '@/data/nikaya-improved'

export function NikayaLibrary() {
    // Data Loading State
    const [loading, setLoading] = useState(true)
    const [suttas, setSuttas] = useState<NikayaSuttaInfo[]>([])

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCollection, setSelectedCollection] = useState<NikayaCollection | 'all'>('all')
    const [showImprovedOnly, setShowImprovedOnly] = useState(false)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 20

    // Fetch suttas index on mount
    useEffect(() => {
        const fetchIndex = async () => {
            try {
                const res = await fetch('/data/suttacentral-json/nikaya_index.json')
                if (!res.ok) throw new Error('Failed to load index')
                const data = await res.json()

                // Map index data to NikayaSuttaInfo
                const mappedSuttas: NikayaSuttaInfo[] = data.map((item: any) => {
                    // Formatting code: mn10 -> MN 10
                    const match = item.id.match(/([a-z]+)(\d+.*)/i)
                    const code = match ? `${match[1].toUpperCase()} ${match[2]}` : item.id.toUpperCase()

                    return {
                        id: item.id,
                        code,
                        titlePali: item.paliTitle || '',
                        titleVi: item.title,
                        titleEn: '', // Not in index yet
                        collection: item.collection,
                        blurb: item.blurb,
                        difficulty: item.difficulty || 1 // default difficulty
                    }
                })

                setSuttas(mappedSuttas)
            } catch (e) {
                console.error('Failed to load sutta index:', e)
                // Fallback or retry?
            } finally {
                setLoading(false)
            }
        }

        fetchIndex()
    }, [])

    // Check for improved translations and add to suttas
    const suttasWithImprovedInfo = suttas.map(sutta => ({
        ...sutta,
        hasImproved: {
            vi: getAvailableImproved(sutta.id).includes('vi'),
            en: getAvailableImproved(sutta.id).includes('en'),
            zh: getAvailableImproved(sutta.id).includes('zh'),
            es: getAvailableImproved(sutta.id).includes('es')
        }
    }))

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedCollection, showImprovedOnly])

    // Filter suttas based on search and collection
    const filteredSuttas = suttasWithImprovedInfo.filter(sutta => {
        const matchesSearch =
            (sutta.titlePali || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sutta.titleVi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sutta.titleEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            sutta.code.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCollection = selectedCollection === 'all' || sutta.collection === selectedCollection
        const matchesImprovedOnly = !showImprovedOnly || sutta.hasImproved?.vi

        return matchesSearch && matchesCollection && matchesImprovedOnly
    })

    // Pagination
    const totalPages = Math.ceil(filteredSuttas.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedSuttas = filteredSuttas.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const difficultyLabels = {
        1: 'Sơ cấp',
        2: 'Trung cấp',
        3: 'Cao cấp'
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-[50vh]">
                <div className="text-muted-foreground animate-pulse">Đang tải danh sách kinh...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    Kinh Điển Pāli
                </h1>
                <p className="text-muted-foreground text-lg">
                    Bộ sưu tập kinh điển nguyên thủy với bản dịch gốc và bản cải tiến
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    So sánh các bản dịch tiếng Việt, Anh, Hoa, Tây Ban Nha
                </p>
            </div>

            {/* Info Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <p className="font-medium text-foreground">Bản dịch cải tiến 2026</p>
                        <p className="text-sm text-muted-foreground">
                            Bản dịch mới với ngôn ngữ hiện đại, dễ đọc hơn. So sánh song song với bản dịch gốc của HT. Thích Minh Châu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    {/* Search */}
                    <div className="bg-card rounded-lg border border-border p-4">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Tìm Kiếm
                        </h3>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tên kinh, mã số..."
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Collection Filter */}
                    <div className="bg-card rounded-lg border border-border p-4">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Bộ Kinh
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedCollection('all')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCollection === 'all'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                Tất cả
                            </button>
                            {(Object.keys(NIKAYA_COLLECTIONS) as NikayaCollection[]).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCollection(key)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCollection === key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {NIKAYA_COLLECTIONS[key].vi} ({key.toUpperCase()})
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <label className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <input
                                    type="checkbox"
                                    checked={showImprovedOnly}
                                    onChange={(e) => setShowImprovedOnly(e.target.checked)}
                                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm font-medium text-foreground">Chỉ hiện bản cải tiến 2026</span>
                            </label>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-card rounded-lg border border-border p-4">
                        <h3 className="font-semibold text-foreground mb-3">Tiến Độ</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tổng số kinh</span>
                                <span className="font-medium">{suttas.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Có bản cải tiến</span>
                                <span className="font-medium text-primary">
                                    {suttas.filter(s => {
                                        const improved = getAvailableImproved(s.id);
                                        return improved.includes('vi')
                                    }).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sutta List */}
                <div className="md:col-span-3 space-y-3">
                    {filteredSuttas.length === 0 ? (
                        <div className="bg-card rounded-lg border border-border p-8 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Không tìm thấy kinh nào phù hợp</p>
                        </div>
                    ) : (
                        <>
                            {/* Results count */}
                            <div className="text-sm text-muted-foreground mb-2">
                                Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredSuttas.length)} / {filteredSuttas.length} kinh
                            </div>

                            {paginatedSuttas.map((sutta) => (
                                <Link
                                    key={sutta.id}
                                    to={`/nikaya/${sutta.id}`}
                                    className="block bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="text-sm font-bold text-primary">
                                                    {sutta.code}
                                                </span>
                                                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                                    {NIKAYA_COLLECTIONS[sutta.collection].vi}
                                                </span>
                                                {sutta.difficulty && difficultyLabels[sutta.difficulty as 1 | 2 | 3] && (
                                                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                                        {difficultyLabels[sutta.difficulty as 1 | 2 | 3]}
                                                    </span>
                                                )}
                                                {sutta.hasImproved?.vi && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                                        <Sparkles className="h-3 w-3" />
                                                        Bản 2026
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                                {sutta.titleVi}
                                            </h3>
                                            <p className="text-sm text-muted-foreground italic font-serif mb-2">
                                                {sutta.titlePali}
                                            </p>
                                            {sutta.blurb && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {sutta.blurb}
                                                </p>
                                            )}

                                            {/* Available versions indicator */}
                                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    VI, EN
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0" />
                                    </div>
                                </Link>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ««
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ‹ Trước
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Tiếp ›
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        »»
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
