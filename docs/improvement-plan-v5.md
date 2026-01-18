# NhapLuu App v5.0 - Improvement Plan

> Kế hoạch phát triển từ Founder NhapLuu
> Ngày: 2026-01-18
> Phiên bản: v5.0 "Immersive Release"

## Tầm nhìn v5.0

Nâng cao trải nghiệm thực hành với **môi trường thiền định immersive** và **Kinh Tạng song ngữ**:
- Ambient sounds (mưa, rừng, chuông chùa) cho thiền định
- Sutta Library với parallel text (Pāli/Việt)
- Reading progress tracking
- Improved search và discovery
- Performance optimizations

---

## Phase 1: Ambient Sounds (Priority: High)

### 1.1 Sound Library
- [ ] Rain (mưa nhẹ, mưa rào)
- [ ] Forest (tiếng chim, gió lá)
- [ ] Temple bells (chuông chùa)
- [ ] Stream/Water (suối chảy)
- [ ] Silence (không âm thanh)

### 1.2 Audio Player Component
- [ ] Volume control slider
- [ ] Sound selection UI
- [ ] Persist sound preference
- [ ] Seamless loop playback
- [ ] Fade in/out transitions

### 1.3 Integration with Timer
- [ ] Auto-start sound with meditation
- [ ] Auto-fade out at completion
- [ ] Independent volume from bell

---

## Phase 2: Enhanced Sutta Library

### 2.1 Parallel Text Display
- [ ] Side-by-side Pāli + Vietnamese layout
- [ ] Toggle between views (parallel/single)
- [ ] Responsive design for mobile
- [ ] Sync scroll between columns

### 2.2 Reading Experience
- [ ] Font size adjustment (small/medium/large)
- [ ] Reading progress bar
- [ ] Remember last read position
- [ ] Paragraph highlighting on click

### 2.3 Search & Discovery
- [ ] Full-text search in sutta content
- [ ] Search result highlighting
- [ ] Filter by collection (DN/MN/SN/AN/KN)
- [ ] Related suttas suggestions

---

## Phase 3: Library Data Enhancement

### 3.1 Add Pāli Text
- [ ] Source Pāli text for key suttas
- [ ] MN 118 Ānāpānasati Sutta
- [ ] SN 22.59 Anattalakkhaṇa Sutta
- [ ] DN 22 Mahāsatipaṭṭhāna Sutta
- [ ] MN 10 Satipaṭṭhāna Sutta

### 3.2 Bookmark System
- [ ] Bookmark specific paragraphs
- [ ] Add notes to bookmarks
- [ ] View all bookmarks page
- [ ] Export bookmarks

---

## Phase 4: Performance & Polish

### 4.1 Audio Optimization
- [ ] Lazy load audio files
- [ ] Use Web Audio API for seamless loops
- [ ] Preload selected sound
- [ ] Memory cleanup on unmount

### 4.2 Bundle Optimization
- [ ] Lazy load Sutta content
- [ ] Optimize audio file sizes (use OGG)
- [ ] Code splitting for Library page

---

## Implementation Priority

| Task | Priority | Impact | Effort |
|------|----------|--------|--------|
| Ambient sounds | P0 | High | Medium |
| Sound selector UI | P0 | High | Low |
| Parallel text | P1 | High | Medium |
| Font size control | P1 | Medium | Low |
| Reading progress | P1 | Medium | Low |
| Full-text search | P2 | Medium | High |

---

## Technical Implementation

### Audio Files (public/sounds/)
```
public/
  sounds/
    rain.mp3
    forest.mp3
    temple-bell.mp3
    stream.mp3
```

### New Components
- `src/components/practice/AmbientSoundSelector.tsx`
- `src/components/library/ParallelText.tsx`
- `src/components/library/FontSizeControl.tsx`
- `src/components/library/ReadingProgress.tsx`

### Data Structure Updates
```typescript
interface MeditationSession {
  // Existing fields...
  ambientSound?: 'rain' | 'forest' | 'temple' | 'stream' | 'none'
}

interface SuttaProgress {
  suttaId: string
  lastReadPosition: number
  progress: number // 0-100
  lastRead: string // ISO date
}
```

---

## Immediate Next Steps

1. **Today**: Create ambient sound system with Web Audio API
2. **Day 2**: Build sound selector UI, integrate with timer
3. **Day 3**: Add parallel text to Sutta detail page
4. **Day 4**: Implement reading progress and font controls
5. **Day 5**: Testing & polish

---

## Success Metrics

- [ ] Ambient sounds load < 500ms
- [ ] Audio loops seamlessly (no gaps)
- [ ] Parallel text readable on mobile
- [ ] Sutta page load < 1s
- [ ] User engagement increase with sounds

---

*Sādhu! Sādhu! Sādhu!*
*Con đường Bát Chánh Đạo - The Noble Eightfold Path*

— NhapLuu Founder
