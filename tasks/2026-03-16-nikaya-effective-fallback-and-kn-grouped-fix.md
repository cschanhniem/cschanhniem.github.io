# 2026-03-16 Nikaya effective fallback and KN grouped fix

## Goal

Sửa các lỗi Nikaya còn vá được ở tầng dữ liệu và hiển thị thật:

- English của các child alias routes phải đọc được nếu canonical grouped block đã có nội dung
- `KN` không được tiếp tục thiếu các canonical Dhammapada ranges trong index
- thư viện và detail page phải dùng truth set product-facing, không được nhầm raw file readability với actual readable route coverage
- lựa chọn `Tiếng Việt - Thích Minh Châu` chỉ được bật khi route đó thật sự có nội dung Minh Châu

## Work completed

- Extended [scripts/fetch-all-nikayas.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/fetch-all-nikayas.mjs) so grouped canonicals can be derived from alias files, not only from `nikaya_index.json`.
- Added a new grouped fetch mode: `node scripts/fetch-all-nikayas.mjs grouped [dn|mn|sn|an|kn]`.
- Fetched the `26` missing grouped Dhammapada canonical ranges for `KN`, from `dhp1-20` through `dhp383-423`.
- Added [public/data/suttacentral-json/canonical-aliases.json](/Volumes/SSD/nhapluu/nhapluu-app/public/data/suttacentral-json/canonical-aliases.json) as the child-to-canonical fallback map.
- Added [public/data/suttacentral-json/effective-content-availability.json](/Volumes/SSD/nhapluu/nhapluu-app/public/data/suttacentral-json/effective-content-availability.json) as the product-facing availability manifest.
- Kept [public/data/suttacentral-json/content-availability.json](/Volumes/SSD/nhapluu/nhapluu-app/public/data/suttacentral-json/content-availability.json) as raw file-level readability only.
- Updated [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts) to:
  - load raw manifest, effective manifest, and alias manifest
  - resolve child routes to grouped canonicals when the child file itself has no readable content
- Updated [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts) again so alias-route metadata prefers the child row in `nikaya_index.json`, not the grouped canonical fallback row.
- Updated [src/lib/suttacentralApi.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralApi.ts) so remote `suttaplex` metadata is merged with local fallback metadata. Alias routes such as `sn12.72` and `dhp1` no longer render blank headers or `null • Nhập Lưu`.
- Updated [src/pages/NikayaLibrary.tsx](/Volumes/SSD/nhapluu/nhapluu-app/src/pages/NikayaLibrary.tsx) to use `effective-content-availability.json`.
- Updated [src/pages/NikayaLibrary.tsx](/Volumes/SSD/nhapluu/nhapluu-app/src/pages/NikayaLibrary.tsx) again so grouped canonical routes used only as backend fallback are hidden from the public listing and collection coverage cards.
- Updated [src/pages/NikayaDetail.tsx](/Volumes/SSD/nhapluu/nhapluu-app/src/pages/NikayaDetail.tsx) so grouped canonical fallback routes stay `noindex,nofollow` at runtime too, not only in static HTML.
- Updated [scripts/build-seo-assets.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/build-seo-assets.mjs) so grouped canonical fallback routes are excluded from indexable Nikaya sitemaps while still receiving static HTML with `noindex,nofollow`.
- Updated [scripts/audit-nikaya-triad.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-triad.mjs) to report product-facing counts instead of raw single-file counts.
- Updated [scripts/audit-nikaya-triad.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-triad.mjs) again so collection totals now match the visible library list after grouped fallback rows are hidden.
- Updated [scripts/audit-nikaya-master.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-master.mjs) so each collection report now separates raw route topology from visible library surface.
- Fixed the route normalization bug in [src/data/nikaya-improved/availability.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/data/nikaya-improved/availability.ts) and [src/data/nikaya-improved/vi/index.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/data/nikaya-improved/vi/index.ts) so `sn12.72` stays `sn12.72` instead of collapsing into `sn1272`.
- Regenerated [public/data/suttacentral-json/nikaya_index.json](/Volumes/SSD/nhapluu/nhapluu-app/public/data/suttacentral-json/nikaya_index.json), [public/data/suttacentral-json/available.json](/Volumes/SSD/nhapluu/nhapluu-app/public/data/suttacentral-json/available.json), and the two content manifests.
- Updated [AGENTS.md](/Volumes/SSD/nhapluu/nhapluu-app/AGENTS.md) and [SKILL.md](/Volumes/SSD/nhapluu/nhapluu-app/SKILL.md) so future agents do not conflate raw readability with effective route coverage.

## Result

### Structural delta

- `nikaya_index.json`: `12255 -> 12281`
- `KN route ids`: `694 -> 720`
- `KN alias targets missing from index`: `423 -> 0`
- `KN missing canonical topology blocks`: `26 -> 0`

### Product-facing coverage delta

These are the counts a reader now experiences through the current app surfaces:

- `SN`: English `3158/3158`, Minh Châu `3144/3158`
- `AN`: English `8217/8217`, Minh Châu `6772/8217`
- `KN`: English `449/720`, Minh Châu `12/720`

These are the visible collection counts after hiding grouped fallback canonicals from the public library list:

- `DN library`: `34` visible routes, English `34/34`, Minh Châu `34/34`
- `MN library`: `152` visible routes, English `152/152`, Minh Châu `152/152`
- `SN library`: `3024` visible routes, English `3024/3024`, Minh Châu `3010/3024`
- `AN library`: `8122` visible routes, English `8122/8122`, Minh Châu `6690/8122`
- `KN library`: `694` visible routes, English `423/694`, Minh Châu `12/694`

### Raw source reality after the fix

These are still the file-level facts underneath the product fallback:

- `SN` raw English-readable files: `1819/3158`
- `AN` raw English-readable files: `1408/8217`
- `KN` raw English-readable files: `26/720`
- `KN` raw Minh Châu-readable files: `12/720`

So the fix did not invent source content. It exposed grouped canonical English that already exists upstream and made the child routes inherit it correctly.

## Remaining unresolved issues

- `DN` and `MN` are already clean.
- `SN` still lacks `14` canonical Minh Châu blocks:
  - `sn3.15`
  - `sn35.57`
  - `sn35.59`
  - `sn35.82`
  - `sn36.25`
  - `sn36.30`
  - `sn37.17` through `sn37.24`
- `AN` still lacks `13` canonical Minh Châu blocks:
  - `an9.113-432`
  - `an11.30-69`
  - `an11.70-117`
  - `an11.118-165`
  - `an11.166-213`
  - `an11.214-261`
  - `an11.262-309`
  - `an11.310-357`
  - `an11.358-405`
  - `an11.406-453`
  - `an11.454-501`
  - `an11.502-981`
  - `an11.992-1151`
- `KN` now has complete grouped topology, but still lacks genuine Minh Châu for the whole Dhammapada grouped family and most of the wider collection.
- `SN`, `AN`, and `KN` still keep grouped canonicals inside the raw route inventory for fallback and audit purposes. The public library now hides those grouped fallback rows, so the semantic duplication is no longer exposed in the main UI.
- Those grouped fallback routes are now also off the indexable SEO surface. They still exist as direct routes, but their static HTML and runtime metadata both carry `noindex,nofollow`, and they no longer appear in `dist/sitemap-nikaya*.xml`.

## Verification

- `node scripts/fetch-all-nikayas.mjs grouped kn`
- `npm run audit:nikaya-originals`
- `npm run audit:nikaya-coverage`
- `npm run audit:nikaya-master`
- `npm run audit:nikaya -- sn`
- `npm run audit:nikaya -- an`
- `npm run audit:nikaya -- kn`
- `npm run lint`
- `npm run build`
- `rg -n "sn12\\.72-81|dhp1-20" dist/sitemap-*.xml`
- Browser QA on `http://127.0.0.1:4177/nikaya/sn/sn12.72`
  - route stays canonical as `sn12.72`
  - selector shows `Tiếng Anh - Bhikkhu Sujato`
  - switching to English renders grouped canonical fallback content
- Browser QA on `http://127.0.0.1:4177/nikaya/kn/dhp1`
  - route opens with `Tiếng Anh - Bhikkhu Sujato` selected
  - English content is rendered from `dhp1-20` via fallback
- Browser QA on `http://127.0.0.1:4178/nikaya/sn/sn12.72`
  - page title is `Jātisuttādidasaka • Nhập Lưu`
  - header shows `SN 12.72`, the child title, and the correct blurb from `nikaya_index.json`
- Browser QA on `http://127.0.0.1:4178/nikaya/kn/dhp1`
  - page title is `Phẩm Song yếu • Nhập Lưu`
  - header shows `DHP 1` and `Yamakavagga`, not a blank metadata shell
- Browser QA on `http://127.0.0.1:4178/nikaya/sn`
  - grouped canonical rows are hidden from the public list
  - coverage card now reflects `3024` visible routes, not the raw `3158` topology inventory
- Browser QA on `http://127.0.0.1:4178/nikaya/kn`
  - grouped `dhp1-20` style canonical rows are hidden from the public list
  - coverage card now reflects `694` visible routes, matching the user-facing KN list
- Browser QA on `http://127.0.0.1:4179/nikaya/sn/sn12.72-81`
  - hydrated runtime head keeps `meta[name="robots"] = noindex,nofollow`
  - grouped canonical fallback route stays directly openable but off the indexable surface
- Static QA on [dist/nikaya/sn/sn12.72-81/index.html](/Volumes/SSD/nhapluu/nhapluu-app/dist/nikaya/sn/sn12.72-81/index.html)
  - contains `noindex,nofollow`
- Static QA on [dist/nikaya/kn/dhp1-20/index.html](/Volumes/SSD/nhapluu/nhapluu-app/dist/nikaya/kn/dhp1-20/index.html)
  - contains `noindex,nofollow`
- Static QA on Nikaya sitemaps
  - `sn12.72-81` and `dhp1-20` no longer appear in any `dist/sitemap-*.xml`

## Follow-up fixes on the same branch

- Fixed [scripts/audit-nikaya-triad.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-triad.mjs) so curated manual files such as `sn-56-11.ts` normalize back to `sn56.11` instead of being counted as a fake compact ID.
- Fixed [scripts/generate-nikaya-index.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/generate-nikaya-index.mjs) so title extraction now:
  - rejects blank top-level titles instead of treating them as valid metadata
  - falls through from Vietnamese shells to English files
  - extracts the visible title from Bilara `sutta-title` segments when top-level metadata is empty
  - uses Bilara `root_text` only as a Pali-title fallback
- Regenerated [public/data/suttacentral-json/nikaya_index.json](/Volumes/SSD/nhapluu/nhapluu-app/public/data/suttacentral-json/nikaya_index.json) after the extractor patch.

### Title quality delta

- Blank titles in `nikaya_index.json`: `3323 -> 0`
- Affected family before the fix: all `3323` blanks were in `AN`
- Sample rows now repaired:
  - `an5.308-1152 -> Untitled Discourses on Greed, Etc.`
  - `an9.113-432 -> Untitled Discourses on Hate, Etc.`
  - `an11.30-69 -> Untitled Discourses on the Ear, Etc.`

### Audit delta after the title fix

- `npm run audit:nikaya-integrity`
  - `Index duplicates: 0`
  - `Missing from index: 0`
  - `Ordering defects: 0`
- `npm run audit:nikaya-master`
  - `title mismatches: 0`
  - `Pali title mismatches: 0`
- `node scripts/audit-nikaya-triad.mjs sn`
  - `VI manual 2026: 1/3024`
  - `Complete triad: 1/3024`
- `node scripts/audit-nikaya-triad.mjs an`
  - `VI manual 2026: 0/8122`
- `node scripts/audit-nikaya-triad.mjs kn`
  - `VI manual 2026: 0/694`

## Remote gap verification and KN English repair

- Added [scripts/audit-nikaya-remote-gaps.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-remote-gaps.mjs) plus `npm run audit:nikaya-remote` to probe official SuttaCentral APIs for canonical coverage gaps.
- Patched [src/lib/suttacentralApi.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralApi.ts) so Bilara segment keys are sorted token-aware instead of by `parseFloat`. Remote fallback can no longer place `1.10` before `1.2`.
- Added a `repair` mode to [scripts/fetch-all-nikayas.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/fetch-all-nikayas.mjs):
  - `node scripts/fetch-all-nikayas.mjs repair <collection> <en|vi>`
  - it refetches only files that still lack curated readable content
  - it skips child alias routes already covered by a readable canonical fallback

### Remote truth after probing SuttaCentral

- `SN` missing Minh Châu blocks: `14`
  - upstream result: `14/14 metadata-only`
  - readable upstream: `0`
- `AN` missing Minh Châu blocks: `13`
  - upstream result: `13/13 metadata-only`
  - readable upstream: `0`
- `KN` English canonical gaps before repair: `271`
  - upstream result: `271/271 readable via Bilara`
  - this proved the `KN EN` gap was a local ingestion defect, not an upstream absence
- `KN` Minh Châu canonical gaps after repair: `285`
  - upstream result: `285/285 metadata-only`
  - readable upstream: `0`

### KN English repair delta

- Ran `node scripts/fetch-all-nikayas.mjs repair kn en`
- Repaired English files: `271`
- Skipped child alias routes already covered by canonical fallback: `423`
- Still missing after repair: `0`

### KN coverage delta after repair

- `KN` public-facing English: `423/694 -> 694/694`
- `KN` raw English-readable route files: `26/720 -> 297/720`
- `KN` canonical blocks clean in both languages: `0/297 -> 12/297`
- `KN` canonical blocks missing English: `271 -> 0`
- `KN` now has no remaining English gap. The only unresolved `KN` deficit is Minh Châu plus manual 2026.

### Post-repair verification

- `npm run audit:nikaya-master`
  - `KN visible route EN readable: 694/694`
  - `KN canonical missing EN only: 0`
  - `KN canonical missing VI only: 285`
- `npm run audit:nikaya-integrity`
  - `KN readable EN: 297/720`
- `node scripts/audit-nikaya-triad.mjs kn`
  - `EN original content: 694/694`
- Browser QA on `http://127.0.0.1:4181/nikaya/kn/iti1`
  - page title: `Greed • Nhập Lưu`
  - selector defaults to `Tiếng Anh - Bhikkhu Sujato`
  - article body renders real English content, not a metadata shell
