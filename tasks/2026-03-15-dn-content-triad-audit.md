# 2026-03-15 DN Content Triad Audit

## Goal

Repair the DN English original layer so each Trường Bộ route can distinguish between:
- original English content
- HT. Thích Minh Châu Vietnamese content
- the 2026 manual layer

The immediate defect was that English looked present in the UI but still rendered Bilara template placeholders such as `{}` instead of readable prose.

## Work Completed

1. Updated `scripts/fetch-all-nikayas.mjs` to backfill English from the Bilara endpoint and to treat metadata-only files as incomplete.
2. Regenerated `public/data/suttacentral-json/dn/dn*_en_sujato.json` with real DN English source payloads.
3. Added `public/data/suttacentral-json/content-availability.json` so UI logic can test readable content instead of mere file presence.
4. Added the DN audit shortcut and kept the generic `npm run audit:nikaya -- dn` workflow.
5. Patched `src/lib/suttacentralLocal.ts` to compose Bilara `html_text` templates with `translation_text` before rendering.
6. Tightened `src/pages/NikayaDetail.tsx` so version options are selectable only when local readable content exists.
7. Added DN triad status surfaces in the Nikaya library and detail pages.
8. Fixed i18n interpolation for the DN coverage messages.

## Audit Result

- DN total: 34
- English original content: 34/34
- Vietnamese Minh Châu content: 34/34
- Vietnamese manual 2026: 4/34
- Full triad ready: 4/34

At this point, the structural integrity is correct, but the editorial program is not complete. The DN manual layer now covers `dn7`, `dn10`, `dn22`, and `dn31`.

## Verification

- `npm run build`
- `npm run lint`
- Browser QA on `http://127.0.0.1:4174/nikaya/dn/dn1`

Confirmed:
- English renders as readable prose, not `{}` placeholders.
- The English source is loaded from its own sutta JSON file.
- Detail dropdown now reflects actual local content truth.

## Follow-up

- Continue authoring manual 2026 DN translations until the triad is complete beyond `dn7`, `dn10`, `dn22`, and `dn31`.
- Keep using `content-availability.json` for user-facing readiness logic.
