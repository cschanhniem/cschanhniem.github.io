# 2026-03-15 SN Content Triad Audit

## Goal

Push `/nikaya/sn` toward the same triad contract used for the other Nikaya branches:
- original English content
- faithful Vietnamese by HT. Thích Minh Châu
- readable Vietnamese manual 2026

## Problem

`SN` had two structural defects at once:
- English original coverage was effectively absent for many routes because the fetcher only walked single numeric IDs and skipped grouped range IDs such as `sn12.72-81`.
- The audit script undercounted the manual layer because improved files are normalized as `sn5611`, while detail IDs remain formatted as `sn56.11`.

There was also a source-level wrinkle: Bilara sometimes returned HTTP `200` with `{"msg":"Not Found"}` for missing English pages, so status code alone could not be trusted.

## Work Completed

1. Ran a full `SN` backfill with `node scripts/fetch-all-nikayas.mjs sn` to regenerate local English and Vietnamese manifests.
2. Patched `scripts/fetch-all-nikayas.mjs` so collection fetches can supplement single-ID scans with grouped range IDs from `nikaya_index.json`.
3. Re-ran the `SN` fetch so all `134` grouped `SN` range IDs were fetched locally for both English and Vietnamese where available.
4. Patched `scripts/audit-nikaya-triad.mjs` to normalize `suttaId` values before checking improved manual availability.
5. Confirmed sample grouped English payloads such as `sn12.72-81` now exist as proper Bilara template files with `translation_text`.

## Audit Result

- SN total: `3146`
- English original content: `1819/3146`
- Vietnamese Minh Châu content: `3132/3146`
- Vietnamese manual 2026: `1/3146`
- Full triad ready: `1/3146`

The single `SN` route currently completing the triad is `sn56.11`.

## Key Finding

All `134/134` grouped `SN` range IDs now have local English and Vietnamese content.

The main remaining English gap is not just a local fetch problem. After the grouped backfill, there are still `1327` single `SN` routes that have Vietnamese Minh Châu content but no local English original. For representative examples such as `sn12.101`, Bilara returns HTTP `200` with `{"msg":"Not Found"}`. In practice, SuttaCentral publishes many of these sections only as grouped range pages, not as standalone English pages.

## Verification

- `npm run audit:nikaya -- sn`
- Inspect sample local files:
  - `public/data/suttacentral-json/sn/sn1.1_en_sujato.json`
  - `public/data/suttacentral-json/sn/sn12.72-81_en_sujato.json`
  - `public/data/suttacentral-json/sn/sn56.11_en_sujato.json`

## Follow-up

- Keep the UI honest: grouped `SN` routes can claim local English; many single peyyala routes still cannot.
- If product wants every single `SN` detail page to show English, add an editorial fallback strategy that maps single routes onto grouped range sources instead of pretending the English original exists per single UID.
- Continue authoring the 2026 manual layer beyond `sn56.11`.
