import type { NikayaLanguage, NikayaVersionType } from '@/types/nikaya'

export interface NikayaVersionOption {
    lang: NikayaLanguage
    type: NikayaVersionType
    author: string
    available: boolean
}

interface CuratedNikayaVersionDefinition {
    lang: NikayaLanguage
    type: NikayaVersionType
    author: string
    label: string
}

export const CURATED_NIKAYA_VERSIONS: CuratedNikayaVersionDefinition[] = [
    {
        lang: 'vi',
        type: 'original',
        author: 'Thích Minh Châu',
        label: 'Tiếng Việt - Thích Minh Châu',
    },
    {
        lang: 'en',
        type: 'original',
        author: 'Bhikkhu Sujato',
        label: 'Tiếng Anh - Bhikkhu Sujato',
    },
    {
        lang: 'vi',
        type: 'improved',
        author: 'Nhập Lưu 2026',
        label: 'Tiếng Việt - Nhập Lưu 2026',
    },
]

export function getNikayaVersionLabel(lang: NikayaLanguage, type: NikayaVersionType) {
    return CURATED_NIKAYA_VERSIONS.find(
        (version) => version.lang === lang && version.type === type
    )?.label ?? `${lang.toUpperCase()} - ${type}`
}
