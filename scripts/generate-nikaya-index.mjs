import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data/suttacentral-json');
const OUTPUT_FILE = path.join(DATA_DIR, 'nikaya_index.json');

function tokenizeSuttaId(id) {
    return String(id)
        .toLowerCase()
        .match(/[a-z]+|\d+|[^a-z\d]+/g) || [String(id).toLowerCase()]
}

function cleanInlineText(value) {
    if (typeof value !== 'string') return null

    const normalized = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    if (!normalized) return null
    if (/^(~|null|undefined)$/i.test(normalized)) return null
    if (/^[{}[\]()]+$/.test(normalized)) return null

    return normalized
}

function pickNonEmpty(...values) {
    for (const value of values) {
        const cleaned = cleanInlineText(value)
        if (cleaned) {
            return cleaned
        }
    }

    return null
}

function extractBilaraTitleFields(content) {
    const orderedKeys = Array.isArray(content.keys_order) ? content.keys_order : []
    const htmlKeys = Object.keys(content.html_text || {})
    const candidateKeys = [...new Set([...orderedKeys, ...htmlKeys])]

    for (const key of candidateKeys) {
        const html = content.html_text?.[key]

        if (typeof html !== 'string' || !html.includes('sutta-title')) {
            continue
        }

        return {
            translatedTitle: pickNonEmpty(
                content.translation_text?.[key],
                content.bilara_translated_text?.[key],
            ),
            paliTitle: pickNonEmpty(content.root_text?.[key]),
        }
    }

    return {
        translatedTitle: null,
        paliTitle: null,
    }
}

function extractMetadataCandidate(id, collection, content) {
    const bilaraTitle = extractBilaraTitleFields(content)

    return {
        id,
        collection,
        title: pickNonEmpty(
            content.suttaplex?.translated_title,
            content.translation?.title,
            bilaraTitle.translatedTitle,
            content.suttaplex?.original_title,
            bilaraTitle.paliTitle,
        ),
        paliTitle: pickNonEmpty(
            content.suttaplex?.original_title,
            bilaraTitle.paliTitle,
        ),
        blurb: pickNonEmpty(content.suttaplex?.blurb),
        difficulty: content.suttaplex?.difficulty ?? null,
    }
}

function mergeMetadata(base, candidate) {
    if (!candidate) return base

    return {
        ...base,
        title: base.title || candidate.title,
        paliTitle: base.paliTitle || candidate.paliTitle,
        blurb: base.blurb || candidate.blurb,
        difficulty: base.difficulty ?? candidate.difficulty ?? null,
    }
}

// Sort IDs naturally, while keeping grouped ranges ahead of the first item they cover.
const sortSuttaIds = (a, b) => {
    if (!a.id || !b.id) return 0

    const tokensA = tokenizeSuttaId(a.id)
    const tokensB = tokenizeSuttaId(b.id)
    const maxLength = Math.max(tokensA.length, tokensB.length)

    for (let index = 0; index < maxLength; index++) {
        const tokenA = tokensA[index]
        const tokenB = tokensB[index]

        if (tokenA === undefined || tokenB === undefined) {
            if (tokenA === tokenB) return 0
            const remainingToken = tokenA === undefined ? tokenB : tokenA

            if (remainingToken === '-') {
                return tokenA === undefined ? 1 : -1
            }

            return tokenA === undefined ? -1 : 1
        }

        if (tokenA === tokenB) {
            continue
        }

        const tokenANumber = /^\d+$/.test(tokenA) ? Number(tokenA) : null
        const tokenBNumber = /^\d+$/.test(tokenB) ? Number(tokenB) : null

        if (tokenANumber !== null && tokenBNumber !== null) {
            return tokenANumber - tokenBNumber
        }

        return tokenA.localeCompare(tokenB)
    }

    return 0
}

async function main() {
    console.log('Generating Nikaya Index...');

    if (!fs.existsSync(DATA_DIR)) {
        console.error('Data directory not found:', DATA_DIR);
        return;
    }

    const collections = ['dn', 'mn', 'sn', 'an', 'kn'];
    const index = [];

    for (const collection of collections) {
        const dir = path.join(DATA_DIR, collection);
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir);

        // We prefer 'vi' files for metadata, fallback to 'en'
        // Group files by ID
        const suttas = {}; // { id: { vi: path, en: path } }

        files.forEach(file => {
            if (!file.endsWith('.json')) return;
            const parts = file.split('_');
            if (parts.length < 2) return;

            const id = parts[0];
            const lang = parts[1];

            if (!suttas[id]) suttas[id] = {};
            suttas[id][lang] = path.join(dir, file);
        });

        for (const id in suttas) {
            // Read Vietnamese first for local-facing labels, then fill any blanks from English.
            let metadata = {
                id,
                title: null,
                paliTitle: null,
                blurb: null,
                difficulty: null,
                collection,
            }
            const langs = ['vi', 'en']

            for (const lang of langs) {
                if (suttas[id][lang]) {
                    try {
                        const content = JSON.parse(fs.readFileSync(suttas[id][lang], 'utf-8'))
                        metadata = mergeMetadata(
                            metadata,
                            extractMetadataCandidate(id, collection, content),
                        )
                    } catch (e) {
                        console.warn(`Failed to parse ${suttas[id][lang]}`)
                    }
                }
            }

            if (metadata.title) {
                index.push(metadata)
            } else {
                index.push({
                    id,
                    title: `${id.toUpperCase()}`,
                    collection,
                })
            }
        }
    }

    index.sort(sortSuttaIds)

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2))
    console.log(`Index generated with ${index.length} suttas.`)
    console.log(`Saved to ${OUTPUT_FILE}`)
}

main().catch(console.error);
