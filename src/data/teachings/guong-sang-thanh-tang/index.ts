import type { Teaching } from '../../../types'
import tongQuan from './00-tong-quan'
import xaLoiPhat from './01-xa-loi-phat'
import aNanDa from './02-a-nan-da'
import thanhNu from './03-thanh-nu'
import satNhanThanhTu from './04-sat-nhan-thanh-tu'
import cuSiGuongMau from './05-cu-si-guong-mau'

export const guongSangThanhTang: Teaching = {
    id: 'guong-sang-thanh-tang',
    title: 'Gương Sáng Thánh Tăng (Ariya Sangha)',
    summary: 'Mảnh ghép thứ ba của Tam Bảo. Những câu chuyện người thật việc thật về quá trình chứng ngộ của các bậc Thánh Tăng, Thánh Ni và Cư sĩ.',
    author: 'Tổng Hợp',
    type: 'foundation',
    themes: ['tăng bảo', 'thánh nhân', 'tiểu sử', 'cảm hứng', 'chứng ngộ'],
    difficulty: 'beginner',
    chapters: [
        tongQuan,
        xaLoiPhat,
        aNanDa,
        thanhNu,
        satNhanThanhTu,
        cuSiGuongMau
    ]
}

export default guongSangThanhTang
