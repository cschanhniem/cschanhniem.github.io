import type { NikayaLanguage } from '@/types/nikaya'

const improvedTranslationAvailability: Record<string, readonly NikayaLanguage[]> = {
  mn10: ['vi'],
  dn22: ['vi'],
  mn118: ['vi'],
  sn5611: ['vi'],
}

export function normalizeSuttaId(suttaId: string): string {
  return suttaId.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function getAvailableImprovedLanguages(suttaId: string): readonly NikayaLanguage[] {
  return improvedTranslationAvailability[normalizeSuttaId(suttaId)] || []
}

export function hasImprovedLanguage(suttaId: string, lang: NikayaLanguage): boolean {
  return getAvailableImprovedLanguages(suttaId).includes(lang)
}

export const IMPROVED_VI_TRANSLATION_IDS = new Set(
  Object.entries(improvedTranslationAvailability)
    .filter(([, langs]) => langs.includes('vi'))
    .map(([suttaId]) => suttaId)
)
