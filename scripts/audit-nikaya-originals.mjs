#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const dataDir = path.join(rootDir, 'public/data/suttacentral-json')
const indexPath = path.join(dataDir, 'nikaya_index.json')
const availablePath = path.join(dataDir, 'available.json')
const contentPath = path.join(dataDir, 'content-availability.json')
const validCollections = ['dn', 'mn', 'sn', 'an', 'kn']
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const targetCollection = args.find((arg) => validCollections.includes(arg))

if (args.length > 0 && !jsonMode && !targetCollection) {
  console.error('Usage: node scripts/audit-nikaya-originals.mjs [dn|mn|sn|an|kn] [--json]')
  process.exit(1)
}

const targetCollections = targetCollection ? [targetCollection] : validCollections

function tokenizeSuttaId(id) {
  return String(id).toLowerCase().match(/[a-z]+|\d+|[^a-z\d]+/g) || [String(id).toLowerCase()]
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

      if (remainingToken === '-') {
        return leftToken === undefined ? 1 : -1
      }

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

function expectedCollectionForId(id) {
  if (/^(kp|dhp|ud|iti|snp)/.test(id)) return 'kn'
  if (/^dn/.test(id)) return 'dn'
  if (/^mn/.test(id)) return 'mn'
  if (/^sn/.test(id)) return 'sn'
  if (/^an/.test(id)) return 'an'
  return null
}

function normalizeText(value) {
  if (typeof value !== 'string') return null

  const normalized = value
    .normalize('NFKC')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized ? normalized.toLowerCase() : null
}

function normalizeUid(value) {
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  return normalized || null
}

function pickDefined(...values) {
  for (const value of values) {
    if (value !== undefined) return value
  }

  return undefined
}

function expandRangeUid(id) {
  if (typeof id !== 'string' || !id.includes('-')) return null

  const separatorIndex = id.indexOf('-')
  const startId = id.slice(0, separatorIndex)
  const endSuffix = id.slice(separatorIndex + 1)
  const startMatch = startId.match(/^(.*?)(\d+)$/)

  if (!startMatch || !/^\d+$/.test(endSuffix)) return null

  const [, base] = startMatch
  const endId = `${base}${endSuffix}`

  return { startId, endId }
}

function enumerateRangeIds(id) {
  const expanded = expandRangeUid(id)

  if (!expanded) return null

  const startMatch = expanded.startId.match(/^(.*?)(\d+)$/)
  const endMatch = expanded.endId.match(/^(.*?)(\d+)$/)

  if (!startMatch || !endMatch || startMatch[1] !== endMatch[1]) {
    return null
  }

  const base = startMatch[1]
  const startNumber = Number(startMatch[2])
  const endNumber = Number(endMatch[2])

  if (!Number.isInteger(startNumber) || !Number.isInteger(endNumber) || endNumber < startNumber) {
    return null
  }

  const ids = []
  for (let current = startNumber; current <= endNumber; current++) {
    ids.push(`${base}${current}`)
  }

  return ids
}

function hasReadableContent(data) {
  return Boolean(
    (typeof data.translation?.text === 'string' && data.translation.text.trim()) ||
      (typeof data.root_text?.text === 'string' && data.root_text.text.trim()) ||
      Object.keys(data.html_text || {}).some((key) => key.includes(':')) ||
      Object.keys(data.translation_text || {}).some((key) => key.includes(':')) ||
      Object.keys(data.bilara_translated_text || {}).some((key) => key.includes(':'))
  )
}

function getCanonicalUid(data) {
  return normalizeUid(data.translation?.uid) || normalizeUid(data.root_text?.uid) || normalizeUid(data.suttaplex?.uid) || null
}

function classifyViSource(data) {
  const directEntry = [data.translation, data.root_text]
    .find((entry) => entry && entry.lang === 'vi' && typeof entry.author_uid === 'string')

  if (directEntry?.author_uid === 'minh_chau') {
    return 'direct-minh-chau'
  }

  if (directEntry?.author_uid) {
    return `direct-other:${directEntry.author_uid}`
  }

  const viTranslations = (data.suttaplex?.translations || []).filter((entry) => entry.lang === 'vi')

  if (viTranslations.some((entry) => entry.author_uid === 'minh_chau')) {
    return 'plex-minh-chau'
  }

  if (viTranslations.length > 0) {
    return `plex-other:${viTranslations.map((entry) => entry.author_uid).join('|')}`
  }

  return 'no-vi-metadata'
}

function extractNav(data) {
  const previousRaw = pickDefined(data.translation?.previous, data.previous, data.suttaplex?.previous)
  const nextRaw = pickDefined(data.translation?.next, data.next, data.suttaplex?.next)

  return {
    present: previousRaw !== undefined || nextRaw !== undefined,
    previousUid: normalizeUid(previousRaw?.uid),
    nextUid: normalizeUid(nextRaw?.uid),
  }
}

function createRouteMeta(indexRow) {
  return {
    indexTitle: indexRow?.title || null,
    indexPaliTitle: indexRow?.paliTitle || null,
    enCanonicalUid: null,
    viCanonicalUid: null,
    canonicalUid: null,
    titleCandidates: [],
    paliTitle: null,
    nav: null,
  }
}

function addTitleCandidate(routeMeta, title) {
  if (typeof title !== 'string') return

  const normalized = title.replace(/\s+/g, ' ').trim()
  if (!normalized || routeMeta.titleCandidates.includes(normalized)) return

  routeMeta.titleCandidates.push(normalized)
}

function assignNav(routeMeta, nav, source) {
  if (!nav.present) return
  if (!routeMeta.nav || routeMeta.nav.source !== 'vi' || source === 'vi') {
    routeMeta.nav = { ...nav, source }
  }
}

function createLanguageState() {
  return {
    present: 0,
    missing: [],
    readable: 0,
    unreadable: [],
    alias: [],
    manifestMismatch: [],
  }
}

function createCollectionSummary(total) {
  return {
    total,
    en: createLanguageState(),
    vi: createLanguageState(),
    viReadableMinhChau: 0,
    viReadableNonMinhChau: [],
    viSourceCounts: {},
    viSourceSamples: {},
    extraIds: [],
    misplacedFiles: [],
    weirdFiles: [],
    duplicateLangFiles: [],
    aliasRouteCount: 0,
    aliasGroupCount: 0,
    aliasGroupsSample: [],
    aliasTargetMissing: [],
    topology: {
      rangeIdsInIndex: 0,
      aliasFamiliesWithCanonicalInIndex: 0,
      aliasFamiliesMissingCanonicalInIndex: 0,
      aliasRoutesCoveredByIndexedCanonical: 0,
      aliasRoutesMissingCanonical: 0,
      indexedRangeWithoutAliases: [],
      aliasRangeViolations: [],
      rangeCompletenessViolations: [],
    },
    titleMismatch: [],
    paliTitleMismatch: [],
    nav: {
      canonicalRoutes: 0,
      auditedRoutes: 0,
      missingPrevious: [],
      missingNext: [],
      previousMismatch: [],
      nextMismatch: [],
    },
    orderingDefect: null,
  }
}

const nikayaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
const availableManifest = JSON.parse(fs.readFileSync(availablePath, 'utf8'))
const contentManifest = JSON.parse(fs.readFileSync(contentPath, 'utf8'))
const indexIds = nikayaIndex.map((item) => item.id)
const indexSet = new Set(indexIds)
const indexMap = new Map(nikayaIndex.map((item) => [item.id, item]))
const availableIds = Object.keys(availableManifest)

const report = {
  generatedAt: new Date().toISOString(),
  collections: {},
  global: {
    targetCollections,
    indexIds: indexIds.length,
    availableIds: availableIds.length,
    contentIds: Object.keys(contentManifest).length,
    indexDuplicates: [],
    missingFromIndex: [],
    missingFromAvailable: [],
    orderingDefects: [],
    misplacedFiles: [],
    weirdFiles: [],
    duplicateLangFiles: [],
  },
}

{
  const seen = new Set()
  for (const id of indexIds) {
    if (seen.has(id)) report.global.indexDuplicates.push(id)
    seen.add(id)
  }
}

report.global.missingFromIndex = availableIds.filter((id) => !indexSet.has(id)).sort(compareSuttaIds)
report.global.missingFromAvailable = indexIds.filter((id) => !availableManifest[id]).sort(compareSuttaIds)

for (const collection of targetCollections) {
  const ids = nikayaIndex.filter((item) => item.collection === collection).map((item) => item.id)
  const dir = path.join(dataDir, collection)
  const summary = createCollectionSummary(ids.length)
  const discoveredIds = new Set()
  const seenLangFiles = new Map()
  const routeMetaById = new Map(ids.map((id) => [id, createRouteMeta(indexMap.get(id))]))
  const indexedRangeIds = ids.filter((id) => id.includes('-'))
  const indexedRangeSet = new Set(indexedRangeIds)

  summary.topology.rangeIdsInIndex = indexedRangeIds.length

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue

    const match = file.match(/^(.*)_(en_sujato|vi_minh_chau)\.json$/)

    if (!match) {
      summary.weirdFiles.push(file)
      report.global.weirdFiles.push(path.join(collection, file))
      continue
    }

    const [, id, langKey] = match
    discoveredIds.add(id)

    const seenKey = `${id}:${langKey}`
    seenLangFiles.set(seenKey, (seenLangFiles.get(seenKey) || 0) + 1)

    const expectedCollection = expectedCollectionForId(id)
    if (expectedCollection && expectedCollection !== collection) {
      const sample = { file, id, collection, expectedCollection }
      summary.misplacedFiles.push(sample)
      report.global.misplacedFiles.push(sample)
    }
  }

  for (const [langKey, count] of seenLangFiles.entries()) {
    if (count > 1) {
      summary.duplicateLangFiles.push(langKey)
      report.global.duplicateLangFiles.push(`${collection}/${langKey}`)
    }
  }

  summary.extraIds = [...discoveredIds].filter((id) => !indexSet.has(id)).sort(compareSuttaIds)

  for (const id of ids) {
    const enPath = path.join(dir, `${id}_en_sujato.json`)
    const viPath = path.join(dir, `${id}_vi_minh_chau.json`)
    const routeMeta = routeMetaById.get(id)

    if (!fs.existsSync(enPath)) {
      summary.en.missing.push(id)
    } else {
      summary.en.present++
      const data = JSON.parse(fs.readFileSync(enPath, 'utf8'))
      const readable = hasReadableContent(data)
      const canonicalUid = getCanonicalUid(data)
      const manifestReadable = (contentManifest[id] || []).includes('en')
      const nav = extractNav(data)

      if (readable) {
        summary.en.readable++
      } else {
        summary.en.unreadable.push(id)
      }

      if (canonicalUid && canonicalUid !== id) {
        summary.en.alias.push({ id, canonicalUid })
      }

      if (readable !== manifestReadable) {
        summary.en.manifestMismatch.push({ id, readable, manifestReadable })
      }

      routeMeta.enCanonicalUid = canonicalUid
      routeMeta.paliTitle ||= data.suttaplex?.original_title || null
      addTitleCandidate(routeMeta, data.translation?.title)
      addTitleCandidate(routeMeta, data.suttaplex?.translated_title)
      addTitleCandidate(routeMeta, data.suttaplex?.original_title)
      assignNav(routeMeta, nav, 'en')
    }

    if (!fs.existsSync(viPath)) {
      summary.vi.missing.push(id)
    } else {
      summary.vi.present++
      const data = JSON.parse(fs.readFileSync(viPath, 'utf8'))
      const readable = hasReadableContent(data)
      const canonicalUid = getCanonicalUid(data)
      const manifestReadable = (contentManifest[id] || []).includes('vi')
      const viSource = classifyViSource(data)
      const nav = extractNav(data)

      summary.viSourceCounts[viSource] = (summary.viSourceCounts[viSource] || 0) + 1
      if (!summary.viSourceSamples[viSource]) {
        summary.viSourceSamples[viSource] = []
      }
      if (summary.viSourceSamples[viSource].length < 12) {
        summary.viSourceSamples[viSource].push(id)
      }

      if (readable) {
        summary.vi.readable++
        if (viSource === 'direct-minh-chau' || viSource === 'plex-minh-chau') {
          summary.viReadableMinhChau++
        } else {
          summary.viReadableNonMinhChau.push({ id, viSource })
        }
      } else {
        summary.vi.unreadable.push(id)
      }

      if (canonicalUid && canonicalUid !== id) {
        summary.vi.alias.push({ id, canonicalUid })
      }

      if (readable !== manifestReadable) {
        summary.vi.manifestMismatch.push({ id, readable, manifestReadable })
      }

      routeMeta.viCanonicalUid = canonicalUid
      routeMeta.paliTitle ||= data.suttaplex?.original_title || null
      addTitleCandidate(routeMeta, data.translation?.title)
      addTitleCandidate(routeMeta, data.suttaplex?.translated_title)
      addTitleCandidate(routeMeta, data.suttaplex?.original_title)
      assignNav(routeMeta, nav, 'vi')
    }
  }

  const canonicalIds = []
  const aliasRoutesByCanonical = new Map()

  for (const id of ids) {
    const routeMeta = routeMetaById.get(id)
    const canonicalUid = routeMeta.viCanonicalUid || routeMeta.enCanonicalUid || id
    const normalizedIndexTitle = normalizeText(routeMeta.indexTitle)
    const normalizedTitleCandidates = routeMeta.titleCandidates
      .map((candidate) => normalizeText(candidate))
      .filter(Boolean)

    routeMeta.canonicalUid = canonicalUid

    if (normalizedIndexTitle && normalizedTitleCandidates.length > 0 && !normalizedTitleCandidates.includes(normalizedIndexTitle)) {
      summary.titleMismatch.push({
        id,
        indexTitle: routeMeta.indexTitle,
        candidates: routeMeta.titleCandidates.slice(0, 6),
      })
    }

    const normalizedIndexPali = normalizeText(routeMeta.indexPaliTitle)
    const normalizedPaliTitle = normalizeText(routeMeta.paliTitle)

    if (normalizedIndexPali && normalizedPaliTitle && normalizedIndexPali !== normalizedPaliTitle) {
      summary.paliTitleMismatch.push({
        id,
        indexPaliTitle: routeMeta.indexPaliTitle,
        metadataPaliTitle: routeMeta.paliTitle,
      })
    }

    if (canonicalUid === id) {
      canonicalIds.push(id)
      continue
    }

    if (!aliasRoutesByCanonical.has(canonicalUid)) {
      aliasRoutesByCanonical.set(canonicalUid, [])
    }
    aliasRoutesByCanonical.get(canonicalUid).push(id)

    if (!indexSet.has(canonicalUid)) {
      summary.aliasTargetMissing.push({ id, canonicalUid })
    }
  }

  summary.aliasRouteCount = [...aliasRoutesByCanonical.values()].reduce((count, aliases) => count + aliases.length, 0)
  summary.aliasGroupCount = aliasRoutesByCanonical.size
  summary.aliasGroupsSample = [...aliasRoutesByCanonical.entries()]
    .sort(([left], [right]) => compareSuttaIds(left, right))
    .slice(0, 12)
    .map(([canonicalUid, aliases]) => ({
      canonicalUid,
      aliases: aliases.slice(0, 12),
    }))

  for (const [canonicalUid, aliases] of aliasRoutesByCanonical.entries()) {
    const expandedRange = expandRangeUid(canonicalUid)
    const expectedRangeIds = enumerateRangeIds(canonicalUid)

    if (indexedRangeSet.has(canonicalUid)) {
      summary.topology.aliasFamiliesWithCanonicalInIndex++
      summary.topology.aliasRoutesCoveredByIndexedCanonical += aliases.length
    } else {
      summary.topology.aliasFamiliesMissingCanonicalInIndex++
      summary.topology.aliasRoutesMissingCanonical += aliases.length
    }

    if (expandedRange) {
      for (const aliasId of aliases) {
        if (
          compareSuttaIds(aliasId, expandedRange.startId) < 0 ||
          compareSuttaIds(aliasId, expandedRange.endId) > 0
        ) {
          summary.topology.aliasRangeViolations.push({
            aliasId,
            canonicalUid,
            startId: expandedRange.startId,
            endId: expandedRange.endId,
          })
        }
      }
    }

    if (expectedRangeIds) {
      const actualAliasIds = [...new Set(aliases)].sort(compareSuttaIds)
      const actualAliasSet = new Set(actualAliasIds)
      const missingAliasIds = expectedRangeIds.filter((id) => !actualAliasSet.has(id))
      const unexpectedAliasIds = actualAliasIds.filter((id) => !expectedRangeIds.includes(id))

      if (missingAliasIds.length > 0 || unexpectedAliasIds.length > 0) {
        summary.topology.rangeCompletenessViolations.push({
          canonicalUid,
          expectedCount: expectedRangeIds.length,
          actualCount: actualAliasIds.length,
          missingAliasIds,
          unexpectedAliasIds,
        })
      }
    }
  }

  summary.topology.indexedRangeWithoutAliases = indexedRangeIds
    .filter((id) => !aliasRoutesByCanonical.has(id))
    .sort(compareSuttaIds)

  summary.nav.canonicalRoutes = canonicalIds.length

  for (let index = 0; index < canonicalIds.length; index++) {
    const id = canonicalIds[index]
    const routeMeta = routeMetaById.get(id)

    if (!routeMeta.nav?.present) continue

    const expectedPrevious = index === 0 ? null : canonicalIds[index - 1]
    const expectedNext = index === canonicalIds.length - 1 ? null : canonicalIds[index + 1]

    summary.nav.auditedRoutes++

    if (routeMeta.nav.previousUid !== expectedPrevious) {
      const target = {
        id,
        expected: expectedPrevious,
        actual: routeMeta.nav.previousUid,
        source: routeMeta.nav.source,
      }

      if (expectedPrevious && !routeMeta.nav.previousUid) {
        summary.nav.missingPrevious.push(target)
      } else {
        summary.nav.previousMismatch.push(target)
      }
    }

    if (routeMeta.nav.nextUid !== expectedNext) {
      const target = {
        id,
        expected: expectedNext,
        actual: routeMeta.nav.nextUid,
        source: routeMeta.nav.source,
      }

      if (expectedNext && !routeMeta.nav.nextUid) {
        summary.nav.missingNext.push(target)
      } else {
        summary.nav.nextMismatch.push(target)
      }
    }
  }

  for (let index = 1; index < ids.length; index++) {
    if (compareSuttaIds(ids[index - 1], ids[index]) > 0) {
      summary.orderingDefect = { previous: ids[index - 1], next: ids[index] }
      report.global.orderingDefects.push({ collection, ...summary.orderingDefect })
      break
    }
  }

  report.collections[collection] = summary
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

console.log('Nikaya original layers audit')
console.log('============================')
console.log(`Collections: ${targetCollections.map((collection) => collection.toUpperCase()).join(', ')}`)
console.log(`Index ids: ${report.global.indexIds}`)
console.log(`Available ids: ${report.global.availableIds}`)
console.log(`Content ids: ${report.global.contentIds}`)
console.log(`Index duplicates: ${report.global.indexDuplicates.length}`)
console.log(`Missing from index: ${report.global.missingFromIndex.length}`)
console.log(`Missing from available: ${report.global.missingFromAvailable.length}`)
console.log(`Misplaced files: ${report.global.misplacedFiles.length}`)
console.log(`Weird file names: ${report.global.weirdFiles.length}`)
console.log(`Duplicate lang files: ${report.global.duplicateLangFiles.length}`)
console.log(`Ordering defects: ${report.global.orderingDefects.length}`)

for (const collection of targetCollections) {
  const summary = report.collections[collection]

  console.log(`\n${collection.toUpperCase()}`)
  console.log(`- index ids: ${summary.total}`)
  console.log(`- EN file present: ${summary.en.present}/${summary.total}`)
  console.log(`- EN readable: ${summary.en.readable}/${summary.total}`)
  console.log(`- EN unreadable placeholders/aliases: ${summary.en.unreadable.length}`)
  console.log(`- EN alias ids (uid != file id): ${summary.en.alias.length}`)
  console.log(`- EN manifest mismatches: ${summary.en.manifestMismatch.length}`)
  console.log(`- VI file present: ${summary.vi.present}/${summary.total}`)
  console.log(`- VI readable: ${summary.vi.readable}/${summary.total}`)
  console.log(`- VI readable as Minh Chau: ${summary.viReadableMinhChau}/${summary.total}`)
  console.log(`- VI readable but not Minh Chau: ${summary.viReadableNonMinhChau.length}`)
  console.log(`- VI unreadable placeholders/aliases: ${summary.vi.unreadable.length}`)
  console.log(`- VI alias ids (uid != file id): ${summary.vi.alias.length}`)
  console.log(`- VI manifest mismatches: ${summary.vi.manifestMismatch.length}`)
  console.log(`- alias route groups: ${summary.aliasGroupCount}`)
  console.log(`- alias routes pointing to canonical ids: ${summary.aliasRouteCount}`)
  console.log(`- alias targets missing from index: ${summary.aliasTargetMissing.length}`)
  console.log(`- range ids in index: ${summary.topology.rangeIdsInIndex}`)
  console.log(`- alias families with canonical indexed: ${summary.topology.aliasFamiliesWithCanonicalInIndex}`)
  console.log(`- alias routes covered by indexed canonical: ${summary.topology.aliasRoutesCoveredByIndexedCanonical}`)
  console.log(`- alias families missing canonical in index: ${summary.topology.aliasFamiliesMissingCanonicalInIndex}`)
  console.log(`- alias routes missing canonical in index: ${summary.topology.aliasRoutesMissingCanonical}`)
  console.log(`- indexed range ids without aliases: ${summary.topology.indexedRangeWithoutAliases.length}`)
  console.log(`- alias range violations: ${summary.topology.aliasRangeViolations.length}`)
  console.log(`- range completeness violations: ${summary.topology.rangeCompletenessViolations.length}`)
  console.log(`- route title mismatches: ${summary.titleMismatch.length}`)
  console.log(`- Pali title mismatches: ${summary.paliTitleMismatch.length}`)
  console.log(`- canonical routes: ${summary.nav.canonicalRoutes}`)
  console.log(`- canonical routes with nav metadata: ${summary.nav.auditedRoutes}`)
  console.log(`- nav missing previous: ${summary.nav.missingPrevious.length}`)
  console.log(`- nav missing next: ${summary.nav.missingNext.length}`)
  console.log(`- nav previous mismatch: ${summary.nav.previousMismatch.length}`)
  console.log(`- nav next mismatch: ${summary.nav.nextMismatch.length}`)
  console.log(`- VI source status: ${Object.entries(summary.viSourceCounts).map(([status, count]) => `${status}=${count}`).join(', ') || 'none'}`)

  if (summary.orderingDefect) {
    console.log(`- ordering defect: ${summary.orderingDefect.previous} before ${summary.orderingDefect.next}`)
  } else {
    console.log('- ordering defect: none')
  }

  if (summary.extraIds.length > 0) {
    console.log(`- extra ids not in index: ${summary.extraIds.length}`)
    console.log(`  sample: ${summary.extraIds.slice(0, 12).join(', ')}`)
  }

  if (summary.viReadableNonMinhChau.length > 0) {
    console.log(`- readable VI but non-Minh-Chau sample: ${summary.viReadableNonMinhChau.slice(0, 12).map((row) => `${row.id} (${row.viSource})`).join(', ')}`)
  }

  const sampleLines = [
    ['EN unreadable sample', summary.en.unreadable],
    ['VI unreadable sample', summary.vi.unreadable],
    ['EN alias sample', summary.en.alias.map((row) => `${row.id}->${row.canonicalUid}`)],
    ['VI alias sample', summary.vi.alias.map((row) => `${row.id}->${row.canonicalUid}`)],
    ['Alias group sample', summary.aliasGroupsSample.map((row) => `${row.canonicalUid}<-${row.aliases.join(',')}`)],
    ['Alias target missing sample', summary.aliasTargetMissing.map((row) => `${row.id}->${row.canonicalUid}`)],
    ['Indexed range without aliases sample', summary.topology.indexedRangeWithoutAliases],
    ['Alias range violation sample', summary.topology.aliasRangeViolations.map((row) => `${row.aliasId}->${row.canonicalUid}[${row.startId}..${row.endId}]`)],
    ['Range completeness violation sample', summary.topology.rangeCompletenessViolations.map((row) => `${row.canonicalUid}(missing:${row.missingAliasIds.join('|') || 'none'} unexpected:${row.unexpectedAliasIds.join('|') || 'none'})`)],
    ['Route title mismatch sample', summary.titleMismatch.map((row) => `${row.id} (${row.indexTitle} != ${row.candidates.join(' | ')})`)],
    ['Pali title mismatch sample', summary.paliTitleMismatch.map((row) => `${row.id} (${row.indexPaliTitle} != ${row.metadataPaliTitle})`)],
    ['Nav missing previous sample', summary.nav.missingPrevious.map((row) => `${row.id} (${row.expected})`)],
    ['Nav missing next sample', summary.nav.missingNext.map((row) => `${row.id} (${row.expected})`)],
    ['Nav previous mismatch sample', summary.nav.previousMismatch.map((row) => `${row.id} (${row.actual} != ${row.expected})`)],
    ['Nav next mismatch sample', summary.nav.nextMismatch.map((row) => `${row.id} (${row.actual} != ${row.expected})`)],
  ]

  for (const [label, values] of sampleLines) {
    if (values.length > 0) {
      console.log(`- ${label}: ${values.slice(0, 12).join(', ')}`)
    }
  }

  for (const [status, ids] of Object.entries(summary.viSourceSamples)) {
    if (status !== 'direct-minh-chau' && ids.length > 0) {
      console.log(`- VI source sample ${status}: ${ids.slice(0, 12).join(', ')}`)
    }
  }
}
