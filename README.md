# PEREZ — Museum of What's Possible

An interactive portfolio for Perez Tegbey: an HTML arrival and recruiter Quick View today, with a 3D courtyard museum built on top.

## Status

Phase 2 (first playable vertical slice) delivered: courtyard and FlowDesk room in 3D, scripted FlowDesk demonstration, Quick View. Real-phone benchmark pending. See [docs/phase-2-report.md](docs/phase-2-report.md).

## Commands

```bash
npm run dev          # local dev server on http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript, no emit
npm test             # Vitest unit and component tests
npm run test:coverage
```

Requires Node.js 20.9 or later.

## Layout

```
src/app/         routes: / (arrival), /quick, /museum, /work/flowdesk
src/components/  shared UI (top bar, contact sheet, chips, captions)
src/content/     fact register: every public claim with its source
src/lib/         small utilities (WebGL detection, formatting)
src/store/       Zustand interaction state
design/          approved design documents and concept reference
docs/            phase reports
```

## Content rules

- Every claim in `src/content/` carries a verification status and a source.
- `SHOW_REVIEW_MARKERS` in `src/content/review.ts` shows "To confirm" markers for content waiting on founder decisions. It must be `false` before launch.
