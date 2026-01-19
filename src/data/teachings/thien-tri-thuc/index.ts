import type { Teaching } from '@/types'
import tongQuan from './00-tong-quan'
import vaiTro from './01-vai-tro'
import chuanMuc from './02-chuan-muc'
import timThay from './03-tim-thay'
import laNguoi from './04-la-nguoi-tot'

export const thienTriThuc: Teaching = {
    id: 'thien-tri-thuc',
    title: 'Thiện Tri Thức (Kalyāṇamitta)',
    summary: 'Vai trò của thầy và đạo tràng trong tu tập. Đức Phật nói thiện hữu là TOÀN BỘ đời sống phạm hạnh. Cách tìm, nhận biết và học hỏi từ bậc thiện tri thức.',
    author: 'Truyền thống Theravāda',
    type: 'foundation',
    themes: ['thiện tri thức', 'thầy', 'đạo tràng', 'sangha', 'hướng dẫn'],
    difficulty: 'beginner',
    chapters: [
        tongQuan,
        vaiTro,
        chuanMuc,
        timThay,
        laNguoi
    ]
}

export default thienTriThuc
