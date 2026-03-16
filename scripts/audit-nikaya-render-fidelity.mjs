#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const dataDir = path.join(rootDir, 'public/data/suttacentral-json')
const validCollections = ['dn', 'mn', 'sn', 'an', 'kn']
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const targetCollection = args.find((arg) => validCollections.includes(arg))

if (args.length > 0 && !jsonMode && !targetCollection) {
  console.error('Usage: node scripts/audit-nikaya-render-fidelity.mjs [dn|mn|sn|an|kn] [--json]')
  process.exit(1)
}

const targetCollections = targetCollection ? [targetCollection] : validCollections
const nikayaIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'nikaya_index.json'), 'utf8'))
const rawContentManifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'content-availability.json'), 'utf8'))
const aliasManifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'canonical-aliases.json'), 'utf8'))

function normalizeSuttaId(id) {
  return String(id).toLowerCase().replace(/\s+/g, '')
}

function tokenizeSuttaId(id) {
  return normalizeSuttaId(id).match(/[a-z]+|\d+|[^a-z\d]+/g) || [normalizeSuttaId(id)]
}

function compareSuttaIds(left, right) {
  const leftTokens = tokenizeSuttaId(left)
  const rightTokens = tokenizeSuttaId(right)
  const maxLength = Math.max(leftTokens.length, rightTokens.length)

  for (let index = 0; index < maxLength; index++) {
    const leftToken = leftTokens[index]
    const rightToken = rightTokens[index]

    if (leftToken === undefined || rightToken === undefined) {
      if (leftToken === rightToken) return 0
      const remainingToken = leftToken === undefined ? rightToken : leftToken
      if (remainingToken === '-') return leftToken === undefined ? 1 : -1
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

function hasRawLocalContent(suttaId, lang) {
  return (rawContentManifest[normalizeSuttaId(suttaId)] || []).includes(lang)
}

function getCanonicalAlias(suttaId, lang) {
  return aliasManifest[normalizeSuttaId(suttaId)]?.[lang] || null
}

function getLocalJsonCandidateIds(suttaId, lang) {
  const normalizedId = normalizeSuttaId(suttaId)
  const canonicalAlias = getCanonicalAlias(normalizedId, lang)
  const candidateIds = []

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

function getCollection(suttaId) {
  const id = normalizeSuttaId(suttaId)
  if (/^(kp|dhp|ud|iti|snp)/.test(id)) return 'kn'
  if (id.startsWith('dn')) return 'dn'
  if (id.startsWith('mn')) return 'mn'
  if (id.startsWith('sn')) return 'sn'
  if (id.startsWith('an')) return 'an'
  return 'other'
}

function getJsonPath(suttaId, lang) {
  const author = lang === 'vi' ? 'minh_chau' : 'sujato'
  return path.join(dataDir, getCollection(suttaId), `${suttaId}_${lang}_${author}.json`)
}

function readJsonFileIfPresent(filePath) {
  if (!fs.existsSync(filePath)) return null

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function getOrderedBilaraKeys(data) {
  if (Array.isArray(data.keys_order)) {
    return data.keys_order.filter((key) => typeof key === 'string' && key.includes(':'))
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

function normalizeOptionalSuttaId(value) {
  if (typeof value !== 'string') return null
  const normalized = normalizeSuttaId(value)
  return normalized || null
}

function getCanonicalSourceIdForContent(data, fallbackId) {
  return normalizeOptionalSuttaId(data.translation?.uid)
    || normalizeOptionalSuttaId(data.root_text?.uid)
    || normalizeOptionalSuttaId(data.suttaplex?.uid)
    || normalizeSuttaId(fallbackId)
}

function getDirectLocalHtmlContent(data) {
  if (typeof data.translation?.text === 'string' && data.translation.text.trim()) {
    return data.translation.text
  }

  if (typeof data.root_text?.text === 'string' && data.root_text.text.trim()) {
    return data.root_text.text
  }

  return ''
}

function parseRouteNumericSuffix(id) {
  const match = normalizeSuttaId(id).match(/^(.*?)(\d+)$/)
  if (!match) return null

  return {
    prefix: match[1],
    number: Number(match[2]),
  }
}

function parseRangeRouteId(id) {
  const match = normalizeSuttaId(id).match(/^(.*?)(\d+)-(\d+)$/)
  if (!match) return null

  return {
    prefix: match[1],
    start: Number(match[2]),
    end: Number(match[3]),
  }
}

function parseTtcRangeLabel(label) {
  const normalized = String(label).replace(/[–—]/g, '-')
  const match = normalized.match(/TTC\s+(\d+)(?:\s*-\s*(\d+))?/i)
  if (!match) return null

  return {
    start: Number(match[1]),
    end: Number(match[2] ?? match[1]),
  }
}

function getRoutePositionWithinSourceRange(routeId, sourceId) {
  if (!sourceId) return null

  const route = parseRouteNumericSuffix(routeId)
  const range = parseRangeRouteId(sourceId)
  if (!route || !range || route.prefix !== range.prefix || route.number < range.start || route.number > range.end) {
    return null
  }

  return route.number - range.start + 1
}

function getSourceRouteSpan(sourceId) {
  if (!sourceId) return null

  const range = parseRangeRouteId(sourceId)
  if (!range) return null
  return range.end - range.start + 1
}

function ttcRangesCoverFullSource(ttcRanges, sourceId) {
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

function getGroupedRangeSectionKeys(orderedKeys, routeId, sourceId) {
  if (!sourceId) return []

  const route = parseRouteNumericSuffix(routeId)
  const range = parseRangeRouteId(sourceId)

  if (!route || !range || route.prefix !== range.prefix || route.number < range.start || route.number > range.end) {
    return []
  }

  const childIndex = route.number - range.start + 1
  const childPattern = new RegExp(`^${childIndex}(?:\\.|$)`)

  return orderedKeys.filter((key) => {
    const [, segmentSuffix = ''] = String(key).split(':')
    return childPattern.test(segmentSuffix)
  })
}

function getGroupedRangePrefixKeys(orderedKeys, routeId) {
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
    .filter(Boolean)
    .sort((left, right) => left.span - right.span)

  const bestPrefix = rangePrefixes[0]?.prefix
  if (!bestPrefix) return []

  return orderedKeys.filter((key) => key.startsWith(`${bestPrefix}:`))
}

function getScopedBilaraSelection(data, routeId, sourceId) {
  const orderedKeys = getOrderedBilaraKeys(data)
  const normalizedRouteId = normalizeSuttaId(routeId)

  const routePrefixKeys = orderedKeys.filter((key) => key.startsWith(`${normalizedRouteId}:`))
  if (routePrefixKeys.length > 0) {
    return { keys: routePrefixKeys, selectionKind: 'route-prefix' }
  }

  const rangePrefixKeys = getGroupedRangePrefixKeys(orderedKeys, normalizedRouteId)
  if (rangePrefixKeys.length > 0) {
    return { keys: rangePrefixKeys, selectionKind: 'range-prefix' }
  }

  const rangeSectionKeys = getGroupedRangeSectionKeys(orderedKeys, normalizedRouteId, sourceId)
  if (rangeSectionKeys.length > 0) {
    return { keys: rangeSectionKeys, selectionKind: 'range-section' }
  }

  return { keys: orderedKeys, selectionKind: 'full' }
}

function hasRenderableBilaraSelection(data, selectedKeys) {
  if (selectedKeys.length === 0) return false

  const templateSegments = data.html_text && typeof data.html_text === 'object' ? data.html_text : {}
  const translationSegments = data.translation_text && typeof data.translation_text === 'object'
    ? data.translation_text
    : data.bilara_translated_text && typeof data.bilara_translated_text === 'object'
      ? data.bilara_translated_text
      : {}
  const rootSegments = data.root_text && typeof data.root_text === 'object' ? data.root_text : {}

  return selectedKeys.some((key) => {
    const template = templateSegments[key]

    if (typeof template === 'string') {
      if (!template.includes('{}')) return template.trim().length > 0
      const content = translationSegments[key] ?? rootSegments[key] ?? ''
      return typeof content === 'string' && content.trim().length > 0
    }

    const segment = translationSegments[key]
    return typeof segment === 'string' && segment.trim().length > 0
  })
}

function hasRenderableResolvedContent(data, routeId, candidateId) {
  const sourceSuttaId = getCanonicalSourceIdForContent(data, candidateId)
  const directHtml = getDirectLocalHtmlContent(data)
  if (directHtml.trim()) {
    return true
  }

  const { keys, selectionKind } = getScopedBilaraSelection(data, routeId, sourceSuttaId)
  if (!hasRenderableBilaraSelection(data, keys)) {
    return false
  }

  if (selectionKind === 'full' && sourceSuttaId !== routeId && !canUseOpaqueGroupedBilaraFallback(data, routeId, sourceSuttaId)) {
    return false
  }

  return true
}

function canUseOpaqueGroupedBilaraFallback(data, routeId, sourceId) {
  if (!sourceId || sourceId === routeId) return true

  const orderedKeys = getOrderedBilaraKeys(data)
  if (orderedKeys.length === 0) return false

  const sourcePrefix = `${sourceId}:`
  return orderedKeys.every((key) => key.startsWith(sourcePrefix))
}

function getScopedDirectHtmlMode(data, routeId, sourceId) {
  const html = typeof data.translation?.text === 'string' && data.translation.text.trim()
    ? data.translation.text
    : typeof data.root_text?.text === 'string' && data.root_text.text.trim()
      ? data.root_text.text
      : ''

  if (!html) return null
  if (sourceId === routeId) return 'exact'

  const ids = [...html.matchAll(/id=['"]([^'"]+)['"]/g)]
    .map((match) => normalizeSuttaId(match[1]))
    .filter(Boolean)

  if (ids.includes(routeId)) {
    return 'scoped-grouped'
  }

  const route = parseRouteNumericSuffix(routeId)
  if (!route) return 'opaque-grouped'

  const bestRange = ids
    .map((id) => {
      if (id === sourceId) return null
      const range = parseRangeRouteId(id)
      if (!range) return null
      if (range.prefix !== route.prefix || route.number < range.start || route.number > range.end) return null
      return {
        id,
        span: range.end - range.start,
      }
    })
    .filter(Boolean)
    .sort((left, right) => left.span - right.span)[0]

  if (bestRange) {
    return 'scoped-grouped'
  }

  const routePosition = getRoutePositionWithinSourceRange(routeId, sourceId)
  if (routePosition !== null) {
    const ttcRanges = [...html.matchAll(/<a class=['"]ref ttc['"][^>]*>([^<]+)<\/a>/gi)]
      .map((match) => parseTtcRangeLabel(match[1]))
      .filter(Boolean)

    const matchingTtcRange = ttcRanges.find((range) => routePosition >= range.start && routePosition <= range.end)
    if (matchingTtcRange && ttcRangesCoverFullSource(ttcRanges, sourceId)) {
      return 'scoped-grouped'
    }
  }

  return 'opaque-grouped'
}

function resolveRenderMode(routeId, lang) {
  const normalizedRouteId = normalizeSuttaId(routeId)
  let fallbackMode = 'missing'

  for (const candidateId of getLocalJsonCandidateIds(normalizedRouteId, lang)) {
    const data = readJsonFileIfPresent(getJsonPath(candidateId, lang))
    if (!data) continue

    const sourceSuttaId = getCanonicalSourceIdForContent(data, candidateId)
    const directHtml = getDirectLocalHtmlContent(data)

    if (directHtml) {
      const mode = getScopedDirectHtmlMode(data, normalizedRouteId, sourceSuttaId)
      if (hasRenderableResolvedContent(data, normalizedRouteId, candidateId)) {
        return mode
      }
      fallbackMode = mode
      continue
    }

    const { keys, selectionKind } = getScopedBilaraSelection(data, normalizedRouteId, sourceSuttaId)
    if (!hasRenderableBilaraSelection(data, keys)) {
      continue
    }

    if (selectionKind === 'full') {
      if (sourceSuttaId !== normalizedRouteId && !canUseOpaqueGroupedBilaraFallback(data, normalizedRouteId, sourceSuttaId)) {
        continue
      }
      const mode = sourceSuttaId === normalizedRouteId ? 'exact' : 'opaque-grouped'
      if (hasRenderableResolvedContent(data, normalizedRouteId, candidateId)) {
        return mode
      }
      fallbackMode = mode
      continue
    }

    const mode = sourceSuttaId === normalizedRouteId && normalizeSuttaId(candidateId) === normalizedRouteId
      ? 'exact'
      : 'scoped-grouped'
    if (hasRenderableResolvedContent(data, normalizedRouteId, candidateId)) {
      return mode
    }
    fallbackMode = mode
  }

  return fallbackMode
}

function pushSample(bucket, value, limit = 12) {
  if (bucket.length < limit) bucket.push(value)
}

const hiddenCanonicalIds = new Set(
  Object.entries(aliasManifest).flatMap(([childId, canonicalByLang]) =>
    Object.values(canonicalByLang || {})
      .filter(Boolean)
      .map((canonicalId) => normalizeSuttaId(canonicalId))
      .filter((canonicalId) => canonicalId !== normalizeSuttaId(childId))
  )
)

const report = {
  generatedAt: new Date().toISOString(),
  collections: {},
}

for (const collection of targetCollections) {
  const visibleIds = nikayaIndex
    .filter((row) => row.collection === collection)
    .map((row) => normalizeSuttaId(row.id))
    .filter((id) => !hiddenCanonicalIds.has(id))
    .sort(compareSuttaIds)

  const summary = {
    visibleRouteIds: visibleIds.length,
    en: {
      exact: 0,
      scopedGrouped: 0,
      opaqueGrouped: 0,
      missing: 0,
      exactSample: [],
      scopedGroupedSample: [],
      opaqueGroupedSample: [],
      missingSample: [],
    },
    vi: {
      exact: 0,
      scopedGrouped: 0,
      opaqueGrouped: 0,
      missing: 0,
      exactSample: [],
      scopedGroupedSample: [],
      opaqueGroupedSample: [],
      missingSample: [],
    },
  }

  for (const id of visibleIds) {
    for (const lang of ['en', 'vi']) {
      const mode = resolveRenderMode(id, lang)
      const bucket = summary[lang]

      if (mode === 'exact') {
        bucket.exact += 1
        pushSample(bucket.exactSample, id)
      } else if (mode === 'scoped-grouped') {
        bucket.scopedGrouped += 1
        pushSample(bucket.scopedGroupedSample, id)
      } else if (mode === 'opaque-grouped') {
        bucket.opaqueGrouped += 1
        pushSample(bucket.opaqueGroupedSample, id)
      } else {
        bucket.missing += 1
        pushSample(bucket.missingSample, id)
      }
    }
  }

  report.collections[collection] = summary
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

console.log('Nikaya render fidelity audit')
console.log('============================')

for (const collection of targetCollections) {
  const summary = report.collections[collection]

  console.log(`\n${collection.toUpperCase()}`)
  console.log(`- visible route ids: ${summary.visibleRouteIds}`)
  console.log(`- EN exact: ${summary.en.exact}/${summary.visibleRouteIds}`)
  console.log(`- EN scoped-grouped: ${summary.en.scopedGrouped}/${summary.visibleRouteIds}`)
  console.log(`- EN opaque-grouped: ${summary.en.opaqueGrouped}/${summary.visibleRouteIds}`)
  console.log(`- EN missing: ${summary.en.missing}/${summary.visibleRouteIds}`)
  console.log(`- VI exact: ${summary.vi.exact}/${summary.visibleRouteIds}`)
  console.log(`- VI scoped-grouped: ${summary.vi.scopedGrouped}/${summary.visibleRouteIds}`)
  console.log(`- VI opaque-grouped: ${summary.vi.opaqueGrouped}/${summary.visibleRouteIds}`)
  console.log(`- VI missing: ${summary.vi.missing}/${summary.visibleRouteIds}`)

  const sampleLines = [
    ['EN scoped-grouped sample', summary.en.scopedGroupedSample],
    ['EN opaque-grouped sample', summary.en.opaqueGroupedSample],
    ['VI scoped-grouped sample', summary.vi.scopedGroupedSample],
    ['VI opaque-grouped sample', summary.vi.opaqueGroupedSample],
    ['VI missing sample', summary.vi.missingSample],
  ]

  for (const [label, values] of sampleLines) {
    if (values.length > 0) {
      console.log(`- ${label}: ${values.join(', ')}`)
    }
  }
}
