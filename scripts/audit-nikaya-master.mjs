#!/usr/bin/env node

import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const validCollections = ['dn', 'mn', 'sn', 'an', 'kn']
const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const targetCollection = args.find((arg) => validCollections.includes(arg))

if (args.length > 0 && !jsonMode && !targetCollection) {
  console.error('Usage: node scripts/audit-nikaya-master.mjs [dn|mn|sn|an|kn] [--json]')
  process.exit(1)
}

const targetCollections = targetCollection ? [targetCollection] : validCollections
const dataDir = path.join(rootDir, 'public', 'data', 'suttacentral-json')

function normalizeSuttaId(suttaId) {
  return String(suttaId).toLowerCase().replace(/\s+/g, '')
}

function loadVisibleRouteStats() {
  const index = JSON.parse(fs.readFileSync(path.join(dataDir, 'nikaya_index.json'), 'utf8'))
  const effectiveContent = JSON.parse(fs.readFileSync(path.join(dataDir, 'effective-content-availability.json'), 'utf8'))
  const aliases = JSON.parse(fs.readFileSync(path.join(dataDir, 'canonical-aliases.json'), 'utf8'))

  const hiddenCanonicalIds = new Set(
    Object.entries(aliases).flatMap(([childId, canonicalByLang]) =>
      Object.values(canonicalByLang)
        .filter(Boolean)
        .filter((canonicalId) => normalizeSuttaId(canonicalId) !== normalizeSuttaId(childId))
        .map((canonicalId) => normalizeSuttaId(canonicalId))
    )
  )

  const stats = Object.fromEntries(validCollections.map((collection) => [collection, {
    visibleRouteIds: 0,
    hiddenGroupedCanonicalIds: 0,
    visibleEnReadable: 0,
    visibleViReadable: 0,
  }]))

  for (const item of index) {
    const collection = String(item.collection).toLowerCase()
    if (!validCollections.includes(collection)) continue

    const normalizedId = normalizeSuttaId(item.id)
    if (hiddenCanonicalIds.has(normalizedId)) {
      stats[collection].hiddenGroupedCanonicalIds += 1
      continue
    }

    const langs = effectiveContent[normalizedId] || []
    stats[collection].visibleRouteIds += 1
    if (langs.includes('en')) stats[collection].visibleEnReadable += 1
    if (langs.includes('vi')) stats[collection].visibleViReadable += 1
  }

  return stats
}

function runJsonScript(scriptName) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nikaya-master-'))
  const outputPath = path.join(tempDir, `${scriptName}.json`)

  execFileSync(
    'sh',
    [
      '-lc',
      `${JSON.stringify(process.execPath)} ${JSON.stringify(path.join(__dirname, scriptName))} --json > ${JSON.stringify(outputPath)}`,
    ],
    {
      cwd: rootDir,
      stdio: 'inherit',
    }
  )

  return JSON.parse(fs.readFileSync(outputPath, 'utf8'))
}

const originalsReport = runJsonScript('audit-nikaya-originals.mjs')
const coverageReport = runJsonScript('audit-nikaya-coverage-matrix.mjs')
const visibleRouteStats = loadVisibleRouteStats()

const report = {
  generatedAt: new Date().toISOString(),
  global: {
    indexIds: originalsReport.global.indexIds,
    availableIds: originalsReport.global.availableIds,
    contentIds: originalsReport.global.contentIds,
    indexDuplicates: originalsReport.global.indexDuplicates.length,
    missingFromIndex: originalsReport.global.missingFromIndex.length,
    missingFromAvailable: originalsReport.global.missingFromAvailable.length,
    misplacedFiles: originalsReport.global.misplacedFiles.length,
    weirdFiles: originalsReport.global.weirdFiles.length,
    duplicateLangFiles: originalsReport.global.duplicateLangFiles.length,
    orderingDefects: originalsReport.global.orderingDefects.length,
  },
  collections: {},
}

for (const collection of targetCollections) {
  const originals = originalsReport.collections[collection]
  const coverage = coverageReport.collections[collection]

  report.collections[collection] = {
    routeIds: coverage.totalRouteIds,
    canonicalBlocks: coverage.totalCanonicalBlocks,
    publicSurface: visibleRouteStats[collection],
    routeLevel: {
      enReadable: originals.en.readable,
      viReadable: originals.vi.readable,
      enUnreadable: originals.en.unreadable.length,
      viUnreadable: originals.vi.unreadable.length,
      viReadableMinhChau: originals.viReadableMinhChau,
    },
    canonicalLevel: {
      cleanBoth: coverage.cleanCanonicalBlocks,
      missingEnOnly: coverage.canonicalBlocksMissingEn,
      missingViOnly: coverage.canonicalBlocksMissingVi,
      missingBoth: coverage.canonicalBlocksMissingBoth,
      coverageGapIds: coverage.coverageGapIds,
    },
    topology: {
      duplicatedBlocks: coverage.duplicatedTopologyBlocks,
      duplicatedRouteIds: coverage.routeIdsInsideDuplicatedBlocks,
      missingCanonicalBlocks: coverage.missingCanonicalTopologyBlocks,
      missingCanonicalRouteIds: coverage.routeIdsInsideMissingCanonicalBlocks,
      duplicatedBlockIds: coverage.duplicatedBlockIds,
      missingCanonicalBlockIds: coverage.missingCanonicalBlockIds,
      enFallbackRouteIds: coverage.readableOnlyAsCanonicalFallbackEn,
      viFallbackRouteIds: coverage.readableOnlyAsCanonicalFallbackVi,
    },
    integrity: {
      orderingDefect: originals.orderingDefect,
      titleMismatch: originals.titleMismatch.length,
      paliTitleMismatch: originals.paliTitleMismatch.length,
      aliasTargetMissing: originals.aliasTargetMissing.length,
      aliasRangeViolations: originals.topology.aliasRangeViolations.length,
      enAliasRoutes: originals.en.alias.length,
      viAliasRoutes: originals.vi.alias.length,
    },
    provenance: {
      viSourceCounts: originals.viSourceCounts,
      readableViNonMinhChau: originals.viReadableNonMinhChau.length,
    },
  }
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

console.log('Nikaya master audit')
console.log('===================')
console.log(`Index ids: ${report.global.indexIds}`)
console.log(`Available ids: ${report.global.availableIds}`)
console.log(`Content ids: ${report.global.contentIds}`)
console.log(`Index duplicates: ${report.global.indexDuplicates}`)
console.log(`Missing from index: ${report.global.missingFromIndex}`)
console.log(`Missing from available: ${report.global.missingFromAvailable}`)
console.log(`Misplaced files: ${report.global.misplacedFiles}`)
console.log(`Weird files: ${report.global.weirdFiles}`)
console.log(`Duplicate lang files: ${report.global.duplicateLangFiles}`)
console.log(`Ordering defects: ${report.global.orderingDefects}`)

for (const collection of targetCollections) {
  const summary = report.collections[collection]

  console.log(`\n${collection.toUpperCase()}`)
  console.log(`- route ids: ${summary.routeIds}`)
  console.log(`- visible library route ids: ${summary.publicSurface.visibleRouteIds}`)
  console.log(`- hidden grouped canonical ids: ${summary.publicSurface.hiddenGroupedCanonicalIds}`)
  console.log(`- visible route EN readable: ${summary.publicSurface.visibleEnReadable}/${summary.publicSurface.visibleRouteIds}`)
  console.log(`- visible route VI readable: ${summary.publicSurface.visibleViReadable}/${summary.publicSurface.visibleRouteIds}`)
  console.log(`- canonical blocks: ${summary.canonicalBlocks}`)
  console.log(`- route EN readable: ${summary.routeLevel.enReadable}/${summary.routeIds}`)
  console.log(`- route VI readable: ${summary.routeLevel.viReadable}/${summary.routeIds}`)
  console.log(`- route VI readable as Minh Chau: ${summary.routeLevel.viReadableMinhChau}/${summary.routeIds}`)
  console.log(`- canonical clean in both: ${summary.canonicalLevel.cleanBoth}/${summary.canonicalBlocks}`)
  console.log(`- canonical missing EN only: ${summary.canonicalLevel.missingEnOnly}`)
  console.log(`- canonical missing VI only: ${summary.canonicalLevel.missingViOnly}`)
  console.log(`- canonical missing both: ${summary.canonicalLevel.missingBoth}`)
  console.log(`- duplicated topology blocks: ${summary.topology.duplicatedBlocks}`)
  console.log(`- missing canonical topology blocks: ${summary.topology.missingCanonicalBlocks}`)
  console.log(`- EN fallback route ids: ${summary.topology.enFallbackRouteIds}`)
  console.log(`- VI fallback route ids: ${summary.topology.viFallbackRouteIds}`)
  console.log(`- ordering defect: ${summary.integrity.orderingDefect ? 'yes' : 'none'}`)
  console.log(`- title mismatches: ${summary.integrity.titleMismatch}`)
  console.log(`- Pali title mismatches: ${summary.integrity.paliTitleMismatch}`)
  console.log(`- alias target missing: ${summary.integrity.aliasTargetMissing}`)
  console.log(`- alias range violations: ${summary.integrity.aliasRangeViolations}`)
  console.log(`- readable VI but non-Minh-Chau: ${summary.provenance.readableViNonMinhChau}`)

  const sampleLines = [
    ['coverage gaps', summary.canonicalLevel.coverageGapIds.slice(0, 12)],
    ['duplicated blocks', summary.topology.duplicatedBlockIds.slice(0, 12)],
    ['missing canonical blocks', summary.topology.missingCanonicalBlockIds.slice(0, 12)],
  ]

  for (const [label, values] of sampleLines) {
    if (values.length > 0) {
      console.log(`- ${label}: ${values.join(', ')}`)
    }
  }
}
