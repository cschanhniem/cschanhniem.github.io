import type { TeachingChapter } from '@/types'
import type { TeachingWithChapters } from '../tien-trinh-minh-sat'

const rawVietnameseChapters = import.meta.glob('../../../content/teachings/critical-analysis-jhanas/vi/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>

const rawEnglishChapters = import.meta.glob('../../../content/teachings/critical-analysis-jhanas/en/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>

const chapterManifest = [
    { file: '00-front-matter.md', id: 'jhana-00-front-matter', title: 'Mở đầu xuất bản' },
    { file: '01-abstract.md', id: 'jhana-01-abstract', title: 'Tóm lược luận án' },
    { file: '02-contents.md', id: 'jhana-02-contents', title: 'Mục lục' },
    { file: '03-preface.md', id: 'jhana-03-preface', title: 'Lời tựa' },
    { file: '04-chapter-one-introduction.md', id: 'jhana-04-introduction', title: 'Chương I. Dẫn nhập' },
    { file: '05-chapter-two-preliminaries.md', id: 'jhana-05-preliminaries', title: 'Chương II. Những chuẩn bị trước khi hành trì' },
    { file: '06-chapter-three-hindrances.md', id: 'jhana-06-hindrances', title: 'Chương III. Chế ngự năm triền cái' },
    { file: '07-chapter-four-first-jhana.md', id: 'jhana-07-first-jhana', title: 'Chương IV. Sơ thiền và các thiền chi' },
    { file: '08-chapter-five-higher-jhanas.md', id: 'jhana-08-higher-jhanas', title: 'Chương V. Các tầng thiền cao hơn' },
    { file: '09-chapter-six-beyond-four-jhanas.md', id: 'jhana-09-beyond-four-jhanas', title: 'Chương VI. Vượt ngoài bốn tầng thiền' },
    { file: '10-chapter-seven-way-of-wisdom.md', id: 'jhana-10-way-of-wisdom', title: 'Chương VII. Con đường của trí tuệ' },
    { file: '11-chapter-eight-noble-attainments.md', id: 'jhana-11-noble-attainments', title: 'Chương VIII. Thiền và các Thánh chứng' },
    { file: '12-conclusion.md', id: 'jhana-12-conclusion', title: 'Kết luận và phụ lục' },
    { file: '13-glossary.md', id: 'jhana-13-glossary', title: 'Thuật ngữ' },
    { file: '14-abbreviations.md', id: 'jhana-14-abbreviations', title: 'Bảng viết tắt' },
    { file: '15-selected-bibliography.md', id: 'jhana-15-bibliography', title: 'Thư mục chọn lọc' },
] as const

function resolveChapterContent(fileName: string): string | undefined {
    return (
        Object.entries(rawVietnameseChapters).find(([path]) => path.endsWith(`/${fileName}`))?.[1] ??
        Object.entries(rawEnglishChapters).find(([path]) => path.endsWith(`/${fileName}`))?.[1]
    )
}

const chapters: TeachingChapter[] = chapterManifest.flatMap((chapter, order) => {
    const content = resolveChapterContent(chapter.file)
    if (!content) {
        return []
    }

    return [{
        id: chapter.id,
        order,
        title: chapter.title,
        content,
    }]
})

export const phanTichCacTangThienMeta: Omit<TeachingWithChapters, 'chapters'> = {
    id: 'phan-tich-cac-tang-thien',
    title: 'Khảo Luận Về Các Tầng Thiền',
    titlePali: 'A Critical Analysis of the Jhānas',
    author: 'Bhante Henepola Gunaratana',
    translator: 'Bản dịch nội bộ Nhập Lưu, đang hiệu đính',
    summary: 'Một khảo luận học thuật công phu về vai trò của Jhāna trong con đường tu Theravāda, đi từ năm triền cái, bốn tầng thiền, các trạng thái vô sắc, cho đến quan hệ giữa định, tuệ và Thánh đạo.',
    themes: ['jhāna', 'thiền định', 'triền cái', 'định-tuệ', 'theravāda'],
    difficulty: 'advanced',
    type: 'commentary',
}

const phanTichCacTangThien: TeachingWithChapters = {
    ...phanTichCacTangThienMeta,
    chapters,
}

export default phanTichCacTangThien
