import type { TeachingWithChapters } from '../tien-trinh-minh-sat/index'
import chap00 from './00-tong-quan'
import chap01 from './01-chuan-bi'
import chap02 from './02-ky-thuat-co-ban'
import chap03 from './03-cac-tue-giac'
import chap04 from './04-thien-doi-song'
import chap05 from './05-khoa-nhap-that'
import chap06 from './06-xu-ly-kho-khan'
import chap07 from './07-sau-nhap-luu'

export const conDuongMahasiMeta: Omit<TeachingWithChapters, 'chapters'> = {
    id: 'con-duong-mahasi',
    title: 'Con Đường Thiền Quán Mahasi',
    titlePali: 'Mahasi Vipassana Magga',
    author: 'Tổng hợp',
    translator: 'N/A',
    summary: 'Hướng dẫn toàn diện về pháp hành thiền Tứ Niệm Xứ theo truyền thống Mahasi Sayadaw, từ những bước đầu tiên cho đến các giai đoạn tuệ giác và giải thoát.',
    themes: ['Thực hành', 'Hướng dẫn', 'Tứ Niệm Xứ', 'Vipassana', 'Mahasi'],
    difficulty: 'intermediate',
    type: 'guide',
}

const conDuongMahasi: TeachingWithChapters = {
    ...conDuongMahasiMeta,
    chapters: [
        chap00,
        chap01,
        chap02,
        chap03,
        chap04,
        chap05,
        chap06,
        chap07
    ]
}

export default conDuongMahasi
