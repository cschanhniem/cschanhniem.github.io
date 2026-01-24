import type { SanghaCircle } from '@/types/growth'

export const DEFAULT_CIRCLES: SanghaCircle[] = [
  {
    id: 'circle-hn-01',
    name: 'Hà Nội — Sáng Chủ Nhật',
    location: 'Hà Nội',
    language: 'vi',
    schedule: 'Chủ nhật 7:00–8:30',
    focus: ['Thiền Vipassanā', 'Giữ giới', 'Đọc kinh'],
    capacity: 12,
    members: 6,
    isPublic: true,
    description: 'Nhóm nhỏ thực hành đều đặn, phù hợp người mới.'
  },
  {
    id: 'circle-hcm-01',
    name: 'Sài Gòn — Tối Thứ Tư',
    location: 'TP.HCM',
    language: 'vi',
    schedule: 'Thứ tư 20:00–21:30',
    focus: ['Anapanasati', 'Chia sẻ kinh nghiệm'],
    capacity: 10,
    members: 4,
    isPublic: true,
    description: 'Nhóm online/offline luân phiên.'
  },
  {
    id: 'circle-online-01',
    name: 'Online — Global English',
    location: 'Online',
    language: 'en',
    schedule: 'Saturday 9:00–10:00 (UTC+7)',
    focus: ['Mindfulness', 'Sutta study'],
    capacity: 15,
    members: 9,
    isPublic: true,
    description: 'English-speaking circle for international practitioners.'
  }
]
