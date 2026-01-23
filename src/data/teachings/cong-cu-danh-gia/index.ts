import type { Teaching } from '@/types'
import tongQuan from './00-tong-quan'
import nhatKyThien from './01-nhat-ky-thien'
import hrv from './02-theo-doi-hrv'
import eeg from './03-eeg-neurofeedback'
import danhGiaTienDo from './04-danh-gia-tien-do'
import bangTuSoiKietSu from './05-bang-tu-soi-kiet-su'

export const congCuDanhGia: Teaching = {
    id: 'cong-cu-danh-gia',
    title: 'Công Cụ Đánh Giá Tiến Độ',
    summary: 'Các công cụ hiện đại hỗ trợ theo dõi tiến trình thiền tập: nhật ký thiền số, HRV, EEG, và phương pháp tự đánh giá truyền thống.',
    author: 'Tổng hợp',
    type: 'practical',
    themes: ['công cụ', 'đánh giá', 'tiến độ', 'khoa học', 'nhật ký'],
    difficulty: 'intermediate',
    chapters: [
        tongQuan,
        nhatKyThien,
        hrv,
        eeg,
        danhGiaTienDo,
        bangTuSoiKietSu
    ]
}

export default congCuDanhGia
