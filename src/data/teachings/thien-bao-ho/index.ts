import type { Teaching } from '../../../types'
import tongQuan from './00-tong-quan'
import niemAnDucPhat from './01-niem-an-duc-phat'
import batTinhNguyenThe from './02-bat-tinh-nguyen-the'
import niemSuChet from './03-niem-su-chet'
import tongKet from './04-tong-ket'

export const thienBaoHo: Teaching = {
    id: 'thien-bao-ho',
    title: 'Thiền Bảo Hộ (Caturarakkha)',
    summary: 'Bộ áo giáp hộ thân cho hành giả. Bố n đề mục thiền căn bản để cân bằng tâm, vượt qua sợ hãi và duy trì động lực.',
    author: 'Ngài Silananda',
    type: 'manual',
    themes: ['bảo hộ', 'niệm phật', 'bất tịnh', 'niệm chết', 'tâm từ'],
    difficulty: 'beginner',
    chapters: [
        tongQuan,
        niemAnDucPhat,
        batTinhNguyenThe,
        niemSuChet,
        tongKet
    ]
}

export default thienBaoHo
