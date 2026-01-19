import type { Teaching } from '@/types'
import tongQuan from './00-tong-quan'
import tamQuanTrong from './01-tam-quan-trong'
import phuongPhap from './02-phuong-phap'
import viDu from './03-vi-du-thuc-hanh'
import saiLam from './04-sai-lam-thuong-gap'

export const nhuLyTacY: Teaching = {
    id: 'nhu-ly-tac-y',
    title: 'Như Lý Tác Ý (Yoniso Manasikāra)',
    summary: 'Chìa khóa dẫn đến Chánh Kiến. Kỹ năng nhìn mọi việc qua lăng kính Tứ Diệu Đế, hỏi đúng câu hỏi, và phát triển trí tuệ thấy rõ thực tướng.',
    author: 'Truyền thống Theravāda',
    type: 'foundation',
    themes: ['chánh kiến', 'như lý tác ý', 'tứ diệu đế', 'trí tuệ', 'quán chiếu'],
    difficulty: 'intermediate',
    chapters: [
        tongQuan,
        tamQuanTrong,
        phuongPhap,
        viDu,
        saiLam
    ]
}

export default nhuLyTacY
