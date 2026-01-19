import type { Teaching } from '@/types'
import tongQuan from './00-tong-quan'
import batNhanDao from './01-bat-nhan-dao'
import giaThai from './02-gia-thai'
import congViec from './03-cong-viec'
import quanHe from './04-quan-he-xa-hoi'

export const daoDoi: Teaching = {
    id: 'dao-doi',
    title: 'Đạo Đời - Bát Nhân Đạo',
    summary: 'Thực hành đạo đức trong đời thường: Bát Nhân Đạo (8 đức tính cao quý), đạo lý làm người trong gia đình, công việc và xã hội theo giáo lý Đức Phật.',
    author: 'Truyền thống Theravāda',
    type: 'practical',
    themes: ['đạo đức', 'đời sống', 'gia đình', 'công việc', 'xã hội'],
    difficulty: 'beginner',
    chapters: [
        tongQuan,
        batNhanDao,
        giaThai,
        congViec,
        quanHe
    ]
}

export default daoDoi
