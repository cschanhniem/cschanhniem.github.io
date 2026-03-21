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
- Treat `public/data/suttacentral-json/available.json` as file-presence only.
- Treat `public/data/suttacentral-json/content-availability.json` as raw file-level readability only.
- Treat `public/data/suttacentral-json/effective-content-availability.json` as the product-facing truth set. It folds alias children onto readable canonical blocks and is the file UI should use for badges, selectors, and collection-level coverage.
- Treat `public/data/suttacentral-json/canonical-aliases.json` as the route-to-canonical map for fallback loading.
- `src/data/nikaya-improved/vi/*.ts` is the current home of curated manual 2026 Vietnamese translations. These files are editorial content, not raw mirrors of SuttaCentral, and should read like deliberate modern Vietnamese prose.
- Manual 2026 deliverables must default to full route-complete translations, not commentary skeletons. A route file may have a very short framing note, but the core must still be the complete translated body of that route from opening through closing line.
- Do not ship manual 2026 files in the pattern `Mũi kinh / Điều bài kinh muốn chỉ ra / Bài học thực hành` as the main body. That shape can be a draft aid, but it is not the final product.
- When a source route survives only as peyyāla or grouped shorthand, reconstruct the full route text from English plus Minh Châu instead of replacing the route with a short explanatory paragraph.
- Early `AN` child routes can inherit a grouped block title such as `Nữ Sắc v.v…` from `an1.1-10`. When authoring manual 2026 files for exact children like `an1.1` or `an1.7`, name them from the specific `TTC` segment, not from the parent block label.
- `AN 1.11-20` is the first early `AN` block where the child routes form mirrored pairs of hindrance-cause and hindrance-remedy. Keep `an1.11-15` and `an1.16-20` visibly paired in titles and prose so the manual layer preserves the causal symmetry of the source instead of flattening everything into isolated aphorisms.
- `AN 1.21-30` is the next child-level block that must be written as one coherent training cluster, not ten detached sayings. Preserve the three mirrored axes, unworkable and workable, harmful and beneficial, suffering and happiness, and let `an1.25-26` keep the extra English sense of latent potential being unrealized or realized.
- `AN 1.71-81` is another shaped block, not a pile of isolated one-liners. Keep `an1.71-75` as one cluster of training conditions, good friends, wholesome and unwholesome pursuit, and wise or unwise attention. Then keep `an1.76/78/80` and `an1.77/79/81` as two braided triads where kin, wealth, and fame are all relativized under the higher measure of wisdom.
- `AN 1.82-97` is a paired ladder, not a loose peyyala block. The core move is not new doctrine but stronger valuation: each pair upgrades an earlier theme into `great harm` or `great benefit`. Keep the eight pairs visibly matched, and do not leave the Minh Châu peyyala shorthand unexpanded in the manual layer.
- `AN 1.98-139` is the first early `AN` mega-block that changes level midstream. `an1.98-113` repeat earlier factors but now split them into interior and exterior conditions. `an1.114-129` raise the stakes again by tying the same factors to the fading or endurance of the true teaching. `an1.130-139` then leave personal training and move into doctrinal integrity: dhamma versus not-dhamma, vinaya versus not-vinaya, what the Tathāgata did or did not say, practice, or prescribe. Do not flatten those last ten routes into generic moral warnings.
- `AN 1.140-149` is the bright mirror of `AN 1.130-139`. Do not write it as vague praise of honesty. Each route is about doctrinal and disciplinary precision as a merit-bearing act that benefits many beings and makes the true teaching continue. Keep the five paired domains explicit: dhamma, vinaya, speech, practice, and prescription.
- `AN 1.170-187` is not eighteen separate praise-lines about the Buddha. `an1.170-174` establish the singularity of the Tathāgata, `an1.175-186` unfold what becomes possible when he appears, and `an1.187` hands the rolling of the Wheel to Sāriputta. The middle twelve routes are restored from a grouped shell, so do not leave them all with the generic title `Như Lai`.
- `AN 1.31-40` is the first early `AN` block that behaves like a ladder of inner discipline. Keep the sequence visible, tamed, guarded, protected, restrained, and let `an1.39-40` read as true block summaries rather than as redundant restatements.
- `AN 1.41-50` pivots from discipline into orientation, clarity, pliancy, speed, and luminosity. Treat it as one rising arc: right direction, purity, clear seeing, pliable cultivation, then the luminous-mind pair. The closing two suttas are famous and should stay lean, exact, and free of speculative metaphysics not warranted by the source.
- `AN 1.51-60` should be treated as a compact manual on beginnings. It moves from whether one truly sees the luminous mind, to whether even a finger-snap of love counts, to the primacy of intention, then to heedfulness versus laziness. Keep that arc visible instead of making the block feel like unrelated fragments.
- `scripts/generate-nikaya-index.mjs` must generate one index row per local `file id`, not per `suttaplex.uid`. Otherwise the first single route inside a grouped range can vanish from the library and SEO inventory.
- `scripts/generate-nikaya-index.mjs` must treat blank titles as missing metadata. Do not stop at a Vietnamese shell with `translated_title: null` or `translation.title: ''` if the English file or Bilara title segment still contains the real title.
- When top-level metadata is blank, extract the title from the Bilara `sutta-title` segment. Use `html_text` plus `translation_text` for the reader-facing title, and use `root_text` only as a Pali-title fallback when it is meaningful.
- Natural ID ordering matters. Do not use `parseFloat` on composite IDs such as `sn1.10` or `an1.11-20`; use token-aware numeric sorting instead.
- Route normalization must preserve meaningful punctuation in Nikaya IDs. `sn12.72` and `dhp1-20` are canonical route IDs, not strings to compact into `sn1272` or `dhp120`.
- When inferring a Nikaya collection from an ID, test `kp|dhp|ud|iti|snp` before the generic `sn` branch. `snp1.1` is `KN`, not `SN`, and a wrong branch will quietly fetch from the wrong folder.
- Bilara English payloads from `/api/bilarasuttas` are template-based. `html_text` contains one `{}` placeholder per segment and must be composed with `translation_text` before rendering.
- Grouped Bilara canonicals can expose child suttas in two distinct shapes: direct child-prefixed keys such as `an1.2:*`, or canonical-prefixed range sections such as `sn12.72-81:1.1`. Try both scoping strategies before concluding that a child route can only show the whole grouped block.
- Grouped Minh Châu HTML can also expose usable child slices without nested `id="<child>"` elements. After exact IDs and subrange IDs, try `TTC` anchors such as `TTC 3-5` or `TTC 14-17`, but only when the `TTC` ranges cover the full grouped source contiguously from `1..N`. If the labels stop early or skip values, keep the route `opaque-grouped` rather than guessing.
- The remote Bilara fallback in `src/lib/suttacentralApi.ts` also needs token-aware segment sorting. Never sort segment keys like `1.1`, `1.2`, `1.10` with `parseFloat`, or remote fallback prose can arrive out of order.
- For `SN`, and likely other peyyala-heavy collections, do not assume every detail route is a single numeric UID. The library index can contain grouped range IDs such as `sn12.72-81`, and the fetch pass must ingest those exact IDs as first-class local files.
- Many `SN`, `AN`, and `KN` local files are alias files where `suttaplex.uid !== file id`. Treat these as a real data-shape concern, not a parsing bug.
- Bilara may respond with HTTP `200` and a body like `{"msg":"Not Found"}` for missing English routes. Treat that as absent content, not a success.
- `KN` detail routes use book-specific prefixes such as `kp`, `dhp`, `ud`, `iti`, and `snp`. Any route inference or local file resolver that only keys off `dn|mn|sn|an|kn` prefixes is incomplete.
- Current sampled `KN` local JSON is metadata-only. Do not mark `KN` as content-complete unless the files actually contain readable body text or segment maps.
- `npm run audit:nikaya-originals` is the canonical audit for original layers. It distinguishes file presence, readable content, alias UID drift, alias-target validity, alias-range validity, range completeness inside grouped canonicals, route-title parity, Pali-title parity, and whether a readable Vietnamese source is truly Minh Châu or only a mislabeled placeholder.
- The same audit also distinguishes topology defects from semantic duplication. `SN` and `AN` currently index both grouped canonicals and their child aliases, while `KN` has child aliases for Dhammapada ranges without indexing the grouped canonicals.
- `Alias range violations` and `range completeness violations` should both stay at `0`. If a grouped canonical such as `sn12.72-81` or `dhp1-20` is missing any child route or contains an unexpected extra child, treat that as a topology defect even if the canonical itself exists.
- Run `npm run audit:nikaya-coverage` when you need the product-facing truth set by canonical block. It tells you which canonical blocks are fully readable in both languages, which are missing only English, which are missing only Vietnamese, which rely on canonical fallback, and which have missing canonical targets.
- Run `npm run audit:nikaya-master` when you want one consolidated report that merges structure, provenance, topology, and canonical-block coverage into a single per-collection summary.
- In `KN`, many files named `*_vi_minh_chau.json` are not usable Minh Châu content. Some resolve only to metadata, and a large grouped subset points to `phantuananh` in `suttaplex.translations`. Do not count those as Minh Châu coverage unless the file is both readable and source-matched.
- The `KN` grouped Dhammapada canonicals such as `dhp1-20` and `dhp21-32` are now indexed locally. Their English can be loaded directly on the grouped route and inherited by the child `dhp*` routes through `canonical-aliases.json`.
- `npm run audit:nikaya` now uses `effective-content-availability.json`, so its totals reflect what a reader can actually open from the current UI, not just which single JSON files contain raw text on their own.
- `npm run audit:nikaya-remote` probes the official SuttaCentral APIs for every canonical coverage gap and classifies each one as `readable`, `metadata-only`, `not found`, `http error`, or `network error`. Use it before concluding that a local gap is truly upstream.
- `npm run audit:nikaya-remote` now has two lanes: `canonical` gaps and `visible-route` gaps. The second lane is critical for cases like `an1.330-332`, where the canonical block is readable but the public child routes are still missing.
- `npm run audit:nikaya-master` now carries the upstream lane as well, but a nonzero `network-error` count means the remote truth set is inconclusive, not empty. Do not read `0/0/0` plus `network-error > 0` as upstream completeness.
- In any Bilara or legacy segment scanner, never count metadata keys such as `uid`, `lang`, `title`, `author`, `previous`, or `next` as readable segments. Only keys with `:` belong to segment content, with an explicit `text` field as the rare direct-text exception.
- `npm run audit:nikaya-fidelity` is the route-level truth set for rendering quality on the visible library surface. Use it to separate `exact`, `scoped-grouped`, `opaque-grouped`, and `missing` originals for English and Minh Châu.
- Nikaya alias routes often need local metadata fallback even when remote `suttaplex` exists. For routes such as `sn12.72` and `dhp1`, prefer the child row in `nikaya_index.json` for `uid`, acronym formatting, titles, and blurb when grouped canonical JSON or remote metadata is blank.
- The public Nikaya library should not double-list grouped canonical fallback rows such as `sn12.72-81` or `dhp1-20`. Keep them in the raw index for fallback resolution and audits, but hide them from the visible library list and user-facing collection totals.
- Apply the same rule to SEO. Grouped canonical fallback rows should keep working as direct routes, but they must stay off the indexable surface: no sitemap entry, and `noindex,nofollow` in both static HTML and runtime head tags.
- When remote audit proves a language layer is readable upstream but still missing locally, use `node scripts/fetch-all-nikayas.mjs repair <collection> <en|vi>`. That mode refetches only files that still lack curated readable content and skips child alias routes already satisfied by a canonical fallback.
- After the current repair pass, `KN` is English-complete on the public surface. Remaining `KN` deficits are now entirely Vietnamese provenance and manual 2026 coverage, not English ingestion.
- Do not mark a Nikaya version as selectable based only on SuttaCentral metadata. If the local rendered content is absent, disable the option and fall back to SuttaCentral as an external link only.
- When a route can only render an original layer as a whole grouped block, surface that fact in the reader. `NikayaDetail` and `NikayaComparisonView` should distinguish a clean single-sutta render from a grouped fallback instead of silently implying exact coverage.
- Treat `src/lib/nikaya-source-gaps.ts` as the registry of verified original-layer absences. Use it only after source inspection has proven the gap is real, as with `sn36.30`, `AN 11.*`, or English `an1.330-332`.
- Do not fabricate Minh Châu source text for peyyala routes that do not exist in the verified edition. Once a gap is proven real, surface a source-gap notice in the reader instead of inventing filler content.
- The Nikaya detail selector is intentionally curated to three choices only: `Tiếng Việt - Thích Minh Châu`, `Tiếng Anh - Bhikkhu Sujato`, and `Tiếng Việt - Nhập Lưu 2026`. Do not surface other languages or author variants in the UI unless product scope changes.
- `npm run audit:nikaya` derives manual 2026 coverage from `src/data/nikaya-improved/vi/*.ts`. Preserve dotted IDs when normalizing filenames such as `sn-56-11.ts`, or the audit will silently undercount curated translations.
- For collection triad audits, run `npm run audit:nikaya -- <dn|mn|sn|an|kn>`. Keep `npm run audit:nikaya-dn` only as a DN shortcut.
- For structural audits, run `npm run audit:nikaya-integrity` before trusting collection totals or SEO route counts.
- For provenance and readability audits of the original English plus Minh Châu layers, run `npm run audit:nikaya-originals [dn|mn|sn|an|kn]`.
- When authoring manual 2026 translations, keep the source argument intact, trim repetition when it only echoes earlier stock passages, and make the Vietnamese readable aloud without flattening the doctrine.
- For `SN` manual 2026 authoring, prefer a doctrinal spine batch across major saṃyuttas before filling long consecutive stretches. Core anchors such as dependent origination, not-self, the burning discourse, satipaṭṭhāna conditions, and the truths make later style decisions more coherent.
- The current `SN` doctrinal spine now includes `sn12.1`, `sn12.2`, `sn12.12`, `sn12.15`, `sn22.22`, `sn22.59`, `sn22.95`, `sn35.23`, `sn35.28`, `sn35.63`, `sn45.8`, `sn46.51`, `sn47.13`, `sn47.42`, `sn48.10`, `sn55.1`, `sn56.1`, `sn56.11`, and `sn56.13`. When extending `SN`, keep choosing leverage points like these instead of scattering effort over arbitrary contiguous ranges.
- For `KN` manual 2026 authoring, `Khuddakapāṭha` is the best first foothold. Translate `kp1-kp9` as a coherent liturgical cluster before expanding into broader `KN` books, and keep chant bodies intact instead of flattening them into summaries.
- After `kp1-kp9`, the next `KN` foothold should be the source-supported `Sutta Nipāta` anchors `snp1.8`, `snp2.4`, and `snp3.7`. The first two overlap with `Mettā` and `Maṅgala`, so keep their route-level identity while preserving a chantable cadence. `Sela` should be treated as a narrative-conversion discourse, not reduced to a generic praise summary.
- `DN` manual 2026 coverage is now complete at `34/34`. Future `DN` changes should normally be editorial revision passes, fidelity improvements, or prose tightening, not missing-file backfill.
- `MN` manual 2026 coverage is now complete at `152/152`. For `MN`, future work should focus on editorial upgrades to specific discourses rather than missing-file backfill.
- `src/data/nikaya-improved/vi/index.ts` now auto-discovers translation modules with `import.meta.glob`. Do not hand-maintain a giant import registry for manual 2026 files anymore.
- `src/data/nikaya-improved/availability.ts` is derived from `viImproved`. Treat it as generated-from-source structure, not a second manual truth table.
- Use `node scripts/generate-manual-2026.mjs <dn|mn|sn|an|kn>` or `npm run generate:manual -- <collection>` to scaffold missing manual 2026 files. The script skips existing files, preserves curated hand-edited modules, and writes filenames in canonical hyphenated form such as `mn-6.ts`, `an-1-10.ts`, or `sn-56-11.ts`.
- `docs/manual-2026-agent-prompts.md` is the canonical prompt pack for AI-assisted manual 2026 authoring. Use it when handing batch translation or editorial revision work to another agent.
- In that prompt pack, keep the source hierarchy explicit: English locks meaning, HT. Thích Thanh Từ sharpens Vietnamese clarity and cadence when the source is truly available, and HT. Thích Minh Châu remains the local terminology and route-structure cross-check. Never claim Thanh Từ input if the source packet is absent from the workspace.
- The prompt pack now explicitly treats summary-style route files as incomplete. If an existing route only contains a concise commentary shell, schedule it for revision into a full translation.
- `worklog-translate-2026.md` is the top-level tracker for manual 2026 coverage. Update it after every translation batch with the active lane, completed-through route, next missing route, and latest coverage counts.
- `AN 1.188-197` is a short but precise cluster of foremost disciples. Do not flatten it into generic praise. Each route should retain the distinct excellence being named, and `an1.197` must read like a charter for faithful commentary: expanding a brief statement without distortion.
- `AN 1.198-208` is the next disciples cluster, but its center of gravity shifts from public distinction to interior capacities and support conditions. Keep `an1.198-200` technically exact without turning them into occult spectacle, keep `an1.201-206` as a quiet arc of communal beauty, no strife, worthy of offerings, forest dwelling, absorption, energy, and good speech, and keep `an1.207-208` from collapsing into crude ideas of luck or blind belief. Sīvali is about mature merit, and Vakkalī is about faith that leans the whole life toward truth.
- `AN 1.209-218` should read as a training-and-expression cluster. `an1.209-210` establish receptivity to the path, loving training and going forth out of faith. `an1.211-215` then ground the sangha in lived form, communal order, eloquence, all-round loveliness, practical care, and even celestial affection. `an1.216-218` move into three different intensities of wisdom: swift insight, beautiful preaching, and analytic unobstructed understanding. Do not let these ten routes collapse into ten interchangeable compliments.
- `AN 1.219-234` is a transmission-and-community cluster. The first five routes belong together as the many-sided excellence of Ānanda, hearing, memory, range, retention, and attendance. If English and Minh Châu diverge in surface wording, preserve the deeper semantic arc of that fivefold portrait rather than translating each line in isolation. Then keep `an1.224-230` as the outward life of a healthy sangha, gathering people, delighting households, health, recollection, Vinaya, admonition, and sense restraint. Finally keep `an1.231-234` sharply distinguished: monastic admonition, mastery of the fire element, speech that sparks eloquence, and rough-robe austerity.
- `AN 1.235-247` is the first bhikkhunī excellence cluster and should never be written as a gender-swapped echo of the monks. Keep Mahāpajāpati’s seniority historical, Khemā’s wisdom and Uppalavaṇṇā’s psychic power spacious and unforced, Paṭācārā and Dhammadinnā as law and teaching pillars, and the closing pair Kisāgotamī plus Siṅgāla’s mother as austerity and faith, not deprivation and credulity.
- `AN 1.248-257` is the first male lay follower cluster and should reveal the full breadth of lay greatness, not reduce it to charity. Let Tapussa and Bhallika open the householder stream historically, let Anāthapiṇḍika, Citta, and Hatthaka show giving, speaking, and gathering, and keep the final three routes semantically strict: experiential confidence, confidence in a person, and intimate trust. If Minh Châu and English diverge there, resolve by the Pali root rather than by surface familiarity.
- `AN 1.258-267` is the matching female lay follower cluster. Keep the ten routes visibly varied: first refuge, generosity, great learning, loving-kindness, meditation depth, excellent giving, care for the sick, unwavering confidence, intimate trust, and confidence grounded in hearing. Do not flatten `an1.265`, `an1.266`, and `an1.267` into three generic faith routes, and do not reduce `an1.267` to belief in rumor. Its center is confidence born from hearing and transmission.
- `AN 1.268-277` is the first `aṭṭhāna` or impossibility cluster after the lay-follower blocks. Do not rewrite it as a bland ethics list. Keep the structural contrast in view: a person accomplished in right view cannot fall into these distortions or acts, while an ordinary person still can. The first three routes are about wrong perception of conditioned things as permanent, pleasant, or self. The next six are about the gravest impossible acts for one with right view. The closing route is cosmological and should preserve the singularity of one fully awakened Buddha in one world-system.
- `AN 1.278-286` is the second half of the same impossibility arc. Keep the internal move clear: one wheel-turning monarch in one world-system, then old cosmological role claims, then the karmic impossibility of pleasant results coming from bodily, verbal, and mental misconduct. When rendering `an1.281-283` and `an1.285-286`, split the grouped source into exact route-level manual files so the reader does not lose route identity.
- `AN 1.287-295` completes the first impossibility cycle by turning to the bright mirror of the same karmic law. Preserve the full symmetry: good bodily, verbal, and mental conduct cannot ripen into disagreeable results, bad conduct cannot lead upward after death, and good conduct cannot lead downward after death. Split grouped source rows into exact route-level manual files so `an1.288`, `an1.289`, `an1.291`, `an1.292`, `an1.294`, and `an1.295` each keep their own route identity.
- `AN 1.296-305` opens the first recollection cluster of the One Thing chapter. Keep the repeated doctrinal arc visible in every route: when developed and cultivated, this one practice leads to disillusionment, dispassion, cessation, peace, direct knowledge, awakening, and nibbāna. Do not let grouped source rows erase route identity. Split `an1.297-305` into exact route-level manual modules so Buddha, Dhamma, Saṅgha, ethics, generosity, deities, breathing, death, body, and peace each retain their own contemplative flavor.
- `AN 1.306-315` is the seed and view cluster. Preserve the internal progression from wrong view and right view as engines of ethical growth or decline, to irrational and rational application of mind as their near causes, to the seed similes that show how view flavors every act, intention, wish, and result. The paired climax `an1.314` and `an1.315` must read like a real rhetorical culmination, not just like two more entries in a list.
- `AN 1.316-332` is a three-part block. Keep `an1.316-317` as the social force of wrong and right view, `an1.320-327` as the mirrored cluster on badly and well explained Dhamma, and `an1.328-332` as the disgust similes for even the smallest remainder of becoming. The English visible routes `an1.330-332` are upstream gaps, but the grouped Sujato line plus Minh Châu `TTC 14-17` are enough to restore exact manual route identities without inventing doctrine.
- `AN 1.333-347` is a rarity ladder. Keep the `few and many` cadence audible as the block climbs from scarce favorable birth and conditions, to scarce discernment, to scarce encounter with Tathagata and Dhamma, to scarce retention, reflection, and practice, then to scarce samvega, right effort, samadhi based on letting go, and finally the rare taste of meaning, Dhamma, and liberation in `an1.347`. Do not flatten the block into disconnected sayings.
- `AN 1.348-377` is a rebirth matrix. Keep each child route exact, not generic. Every route must preserve one rare rebirth target and one specific common fall destination. The block moves by source realm, human, gods, hell, animals, ghosts, and closes by stressing that without transformed karma and understanding, downward drift is common while upward rebirth is rare.
- `AN 1.378-393` is an inspiring-qualities cluster. Do not write the sixteen routes as equal praise-tags. `an1.378-381` are renunciant austerities, `an1.382-388` shift to teaching, Vinaya, learning, bearing, and communal gravity, and `an1.389-393` name social or bodily traits that can support confidence without becoming measures of awakening. Keep `worth having` audible throughout, and do not moralize good family, beauty, or health into spiritual superiority.
- `AN 1.394-401` is the first finger-snap cultivation cluster. Keep the block as one octave, four jhānas followed by four brahmavihāras. The real point is not cataloguing meditative states, but preserving the refrain that even a moment of true cultivation means the monk is not empty in meditation, follows the Teacher, responds to instruction, and does not consume alms in vain. Do not let the repeated formula go flat.
- `AN 1.402-423` is the next finger-snap training arc and should read as one continuous interior curriculum. `an1.402-405` are the four establishments of mindfulness, `an1.406-409` the four right efforts, `an1.410-413` the four bases of spiritual power, `an1.414-418` the five faculties, and `an1.419-423` their maturation as the five powers. Do not flatten the arc into twenty-two generic praises of effort. The point is that even a brief moment of real cultivation in any of these frameworks is not spiritually empty.
- `AN 1.424-438` carries the same finger-snap refrain into the seven awakening factors and the noble eightfold path. Keep `an1.424-430` as a progressive inner ecology, mindfulness, investigation, energy, joy, tranquility, collectedness, equanimity, and keep `an1.431-438` as the exact eightfold path in order. Do not turn them into motivational slogans. The doctrinal point is that even a moment of genuine cultivation in these core frameworks already dignifies the monastic life.
- `AN 1.439-454` is the next deep meditation block and must be kept as two exact clusters, not sixteen detached captions. `an1.439-446` are the eight `thắng xứ`, first the four structural contrasts of internal or external form and limited or limitless form, then the blue, yellow, red, and white quartet. `an1.447-454` are the eight liberations, from still having form and seeing form, through purified perception, through the immaterial attainments, to cessation of perception and feeling. Keep the language lean, technical where needed, and never inflate these routes into mystical vagueness.
- `AN 1.455-464` is one complete ten-kasina block and should be authored as such. `an1.455-458` are the four element kasinas, `an1.459-462` the four color kasinas, and `an1.463-464` the expansion into space and consciousness kasina. Do not split the block editorially after `an1.462`; the movement from dense object to subtle field is the point of the sequence.
- `AN 1.465-474` is the ten-perception block and should keep its three-part shape. `an1.465-468` cut attachment by disillusioning perception, ugliness, death, food, and the whole world. `an1.469-471` tighten into the insight chain, impermanence, suffering in impermanence, not-self in suffering. `an1.472-474` then turn from seeing to release, giving up, fading of passion, and cessation. Do not write these as isolated inspirational fragments.
- `AN 1.475-484` restarts with a compact insight-and-disillusion cluster, then swings hard into corpse contemplations. `an1.475-479` should stay quick and direct, impermanence, not-self, death, food, the world. `an1.480-484` must not be prettified. Skeleton, worm-eaten corpse, livid corpse, split-open corpse, and bloated corpse are meant to break glamour, not to sound tasteful.
- `AN 1.485-494` is the recollection cluster and should feel bright, usable, and foundational. `an1.485-490` are the six classical recollections, Buddha, Dhamma, Saṅgha, ethics, generosity, deities. `an1.491-494` then close with breathing, death, body, and peace. Do not let these become vague devotional blurbs. Each route should clarify how recollection shapes the heart.
- `AN 1.495-504` advances from the five faculties to the five powers, all grounded in the first absorption. Keep `an1.495-499` and `an1.500-504` visibly paired. The second five are not duplicates. They are the matured, steadier form of the first five. Make the growth from `căn` to `lực` unmistakable in both title and prose.
- `AN 1.505-514` repeats the same paired pentads as `AN 1.495-504`, but the ground changes from the first absorption to the second. Do not write it as a lazy copy. The prose should sound quieter, more inward, and less effortful. Preserve both transitions at once, from `căn` to `lực`, and from sơ thiền to nhị thiền.
- `AN 1.515-524` carries the same structure into the third absorption. This block should feel cooler and more balanced than `AN 1.505-514`. Let the prose lose another layer of brightness and effort. Keep the movement from faculty to power clear, but let tam thiền read as mát, đằm, and very steady rather than merely "deeper".
- `AN 1.525-534` carries the same paired structure into the fourth absorption. Do not merely say it is deeper again. Let it read cleaner, more even, and more purified than `AN 1.515-524`. This is the xả and purity block. The tone should be bright but almost stainless, with minimal emotional coloring.
- `AN 1.535-544` shifts away from the jhāna-grounded clusters into the mettā block. This should not sound technical or cold after the fourth-jhāna tranche. Keep the prose wider, warmer, and more humane. The key is to preserve both axes, from faculty to power, and from purified equanimity into active non-hostility and benevolence.
- `AN 1.545-554` mirrors the mettā pentads but shifts fully into karuṇā. Do not simply swap one Brahmavihāra label for another. Let the prose move closer to suffering, endurance, and non-abandonment. Keep the faculty to power transition explicit, and make sure compassion is not flattened into sadness, pity, or moral sentimentality.
- `AN 1.555-564` is the muditā mirror. The prose should brighten after the karuṇā tranche, but never become bubbly, congratulatory, or thin. Keep joy tied to goodness, freedom from envy, and clarity of heart. Preserve the faculty to power transition, and let the closing route make clear that wisdom can rejoice without intoxication.
- `AN 1.565-574` is the upekkhā mirror and should now also be the first tranche written under the stricter full-translation standard. Keep the tone level, lucid, and unsticky, but do not let equanimity collapse into emotional distance. `an1.574` must retain the full closing refrain about the monk who is not barren of jhāna and does not consume the country’s alms in vain.
- `AN 1.575-615` is a major `kāyagatāsati` block. Do not trust child JSON titles here, because both the index and the child files collapse them into the parent chapter label. Recover route identity from the grouped English Bilara author endpoint plus the grouped Minh Châu `TTC` anchors.
- In that block, `an1.576-582` are seven explicit fruits of one cultivated quality, not one vague paragraph. Keep them in order: urgency, benefit, sanctuary from the yoke, mindfulness and awareness, knowledge and vision, present-life happiness, and knowledge with liberation.
- Also in the same block, the sub-clusters have to stay visible. `an1.586-590` are the abandonment cluster, ignorance, knowledge, conceit, underlying tendencies, fetters. `an1.591-595` are the analytic-penetration cluster. `an1.596-599` are the four fruits. `an1.600-615` are the long wisdom ladder. Do not flatten those internal shapes into generic praise of mindfulness of the body.
- `AN 1.616-627` closes the Book of the Ones through an `amata` mirror. Keep the verbal differences sharp, enjoy, have enjoyed, lose, miss out, neglect, forget, cultivate, develop, make much of, know directly, fully understand, realize. If these are flattened into one moral slogan, the rhetorical force of the ending is lost.
- `AN 2.1-10` opens the Book of the Twos with a different feel. Do not force every route into two-sentence minimalism. `an2.1` and `an2.5` need full discourse bodies, while `an2.6-9` are a compact ethical cluster on bondage, shame, moral dread, and social order.
- `AN 2.11-20` is the first real doctrinal staircase of Book Two. Keep `an2.11-13` as an ascending strength cluster, reflection, training, awakening factors, jhāna. Then let `an2.14-20` widen into teaching method, monastic dispute, karmic consequence, abandoning and developing qualities, and finally preservation of the true Dhamma. `an2.15`, `an2.17`, and `an2.20` must read as full discourses, not compressed maxims.
- `AN 2.21-31` is the first ethics-and-interpretation block of Book Two. Keep its internal turns visible. `an2.21` starts with owning fault and rightly receiving confession. `an2.22-25` are a hermeneutics cluster on misrepresenting the Tathāgata, first by motive, then by false attribution, then by confusing texts that need interpretation with texts whose meaning is explicit. `an2.26-29` turn to karmic destination through honesty, view, and virtue. `an2.30-31` widen again into solitude and the double training of serenity and discernment. Do not collapse these eleven routes into one generic moral block.
- `AN 2.32-41` is the first mixed-weight block of Book Two. Do not let the short moral routes train the hand to underwrite the long ones. `an2.32-35` move through gratitude, parents, wholesome action, and worthy recipients. `an2.36-38` are proper dialogue or discourse units and should breathe as full scenes, especially Sāriputta on internal and external fetters, and the two Mahākaccāna brahmin encounters. `an2.39-41` return to concise social and doctrinal stability teachings. Keep those three terse, but do not compress the middle three into abstract summaries.
- `AN 2.42-51` is a governance-of-community block. The routes are short, but they form a deliberate ladder of communal discernment. Keep `an2.42-46` as paired diagnostics of communal quality, shallow and deep, divided and united, inferior and superior, ignoble and noble, dregs and cream. `an2.47-48` are longer because they deal with pedagogy and relation to gain, so do not compress them into slogans. `an2.49-51` then tighten into legal and doctrinal integrity, lawful procedure, lawful assembly, and right speech in disputes.
- `AN 2.52-63` is a stepped `Puggalavagga`, not a heap of unrelated dyads. `an2.52-56` define rare human and awakened types, `an2.57-59` test fearlessness through thunder, monk, elephant, horse, lion, `an2.60-61` pivot into truthfulness and unsated desire, and `an2.62-63` widen into communal life, admonition, and what makes disputes drag on or settle down. Keep the last two routes fully procedural and explicit.
- `AN 2.64-76` is a calibrated `Sukhavagga`. Each route is brief, but the block has one governing move: set two forms of happiness side by side, then declare which is higher. Preserve that rhythm. Do not blur `renunciate`, `renunciation`, `no attachments`, `undefiled`, `noble`, `mental`, `free of rapture`, `equanimity`, `immersion`, and `formless` into generic "higher happiness" language.

```mermaid
stateDiagram-v2
    [*] --> FileFetched
    FileFetched --> GroupedIdsResolved
    GroupedIdsResolved --> ContentVerified
    ContentVerified --> OriginalLayersAudited
    OriginalLayersAudited --> MetadataParityAudited
    MetadataParityAudited --> ManifestPublished
    ManifestPublished --> RenderFidelityAudited
    RenderFidelityAudited --> VersionSelectable
    VersionSelectable --> RenderReady
    RenderReady --> ReaderWarned: grouped block only
    FileFetched --> FileFetched: metadata only, refetch
    GroupedIdsResolved --> FileFetched: grouped range missing locally
    GroupedIdsResolved --> ContentVerified: range-position slice available
    ContentVerified --> FileFetched: Bilara template mismatch
    OriginalLayersAudited --> FileFetched: Minh Chau provenance unresolved
    MetadataParityAudited --> GroupedIdsResolved: alias target missing from index
    RenderReady --> VersionSelectable: local content removed
```

```mermaid
flowchart LR
    A[Route id plus lang] --> B[canonical-aliases.json]
    B --> C[src/lib/nikaya-source-gaps.ts]
    C --> D[NikayaDetail coverage notice]
    C --> E[Audit conclusion]
    E --> F[Do not fabricate missing originals]
```

```mermaid
stateDiagram-v2
    [*] --> IndexRowKnown
    IndexRowKnown --> FilenameCanonical
    FilenameCanonical --> ManualModuleScaffolded
    ManualModuleScaffolded --> ModuleDiscovered
    ModuleDiscovered --> AvailabilityDerived
    AvailabilityDerived --> TriadAudited
    TriadAudited --> BuildVerified
    BuildVerified --> Pushed
    FilenameCanonical --> IndexRowKnown: naming mismatch fixed
    ModuleDiscovered --> ManualModuleScaffolded: export shape invalid
    AvailabilityDerived --> ModuleDiscovered: duplicate suttaId
    TriadAudited --> ManualModuleScaffolded: coverage gap remains
```

```mermaid
sequenceDiagram
    participant Index as nikaya_index.json
    participant Generator as generate-manual-2026.mjs
    participant Files as src/data/nikaya-improved/vi/*.ts
    participant Loader as vi/index.ts
    participant Availability as availability.ts
    participant Audit as audit-nikaya-triad.mjs

    Index->>Generator: collection rows
    Generator->>Files: scaffold missing manual modules
    Files->>Loader: import.meta.glob eager discovery
    Loader->>Availability: derived viImproved keys
    Availability->>Audit: manual coverage truth set
    Audit->>Audit: verify triad completeness
```

```mermaid
flowchart LR
    A[nikaya_index.json] --> B[generate-manual-2026.mjs]
    B --> C[src/data/nikaya-improved/vi/*.ts]
    C --> D[vi/index.ts glob loader]
    D --> E[availability.ts derived IDs]
    E --> F[audit:nikaya]
    D --> G[NikayaDetail selector]
```

```mermaid
sequenceDiagram
    participant Fetcher as fetch-all-nikayas
    participant SC as SuttaCentral Bilara
    participant JSON as *_en_sujato.json
    participant RawManifest as content-availability.json
    participant EffectiveManifest as effective-content-availability.json
    participant Alias as canonical-aliases.json
    participant Index as nikaya_index.json
    participant Audit as audit-nikaya-originals
    participant Fidelity as audit-nikaya-render-fidelity
    participant Detail as NikayaDetail
    participant Local as suttacentralLocal

    Fetcher->>SC: request /api/bilarasuttas/<id>/sujato?lang=en
    SC->>Fetcher: html_text template + translation_text
    Fetcher->>Index: read grouped range IDs such as sn12.72-81
    Index->>Fetcher: supplemental route list
    Fetcher->>JSON: save one sutta per language file
    Fetcher->>Alias: publish child -> canonical fallback map
    JSON->>Audit: expose file id, canonical uid, titles, nav, and source metadata
    Audit->>RawManifest: verify raw readable EN and raw readable Minh Chau VI
    Audit->>Index: verify alias targets, title parity, and canonical prev/next continuity
    Fetcher->>EffectiveManifest: publish product-facing readable-content map
    Fidelity->>Detail: distinguish exact, scoped-grouped, opaque-grouped, and missing
    EffectiveManifest->>Detail: expose reader-visible version availability
    EffectiveManifest->>Library: expose reader-visible coverage totals
    Library->>Alias: hide grouped canonical fallback rows from the public list
    BuildScript->>Alias: derive grouped canonical fallback rows
    BuildScript->>BuildScript: mark grouped fallback rows as noindex
    Detail->>EffectiveManifest: check curated selector availability
    Detail->>Alias: resolve grouped canonical fallback when a child route has no own readable file
    Detail->>Local: load local JSON
    Detail->>Local: infer KN from kp|dhp|ud|iti|snp when needed
    Detail->>Local: merge remote suttaplex with local index fallback metadata
    Local->>Local: compose html_text with translation_text
    Local->>Local: scope grouped Bilara by child prefix or range position
    Local->>Local: scope grouped Minh Chau HTML by nested subrange ids or TTC chunks
    Local->>Detail: return rendered HTML
    Detail->>Detail: keep only 3 curated translation choices
    Detail->>Detail: warn when only a grouped block is renderable
```

```mermaid
flowchart LR
    A[SuttaCentral Bilara EN] --> B[scripts/fetch-all-nikayas.mjs]
    I[nikaya_index grouped IDs] --> B
    B --> C[dn/dn1_en_sujato.json]
    C --> N[scripts/generate-nikaya-index.mjs]
    N --> O[nikaya_index.json with child titles]
    O --> I
    C --> J[scripts/audit-nikaya-originals.mjs]
    C --> P[scripts/audit-nikaya-remote-gaps.mjs]
    P --> Q[fetch-all repair mode]
    Q --> C
    B --> D[content-availability.json]
    B --> K[effective-content-availability.json]
    B --> L[canonical-aliases.json]
    J --> D
    O --> G
    O --> H
    C --> E[src/lib/suttacentralLocal.ts]
    E --> F[Bilara template composition]
    L --> G[NikayaLibrary grouped-route pruning]
    L --> M[scripts/build-seo-assets.mjs noindex gating]
    K --> G[NikayaLibrary]
    K --> H[NikayaDetail]
    L --> H
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
