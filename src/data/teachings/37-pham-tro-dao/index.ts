import type { TeachingWithChapters } from '../tien-trinh-minh-sat/index'
import chap00 from './00-tong-quan'
import chap01 from './01-tu-niem-xu'
import chap02 from './02-tu-chanh-can'
import chap03 from './03-tu-nhu-y-tuc'
import chap04 from './04-ngu-can-ngu-luc'
import chap05 from './05-that-giac-chi'
import chap06 from './06-bat-chanh-dao'

export const baMuoiBayPhamMeta: Omit<TeachingWithChapters, 'chapters'> = {
    id: '37-pham-tro-dao',
    title: '37 Phẩm Trợ Đạo',
    titlePali: 'Bodhipakkhiya-dhammā',
    author: 'Đức Phật Gotama',
    translator: 'Ban Biên Tập Nhập Lưu',
    summary: 'Hệ thống toàn diện các pháp môn hỗ trợ trực tiếp cho sự Giác ngộ. Đây là tinh hoa cốt lõi nhất của Phật giáo Nguyên thủy, chiếc chìa khóa vạn năng mở cánh cửa Bất tử.',
    themes: ['Pháp học', 'Cốt lõi', 'Giác ngộ', 'Lý thuyết nền tảng'],
    difficulty: 'advanced',
    type: 'manual', // Using manual as it is a doctrinal framework
}

const baMuoiBayPham: TeachingWithChapters = {
    ...baMuoiBayPhamMeta,
    chapters: [
        chap00,
        chap01,
        chap02,
        chap03,
        chap04,
        chap05,
        chap06
    ]
}

export default baMuoiBayPham
