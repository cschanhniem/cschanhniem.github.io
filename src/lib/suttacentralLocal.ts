// SuttaCentral Local JSON Data Access Layer
// Fetches locally stored JSON from public/data/suttacentral-json

import type { NikayaLanguage } from '@/types/nikaya'

// Type for SuttaCentral JSON response - loose typing to handle actual API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SCJsonData = any

// Manifest of available local files
let manifest: Record<string, string[]> | null = null
let manifestLoading: Promise<void> | null = null

/**
 * Initialize local data by loading the manifest
 */
export async function initLocalData() {
    if (manifest) return
    if (manifestLoading) return manifestLoading

    manifestLoading = fetch('/data/suttacentral-json/available.json')
        .then(res => {
            if (!res.ok) throw new Error('Manifest not found')
            return res.json()
        })
        .then(data => {
            manifest = data
            manifestLoading = null
        })
        .catch(err => {
            console.warn('Failed to load local Nikaya manifest:', err)
            manifest = {}
            manifestLoading = null
        })

    return manifestLoading
}

/**
 * Check if we have local JSON data for a sutta
 * Note: requires initLocalData to have been called
 */
export function hasLocalJson(suttaId: string, lang: NikayaLanguage): boolean {
    if (!manifest) return false
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return manifest[normalizedId]?.includes(lang) || false
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
    return 'other'
}

/**
 * Fetch the locally stored JSON data for a sutta
 */
export async function fetchSuttaJson(suttaId: string, lang: NikayaLanguage): Promise<SCJsonData | null> {
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    const collection = getCollection(normalizedId)
    // Author mapping logic matches fetch script
    const author = lang === 'vi' ? 'minh_chau' : 'sujato'

    const url = `/data/suttacentral-json/${collection}/${normalizedId}_${lang}_${author}.json`

    try {
        const res = await fetch(url)
        if (!res.ok) return null
        return await res.json()
    } catch (e) {
        console.error(`Error fetching local sutta ${suttaId}:`, e)
        return null
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

/**
 * Fetch raw HTML content for a sutta from local JSON
 */
export async function fetchLocalSuttaHtml(suttaId: string, lang: NikayaLanguage): Promise<string | null> {
    const json = await fetchSuttaJson(suttaId, lang)
    if (!json) return null

    const htmlContent = json.translation?.text || json.root_text?.text

    if (htmlContent) {
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

    if (json.bilara_translated_text) {
        const segments = Object.entries(json.bilara_translated_text)
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
            .map(([, text]) => `<p>${text}</p>`)
        return segments.join('\n')
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
