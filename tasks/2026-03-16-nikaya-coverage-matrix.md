# 2026-03-16 Nikaya coverage matrix audit

## Goal

Translate the raw file audit into product-facing truth:

- which canonical blocks are fully readable in both `English - Bhikkhu Sujato` and `Tiếng Việt - Thích Minh Châu`
- which blocks are missing only English
- which blocks are missing only Vietnamese
- which blocks are missing both
- which collections are merely duplicated by topology and which are actually under-indexed

## Work completed

- Added [scripts/audit-nikaya-coverage-matrix.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-coverage-matrix.mjs).
- Added npm shortcut `npm run audit:nikaya-coverage` in [package.json](/Volumes/SSD/nhapluu/nhapluu-app/package.json).
- Reused [scripts/audit-nikaya-originals.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-originals.mjs) as the low-level source of truth, then normalized the result to canonical-block coverage.
- Updated [AGENTS.md](/Volumes/SSD/nhapluu/nhapluu-app/AGENTS.md) and [SKILL.md](/Volumes/SSD/nhapluu/nhapluu-app/SKILL.md) to document when to use the coverage matrix instead of the raw file audit.

## Coverage result

### DN

- `34` canonical blocks
- `34` clean in both languages
- `0` missing English
- `0` missing Vietnamese
- `0` missing both

### MN

- `152` canonical blocks
- `152` clean in both languages
- `0` missing English
- `0` missing Vietnamese
- `0` missing both

### SN

- `1819` canonical blocks total
- `1805` clean in both languages
- `0` canonical blocks missing English
- `14` canonical blocks missing Vietnamese
- `0` canonical blocks missing both
- `134` duplicated topology blocks
- `1339` child route IDs rely on canonical English fallback

Interpretation:

- `SN` is not missing English at the canonical-block level.
- The apparent English deficit is entirely in alias child routes whose own files are unreadable but whose canonical grouped block is readable.

### AN

- `1408` canonical blocks total
- `1395` clean in both languages
- `0` canonical blocks missing English
- `13` canonical blocks missing Vietnamese
- `0` canonical blocks missing both
- `95` duplicated topology blocks
- `6809` child route IDs rely on canonical English fallback

Interpretation:

- `AN` is also not missing English at the canonical-block level.
- The huge English deficit comes from child aliases, not from unreadable canonical blocks.

### KN

- `297` canonical blocks total after collapsing aliases
- `0` clean in both languages
- `12` canonical blocks missing only English
- `0` canonical blocks missing only Vietnamese
- `285` canonical blocks missing both
- `26` topology-missing canonical blocks
- `423` child route IDs sit inside those missing canonical blocks

Interpretation:

- `KN` has no clean canonical block at all.
- Its problem is not duplication. It is true content absence plus missing canonical inventory.

The `12` `missing-en-only` canonical blocks are:

- `kp1`
- `kp2`
- `kp3`
- `kp4`
- `kp5`
- `kp6`
- `kp7`
- `kp8`
- `kp9`
- `snp1.8`
- `snp2.4`
- `snp3.7`

## Practical conclusion

- If the user asks, “which collection is actually complete for English and Minh Châu?”, the answer is:
  - `DN`: complete
  - `MN`: complete
  - `SN`: almost complete, missing `14` Vietnamese canonical blocks only
  - `AN`: almost complete at canonical English level, but missing `13` Vietnamese canonical blocks
  - `KN`: fundamentally incomplete

- If the user asks, “are SN and AN English files broken?”, the precise answer is:
  - the child alias files are broken as standalone files
  - the canonical grouped blocks are still readable
  - so the reading experience can succeed if the UI falls back to canonical blocks

- If the user asks, “which branch is truly missing canonical content?”, the answer is:
  - `KN`

## Verification

- `npm run audit:nikaya-coverage`
- `node scripts/audit-nikaya-coverage-matrix.mjs --json`
