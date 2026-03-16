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
const collections = ['dn', 'mn', 'sn', 'an', 'kn']

function tokenizeSuttaId(id) {
  return String(id)
    .toLowerCase()
    .match(/[a-z]+|\d+|[^a-z\d]+/g) || [String(id).toLowerCase()]
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

function hasReadableContent(data) {
  return Boolean(
    (typeof data.translation?.text === 'string' && data.translation.text.trim()) ||
      (typeof data.root_text?.text === 'string' && data.root_text.text.trim()) ||
      Object.keys(data.html_text || {}).some((key) => key.includes(':')) ||
      Object.keys(data.translation_text || {}).some((key) => key.includes(':')) ||
      Object.keys(data.bilara_translated_text || {}).some((key) => key.includes(':'))
  )
}

const nikayaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
const availableManifest = JSON.parse(fs.readFileSync(availablePath, 'utf8'))
const contentManifest = JSON.parse(fs.readFileSync(contentPath, 'utf8'))

const actualIdsByCollection = new Map()
const misplacedFiles = []
const aliasIdsByCollection = new Map()
const readableCounts = new Map()

for (const collection of collections) {
  const dir = path.join(dataDir, collection)
  const ids = new Set()
  const aliasIds = new Set()
  let readableEn = 0
  let readableVi = 0

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue

    const [id, lang] = file.split('_')
    ids.add(id)

    const expectedCollection = expectedCollectionForId(id)
    if (expectedCollection && expectedCollection !== collection) {
      misplacedFiles.push({ id, file, collection, expectedCollection })
    }

    const filePath = path.join(dir, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const canonicalUid = data.suttaplex?.uid || data.translation?.uid || data.root_text?.uid || null

    if (canonicalUid && canonicalUid !== id) {
      aliasIds.add(id)
    }

    const readable = hasReadableContent(data)
    if (lang === 'en' && readable) readableEn++
    if (lang === 'vi' && readable) readableVi++
  }

  actualIdsByCollection.set(collection, ids)
  aliasIdsByCollection.set(collection, aliasIds)
  readableCounts.set(collection, { readableEn, readableVi })
}

const indexIds = nikayaIndex.map((item) => item.id)
const indexSet = new Set(indexIds)
const availableIds = Object.keys(availableManifest)
const availableSet = new Set(availableIds)
const indexDuplicates = []
{
  const seen = new Set()
  for (const id of indexIds) {
    if (seen.has(id)) indexDuplicates.push(id)
    seen.add(id)
  }
}

const missingFromIndex = availableIds.filter((id) => !indexSet.has(id)).sort(compareSuttaIds)
const missingFromAvailable = indexIds.filter((id) => !availableSet.has(id)).sort(compareSuttaIds)

const manifestContentMismatches = []
for (const collection of collections) {
  const dir = path.join(dataDir, collection)

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue

    const [id, lang] = file.split('_')
    const filePath = path.join(dir, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const actualReadable = hasReadableContent(data)
    const manifestReadable = (contentManifest[id] || []).includes(lang)

    if (actualReadable !== manifestReadable) {
      manifestContentMismatches.push({ id, lang, file, actualReadable, manifestReadable })
    }
  }
}

const orderingDefects = []
for (const collection of collections) {
  const ids = nikayaIndex.filter((item) => item.collection === collection).map((item) => item.id)
  for (let index = 1; index < ids.length; index++) {
    if (compareSuttaIds(ids[index - 1], ids[index]) > 0) {
      orderingDefects.push({ collection, previous: ids[index - 1], next: ids[index] })
      break
    }
  }
}

console.log('Nikaya integrity audit')
console.log('======================')
console.log(`Index ids: ${indexIds.length}`)
console.log(`Available ids: ${availableIds.length}`)
console.log(`Content ids: ${Object.keys(contentManifest).length}`)
console.log(`Index duplicates: ${indexDuplicates.length}`)
console.log(`Missing from index: ${missingFromIndex.length}`)
console.log(`Missing from available: ${missingFromAvailable.length}`)
console.log(`Misplaced files: ${misplacedFiles.length}`)
console.log(`Manifest content mismatches: ${manifestContentMismatches.length}`)
console.log(`Ordering defects: ${orderingDefects.length}`)

for (const collection of collections) {
  const indexCount = nikayaIndex.filter((item) => item.collection === collection).length
  const availableCount = actualIdsByCollection.get(collection).size
  const aliasCount = aliasIdsByCollection.get(collection).size
  const { readableEn, readableVi } = readableCounts.get(collection)

  console.log(`\n${collection.toUpperCase()}`)
  console.log(`- index ids: ${indexCount}`)
  console.log(`- available ids: ${availableCount}`)
  console.log(`- readable EN: ${readableEn}/${availableCount}`)
  console.log(`- readable VI: ${readableVi}/${availableCount}`)
  console.log(`- alias ids (uid != file id): ${aliasCount}`)
}

if (missingFromIndex.length > 0) {
  console.log('\nIDs present in files but missing from index:')
  console.log(missingFromIndex.slice(0, 50).join(', '))
}

if (missingFromAvailable.length > 0) {
  console.log('\nIDs present in index but missing from files:')
  console.log(missingFromAvailable.slice(0, 50).join(', '))
}

if (misplacedFiles.length > 0) {
  console.log('\nMisplaced file samples:')
  for (const sample of misplacedFiles.slice(0, 20)) {
    console.log(`- ${sample.file}: in ${sample.collection}, expected ${sample.expectedCollection}`)
  }
}

if (orderingDefects.length > 0) {
  console.log('\nOrdering defect samples:')
  for (const defect of orderingDefects.slice(0, 20)) {
    console.log(`- ${defect.collection}: ${defect.previous} before ${defect.next}`)
  }
}

const aliasSamples = []
for (const collection of collections) {
  for (const id of aliasIdsByCollection.get(collection)) {
    aliasSamples.push({ collection, id })
    if (aliasSamples.length >= 20) break
  }
  if (aliasSamples.length >= 20) break
}

if (aliasSamples.length > 0) {
  console.log('\nAlias id samples:')
  for (const sample of aliasSamples) {
    console.log(`- ${sample.collection}: ${sample.id}`)
  }
}
