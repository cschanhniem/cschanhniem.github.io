import type { Teaching } from '../../../types'
import tongQuan from './00-tong-quan'
import voNgaLuanHoi from './01-vo-nga-luan-hoi'
import nghiepSoPhan from './02-nghiep-so-phan'
import thienDucLac from './03-thien-duc-lac'
import bayTamLinh from './04-bay-tam-linh'
import nietBanODau from './05-niet-ban-o-dau'

export const vanDapTinhHoa: Teaching = {
    id: 'van-dap-tinh-hoa',
    title: 'Vấn Đáp Tinh Hoa (Dhamma Q&A)',
    summary: 'Gỡ rối những nút thắt của tâm trí. Đối thoại trực diện về những nghịch lý lớn nhất trong tu tập: Vô ngã & Tái sinh, Nghiệp & Tự do, Thiền & Đời sống.',
    author: 'Các Bậc Trí Giả',
    type: 'commentary',
    themes: ['vấn đáp', 'nghịch lý', 'vô ngã', 'nghiệp', 'niết bàn'],
    difficulty: 'advanced',
    chapters: [
        tongQuan,
        voNgaLuanHoi,
        nghiepSoPhan,
        thienDucLac,
        bayTamLinh,
        nietBanODau
    ]
}

export default vanDapTinhHoa
