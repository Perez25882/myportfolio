# Phase 2F · F1: Visual Audit and Redesign Proposal

**Date:** 2026-10-27  
**Status:** proposal only. **Stopped for founder approval.**  
**Production untouched.** The site code, `blender/src/museum.blend` and the GLBs in `public/models/` are unchanged. F1 adds only:
- a concept script (`blender/scripts/concepts/code_monument_f1.py`);
- a separate concept file (`blender/src/concepts/code_monument_f1.blend`);
- preview renders (`blender/out/previews/f1/`);
- a mockup board (`docs/phase-2f/f1-mockups.html` and `.png`).

---

## 1. Executive summary

- **You're right about the visuals.** The prototype proved the system (pipeline, budgets, demo, mobile performance), but not the look. Measured against the approved concept image (`design/Perez Museum of Possibilities.png`), it reads as a clean massing model.
- **Why it falls short:**
  - repetitive facades with no hierarchy;
  - placeholder planting;
  - materials that lose their texture in a low-resolution bake;
  - flat daylight with no accent lighting;
  - a FlowDesk room whose screens show nothing.
- **Fixes:** each one is aimed at a specific discrepancy (§2), with its cost estimated (§8). Most of the improvement comes from lighting, landscaping, material detail and a few hero architectural moves, not from adding polygons everywhere.
- **Code Monument:** two alternatives were modelled and rendered in the real courtyard (§3).
  - **A · Cast:** three monolithic brushed-bronze characters, each split by a fine seam that parts to reveal a dark steel rib.
  - **B · Laminated:** each character assembled from four precision bronze plates on visible steel pins; the plates slide apart along the pins.
  - **Recommendation: A** for its presence and legibility, with B's visible fixings borrowed for the base.
- **FlowDesk:** redesigned as one readable sequence, **Customer → FlowDesk → Shop owner**. A chat wall on the left, a seven-station bronze pipeline table down the middle (with the price-floor gate as a physical stop), and an owner dashboard beside a real shop setting on the right. Text-heavy interfaces are HTML, so they're crisp and accessible, never blank textures.
- **Mobile:** architecture first. A full-screen scene under a 34 px bar, a compact dock, a context sheet the visitor opens on demand, and a dedicated full-screen view for the demonstration.
- **iPhone benchmark:** the "Threshold 0 fps" result means **no frames were rendered for the whole 5-second measurement window**. The low "Hall" minimum is the first sample after that pause. Together they point to one stall of roughly 5–8 seconds as FlowDesk first came into view. The cause isn't proven yet; §6 sets out how to find it.

---

## 2. Visual discrepancies and proposed corrections

The reference is the approved concept image. The comparison is with the Checkpoint C and D renders and the live build.

| # | Area | Concept | Current prototype | Proposed correction |
|---|---|---|---|---|
| 1 | **Facade hierarchy** | Tall piers, double-height openings, deep shadow, a clear portal to each wing | One verandah module repeated on all four sides; fins every 1.2 m everywhere | A rhythm of **bay types**:<br>• double-height portal bays at each threshold;<br>• solid "pier" bays at the corners;<br>• fin bays between them.<br>Deeper reveals (0.6 → 1.2 m) at portals; timber screen infill in some upper bays; column bases and capitals |
| 2 | **Entrance hierarchy** | The FlowDesk opening is unmistakable | A 7.2 × 5.4 opening, the same height as the verandah | Raise the FlowDesk portal to double height (10.8 m) with a deep basalt-lined reveal and a cast-bronze threshold plaque. The lattice towers frame it as before |
| 3 | **Lattice towers** | Rich timber lattice, warm glow within | Correct idea, but thin square bars | Thicker timber members in two sizes (frame and infill). A solid concrete core at the base. Warm lamps inside the base, baked |
| 4 | **Courtyard floor** | Stone paving with joints, wet sheen near the pool | Strip terrazzo whose detail disappears at 7 cm per texel | Large-format stone paving modelled as geometry (joints captured in the bake), bronze inlays kept. Give the floor its own **dedicated lightmap** so shadows stay sharp |
| 5 | **Landscaping** | Lush, layered tropical planting | Icosphere "trees", spherical shrubs | Low-poly mesh plants with real silhouettes:<br>• 2 canopy trees (e.g. neem-like spreading form);<br>• 2 palms;<br>• layered beds of shrubs, grasses and groundcover;<br>• planters on the verandah.<br>Opaque mesh leaves, no alpha cut-outs, about 25k triangles in total |
| 6 | **Materials** | Board-formed concrete grain, warm timber, honed basalt, bronze | Flat after baking; no surface detail in the browser | **Two layers:**<br>1. the baked lightmap;<br>2. a small **tiling detail texture** per material (formwork grain, timber, stone) multiplied in at runtime.<br>Cheap enough for the unlit mobile tier. Desktop tier adds normal maps |
| 7 | **Lighting** | Golden morning light plus warm architectural accents (uplights, wall grazers, glowing screens) | Daylight only; even, low contrast | Keep the morning sun, and bake in **accent lights**: lattice tower bases, step lights, plinth line, threshold grazers, gallery wall washers. Add stronger ambient occlusion for contact shadows. Bake at 2048 px for hero surfaces |
| 8 | **Central sculpture** | A sculpted stone on a plinth in the pool | "Stacked concrete slabs" (Stratum) | **The Code Monument** (§3) |
| 9 | **People and life** | Visitors for scale | Silhouettes only in renders | A few low-poly figures in renders and Quick View posters only (never in the GLB, as now) |
| 10 | **Integrated signage** | Wall lettering ("Real projects…") | None in 3D | Cast-bronze threshold plaques with the `</>` mark and room number. All readable text stays in the DOM |
| 11 | **FlowDesk room** | Live product screens, an enclosure of system modules, a shop | A blank teal panel, a sparse room | The full redesign in §4 |

---

## 3. The Code Monument

### 3.1 Construction shared by both alternatives
- **Size:** three characters, `<` `/` `>`, each 4.2 m tall with 0.85 m strokes and 0.84 m depth (as thick as deep, like cast sections). The whole symbol is 9.35 m wide, centred on the court.
- **Base:** a new 11.4 × 5.4 m plinth inside the existing pool, which is **retained**. The water reflects the bronze; the 0.3 m hover is dropped.
- **Mounting:** each character stands on dark steel shoe plates with bolt heads at its ground contacts (engineered, visible). A thin warm light line is recessed along the plinth's front edge.
- **Material:** champagne/brushed bronze (`#C4A06A`, metallic, roughness 0.42 ± 0.1 brushing), dark steel, basalt.

### 3.2 Alternative A · Cast (recommended)
- **Form:** each character is a pair of cast halves either side of a 3 cm shadow-gap seam, around a dark steel internal rib. The seam echoes the PEREZ wordmark's seam.
- **Reveal:** the halves part 35 cm along the seam, exposing the rib, then return. Reduced motion: a cross-fade between closed and open.
- **Why:**
  - the strongest silhouette from the arrival and on phones;
  - reads as a commissioned sculpture, not a sign;
  - the reveal is simple and mechanically believable.

Previews in `blender/out/previews/f1/`:

| View | A · Cast | B · Laminated |
|---|---|---|
| Front | `monument_A_front.png` | `monument_B_front.png` |
| Three-quarter | `monument_A_three_quarter.png` | `monument_B_three_quarter.png` |
| Wide courtyard (desktop arrival) | `monument_A_courtyard_wide.png` | `monument_B_courtyard_wide.png` |
| Portrait mobile (phone arrival) | `monument_A_portrait_mobile.png` | `monument_B_portrait_mobile.png` |
| Close-up: construction and material | `monument_A_detail.png` | `monument_B_detail.png` |
| Reveal state | `monument_A_reveal.png` | `monument_B_reveal.png` |

### 3.3 Alternative B · Laminated
- **Form:** four bronze plates per character with 10 cm gaps, threaded on dark steel spacer pins, on a dark steel base.
- **Reveal:** the plates slide apart along the pins.
- **Why:** the most "engineered" reading, and it continues the "look beneath" layering idea.
- **Weakness:** at arrival distance it reads busier and the symbol is slightly less crisp. Light through the gaps also adds visual noise on small screens.

### 3.4 Recommendation
**A · Cast**, plus B's exposed steel pins at the base connection, to say "engineered" without cluttering the silhouette. If approved, F2 adds:
- final edge bevels;
- subtle casting imperfections in the bake;
- an environment reflection for the bronze on the desktop tier;
- a mechanically sequenced reveal (seam light first, then the halves part).

### 3.5 Budget estimate
About 3,000 triangles for A (B about 5,000), plus 2 draw calls: the bronze and steel materials are reflective, so they can't share the unlit atlas. That's negligible.

---

## 4. FlowDesk gallery redesign

Board 2 of `docs/phase-2f/f1-mockups.html` has the plan.

**Concept:** one hall read left to right as the journey of one order. **Customer → FlowDesk → Shop owner.**

| Zone | Physical exhibit | Screen content | Interaction |
|---|---|---|---|
| **1 · The customer** (west wall) | A 2.4 m portrait "phone wall" in a bronze frame; a kiosk and bench | The live WhatsApp-style conversation (HTML) | The visitor sends the customer's messages |
| **2 · FlowDesk** (centre) | A long basalt **pipeline table** with seven bronze stations: intake, queue, understanding, grounding, guardrails, money, shop view. An order slip travels along it. The price-floor gate is a physical bronze stop at station 5 | Station labels (DOM) light up as each step runs | **Look beneath:** the table lid lifts to show the darker Night Foundry pit, with the verified modules and Plain ⇄ Technical captions |
| **3 · The shop owner** (east wall) | An owner dashboard wall beside the stocked shop counter | The order board and payment state (HTML): "Recorded · payment unconfirmed until checked" | Ends the story: what the owner actually sees |

**Physical integration**
- **The blank teal screen goes.** In the 3D scene, each display shows a **faithful reconstruction** of the current state, rendered to a small texture and labelled "Reconstruction". If D8 is approved, real QA screenshots are used where they match.
- **Interactive text is always HTML:** the interaction view on mobile, a side panel on desktop. It's never a low-resolution 3D texture.
- **Verified behaviour:** the scenario stays the one implemented at Checkpoint D (catalogue price → offer below the floor refused → order recorded → payment unconfirmed → owner view). It's still sourced from `pricing/ladder.ts` and `assistant/router.ts`, and still labelled **Simulation**.

**Cost:** about +12k triangles and +4 draw calls. The FlowDesk room stays well under its 120k / 40 budget.

---

## 5. Mobile interaction model

Board 1 of the mockups.

| State | What the visitor sees |
|---|---|
| **A · Explore** (default) | A full-screen scene under a **34 px bar** (PEREZ wordmark + `</>`, Quick View, Contact). A one-line caption peek and a compact dock (‹ · stop n/7 ▾ · ›). Swipe the scene to change stop |
| **B · Context sheet** | Opens to half height on demand. The camera reframes upward so the subject stays visible. Stop-specific actions such as "Look beneath" |
| **C · Exhibit view** | Full screen, HTML, readable. "‹ Museum" returns to the exact stop. Step progress |
| **D · Stops sheet** | Stops grouped by room with status chips. An explicit **"Leave 3D · Quick View"** exit |

**Rules**
- Safe-area insets respected throughout.
- Sheets and camera cut instead of animating under reduced motion.
- Every caption still exists as DOM text.
- The non-WebGL path is unchanged (Quick View).
- On desktop, today's side panel is narrowed to 340 px, with the same content model.

**Proposed stop names**
1. The Court
2. **The Code Monument** (replacing The Stratum)
3. The threshold
4. Customer · System · Shop
5. Play the customer
6. **The owner's view** (replacing The order, recorded)
7. Look beneath

---

## 6. Performance investigation plan (iPhone results)

### 6.1 What the numbers say
- **The sampling.** The benchmark takes one sample per second: frames counted ÷ time elapsed since the last sample.
- **Threshold.** **"0 / 0" means no samples at all** during that stop's 5-second window. The render loop produced no frames for about 5 s; it wasn't merely slow.
- **Hall.** The first sample after a pause spans the whole gap, so it comes out very low. The Hall's **minimum of 6 fps (average 42)** is that sample.
- **Conclusion:** one **stall of roughly 5–8 seconds** started during the Threshold stop and ended early in the Hall. Every other stop held 58–60 fps, so steady-state rendering on iPhone is excellent.

### 6.2 Candidate causes, most likely first
1. **First GPU upload of FlowDesk on Safari.** FlowDesk is already downloaded by then (prefetch), but three.js uploads its geometry and texture on the **first frame it's visible**, at the threshold. Safari decodes a WebP image synchronously at upload time and generates mipmaps on the main thread. Not normally seconds, but Safari is known to be slow here.
2. **Meshopt / WebAssembly or image decoding on iOS** if the prefetch hadn't finished when the visitor reached the threshold.
3. **Benchmark artefact:** Safari pauses `requestAnimationFrame` while the page is scrolled or touched, or while the tab is briefly backgrounded (a notification, switching apps).
4. **A React/Suspense remount** of the scene when FlowDesk mounts, flagged for checking but unlikely given the code.

### 6.3 Instrumentation to add in F3
The benchmark will report, per stop:
- **steady-state fps**, measured only after a "scene ready" signal;
- **transition frame times**: longest frame, and counts of frames over 50 ms and over 100 ms;
- **stalls**: every gap between frames over 250 ms, with the stop it happened at and what was loading;
- **timeline marks**: download start and end, parse end, first draw of each room (scene activation time), texture uploads;
- **page events**: `visibilitychange`, `pagehide` and context loss/restore, to rule out cause 3;
- **renderer stats**: draw calls, triangles, textures, geometries.

A stop with no frames will be reported as **"no frames rendered (stall)"**, not "0 fps".

### 6.4 Remediation to test (A/B behind a URL flag, measured on your iPhone)
- **Pre-warm:** upload FlowDesk's geometry and texture (`renderer.initTexture`, `renderer.compile`) while the visitor is still in the Court, during idle time, not on first sight.
- **KTX2 textures:** GPU-compressed formats upload without decoding or mipmap generation on the main thread. They're also needed anyway once detail textures are added. Requires installing KTX-Software (your approval).
- **Gate the camera:** don't start the flight into FlowDesk until it's activated, so any remaining stall happens behind a brief threshold pause rather than mid-motion.

---

## 7. Files and assets that would change

| Phase | Files |
|---|---|
| **F2 · Blender** | `blender/scripts/rooms/court.py`: facade bay types, portal, floor, landscaping, accent lights<br>`blender/scripts/rooms/flowdesk.py`: three-zone layout, pipeline table, displays<br>New `blender/scripts/rooms/monument.py` and `blender/scripts/lib/planting.py`<br>`blender/scripts/lib/materials.py`: bronze, steel, detail textures<br>`blender/scripts/bake_export.py`: floor lightmap, accent lights, KTX2 output<br>`blender/src/museum.blend`: **version kept first** as `museum_phase2.blend` |
| **F2 · outputs** | `public/models/court.glb`, `public/models/flowdesk.glb` (replaced; previous versions kept in `blender/out/raw/phase2/`)<br>New tiling detail textures; `pipeline/budgets.json` only if a budget needs revisiting (with your approval) |
| **F3 · frontend** | `src/components/museum/*`: mobile states, exhibit view, monument reveal, displays<br>`src/museum/stops.ts`: renamed stops, new poses<br>`src/museum/benchmark.ts`: new metrics<br>`src/content/flowdesk.ts`<br>Arrival poster (render replaces the CSS placeholder)<br>Tests for all of it |

---

## 8. Estimated performance impact

| | Today | After F2 (estimate) | Mobile budget |
|---|---|---|---|
| Court triangles | 10.7k | ~45k (facades +10k, planting +25k, monument +3k) | 150k |
| FlowDesk triangles | 4.4k | ~16k | 120k |
| Draw calls, both rooms | 25 | ~40 | 100 |
| Texture memory | 26.6 MB | ~40 MB with WebP; ~12 MB with KTX2 | 128 MB |
| Download, both rooms | ~470 KB | ~1.1–1.4 MB | 2.7 MB |
| Court bake time (this laptop) | 41 min | ~60–90 min | — |

These are estimates; F4 measures them on your iPhone and the HD 520 laptop against today's baseline.

---

## 9. Decisions requiring your approval

1. **Code Monument:** A · Cast (recommended), B · Laminated, or a mix.
2. **Pool and plinth:** keep the pool with a new long plinth (proposed), or another arrangement.
3. **Courtyard corrections in §2:** all of them, or a subset.
4. **Landscaping direction:** tropical canopy trees plus palms in layered beds. Any species you particularly want, or want avoided?
5. **FlowDesk three-zone redesign (§4)**, and **D8**: may real QA screenshots be used, or reconstructions only?
6. **Mobile interaction model (§5)**, including the renamed stops.
7. **Branding (Board 3):** `</>` as a secondary mark beside PEREZ, for loader, navigation and signage. The wordmark is unchanged.
8. **KTX2:** approve installing KTX-Software for texture compression.
9. **Longer bakes:** about 1–1.5 hours for the Court on this laptop, run in the background.

I'll start F2 only after your approval.
