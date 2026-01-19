import type { Teaching } from '../../../types'
import tongQuan from './00-tong-quan'
import namTrienCai from './01-nam-trien-cai'
import soThien from './02-so-thien'
import cacTangThienCao from './03-cac-tang-thien-cao'
import thanThong from './04-than-thong'
import dinhVaTue from './05-dinh-va-tue'

export const dinhHocTinhHoa: Teaching = {
    id: 'dinh-hoc-tinh-hoa',
    title: 'Định Học Tinh Hoa (Sammā Samādhi)',
    summary: 'Khám phá sức mạnh của Thiền Định. Hướng dẫn chi tiết về 4 tầng Thiền (Jhana), cách vượt qua 5 Triền Cái và sử dụng Định lực để hỗ trợ Tuệ giác.',
    author: 'Pa-Auk Sayadaw & Ajahn Brahm',
    type: 'manual',
    themes: ['thiền định', 'jhana', 'triền cái', 'định lực', 'thần thông'],
    difficulty: 'advanced',
    chapters: [
        tongQuan,
        namTrienCai,
        soThien,
        cacTangThienCao,
        thanThong,
        dinhVaTue
    ]
}

export default dinhHocTinhHoa
