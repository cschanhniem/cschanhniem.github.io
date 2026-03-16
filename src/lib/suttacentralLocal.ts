// SuttaCentral Local JSON Data Access Layer
// Fetches locally stored JSON from public/data/suttacentral-json

import type { NikayaLanguage, SCSuttaplex } from '@/types/nikaya'

// Type for SuttaCentral JSON response - loose typing to handle actual API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SCJsonData = any
export type LocalOriginalContentRenderMode = 'exact' | 'scoped-grouped' | 'opaque-grouped' | 'missing'

export interface LocalOriginalContentResolution {
    html: string | null
    mode: LocalOriginalContentRenderMode
    sourceSuttaId: string | null
    sourceFileId: string | null
}

// Manifest of available local files
let fileManifest: Record<string, string[]> | null = null
let rawContentManifest: Record<string, string[]> | null = null
let effectiveContentManifest: Record<string, string[]> | null = null
let aliasManifest: Record<string, Partial<Record<NikayaLanguage, string>>> | null = null
let indexById: Record<string, { id: string; title: string; paliTitle?: string; blurb?: string }> | null = null
let groupedCanonicalRoutes: Set<string> | null = null
let manifestLoading: Promise<void> | null = null

function normalizeSuttaIdValue(suttaId: string): string {
    return suttaId.toLowerCase().replace(/\s+/g, '')
}

function normalizeOptionalSuttaId(value: unknown): string | null {
    if (typeof value !== 'string') return null
    const normalized = normalizeSuttaIdValue(value)
    return normalized || null
}

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
    const normalizedId = normalizeSuttaIdValue(suttaId)
    return fileManifest[normalizedId]?.includes(lang) || false
}

/**
 * Check if we have local readable content for a sutta
 */
export function hasLocalContent(suttaId: string, lang: NikayaLanguage): boolean {
    if (!effectiveContentManifest) return false
    const normalizedId = normalizeSuttaIdValue(suttaId)
    return effectiveContentManifest[normalizedId]?.includes(lang) || false
}

function hasRawLocalContent(suttaId: string, lang: NikayaLanguage): boolean {
    if (!rawContentManifest) return false
    const normalizedId = normalizeSuttaIdValue(suttaId)
    return rawContentManifest[normalizedId]?.includes(lang) || false
}

/**
 * Helper to get collection from ID
 */
function getCollection(suttaId: string): string {
    const id = normalizeSuttaIdValue(suttaId)
    if (/^(kp|dhp|ud|iti|snp)/.test(id)) return 'kn'
    if (id.startsWith('dn')) return 'dn'
    if (id.startsWith('mn')) return 'mn'
    if (id.startsWith('sn')) return 'sn'
    if (id.startsWith('an')) return 'an'
    return 'other'
}

function getCanonicalAlias(suttaId: string, lang: NikayaLanguage): string | null {
    if (!aliasManifest) return null
    const normalizedId = normalizeSuttaIdValue(suttaId)
    return aliasManifest[normalizedId]?.[lang] || null
}

export function getCanonicalAliasForLanguage(suttaId: string, lang: NikayaLanguage): string | null {
    return getCanonicalAlias(suttaId, lang)
}

export function isGroupedCanonicalFallbackRoute(suttaId: string): boolean {
    if (!groupedCanonicalRoutes) return false
    const normalizedId = normalizeSuttaIdValue(suttaId)
    return groupedCanonicalRoutes.has(normalizedId)
}

function getIndexRow(suttaId: string) {
    if (!indexById) return null
    const normalizedId = normalizeSuttaIdValue(suttaId)
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

function getLocalJsonCandidateIds(suttaId: string, lang: NikayaLanguage): string[] {
    const normalizedId = normalizeSuttaIdValue(suttaId)
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

    return candidateIds
}

async function fetchResolvedSuttaJson(suttaId: string, lang: NikayaLanguage): Promise<{ json: SCJsonData; sourceFileId: string } | null> {
    await initLocalData()
    const normalizedRouteId = normalizeSuttaIdValue(suttaId)
    let fallbackResult: { json: SCJsonData; sourceFileId: string } | null = null

    for (const candidateId of getLocalJsonCandidateIds(normalizedRouteId, lang)) {
        const url = buildLocalSuttaUrl(candidateId, lang)

        try {
            const res = await fetch(url)
            if (!res.ok) continue
            const resolved = {
                json: await res.json(),
                sourceFileId: candidateId,
            }
            if (!fallbackResult) {
                fallbackResult = resolved
            }
            if (hasRenderableResolvedContent(resolved.json, normalizedRouteId, candidateId)) {
                return resolved
            }
        } catch (e) {
            console.error(`Error fetching local sutta ${candidateId}:`, e)
        }
    }

    return fallbackResult
}

/**
 * Fetch the locally stored JSON data for a sutta
 */
export async function fetchSuttaJson(suttaId: string, lang: NikayaLanguage): Promise<SCJsonData | null> {
    const resolved = await fetchResolvedSuttaJson(suttaId, lang)
    return resolved?.json || null
}

export async function fetchLocalSuttaMetadata(suttaId: string): Promise<SCSuttaplex | null> {
    await initLocalData()

    const normalizedId = normalizeSuttaIdValue(suttaId)
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
        return data.keys_order.filter((key: unknown): key is string => typeof key === 'string' && key.includes(':'))
    }

    if (data.html_text && typeof data.html_text === 'object') {
        return Object.keys(data.html_text).filter((key) => key.includes(':'))
    }

    if (data.translation_text && typeof data.translation_text === 'object') {
        return Object.keys(data.translation_text).filter((key) => key.includes(':'))
    }

    if (data.bilara_translated_text && typeof data.bilara_translated_text === 'object') {
        return Object.keys(data.bilara_translated_text).filter((key) => key.includes(':'))
    }

    return []
}

function parseRouteNumericSuffix(id: string): { prefix: string; number: number } | null {
    const normalizedId = normalizeSuttaIdValue(id)
    const match = normalizedId.match(/^(.*?)(\d+)$/)
    if (!match) return null

    return {
        prefix: match[1],
        number: Number(match[2]),
    }
}

function parseRangeRouteId(id: string): { prefix: string; start: number; end: number } | null {
    const normalizedId = normalizeSuttaIdValue(id)
    const match = normalizedId.match(/^(.*?)(\d+)-(\d+)$/)
    if (!match) return null

    return {
        prefix: match[1],
        start: Number(match[2]),
        end: Number(match[3]),
    }
}

function parseTtcRangeLabel(label: string): { start: number; end: number } | null {
    const normalizedLabel = label.replace(/[–—]/g, '-')
    const match = normalizedLabel.match(/TTC\s+(\d+)(?:\s*-\s*(\d+))?/i)
    if (!match) return null

    const start = Number(match[1])
    const end = Number(match[2] ?? match[1])
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null

    return { start, end }
}

function getRoutePositionWithinSourceRange(routeId: string, sourceId?: string): number | null {
    if (!sourceId) return null

    const route = parseRouteNumericSuffix(routeId)
    const range = parseRangeRouteId(sourceId)
    if (!route || !range || route.prefix !== range.prefix || route.number < range.start || route.number > range.end) {
        return null
    }

    return route.number - range.start + 1
}

function getSourceRouteSpan(sourceId?: string): number | null {
    if (!sourceId) return null

    const range = parseRangeRouteId(sourceId)
    if (!range) return null
    return range.end - range.start + 1
}

function ttcRangesCoverFullSource(ttcRanges: Array<{ start: number; end: number }>, sourceId?: string): boolean {
    const routeSpan = getSourceRouteSpan(sourceId)
    if (!routeSpan || ttcRanges.length === 0) return false

    const sortedRanges = [...ttcRanges].sort((left, right) => left.start - right.start)
    let expectedStart = 1

    for (const range of sortedRanges) {
        if (range.start !== expectedStart || range.end < range.start) {
            return false
        }

        expectedStart = range.end + 1
    }

    return expectedStart - 1 === routeSpan
}

function getGroupedRangeSectionKeys(orderedKeys: string[], routeId: string, sourceId?: string): string[] {
    if (!sourceId) return []

    const route = parseRouteNumericSuffix(routeId)
    const range = parseRangeRouteId(sourceId)

    if (!route || !range || route.prefix !== range.prefix || route.number < range.start || route.number > range.end) {
        return []
    }

    const childIndex = route.number - range.start + 1
    const childPattern = new RegExp(`^${childIndex}(?:\\.|$)`)

    return orderedKeys.filter((key) => {
        const [, segmentSuffix = ''] = key.split(':')
        return childPattern.test(segmentSuffix)
    })
}

type BilaraSelectionKind = 'full' | 'route-prefix' | 'range-prefix' | 'range-section'

function getGroupedRangePrefixKeys(orderedKeys: string[], routeId: string): string[] {
    const route = parseRouteNumericSuffix(routeId)
    if (!route) return []

    const rangePrefixes = [...new Set(
        orderedKeys
            .map((key) => String(key).split(':')[0] || '')
            .filter(Boolean)
    )]
        .map((prefix) => {
            const range = parseRangeRouteId(prefix)
            if (!range) return null
            if (range.prefix !== route.prefix || route.number < range.start || route.number > range.end) return null

            return {
                prefix,
                span: range.end - range.start,
            }
        })
        .filter((entry): entry is { prefix: string; span: number } => Boolean(entry))
        .sort((left, right) => left.span - right.span)

    const bestPrefix = rangePrefixes[0]?.prefix
    if (!bestPrefix) return []

    return orderedKeys.filter((key) => key.startsWith(`${bestPrefix}:`))
}

function getScopedBilaraSelection(data: SCJsonData, routeId?: string, sourceId?: string): { keys: string[]; selectionKind: BilaraSelectionKind } {
    const orderedKeys = getOrderedBilaraKeys(data)
    if (!routeId) {
        return {
            keys: orderedKeys,
            selectionKind: 'full',
        }
    }

    const scopedKeys = orderedKeys.filter((key) => key.startsWith(`${routeId}:`))
    if (scopedKeys.length > 0) {
        return {
            keys: scopedKeys,
            selectionKind: 'route-prefix',
        }
    }

    const groupedRangePrefixKeys = getGroupedRangePrefixKeys(orderedKeys, routeId)
    if (groupedRangePrefixKeys.length > 0) {
        return {
            keys: groupedRangePrefixKeys,
            selectionKind: 'range-prefix',
        }
    }

    const rangeSectionKeys = getGroupedRangeSectionKeys(orderedKeys, routeId, sourceId)
    if (rangeSectionKeys.length > 0) {
        return {
            keys: rangeSectionKeys,
            selectionKind: 'range-section',
        }
    }

    return {
        keys: orderedKeys,
        selectionKind: 'full',
    }
}

function canUseOpaqueGroupedBilaraFallback(data: SCJsonData, routeId: string, sourceId?: string): boolean {
    if (!sourceId || normalizeSuttaIdValue(routeId) === normalizeSuttaIdValue(sourceId)) {
        return true
    }

    const orderedKeys = getOrderedBilaraKeys(data)
    if (orderedKeys.length === 0) return false

    const sourceKeyPrefix = `${normalizeSuttaIdValue(sourceId)}:`
    return orderedKeys.every((key) => key.startsWith(sourceKeyPrefix))
}

function extractBilaraHtml(data: SCJsonData, routeId?: string, sourceId?: string): { html: string; selectionKind: BilaraSelectionKind } {
    const { keys: orderedKeys, selectionKind } = getScopedBilaraSelection(data, routeId, sourceId)
    if (orderedKeys.length === 0) {
        return {
            html: '',
            selectionKind,
        }
    }

    const translationSegments = data.translation_text && typeof data.translation_text === 'object'
        ? data.translation_text
        : data.bilara_translated_text && typeof data.bilara_translated_text === 'object'
            ? data.bilara_translated_text
            : null
    const rootSegments = data.root_text && typeof data.root_text === 'object'
        ? data.root_text
        : null

    if (data.html_text && typeof data.html_text === 'object') {
        return {
            html: orderedKeys
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
            .join(''),
            selectionKind,
        }
    }

    if (!translationSegments) {
        return {
            html: '',
            selectionKind,
        }
    }

    return {
        html: orderedKeys
            .filter((key) => key in translationSegments)
            .map((key) => {
                const segment = translationSegments[key]
                return typeof segment === 'string' && segment.trim() ? `<p>${segment}</p>` : ''
            })
            .join('\n'),
        selectionKind,
    }
}

function sanitizeRenderedHtml(html: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const article = doc.querySelector('article')

    if (article) {
        article.querySelectorAll('a.ref').forEach((el) => el.remove())
        return article.innerHTML
    }

    doc.querySelectorAll('a.ref').forEach((el) => el.remove())
    return doc.body.innerHTML || html
}

function getScopedDirectHtmlFragment(html: string, routeId: string, sourceId?: string): string | null {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const normalizedRouteId = normalizeSuttaIdValue(routeId)
    const normalizedSourceId = sourceId ? normalizeSuttaIdValue(sourceId) : null

    const candidates = Array.from(doc.querySelectorAll<HTMLElement>('[id]'))
        .map((element) => ({
            element,
            id: normalizeSuttaIdValue(element.id),
        }))

    const exactCandidate = candidates.find((candidate) => candidate.id === normalizedRouteId && candidate.id !== normalizedSourceId)
    if (exactCandidate) {
        exactCandidate.element.querySelectorAll('a.ref').forEach((el) => el.remove())
        return exactCandidate.element.innerHTML
    }

    const route = parseRouteNumericSuffix(normalizedRouteId)
    if (!route) return null

    const bestRangeCandidate = candidates
        .map((candidate) => {
            if (candidate.id === normalizedSourceId) return null
            const range = parseRangeRouteId(candidate.id)
            if (!range) return null
            if (range.prefix !== route.prefix || route.number < range.start || route.number > range.end) return null

            return {
                ...candidate,
                span: range.end - range.start,
            }
        })
        .filter((candidate): candidate is { element: HTMLElement; id: string; span: number } => Boolean(candidate))
        .sort((left, right) => left.span - right.span)[0]

    if (!bestRangeCandidate) return null

    bestRangeCandidate.element.querySelectorAll('a.ref').forEach((el) => el.remove())
    return bestRangeCandidate.element.innerHTML
}

function getScopedTtcDirectHtmlFragment(html: string, routeId: string, sourceId?: string): string | null {
    const routePosition = getRoutePositionWithinSourceRange(routeId, sourceId)
    if (routePosition === null) return null

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const normalizedSourceId = sourceId ? normalizeSuttaIdValue(sourceId) : null

    const sourceContainer = Array.from(doc.querySelectorAll<HTMLElement>('[id]')).find(
        (element) => normalizeSuttaIdValue(element.id) === normalizedSourceId
    ) || doc.querySelector<HTMLElement>('article, section')

    if (!sourceContainer) return null

    const bufferedLeadElements: HTMLElement[] = []
    const chunks: Array<{ start: number; end: number; elements: HTMLElement[] }> = []
    const ttcRanges: Array<{ start: number; end: number }> = []
    let currentChunk: { start: number; end: number; elements: HTMLElement[] } | null = null

    for (const child of Array.from(sourceContainer.children) as HTMLElement[]) {
        const tagName = child.tagName.toLowerCase()
        if (tagName === 'header' || tagName === 'footer') continue

        const ttcAnchor = child.querySelector<HTMLAnchorElement>('a.ref.ttc')
        const ttcRange = ttcAnchor?.textContent ? parseTtcRangeLabel(ttcAnchor.textContent) : null

        if (ttcRange) {
            ttcRanges.push(ttcRange)
            currentChunk = {
                ...ttcRange,
                elements: bufferedLeadElements.splice(0),
            }
            currentChunk.elements.push(child)
            chunks.push(currentChunk)
            continue
        }

        if (currentChunk) {
            currentChunk.elements.push(child)
        } else {
            bufferedLeadElements.push(child)
        }
    }

    if (!ttcRangesCoverFullSource(ttcRanges, sourceId)) {
        return null
    }

    const matchedChunk = chunks.find((chunk) => routePosition >= chunk.start && routePosition <= chunk.end)
    if (!matchedChunk) return null

    return matchedChunk.elements
        .map((element) => {
            const clone = element.cloneNode(true) as HTMLElement
            clone.querySelectorAll('a.ref').forEach((el) => el.remove())
            return clone.outerHTML
        })
        .join('\n')
}

function getCanonicalSourceIdForContent(data: SCJsonData, fallbackId: string): string {
    return normalizeOptionalSuttaId(data.translation?.uid)
        || normalizeOptionalSuttaId(data.root_text?.uid)
        || normalizeOptionalSuttaId(data.suttaplex?.uid)
        || fallbackId
}

function getDirectLocalHtmlContent(data: SCJsonData): string {
    if (typeof data.translation?.text === 'string' && data.translation.text.trim()) {
        return data.translation.text
    }

    if (typeof data.root_text?.text === 'string' && data.root_text.text.trim()) {
        return data.root_text.text
    }

    return ''
}

function hasRenderableResolvedContent(data: SCJsonData, routeId: string, sourceFileId: string): boolean {
    const sourceSuttaId = getCanonicalSourceIdForContent(data, sourceFileId)
    const directHtml = getDirectLocalHtmlContent(data)

    if (directHtml.trim()) {
        return true
    }

    const bilara = extractBilaraHtml(data, routeId, sourceSuttaId)
    if (!bilara.html.trim()) {
        return false
    }

    if (
        bilara.selectionKind === 'full'
        && sourceSuttaId !== routeId
        && !canUseOpaqueGroupedBilaraFallback(data, routeId, sourceSuttaId)
    ) {
        return false
    }

    return true
}

export async function resolveLocalOriginalContent(suttaId: string, lang: NikayaLanguage): Promise<LocalOriginalContentResolution> {
    const normalizedId = normalizeSuttaIdValue(suttaId)
    const resolved = await fetchResolvedSuttaJson(normalizedId, lang)

    if (!resolved) {
        return {
            html: null,
            mode: 'missing',
            sourceSuttaId: null,
            sourceFileId: null,
        }
    }

    const { json, sourceFileId } = resolved
    const sourceSuttaId = getCanonicalSourceIdForContent(json, sourceFileId)

    const directHtml = getDirectLocalHtmlContent(json)

    if (directHtml) {
        const scopedDirectHtml = sourceSuttaId !== normalizedId
            ? getScopedDirectHtmlFragment(directHtml, normalizedId, sourceSuttaId)
                || getScopedTtcDirectHtmlFragment(directHtml, normalizedId, sourceSuttaId)
            : null

        return {
            html: sanitizeRenderedHtml(scopedDirectHtml || directHtml),
            mode: sourceSuttaId === normalizedId
                ? 'exact'
                : scopedDirectHtml
                    ? 'scoped-grouped'
                    : 'opaque-grouped',
            sourceSuttaId,
            sourceFileId,
        }
    }

    const bilara = extractBilaraHtml(json, normalizedId, sourceSuttaId)
    if (bilara.html.trim()) {
        if (
            bilara.selectionKind === 'full'
            && sourceSuttaId !== normalizedId
            && !canUseOpaqueGroupedBilaraFallback(json, normalizedId, sourceSuttaId)
        ) {
            return {
                html: null,
                mode: 'missing',
                sourceSuttaId,
                sourceFileId,
            }
        }

        const mode: LocalOriginalContentRenderMode = bilara.selectionKind === 'full'
            ? sourceSuttaId === normalizedId ? 'exact' : 'opaque-grouped'
            : sourceSuttaId === normalizedId && sourceFileId === normalizedId
                ? 'exact'
                : 'scoped-grouped'

        return {
            html: sanitizeRenderedHtml(bilara.html),
            mode,
            sourceSuttaId,
            sourceFileId,
        }
    }

    return {
        html: null,
        mode: 'missing',
        sourceSuttaId,
        sourceFileId,
    }
}

/**
 * Fetch raw HTML content for a sutta from local JSON
 */
export async function fetchLocalSuttaHtml(suttaId: string, lang: NikayaLanguage): Promise<string | null> {
    const resolved = await resolveLocalOriginalContent(suttaId, lang)
    return resolved.html
}

/**
 * Fetch text content (legacy)
 */
export async function fetchLocalSuttaText(suttaId: string, lang: NikayaLanguage): Promise<string | null> {
    const html = await fetchLocalSuttaHtml(suttaId, lang)
    if (!html) return null
    return parseScHtml(html)
}
