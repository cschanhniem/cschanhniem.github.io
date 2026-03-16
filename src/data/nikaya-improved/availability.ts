import type { NikayaLanguage } from '@/types/nikaya'

const improvedTranslationAvailability: Record<string, readonly NikayaLanguage[]> = {
  'an1.1': ['vi'],
  'an1.2': ['vi'],
  'an1.3': ['vi'],
  'an1.4': ['vi'],
  'an1.5': ['vi'],
  'an1.6': ['vi'],
  'an1.7': ['vi'],
  'an1.8': ['vi'],
  'an1.9': ['vi'],
  'an1.10': ['vi'],
  mn1: ['vi'],
  mn2: ['vi'],
  mn3: ['vi'],
  mn4: ['vi'],
  mn5: ['vi'],
  dn1: ['vi'],
  dn2: ['vi'],
  dn3: ['vi'],
  dn4: ['vi'],
  dn5: ['vi'],
  dn6: ['vi'],
  dn7: ['vi'],
  dn8: ['vi'],
  dn9: ['vi'],
  dn10: ['vi'],
  dn11: ['vi'],
  dn12: ['vi'],
  dn13: ['vi'],
  dn14: ['vi'],
  dn15: ['vi'],
  dn16: ['vi'],
  dn17: ['vi'],
  dn18: ['vi'],
  dn19: ['vi'],
  dn20: ['vi'],
  dn21: ['vi'],
  mn10: ['vi'],
  dn22: ['vi'],
  dn23: ['vi'],
  dn24: ['vi'],
  dn25: ['vi'],
  dn26: ['vi'],
  dn27: ['vi'],
  dn28: ['vi'],
  dn29: ['vi'],
  dn30: ['vi'],
  dn31: ['vi'],
  dn32: ['vi'],
  dn33: ['vi'],
  dn34: ['vi'],
  kp1: ['vi'],
  kp2: ['vi'],
  kp3: ['vi'],
  kp4: ['vi'],
  kp5: ['vi'],
  kp6: ['vi'],
  kp7: ['vi'],
  kp8: ['vi'],
  kp9: ['vi'],
  mn118: ['vi'],
  'sn12.2': ['vi'],
  'sn12.15': ['vi'],
  'sn22.59': ['vi'],
  'sn35.28': ['vi'],
  'sn47.42': ['vi'],
  'sn56.1': ['vi'],
  'sn56.11': ['vi'],
}

export function normalizeSuttaId(suttaId: string): string {
  return suttaId.toLowerCase().replace(/\s+/g, '')
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
