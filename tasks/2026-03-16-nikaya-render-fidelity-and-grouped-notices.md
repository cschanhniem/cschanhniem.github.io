# 2026-03-16 Nikaya render fidelity and grouped notices

## Goal

Đi tiếp từ lớp audit “đọc được hay không” sang lớp khó hơn:

- route nào thật sự đang hiển thị đúng từng bài
- route nào chỉ đang cắt đúng phần của một grouped source
- route nào vẫn còn phải hiển thị nguyên block gộp
- vá các lỗi runtime khiến một số route `KN` như `snp1.1` bị suy luận nhầm collection

## Work completed

- Updated [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts) to:
  - resolve local originals through a richer `resolveLocalOriginalContent()` contract
  - classify each original render as `exact`, `scoped-grouped`, `opaque-grouped`, or `missing`
  - scope grouped Bilara content in two passes:
    - direct child-prefix keys like `an1.2:*`
    - range-position sections like `sn12.72-81:1.1`
  - fix collection inference so `snp*` resolves to `kn` before the generic `sn` branch
- Updated [src/pages/NikayaDetail.tsx](/Volumes/SSD/nhapluu/nhapluu-app/src/pages/NikayaDetail.tsx) so original versions now surface grouped-source notices instead of silently implying exact per-sutta coverage.
- Added [src/lib/nikaya-source-gaps.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/nikaya-source-gaps.ts) as the verified source-gap registry for original layers that are still absent after source inspection.
- Exported `getCanonicalAliasForLanguage()` from [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts) so the reader can map an alias route such as `an11.30` back to its missing canonical block `an11.30-69`.
- Updated [src/pages/NikayaDetail.tsx](/Volumes/SSD/nhapluu/nhapluu-app/src/pages/NikayaDetail.tsx) again so the coverage card now surfaces verified source-gap notices for unavailable originals, instead of only saying that a layer is missing.
- Updated [src/components/NikayaComparisonView.tsx](/Volumes/SSD/nhapluu/nhapluu-app/src/components/NikayaComparisonView.tsx) so comparison mode shows the same notices on each column.
- Added locale copy in [src/locales/vi/common.json](/Volumes/SSD/nhapluu/nhapluu-app/src/locales/vi/common.json) and [src/locales/en/common.json](/Volumes/SSD/nhapluu/nhapluu-app/src/locales/en/common.json) for `scoped-grouped` vs `opaque-grouped` warnings.
- Added more locale copy in [src/locales/vi/common.json](/Volumes/SSD/nhapluu/nhapluu-app/src/locales/vi/common.json) and [src/locales/en/common.json](/Volumes/SSD/nhapluu/nhapluu-app/src/locales/en/common.json) for verified source-gap explanations such as `SN 36.30`, the `AN 11.*` peyyala ranges, and the English gap `an1.330-332`.
- Added [scripts/audit-nikaya-render-fidelity.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-render-fidelity.mjs) and `npm run audit:nikaya-fidelity` to classify visible routes by render quality.
- Extended [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts) again so grouped Minh Châu HTML can scope by `TTC` ranges after exact child IDs and nested subrange IDs fail.
- Tightened Bilara key scanning in [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts), [scripts/fetch-all-nikayas.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/fetch-all-nikayas.mjs), and [scripts/audit-nikaya-render-fidelity.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-render-fidelity.mjs) so metadata keys like `uid`, `lang`, and `title` are never mistaken for segment content.
- Tightened [scripts/audit-nikaya-remote-gaps.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-remote-gaps.mjs) with the same rule, which removed a false upstream-readability signal for `an1.330-332`.
- Extended [scripts/audit-nikaya-remote-gaps.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-remote-gaps.mjs) so it now reports both canonical gaps and visible-route gaps. This surfaces `an1.330-332` explicitly instead of letting them hide behind the readable canonical block `an1.316-332`.
- Extended [scripts/audit-nikaya-master.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-master.mjs) with visible-route fidelity lines and visible missing samples, so the consolidated report now names route-level holes directly.
- Extended [scripts/audit-nikaya-master.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-master.mjs) again so it now prints upstream status lines from `audit-nikaya-remote-gaps.mjs`. The master audit can now say, in one place, whether a gap is still locally missing and whether upstream is readable, metadata-only, or absent.
- Tightened `TTC` scoping in [src/lib/suttacentralLocal.ts](/Volumes/SSD/nhapluu/nhapluu-app/src/lib/suttacentralLocal.ts) and [scripts/audit-nikaya-render-fidelity.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-render-fidelity.mjs) again so a grouped Minh Châu route is only marked `scoped-grouped` when the discovered `TTC` ranges cover the full grouped source contiguously from `1..N`. Ambiguous blocks like `an1.333-377`, `an2.21-31`, and `an2.280-309` now stay `opaque-grouped` instead of being over-sliced.
- Extended [scripts/audit-nikaya-master.mjs](/Volumes/SSD/nhapluu/nhapluu-app/scripts/audit-nikaya-master.mjs) one more time so it surfaces upstream `network-error` counts and samples instead of silently collapsing them into `0/0/0`.
- Updated [package.json](/Volumes/SSD/nhapluu/nhapluu-app/package.json), [AGENTS.md](/Volumes/SSD/nhapluu/nhapluu-app/AGENTS.md), and [SKILL.md](/Volumes/SSD/nhapluu/nhapluu-app/SKILL.md) so future agents distinguish “readable” from “route-exact”.

## Result

### Reader behavior

- `AN` English grouped children such as `an1.2` now render the exact child discourse body from grouped source `an1.1-10`.
- `SN` English grouped children such as `sn12.72` now render the exact child slice from grouped source `sn12.72-81` via range-position scoping.
- `KN` routes under `Snp` now resolve to the `kn` data folder correctly. `snp1.1` renders clean English content again.
- `AN` grouped Minh Châu blocks such as `an1.1-10`, `an1.98-139`, and `an1.316-332` now scope by `TTC` ranges when that mapping is trustworthy. Routes like `an1.4` can now avoid dumping the full grouped block, while ambiguous blocks such as `an1.333-377` intentionally remain opaque.
- Opaque grouped originals are no longer silent. The reader states clearly when it is showing an entire grouped block rather than a clean single-sutta extraction.
- False-positive segment scans are gone. Canonical Bilara files without real `:` segment keys no longer masquerade as child-route coverage.

### Render fidelity truth set

From `npm run audit:nikaya-fidelity`:

- `DN`
  - `EN exact: 34/34`
  - `VI exact: 34/34`
- `MN`
  - `EN exact: 152/152`
  - `VI exact: 152/152`
- `SN`
  - `EN exact: 1685/3024`
  - `EN scoped-grouped: 1339/3024`
  - `EN opaque-grouped: 0/3024`
  - `EN missing: 0/3024`
  - `VI exact: 1671/3024`
  - `VI scoped-grouped: 277/3024`
  - `VI opaque-grouped: 1062/3024`
  - `VI missing: 14/3024`
- `AN`
  - `EN exact: 1313/8122`
  - `EN scoped-grouped: 6806/8122`
  - `EN opaque-grouped: 0/8122`
  - `EN missing: 3/8122`
  - `VI exact: 1313/8122`
  - `VI scoped-grouped: 467/8122`
  - `VI opaque-grouped: 4910/8122`
  - `VI missing: 1432/8122`
- `KN`
  - `EN exact: 271/694`
  - `EN scoped-grouped: 423/694`
  - `EN opaque-grouped: 0/694`
  - `EN missing: 0/694`
  - `VI exact: 12/694`
  - `VI missing: 682/694`

### Meaning of the new counts

- `exact` means the route renders its own single-sutta original cleanly.
- `scoped-grouped` means the original comes from a grouped source, but the app is now slicing the exact child portion correctly.
- For Minh Châu HTML, `scoped-grouped` can also mean the closest trustworthy `TTC` chunk inside a grouped range, such as `TTC 14-17` inside `an1.316-332`.
- The later `TTC` tightening is a correctness fix, not a regression. It removed overconfident slices where the labels did not span the whole grouped source from `1..N`, so some `AN` routes moved back from `scoped-grouped` to `opaque-grouped`.
- `opaque-grouped` means the route still depends on a grouped source that cannot yet be separated safely, so the reader shows the whole grouped block with an explicit warning.
- `missing` means there is still no readable local original for that visible route.
- `AN` English still has `3` visible-route gaps: `an1.330`, `an1.331`, and `an1.332`. After fixing remote-gap classification, both Bilara and legacy API prove these are `metadata-only` upstream, not just a local ingest miss.
- `SN` Minh Châu still has `14` visible-route gaps, and `npm run audit:nikaya-remote sn` now confirms all `14/14` are `metadata-only` upstream as well.
- After the source-backed backfill pass, `SN` Minh Châu is now down to one verified gap only: `sn36.30`. The reader now states explicitly that this gap comes from the source edition itself, not from a local ingest miss.
- `AN 9.113-432` is now locally backfilled from the verified Minh Châu source, so the unresolved Minh Châu hole is concentrated entirely in the `AN 11.*` peyyala canonicals.
- The `AN 11.*` reader surface now explains the real state: the verified Minh Châu source stops at `AN 11.25`, so routes such as `an11.30`, `an11.214`, or `an11.502` are not missing because of a parser defect.
- `AN` English gaps `an1.330-332` are now labeled as upstream digitization gaps rather than generic missing content. The grouped English file `an1.316-332` really stops at `an1.329`.
- The 5-bộ consolidated truth set now reads cleanly in one command:
  - `DN`: no visible or canonical gaps
  - `MN`: no visible or canonical gaps
  - `SN`: `1` visible VI gap `sn36.30`, now source-verified
  - `AN`: `3` visible EN gaps `an1.330-332`, plus `12` canonical VI gaps in `AN 11.*`, all now explained as verified source gaps rather than silent absence
  - `KN`: no EN gaps on the visible surface, but `285` canonical VI gaps, all `metadata-only` upstream

## Verification

- `npm run lint`
- `npm run build`
- `npm run audit:nikaya-master`
- `npm run audit:nikaya-fidelity`
- `npm run audit:nikaya-remote an`
- `npm run audit:nikaya-remote sn`
- `node scripts/audit-nikaya-master.mjs an`
- `node scripts/audit-nikaya-master.mjs`
- Browser QA on [http://127.0.0.1:4185/nikaya/an/an1.2](http://127.0.0.1:4185/nikaya/an/an1.2)
  - `Tiếng Việt - Thích Minh Châu` shows an `opaque-grouped` warning and still displays the full `AN 1.1-10` block
  - `Tiếng Anh - Bhikkhu Sujato` shows a `scoped-grouped` warning and renders only discourse `2`
- Browser QA on [http://127.0.0.1:4185/nikaya/sn/sn12.72](http://127.0.0.1:4185/nikaya/sn/sn12.72)
  - `Tiếng Anh - Bhikkhu Sujato` shows a `scoped-grouped` warning and renders only the child slice for `SN 12.72`
- Browser QA on [http://127.0.0.1:4185/nikaya/kn/snp1.1](http://127.0.0.1:4185/nikaya/kn/snp1.1)
  - route resolves through `KN`, not `SN`
  - English content renders cleanly with no grouped warning
- Browser QA via Playwright MCP was blocked by an existing Chrome persistent session in this environment, so final verification for the newest `TTC` slicing pass relied on the route-level fidelity audit, local HTML-source inspection, and targeted SuttaCentral API probes instead of live page snapshots.
- A later upstream verification pass had to rerun `node scripts/audit-nikaya-remote-gaps.mjs` outside the sandbox, because the sandboxed run collapsed all probes into `network-error`. `audit-nikaya-master.mjs` now exposes that state instead of hiding it.
