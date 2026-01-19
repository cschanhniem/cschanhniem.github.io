import type { TeachingWithChapters } from '../tien-trinh-minh-sat/index'
import chap00 from './00-tong-quan'
import chap01 from './01-tam'
import chap02 from './02-so-huu-tam'
import chap03 from './03-sac-phap'
import chap04 from './04-niet-ban'
import chap05 from './05-lo-trinh-tam'

export const viDieuPhapMeta: Omit<TeachingWithChapters, 'chapters'> = {
    id: 'vi-dieu-phap-ung-dung',
    title: 'Vi Diệu Pháp Ứng Dụng',
    titlePali: 'Abhidhamma in Practice',
    author: 'Tổng hợp',
    translator: 'Ban Biên Tập Nhập Lưu',
    summary: 'Giải mã những thuật ngữ cốt lõi của Vi Diệu Pháp (Abhidhamma) dưới góc độ thực hành thiền quán. Giúp hành giả hiểu rõ bản chất của Tâm, Sở Hữu Tâm và Sắc Pháp để ghi nhận chính xác hơn.',
    themes: ['Abhidhamma', 'Chi pháp', 'Paramattha', 'Thực hành', 'Lý thuyết nâng cao'],
    difficulty: 'advanced',
    type: 'commentary',
}

const viDieuPhap: TeachingWithChapters = {
    ...viDieuPhapMeta,
    chapters: [
        chap00,
        chap01,
        chap02,
        chap03,
        chap04,
        chap05
    ]
}

export default viDieuPhap
