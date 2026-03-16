// SuttaCentral API Service
// Fetches original translations from suttacentral.net

import type { SCSuttaplex, NikayaLanguage } from '@/types/nikaya'
import { fetchLocalSuttaMetadata } from '@/lib/suttacentralLocal'

const SC_API_BASE = 'https://suttacentral.net/api'

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

function tokenizeSegmentKey(value: string): string[] {
    return String(value)
        .toLowerCase()
        .match(/[a-z]+|\d+|[^a-z\d]+/g) || [String(value).toLowerCase()]
}

function compareSegmentKeys(left: string, right: string): number {
    const leftTokens = tokenizeSegmentKey(left)
    const rightTokens = tokenizeSegmentKey(right)
    const maxLength = Math.max(leftTokens.length, rightTokens.length)

    for (let index = 0; index < maxLength; index++) {
        const leftToken = leftTokens[index]
        const rightToken = rightTokens[index]

        if (leftToken === undefined || rightToken === undefined) {
            if (leftToken === rightToken) return 0
            return leftToken === undefined ? -1 : 1
        }

        if (leftToken === rightToken) continue

        const leftNumber = /^\d+$/.test(leftToken) ? Number(leftToken) : null
        const rightNumber = /^\d+$/.test(rightToken) ? Number(rightToken) : null

        if (leftNumber !== null && rightNumber !== null) {
            return leftNumber - rightNumber
        }

        return leftToken.localeCompare(rightToken)
    }

    return 0
}

function getCached<T>(key: string): T | null {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as T
    }
    return null
}

function setCache(key: string, data: unknown): void {
    cache.set(key, { data, timestamp: Date.now() })
    // Also persist to localStorage for offline access
    try {
        localStorage.setItem(`sc_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {
        // localStorage might be full or unavailable
    }
}

function getLocalCache<T>(key: string): T | null {
    try {
        const stored = localStorage.getItem(`sc_cache_${key}`)
        if (stored) {
            const { data, timestamp } = JSON.parse(stored)
            if (Date.now() - timestamp < CACHE_TTL) {
                return data as T
            }
        }
    } catch {
        // localStorage unavailable
    }
    return null
}

function pickNonEmptyString(...values: unknown[]): string | undefined {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim()
        }
    }

    return undefined
}

function mergeMetadata(
    suttaId: string,
    remote: SCSuttaplex | null,
    fallback: SCSuttaplex | null
): SCSuttaplex | null {
    if (!remote && !fallback) return null

    return {
        uid: pickNonEmptyString(remote?.uid, fallback?.uid, suttaId) || suttaId,
        acronym: pickNonEmptyString(remote?.acronym, fallback?.acronym, suttaId.toUpperCase()) || suttaId.toUpperCase(),
        original_title: pickNonEmptyString(remote?.original_title, fallback?.original_title, suttaId) || suttaId,
        translated_title: pickNonEmptyString(remote?.translated_title, fallback?.translated_title),
        blurb: pickNonEmptyString(remote?.blurb, fallback?.blurb, '') || '',
        difficulty: typeof remote?.difficulty === 'object' ? remote.difficulty : fallback?.difficulty,
        translations: Array.isArray(remote?.translations) && remote.translations.length > 0
            ? remote.translations
            : Array.isArray(fallback?.translations)
                ? fallback.translations
                : [],
        parallel_count: typeof remote?.parallel_count === 'number'
            ? remote.parallel_count
            : typeof fallback?.parallel_count === 'number'
                ? fallback.parallel_count
                : 0,
    }
}

/**
 * Get sutta metadata and available translations
 */
export async function getSuttaMetadata(suttaId: string): Promise<SCSuttaplex | null> {
    const cacheKey = `suttaplex_${suttaId}`
    const fallbackPromise = fetchLocalSuttaMetadata(suttaId)

    // Check memory cache
    let cached = getCached<SCSuttaplex[] | SCSuttaplex>(cacheKey)
    if (cached) {
        const remote = Array.isArray(cached) ? cached[0] || null : cached
        return mergeMetadata(suttaId, remote, await fallbackPromise)
    }

    // Check localStorage cache
    cached = getLocalCache<SCSuttaplex[] | SCSuttaplex>(cacheKey)
    if (cached) {
        const remote = Array.isArray(cached) ? cached[0] || null : cached
        return mergeMetadata(suttaId, remote, await fallbackPromise)
    }

    try {
        const response = await fetch(`${SC_API_BASE}/suttaplex/${suttaId}`)
        const fallback = await fallbackPromise
        if (!response.ok) return mergeMetadata(suttaId, null, fallback)

        const data = await response.json() as SCSuttaplex[]
        setCache(cacheKey, data)
        return mergeMetadata(suttaId, data[0] || null, fallback)
    } catch (error) {
        console.error('Failed to fetch sutta metadata:', error)
        return mergeMetadata(suttaId, null, await fallbackPromise)
    }
}

/**
 * Get the original translation text from SuttaCentral
 */
export async function getSuttaText(
    suttaId: string,
    authorUid: string,
    lang: NikayaLanguage
): Promise<string | null> {
    const cacheKey = `text_${suttaId}_${authorUid}_${lang}`

    // Check caches
    let cached = getCached<string>(cacheKey)
    if (cached) return cached

    cached = getLocalCache<string>(cacheKey)
    if (cached) return cached

    try {
        // Try the bilara endpoint first (for segmented texts)
        const bilaraResponse = await fetch(`${SC_API_BASE}/bilarasuttas/${suttaId}/${authorUid}?lang=${lang}`)

        if (bilaraResponse.ok) {
            const bilaraData = await bilaraResponse.json()
            // Bilara returns segmented text - we need to combine it
            const text = extractBilaraText(bilaraData)
            if (text) {
                setCache(cacheKey, text)
                return text
            }
        }

        // Fall back to the legacy HTML endpoint
        const htmlResponse = await fetch(`https://suttacentral.net/${suttaId}/${lang}/${authorUid}`)
        if (htmlResponse.ok) {
            const html = await htmlResponse.text()
            const text = extractTextFromHtml(html)
            setCache(cacheKey, text)
            return text
        }

        return null
    } catch (error) {
        console.error('Failed to fetch sutta text:', error)
        return null
    }
}

/**
 * Extract readable text from Bilara segmented data
 */
function extractBilaraText(data: Record<string, unknown>): string | null {
    try {
        // Bilara data has segments as key-value pairs
        const segments: string[] = []

        // Sort by segment key to maintain order
        const keys = Object.keys(data).filter(k => k.includes(':')).sort((a, b) => {
            const [, aNum] = a.split(':')
            const [, bNum] = b.split(':')
            return compareSegmentKeys(aNum || a, bNum || b)
        })

        for (const key of keys) {
            const segment = data[key]
            if (typeof segment === 'string' && segment.trim()) {
                segments.push(segment.trim())
            }
        }

        if (segments.length === 0) return null
        return segments.join('\n\n')
    } catch {
        return null
    }
}

/**
 * Extract text content from HTML (basic extraction)
 */
function extractTextFromHtml(html: string): string {
    // Create a temporary element to parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html')

    // Try to find the main content
    const article = doc.querySelector('article') || doc.querySelector('.sutta') || doc.body

    // Remove scripts and styles
    article.querySelectorAll('script, style, nav, header, footer').forEach(el => el.remove())

    return article.textContent?.trim() || ''
}

/**
 * Get list of available translations for a sutta
 */
export async function getAvailableTranslations(suttaId: string): Promise<{
    lang: NikayaLanguage
    author: string
    authorUid: string
    title?: string
}[]> {
    const metadata = await getSuttaMetadata(suttaId)
    if (!metadata?.translations) return []

    const supportedLangs = ['en', 'vi', 'zh', 'es', 'pli']

    return metadata.translations
        .filter(t => supportedLangs.includes(t.lang))
        .map(t => ({
            lang: t.lang as NikayaLanguage,
            author: t.author,
            authorUid: t.author_uid,
            title: t.title
        }))
}

/**
 * Search suttas by keyword
 */
export async function searchSuttas(query: string, collection?: string): Promise<SCSuttaplex[]> {
    const cacheKey = `search_${query}_${collection || 'all'}`

    const cached = getCached<SCSuttaplex[]>(cacheKey)
    if (cached) return cached

    try {
        const params = new URLSearchParams({ query, limit: '50' })
        if (collection) params.set('category', collection)

        const response = await fetch(`${SC_API_BASE}/search/${query}?${params}`)
        if (!response.ok) return []

        const data = await response.json()
        const results = data.hits || []
        setCache(cacheKey, results)
        return results
    } catch {
        return []
    }
}
