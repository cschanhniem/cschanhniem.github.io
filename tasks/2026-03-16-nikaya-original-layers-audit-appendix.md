# 2026-03-16 Nikaya original layers audit appendix

## Scope

Appendix này ghi lại danh sách lỗi theo ID hoặc theo block canonical, nhằm trả lời dứt điểm bốn câu hỏi:

- bài nào thiếu nội dung thật
- bài nào thừa về topology
- bài nào sai provenance
- bài nào sai điều hướng `previous` và `next`

## Clean collections

### DN

- `34/34` English readable
- `34/34` Việt Minh Châu readable
- `0` alias
- `0` nav defects

### MN

- `152/152` English readable
- `152/152` Việt Minh Châu readable
- `0` alias
- `0` nav defects

## SN

### Missing Vietnamese readable content

These are the full `14` SN routes still unreadable in Vietnamese and also missing canonical navigation metadata:

- `sn3.15`
- `sn35.57`
- `sn35.59`
- `sn35.82`
- `sn36.25`
- `sn36.30`
- `sn37.17`
- `sn37.18`
- `sn37.19`
- `sn37.20`
- `sn37.21`
- `sn37.22`
- `sn37.23`
- `sn37.24`

### English alias topology

- `1339` English child routes are unreadable because they are alias placeholders.
- They collapse into `134` grouped canonical range routes already present in the index.
- There are `0` alias target misses.
- There are `0` alias range violations.

This means `SN` is not missing grouped canonicals. It is over-specified because the canonical ranges and the child aliases coexist in the inventory.

### Full SN grouped canonical families

Each line is `canonical-range: child-alias-count`.

```text
sn12.72-81:10
sn12.83-92:10
sn12.93-213:121
sn17.13-20:8
sn17.38-43:6
sn18.12-20:9
sn23.23-33:11
sn23.35-45:11
sn24.20-35:16
sn24.46-69:24
sn24.72-95:24
sn29.11-20:10
sn29.21-50:30
sn30.4-6:3
sn30.7-16:10
sn30.17-46:30
sn31.4-12:9
sn31.13-22:10
sn31.23-112:90
sn32.3-12:10
sn32.13-52:40
sn33.6-10:5
sn33.11-15:5
sn33.16-20:5
sn33.21-25:5
sn33.26-30:5
sn33.31-35:5
sn33.36-40:5
sn33.41-45:5
sn33.46-50:5
sn33.51-54:4
sn34.20-27:8
sn34.28-34:7
sn34.35-40:6
sn34.41-45:5
sn34.46-49:4
sn34.50-52:3
sn34.53-54:2
sn35.33-42:10
sn35.43-51:9
sn35.171-173:3
sn35.174-176:3
sn35.177-179:3
sn35.180-182:3
sn35.183-185:3
sn35.189-191:3
sn35.192-194:3
sn35.195-197:3
sn35.198-200:3
sn35.201-203:3
sn35.207-209:3
sn35.210-212:3
sn35.213-215:3
sn35.216-218:3
sn35.219-221:3
sn39.1-15:15
sn43.14-43:30
sn45.42-47:6
sn45.50-54:5
sn45.57-61:5
sn45.64-68:5
sn45.71-75:5
sn45.78-82:5
sn45.85-89:5
sn45.92-95:4
sn45.98-102:5
sn45.104-108:5
sn45.110-114:5
sn45.116-120:5
sn45.122-126:5
sn45.128-132:5
sn45.134-138:5
sn45.141-145:5
sn45.146-148:3
sn46.77-88:12
sn46.89-98:10
sn46.99-110:12
sn46.111-120:10
sn46.121-129:9
sn46.131-142:12
sn46.143-152:10
sn46.153-164:12
sn46.165-174:10
sn46.175-184:10
sn47.51-62:12
sn47.63-72:10
sn47.73-84:12
sn47.85-94:10
sn47.95-104:10
sn48.71-82:12
sn48.83-92:10
sn48.93-104:12
sn48.105-114:10
sn48.115-124:10
sn48.125-136:12
sn48.137-146:10
sn48.147-158:12
sn48.159-168:10
sn48.169-178:10
sn49.1-12:12
sn49.13-22:10
sn49.23-34:12
sn49.35-44:10
sn49.45-54:10
sn50.1-12:12
sn50.13-22:10
sn50.23-34:12
sn50.35-44:10
sn50.45-54:10
sn50.55-66:12
sn50.67-76:10
sn50.77-88:12
sn50.89-98:10
sn50.99-108:10
sn51.33-44:12
sn51.45-54:10
sn51.55-66:12
sn51.67-76:10
sn51.77-86:10
sn53.1-12:12
sn53.13-22:10
sn53.23-34:12
sn53.35-44:10
sn53.45-54:10
sn56.96-101:6
sn56.105-107:3
sn56.108-110:3
sn56.111-113:3
sn56.114-116:3
sn56.117-119:3
sn56.120-122:3
sn56.123-125:3
sn56.126-128:3
sn56.129-130:2
```

## AN

### Missing Vietnamese readable content by canonical block

All `1445` unreadable Vietnamese AN routes collapse into these `13` canonical blocks:

- `an9.113-432` → `321` unreadable routes
- `an11.30-69` → `41` unreadable routes
- `an11.70-117` → `49` unreadable routes
- `an11.118-165` → `49` unreadable routes
- `an11.166-213` → `49` unreadable routes
- `an11.214-261` → `49` unreadable routes
- `an11.262-309` → `49` unreadable routes
- `an11.310-357` → `49` unreadable routes
- `an11.358-405` → `49` unreadable routes
- `an11.406-453` → `49` unreadable routes
- `an11.454-501` → `49` unreadable routes
- `an11.502-981` → `481` unreadable routes
- `an11.992-1151` → `161` unreadable routes

### Canonical navigation defects

These same `13` canonical blocks are the full AN list whose `previous` and `next` metadata are missing:

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

### English alias topology

- `6809` English child routes are unreadable because they are alias placeholders.
- They collapse into `95` grouped canonical range routes already present in the index.
- There are `0` alias target misses.
- There are `0` alias range violations.

This means `AN` is not missing grouped canonicals. It is over-specified in the same way as `SN`.

### Full AN grouped canonical families

Each line is `canonical-range: child-alias-count`.

```text
an1.1-10:10
an1.11-20:10
an1.21-30:10
an1.31-40:10
an1.41-50:10
an1.51-60:10
an1.61-70:10
an1.71-81:11
an1.82-97:16
an1.98-139:42
an1.140-149:10
an1.150-169:20
an1.170-187:18
an1.188-197:10
an1.198-208:11
an1.209-218:10
an1.219-234:16
an1.235-247:13
an1.248-257:10
an1.258-267:10
an1.268-277:10
an1.278-286:9
an1.287-295:9
an1.296-305:10
an1.306-315:10
an1.316-332:17
an1.333-377:45
an1.378-393:16
an1.394-574:181
an1.575-615:41
an1.616-627:12
an2.1-10:10
an2.11-20:10
an2.21-31:11
an2.32-41:10
an2.42-51:10
an2.52-63:12
an2.64-76:13
an2.77-86:10
an2.87-97:11
an2.98-117:20
an2.118-129:12
an2.130-140:11
an2.141-150:10
an2.151-162:12
an2.163-179:17
an2.180-229:50
an2.230-279:50
an2.280-309:30
an2.310-479:170
an3.156-162:7
an3.163-182:20
an3.183-352:170
an4.277-303:27
an4.304-783:480
an5.257-263:7
an5.265-271:7
an5.273-285:13
an5.287-292:6
an5.294-302:9
an5.308-1152:845
an6.120-139:20
an6.143-169:27
an6.170-649:480
an7.96-614:519
an7.618-644:27
an7.645-1124:480
an8.91-117:27
an8.121-147:27
an8.148-627:480
an9.74-81:8
an9.84-91:8
an9.95-112:18
an9.113-432:320
an10.156-166:11
an10.199-210:12
an10.225-228:4
an10.229-232:4
an10.233-236:4
an10.240-266:27
an10.267-746:480
an11.22-29:8
an11.30-69:40
an11.70-117:48
an11.118-165:48
an11.166-213:48
an11.214-261:48
an11.262-309:48
an11.310-357:48
an11.358-405:48
an11.406-453:48
an11.454-501:48
an11.502-981:480
an11.983-991:9
an11.992-1151:160
```

## KN

### Missing canonical routes in the index

These `26` Dhammapada grouped canonical ranges are missing from `nikaya_index.json`, even though `423` child routes point to them:

- `dhp1-20`
- `dhp21-32`
- `dhp33-43`
- `dhp44-59`
- `dhp60-75`
- `dhp76-89`
- `dhp90-99`
- `dhp100-115`
- `dhp116-128`
- `dhp129-145`
- `dhp146-156`
- `dhp157-166`
- `dhp167-178`
- `dhp179-196`
- `dhp197-208`
- `dhp209-220`
- `dhp221-234`
- `dhp235-255`
- `dhp256-272`
- `dhp273-289`
- `dhp290-305`
- `dhp306-319`
- `dhp320-333`
- `dhp334-359`
- `dhp360-382`
- `dhp383-423`

### Vietnamese provenance defects

- `423` files named `*_vi_minh_chau.json` map to these missing Dhammapada ranges.
- Their source metadata points to `phantuananh`, not `minh_chau`.
- They must not be counted as Minh Châu coverage.

### Vietnamese readable routes

These are the only `12` KN routes that currently read as real Minh Châu content:

- `kp1`
- `kp2`
- `kp3`
- `kp4`
- `kp5`
- `kp6`
- `kp7`
- `kp8`
- `kp9`
- `snp1.8`
- `snp2.4`
- `snp3.7`

### English readable coverage

- `0/694` KN English routes are locally readable.
- The unreadable set breaks down as:
  - `dhp`: `423`
  - `iti`: `112`
  - `kp`: `9`
  - `snp`: `70`
  - `ud`: `80`

### Vietnamese unreadable coverage

- `682/694` KN Vietnamese routes are unreadable.
- The unreadable set breaks down as:
  - `dhp`: `423`
  - `iti`: `112`
  - `snp`: `67`
  - `ud`: `80`

### Navigation defects

Canonical `previous` metadata is missing across almost the whole non-Dhammapada KN spine:

- `iti2` through `iti112`
- `kp1`
- almost the entire `snp` set from `snp1.1` through `snp5.16`
- all `ud1.1` through `ud8.10`

Canonical `next` metadata is missing across the same shape:

- `iti1` through `iti112`
- `kp9`
- almost the entire `snp` set from `snp1.1` through `snp5.16`
- all `ud1.1` through `ud8.9`

### Topology conclusion

`KN` is not merely duplicated. It is genuinely under-indexed:

- `0` grouped range routes in the index
- `26` alias families missing their canonical targets
- `423` child routes missing a canonical route to land on
- `0` alias range violations

## Final interpretation

- `DN` and `MN` are complete and coherent.
- `SN` and `AN` are structurally coherent but topologically duplicated and textually incomplete.
- `KN` is both textually incomplete and structurally under-indexed.
