# PEREZ — Museum of What's Possible
## Phase 2 Report: First Playable Vertical Slice

**Date:** 2026-10-27  
**Scope (from the Phase 2 brief):**
1. An HTML introduction and navigation shell.
2. A recruiter Quick View.
3. The central courtyard, built through the Blender MCP.
4. One FlowDesk exhibition room.
5. A functional FlowDesk demonstration.
6. Mobile adaptation and a non-WebGL fallback.

**Status:** all five checkpoints (A–E) delivered. A–D were approved by you; E is delivered and waiting on your real-phone benchmark results. **Nothing is committed to git and nothing is deployed.**

Detailed reports per checkpoint: [A](phase-2-checkpoint-a.md) · [B](phase-2-checkpoint-b.md) · [C](phase-2-checkpoint-c.md) · [D](phase-2-checkpoint-d.md) · [E](phase-2-checkpoint-e.md)

---

## 1. Executive summary

- **What's built.** A working museum slice runs in the browser:
  - an instant HTML arrival page;
  - a recruiter Quick View that needs no 3D;
  - a 3D open-air courtyard;
  - a FlowDesk gallery;
  - a seven-stop guided tour;
  - a scripted FlowDesk demonstration showing the real price-floor behaviour, clearly labelled as a simulation.
- **The 3D is light.** Both rooms together are 598 KB on disk (about 470 KB downloaded), 15,084 triangles, 25 draw calls and 26.6 MB of texture memory. That's well inside every mobile budget, and an automated budget check now enforces it.
- **On this laptop** (Intel HD 520, a deliberately weak test machine), the tour averages **40–57 fps at full HD** on every stop. The 30 fps target is met here.
- **Not yet proven:**
  - **Real phones.** The release gate is 30 fps on mid-range phones. I can't test on your phones; a one-tap benchmark is built in for you to run (§7).
  - **Mobile page speed.** Lighthouse mobile scores are 68 and 73 on the home page and Quick View, and 50 on the 3D page. Desktop is 98–99 on the HTML pages.
- **Quality.**
  - **Tests:** 66 automated tests, 95.2% statement coverage.
  - **Code checks:** lint, typecheck and the production build are clean.
  - **Lighthouse:** accessibility and best practices score 100 on every page.

---

## 2. Checkpoint timeline

| Checkpoint | Delivered | Your decision |
|---|---|---|
| **A: Foundation** | Next.js project, HTML arrival, top bar and contact sheet, Quick View, WebGL-gated museum entry, FlowDesk case study, fact register | Approved |
| **B: Blender blockout** | Scripted massing of the courtyard and FlowDesk room, 7 review renders | Approved, including the open-air court and the FlowDesk layout |
| **C: Visual detailing** | Tropical-modernist detailing, timber lattice towers, procedural materials, morning daylight, Cycles renders | Approved |
| **D: Interaction** | Baked lighting, per-room GLBs, 3D tour, FlowDesk demonstration | Approved |
| **E: Optimisation** | Meshopt compression, budget gate, device benchmark, laptop and Lighthouse measurements | Waiting on phone results |

---

## 3. What exists now

### 3.1 Web experience

| Route | What it is |
|---|---|
| `/` | Arrival: wordmark with bronze seam, narrative line, intro, **Enter Museum** and **Quick View**. HTML first, readable before any 3D loads. The backdrop is still a CSS placeholder |
| `/quick` | Recruiter Quick View, no WebGL: role, what I build, four flagship projects with worded status chips and evidence, story timeline, skills, opportunities. Print-friendly |
| `/museum` | Checks WebGL first. Devices without it get Quick View with one sentence of explanation. Capable devices get the 3D tour |
| `/work/flowdesk` | FlowDesk case study: the problem, seven layers with the Plain ⇄ Technical toggle, the price-floor thesis, evidence |
| Every page | Top bar with Quick View and **Contact** (side panel on desktop, bottom sheet on phones), skip link, visible focus, reduced-motion support |

### 3.2 The 3D tour
- **Seven stops:** The Court → The Stratum → FlowDesk threshold → Inside FlowDesk → Play the customer → The order, recorded → Look beneath the surface. Each has its own landscape and portrait camera composition.
- **Camera:** flies between neighbouring stops and fades for longer jumps, so it never passes through walls. It cuts instantly when the visitor asks for reduced motion.
- **Navigation:** Previous / All stops / Next with 44 px targets, arrow keys, Esc, and deep links such as `/museum?stop=beneath`.
- **Rendering:**
  - lighting is baked, so every surface is drawn unlit, with no real-time lights or shadows;
  - FlowDesk lazy-loads after the Court is on screen;
  - resolution is capped at 1.5× on touch devices and lowered automatically if frames drop;
  - the scene redraws only while something moves.
- **Failure handling:** a lost WebGL context, a failed model load or a slow connection each get honest messages with Quick View and the case study as ways out.
- **Accessibility:** every 3D moment has its words in the DOM; the canvas is hidden from screen readers.

### 3.3 The FlowDesk demonstration
Labelled **Simulation**: "Scripted from FlowDesk's verified behaviour. Not a live WhatsApp connection, and not real customer data."

| Customer | What FlowDesk does | Source in the FlowDesk repo |
|---|---|---|
| "Do you have the wax print, half piece? I need two." | Matches the catalogue item, replies with the real price: GHS 250 each | `services/assistant` (grounding) |
| "Can you do GHS 200 each?" | Refused: GHS 200 isn't on the price ladder (list 250 → floor 230). The reply can only quote a price that exists | `services/pricing/ladder.ts`, `services/assistant/router.ts` ("A price below the floor never goes out, in any mode") |
| "Okay, 460. I'll pay with MoMo." | The order goes through order creation onto the owner's board; payment stays unconfirmed until checked. The camera moves to the ledger table and the order slab appears | Order creation, payment confidence ladder |
| See how it works | The architecture model's seven layers part; Plain ⇄ Technical captions | Module names read from the repo |

The product and prices are illustrative, pending your confirmation. The scenario was corrected from "Ankara" (a Nigerian term) to Ghanaian wax print sold by the half piece, paid with MoMo.

### 3.4 Architecture (Blender, all scripted)
**The Court:** a 36 × 36 m open-air courtyard on a 1.2 m grid.
- **Verandah building:** two storeys, 10.8 m high, with columns every 3.6 m. The upper floors have concrete fins every 1.2 m over recessed glazing, between slab and parapet bands, and timber ceilings over the walkway.
- **Thresholds:**
  - north: the opening into FlowDesk, between two 21.6 m see-through **timber lattice towers** on the 0.4 m screen-block module;
  - south: an arrival terrace with steps down into the court;
  - east and west: closed basalt infills for wings not built yet.
- **Centre:** a pool, a basalt plinth and **the Stratum**: 12 basalt layers on a bronze spine, 6 m tall, hovering 0.3 m.
- **Floor and planting:** terrazzo in long strips with bronze seam inlays to each threshold; four raised planting beds.

**The FlowDesk hall:** 14.4 × 28.8 × 10.8 m, entered through a low vestibule (compression, then release).
- **Daylight:** a slatted timber clerestory and a louvred roof slot.
- **Exhibits:** a framed chat display, a kiosk, the seven-layer architecture table, a stocked shop with shelves and a counter, and a ledger table with the order slab.
- **Lighting:** warm gallery panels, used for baking only.

**Materials:** board-marked laterite concrete, strip terrazzo, basalt, timber, patinated bronze. All procedural, from one library.

---

## 4. Design decisions made during Phase 2

| Decision | Why | Status |
|---|---|---|
| Open-air court with a 10.8 m verandah, instead of the Phase 1 enclosed 43 m court with an oculus | The brief asks for natural daylight, human scale and realistic geometry; matches the approved concept image | Approved at B |
| Stratum 6 m tall, hovering 0.3 m, instead of 14 m hovering 6 m | Restrained surrealism; reads as a real sculpture | Approved at B |
| FlowDesk as a gallery around a real shop setting, instead of a giant machine | "Projects must look and behave like the actual software" | Approved at B |
| Concept image used as art direction only, never as site imagery | It contains AI-generated text and pixels; the arrival will use a render of the real scene | — |
| Unlit, baked materials in the browser | Cheapest possible rendering for mid-range phones | Approved at D |
| No GSAP | Camera easing is about 20 lines of code; the dependency wasn't justified | — |
| No KTX2 textures yet | Texture memory is 26.6 MB of a 128 MB budget, and KTX2 would need a system install | Your call (§9) |
| Illustrative demo scenario instead of the FlowDesk film scenario | D8 (permission for the film and screenshots) is still open | Your call (§9) |

---

## 5. Measured results

### 5.1 3D budgets (measured by `npm run models:budget`)

| | Size | Triangles | Draw calls | Texture memory |
|---|---|---|---|---|
| Court | 415 KB / 1.5 MB | 10,696 / 150k | 14 / 60 | 21.3 / 40 MB |
| FlowDesk | 183 KB / 1.2 MB | 4,388 / 120k | 11 / 40 | 5.3 / 32 MB |
| Both loaded | — | 15,084 / 300k | 25 / 100 | 26.6 / 128 MB |

Meshopt compression reduced the files by 44% (Court) and 42% (FlowDesk).

### 5.2 Frame rate: this laptop
Intel HD 520, Chrome, 1920 × 1080 at pixel ratio 1.38, production build:

| Stop | Avg fps | Lowest second |
|---|---|---|
| The Court | 47 | 8 (first second, textures uploading) |
| The Stratum | 49 | 43 |
| Threshold | 46 | 40 |
| Inside FlowDesk | 57 | 54 |
| Play the customer | 51 | 44 |
| The order | 49 | 49 |
| Look beneath | 40 | 16 (fade-cut plus layer animation) |

### 5.3 Lighthouse

| Page | Desktop performance | Mobile performance | Accessibility | Best practices |
|---|---|---|---|---|
| `/` | 99 | 68 | 100 | 100 |
| `/quick` | 98 | 73 | 100 | 100 |
| `/museum` | 68 | 50* | 100 | 100 |

\* Headless Lighthouse has no GPU, so WebGL runs in software under a 4× CPU slowdown. That overstates the cost, but it confirms that 3D start-up blocks the main thread.

### 5.4 Asset production times on this laptop
- **Lighting bake:** 41 min for the Court (2048 px atlas), 6.8 min for FlowDesk (1024 px).
- **Daylight review renders:** 71–129 s each.

### 5.5 Code quality
- **Tests:** 66 across 11 files, covering the content register, demo script, tour, benchmark, contact sheet, captions, pages and WebGL detection.
- **Coverage:** 95.2% statements, 89.0% branches, 95.7% functions, 96.8% lines.
- **WebGL canvas:** not unit-tested (jsdom has no WebGL); verified in the browser instead.
- **Checks:** lint and typecheck are clean, and the production build passes with every route static.

---

## 6. Brief compliance

| Requirement | Status |
|---|---|
| Responsive HTML shell, Quick View, courtyard, one FlowDesk room, functional demonstration, mobile adaptation, non-WebGL fallback | **Done** |
| Next.js App Router, TypeScript, React Three Fiber, Three.js, Drei, Zustand | **Done** |
| GSAP where justified | **Not used** (not justified) |
| Blender MCP geometry; reusable scripts and sources in version control | **Done**: `blender/scripts/`, `blender/src/`. In the repo but **not yet committed** |
| Modular GLBs, not one massive GLB | **Done**: one per room |
| Adaptive quality, baked lighting, lazy loading, controlled DPR, asset budgets, mobile cameras, reduced motion, touch navigation, Quick View without WebGL, WebGL failure recovery | **Done** |
| Simulation clearly labelled; no invented capabilities, customers, revenue or status | **Done**: every claim in `src/content/` carries a source and a verification status |
| 30 fps on mid-range phones, 60 fps on capable devices | **Not yet proven on phones.** About 40–57 fps measured on the HD 520 laptop at full HD |
| Measure, don't claim | Followed. Unmeasured items are marked as such |
| Stop at every approval gate | Followed for A–D; E waits on you |

---

## 7. Real-phone testing: what I need from you

1. Keep the laptop running the site, and connect a phone to the same network ("darkRose👑").
2. Open **`http://172.20.10.2:3001/museum?perf=1`**, wait for the Court, and tap **Run benchmark** (about 45 seconds).
3. Copy the report and paste it here. Ideally test one mid-range Android phone, plus an iPhone if you have one.

If the page won't open, Windows Firewall may be blocking Node.js; allow it for **private** networks. The laptop appears to be on an iPhone hotspot; if the phone sharing the hotspot can't connect, use another phone that's joined to it.

---

## 8. Known issues and limitations

1. **Phone performance is unmeasured.** This is the release gate.
2. **Mobile page speed:** 68 and 73 on `/` and `/quick`, 50 on `/museum`. Likely fixes:
   - trim to two or three font families and subset them;
   - defer non-critical JavaScript;
   - start the 3D scene after the page is interactive.
3. **Brief stutters:** the first-second texture upload at the Court and the cut into "Look beneath".
4. **Placeholders:**
   - the arrival backdrop is CSS, to be replaced by a render of the real courtyard;
   - the 3D screens are flat colour (the live chat is in the panel);
   - trees are low-poly.
5. **Lightmap resolution:** about 7 cm per texel on the Court floor, so the lattice shadows are soft.
6. **Slow bakes:** a lighting change means a 41-minute Court bake on this laptop.
7. **Navigation:** by stops only. Free exploration (drag to look) is not built.
8. **Out of scope by design:** the other wings (LedgerMind, Accra We Dey, JoyDataBundle), the Origin, the Laboratory, the Unfinished Wing and the Open Door.
9. **Review build:** "To confirm" markers are still visible (`SHOW_REVIEW_MARKERS = true`) and must be switched off before launch.
10. **Not committed, not deployed.**
11. **Tooling notes:**
    - npm 10.8 has a peer-dependency bug, worked around with `.npmrc` (`legacy-peer-deps=true`);
    - one lint warning comes from the generated `coverage/` folder (a plugin hook blocks editing the ESLint config).

---

## 9. Decisions waiting on you

| # | Decision | Effect |
|---|---|---|
| 1 | Run the phone benchmark (§7) | Decides whether the mobile gate passes |
| 2 | Fix mobile page speed now, or after the phone results | Fonts, JavaScript start-up, 3D start-up |
| 3 | Demo prices (GHS 250 list, 230 floor, 200 offer): right for a half piece of wax print? | Wording only |
| 4 | **D8:** may I use the FlowDesk film scenario and QA screenshots? | Could replace the illustrative scenario |
| 5 | **D1:** your role on each project; may I name your JoyDataBundle teammates? | Role lines and credits |
| 6 | **D3:** clean FlowDesk's `RUNNING-LOCALLY.md` (phone numbers, WhatsApp IDs) | Unlocks the FlowDesk repo link |
| 7 | **D5:** include Accra We Dey (general-audience content only)? | Quick View, future wing |
| 8 | **D6 / P1-6:** role line ("Developer / Product Builder") and narrative line | Arrival and Quick View wording |
| 9 | **Q10 / Q11:** which contact channels to publish, and your CV | The contact sheet currently shows GitHub only |
| 10 | KTX2 texture compression (needs a system install) | Recommended later, not now |
| 11 | Commit Phase 2 to git | I'll commit in logical steps when you say so |

---

## 10. How to run it

```bash
npm run dev                 # development server, http://localhost:3000
npm run build && npm start  # production build
npm test                    # 66 tests
npm run test:coverage
npm run models:optimize     # compress blender/out/raw/*.glb into public/models/
npm run models:budget       # fail if any model exceeds its budget
```

Rebuilding the 3D, in Blender 5.2: `build_museum.main()` rebuilds the scene. Then run `bake_export.py` in a background Blender process, then `npm run models:optimize`. Details are in [blender/README.md](../blender/README.md).

---

## 11. Suggested next steps

1. **Phone benchmark results** (you), then fix whatever they show.
2. **Mobile page speed:** fonts, deferred JavaScript, deferred 3D start-up. Target LCP under 2.5 s and blocking time under 200 ms.
3. **Arrival poster:** replace the CSS placeholder with a render from the real arrival camera.
4. **Commit Phase 2**, then decide on deployment (a Vercel preview), which needs your approval.
5. **Phase 3 planning:** the next wing, likely LedgerMind OS. It depends on your answers in §9.
