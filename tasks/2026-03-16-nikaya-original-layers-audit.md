# 2026-03-16 Nikaya original layers audit

## Goal

Rà soát thật kỹ lớp bản gốc `English - Bhikkhu Sujato` và `Tiếng Việt - Thích Minh Châu` để trả lời bốn câu hỏi:

- thứ tự route có đúng không
- có bài nào thiếu file hay không
- có bài nào thừa hoặc nằm sai chỗ hay không
- có bài nào nhìn như Minh Châu nhưng thực ra không phải hoặc không đọc được hay không

## Work completed

- Added [scripts/audit-nikaya-originals.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-originals.mjs) as the canonical audit for original-layer provenance.
- Added npm shortcut `npm run audit:nikaya-originals` in [package.json](/Volumes/SSD/nhapluu/nhapluu-app/package.json).
- Re-ran `npm run audit:nikaya-integrity` to confirm the structural baseline still holds.
- Extended [scripts/audit-nikaya-originals.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-originals.mjs) so it now audits:
  - route title parity against local metadata
  - Pali title parity against `suttaplex.original_title`
  - alias groups and whether alias targets actually exist in the index
  - canonical-route `previous` and `next` metadata continuity
  - topology parity between grouped canonical routes and their child alias routes
  - alias-to-range validity so child routes cannot silently point outside their canonical block
  - grouped-range completeness so canonical blocks cannot silently drop child IDs or absorb extra ones
- Added [tasks/2026-03-16-nikaya-original-layers-audit-appendix.md](/Volumes/SSD/nhapluu/nhapluu-app/tasks/2026-03-16-nikaya-original-layers-audit-appendix.md) with the compressed full-ID anomaly map for `SN`, `AN`, and `KN`.
- Updated [AGENTS.md](/Volumes/SSD/nhapluu/nhapluu-app/AGENTS.md) and [SKILL.md](/Volumes/SSD/nhapluu/nhapluu-app/SKILL.md) so future agents distinguish:
  - file presence
  - readable content
  - alias UID drift
  - real Minh Châu provenance

## Structural result

- `Index duplicates`: `0`
- `Missing from index`: `0`
- `Missing from available`: `0`
- `Misplaced files`: `0`
- `Weird file names`: `0`
- `Duplicate lang files`: `0`
- `Ordering defects`: `0`

This means the library inventory is structurally clean. The remaining problems are source-shape and readability problems, not route-order or file-placement defects.

## Metadata parity result

- `Route title mismatches`: `0`
- `Pali title mismatches`: `0`

So the index titles now line up with the local metadata that exists. The remaining defects are not title defects.

## Topology result

- `SN` has `134` grouped canonical range routes in the index, and all `134` are also referenced by child alias routes. This is semantic duplication, not a broken index.
- `AN` has `95` grouped canonical range routes in the index, and all `95` are also referenced by child alias routes. Again, this is semantic duplication, not a missing-file problem.
- `KN` has `0` grouped range routes in the index, yet `423` child routes point to `26` grouped Dhammapada canonicals. This is a real topology defect, not just alias noise.
- `Alias range violations`: `0` in `SN`, `AN`, and `KN`.
- `Range completeness violations`: `0` in `DN`, `MN`, `SN`, `AN`, and `KN`.

In plain terms:

- `SN` and `AN` are **not missing** their grouped canonicals. They are **over-specified** because both the grouped route and the child routes coexist.
- The grouped canonicals that do exist are internally complete. No canonical range is currently missing a child ID, and none has picked up an unexpected extra child.
- `KN` is **under-specified** because the child routes exist but the grouped canonicals do not.

## Collection findings

### DN

- `EN readable`: `34/34`
- `VI readable`: `34/34`
- `VI readable as Minh Chau`: `34/34`
- `EN alias ids`: `0`
- `VI alias ids`: `0`
- `Canonical nav defects`: `0`

### MN

- `EN readable`: `152/152`
- `VI readable`: `152/152`
- `VI readable as Minh Chau`: `152/152`
- `EN alias ids`: `0`
- `VI alias ids`: `0`
- `Canonical nav defects`: `0`

### SN

- `EN file present`: `3158/3158`
- `EN readable`: `1819/3158`
- `EN unreadable alias or placeholder ids`: `1339`
- `VI file present`: `3158/3158`
- `VI readable`: `3144/3158`
- `VI readable as Minh Chau`: `3144/3158`
- `VI unreadable ids with no Minh Chau metadata`: `14`
- `Alias groups`: `134`
- `Alias target missing from index`: `0`
- `Canonical nav missing previous`: `14`
- `Canonical nav missing next`: `14`
- `Grouped canonicals in index`: `134`
- `Child alias routes covered by indexed canonicals`: `1339`

Unreadable Vietnamese IDs:

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

- `EN file present`: `8217/8217`
- `EN readable`: `1408/8217`
- `EN unreadable alias or placeholder ids`: `6809`
- `VI file present`: `8217/8217`
- `VI readable`: `6772/8217`
- `VI readable as Minh Chau`: `6772/8217`
- `VI unreadable ids with no Minh Chau metadata`: `1445`
- `Alias groups`: `95`
- `Alias target missing from index`: `0`
- `Canonical nav missing previous`: `13`
- `Canonical nav missing next`: `13`
- `Grouped canonicals in index`: `95`
- `Child alias routes covered by indexed canonicals`: `6809`

The AN failures cluster around grouped source blocks. Example:

- `an1.1` points internally to `an1.1-10`
- `an1.100` points internally to `an1.98-139`
- `an9.113` points internally to `an9.113-432`

### KN

- `EN file present`: `694/694`
- `EN readable`: `0/694`
- `VI file present`: `694/694`
- `VI readable`: `12/694`
- `VI readable as Minh Chau`: `12/694`
- `VI unreadable ids`: `682`
- `Alias groups`: `26`
- `Alias target missing from index`: `423` routes pointing at `26` missing canonical Dhammapada ranges
- `Canonical nav missing previous`: `260`
- `Canonical nav missing next`: `260`
- `Grouped canonicals in index`: `0`
- `Child alias routes missing canonical in index`: `423`

Most important KN finding:

- `423` files named `*_vi_minh_chau.json` do **not** resolve to Minh Châu in source metadata.
- They point to `phantuananh` via `suttaplex.translations`, or contain no Vietnamese source metadata at all.
- Therefore these files must not be treated as real Minh Châu coverage just because of the filename suffix.
- The missing alias targets are the Dhammapada grouped canonicals:
  - `dhp1-20`, `dhp21-32`, `dhp33-43`, `dhp44-59`, `dhp60-75`, `dhp76-89`
  - `dhp90-99`, `dhp100-115`, `dhp116-128`, `dhp129-145`, `dhp146-156`, `dhp157-166`
  - `dhp167-178`, `dhp179-196`, `dhp197-208`, `dhp209-220`, `dhp221-234`, `dhp235-255`
  - `dhp256-272`, `dhp273-289`, `dhp290-305`, `dhp306-319`, `dhp320-333`, `dhp334-359`, `dhp360-382`, `dhp383-423`

## Interpretation

- `DN` and `MN` are structurally and textually solid for both original layers.
- `SN` has correct order and no missing files, but `1339` English routes are only alias placeholders and `14` Vietnamese routes are still unreadable.
- `AN` has correct order and no missing files, but most English single routes are alias placeholders and `1445` Vietnamese routes are unreadable.
- `KN` is the weakest branch. It currently has no readable Sujato English in local form, only `12` readable Minh Châu routes, and its Dhammapada single routes point to grouped canonical IDs that are not indexed at all.
- `SN` and `AN` have semantic duplication at the route-inventory layer: grouped canonicals and child aliases coexist in full. That is not data loss, but it does mean totals can look larger than the set of distinct source blocks.
- Across all collections, there are no title-order defects left, no alias-to-range mapping defects, and no grouped-range completeness defects. The unresolved defects are now cleanly isolated to source readability, alias topology, provenance, and broken or absent canonical navigation metadata.

## Verification

- `npm run audit:nikaya-originals`
- `npm run audit:nikaya-integrity`
- `npm run lint`
- `npm run build`
