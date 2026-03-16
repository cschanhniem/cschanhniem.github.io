#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const targetCollection = process.argv[2];

if (!targetCollection) {
  console.error('Usage: node scripts/audit-nikaya-triad.mjs <dn|mn|sn|an|kn>');
  process.exit(1);
}

const validCollections = new Set(['dn', 'mn', 'sn', 'an', 'kn']);
if (!validCollections.has(targetCollection)) {
  console.error(`Unsupported collection "${targetCollection}". Use one of: dn, mn, sn, an, kn`);
  process.exit(1);
}

const contentManifestPath = path.join(rootDir, 'public/data/suttacentral-json/effective-content-availability.json');
const aliasManifestPath = path.join(rootDir, 'public/data/suttacentral-json/canonical-aliases.json');
const indexPath = path.join(rootDir, 'public/data/suttacentral-json/nikaya_index.json');
const improvedDir = path.join(rootDir, 'src/data/nikaya-improved/vi');

const contentManifest = JSON.parse(fs.readFileSync(contentManifestPath, 'utf8'));
const aliasManifest = JSON.parse(fs.readFileSync(aliasManifestPath, 'utf8'));
const nikayaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

function normalizeSuttaId(suttaId) {
  return String(suttaId).toLowerCase().replace(/\s+/g, '');
}

function normalizeImprovedFileId(fileName) {
  const baseName = String(fileName).replace(/\.ts$/i, '').trim().toLowerCase();
  const parts = baseName.split('-').filter(Boolean);

  if (parts.length < 2) {
    return normalizeSuttaId(baseName);
  }

  const [collection, major, ...rest] = parts;
  const numericParts = [major, ...rest];
  const isStructuredNikayaId = /^[a-z]+$/.test(collection) && numericParts.every((part) => /^\d+$/.test(part));

  if (!isStructuredNikayaId) {
    return normalizeSuttaId(baseName);
  }

  const normalizedId = `${collection}${major}${rest.length > 0 ? `.${rest.join('.')}` : ''}`;
  return normalizeSuttaId(normalizedId);
}

const hiddenCanonicalIds = new Set(
  Object.entries(aliasManifest).flatMap(([childId, canonicalByLang]) =>
    Object.values(canonicalByLang)
      .filter(Boolean)
      .filter((canonicalId) => normalizeSuttaId(canonicalId) !== normalizeSuttaId(childId))
      .map((canonicalId) => normalizeSuttaId(canonicalId))
  )
)

const improvedFiles = fs.readdirSync(improvedDir)
  .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
  .map((file) => normalizeImprovedFileId(file));
const improvedSet = new Set(improvedFiles);

const rows = nikayaIndex
  .filter((item) => item.collection === targetCollection)
  .filter((item) => !hiddenCanonicalIds.has(normalizeSuttaId(item.id)))
  .map((item) => {
    const id = String(item.id).toLowerCase();
    const normalizedId = normalizeSuttaId(id);
    const langs = contentManifest[id] || [];
    const hasOriginalEn = langs.includes('en');
    const hasOriginalVi = langs.includes('vi');
    const hasImprovedVi = improvedSet.has(normalizedId);

    return {
      id,
      hasOriginalEn,
      hasOriginalVi,
      hasImprovedVi,
      completeTriad: hasOriginalEn && hasOriginalVi && hasImprovedVi,
    };
  });

const summary = {
  total: rows.length,
  originalEn: rows.filter((row) => row.hasOriginalEn).length,
  originalVi: rows.filter((row) => row.hasOriginalVi).length,
  improvedVi: rows.filter((row) => row.hasImprovedVi).length,
  completeTriad: rows.filter((row) => row.completeTriad).length,
};

console.log(`${targetCollection.toUpperCase()} total: ${summary.total}`);
console.log(`EN original content: ${summary.originalEn}/${summary.total}`);
console.log(`VI Minh Chau content: ${summary.originalVi}/${summary.total}`);
console.log(`VI manual 2026: ${summary.improvedVi}/${summary.total}`);
console.log(`Complete triad: ${summary.completeTriad}/${summary.total}`);

const missingRows = rows.filter((row) => !row.completeTriad);
if (missingRows.length > 0) {
  console.log('\nMissing triad:');
  for (const row of missingRows) {
    const missing = [];
    if (!row.hasOriginalEn) missing.push('EN original');
    if (!row.hasOriginalVi) missing.push('VI Minh Chau');
    if (!row.hasImprovedVi) missing.push('VI manual 2026');
    console.log(`- ${row.id}: ${missing.join(', ')}`);
  }
}
