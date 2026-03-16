# 2026-03-16 Nikaya master audit

## Goal

Create one report that answers the whole user question in one place:

- is the ordering correct
- which items are missing
- which items are duplicated or over-specified
- which items are wrong by provenance or topology

## Work completed

- Added [scripts/audit-nikaya-master.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-master.mjs).
- Added npm shortcut `npm run audit:nikaya-master` in [package.json](/Volumes/SSD/nhapluu/nhapluu-app/package.json).
- Combined the two lower-level truth sets:
  - [scripts/audit-nikaya-originals.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-originals.mjs)
  - [scripts/audit-nikaya-coverage-matrix.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-coverage-matrix.mjs)
- Updated [AGENTS.md](/Volumes/SSD/nhapluu/nhapluu-app/AGENTS.md) and [SKILL.md](/Volumes/SSD/nhapluu/nhapluu-app/SKILL.md) so future agents know when to use the master audit instead of manually reconciling several scripts.

## Global result

- `Index ids`: `12255`
- `Available ids`: `12255`
- `Content ids`: `10141`
- `Index duplicates`: `0`
- `Missing from index`: `0`
- `Missing from available`: `0`
- `Misplaced files`: `0`
- `Weird files`: `0`
- `Duplicate lang files`: `0`
- `Ordering defects`: `0`
- `Alias range violations`: `0`
- `Range completeness violations`: `0`

## Collection result

### DN

- `34` route ids
- `34` canonical blocks
- `34/34` route English readable
- `34/34` route Việt readable
- `34/34` canonical blocks clean in both languages
- `0` missing English
- `0` missing Vietnamese
- `0` duplicated topology blocks
- `0` missing canonical topology blocks

### MN

- `152` route ids
- `152` canonical blocks
- `152/152` route English readable
- `152/152` route Việt readable
- `152/152` canonical blocks clean in both languages
- `0` missing English
- `0` missing Vietnamese
- `0` duplicated topology blocks
- `0` missing canonical topology blocks

### SN

- `3158` route ids
- `1819` canonical blocks
- `1819/3158` route English readable
- `3144/3158` route Việt readable
- `1805/1819` canonical blocks clean in both languages
- `0` canonical blocks missing English
- `14` canonical blocks missing Vietnamese
- `134` duplicated topology blocks
- `1339` route ids depend on canonical English fallback
- `0` missing canonical topology blocks

Canonical Vietnamese gaps:

- `sn3.15`
- `sn35.57`
- `sn35.59`
- `sn35.82`
- `sn36.25`
- `sn36.30`
- `sn37.17`
- `sn37.18`
- `sn37.19`
- `sn37.20`
- `sn37.21`
- `sn37.22`
- `sn37.23`
- `sn37.24`

### AN

- `8217` route ids
- `1408` canonical blocks
- `1408/8217` route English readable
- `6772/8217` route Việt readable
- `1395/1408` canonical blocks clean in both languages
- `0` canonical blocks missing English
- `13` canonical blocks missing Vietnamese
- `95` duplicated topology blocks
- `6809` route ids depend on canonical English fallback
- `0` missing canonical topology blocks

Canonical Vietnamese gaps:

- `an9.113-432`
- `an11.30-69`
- `an11.70-117`
- `an11.118-165`
- `an11.166-213`
- `an11.214-261`
- `an11.262-309`
- `an11.310-357`
- `an11.358-405`
- `an11.406-453`
- `an11.454-501`
- `an11.502-981`
- `an11.992-1151`

### KN

- `694` route ids
- `297` canonical blocks
- `0/694` route English readable
- `12/694` route Việt readable
- `0/297` canonical blocks clean in both languages
- `12` canonical blocks missing only English
- `285` canonical blocks missing both languages
- `0` duplicated topology blocks
- `26` missing canonical topology blocks
- `423` route ids sit inside those missing canonical blocks
- `423` alias targets missing from the index

Canonical blocks missing only English:

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

## Final interpretation

- `DN` and `MN` are complete and coherent.
- `SN` and `AN` are coherent at the canonical-block level, but over-specified in topology and still missing a small set of canonical Vietnamese blocks.
- `KN` is both textually incomplete and structurally under-indexed.
- No grouped canonical block is currently missing child IDs or carrying extra stray child IDs. The remaining defects are provenance, coverage, navigation gaps, and missing canonical targets in `KN`.

## Verification

- `npm run audit:nikaya-master`
- `node scripts/audit-nikaya-master.mjs --json`
- `npm run lint`
- `npm run build`
