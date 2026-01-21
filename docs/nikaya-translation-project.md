# Nikaya Translation Project - Pali Canon Retranslation Initiative

> **Project Goal**: Create a dedicated section for high-quality Pali Nikaya translations with comparison between original and improved versions in multiple languages.

## Overview

This is a long-term project to re-translate the entire Pali Canon (Nikaya) into Vietnamese and other major world languages, providing:

1. **Original translations** - Exact text from credible sources (SuttaCentral API)
2. **Improved translations** - Better, easier-to-read translations created by our team

**Key Principles:**
- Completely separate from existing "Kinh Tạng" (Stream Entry suttas)
- Public access (no login required)
- Easy version switching for comparison
- Original texts preserved exactly as from source

---

### 1. Data Storage Strategy
We use a hybrid approach to handle different translation versions:

*   **Original Translations** (e.g., Thích Minh Châu, Bhikkhu Sujato):
    *   **Source**: SuttaCentral API.
    *   **Method**: Bulk fetch using `scripts/fetch-all-nikayas.mjs`.
    *   **Storage**: Cached in `public/data/suttacentral-json/{collection}/` to avoid bundle bloat.
    *   **Access**: Fetched at runtime via `fetch()` using an `available.json` manifest for availability checks.
    *   **Format**: Raw JSON preserving SuttaCentral's structure. Vietnamese (HTML), English (Segmented).
    *   **Reasoning**: Ensures authenticity, preserves original formatting (HTML), and avoids CORS issues at runtime.

*   **Improved Translations** (e.g., NhậpLưu 2026):
    *   **Source**: Created by our team.
    *   **Method**: Manually authored in `src/data/nikaya-improved/`.
    *   **Format**: TypeScript files exporting Markdown strings.
    *   **Reasoning**: Allows for flexible editing, modern formatting, and easy integration with React components.

## Supported Languages & Versions

| Language       | Original Version               | Improved Version | Status    |
| -------------- | ------------------------------ | ---------------- | --------- |
| **English**    | Bhikkhu Sujato (SuttaCentral)  | NhậpLưu 2026     | 🔲 Planned |
| **Vietnamese** | Thích Minh Châu (SuttaCentral) | NhậpLưu 2026     | 🔲 Planned |
| **Chinese**    | 莊春江 (SuttaCentral)          | NhậpLưu 2026     | 🔲 Planned |
| **Spanish**    | Anton P. Baron (SuttaCentral)  | NhậpLưu 2026     | 🔲 Planned |
| **French**     | Christian Maës (SuttaCentral)  | NhậpLưu 2026     | 🔲 Future  |
| **German**     | Sabbamitta (SuttaCentral)      | NhậpLưu 2026     | 🔲 Future  |
| **Japanese**   | 関西パーリ語実習会             | NhậpLưu 2026     | 🔲 Future  |
| **Korean**     | 케마짜라 빅쿠                  | NhậpLưu 2026     | 🔲 Future  |

---

## Data Sources

### SuttaCentral API
- **Base URL**: `https://suttacentral.net/api/`
- **Sutta metadata**: `/api/suttaplex/{suttaId}`
- **Translation text**: `/api/suttas/{suttaId}/{author}?lang={lang}`
- **License**: All texts are open source (CC0, CC BY, etc.)

### Local Improved Translations
- Stored in: `src/data/nikaya-improved/`
- Format: TypeScript files with structured content
- Managed by NhậpLưu translation team

---

## Nikaya Collections

| Collection | Pali Name        | Vietnamese        | English                  | Est. Suttas |
| ---------- | ---------------- | ----------------- | ------------------------ | ----------- |
| DN         | Dīgha Nikāya     | Trường Bộ Kinh    | Long Discourses          | 34          |
| MN         | Majjhima Nikāya  | Trung Bộ Kinh     | Middle Length Discourses | 152         |
| SN         | Saṃyutta Nikāya  | Tương Ưng Bộ Kinh | Connected Discourses     | 2,904       |
| AN         | Aṅguttara Nikāya | Tăng Chi Bộ Kinh  | Numerical Discourses     | 9,557       |
| KN         | Khuddaka Nikāya  | Tiểu Bộ Kinh      | Minor Collection         | 15+ books   |

**Total**: ~12,700+ suttas (long-term goal)

---

## Phase 1: Foundation (Current)

### Priority Suttas (10 Key Suttas)

| #   | Code     | Pali Title             | Vietnamese             | Priority |
| --- | -------- | ---------------------- | ---------------------- | -------- |
| 1   | MN 10    | Satipaṭṭhāna Sutta     | Kinh Niệm Xứ           | 🔴 High   |
| 2   | DN 22    | Mahāsatipaṭṭhāna Sutta | Kinh Đại Niệm Xứ       | 🔴 High   |
| 3   | MN 118   | Ānāpānasati Sutta      | Kinh Quán Niệm Hơi Thở | 🔴 High   |
| 4   | SN 56.11 | Dhammacakkappavattana  | Kinh Chuyển Pháp Luân  | 🔴 High   |
| 5   | MN 2     | Sabbāsava Sutta        | Kinh Tất Cả Lậu Hoặc   | 🟡 Medium |
| 6   | DN 16    | Mahāparinibbāna Sutta  | Kinh Đại Bát Niết Bàn  | 🟡 Medium |
| 7   | SN 22.59 | Anattalakkhaṇa Sutta   | Kinh Vô Ngã Tướng      | 🟡 Medium |
| 8   | AN 3.65  | Kālāma Sutta           | Kinh Kālāma            | 🟡 Medium |
| 9   | MN 9     | Sammādiṭṭhi Sutta      | Kinh Chánh Kiến        | 🟢 Normal |
| 10  | DN 31    | Sigālovāda Sutta       | Kinh Giáo Huấn Singala | 🟢 Normal |

### Technical Implementation

```
src/
├── pages/
│   ├── NikayaLibrary.tsx      # Main listing page
│   └── NikayaDetail.tsx       # Sutta detail with version switcher
├── components/
│   ├── NikayaVersionSwitcher.tsx
│   └── NikayaComparisonView.tsx
├── lib/
│   └── suttacentralApi.ts     # API integration
├── data/
│   └── nikaya-improved/       # Improved translations
│       ├── vi/                # Vietnamese improved
│       ├── en/                # English improved
│       ├── zh/                # Chinese improved
│       └── es/                # Spanish improved
└── types/
    └── nikaya.ts              # Type definitions
```

### Routes

| Route              | Page          | Auth   |
| ------------------ | ------------- | ------ |
| `/nikaya`          | NikayaLibrary | Public |
| `/nikaya/:suttaId` | NikayaDetail  | Public |

---

## Phase 2: Vietnamese Translation

Focus on Vietnamese as primary language:
- [ ] Complete 10 priority suttas (original + improved)
- [ ] Add 50 more popular suttas
- [ ] Community review process
- [ ] Scholarly validation

---

## Phase 3: Multi-language Expansion

- [ ] English improved translations
- [ ] Chinese improved translations  
- [ ] Spanish improved translations
- [ ] Translation contribution system

---

## Phase 4: Complete Canon

Long-term goal (1-3 years):
- [ ] Full MN (152 suttas)
- [ ] Full DN (34 suttas)
- [ ] Key SN/AN selections
- [ ] Tiểu Bộ highlights

---

## User Interface Design

### Version Switcher

```
┌─────────────────────────────────────────────────┐
│  📖 MN 10 - Kinh Niệm Xứ                        │
│  Satipaṭṭhāna Sutta                             │
├─────────────────────────────────────────────────┤
│  Version: [▼ Vietnamese - Thích Minh Châu    ]  │
│           [ ] Vietnamese - NhậpLưu 2026         │
│           [ ] English - Bhikkhu Sujato          │
│           [ ] English - NhậpLưu 2026            │
├─────────────────────────────────────────────────┤
│  View Mode: ○ Single   ● Compare                │
└─────────────────────────────────────────────────┘
```

### Comparison View

```
┌──────────────────────┬──────────────────────┐
│ Vietnamese Original  │ Vietnamese 2026      │
├──────────────────────┼──────────────────────┤
│ Thích Minh Châu      │ NhậpLưu Translation  │
│                      │                      │
│ "Này các Tỷ-kheo,    │ "Này các vị tỳ-kheo, │
│ đây là con đường     │ đây chính là con     │
│ độc nhất..."         │ đường duy nhất..."   │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

---

## Translation Guidelines

### Improved Version Principles

1. **Clarity**: Modern Vietnamese/English that's easier to understand
2. **Accuracy**: Maintain meaning from Pali original
3. **Consistency**: Standardized terminology across all suttas
4. **Accessibility**: Avoid archaic language, add context where needed

### Terminology Standardization

| Pali         | Thích Minh Châu | Improved 2026             |
| ------------ | --------------- | ------------------------- |
| satipaṭṭhāna | niệm xứ         | nền tảng chánh niệm       |
| dukkha       | khổ             | khổ đau / bất toại nguyện |
| saṅkhāra     | hành            | sự tạo tác / cấu thành    |
| vipassanā    | tuệ quán        | thiền tuệ / minh sát      |

---

## Progress Tracking

### Phase 1 Checklist

- [ ] Create `NikayaLibrary.tsx` page
- [ ] Create `NikayaDetail.tsx` page  
- [ ] Implement SuttaCentral API service
- [ ] Build version switcher component
- [ ] Build comparison view component
- [ ] Add public routes
- [ ] Create MN 10 improved Vietnamese translation
- [ ] Create DN 22 improved Vietnamese translation
- [ ] Create MN 118 improved Vietnamese translation
- [ ] Create SN 56.11 improved Vietnamese translation
- [ ] Add navigation menu item
- [ ] Mobile responsive design
- [ ] Testing and QA

---

## Related Links

- [SuttaCentral](https://suttacentral.net/) - Primary data source
- [Thích Minh Châu Translations](https://suttacentral.net/editions/vn/vi/mn?author=minh_chau)
- [Bhikkhu Sujato Translations](https://suttacentral.net/editions/pli-en)

---

## Changelog

| Date       | Update                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 2026-01-21 | Initial project plan created                                                                                       |
| 2026-01-21 | Phase 1 implementation complete: NikayaLibrary, NikayaDetail pages, version switcher, comparison view              |
| 2026-01-21 | Note: SuttaCentral API has CORS restrictions - local improved translations work, original texts need backend proxy |
