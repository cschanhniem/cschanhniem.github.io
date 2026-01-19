import type { Teaching } from '@/types'
import tongQuan from './00-tong-quan'
import anChanhNiem from './01-an-chanh-niem'
import diChanhNiem from './02-di-chanh-niem'
import congViecChanhNiem from './03-cong-viec-chanh-niem'
import giaoTiepChanhNiem from './04-giao-tiep-chanh-niem'
import nghiNgoiChanhNiem from './05-nghi-ngoi-chanh-niem'

export const chanhNiemHangNgay: Teaching = {
    id: 'chanh-niem-hang-ngay',
    title: 'Chánh Niệm Hàng Ngày',
    summary: 'Kỹ thuật thực hành chánh niệm trong mọi hoạt động đời thường: ăn uống, đi đứng, làm việc, giao tiếp và nghỉ ngơi. Biến mỗi khoảnh khắc thành thiền.',
    author: 'Truyền thống Theravāda',
    type: 'practical',
    themes: ['chánh niệm', 'đời thường', 'thực hành', 'thiền hành', 'mindfulness'],
    difficulty: 'beginner',
    chapters: [
        tongQuan,
        anChanhNiem,
        diChanhNiem,
        congViecChanhNiem,
        giaoTiepChanhNiem,
        nghiNgoiChanhNiem
    ]
}

export default chanhNiemHangNgay
