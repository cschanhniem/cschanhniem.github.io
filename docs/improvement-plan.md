# NhapLuu App - Improvement Plan

> Kế hoạch cải tiến xuất sắc và thực tế

## Mục tiêu

Nâng cấp NhapLuu App lên một tầm cao mới về:
1. **Code Quality**: Zero ESLint errors, proper TypeScript
2. **User Experience**: Toast notifications, loading states, dark mode toggle
3. **Performance**: Service Worker, optimized lazy loading
4. **Accessibility**: WCAG AA compliance
5. **Reliability**: Error boundaries, proper error handling

---

## Phase 1: Code Quality (Immediate)

### 1.1 Fix ESLint Errors
- [ ] Fix `any` types trong api.ts
- [ ] Fix `any` types trong Auth.tsx
- [ ] Fix `any` types trong Practice.tsx
- [ ] Fix unnecessary catch clauses trong AuthContext.tsx
- [ ] Fix React refresh violations trong button.tsx
- [ ] Fix missing hook dependency trong useAppState.ts
- [ ] Fix unused variables trong backend/index.ts

### 1.2 Type Safety Improvements
- [ ] Create proper error types
- [ ] Add API response types
- [ ] Remove all implicit `any`

---

## Phase 2: UX Improvements (High Priority)

### 2.1 Toast Notification System
- [ ] Install/create Toast component (sonner hoặc custom)
- [ ] Replace tất cả `alert()` bằng toast
- [ ] Add success/error/info toast variants
- [ ] Add toast cho sync status

### 2.2 Dark Mode Toggle
- [ ] Add theme context/hook
- [ ] Create toggle button trong Header
- [ ] Persist preference trong localStorage
- [ ] Smooth transition animation

### 2.3 Loading States
- [ ] Create Skeleton components
- [ ] Add skeletons cho page lazy loading
- [ ] Add loading states cho API calls
- [ ] Improve sync indicator visibility

---

## Phase 3: Performance (Medium Priority)

### 3.1 Service Worker (PWA)
- [ ] Configure vite-plugin-pwa
- [ ] Cache static assets
- [ ] Cache suttas data
- [ ] Offline fallback page

### 3.2 Bundle Optimization
- [ ] Lazy load react-markdown chỉ khi cần
- [ ] Dynamic import sutta content
- [ ] Optimize images (webp conversion)

---

## Phase 4: Accessibility (Medium Priority)

### 4.1 ARIA Labels
- [ ] Add aria-labels cho tất cả icons
- [ ] Add proper form labels
- [ ] Add skip navigation links

### 4.2 Keyboard Navigation
- [ ] Ensure all interactive elements focusable
- [ ] Add keyboard shortcuts cho common actions
- [ ] Focus management cho modals

---

## Phase 5: Reliability (Medium Priority)

### 5.1 Error Handling
- [ ] Add ErrorBoundary component
- [ ] Proper error messages cho users
- [ ] Fallback UI cho failed components

### 5.2 Data Validation
- [ ] Validate localStorage data before parsing
- [ ] Add data migration strategy
- [ ] Implement proper sync conflict resolution

---

## Implementation Priority

| Task | Priority | Impact | Effort |
|------|----------|--------|--------|
| Fix ESLint errors | P0 | High | Low |
| Toast notifications | P0 | High | Medium |
| Dark mode toggle | P1 | High | Low |
| Loading skeletons | P1 | Medium | Low |
| Service Worker | P2 | High | Medium |
| Accessibility | P2 | Medium | Medium |
| Error boundaries | P2 | Medium | Low |

---

## Success Metrics

- [ ] 0 ESLint errors
- [ ] 0 `alert()` calls
- [ ] Dark mode toggle hoạt động
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] PWA installable

---

## Timeline

- **Day 1**: Phase 1 (Code Quality) + Phase 2.1 (Toast)
- **Day 2**: Phase 2.2 (Dark Mode) + Phase 2.3 (Loading)
- **Day 3**: Phase 3 (Performance) + Phase 4 (Accessibility)
- **Day 4**: Phase 5 (Reliability) + Testing

---

*Let's make NhapLuu the best Buddhist practice app!*
