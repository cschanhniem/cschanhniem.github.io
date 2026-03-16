# 2026-03-16 Manual 2026 DN Batch 3 Complete

## Scope

Complete the remaining `Trường Bộ` manual 2026 layer so that all `34/34` DN discourses have:

- English original
- Vietnamese HT. Thích Minh Châu
- Vietnamese `Nhập Lưu 2026`

## Added Files

- `src/data/nikaya-improved/vi/dn-3.ts`
- `src/data/nikaya-improved/vi/dn-4.ts`
- `src/data/nikaya-improved/vi/dn-5.ts`
- `src/data/nikaya-improved/vi/dn-8.ts`
- `src/data/nikaya-improved/vi/dn-9.ts`
- `src/data/nikaya-improved/vi/dn-11.ts`
- `src/data/nikaya-improved/vi/dn-12.ts`
- `src/data/nikaya-improved/vi/dn-13.ts`
- `src/data/nikaya-improved/vi/dn-14.ts`
- `src/data/nikaya-improved/vi/dn-15.ts`
- `src/data/nikaya-improved/vi/dn-16.ts`
- `src/data/nikaya-improved/vi/dn-17.ts`
- `src/data/nikaya-improved/vi/dn-18.ts`
- `src/data/nikaya-improved/vi/dn-19.ts`
- `src/data/nikaya-improved/vi/dn-21.ts`
- `src/data/nikaya-improved/vi/dn-23.ts`
- `src/data/nikaya-improved/vi/dn-24.ts`
- `src/data/nikaya-improved/vi/dn-25.ts`
- `src/data/nikaya-improved/vi/dn-26.ts`
- `src/data/nikaya-improved/vi/dn-27.ts`
- `src/data/nikaya-improved/vi/dn-28.ts`
- `src/data/nikaya-improved/vi/dn-29.ts`
- `src/data/nikaya-improved/vi/dn-30.ts`
- `src/data/nikaya-improved/vi/dn-32.ts`
- `src/data/nikaya-improved/vi/dn-33.ts`
- `src/data/nikaya-improved/vi/dn-34.ts`

## Registry Updates

- Updated `src/data/nikaya-improved/vi/index.ts`
- Updated `src/data/nikaya-improved/availability.ts`

## Editorial Notes

- Kept each discourse on its own doctrinal spine instead of flattening the whole collection into one generic explanatory voice.
- For long narrative DN suttas, favored narrative compression that preserves the argumentative core.
- For doctrinal DN suttas, preserved the main structural move of the discourse so the manual layer remains recognizably faithful to the source.
- This pass completes `DN` coverage. Further `DN` work should be revision and refinement, not coverage expansion.

## Verification

- `node scripts/audit-nikaya-triad.mjs dn`
- `npm run lint`
- `npm run build`
