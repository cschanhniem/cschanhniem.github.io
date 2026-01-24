export const SITE_NAME = 'NhapLuu'
export const SITE_DESCRIPTION =
  'Nền tảng thực hành Phật giáo nguyên thủy: thiền định, giữ giới, đọc kinh, cộng đồng Kalyāṇamitta.'

// Prefer env-provided URL for SEO/meta. Fallback to README public URL.
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://cschanhniem.github.io/nhapluu'

export const DEFAULT_OG_IMAGE = '/logo.png'
