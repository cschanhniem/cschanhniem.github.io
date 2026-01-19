import type { TeachingWithChapters } from '../tien-trinh-minh-sat/index'
import chap00 from './00-gioi-thieu'
import chap01 from './01-chuan-bi'
import chap02 from './02-lich-trinh'
import chap03 from './03-tien-trinh-tung-ngay'
import chap04 from './04-xu-ly-van-de'
import chap05 from './05-sau-retreat'

export const huongDanNhapThatMeta: Omit<TeachingWithChapters, 'chapters'> = {
    id: 'huong-dan-nhap-that',
    title: 'Hướng Dẫn Nhập Thất Mahasi',
    titlePali: 'Mahasi Retreat Guide',
    author: 'Tổng hợp',
    translator: 'N/A',
    summary: 'Cẩm nang chi tiết và thiết thực cho những ai muốn tham gia khóa thiền nhập thất (Retreat) tích cực, từ khâu chuẩn bị, lịch trình thực hành đến cách vượt qua các giai đoạn cam go.',
    themes: ['Nhập thất', 'Retreat', 'Thực hành tích cực', 'Hướng dẫn chi tiết'],
    difficulty: 'advanced',
    type: 'guide',
}

const huongDanNhapThat: TeachingWithChapters = {
    ...huongDanNhapThatMeta,
    chapters: [
        chap00,
        chap01,
        chap02,
        chap03,
        chap04,
        chap05
    ]
}

export default huongDanNhapThat
