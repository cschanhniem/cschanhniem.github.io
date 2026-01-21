#!/usr/bin/env node
/**
 * Bulk SuttaCentral Data Fetcher
 * 
 * Downloads ALL suttas for the 4 main Nikayas (DN, MN, SN, AN).
 * Uses robust iteration with "consecutive error" breaking for SN/AN.
 * Skips existing files to allow resuming.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function fetchSuttaData(suttaId, authorUid, lang) {
    const url = `${BASE_URL}/${suttaId}/${authorUid}?lang=${lang}`;
    // console.log(`Fetching: ${url}`); 

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return { status: 404 };
            console.error(`Failed to fetch ${suttaId}/${authorUid}: ${response.status}`);
            return { status: response.status };
        }
        return { status: 200, data: await response.json() };
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

async function processSutta(id, collection) {
    const collectionDir = path.join(DATA_DIR, collection);
    ensureDir(collectionDir);
    let foundAny = false;

    // Check if we already have files (skip if both languages exist)
    const viFile = path.join(collectionDir, `${id}_vi_${TRANSLATORS.vi}.json`);
    const enFile = path.join(collectionDir, `${id}_en_${TRANSLATORS.en}.json`);

    if (fs.existsSync(viFile) && fs.existsSync(enFile)) {
        // console.log(`Skipping ${id} (already exists)`);
        return true; // Treat as found so we don't break loops
    }

    process.stdout.write(`Fetching ${id}... `);

    // Fetch Vietnamese
    if (!fs.existsSync(viFile)) {
        const viRes = await fetchSuttaData(id, TRANSLATORS.vi, 'vi');
        if (viRes.status === 200 && viRes.data) {
            saveJsonFile(viFile, viRes.data);
            foundAny = true;
        }
    } else {
        foundAny = true; // Exists
    }

    // Fetch English
    if (!fs.existsSync(enFile)) {
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
}

async function generateManifest() {
    console.log('\nGenerating manifest...');
    const manifest = {};

    const collections = ['dn', 'mn', 'sn', 'an'];
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
            }
        });
    }

    const manifestPath = path.join(DATA_DIR, 'available.json');
    saveJsonFile(manifestPath, manifest);
    console.log(`Manifest saved to ${manifestPath}`);
}

async function main() {
    const args = process.argv.slice(2);
    const target = args[0] || 'all';

    if (target === 'scan') {
        await generateManifest();
        return;
    }

    if (target === 'dn' || target === 'all') await fetchDN();
    if (target === 'mn' || target === 'all') await fetchMN();
    if (target === 'sn' || target === 'all') await fetchSN();
    if (target === 'an' || target === 'all') await fetchAN();

    await generateManifest();
    console.log('\nAll downloads complete!');
}

main().catch(console.error);
