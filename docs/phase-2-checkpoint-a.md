# Phase 2 · Checkpoint A report: Foundation

**Date:** 2026-10-27  
**Status:** complete and verified (§5). Ready for your review.  
**Approval needed before Checkpoint B** (Blender blockout). No Blender work has started.

## 1. What was implemented

| Area | Route / location | Notes |
|---|---|---|
| Project foundation | repo root | Next.js 16.4.3 (App Router, TypeScript, React 19.3, React Compiler, cache components), Zustand 5, ESLint, Vitest config. `git init` done; nothing committed |
| Arrival | `/` | HTML first: wordmark with the seam, narrative line, intro, **Enter Museum** and **Quick View**, section links (Selected Works · Story · Skills · Opportunities), availability line. Backdrop is a **CSS placeholder** (dawn sky, timber screen towers, Stratum stand-in), not the concept image |
| Persistent navigation | top bar on every route | Wordmark → home, **Quick View**, **Contact** (filled bronze). 44 px targets, sticky, safe-area aware |
| Contact | global sheet | Native modal dialog: side panel on desktop, bottom sheet on mobile; Esc and backdrop close. GitHub only for now; email, intents, copy button and CV are built but hidden until contact details are confirmed |
| Recruiter Quick View | `/quick` | No WebGL. Light theme. Header, What I build, four flagships (purpose, role, worded status chips, stack, evidence, links), Story timeline, Skills, Opportunities. Print-friendly |
| Museum entry + WebGL fallback | `/museum` | Probes WebGL once (and releases the context). No WebGL → "Quick View instead" with one sentence. WebGL → honest "being built" panel linking to Quick View and the FlowDesk case study |
| FlowDesk case study | `/work/flowdesk` | Problem, **Look beneath the surface** (7 strata from real repo modules) with the global **Plain ⇄ Technical** toggle, the price-floor thesis, the demonstration described and labelled as a simulation (built at Checkpoint D), evidence |
| Content register | `src/content/` | Every claim carries `verified` / `self-reported` / `pending` and a source. Review markers show what waits on you |
| Accessibility | global | Skip link, visible bronze focus, landmarks, status words never colour-only, reduced-motion and high-contrast handling |

## 2. Files created or changed

- **Config:** `package.json`, `package-lock.json` (pending), `.npmrc`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, `vitest.setup.ts`, `.gitignore`, `AGENTS.md` (Next.js scaffold), `.claude/launch.json`, `README.md`.
- **Routes:** `src/app/{layout.tsx, globals.css, icon.svg, page.tsx, page.module.css, not-found.tsx}`, `src/app/quick/{page.tsx, quick.module.css}`, `src/app/museum/page.tsx`, `src/app/work/flowdesk/{page.tsx, flowdesk.module.css}`.
- **Components:** `TopBar`, `Wordmark`, `ContactButton`, `ContactSheet`, `StatusChip`, `ReviewMarker`, `CaptionToggle`, `StrataList`, `MuseumGate` (each with a CSS module).
- **Content:** `src/content/{types, profile, projects, story, capabilities, flowdesk, review}.ts`.
- **Lib / store:** `src/lib/{webgl, format}.ts`, `src/store/ui.ts`.
- **Tests:** `src/content/register.test.ts`, `src/lib/webgl.test.ts`, `src/components/{ContactSheet, StrataList}.test.tsx`, `src/app/quick/page.test.tsx`, `src/app/routes.test.tsx`.
- **Design docs:** `design/README.md`, `design/phase-1/08-founder-review.md` (art direction recorded as approved).

## 3. Blender assets generated

None. Blender work starts at Checkpoint B, after your approval.

## 4. Concept image

Confirmed in the workspace: `design/Perez Museum of Possibilities.png` (matches the image you attached). Used as art direction only; none of its pixels or baked-in text ship on the site.

## 5. What was tested

| Check | Result |
|---|---|
| `npm test` | **34 / 34 passed** across 6 files |
| Coverage (gate 80%) | **95.5% statements · 89.6% branches · 96.5% functions · 97.4% lines** |
| `npm run lint` | Clean |
| `npm run typecheck` | Clean (runs `next typegen` first so route types exist) |
| `npm run build` | Passes; all 5 routes prerendered as static HTML |
| Routes | `/`, `/quick`, `/museum`, `/work/flowdesk` return 200; unknown routes 404 |
| Browser, production build, 375 × 812 and ~800 px desktop | Arrival, Quick View, museum gate, FlowDesk case study, contact sheet; no horizontal overflow |
| Contact sheet | Opens from either Contact button; Esc closes; focus returns to the button; phone bottom sheet sizes to content (300 px) |
| Caption toggle | Plain → Technical swaps all seven strata; `aria-pressed` updates |
| WebGL gate | Capable browser shows "being built" with "WebGL 2 available"; the no-WebGL path is covered by tests (not yet seen on a real device without WebGL) |

**Fixed during verification**
- Desktop: the left timber tower sat behind the text column; towers moved right and the overlay strengthened.
- Phone: the poster is now a band at the top with text on near-solid ground below.
- Wordmark: the bronze seam overshot the "Z" because the letters stretched to the lockup width.
- Contact sheet: on phones it stretched to 85% of the screen; now it is anchored to the bottom and sized to its content.

**Install trouble, for the record.** npm 10.8 crashed twice in its peer-dependency resolver (`reading 'edgesOut'`), triggered by Vitest 4's optional peers. `.npmrc` now sets `legacy-peer-deps=true`, and the required peer `@testing-library/dom` is listed explicitly. `@vitest/coverage-v8` is pinned to Vitest's version (a 5.x plugin silently recorded 0%).

**Not tested yet:** keyboard-only walkthrough with a screen reader, Safari and Firefox, a real phone, and an automated accessibility audit.

## 6. Measured performance

There is no 3D at this checkpoint. Measured from the production build:

| Measure | Value |
|---|---|
| Client JS, all routes combined | 182 KB gzipped (589 KB raw, 13 files, mostly the React and Next runtime) |
| CSS, all routes combined | 6.3 KB gzipped |
| Prerendered HTML | `/` 13 KB · `/quick` 37 KB · `/museum` 10 KB |

Lighthouse and Core Web Vitals were **not** measured: the Chrome DevTools tooling failed to connect in this session. That is the first job of Checkpoint E, or earlier if you want it.

## 7. Known issues

1. **At about 800 px wide**, the availability line's "To confirm" marker just touches the first tower. It clears at normal desktop widths, and the marker disappears at launch.
2. **Placeholder backdrop.** The arrival backdrop is CSS. It is replaced by a render from the actual courtyard camera after Checkpoint B/C.
3. **Light-theme bronze** was darkened from `#8A6A3A` to `#7A5C30` so light text on bronze buttons clears 4.5:1. Not yet checked with a contrast tool.
4. **"See the 3-minute highlights"** is not on Quick View yet; it needs the tour (Checkpoint D).
5. **ESLint 9.39 shows a deprecation notice** from npm. Harmless for now; upgrade later.
6. **No commit made.** The repo is initialised but nothing is committed until you ask.

## 8. What needs your approval or input

**To proceed to Checkpoint B:** approve this foundation. Then I will build the courtyard and FlowDesk room as simple Blender blockouts, render previews, and stop again.

Run it yourself: `npm run dev`, then open http://localhost:3000.

**Content waiting on you** (shown in the review build as "To confirm" markers):

| Code | Question | Effect today |
|---|---|---|
| D6 | Role line and availability: "Developer / Product Builder · Open to work" (taken from the concept image) | Shown, marked |
| P1-6 | Narrative line "Curiosity made me explore. Ambition made me build." | Shown, marked |
| D1 | Your role in FlowDesk (15 commits by `d <d@f>`), LedgerMind POS originality, JoyDataBundle credits and teammate names | Roles shown as "Product and engineering" / "Frontend contributor", marked |
| D3 | Scrub FlowDesk's `RUNNING-LOCALLY.md` (phone numbers, WhatsApp IDs) | FlowDesk repo link withheld |
| D5 | Include Accra We Dey (general-audience only)? | Included, repo link withheld |
| D8 | Use the FlowDesk film scenario and QA screenshots? | Not used; needed for Checkpoint D |
| Q10 / Q11 | Contact channels to publish; CV file | Only GitHub shown |
| D2 | How to describe AI-assisted engineering | Not mentioned anywhere |

`SHOW_REVIEW_MARKERS` in `src/content/review.ts` must be set to `false` before anything is public.
