import type { RetreatEvent } from '@/types/growth'

export const DEFAULT_RETREATS: RetreatEvent[] = [
  {
    id: 'retreat-001',
    title: 'Khóa tu Vipassanā 10 ngày',
    location: 'Thái Lan',
    startDate: '2026-02-10',
    endDate: '2026-02-20',
    tradition: 'Goenka',
    organizer: 'Vipassana Meditation Center',
    description: 'Khóa tu 10 ngày theo truyền thống Goenka, im lặng hoàn toàn.',
    type: 'retreat',
    link: 'https://www.dhamma.org'
  },
  {
    id: 'retreat-002',
    title: 'Retreat Anapanasati cuối tuần',
    location: 'Hà Nội',
    startDate: '2026-03-07',
    endDate: '2026-03-09',
    tradition: 'Theravāda',
    organizer: 'Nhập Lưu Community',
    description: 'Thực hành hơi thở, chánh niệm thân tâm.',
    type: 'meetup'
  },
  {
    id: 'retreat-003',
    title: 'Online Sutta Study Circle',
    location: 'Zoom',
    startDate: '2026-02-01',
    endDate: '2026-02-01',
    tradition: 'Sutta Study',
    organizer: 'Kalyāṇamitta Network',
    description: 'Buổi học kinh 90 phút, có phần hỏi đáp.',
    type: 'online'
  }
]
