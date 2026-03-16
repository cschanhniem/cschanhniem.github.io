#!/usr/bin/env node
/**
 * Bulk SuttaCentral Data Fetcher
 * 
 * Downloads ALL suttas for the main Nikaya collections, including KN.
 * Uses robust iteration with "consecutive error" breaking for SN/AN.
 * Skips existing files to allow resuming.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://suttacentral.net/api/suttas';
const DATA_DIR = path.join(__dirname, '../public/data/suttacentral-json');

const TRANSLATORS = {
    vi: 'minh_chau',
    en: 'sujato',
};

// Configuration
const MAX_CONSECUTIVE_ERRORS = 5; // Stop finding suttas in a group after this many 404s
const DELAY_MS = 300; // Delay between requests

function hasSegmentMapContent(segmentMap) {
    if (!segmentMap || typeof segmentMap !== 'object') return false;
    return Object.keys(segmentMap).some(key => key.includes(':'));
}

function hasContentPayload(data) {
    if (!data || typeof data !== 'object') return false;

    if (typeof data.translation?.text === 'string' && data.translation.text.trim()) return true;
    if (typeof data.root_text?.text === 'string' && data.root_text.text.trim()) return true;
    if (hasSegmentMapContent(data.html_text)) return true;
    if (hasSegmentMapContent(data.translation_text)) return true;
    if (hasSegmentMapContent(data.bilara_translated_text)) return true;

    return false;
}

function normalizeUid(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized || null;
}

function getCanonicalUid(data) {
    return normalizeUid(data?.translation?.uid)
        || normalizeUid(data?.root_text?.uid)
        || normalizeUid(data?.suttaplex?.uid)
        || normalizeUid(data?.range_uid)
        || null;
}

function classifyViSource(data) {
    const directEntry = [data?.translation, data?.root_text]
        .find((entry) => entry && entry.lang === 'vi' && typeof entry.author_uid === 'string');

    if (directEntry?.author_uid === 'minh_chau') {
        return 'direct-minh-chau';
    }

    if (directEntry?.author_uid) {
        return `direct-other:${directEntry.author_uid}`;
    }

    const viTranslations = Array.isArray(data?.suttaplex?.translations)
        ? data.suttaplex.translations.filter((entry) => entry?.lang === 'vi')
        : [];

    if (viTranslations.some((entry) => entry?.author_uid === 'minh_chau')) {
        return 'plex-minh-chau';
    }

    if (viTranslations.length > 0) {
        return `plex-other:${viTranslations.map((entry) => entry?.author_uid).filter(Boolean).join('|')}`;
    }

    return 'no-vi-metadata';
}

function hasCuratedOriginalContent(data, lang) {
    if (!hasContentPayload(data)) return false;

    if (lang !== 'vi') {
        return true;
    }

    const viSource = classifyViSource(data);
    return viSource === 'direct-minh-chau' || viSource === 'plex-minh-chau';
}

function sortIdsNaturally(ids) {
    return [...ids].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

async function fetchSuttaData(suttaId, authorUid, lang) {
    const url = lang === 'en'
        ? `https://suttacentral.net/api/bilarasuttas/${suttaId}/${authorUid}?lang=${lang}`
        : `${BASE_URL}/${suttaId}/${authorUid}?lang=${lang}`;
    // console.log(`Fetching: ${url}`); 

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return { status: 404 };
            console.error(`Failed to fetch ${suttaId}/${authorUid}: ${response.status}`);
            return { status: response.status };
        }
        const data = await response.json();

        // Validate content: SuttaCentral API returns 200 even for non-existent IDs sometimes
        if (!data || !data.suttaplex || !data.suttaplex.uid) {
            if (lang === 'en' && hasContentPayload(data)) {
                return { status: 200, data };
            }
            return { status: 404 };
        }

        return { status: 200, data };
    } catch (error) {
        console.error(`Error fetching ${suttaId}:`, error.message);
        return { status: 500 };
    }
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function saveJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function fileHasContent(filePath) {
    if (!fs.existsSync(filePath)) return false;

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return hasContentPayload(data);
    } catch {
        return false;
    }
}

function fileHasCuratedOriginalContent(filePath, lang) {
    if (!fs.existsSync(filePath)) return false;

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return hasCuratedOriginalContent(data, lang);
    } catch {
        return false;
    }
}

function collectAliasManifestForCollection(collection) {
    const collectionDir = path.join(DATA_DIR, collection);
    if (!fs.existsSync(collectionDir)) {
        return {};
    }

    const aliasManifest = {};

    for (const file of fs.readdirSync(collectionDir)) {
        const match = file.match(/^(.*)_(vi|en)_[^_]+\.json$/);
        if (!match) continue;

        const [, id, lang] = match;
        const filePath = path.join(collectionDir, file);

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const canonicalUid = getCanonicalUid(data);

            if (!canonicalUid || canonicalUid === id) {
                continue;
            }

            if (!aliasManifest[id]) {
                aliasManifest[id] = {};
            }

            aliasManifest[id][lang] = canonicalUid;
        } catch {
            // Ignore malformed local files here. The integrity audits will flag them.
        }
    }

    return aliasManifest;
}

async function processSutta(id, collection) {
    const collectionDir = path.join(DATA_DIR, collection);
    ensureDir(collectionDir);
    let foundAny = false;

    // Check if we already have files (skip if both languages exist)
    const viFile = path.join(collectionDir, `${id}_vi_${TRANSLATORS.vi}.json`);
    const enFile = path.join(collectionDir, `${id}_en_${TRANSLATORS.en}.json`);

    const viReady = fileHasCuratedOriginalContent(viFile, 'vi');
    const enReady = fileHasCuratedOriginalContent(enFile, 'en');

    if (viReady && enReady) {
        // console.log(`Skipping ${id} (already exists)`);
        return true; // Treat as found so we don't break loops
    }

    process.stdout.write(`Fetching ${id}... `);

    // Fetch Vietnamese
    if (!viReady) {
        const viRes = await fetchSuttaData(id, TRANSLATORS.vi, 'vi');
        if (viRes.status === 200 && viRes.data) {
            saveJsonFile(viFile, viRes.data);
            foundAny = true;
        }
    } else {
        foundAny = true; // Exists
    }

    // Fetch English
    if (!enReady) {
        const enRes = await fetchSuttaData(id, TRANSLATORS.en, 'en');
        if (enRes.status === 200 && enRes.data) {
            saveJsonFile(enFile, enRes.data);
            foundAny = true;
        }
    } else {
        foundAny = true; // Exists
    }

    if (foundAny) console.log('✅');
    else console.log('❌');

    return foundAny;
}

function getCollectionIds(collection) {
    const indexPath = path.join(DATA_DIR, 'nikaya_index.json');
    if (!fs.existsSync(indexPath)) {
        return [];
    }

    try {
        const nikayaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        return nikayaIndex
            .filter((item) => item.collection === collection && typeof item.id === 'string')
            .map((item) => item.id)
            .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
    } catch (error) {
        console.error(`Failed to read collection IDs for ${collection}:`, error.message);
        return [];
    }
}

async function repairCollectionLanguage(collection, lang) {
    if (!['vi', 'en'].includes(lang)) {
        throw new Error(`Unsupported repair language "${lang}". Use "vi" or "en".`);
    }

    const ids = getCollectionIds(collection);
    if (ids.length === 0) {
        console.log(`No IDs found for collection "${collection}".`);
        return;
    }

    const collectionDir = path.join(DATA_DIR, collection);
    ensureDir(collectionDir);
    const aliasManifest = collectAliasManifestForCollection(collection);

    const authorUid = TRANSLATORS[lang];
    let repaired = 0;
    let stillMissing = 0;
    let skippedToCanonical = 0;

    console.log(`\n=== Repairing ${collection.toUpperCase()} ${lang.toUpperCase()} originals (${ids.length} route IDs) ===`);

    for (const id of ids) {
        const filePath = path.join(collectionDir, `${id}_${lang}_${authorUid}.json`);
        const ready = fileHasCuratedOriginalContent(filePath, lang);

        if (ready) {
            continue;
        }

        const canonicalUid = aliasManifest[id]?.[lang];
        if (canonicalUid && canonicalUid !== id) {
            const canonicalFilePath = path.join(collectionDir, `${canonicalUid}_${lang}_${authorUid}.json`);
            if (fileHasCuratedOriginalContent(canonicalFilePath, lang)) {
                skippedToCanonical++;
                continue;
            }
        }

        process.stdout.write(`Repairing ${id} (${lang})... `);
        const result = await fetchSuttaData(id, authorUid, lang);

        if (result.status === 200 && result.data && hasCuratedOriginalContent(result.data, lang)) {
            saveJsonFile(filePath, result.data);
            repaired++;
            console.log('✅');
        } else {
            stillMissing++;
            console.log('❌');
        }

        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log(`Repaired ${repaired} ${lang.toUpperCase()} files for ${collection.toUpperCase()}.`);
    console.log(`Skipped ${skippedToCanonical} ${lang.toUpperCase()} child routes already covered by canonical fallback.`);
    console.log(`Still missing or unreadable after repair: ${stillMissing}.`);
}

function getGroupedIdsForCollection(collection) {
    const indexPath = path.join(DATA_DIR, 'nikaya_index.json');
    if (!fs.existsSync(indexPath)) {
        return [];
    }

    try {
        const nikayaIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        return nikayaIndex
            .filter((item) => item.collection === collection && typeof item.id === 'string' && item.id.includes('-'))
            .map((item) => item.id)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    } catch (error) {
        console.error(`Failed to read grouped IDs for ${collection}:`, error.message);
        return [];
    }
}

function getDerivedGroupedIdsForCollection(collection) {
    const aliasManifest = collectAliasManifestForCollection(collection);
    const groupedIds = new Set();

    for (const languages of Object.values(aliasManifest)) {
        for (const canonicalUid of Object.values(languages)) {
            if (typeof canonicalUid === 'string' && canonicalUid.includes('-')) {
                groupedIds.add(canonicalUid);
            }
        }
    }

    return sortIdsNaturally(groupedIds);
}

async function fetchGroupedSuttas(collection) {
    const groupedIds = new Set([
        ...getGroupedIdsForCollection(collection),
        ...getDerivedGroupedIdsForCollection(collection),
    ]);

    const sortedGroupedIds = sortIdsNaturally(groupedIds);
    if (sortedGroupedIds.length === 0) {
        return;
    }

    console.log(`\n--- ${collection.toUpperCase()} grouped range IDs (${sortedGroupedIds.length}) ---`);
    for (const id of sortedGroupedIds) {
        await processSutta(id, collection);
        await new Promise(r => setTimeout(r, DELAY_MS));
    }
}

async function fetchCollection(name, generator) {
    console.log(`\n=== Fetching ${name} Collection ===`);
    let consecutiveErrors = 0;

    // We need to handle nested loops for SN/AN differently
    // Actually, generator should yield IDs. 
    // If it yields a "group change" signal, we reset errors?
    // Let's keep it simple: generator returns specific IDs. 
    // For SN/AN, we will implement the loops inside separate functions.
}

async function fetchDN() {
    console.log('\n=== Fetching DN (Digha Nikaya) ===');
    for (let i = 1; i <= 34; i++) {
        await processSutta(`dn${i}`, 'dn');
        await new Promise(r => setTimeout(r, DELAY_MS));
    }
}

async function fetchMN() {
    console.log('\n=== Fetching MN (Majjhima Nikaya) ===');
    for (let i = 1; i <= 152; i++) {
        await processSutta(`mn${i}`, 'mn');
        await new Promise(r => setTimeout(r, DELAY_MS));
    }
}

async function fetchSN() {
    console.log('\n=== Fetching SN (Samyutta Nikaya) ===');
    // SN has 56 Samyuttas
    for (let samyutta = 1; samyutta <= 56; samyutta++) {
        console.log(`\n--- SN Samyutta ${samyutta} ---`);
        let consecutiveErrors = 0;
        let sutta = 1;

        while (true) {
            const id = `sn${samyutta}.${sutta}`;
            const found = await processSutta(id, 'sn');

            if (found) {
                consecutiveErrors = 0;
            } else {
                consecutiveErrors++;
            }

            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.log(`Stopping Samyutta ${samyutta} after ${sutta} (5 consecutive misses)`);
                break;
            }

            sutta++;
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    await fetchGroupedSuttas('sn');
}

async function fetchAN() {
    console.log('\n=== Fetching AN (Anguttara Nikaya) ===');
    // AN has 11 Nipatas
    for (let nipata = 1; nipata <= 11; nipata++) {
        console.log(`\n--- AN Nipata ${nipata} ---`);
        let consecutiveErrors = 0;
        let sutta = 1;

        while (true) {
            const id = `an${nipata}.${sutta}`;
            const found = await processSutta(id, 'an');

            if (found) {
                consecutiveErrors = 0;
            } else {
                consecutiveErrors++;
            }

            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.log(`Stopping Nipata ${nipata} after ${sutta} (5 consecutive misses)`);
                break;
            }

            sutta++;
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    await fetchGroupedSuttas('an');
}

async function generateManifest() {
    console.log('\nGenerating manifest...');
    const manifest = {};
    const contentManifest = {};
    const effectiveContentManifest = {};
    const aliasManifest = {};

    const collections = ['dn', 'mn', 'sn', 'an', 'kn'];
    for (const collection of collections) {
        const dir = path.join(DATA_DIR, collection);
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (!file.endsWith('.json')) return;
            // Format: id_lang_author.json
            // e.g. dn1_vi_minh_chau.json
            const parts = file.split('_');
            if (parts.length >= 3) {
                const id = parts[0];
                const lang = parts[1];

                if (!manifest[id]) manifest[id] = [];
                if (!manifest[id].includes(lang)) manifest[id].push(lang);

                const filePath = path.join(dir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const rawReadable = hasContentPayload(data);
                const effectiveReadable = hasCuratedOriginalContent(data, lang);
                const canonicalUid = getCanonicalUid(data);

                if (rawReadable) {
                    if (!contentManifest[id]) contentManifest[id] = [];
                    if (!contentManifest[id].includes(lang)) contentManifest[id].push(lang);
                }

                if (effectiveReadable) {
                    if (!effectiveContentManifest[id]) effectiveContentManifest[id] = [];
                    if (!effectiveContentManifest[id].includes(lang)) effectiveContentManifest[id].push(lang);
                }

                if (canonicalUid && canonicalUid !== id) {
                    if (!aliasManifest[id]) aliasManifest[id] = {};
                    aliasManifest[id][lang] = canonicalUid;
                }
            }
        });
    }

    for (const [id, languages] of Object.entries(aliasManifest)) {
        for (const [lang, canonicalUid] of Object.entries(languages)) {
            const canonicalLangs = effectiveContentManifest[canonicalUid] || [];
            if (!canonicalLangs.includes(lang)) continue;

            if (!effectiveContentManifest[id]) effectiveContentManifest[id] = [];
            if (!effectiveContentManifest[id].includes(lang)) {
                effectiveContentManifest[id].push(lang);
            }
        }
    }

    for (const dictionary of [manifest, contentManifest, effectiveContentManifest]) {
        for (const key of Object.keys(dictionary)) {
            dictionary[key] = sortIdsNaturally(dictionary[key]);
        }
    }

    const manifestPath = path.join(DATA_DIR, 'available.json');
    const contentManifestPath = path.join(DATA_DIR, 'content-availability.json');
    const effectiveContentManifestPath = path.join(DATA_DIR, 'effective-content-availability.json');
    const aliasManifestPath = path.join(DATA_DIR, 'canonical-aliases.json');
    saveJsonFile(manifestPath, manifest);
    saveJsonFile(contentManifestPath, contentManifest);
    saveJsonFile(effectiveContentManifestPath, effectiveContentManifest);
    saveJsonFile(aliasManifestPath, aliasManifest);
    console.log(`Manifest saved to ${manifestPath}`);
    console.log(`Content manifest saved to ${contentManifestPath}`);
    console.log(`Effective content manifest saved to ${effectiveContentManifestPath}`);
    console.log(`Canonical alias manifest saved to ${aliasManifestPath}`);
}

// KN Fetching Utilities
async function fetchNumericRange(prefix, start, end, collection) {
    for (let i = start; i <= end; i++) {
        await processSutta(`${prefix}${i}`, collection);
        await new Promise(r => setTimeout(r, DELAY_MS));
    }
}

async function fetchChapterSuttas(prefix, chapters, suttasPerChapter, collection) {
    for (let c = 1; c <= chapters; c++) {
        for (let s = 1; s <= suttasPerChapter; s++) {
            await processSutta(`${prefix}${c}.${s}`, collection);
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }
}

async function fetchKN() {
    console.log('\nFetching Khuddaka Nikaya (KN)...');
    const knCollectionName = 'kn';
    ensureDir(path.join(DATA_DIR, knCollectionName));

    // 1. Khuddakapatha (Kp 1-9)
    console.log('Fetching Khuddakapatha (Kp)...');
    await fetchNumericRange('kp', 1, 9, knCollectionName);

    // 2. Dhammapada (Dhp 1-423 verses)
    console.log('Fetching Dhammapada (Dhp)...');
    await fetchNumericRange('dhp', 1, 423, knCollectionName);

    // 3. Udana (Ud 1.1 - 8.10)
    console.log('Fetching Udana (Ud)...');
    await fetchChapterSuttas('ud', 8, 10, knCollectionName);

    // 4. Itivuttaka (Iti 1-112)
    console.log('Fetching Itivuttaka (Iti)...');
    await fetchNumericRange('iti', 1, 112, knCollectionName);

    // 5. Sutta Nipata (Snp 1.1 - 5.xx)
    console.log('Fetching Sutta Nipata (Snp)...');
    // Chapters: 1 (12), 2 (14), 3 (12), 4 (16), 5 (16)
    const snpCounts = [12, 14, 12, 16, 16];
    for (let c = 1; c <= 5; c++) {
        for (let s = 1; s <= snpCounts[c - 1]; s++) {
            await processSutta(`snp${c}.${s}`, knCollectionName);
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    await fetchGroupedSuttas(knCollectionName);
}

async function main() {
    const args = process.argv.slice(2);
    const target = args[0];
    const groupedCollection = args[1];
    const repairLang = args[2];

    if (!target) {
        console.log('Usage: node fetch-all-nikayas.mjs <dn|mn|sn|an|kn|all|scan|grouped|repair> [dn|mn|sn|an|kn] [vi|en]');
        process.exit(1);
    }

    if (target === 'scan') {
        await generateManifest();
        return;
    }

    if (target === 'grouped') {
        if (groupedCollection && !['dn', 'mn', 'sn', 'an', 'kn'].includes(groupedCollection)) {
            console.error(`Unsupported grouped collection "${groupedCollection}". Use one of: dn, mn, sn, an, kn`);
            process.exit(1);
        }

        const collections = groupedCollection ? [groupedCollection] : ['dn', 'mn', 'sn', 'an', 'kn'];
        for (const collection of collections) {
            await fetchGroupedSuttas(collection);
        }

        await generateManifest();

        console.log('\nGenerating detailed index for library...');
        try {
            execSync('node scripts/generate-nikaya-index.mjs', { stdio: 'inherit', cwd: process.cwd() });
            console.log('Detailed index generated.');
        } catch (e) {
            console.error('Failed to generate detailed index:', e.message);
        }

        console.log('\nGrouped fetch complete!');
        return;
    }

    if (target === 'repair') {
        if (!groupedCollection || !['dn', 'mn', 'sn', 'an', 'kn'].includes(groupedCollection) || !repairLang) {
            console.error('Usage: node fetch-all-nikayas.mjs repair <dn|mn|sn|an|kn> <vi|en>');
            process.exit(1);
        }

        await repairCollectionLanguage(groupedCollection, repairLang);
        await generateManifest();

        console.log('\nGenerating detailed index for library...');
        try {
            execSync('node scripts/generate-nikaya-index.mjs', { stdio: 'inherit', cwd: process.cwd() });
            console.log('Detailed index generated.');
        } catch (e) {
            console.error('Failed to generate detailed index:', e.message);
        }

        console.log('\nRepair complete!');
        return;
    }

    if (target === 'dn' || target === 'all') await fetchDN();
    if (target === 'mn' || target === 'all') await fetchMN();
    if (target === 'sn' || target === 'all') await fetchSN();
    if (target === 'an' || target === 'all') await fetchAN();
    if (target === 'kn' || target === 'all') await fetchKN();

    await generateManifest();

    console.log('\nGenerating detailed index for library...');
    try {
        execSync('node scripts/generate-nikaya-index.mjs', { stdio: 'inherit', cwd: process.cwd() });
        console.log('Detailed index generated.');
    } catch (e) {
        console.error('Failed to generate detailed index:', e.message);
    }

    console.log('\nDownloads complete!');
}

main().catch(console.error);
