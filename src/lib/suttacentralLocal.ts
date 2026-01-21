// SuttaCentral Local JSON Data Access Layer
// Loads and parses locally stored JSON from SuttaCentral API

import type { NikayaLanguage } from '@/types/nikaya'

// Import JSON files statically for Vite bundling
// Vietnamese translations (Thích Minh Châu)
import mn10_vi from '@/data/suttacentral-json/mn/mn10_vi_minh_chau.json'
import mn118_vi from '@/data/suttacentral-json/mn/mn118_vi_minh_chau.json'
import dn22_vi from '@/data/suttacentral-json/dn/dn22_vi_minh_chau.json'
import sn5611_vi from '@/data/suttacentral-json/sn/sn56.11_vi_minh_chau.json'

// English translations (Sujato)
import mn10_en from '@/data/suttacentral-json/mn/mn10_en_sujato.json'
import mn118_en from '@/data/suttacentral-json/mn/mn118_en_sujato.json'
import dn22_en from '@/data/suttacentral-json/dn/dn22_en_sujato.json'
import sn5611_en from '@/data/suttacentral-json/sn/sn56.11_en_sujato.json'

// Type for SuttaCentral JSON response - loose typing to handle actual API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SCJsonData = any

// Supported languages for local JSON
type LocalJsonLanguage = 'vi' | 'en'

// Registry of available JSON data
const jsonRegistry: Record<string, Partial<Record<LocalJsonLanguage, SCJsonData>>> = {
    'mn10': { vi: mn10_vi, en: mn10_en },
    'mn118': { vi: mn118_vi, en: mn118_en },
    'dn22': { vi: dn22_vi, en: dn22_en },
    'sn56.11': { vi: sn5611_vi, en: sn5611_en },
    'sn5611': { vi: sn5611_vi, en: sn5611_en },
}

/**
 * Get the locally stored JSON data for a sutta
 */
export function getSuttaJson(suttaId: string, lang: NikayaLanguage): SCJsonData | null {
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    const suttaData = jsonRegistry[normalizedId]
    if (!suttaData) return null
    // Only vi and en are supported for local JSON
    if (lang !== 'vi' && lang !== 'en') return null
    return suttaData[lang] || null
}

/**
 * Check if we have local JSON data for a sutta
 */
export function hasLocalJson(suttaId: string, lang: NikayaLanguage): boolean {
    return getSuttaJson(suttaId, lang) !== null
}

/**
 * Parse HTML content from SuttaCentral to clean readable text
 * Converts HTML to a simple markdown-like format
 */
export function parseScHtml(html: string): string {
    if (!html) return ''

    // Create a temporary DOM to parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const article = doc.querySelector('article') || doc.body

    let result = ''

    // Process each element
    const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || ''
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return ''
        }

        const el = node as Element
        const tagName = el.tagName.toLowerCase()

        // Skip reference links and other metadata
        if (el.classList.contains('ref') || tagName === 'a') {
            if (el.classList.contains('ref')) {
                return ''
            }
        }

        // Get child content
        const childContent = Array.from(el.childNodes)
            .map(processNode)
            .join('')

        // Format based on tag
        switch (tagName) {
            case 'h1':
                return `# ${childContent.trim()}\n\n`
            case 'h2':
                return `## ${childContent.trim()}\n\n`
            case 'h3':
                return `### ${childContent.trim()}\n\n`
            case 'p':
                return `${childContent.trim()}\n\n`
            case 'br':
                return '\n'
            case 'i':
            case 'em':
                return `*${childContent}*`
            case 'b':
            case 'strong':
                return `**${childContent}**`
            case 'blockquote':
                return `> ${childContent.trim()}\n\n`
            case 'ul':
                return childContent + '\n'
            case 'ol':
                return childContent + '\n'
            case 'li':
                return `- ${childContent.trim()}\n`
            case 'header':
                return childContent
            case 'footer':
                return `\n---\n\n${childContent}`
            case 'article':
            case 'section':
            case 'div':
            case 'span':
                return childContent
            case 'a':
                // For non-ref links, just return the text
                return childContent
            default:
                return childContent
        }
    }

    result = processNode(article)

    // Clean up extra whitespace
    result = result
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+/gm, '')
        .trim()

    return result
}

/**
 * Get parsed text content for a sutta from local JSON
 */
export function getLocalSuttaText(suttaId: string, lang: NikayaLanguage): string | null {
    const json = getSuttaJson(suttaId, lang)
    if (!json) return null

    // For non-segmented content (like Thích Minh Châu), text is in root_text or translation
    const htmlContent = json.translation?.text || json.root_text?.text

    if (htmlContent) {
        return parseScHtml(htmlContent)
    }

    // For segmented content (like Sujato), text is in bilara_translated_text
    if (json.bilara_translated_text) {
        const segments = Object.entries(json.bilara_translated_text)
            .sort(([a], [b]) => {
                // Sort by segment ID (e.g., "mn10:1.1" < "mn10:1.2")
                return a.localeCompare(b, undefined, { numeric: true })
            })
            .map(([, text]) => text)

        return segments.join('\n\n')
    }

    return null
}

/**
 * Get sutta metadata from local JSON
 */
export function getLocalSuttaMetadata(suttaId: string, lang: NikayaLanguage) {
    const json = getSuttaJson(suttaId, lang)
    if (!json) return null

    const translation = json.translation || json.root_text
    const suttaplex = json.suttaplex

    return {
        title: translation?.title || suttaplex?.translated_title || suttaplex?.original_title || '',
        author: translation?.author || '',
        author_uid: translation?.author_uid || '',
        paliTitle: suttaplex?.original_title || '',
        acronym: suttaplex?.acronym || '',
        blurb: suttaplex?.blurb || '',
    }
}

/**
 * Get list of available languages for a sutta from local JSON
 */
export function getAvailableLocalLanguages(suttaId: string): NikayaLanguage[] {
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    const suttaData = jsonRegistry[normalizedId]

    if (!suttaData) return []

    return (Object.entries(suttaData) as [NikayaLanguage, SCJsonData | null][])
        .filter(([, data]) => data !== null)
        .map(([lang]) => lang)
}
