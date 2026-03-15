# AGENTS.md

> Guidance for AI agents working on the NhapLuu codebase.

## Project Snapshot
- **App**: NhapLuu (Stream Entry practice companion)
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind v4 + shadcn/ui
- **i18n**: `react-i18next` with `src/locales/vi` + `src/locales/en`
- **Backend**: Cloudflare Workers + D1 in `backend/`
- **Routing**: `react-router-dom` in `src/App.tsx`

## Quick Commands
- `npm run dev` — start frontend
- `npm run build` — typecheck + build
- `npm run lint` — lint
- `npm run preview` — preview build

Backend (optional):
- `cd backend && npm run dev` — local Workers
- `cd backend && npm run deploy` — deploy Workers

## Deployment Reality
- Frontend is published by GitHub Pages from this repo's `main` branch via `.github/workflows/deploy.yml`.
- The current git remote points at `git@github.com:cschanhniem/cschanhniem.github.io.git`, so `main` publishes the root Pages site, not a project subpath build.
- Vite `base` is `/`, which matches the current Pages setup.
- Static teaching additions like long-form books do not require a backend deploy unless API behavior changed.

## SEO + Crawlability
- This app is still a client-rendered SPA at runtime, but the build now emits route-level static HTML into `dist/` via `scripts/build-seo-assets.mjs`.
- Treat `src/lib/seo.ts` as the runtime layer and `scripts/build-seo-assets.mjs` as the crawler-facing layer. When route metadata changes, both surfaces must stay coherent.
- `VITE_SITE_URL` must resolve to `https://cschanhniem.github.io` in production. Do not reintroduce the old `/nhapluu` subpath assumptions into canonicals, sitemaps, or robots.
- Public indexable routes must have a generated `dist/<route>/index.html`, canonical URL, sitemap entry, and JSON-LD graph.
- `dist/sitemap.xml` is a sitemap index. Child files are split by route family so coverage remains broad without one oversized flat file.
- Internal or account-scoped routes must stay out of the sitemap and carry `noindex,nofollow`.
- The default social preview asset is `public/og-default.png` at 1200x630. If you replace it, keep the dimensions crawler-safe and update the SEO constants, not scattered tags.
- On GitHub Pages, direct deep links are fragile without static files. If you add a new public route family, wire it into the route generator or search engines will mainly see the 404 redirect shell.

## Performance Hotspots
- Keep the home route lean. Avoid heavyweight charting libraries for small dashboard visuals when plain DOM or SVG is enough.
- Below-the-fold widgets on `/` should not trigger their lazy imports until the section is near view.
- The Nikaya library works over a 12k-item index. Precompute searchable fields once, use deferred search input, and never call expensive lookup helpers repeatedly inside render loops.
- For very large teachings, prefer chapter-level loaders over eager raw markdown imports. One giant `import.meta.glob(..., { eager: true })` can turn a reading route into a multi-hundred-kilobyte JS chunk.
- When doing a speed pass, compare the emitted build chunks before and after. The production output is the truth, not intuition.

## Frontend Build Notes
- Vite 8 uses Rolldown-backed production builds. Treat missing imports and stale chunk config as real build defects, not soft warnings.
- Keep `build.rollupOptions.output.manualChunks` function-based in `vite.config.ts`. The older object-map form no longer matches the stricter Vite 8 typing used here.
- Do not force the `react-markdown` plus `remark` plus `rehype-katex` plus `katex` stack into one manual chunk. Under this build, that split can emit a broken `katex_min_exports` binding and take down the homepage.
- For KaTeX CSS, prefer a lazy `<link rel="stylesheet">` injection from `src/hooks/useKatexCSS.ts` over `import('katex/dist/katex.min.css')`. The CSS-as-module path is fragile under the current Rolldown output.
- `recharts@3.6.0` expects `react-is` as a peer dependency. Keep `react-is` installed explicitly or chart-heavy routes can fail only at production build time.
- `vite-plugin-pwa@1.2.0` and `@tailwindcss/vite@4.x` currently build successfully here, but their npm peer ranges lag behind Vite 8. Re-check upstream support before assuming the warning surface is closed.
- `.npmrc` currently sets `legacy-peer-deps=true` so clean installs keep working while those peer ranges are behind. Remove it once upstream packages officially support Vite 8.

## Repo Map
- `src/pages/` — route-level screens
- `src/components/` — feature + layout components
- `src/components/ui/` — base UI (shadcn)
- `src/hooks/` — app hooks (`useAppState`, `useCheckIn`)
- `src/contexts/` — auth/theme providers
- `src/data/` + `public/data/` — sutta + Nikaya content
- `src/content/teachings/` — long-form manuscript markdown sources
- `public/teachings/` — appendix charts, scanned tables, static teaching assets
- `scripts/` — ingestion utilities and one-off content pipelines
- `design-system.md` + `src/index.css` — design tokens
- `SKILL.md` — manuscript ingestion workflow with diagrams

## UI + UX Conventions
- Use Tailwind + semantic tokens (`bg-card`, `text-foreground`, etc.).
- Follow `design-system.md` for colors/spacing/typography.
- Prefer `lucide-react` icons; add `aria-label` or text labels.
- Keep layouts mindful: generous spacing, minimal distraction.

## i18n Rules
- All user-facing strings should go through `useTranslation()`.
- Update both `src/locales/vi/common.json` and `src/locales/en/common.json`.
- Avoid hard-coded Vietnamese/English strings in components.
- `common` is the default namespace in this repo. Use bare keys like `t('exportPdf')`, not dotted keys like `t('common.exportPdf')`, or the raw key can leak into the UI.

## State + Data
- Core state is managed in `useAppState()` and persisted to
  `localStorage` under `nhapluu-app-state`.
- Prefer `useAppState` actions over ad-hoc localStorage writes.
- Reading progress uses `nhapluu_progress_*` keys; keep consistent.

## Long-Form Content
- Prefer chapterized markdown in `src/content/teachings/<slug>/`.
- Keep the site bridge thin: a teaching module should map metadata plus ordered chapter imports.
- When appendix OCR is visibly broken, preserve the source layout as images under `public/teachings/<slug>/`.
- Treat scanned front matter as its own cleanup pass. If the cover or copyright pages OCR into split capitals, repeated headings, or library stamps, rewrite that section into concise editorial markdown instead of shipping the raw extraction.
- For manuscript ingestion or translation work, read `SKILL.md` before changing the pipeline.
- When a Vietnamese chapter is not yet publication-grade, let the teaching module fall back to English instead of shipping weak prose.
- For short translated essays or retreat handouts, still prefer markdown chapters under `src/content/teachings/<slug>/vi/` over giant inline TypeScript strings.
- Split a new teaching into a few natural chapters when the source has clear turns, even if the source is short.
- Record each teaching release in the repo-root `tasks/` folder so later agents can audit route wiring, source notes, and release intent quickly.

## Book Pipeline Map

```mermaid
stateDiagram-v2
    [*] --> Extracted
    Extracted --> Cleaned
    Cleaned --> Chapterized
    Chapterized --> Registered
    Registered --> Built
    Built --> Published
    Registered --> Cleaned: structure mismatch
    Built --> Registered: route or metadata defect
```

## Frontend Build Pipeline

```mermaid
stateDiagram-v2
    [*] --> DependenciesResolved
    DependenciesResolved --> TypecheckClean
    TypecheckClean --> Bundling
    Bundling --> PWAGenerated
    PWAGenerated --> BuildReady
    DependenciesResolved --> DependenciesResolved: install missing peer
    Bundling --> DependenciesResolved: unresolved import
    Bundling --> TypecheckClean: config typing mismatch
```

```mermaid
sequenceDiagram
    participant Agent
    participant PackageJSON
    participant ViteConfig
    participant Vite8
    participant PWA
    participant Dist

    Agent->>PackageJSON: upgrade vite + plugin-react
    Agent->>PackageJSON: add missing peer deps
    Agent->>ViteConfig: keep function-based manual chunks
    PackageJSON->>Vite8: install dependency graph
    ViteConfig->>Vite8: bundling rules
    Vite8->>PWA: emit compiled assets
    PWA->>Dist: generate service worker + manifest
```

## SEO Build Pipeline

```mermaid
stateDiagram-v2
    [*] --> RouteInventoryKnown
    RouteInventoryKnown --> MetaBound
    MetaBound --> StaticHeadGenerated
    StaticHeadGenerated --> StaticRouteWritten
    StaticRouteWritten --> SitemapWritten
    SitemapWritten --> RobotsWritten
    RobotsWritten --> CrawlReady
    StaticHeadGenerated --> MetaBound: canonical or schema defect
    StaticRouteWritten --> RouteInventoryKnown: missing route family
```

```mermaid
sequenceDiagram
    participant Agent
    participant RouteMeta
    participant BuildScript
    participant Dist
    participant SearchCrawler

    Agent->>RouteMeta: update page metadata and route lists
    Agent->>BuildScript: run npm run build
    BuildScript->>Dist: write per-route index.html files
    BuildScript->>Dist: write sitemap.xml and robots.txt
    SearchCrawler->>Dist: fetch canonical route HTML
    Dist->>SearchCrawler: return head tags, JSON-LD, noscript copy
```

```mermaid
flowchart LR
    A[src/pages and metadata] --> B[src/lib/seo.ts]
    A --> C[scripts/build-seo-assets.mjs]
    C --> D[dist/route/index.html]
    C --> E[dist/sitemap.xml]
    C --> F[dist/robots.txt]
    B --> G[hydrated runtime head]
    D --> H[Crawlers and social unfurlers]
    E --> H
    F --> H
```

```mermaid
sequenceDiagram
    participant PDF
    participant Script
    participant Content
    participant TeachingModule
    participant Pages

    PDF->>Script: source manuscript
    Script->>Content: English markdown chapters
    Script->>Content: appendix image assets
    Content->>TeachingModule: vi chapter if ready, else en fallback
    TeachingModule->>Pages: metadata + lazy route import
    Pages->>Pages: build on main push
```

## Routing + Navigation
- Add routes in `src/App.tsx`.
- If a page is protected, wrap it in `ProtectedRoute`.
- Update navigation in `src/components/layout/Header.tsx` when adding top-level pages.
- `Pháp Bảo` is split into two first-class tab routes: `/phap-bao/kinh-tang` and `/phap-bao/giao-phap`. Keep the library tabs URL-driven, not local-state-only.
- Detail pages reached from the library should carry a `state.from` back target and fall back to the correct branch: suttas return to `/phap-bao/kinh-tang`, teachings return to `/phap-bao/giao-phap`.
- `Nikaya` is now branch-driven as well: `/nikaya` for all, `/nikaya/dn|mn|sn|an|kn` for each collection, and `/nikaya/<collection>/<suttaId>` for canonical detail URLs.
- Keep old `/nikaya/<suttaId>` links alive through a redirect route plus static fallback HTML, but do not treat them as canonical or sitemap-worthy.
- `Nikaya` detail links should carry a `state.from` back target and otherwise fall back to their inferred collection branch.
- If you add a new public route namespace, extend `scripts/build-seo-assets.mjs` so the namespace gets static HTML and sitemap coverage.

## Nikaya Collection Routing

```mermaid
stateDiagram-v2
    [*] --> AllCollections
    AllCollections --> CollectionBranch: click DN | MN | SN | AN | KN
    CollectionBranch --> SuttaDetail: click sutta card
    SuttaDetail --> CollectionBranch: back via state.from or inferred collection
    LegacyDetailUrl --> CanonicalRedirect
    CanonicalRedirect --> SuttaDetail
    CollectionBranch --> AllCollections: click Tất cả
    SuttaDetail --> CanonicalRedirect: collection slug mismatch
```

```mermaid
sequenceDiagram
    participant User
    participant Library as NikayaLibrary
    participant Router
    participant Detail as NikayaDetail
    participant SEO as build-seo-assets

    User->>Library: open /nikaya/dn
    Library->>Router: Link to /nikaya/dn/dn1 with state.from
    Router->>Detail: render canonical detail route
    Detail->>Detail: infer collection from suttaId
    Detail->>Router: back to /nikaya/dn
    User->>Router: open legacy /nikaya/dn1
    Router->>Detail: redirect to /nikaya/dn/dn1
    SEO->>Router: emit static HTML for /nikaya/dn and legacy fallback
```

```mermaid
flowchart LR
    A[Sidebar collection click] --> B[/nikaya/<collection>/]
    B --> C[NikayaLibrary pathname parser]
    C --> D[Filtered sutta list]
    D --> E[/nikaya/<collection>/<suttaId>/]
    E --> F[NikayaDetail canonical + back-path logic]
    F --> G[SEO metadata]
    G --> H[dist/nikaya/** static HTML]
    I[/nikaya/<legacySuttaId>/] --> J[Legacy redirect route]
    J --> E
```

## Nikaya Content Integrity
- Treat `public/data/suttacentral-json/available.json` as file-presence only. Use `public/data/suttacentral-json/content-availability.json` whenever UI or QA needs to know whether a language has real readable content.
- Bilara English payloads from `/api/bilarasuttas` are template-based. `html_text` contains one `{}` placeholder per segment and must be composed with `translation_text` before rendering.
- For `SN`, and likely other peyyala-heavy collections, do not assume every detail route is a single numeric UID. The library index can contain grouped range IDs such as `sn12.72-81`, and the fetch pass must ingest those exact IDs as first-class local files.
- Bilara may respond with HTTP `200` and a body like `{"msg":"Not Found"}` for missing English routes. Treat that as absent content, not a success.
- `KN` detail routes use book-specific prefixes such as `kp`, `dhp`, `ud`, `iti`, and `snp`. Any route inference or local file resolver that only keys off `dn|mn|sn|an|kn` prefixes is incomplete.
- Current sampled `KN` local JSON is metadata-only. Do not mark `KN` as content-complete unless the files actually contain readable body text or segment maps.
- Do not mark a Nikaya version as selectable based only on SuttaCentral metadata. If the local rendered content is absent, disable the option and fall back to SuttaCentral as an external link only.
- For collection triad audits, run `npm run audit:nikaya -- <dn|mn|sn|an|kn>`. Keep `npm run audit:nikaya-dn` only as a DN shortcut.

```mermaid
stateDiagram-v2
    [*] --> FileFetched
    FileFetched --> GroupedIdsResolved
    GroupedIdsResolved --> ContentVerified
    ContentVerified --> ManifestPublished
    ManifestPublished --> VersionSelectable
    VersionSelectable --> RenderReady
    FileFetched --> FileFetched: metadata only, refetch
    GroupedIdsResolved --> FileFetched: grouped range missing locally
    ContentVerified --> FileFetched: Bilara template mismatch
    RenderReady --> VersionSelectable: local content removed
```

```mermaid
sequenceDiagram
    participant Fetcher as fetch-all-nikayas
    participant SC as SuttaCentral Bilara
    participant JSON as *_en_sujato.json
    participant Manifest as content-availability.json
    participant Index as nikaya_index.json
    participant Detail as NikayaDetail
    participant Local as suttacentralLocal

    Fetcher->>SC: request /api/bilarasuttas/<id>/sujato?lang=en
    SC->>Fetcher: html_text template + translation_text
    Fetcher->>Index: read grouped range IDs such as sn12.72-81
    Index->>Fetcher: supplemental route list
    Fetcher->>JSON: save one sutta per language file
    Fetcher->>Manifest: publish readable-content map
    Detail->>Manifest: check selectable versions
    Detail->>Local: load local JSON
    Detail->>Local: infer KN from kp|dhp|ud|iti|snp when needed
    Local->>Local: compose html_text with translation_text
    Local->>Detail: return rendered HTML
```

```mermaid
flowchart LR
    A[SuttaCentral Bilara EN] --> B[scripts/fetch-all-nikayas.mjs]
    I[nikaya_index grouped IDs] --> B
    B --> C[dn/dn1_en_sujato.json]
    B --> D[content-availability.json]
    C --> E[src/lib/suttacentralLocal.ts]
    E --> F[Bilara template composition]
    D --> G[NikayaLibrary]
    D --> H[NikayaDetail]
    F --> H
```

## Backend Notes
- API client lives in `src/lib/api.ts`.
- Workers code in `backend/src`.
- D1 schema and migrations live in `backend/schema.sql`.

## Quality Bar
- Run `npm run lint` after meaningful changes.
- Keep TypeScript strict and avoid `any`.
- Maintain accessibility (labels, focus states).

## When You’re Unsure
- Check `README.md`, `design-system.md`, and `docs/codebase-analysis.md`.
