# NhapLuu App v6.0 - Improvement Plan

> Kế hoạch phát triển từ Founder NhapLuu
> Ngày: 2026-01-18
> Phiên bản: v6.0 "Discovery Release"

## Tầm nhìn v6.0

Tập trung vào **khám phá và tìm kiếm nội dung** để người dùng dễ dàng tìm được giáo lý phù hợp:
- Full-text search trong Kinh Tạng
- Bookmarks page để xem tất cả đánh dấu
- Continue Reading - tiếp tục đọc từ nơi dừng lại
- Filter by collection (DN/MN/SN/AN/KN)
- Related suttas suggestions

---

## Phase 1: Full-text Search (Priority: High)

### 1.1 Search Infrastructure
- [ ] Create search index from sutta content
- [ ] Implement fuzzy search matching
- [ ] Search in both title and content
- [ ] Highlight matching text in results

### 1.2 Search UI
- [ ] Enhanced search bar with real-time suggestions
- [ ] Search results page with snippets
- [ ] Filter results by collection/difficulty
- [ ] Recent searches history

---

## Phase 2: Bookmarks Enhancement

### 2.1 Bookmarks Page
- [ ] Create /danh-dau route for bookmarks
- [ ] List all bookmarked suttas with metadata
- [ ] Remove bookmark action
- [ ] Sort by date added

### 2.2 Reading History
- [ ] Track last read suttas
- [ ] "Continue Reading" section on Dashboard
- [ ] Show reading progress percentage
- [ ] Quick access to recently read

---

## Phase 3: Library Filtering

### 3.1 Collection Filters
- [ ] Filter buttons for DN, MN, SN, AN, KN
- [ ] Show sutta count per collection
- [ ] Combined filter with difficulty
- [ ] Clear all filters button

### 3.2 Discovery Features
- [ ] "Related Suttas" based on themes
- [ ] "You might also like" suggestions
- [ ] Popular/trending suttas
- [ ] Daily sutta recommendation

---

## Technical Implementation

### New Components
- `src/pages/Bookmarks.tsx`
- `src/components/library/SearchBar.tsx`
- `src/components/library/SearchResults.tsx`
- `src/components/library/CollectionFilter.tsx`

### Data Structure Updates
```typescript
interface ReadingHistory {
  suttaId: string
  progress: number
  lastRead: string
  timeSpent: number // seconds
}

interface AppState {
  // Existing...
  readingHistory: ReadingHistory[]
  recentSearches: string[]
}
```

### Routes
```typescript
// New routes
'/danh-dau' - Bookmarks page
'/tim-kiem?q=...' - Search results
```

---

## Implementation Priority

| Task | Priority | Impact | Effort |
|------|----------|--------|--------|
| Search infrastructure | P0 | High | Medium |
| Search UI | P0 | High | Low |
| Bookmarks page | P1 | Medium | Low |
| Continue Reading | P1 | High | Low |
| Collection filters | P1 | Medium | Low |
| Related suttas | P2 | Medium | Medium |

---

## Immediate Next Steps

1. **Today**: Create search index and search bar
2. **Day 2**: Build bookmarks page and reading history
3. **Day 3**: Add collection filters to Library
4. **Day 4**: Implement Continue Reading on Dashboard
5. **Day 5**: Testing & polish

---

## Success Metrics

- [ ] Search returns results < 100ms
- [ ] All bookmarks accessible in 1 click
- [ ] Continue Reading shows on Dashboard
- [ ] Users can filter by all 5 collections

---

*Sādhu! Sādhu! Sādhu!*
*Con đường Bát Chánh Đạo - The Noble Eightfold Path*

— NhapLuu Founder
