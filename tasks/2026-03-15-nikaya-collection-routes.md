# Nikaya Collection Routes

## Goal

Move `Nikaya` collection filtering from local UI state to stable URLs.

- Collection branches:
  - `/nikaya`
  - `/nikaya/dn`
  - `/nikaya/mn`
  - `/nikaya/sn`
  - `/nikaya/an`
  - `/nikaya/kn`
- Canonical detail route:
  - `/nikaya/<collection>/<suttaId>`
- Legacy compatibility:
  - keep `/nikaya/<suttaId>` alive through redirect and static fallback HTML

## Implementation Notes

- Added `src/lib/nikaya-routes.ts` to centralize path building, collection inference, and back-path resolution.
- Updated `src/App.tsx` to register collection branches, nested detail routes, and a legacy redirect route.
- Updated `src/pages/NikayaLibrary.tsx` to derive the active collection from `location.pathname`, render collection filters as links, and link sutta cards to canonical nested URLs.
- Updated `src/pages/NikayaDetail.tsx` to normalize route params, redirect mismatched URLs to canonical paths, and return to the proper collection branch.
- Updated `scripts/build-seo-assets.mjs` so collection pages and nested detail pages receive static HTML. Old detail URLs are emitted as `noindex` fallback files.

## Verification

- Run `npm run build`
- Run `npm run lint`
- Spot check:
  - `/nikaya/dn`
  - `/nikaya/dn/dn1`
  - `/nikaya/dn1` redirects to `/nikaya/dn/dn1`
