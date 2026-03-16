#!/usr/bin/env node

import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const dataDir = path.join(rootDir, 'public/data/suttacentral-json')
const indexPath = path.join(dataDir, 'nikaya_index.json')
const validCollections = ['dn', 'mn', 'sn', 'an', 'kn']
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const targetCollection = args.find((arg) => validCollections.includes(arg))

if (args.length > 0 && !jsonMode && !targetCollection) {
  console.error('Usage: node scripts/audit-nikaya-coverage-matrix.mjs [dn|mn|sn|an|kn] [--json]')
  process.exit(1)
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nikaya-coverage-'))
const originalsJsonPath = path.join(tempDir, 'audit-nikaya-originals.json')

execFileSync(
  'sh',
  [
    '-lc',
    `${JSON.stringify(process.execPath)} ${JSON.stringify(path.join(__dirname, 'audit-nikaya-originals.mjs'))} --json > ${JSON.stringify(originalsJsonPath)}`,
  ],
  {
    cwd: rootDir,
    stdio: 'inherit',
  }
)

const originalsReport = JSON.parse(fs.readFileSync(originalsJsonPath, 'utf8'))
const nikayaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
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

function pushSample(bucket, value, limit = 12) {
  if (bucket.length < limit) bucket.push(value)
}

const report = {
  generatedAt: new Date().toISOString(),
  collections: {},
}

for (const collection of targetCollections) {
  const indexRows = nikayaIndex.filter((row) => row.collection === collection)
  const ids = indexRows.map((row) => row.id)
  const idSet = new Set(ids)
  const originals = originalsReport.collections[collection]
  const enUnreadable = new Set(originals.en.unreadable)
  const viUnreadable = new Set(originals.vi.unreadable)
  const aliasMap = new Map()

  for (const row of originals.en.alias) {
    aliasMap.set(row.id, row.canonicalUid)
  }

  for (const row of originals.vi.alias) {
    aliasMap.set(row.id, row.canonicalUid)
  }

  const groups = new Map()

  for (const id of ids) {
    const canonicalUid = aliasMap.get(id) || id
    if (!groups.has(canonicalUid)) {
      groups.set(canonicalUid, [])
    }
    groups.get(canonicalUid).push(id)
  }

  const summary = {
    totalRouteIds: ids.length,
    totalCanonicalBlocks: groups.size,
    cleanCanonicalBlocks: 0,
    canonicalBlocksMissingEn: 0,
    canonicalBlocksMissingVi: 0,
    canonicalBlocksMissingBoth: 0,
    duplicatedTopologyBlocks: 0,
    missingCanonicalTopologyBlocks: 0,
    routeIdsInsideDuplicatedBlocks: 0,
    routeIdsInsideMissingCanonicalBlocks: 0,
    readableOnlyAsCanonicalFallbackEn: 0,
    readableOnlyAsCanonicalFallbackVi: 0,
    coverageGapIds: [],
    duplicatedBlockIds: [],
    missingCanonicalBlockIds: [],
    readableViaCanonicalButOwnFileUnreadableEnIds: [],
    readableViaCanonicalButOwnFileUnreadableViIds: [],
    readableViaCanonicalButOwnFileUnreadableEn: [],
    readableViaCanonicalButOwnFileUnreadableVi: [],
    missingCanonicalBlocks: [],
    canonicalCoverageGaps: [],
    duplicatedBlocks: [],
  }

  for (const [canonicalUid, memberIds] of [...groups.entries()].sort(([left], [right]) => compareSuttaIds(left, right))) {
    memberIds.sort(compareSuttaIds)

    const canonicalInIndex = idSet.has(canonicalUid)
    const childIds = memberIds.filter((id) => id !== canonicalUid)
    const canonicalEnReadable = canonicalInIndex ? !enUnreadable.has(canonicalUid) : false
    const canonicalViReadable = canonicalInIndex ? !viUnreadable.has(canonicalUid) : false
    const duplicatedTopology = canonicalInIndex && childIds.length > 0
    const missingCanonicalTopology = !canonicalInIndex && childIds.length > 0
    const memberUnreadableEn = memberIds.filter((id) => enUnreadable.has(id))
    const memberUnreadableVi = memberIds.filter((id) => viUnreadable.has(id))

    if (canonicalEnReadable && canonicalViReadable) {
      summary.cleanCanonicalBlocks++
    } else if (!canonicalEnReadable && !canonicalViReadable) {
      summary.canonicalBlocksMissingBoth++
      summary.coverageGapIds.push(`${canonicalUid}:missing-both`)
      pushSample(summary.canonicalCoverageGaps, `${canonicalUid}:missing-both`)
    } else if (!canonicalEnReadable) {
      summary.canonicalBlocksMissingEn++
      summary.coverageGapIds.push(`${canonicalUid}:missing-en`)
      pushSample(summary.canonicalCoverageGaps, `${canonicalUid}:missing-en`)
    } else {
      summary.canonicalBlocksMissingVi++
      summary.coverageGapIds.push(`${canonicalUid}:missing-vi`)
      pushSample(summary.canonicalCoverageGaps, `${canonicalUid}:missing-vi`)
    }

    if (duplicatedTopology) {
      summary.duplicatedTopologyBlocks++
      summary.routeIdsInsideDuplicatedBlocks += childIds.length
      summary.duplicatedBlockIds.push(`${canonicalUid}:${childIds.length}`)
      pushSample(summary.duplicatedBlocks, `${canonicalUid}:${childIds.length}`)
    }

    if (missingCanonicalTopology) {
      summary.missingCanonicalTopologyBlocks++
      summary.routeIdsInsideMissingCanonicalBlocks += childIds.length
      summary.missingCanonicalBlockIds.push(`${canonicalUid}:${childIds.length}`)
      pushSample(summary.missingCanonicalBlocks, `${canonicalUid}:${childIds.length}`)
    }

    if (canonicalEnReadable) {
      for (const id of childIds) {
        if (enUnreadable.has(id)) {
          summary.readableOnlyAsCanonicalFallbackEn++
          summary.readableViaCanonicalButOwnFileUnreadableEnIds.push(`${id}->${canonicalUid}`)
          pushSample(summary.readableViaCanonicalButOwnFileUnreadableEn, `${id}->${canonicalUid}`)
        }
      }
    }

    if (canonicalViReadable) {
      for (const id of childIds) {
        if (viUnreadable.has(id)) {
          summary.readableOnlyAsCanonicalFallbackVi++
          summary.readableViaCanonicalButOwnFileUnreadableViIds.push(`${id}->${canonicalUid}`)
          pushSample(summary.readableViaCanonicalButOwnFileUnreadableVi, `${id}->${canonicalUid}`)
        }
      }
    }
  }

  report.collections[collection] = summary
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

console.log('Nikaya coverage matrix audit')
console.log('===========================')

for (const collection of targetCollections) {
  const summary = report.collections[collection]

  console.log(`\n${collection.toUpperCase()}`)
  console.log(`- total route ids: ${summary.totalRouteIds}`)
  console.log(`- total canonical blocks: ${summary.totalCanonicalBlocks}`)
  console.log(`- clean canonical blocks: ${summary.cleanCanonicalBlocks}`)
  console.log(`- canonical blocks missing EN: ${summary.canonicalBlocksMissingEn}`)
  console.log(`- canonical blocks missing VI: ${summary.canonicalBlocksMissingVi}`)
  console.log(`- canonical blocks missing both: ${summary.canonicalBlocksMissingBoth}`)
  console.log(`- duplicated topology blocks: ${summary.duplicatedTopologyBlocks}`)
  console.log(`- route ids inside duplicated blocks: ${summary.routeIdsInsideDuplicatedBlocks}`)
  console.log(`- missing canonical topology blocks: ${summary.missingCanonicalTopologyBlocks}`)
  console.log(`- route ids inside missing canonical blocks: ${summary.routeIdsInsideMissingCanonicalBlocks}`)
  console.log(`- EN readable only via canonical fallback: ${summary.readableOnlyAsCanonicalFallbackEn}`)
  console.log(`- VI readable only via canonical fallback: ${summary.readableOnlyAsCanonicalFallbackVi}`)

  const sampleLines = [
    ['coverage gaps', summary.canonicalCoverageGaps],
    ['duplicated blocks', summary.duplicatedBlocks],
    ['missing canonical blocks', summary.missingCanonicalBlocks],
    ['EN fallback sample', summary.readableViaCanonicalButOwnFileUnreadableEn],
    ['VI fallback sample', summary.readableViaCanonicalButOwnFileUnreadableVi],
  ]

  for (const [label, values] of sampleLines) {
    if (values.length > 0) {
      console.log(`- ${label}: ${values.join(', ')}`)
    }
  }
}
