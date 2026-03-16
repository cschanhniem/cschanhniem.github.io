# 2026-03-16 Nikaya Integrity Audit

## Goal

Rà toàn bộ kho Nikaya để xác định:

- thứ tự trong `nikaya_index.json` có đúng chưa
- còn bài nào thiếu trong index hay manifest không
- có bài nào thừa, sai collection, hay lệch metadata không
- English gốc và bản HT. Thích Minh Châu còn thiếu ở đâu

## Work Completed

1. Sửa `scripts/generate-nikaya-index.mjs` để:
   - sắp xếp ID theo thứ tự tự nhiên
   - lấy `file id` làm route id thay vì vô tình nuốt mất route đầu dải do `suttaplex.uid`
2. Sinh lại `public/data/suttacentral-json/nikaya_index.json`.
3. Sinh lại `available.json` và `content-availability.json`.
4. Thêm `scripts/audit-nikaya-integrity.mjs` và script npm `audit:nikaya-integrity`.
5. Chạy audit tổng quát và audit triad từng collection bị ảnh hưởng.

## Final Integrity State

- `Index ids`: `12255`
- `Available ids`: `12255`
- `Content ids`: `10141`
- `Index duplicates`: `0`
- `Missing from index`: `0`
- `Missing from available`: `0`
- `Misplaced files`: `0`
- `Manifest content mismatches`: `0`
- `Ordering defects`: `0`

## Collection Summary

- `DN`: `34` route, English `34/34`, Minh Châu `34/34`
- `MN`: `152` route, English `152/152`, Minh Châu `152/152`
- `SN`: `3158` route, English `1819/3158`, Minh Châu `3144/3158`
- `AN`: `8217` route, English `1408/8217`, Minh Châu `6772/8217`
- `KN`: `694` route, English `0/694`, Minh Châu `12/694`

## Important Findings

- `SN` and `AN` were previously sorted incorrectly in the library index because `parseFloat` collapsed IDs like `sn1.10` and `sn1.1`.
- The index previously dropped some real routes at range boundaries, such as `an1.100`, `sn12.100`, and several `dhp*` items.
- `KN` no longer shows phantom grouped `Dhp` range IDs in the generated index when no real grouped file exists on disk.
- A large alias layer remains in local source files:
  - `SN alias ids`: `1339`
  - `AN alias ids`: `6809`
  - `KN alias ids`: `423`

## Interpretation

- The repository is now structurally coherent at the index and manifest layer.
- The remaining incompleteness is no longer an index bug. It is a source-content problem:
  - `SN` and `AN` still depend heavily on grouped Bilara aliases.
  - `KN` still lacks readable English almost entirely, and readable Minh Châu is sparse.

## Recommended Next Step

Build a second-stage audit for alias IDs that groups them by canonical `suttaplex.uid`, so the app can explicitly distinguish:

- true local single-sutta content
- grouped fallback content returned under single-file aliases
