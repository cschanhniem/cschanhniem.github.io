// SuttaCentral Local JSON Data Access Layer
// Fetches locally stored JSON from public/data/suttacentral-json

import type { NikayaLanguage } from '@/types/nikaya'

// Type for SuttaCentral JSON response - loose typing to handle actual API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SCJsonData = any

// Manifest of available local files
let fileManifest: Record<string, string[]> | null = null
let contentManifest: Record<string, string[]> | null = null
let manifestLoading: Promise<void> | null = null

/**
 * Initialize local data by loading the manifest
 */
export async function initLocalData() {
    if (fileManifest && contentManifest) return
    if (manifestLoading) return manifestLoading

    manifestLoading = Promise.all([
        fetch('/data/suttacentral-json/available.json'),
        fetch('/data/suttacentral-json/content-availability.json'),
    ])
        .then(async ([fileRes, contentRes]) => {
            if (!fileRes.ok) throw new Error('File manifest not found')
            if (!contentRes.ok) throw new Error('Content manifest not found')
            return Promise.all([fileRes.json(), contentRes.json()])
        })
        .then(([fileData, contentData]) => {
            fileManifest = fileData
            contentManifest = contentData
            manifestLoading = null
        })
        .catch(err => {
            console.warn('Failed to load local Nikaya manifest:', err)
            fileManifest = {}
            contentManifest = {}
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
    if (!contentManifest) return false
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return contentManifest[normalizedId]?.includes(lang) || false
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
