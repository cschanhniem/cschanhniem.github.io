# Manual 2026 Full Translation Standards

- Date: 2026-03-21
- Scope: `docs/manual-2026-agent-prompts.md`, `AGENTS.md`, `SKILL.md`
- Goal: stop agents from producing short commentary-style route files and force route-complete translations

## Problem

- A number of `manual 2026` routes were being written as compact editorial notes.
- Those files can help with internal drafting, but they are not publication-grade translations.
- The actual product target is a full Vietnamese rendering of each route, still modern and readable aloud, but no longer skeletal.

## Decisions

- Reframed `docs/manual-2026-agent-prompts.md` so the default deliverable is now a full route-complete translation.
- Explicitly banned summary architectures like `Mũi kinh / Điều bài kinh muốn chỉ ra / Bài học thực hành` as the main structure of the final file.
- Added a new quality gate for peyyāla and grouped shorthand routes: reconstruct the full child route instead of submitting a brief paraphrase.
- Updated `AGENTS.md` and `SKILL.md` so future agents treat short commentary shells as incomplete work that must be revised.

## Result

- The repo now has a much stricter authoring spec for `Nhập Lưu 2026`.
- Future batches should produce full translations by default.
- Existing short-shell routes should be treated as revision debt, not as finished coverage.
