import type { NikayaLanguage } from '@/types/nikaya'
import { viImproved } from './vi'

export function normalizeSuttaId(suttaId: string): string {
  return suttaId.toLowerCase().replace(/\s+/g, '')
}

const improvedTranslationAvailability: Record<string, readonly NikayaLanguage[]> = Object.freeze(
  Object.fromEntries(
    Object.keys(viImproved).map((suttaId) => [suttaId, ['vi'] as const])
  )
)

export function getAvailableImprovedLanguages(suttaId: string): readonly NikayaLanguage[] {
  return improvedTranslationAvailability[normalizeSuttaId(suttaId)] || []
}

export function hasImprovedLanguage(suttaId: string, lang: NikayaLanguage): boolean {
  return getAvailableImprovedLanguages(suttaId).includes(lang)
}

export const IMPROVED_VI_TRANSLATION_IDS = new Set(Object.keys(viImproved))
