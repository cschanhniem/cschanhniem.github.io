# KN Content Triad Audit

Date: 2026-03-15

## Scope

- Audit `/nikaya/kn` against the three-layer requirement:
- English original content
- Vietnamese HT. Thich Minh Chau
- Vietnamese manual 2026

## Work Completed

- Audited coverage with `npm run audit:nikaya -- kn`.
- Regenerated local manifests with `node scripts/fetch-all-nikayas.mjs scan`.
- Patched KN route inference and local collection lookup so KN book IDs resolve to the `kn` directory.

## Findings

- `KN total`: `694`
- `EN original content`: `0/694`
- `VI Minh Chau content`: `12/694`
- `VI manual 2026`: `0/694`
- `Complete triad`: `0/694`

## Root Cause

- Existing local `KN` JSON files are present on disk, but sampled files such as `kp1`, `dhp1`, and `ud1.1` are metadata-only.
- They do not contain `translation.text`, `root_text.text`, `html_text`, or segment maps with readable body content.
- The previous manifest scan skipped the `kn` directory entirely, which meant even file presence was invisible until the scan logic was fixed.
- Client-side collection inference also missed KN book prefixes such as `kp`, `dhp`, `ud`, `iti`, and `snp`.

## Release Impact

- KN routing is now structurally correct at the code level.
- `available.json` now reflects KN file presence, while `content-availability.json` still shows only sparse Vietnamese-readable coverage.
- KN still does not meet the triad requirement because the local source files do not carry readable sutta body content, and there are no manual 2026 KN files.
