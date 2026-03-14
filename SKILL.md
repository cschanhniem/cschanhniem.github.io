# Long-Form Manuscript Ingestion

This skill documents the house method for turning a long PDF manuscript into site-ready teaching content without losing structure, citations, appendix material, or release discipline.

## When To Use It

Use this workflow when a source PDF is long, citation-heavy, or contains tables and diagrams that cannot survive plain OCR.

## Canonical Paths

- Source PDF: repo root or task-specific import path.
- Extraction script: `nhapluu-app/scripts/ingest_scrnguna.py`
- English corpus: `nhapluu-app/src/content/teachings/<slug>/en/`
- Vietnamese corpus: `nhapluu-app/src/content/teachings/<slug>/vi/`
- Appendix assets: `nhapluu-app/public/teachings/<slug>/`
- Site module: `nhapluu-app/src/data/teachings/<slug>/`

## Workflow

1. Inspect the PDF structure first.
2. Define section boundaries manually when the table of contents is reliable.
3. Extract body text and footnotes separately.
4. Repair OCR only where the errors are patterned and repeatable.
5. Replace broken appendix OCR with image-backed markdown when layout matters.
6. Draft or translate Vietnamese chapters carefully, chapter by chapter.
7. Keep English chapters as the canonical fallback for unfinished Vietnamese sections.
8. Build a small TypeScript bridge that imports chapter markdown into the site’s teaching model.
9. Verify build output and inspect the public page.
10. Publish the frontend by pushing `main` when the route is stable.

## State Machine

```mermaid
stateDiagram-v2
    [*] --> InspectPDF
    InspectPDF --> SegmentSections
    SegmentSections --> ExtractText
    ExtractText --> RepairOCR
    RepairOCR --> PreserveAppendices
    PreserveAppendices --> DraftVietnamese
    DraftVietnamese --> RegisterTeaching
    RegisterTeaching --> VerifySite
    VerifySite --> PublishFrontend
    PublishFrontend --> Published
    DraftVietnamese --> PreserveAppendices: source artifact blocks phrasing
    VerifySite --> RepairOCR: extraction defect
    VerifySite --> RegisterTeaching: integration defect
```

## Sequence

```mermaid
sequenceDiagram
    participant Agent
    participant PDF
    participant Script
    participant Corpus
    participant Site
    participant GitHubPages

    Agent->>PDF: inspect TOC, headings, appendix pages
    Agent->>Script: encode section boundaries
    Script->>PDF: extract text, lines, footnotes
    Script->>Corpus: write English markdown
    Agent->>Script: inject appendix image strategy
    Script->>Corpus: write cleaned English corpus
    Agent->>Corpus: hand-translate chapter where ready
    Corpus->>Site: vi chapter or en fallback
    Agent->>Site: register teaching module and metadata
    Site-->>Agent: build result and route validation
    Agent->>GitHubPages: push main after checks pass
```

## Data Flow

```mermaid
flowchart LR
    A[scrnguna.pdf] --> B[Section map]
    B --> C[Line extraction]
    C --> D[Body cleanup]
    C --> E[Footnote parsing]
    D --> F[English markdown chapters]
    E --> F
    A --> G[Rendered appendix pages]
    G --> H[Public image assets]
    F --> I[Manual Vietnamese chapters]
    F --> J[English fallback corpus]
    I --> K[Teaching TS module]
    J --> K
    H --> K
    K --> L[Metadata + route wiring]
    L --> M[Local build]
    M --> N[GitHub Pages deploy]
```

## Practical Rules

- Never trust automatic footnote placement on biography or front-matter pages. Only annotate numbers that actually exist as page footnotes.
- Do not flatten tables or diagrams into broken prose. Preserve them as images with short textual summaries.
- Keep chapter files stable across reruns by using explicit numeric prefixes in filenames.
- Protect Pāli doctrinal vocabulary when translating. A bad translation of a key term is worse than leaving the term in transliteration.
- Treat the English markdown as the canonical extracted source.
- If the Vietnamese chapter is not yet elegant, doctrinally precise, and readable aloud, do not force publication. Let the module fall back to English.
- For this repo, a content-only release normally means frontend publish only.
- Site verification now runs on Vite 8. Keep `manualChunks` function-based in `vite.config.ts`, and if chart routes fail under production bundling, confirm `react-is` is installed for `recharts`.

## Review Checklist

- Section ordering matches the source PDF.
- Page-scoped footnote labels are unique.
- No obvious split-word artifacts remain around footnote markers.
- Appendix pages render upright and at readable width.
- Metadata title, summary, difficulty, and themes match the manuscript.
- The teaching route resolves with chapter ordering intact.
- Site build passes after wiring.
- Pages deploy is triggered from `main`.
