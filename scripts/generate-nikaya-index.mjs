import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data/suttacentral-json');
const OUTPUT_FILE = path.join(DATA_DIR, 'nikaya_index.json');

// Helper to sort sutta IDs (dn1, dn2, dn10...)
const sortSuttaIds = (a, b) => {
    if (!a.id || !b.id) return 0;
    const splitA = a.id.match(/([a-z]+)(\d+)(\.*.*)/);
    const splitB = b.id.match(/([a-z]+)(\d+)(\.*.*)/);

    if (!splitA || !splitB) return a.id.localeCompare(b.id);
    // ... existing logic

    const scriptA = splitA[1];
    const numA = parseFloat(splitA[2] + (splitA[3] || ''));
    const scriptB = splitB[1];
    const numB = parseFloat(splitB[2] + (splitB[3] || ''));

    if (scriptA !== scriptB) return scriptA.localeCompare(scriptB);
    return numA - numB;
};

async function main() {
    console.log('Generating Nikaya Index...');

    if (!fs.existsSync(DATA_DIR)) {
        console.error('Data directory not found:', DATA_DIR);
        return;
    }

    const collections = ['dn', 'mn', 'sn', 'an', 'kn'];
    const index = [];
    const processedIds = new Set();

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
            // Skip if already processed (avoid duplicates)
            if (processedIds.has(id)) continue;
            processedIds.add(id);

            // Read Vietnamese file first, then English
            let metadata = null;
            const langs = ['vi', 'en'];

            for (const lang of langs) {
                if (suttas[id][lang]) {
                    try {
                        const content = JSON.parse(fs.readFileSync(suttas[id][lang], 'utf-8'));

                        // Try to extract metadata
                        // Strategy 1: suttaplex
                        if (content.suttaplex) {
                            const suttaId = content.suttaplex.uid || id;
                            // Also check suttaplex uid for duplicates
                            if (processedIds.has(suttaId) && suttaId !== id) {
                                metadata = null; // Skip this duplicate
                                break;
                            }
                            processedIds.add(suttaId);
                            
                            metadata = {
                                id: suttaId,
                                title: content.suttaplex.translated_title || content.suttaplex.original_title,
                                paliTitle: content.suttaplex.original_title,
                                blurb: content.suttaplex.blurb,
                                difficulty: content.suttaplex.difficulty,
                                collection: collection
                            };
                            break;
                        }

                        // Strategy 2: root_text or translation title
                        if (content.translation && content.translation.title) {
                            metadata = {
                                id: id,
                                title: content.translation.title,
                                paliTitle: null,
                                collection: collection
                            };
                            // Clean HTML from title if present
                            metadata.title = metadata.title.replace(/<[^>]*>/g, '');
                            break;
                        }
                    } catch (e) {
                        console.warn(`Failed to parse ${suttas[id][lang]}`);
                    }
                }
            }

            if (metadata) {
                index.push(metadata);
            } else {
                // Determine implicit title from ID if parse failed but file exists
                index.push({
                    id: id,
                    title: `${id.toUpperCase()}`,
                    collection: collection
                });
            }
        }
    }

    // Sort index
    index.sort(sortSuttaIds);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log(`Index generated with ${index.length} suttas.`);
    console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
