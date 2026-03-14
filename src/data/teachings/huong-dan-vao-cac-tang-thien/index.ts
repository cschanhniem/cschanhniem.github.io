import type { Teaching, TeachingChapter } from '@/types'

const rawChapters = import.meta.glob('../../../content/teachings/huong-dan-vao-cac-tang-thien/vi/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
}) as Record<string, string>

const chapterManifest = [
    { file: '00-loi-dan.md', id: 'jhana-leigh-00', title: 'Lời dẫn' },
    { file: '01-tu-the-va-can-dinh.md', id: 'jhana-leigh-01', title: 'Tư thế, hơi thở, và cận định' },
    { file: '02-cam-giac-de-chiu-va-so-thien.md', id: 'jhana-leigh-02', title: 'Cảm giác dễ chịu và cánh cửa sơ thiền' },
    { file: '03-kinh-van-bon-thien.md', id: 'jhana-leigh-03', title: 'Không mong cầu và kinh văn bốn thiền' },
] as const

const chapters: TeachingChapter[] = chapterManifest.flatMap((chapter, order) => {
    const content = Object.entries(rawChapters).find(([path]) => path.endsWith(`/${chapter.file}`))?.[1]

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

export const huongDanVaoCacTangThien: Teaching = {
    id: 'huong-dan-vao-cac-tang-thien',
    title: 'Hướng Dẫn Đi Vào Các Tầng Thiền',
    author: 'Leigh Brasington',
    translator: 'Ban biên tập Nhập Lưu',
    summary: 'Bản hướng dẫn ngắn, rõ, và thực hành trực tiếp về cách nuôi cận định, chuyển sang cảm giác dễ chịu, và để sơ thiền khởi sinh mà không gượng ép.',
    themes: ['jhāna', 'sơ thiền', 'cận định', 'anapanasati', 'định học'],
    difficulty: 'advanced',
    type: 'guide',
    chapters,
}

export default huongDanVaoCacTangThien
