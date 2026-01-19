import type { Teaching } from '../../../types'
import tongQuan from './00-tong-quan'
import boThiTriGioi from './01-bo-thi-tri-gioi'
import xuatGiaTriTue from './02-xuat-gia-tri-tue'
import tinhTanNhanNai from './03-tinh-tan-nhan-nai'
import chanThatQuyetDinh from './04-chan-that-quyet-dinh'
import tuBiXa from './05-tu-bi-xa'

export const muoiBaLaMat: Teaching = {
    id: 'muoi-ba-la-mat',
    title: 'Mười Ba-la-mật (Pāramī)',
    summary: 'Mười phẩm chất cao thượng kiến tạo nên bậc Thánh. Nhiên liệu không thể thiếu cho hành trình giác ngộ.',
    author: 'Đại Trưởng Lão Hộ Pháp',
    type: 'foundation',
    themes: ['ba-la-mật', 'hạnh thánh', 'bồ tát đạo', 'phẩm chất tâm'],
    difficulty: 'intermediate',
    chapters: [
        tongQuan,
        boThiTriGioi,
        xuatGiaTriTue,
        tinhTanNhanNai,
        chanThatQuyetDinh,
        tuBiXa
    ]
}

export default muoiBaLaMat
