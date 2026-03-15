# 2026-03-15 MN Content Triad Audit

## Goal

Bring `/nikaya/mn` under the same triad contract as `/nikaya/dn`:
- original English content
- faithful Vietnamese by HT. Thích Minh Châu
- readable 2026 manual Vietnamese

## Problem

The `MN` English files existed, but they were still metadata-only payloads from the older fetch path. As a result:
- `content-availability.json` reported `0/152` English entries for `MN`
- the UI could not truthfully claim that `MN` had original English content

## Work Completed

1. Ran `node scripts/fetch-all-nikayas.mjs mn` to refetch all `MN` English sources from the Bilara endpoint.
2. Regenerated `available.json`, `content-availability.json`, and `nikaya_index.json`.
3. Generalized collection coverage in `NikayaLibrary` so `/nikaya/mn` gets the same triad summary card as `/nikaya/dn`.
4. Generalized detail-page triad messaging so every Nikaya collection can report what is present and what is still missing.
5. Replaced the one-off DN audit script with `scripts/audit-nikaya-triad.mjs` and `npm run audit:nikaya -- <collection>`.

## Audit Result

- MN total: 152
- English original content: 152/152
- Vietnamese Minh Châu content: 152/152
- Vietnamese manual 2026: 2/152
- Full triad ready: 2/152

The two `MN` suttas currently completing the triad are `mn10` and `mn118`.

## Verification

- `npm run audit:nikaya -- mn`
- browser QA should focus on `/nikaya/mn` and one detail page such as `/nikaya/mn/mn1`

## Follow-up

- Continue authoring the 2026 manual layer for the remaining `150` `MN` suttas.
- Keep collection pages honest by relying on `content-availability.json`, not file presence alone.
