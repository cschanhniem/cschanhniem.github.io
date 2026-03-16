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
const targetCollections = targetCollection ? [targetCollection] : validCollections

if (args.length > 0 && !jsonMode && !targetCollection) {
  console.error('Usage: node scripts/audit-nikaya-remote-gaps.mjs [dn|mn|sn|an|kn] [--json]')
  process.exit(1)
}

const SC_API_BASE = 'https://suttacentral.net/api'
const REQUEST_TIMEOUT_MS = 15000
const MAX_CONCURRENCY = 6

function normalizeSuttaId(suttaId) {
  return String(suttaId).toLowerCase().replace(/\s+/g, '')
}

function createSummaryBucket() {
  return {
    total: 0,
    readable: 0,
    bilaraReadable: 0,
    legacyReadable: 0,
    metadataOnly: 0,
    notFound: 0,
    httpError: 0,
    networkError: 0,
    samples: {
      readable: [],
      metadataOnly: [],
      notFound: [],
      httpError: [],
      networkError: [],
    },
  }
}

function createCollectionBuckets() {
  return {
    canonical: {
      en: createSummaryBucket(),
      vi: createSummaryBucket(),
    },
    visible: {
      en: createSummaryBucket(),
      vi: createSummaryBucket(),
    },
    details: [],
  }
}

function pushSample(bucket, value, limit = 12) {
  if (bucket.length < limit) {
    bucket.push(value)
  }
}

function runJsonScript(scriptName) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nikaya-remote-'))
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

function countReadableSegments(segmentMap) {
  if (!segmentMap || typeof segmentMap !== 'object') return 0

  return Object.entries(segmentMap).filter(([key, value]) => {
    if (!(String(key).includes(':') || key === 'text')) return false
    if (typeof value !== 'string') return false
    const normalized = value.replace(/\s+/g, ' ').trim()
    return Boolean(normalized && normalized !== '~')
  }).length
}

function countSegmentKeys(segmentMap) {
  if (!segmentMap || typeof segmentMap !== 'object') return 0
  return Object.keys(segmentMap).filter((key) => key.includes(':')).length
}

function summarizePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { state: 'empty-json' }
  }

  if (payload.msg === 'Not Found') {
    return { state: 'not-found-msg' }
  }

  const translationText = typeof payload.translation?.text === 'string' ? payload.translation.text.trim() : ''
  const translationSegments = countReadableSegments(payload.translation_text) + countReadableSegments(payload.bilara_translated_text)
  const rootSegments = countReadableSegments(payload.root_text)
  const htmlSegments = countSegmentKeys(payload.html_text)
  const hasSuttaplex = Boolean(payload.suttaplex)
  const hasTranslationShell = Boolean(payload.translation)

  if (translationText || translationSegments > 0) {
    return {
      state: 'readable',
      translationText: Boolean(translationText),
      translationSegments,
      rootSegments,
      htmlSegments,
    }
  }

  if (htmlSegments > 0 || rootSegments > 0 || hasSuttaplex || hasTranslationShell) {
    return {
      state: 'metadata-only',
      translationText: false,
      translationSegments,
      rootSegments,
      htmlSegments,
    }
  }

  return { state: 'empty-json' }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        'accept': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        ok: false,
        classification: 'http-error',
        status: response.status,
        url,
      }
    }

    const payload = await response.json()
    return {
      ok: true,
      classification: summarizePayload(payload),
      status: response.status,
      url,
    }
  } catch (error) {
    return {
      ok: false,
      classification: 'network-error',
      error: error instanceof Error ? error.message : String(error),
      url,
    }
  }
}

function getAuthorUid(lang) {
  return lang === 'en' ? 'sujato' : 'minh_chau'
}

function parseCoverageGap(gapId) {
  const separatorIndex = String(gapId).lastIndexOf(':')
  if (separatorIndex === -1) return null

  return {
    id: gapId.slice(0, separatorIndex),
    gap: gapId.slice(separatorIndex + 1),
  }
}

function buildProbeTasks(coverageReport) {
  const tasks = []

  for (const collection of targetCollections) {
    const summary = coverageReport.collections[collection]
    for (const gapEntry of summary.coverageGapIds) {
      const parsed = parseCoverageGap(gapEntry)
      if (!parsed) continue

      if (parsed.gap === 'missing-en' || parsed.gap === 'missing-both') {
        tasks.push({ collection, id: parsed.id, lang: 'en' })
      }

      if (parsed.gap === 'missing-vi' || parsed.gap === 'missing-both') {
        tasks.push({ collection, id: parsed.id, lang: 'vi' })
      }
    }
  }

  return tasks
}

function buildVisibleRouteGapTasks() {
  const index = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/suttacentral-json/nikaya_index.json'), 'utf8'))
  const effectiveContent = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/suttacentral-json/effective-content-availability.json'), 'utf8'))
  const aliases = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/suttacentral-json/canonical-aliases.json'), 'utf8'))

  const hiddenCanonicalIds = new Set(
    Object.entries(aliases).flatMap(([childId, canonicalByLang]) =>
      Object.values(canonicalByLang || {})
        .filter((canonicalId) => typeof canonicalId === 'string' && canonicalId.length > 0)
        .filter((canonicalId) => normalizeSuttaId(childId) !== normalizeSuttaId(canonicalId))
        .map((canonicalId) => normalizeSuttaId(canonicalId))
    )
  )

  const tasks = []
  const routeBuckets = Object.fromEntries(targetCollections.map((collection) => [collection, {
    en: [],
    vi: [],
  }]))

  for (const row of index) {
    const collection = String(row.collection).toLowerCase()
    if (!targetCollections.includes(collection)) continue

    const id = normalizeSuttaId(row.id)
    if (hiddenCanonicalIds.has(id)) continue

    const langs = effectiveContent[id] || []
    if (!langs.includes('en')) routeBuckets[collection].en.push(id)
    if (!langs.includes('vi')) routeBuckets[collection].vi.push(id)
  }

  for (const collection of targetCollections) {
    const coverage = coverageReport.collections[collection]

    if ((coverage.canonicalBlocksMissingEn || 0) === 0) {
      for (const id of routeBuckets[collection].en) {
        tasks.push({ collection, id, lang: 'en', sourceKind: 'visible-route-gap' })
      }
    }

    if ((coverage.canonicalBlocksMissingVi || 0) === 0) {
      for (const id of routeBuckets[collection].vi) {
        tasks.push({ collection, id, lang: 'vi', sourceKind: 'visible-route-gap' })
      }
    }
  }

  return tasks
}

async function probeTask(task) {
  const authorUid = getAuthorUid(task.lang)
  const bilaraUrl = `${SC_API_BASE}/bilarasuttas/${task.id}/${authorUid}?lang=${task.lang}`
  const legacyUrl = `${SC_API_BASE}/suttas/${task.id}/${authorUid}?lang=${task.lang}`

  const bilara = await fetchJson(bilaraUrl)
  const legacy = bilara.ok && bilara.classification.state === 'readable'
    ? null
    : await fetchJson(legacyUrl)

  const bilaraState = bilara.ok ? bilara.classification.state : bilara.classification
  const legacyState = legacy
    ? legacy.ok
      ? legacy.classification.state
      : legacy.classification
    : 'skipped'

  let finalState = 'metadata-only'

  if (bilara.ok && bilara.classification.state === 'readable') {
    finalState = 'readable-bilara'
  } else if (legacy?.ok && legacy.classification.state === 'readable') {
    finalState = 'readable-legacy'
  } else if (
    (bilaraState === 'not-found-msg' || bilaraState === 'http-error') &&
    (legacyState === 'not-found-msg' || legacyState === 'http-error')
  ) {
    finalState = 'not-found'
  } else if (bilaraState === 'network-error' || legacyState === 'network-error') {
    finalState = 'network-error'
  } else if (bilaraState === 'http-error' || legacyState === 'http-error') {
    finalState = 'http-error'
  }

  return {
    ...task,
    authorUid,
    finalState,
    bilaraState,
    legacyState,
    bilaraStatus: bilara.status ?? null,
    legacyStatus: legacy?.status ?? null,
  }
}

async function runWithConcurrency(tasks, limit, worker) {
  const results = []
  let cursor = 0

  async function runNext() {
    const index = cursor++
    if (index >= tasks.length) return
    results[index] = await worker(tasks[index])
    await runNext()
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => runNext())
  )

  return results
}

const coverageReport = runJsonScript('audit-nikaya-coverage-matrix.mjs')
const tasks = [
  ...buildProbeTasks(coverageReport).map((task) => ({ ...task, sourceKind: 'canonical-gap' })),
  ...buildVisibleRouteGapTasks(coverageReport),
]
const results = await runWithConcurrency(tasks, MAX_CONCURRENCY, probeTask)

const report = {
  generatedAt: new Date().toISOString(),
  collections: Object.fromEntries(targetCollections.map((collection) => [collection, createCollectionBuckets()])),
}

for (const result of results) {
  const collectionBucket = report.collections[result.collection]
  const scopeBucket = result.sourceKind === 'visible-route-gap' ? collectionBucket.visible : collectionBucket.canonical
  const langBucket = scopeBucket[result.lang]
  langBucket.total += 1
  collectionBucket.details.push(result)

  if (result.finalState === 'readable-bilara' || result.finalState === 'readable-legacy') {
    langBucket.readable += 1
    if (result.finalState === 'readable-bilara') {
      langBucket.bilaraReadable += 1
    } else {
      langBucket.legacyReadable += 1
    }
    pushSample(langBucket.samples.readable, `${result.id}:${result.finalState}`)
  } else if (result.finalState === 'metadata-only') {
    langBucket.metadataOnly += 1
    pushSample(langBucket.samples.metadataOnly, `${result.id}:${result.bilaraState}/${result.legacyState}`)
  } else if (result.finalState === 'not-found') {
    langBucket.notFound += 1
    pushSample(langBucket.samples.notFound, `${result.id}:${result.bilaraStatus ?? '-'}:${result.legacyStatus ?? '-'}`)
  } else if (result.finalState === 'network-error') {
    langBucket.networkError += 1
    pushSample(langBucket.samples.networkError, `${result.id}:${result.bilaraState}/${result.legacyState}`)
  } else {
    langBucket.httpError += 1
    pushSample(langBucket.samples.httpError, `${result.id}:${result.bilaraStatus ?? '-'}:${result.legacyStatus ?? '-'}`)
  }
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

console.log('Nikaya remote gap audit')
console.log('=======================')

for (const collection of targetCollections) {
  const summary = report.collections[collection]
  console.log(`\n${collection.toUpperCase()}`)

  for (const [scopeLabel, scopeBucket] of [['canonical', summary.canonical], ['visible-route', summary.visible]]) {
    for (const lang of ['en', 'vi']) {
      const bucket = scopeBucket[lang]
      if (bucket.total === 0) continue

      console.log(`- ${lang.toUpperCase()} ${scopeLabel} probed gaps: ${bucket.total}`)
      console.log(`  readable: ${bucket.readable}`)
      console.log(`  readable via Bilara: ${bucket.bilaraReadable}`)
      console.log(`  readable via legacy API: ${bucket.legacyReadable}`)
      console.log(`  metadata-only: ${bucket.metadataOnly}`)
      console.log(`  not found: ${bucket.notFound}`)
      console.log(`  http error: ${bucket.httpError}`)
      console.log(`  network error: ${bucket.networkError}`)

      const sampleGroups = [
        ['readable sample', bucket.samples.readable],
        ['metadata-only sample', bucket.samples.metadataOnly],
        ['not-found sample', bucket.samples.notFound],
        ['http-error sample', bucket.samples.httpError],
        ['network-error sample', bucket.samples.networkError],
      ]

      for (const [label, values] of sampleGroups) {
        if (values.length > 0) {
          console.log(`  ${label}: ${values.join(', ')}`)
        }
      }
    }
  }
}
