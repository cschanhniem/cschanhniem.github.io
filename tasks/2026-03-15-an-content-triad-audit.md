# AN Content Triad Audit

Date: 2026-03-15

## Scope

- Audit `/nikaya/an` against the three-layer requirement:
- English original content
- Vietnamese HT. Thich Minh Chau
- Vietnamese manual 2026

## Work Completed

- Ran `node scripts/fetch-all-nikayas.mjs an` to backfill local AN JSON from SuttaCentral.
- Rebuilt `content-availability.json` through the fetch pipeline.
- Audited coverage with `npm run audit:nikaya -- an`.

## Findings

- `AN total`: `8208`
- `EN original content`: `1408/8208`
- `VI Minh Chau content`: `6765/8208`
- `VI manual 2026`: `0/8208`
- `Complete triad`: `0/8208`

## Notes

- AN improved from the pre-backfill baseline of `0/8122` English and `6608/8122` Minh Chau.
- The refreshed local index now exposes grouped AN range IDs, which is why the audited total is `8208`.
- AN still does not satisfy the full triad because there are no `src/data/nikaya-improved/vi/an*.ts` manual files yet.

## Release Impact

- `/nikaya/an` now reports materially better real-content coverage.
- The app still must not claim that every AN sutta has a manual 2026 version.
