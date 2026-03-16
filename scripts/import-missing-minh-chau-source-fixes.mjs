#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const dataDir = path.join(rootDir, 'public', 'data', 'suttacentral-json')
const dryRun = process.argv.includes('--dry-run')

const sources = {
  sn: {
    baseUrl: 'https://trungtamhotong.org/NoiDung/ThuVien/Kinh/u-kinh-tuongungbo',
    pages: {
      kosala: 'tu1-03.htm',
      salayatana: 'tu4-35b.htm',
      vedana: 'tu4-36.htm',
      matugama: 'tu4-37.htm',
    },
  },
  an: {
    baseUrl: 'https://trungtamhotong.org/NoiDung/ThuVien/Kinh/u-kinh-tangchibo',
    pages: {
      chapter9: 'tangchi09-0410.htm',
    },
  },
}

function readSourcePage(baseUrl, relativePath, cacheName = relativePath) {
  const cachePath = path.join('/tmp', cacheName)
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf8')
  }

  return execFileSync(
    'curl',
    ['-ksSL', '-A', 'Mozilla/5.0', `${baseUrl}/${relativePath}`],
    {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }
  )
}

function findParagraphStart(html, marker, fromIndex = 0) {
  const index = html.indexOf(marker, fromIndex)
  if (index < 0) {
    throw new Error(`Marker not found: ${marker}`)
  }

  const paragraphStart = html.lastIndexOf('<p', index)
  if (paragraphStart < 0) {
    throw new Error(`Paragraph start not found for marker: ${marker}`)
  }

  return paragraphStart
}

function findCutoffIndex(html, markers, startIndex = 0) {
  const matches = markers
    .map((marker) => html.indexOf(marker, startIndex))
    .filter((index) => index >= 0)

  if (matches.length === 0) {
    throw new Error(`No cutoff marker found after index ${startIndex}`)
  }

  return Math.min(...matches)
}

function sliceHtmlBetween(html, startMarker, endMarkers) {
  const start = findParagraphStart(html, startMarker)
  const cutoff = findCutoffIndex(html, Array.isArray(endMarkers) ? endMarkers : [endMarkers], start + startMarker.length)
  const end = html.lastIndexOf('<p', cutoff)
  if (end <= start) {
    throw new Error(`Invalid slice for marker: ${startMarker}`)
  }

  return html.slice(start, end).trim()
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

function updateJsonFile(collection, id, html, sourceUrl, sourceUid = id) {
  const filePath = path.join(dataDir, collection, `${id}_vi_minh_chau.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing target file: ${filePath}`)
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (getReadableHtml(data)) {
    return 'skipped'
  }

  if (!html.trim()) {
    throw new Error(`Empty html for ${id}`)
  }

  data.translation = {
    ...(data.translation || {}),
    uid: sourceUid,
    lang: 'vi',
    author_uid: 'minh_chau',
    text: html.trim(),
  }

  data.root_text = {
    ...(typeof data.root_text === 'object' && data.root_text !== null ? data.root_text : {}),
    uid: sourceUid,
    lang: 'vi',
    author_uid: 'minh_chau',
    text: html.trim(),
  }

  data.external_source_url = sourceUrl
  data.external_source_name = 'trungtamhotong.org'

  if (!dryRun) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
  }

  return 'updated'
}

function updateMany(collection, ids, html, sourceUrl, sourceUid) {
  let updated = 0
  let skipped = 0

  for (const id of ids) {
    const result = updateJsonFile(collection, id, html, sourceUrl, sourceUid)
    if (result === 'updated') updated += 1
    if (result === 'skipped') skipped += 1
  }

  return { updated, skipped }
}

function importSnMissing() {
  const baseUrl = sources.sn.baseUrl
  const kosalaPath = sources.sn.pages.kosala
  const salayatanaPath = sources.sn.pages.salayatana
  const vedanaPath = sources.sn.pages.vedana
  const matugamaPath = sources.sn.pages.matugama

  const kosalaHtml = readSourcePage(baseUrl, kosalaPath)
  const salayatanaHtml = readSourcePage(baseUrl, salayatanaPath)
  const vedanaHtml = readSourcePage(baseUrl, vedanaPath)
  const matugamaHtml = readSourcePage(baseUrl, matugamaPath)

  return {
    sn315: updateMany(
      'sn',
      ['sn3.15'],
      sliceHtmlBetween(
        kosalaHtml,
        '8) Rồi vua Ajàtasattu, con bà Videhi nước',
        ['VI. Người Con Gái']
      ),
      `${baseUrl}/${kosalaPath}`
    ),
    sn3557: updateMany(
      'sn',
      ['sn35.57'],
      sliceHtmlBetween(
        salayatanaHtml,
        '56-57.IV-V. Các Lậu Hoặc',
        ['58-59.VI-VII. Các Tùy Miên']
      ),
      `${baseUrl}/${salayatanaPath}`,
      'sn35.56-57'
    ),
    sn3559: updateMany(
      'sn',
      ['sn35.59'],
      sliceHtmlBetween(
        salayatanaHtml,
        '58-59.VI-VII. Các Tùy Miên',
        ['60.VIII. Liễu Tri']
      ),
      `${baseUrl}/${salayatanaPath}`,
      'sn35.58-59'
    ),
    sn3582: updateMany(
      'sn',
      ['sn35.82'],
      sliceHtmlBetween(
        salayatanaHtml,
        '82.IX. Thế Giới',
        ['IV. Phẩm Channa', '84. I. Biến Hoại']
      ),
      `${baseUrl}/${salayatanaPath}`
    ),
    sn3625: updateMany(
      'sn',
      ['sn36.25'],
      sliceHtmlBetween(
        vedanaHtml,
        '25. V. Bởi Vị Tỷ Kheo',
        ['26. VI. Sa Môn, Bà La Môn']
      ),
      `${baseUrl}/${vedanaPath}`
    ),
    sn3717_24: updateMany(
      'sn',
      ['sn37.17', 'sn37.18', 'sn37.19', 'sn37.20', 'sn37.21', 'sn37.22', 'sn37.23', 'sn37.24'],
      sliceHtmlBetween(
        matugamaHtml,
        '16-24. II-X.',
        ['25. I. Không Sợ Hãi']
      ),
      `${baseUrl}/${matugamaPath}`,
      'sn37.16-24'
    ),
  }
}

function importAnMissing() {
  const baseUrl = sources.an.baseUrl
  const chapter9Path = sources.an.pages.chapter9
  const chapter9Html = readSourcePage(baseUrl, chapter9Path)

  return {
    an9113_432: updateMany(
      'an',
      ['an9.113-432'],
      sliceHtmlBetween(
        chapter9Html,
        'V. Phẩm Pancala',
        ['Phẩm trước', 'Mục Lục các Chương']
      ),
      `${baseUrl}/${chapter9Path}`,
      'an9.113-432'
    ),
  }
}

function main() {
  const summary = {
    sn: importSnMissing(),
    an: importAnMissing(),
  }

  console.log(`Missing Minh Chau source fixes ${dryRun ? 'dry-run' : 'complete'}`)
  console.log(JSON.stringify(summary, null, 2))
}

main()
