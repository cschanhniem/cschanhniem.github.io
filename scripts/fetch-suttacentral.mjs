#!/usr/bin/env node
/**
 * SuttaCentral Data Fetcher
 * 
 * Fetches sutta data from SuttaCentral API and saves as JSON files locally.
 * This script should be run from the project root using Node.js.
 * 
 * Usage: node scripts/fetch-suttacentral.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://suttacentral.net/api/suttas';
const DATA_DIR = path.join(__dirname, '../src/data/suttacentral-json');

// Suttas to fetch with their translators
const SUTTAS_TO_FETCH = [
    // Priority suttas for Phase 1
    { id: 'mn10', collection: 'mn' },
    { id: 'mn118', collection: 'mn' },
    { id: 'dn22', collection: 'dn' },
    { id: 'sn56.11', collection: 'sn' },
    // Additional suttas can be added here
];

// Translators to fetch for each language
const TRANSLATORS = {
    vi: 'minh_chau',
    en: 'sujato',
};

async function fetchSuttaData(suttaId, authorUid, lang) {
    const url = `${BASE_URL}/${suttaId}/${authorUid}?lang=${lang}`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch ${suttaId}/${authorUid}: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${suttaId}/${authorUid}:`, error.message);
        return null;
    }
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function saveJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved: ${filePath}`);
}

async function fetchAllSuttas() {
    console.log('Starting SuttaCentral data fetch...\n');

    for (const sutta of SUTTAS_TO_FETCH) {
        const collectionDir = path.join(DATA_DIR, sutta.collection);
        ensureDir(collectionDir);

        for (const [lang, authorUid] of Object.entries(TRANSLATORS)) {
            const data = await fetchSuttaData(sutta.id, authorUid, lang);

            if (data) {
                // Save the full API response
                const fileName = `${sutta.id}_${lang}_${authorUid}.json`;
                const filePath = path.join(collectionDir, fileName);
                saveJsonFile(filePath, data);
            }

            // Small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log('\nFetch complete!');
}

// Run the script
fetchAllSuttas().catch(console.error);
