# 2026-03-16 Nikaya version selector curation

## Goal

Reduce the Nikaya translation selector to the three canonical reading choices only:

- `Tiếng Việt - Thích Minh Châu`
- `Tiếng Anh - Bhikkhu Sujato`
- `Tiếng Việt - Nhập Lưu 2026`

## Changes

- Added `src/lib/nikaya-version-options.ts` as the single source of truth for curated Nikaya version labels and ordering.
- Updated `src/pages/NikayaDetail.tsx` so `availableVersions` is built only from the curated 3-option set instead of iterating `vi/en/zh/es`.
- Simplified `src/components/NikayaVersionSwitcher.tsx` from language-grouped rendering into one flat curated list.
- Updated `src/components/NikayaComparisonView.tsx` to use the same curated version labels, keeping headers consistent with the selector.
- Updated `src/pages/NikayaLibrary.tsx` copy so the library description no longer promises Chinese or Spanish comparison options.
- Documented the product rule in `AGENTS.md` and `SKILL.md` so future agents do not reintroduce extra language options into the detail UI.

## Verification

- `npm run build`
- `npm run lint`
- Inspected the emitted Nikaya detail bundle and confirmed the selector now ships only the curated array:
  - `Tiếng Việt - Thích Minh Châu`
  - `Tiếng Anh - Bhikkhu Sujato`
  - `Tiếng Việt - Nhập Lưu 2026`

## Notes

- Browser MCP verification was blocked by an existing persistent Chrome session in the environment, so UI confirmation was done through the compiled Nikaya detail bundle after a successful production build.
