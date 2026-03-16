// SuttaCentral Local JSON Data Access Layer
// Fetches locally stored JSON from public/data/suttacentral-json

import type { NikayaLanguage, SCSuttaplex } from '@/types/nikaya'

// Type for SuttaCentral JSON response - loose typing to handle actual API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SCJsonData = any

// Manifest of available local files
let fileManifest: Record<string, string[]> | null = null
let rawContentManifest: Record<string, string[]> | null = null
let effectiveContentManifest: Record<string, string[]> | null = null
let aliasManifest: Record<string, Partial<Record<NikayaLanguage, string>>> | null = null
let indexById: Record<string, { id: string; title: string; paliTitle?: string; blurb?: string }> | null = null
let groupedCanonicalRoutes: Set<string> | null = null
let manifestLoading: Promise<void> | null = null

/**
 * Initialize local data by loading the manifest
 */
export async function initLocalData() {
    if (fileManifest && rawContentManifest && effectiveContentManifest && aliasManifest && indexById) return
    if (manifestLoading) return manifestLoading

    manifestLoading = Promise.all([
        fetch('/data/suttacentral-json/available.json'),
        fetch('/data/suttacentral-json/content-availability.json'),
        fetch('/data/suttacentral-json/effective-content-availability.json'),
        fetch('/data/suttacentral-json/canonical-aliases.json'),
        fetch('/data/suttacentral-json/nikaya_index.json'),
    ])
        .then(async ([fileRes, rawContentRes, effectiveContentRes, aliasRes, indexRes]) => {
            if (!fileRes.ok) throw new Error('File manifest not found')
            if (!rawContentRes.ok) throw new Error('Content manifest not found')
            if (!effectiveContentRes.ok) throw new Error('Effective content manifest not found')
            if (!aliasRes.ok) throw new Error('Canonical alias manifest not found')
            if (!indexRes.ok) throw new Error('Nikaya index not found')
            return Promise.all([fileRes.json(), rawContentRes.json(), effectiveContentRes.json(), aliasRes.json(), indexRes.json()])
        })
        .then(([fileData, rawContentData, effectiveContentData, aliasData, indexData]) => {
            fileManifest = fileData
            rawContentManifest = rawContentData
            effectiveContentManifest = effectiveContentData
            aliasManifest = aliasData
            indexById = Object.fromEntries(
                (Array.isArray(indexData) ? indexData : []).map((item: { id: string; title: string; paliTitle?: string; blurb?: string }) => [item.id, item])
            )
            groupedCanonicalRoutes = new Set(
                Object.entries(aliasData as Record<string, Partial<Record<NikayaLanguage, string>>>).flatMap(([childId, canonicalByLang]) =>
                    Object.values(canonicalByLang ?? {})
                        .filter((canonicalId): canonicalId is string => typeof canonicalId === 'string' && canonicalId.length > 0)
                        .filter((canonicalId) => canonicalId !== childId)
                )
            )
            manifestLoading = null
        })
        .catch(err => {
            console.warn('Failed to load local Nikaya manifest:', err)
            fileManifest = {}
            rawContentManifest = {}
            effectiveContentManifest = {}
            aliasManifest = {}
            indexById = {}
            groupedCanonicalRoutes = new Set()
            manifestLoading = null
        })

    return manifestLoading
}

/**
 * Check if we have local JSON data for a sutta
 * Note: requires initLocalData to have been called
 */
export function hasLocalJson(suttaId: string, lang: NikayaLanguage): boolean {
    if (!fileManifest) return false
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return fileManifest[normalizedId]?.includes(lang) || false
}

/**
 * Check if we have local readable content for a sutta
 */
export function hasLocalContent(suttaId: string, lang: NikayaLanguage): boolean {
    if (!effectiveContentManifest) return false
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return effectiveContentManifest[normalizedId]?.includes(lang) || false
}

function hasRawLocalContent(suttaId: string, lang: NikayaLanguage): boolean {
    if (!rawContentManifest) return false
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return rawContentManifest[normalizedId]?.includes(lang) || false
}

/**
 * Helper to get collection from ID
 */
function getCollection(suttaId: string): string {
    const id = suttaId.toLowerCase().replace(/\s+/g, '')
    if (id.startsWith('dn')) return 'dn'
    if (id.startsWith('mn')) return 'mn'
    if (id.startsWith('sn')) return 'sn'
    if (id.startsWith('an')) return 'an'
    if (/^(kp|dhp|ud|iti|snp)/.test(id)) return 'kn'
    return 'other'
}

function getCanonicalAlias(suttaId: string, lang: NikayaLanguage): string | null {
    if (!aliasManifest) return null
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return aliasManifest[normalizedId]?.[lang] || null
}

export function isGroupedCanonicalFallbackRoute(suttaId: string): boolean {
    if (!groupedCanonicalRoutes) return false
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return groupedCanonicalRoutes.has(normalizedId)
}

function getIndexRow(suttaId: string) {
    if (!indexById) return null
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return indexById[normalizedId] || null
}

function formatSuttaCode(suttaId: string): string {
    const match = suttaId.match(/^([a-z]+)(.+)$/i)
    if (!match) return suttaId.toUpperCase()
    return `${match[1].toUpperCase()} ${match[2]}`
}

function pickNonEmptyString(...values: unknown[]): string | undefined {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim()
        }
    }

    return undefined
}

function buildLocalSuttaUrl(suttaId: string, lang: NikayaLanguage): string {
    const collection = getCollection(suttaId)
    const author = lang === 'vi' ? 'minh_chau' : 'sujato'
    return `/data/suttacentral-json/${collection}/${suttaId}_${lang}_${author}.json`
}

/**
 * Fetch the locally stored JSON data for a sutta
 */
export async function fetchSuttaJson(suttaId: string, lang: NikayaLanguage): Promise<SCJsonData | null> {
    await initLocalData()

    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    const canonicalAlias = getCanonicalAlias(normalizedId, lang)
    const candidateIds: string[] = []

    if (hasRawLocalContent(normalizedId, lang) || !canonicalAlias) {
        candidateIds.push(normalizedId)
    }

    if (canonicalAlias && canonicalAlias !== normalizedId) {
        candidateIds.push(canonicalAlias)
    }

    if (!candidateIds.includes(normalizedId)) {
        candidateIds.push(normalizedId)
    }

    for (const candidateId of candidateIds) {
        const url = buildLocalSuttaUrl(candidateId, lang)

        try {
            const res = await fetch(url)
            if (!res.ok) continue
            return await res.json()
        } catch (e) {
            console.error(`Error fetching local sutta ${candidateId}:`, e)
        }
    }

    return null
}

export async function fetchLocalSuttaMetadata(suttaId: string): Promise<SCSuttaplex | null> {
    await initLocalData()

    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    const indexRow = getIndexRow(normalizedId)
    const localJson = await fetchSuttaJson(normalizedId, 'vi') ?? await fetchSuttaJson(normalizedId, 'en')

    if (!indexRow && !localJson) {
        return null
    }

    const suttaplex = localJson?.suttaplex
    const translation = localJson?.translation

    return {
        uid: pickNonEmptyString(indexRow?.id, translation?.uid, suttaplex?.uid, normalizedId) || normalizedId,
        acronym: pickNonEmptyString(formatSuttaCode(normalizedId), suttaplex?.acronym) || formatSuttaCode(normalizedId),
        original_title: pickNonEmptyString(indexRow?.paliTitle, indexRow?.title, suttaplex?.original_title, normalizedId) || normalizedId,
        translated_title: pickNonEmptyString(indexRow?.title, translation?.title, suttaplex?.translated_title),
        blurb: pickNonEmptyString(indexRow?.blurb, suttaplex?.blurb, '') || '',
        difficulty: typeof suttaplex?.difficulty === 'object' ? suttaplex.difficulty : undefined,
        translations: Array.isArray(suttaplex?.translations) ? suttaplex.translations : [],
        parallel_count: typeof suttaplex?.parallel_count === 'number' ? suttaplex.parallel_count : 0,
    }
}

/**
 * Parse HTML content from SuttaCentral to clean readable text
 */
export function parseScHtml(html: string): string {
    if (!html) return ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const article = doc.querySelector('article') || doc.body

    // Logic matches previous implementation... 
    // Simplified for brevity, but essentially extracting text
    return article.textContent || ''
}

function composeBilaraHtmlSegment(template: string, content?: string): string {
    if (!template.includes('{}')) {
        return template
    }

    return template.replace('{}', content ?? '')
}

function getOrderedBilaraKeys(data: SCJsonData): string[] {
    if (Array.isArray(data.keys_order)) {
        return data.keys_order.filter((key: unknown): key is string => typeof key === 'string')
    }

    if (data.html_text && typeof data.html_text === 'object') {
        return Object.keys(data.html_text)
    }

    if (data.translation_text && typeof data.translation_text === 'object') {
        return Object.keys(data.translation_text)
    }

    if (data.bilara_translated_text && typeof data.bilara_translated_text === 'object') {
        return Object.keys(data.bilara_translated_text)
    }

    return []
}

function extractBilaraHtml(data: SCJsonData): string {
    const orderedKeys = getOrderedBilaraKeys(data)
    if (orderedKeys.length === 0) return ''

    const translationSegments = data.translation_text && typeof data.translation_text === 'object'
        ? data.translation_text
        : data.bilara_translated_text && typeof data.bilara_translated_text === 'object'
            ? data.bilara_translated_text
            : null
    const rootSegments = data.root_text && typeof data.root_text === 'object'
        ? data.root_text
        : null

    if (data.html_text && typeof data.html_text === 'object') {
        return orderedKeys
            .filter((key) => key in data.html_text)
            .map((key) => {
                const template = data.html_text[key]
                if (typeof template !== 'string') return ''

                if (!template.includes('{}')) {
                    return template
                }

                const content = translationSegments?.[key] ?? rootSegments?.[key] ?? ''
                return composeBilaraHtmlSegment(template, typeof content === 'string' ? content : '')
            })
            .join('')
    }

    if (!translationSegments) {
        return ''
    }

    return orderedKeys
        .filter((key) => key in translationSegments)
        .map((key) => {
            const segment = translationSegments[key]
            return typeof segment === 'string' && segment.trim() ? `<p>${segment}</p>` : ''
        })
        .join('\n')
}

/**
 * Fetch raw HTML content for a sutta from local JSON
 */
export async function fetchLocalSuttaHtml(suttaId: string, lang: NikayaLanguage): Promise<string | null> {
    const json = await fetchSuttaJson(suttaId, lang)
    if (!json) return null

    // Strategy 1: Look for HTML content in text fields
    const htmlContent = json.translation?.text || json.root_text?.text

    if (htmlContent && typeof htmlContent === 'string') {
        // Return raw HTML, strip refs
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')
        const article = doc.querySelector('article')
        if (article) {
            article.querySelectorAll('a.ref').forEach(el => el.remove())
            return article.innerHTML
        }
        return htmlContent
    }

    // Strategy 2: Bilara template HTML + segment text
    const bilaraHtml = extractBilaraHtml(json)
    if (bilaraHtml.trim()) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(bilaraHtml, 'text/html')
        const article = doc.querySelector('article')
        if (article) {
            article.querySelectorAll('a.ref').forEach(el => el.remove())
            return article.innerHTML
        }
        return bilaraHtml
    }

    return null
}

/**
 * Fetch text content (legacy)
 */
export async function fetchLocalSuttaText(suttaId: string, lang: NikayaLanguage): Promise<string | null> {
    const html = await fetchLocalSuttaHtml(suttaId, lang)
    if (!html) return null
    return parseScHtml(html)
}
