#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const dataDir = path.join(rootDir, 'public', 'data', 'suttacentral-json', 'kn')
const indexPath = path.join(rootDir, 'public', 'data', 'suttacentral-json', 'nikaya_index.json')
const sourceBase = 'https://trungtamhotong.org/NoiDung/ThuVien/Kinh/u-kinh-tieubo1'
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

function sortIdsNaturally(ids) {
  return [...ids].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
}

function fetchHtml(relativePath) {
  return execFileSync(
    'curl',
    ['-ksSL', '-A', 'Mozilla/5.0', `${sourceBase}/${relativePath}`],
    {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }
  )
}

function getIndexIds(pattern) {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  return sortIdsNaturally(
    index
      .filter((row) => row.collection === 'kn' && pattern.test(String(row.id)))
      .map((row) => String(row.id))
  )
}

function getCutoffIndex(html) {
  const markers = [
    'Mục Lục Tiểu Bộ',
    'Trở về trang Thư Mục',
    'Phẩm kế',
    'Đầu Trang',
  ]

  const matches = markers
    .map((marker) => html.indexOf(marker))
    .filter((index) => index >= 0)

  return matches.length > 0 ? Math.min(...matches) : html.length
}

function collectFragmentsByToken(html, startTokenRegex) {
  const cutoff = getCutoffIndex(html)
  const trimmedHtml = html.slice(0, cutoff)
  const matches = [...trimmedHtml.matchAll(startTokenRegex)]
    .filter((match) => typeof match.index === 'number')

  if (matches.length === 0) {
    return []
  }

  const startPositions = matches
    .map((match) => trimmedHtml.lastIndexOf('<p', match.index))
    .filter((index) => index >= 0)
    .filter((index, position, array) => position === 0 || index !== array[position - 1])

  return startPositions.map((start, index) => {
    const end = index + 1 < startPositions.length ? startPositions[index + 1] : trimmedHtml.length
    return trimmedHtml.slice(start, end).trim()
  }).filter(Boolean)
}

function getReadableHtml(data) {
  if (typeof data?.translation?.text === 'string' && data.translation.text.trim()) {
    return data.translation.text.trim()
  }

  if (typeof data?.root_text?.text === 'string' && data.root_text.text.trim()) {
    return data.root_text.text.trim()
  }

  return ''
}

function updateJsonFile(id, htmlFragment, sourceUrl) {
  const filePath = path.join(dataDir, `${id}_vi_minh_chau.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing target file: ${filePath}`)
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (getReadableHtml(data)) {
    return 'skipped'
  }

  const html = htmlFragment.trim()
  if (!html) {
    throw new Error(`Empty HTML fragment for ${id}`)
  }

  data.translation = {
    ...(data.translation || {}),
    uid: data.translation?.uid || data.suttaplex?.uid || id,
    lang: 'vi',
    author_uid: 'minh_chau',
    text: html,
  }

  data.root_text = {
    ...(typeof data.root_text === 'object' && data.root_text !== null ? data.root_text : {}),
    uid: data.root_text?.uid || data.translation?.uid || data.suttaplex?.uid || id,
    lang: 'vi',
    author_uid: 'minh_chau',
    text: html,
  }

  data.external_source_url = sourceUrl
  data.external_source_name = 'trungtamhotong.org'

  if (!dryRun) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
  }

  return 'updated'
}

function ensureCounts(label, fragments, targetIds) {
  if (fragments.length !== targetIds.length) {
    throw new Error(`${label} count mismatch: got ${fragments.length}, expected ${targetIds.length}`)
  }
}

function importDhp() {
  const dhpTargetIds = getIndexIds(/^dhp\d+-\d+$/)
  const pageMappings = [
    ['tb12-pc1.htm', dhpTargetIds.slice(0, 10)],
    ['tb12-pc2.htm', dhpTargetIds.slice(10, 20)],
    ['tb12-pc3.htm', dhpTargetIds.slice(20)],
  ]

  let updated = 0
  let skipped = 0

  for (const [pagePath, targetIds] of pageMappings) {
    const html = fetchHtml(pagePath)
    const fragments = collectFragmentsByToken(
      html,
      /[IVXLCDM]+\s*(?:\.|-)\s*Phẩm/gi
    )
    ensureCounts(`DHP ${pagePath}`, fragments, targetIds)

    targetIds.forEach((id, index) => {
      const result = updateJsonFile(id, fragments[index], `${sourceBase}/${pagePath}`)
      if (result === 'updated') updated += 1
      if (result === 'skipped') skipped += 1
    })
  }

  return { updated, skipped }
}

function importSequentialBook({ label, pagePaths, startRegex, targetIds }) {
  const fragments = pagePaths.flatMap((pagePath) => {
    const html = fetchHtml(pagePath)
    return collectFragmentsByToken(html, startRegex).map((fragment) => ({
      fragment,
      pagePath,
    }))
  })

  ensureCounts(label, fragments, targetIds)

  let updated = 0
  let skipped = 0

  targetIds.forEach((id, index) => {
    const { fragment, pagePath } = fragments[index]
    const result = updateJsonFile(id, fragment, `${sourceBase}/${pagePath}`)
    if (result === 'updated') updated += 1
    if (result === 'skipped') skipped += 1
  })

  return { updated, skipped }
}

function importUd() {
  return importSequentialBook({
    label: 'UD',
    pagePaths: ['tb13-ptt1.htm', 'tb13-ptt2.htm', 'tb13-ptt3.htm'],
    startRegex: /\([IVXLCDM]+\)[\s\S]{0,80}Ud\s*[0-9.]+/gi,
    targetIds: getIndexIds(/^ud\d+\.\d+$/),
  })
}

function importIti() {
  return importSequentialBook({
    label: 'ITI',
    pagePaths: ['tb14-ptnv1.htm', 'tb14-ptnv2.htm', 'tb14-ptnv3.htm'],
    startRegex: /\([IVXLCDM]+\)[\s\S]{0,120}It[.,]?\s*\d+/gi,
    targetIds: getIndexIds(/^iti\d+$/),
  })
}

function importSnp() {
  return importSequentialBook({
    label: 'SNP',
    pagePaths: ['tb15-kt1.htm', 'tb15-kt2.htm', 'tb15-kt3.htm', 'tb15-kt4.htm', 'tb15-kt5.htm'],
    startRegex: /\([IVXLCDM]+\)[\s\S]{0,120}\(Sn\s*\d+/gi,
    targetIds: getIndexIds(/^snp\d+\.\d+$/),
  })
}

function main() {
  const summary = {
    dhp: importDhp(),
    ud: importUd(),
    iti: importIti(),
    snp: importSnp(),
  }

  console.log(`Trung Tam Ho Tong KN import ${dryRun ? 'dry-run' : 'complete'}`)
  console.log(JSON.stringify(summary, null, 2))
}

main()
