import type { Teaching } from '../../../types'
import tongQuan from './00-tong-quan'
import kinhPhapCu from './01-kinh-phap-cu'
import kinhKalama from './02-kinh-kalama'
import kinhSigalovada from './03-kinh-sigalovada'
import kinhMangala from './04-kinh-mangala'
import kinhVoNgaTuong from './05-kinh-vo-nga-tuong'
import guongPhap from './06-guong-phap'
import kinhChuyenPhapLuan from './07-kinh-chuyen-phap-luan'
import tuDuLuuChi from './08-tu-du-luu-chi'
import appamada from './09-appamada'

export const tinhHoaKinhDien: Teaching = {
    id: 'tinh-hoa-kinh-dien',
    title: 'Tinh Hoa Kinh Điển (Sutta Essence)',
    summary: 'Lời vàng trực tiếp từ Đức Phật (Buddhavacana). Tuyển tập những bài kinh căn bản nhất: từ nghệ thuật sống đến tiêu chuẩn kiểm chứng quả Dự Lưu.',
    author: 'Đức Phật Gotama',
    type: 'foundation',
    themes: ['kinh điển', 'nguyên thủy', 'đạo đức', 'dự lưu', 'tứ diệu đế', 'appamāda'],
    difficulty: 'beginner',
    chapters: [
        tongQuan,
        kinhChuyenPhapLuan,  // Bài pháp đầu tiên - Tứ Diệu Đế
        kinhPhapCu,
        kinhKalama,
        kinhSigalovada,
        kinhMangala,
        kinhVoNgaTuong,
        guongPhap,           // Tiêu chuẩn kiểm chứng Dự Lưu
        tuDuLuuChi,          // 4 yếu tố đưa đến Dự Lưu
        appamada             // Lời di huấn cuối cùng của Đức Phật
    ]
}

export default tinhHoaKinhDien
