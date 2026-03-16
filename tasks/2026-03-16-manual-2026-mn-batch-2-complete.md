# 2026-03-16 Manual 2026 MN Batch 2 Complete

## Scope

Complete the remaining `Trung Bộ` manual 2026 layer so that all `152/152` MN discourses now have:

- English original
- Vietnamese HT. Thích Minh Châu
- Vietnamese `Nhập Lưu 2026`

## What Changed

- Added the remaining `145` missing MN manual modules under `src/data/nikaya-improved/vi/`.
- Preserved the earlier hand-edited set:
  - `mn-1.ts`
  - `mn-2.ts`
  - `mn-3.ts`
  - `mn-4.ts`
  - `mn-5.ts`
  - `mn-10.ts`
  - `mn-118.ts`
- Added the scaffolding utility:
  - `scripts/generate-manual-2026.mjs`
- Simplified the manual layer registry:
  - `src/data/nikaya-improved/vi/index.ts` now auto-discovers translation modules with `import.meta.glob`
  - `src/data/nikaya-improved/availability.ts` now derives coverage from `viImproved`
- Added npm entry point:
  - `npm run generate:manual -- <collection>`

## Editorial Notes

- The existing hand-authored anchor suttas remain the style bar for future revision passes.
- The completion pass favors doctrinal clarity, readable modern Vietnamese, and a stable editorial frame across the whole collection.
- This tranche solves coverage and maintenance first. Future `MN` work should revise the most important or most nuanced discourses in place, not reopen registry plumbing.

## Verification

- `node scripts/audit-nikaya-triad.mjs mn`
- `npm run lint`
- `npm run build`

## Result

- `MN manual 2026`: `152/152`
- `MN complete triad`: `152/152`
