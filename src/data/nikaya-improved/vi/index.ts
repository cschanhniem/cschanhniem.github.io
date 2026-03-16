// Improved Vietnamese Translations Index
// NhậpLưu 2026 Translation Project

import type { ImprovedTranslation } from '@/types/nikaya'

function normalizeImprovedId(suttaId: string): string {
    return suttaId.toLowerCase().replace(/\s+/g, '')
}

function isImprovedTranslation(value: unknown): value is ImprovedTranslation {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Partial<ImprovedTranslation>
    return (
        typeof candidate.suttaId === 'string' &&
        typeof candidate.lang === 'string' &&
        typeof candidate.author === 'string' &&
        typeof candidate.year === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.content === 'string'
    )
}

const translationModules = import.meta.glob<Record<string, unknown>>(
    ['./*.ts', '!./index.ts'],
    { eager: true }
)

const translations = Object.values(translationModules)
    .flatMap((moduleExports) => Object.values(moduleExports))
    .filter(isImprovedTranslation)

export const viImproved: Record<string, ImprovedTranslation> = Object.freeze(
    Object.fromEntries(
        translations.map((translation) => [
            normalizeImprovedId(translation.suttaId),
            translation,
        ])
    )
)

// Get improved translation by sutta ID
export function getImprovedVi(suttaId: string): ImprovedTranslation | null {
    const normalizedId = normalizeImprovedId(suttaId)
    return viImproved[normalizedId] || null
}
