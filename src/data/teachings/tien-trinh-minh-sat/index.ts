import type { Teaching } from '@/types'

// Chapter type for multi-part teachings
export interface TeachingChapter {
    id: string
    order: number
    title: string
    titlePali?: string
    content: string
}

// Extended teaching with chapters
export interface TeachingWithChapters extends Omit<Teaching, 'content'> {
    chapters: TeachingChapter[]
}

// Metadata for the main teaching
export const tienTrinhMinhSatMeta: Omit<TeachingWithChapters, 'chapters'> = {
    id: 'tien-trinh-minh-sat',
    title: 'Tiến Trình Minh Sát',
    titlePali: 'Visuddhiñana-katha',
    author: 'Đại Trưởng Lão Mahasi Sayadaw',
    translator: 'Nyanaponika Thera (Anh) / Phạm Kim Khánh (Việt)',
    summary: 'Hướng dẫn chi tiết về 16 tầng tuệ minh sát và 7 giai đoạn thanh tịnh trên con đường đến giác ngộ. Tác phẩm kinh điển về thiền Vipassana theo truyền thống Mahasi.',
    themes: ['Thiền Minh Sát', 'Thất Tịnh', 'Thập Lục Tuệ', 'Tứ Niệm Xứ', 'Vipassana'],
    difficulty: 'advanced',
    type: 'manual',
}

import chap00 from './00-loi-noi-dau'
import chap01 from './01-gioi-thieu'
import chap02 from './02-gioi-tinh'
import chap03 from './03-tam-tinh'
import chap04 from './04-kien-tinh'
import chap05 from './05-doan-nghi-tinh'
import chap06 from './06-tham-sat-tue'
import chap07 from './07-sanh-diet-tue'
import chap08 from './08-dao-phi-dao'
import chap09 from './09-diet-tue'
import chap10 from './10-cac-tue-lien-quan'
import chap11 from './11-hanh-xa-tue'
import chap12 from './12-tri-kien-tinh'
import chap13 from './13-ket-luan'
import chap14 from './14-ghi-chu'
import chap15 from './15-tieu-su'

const tienTrinhMinhSat: TeachingWithChapters = {
    ...tienTrinhMinhSatMeta,
    chapters: [
        chap00,
        chap01,
        chap02,
        chap03,
        chap04,
        chap05,
        chap06,
        chap07,
        chap08,
        chap09,
        chap10,
        chap11,
        chap12,
        chap13,
        chap14,
        chap15
    ]
}

export default tienTrinhMinhSat
