# Phase 2 · Checkpoint D report: Bake, export, navigation and the FlowDesk demonstration

**Date:** 2026-10-27  
**Status:** complete and verified in the browser on the development laptop. **Waiting for your approval before Checkpoint E** (optimisation and the performance report).

## 1. What was implemented

### Baked lighting and GLB export
`blender/scripts/bake_export.py` runs in a background Blender process. For each room it:
1. packs every object into one shared UV space with uniform texel density;
2. bakes Cycles lighting into one texture atlas;
3. denoises the atlas with OpenImageDenoise (through the Blender 5.x compositor);
4. saves it with the same colour transform as the review renders;
5. merges static parts and exports one GLB per room to `public/models/`.

| Room | Atlas | Bake time (i5-6200U CPU) | GLB size | Downloaded (compressed) |
|---|---|---|---|---|
| Court | 2048 px, 24 samples | 41 min | 755 KB | **438 KB** (budget 1.5 MB) |
| FlowDesk | 1024 px, 32 samples | 6.8 min | 324 KB | **186 KB** (budget 1.2 MB) |

Lighting is baked, so the browser draws every surface unlit (`MeshBasicMaterial`): no real-time lights or shadows on any device.

### The 3D museum (`/museum`)
- **Rooms:** the Court loads first; FlowDesk is lazy-loaded 1.5 s after the Court appears, or immediately if the visitor heads there.
- **Seven tour stops:** The Court → The Stratum → FlowDesk threshold → Inside FlowDesk → Play the customer → The order, recorded → Look beneath the surface. Each has a landscape and a portrait composition.
- **Camera:** it flies between neighbouring stops and fades for longer jumps, so it never passes through walls. It cuts instantly when the visitor has asked for reduced motion.
- **Navigation:** Previous / All stops / Next with 44 px targets, arrow keys, Esc, and deep links (`/museum?stop=beneath`).
- **Accessibility:** every caption is in the DOM; the canvas is hidden from screen readers.
- **Performance controls:**
  - resolution capped at 1.5× on touch devices and 2× on desktop, and lowered automatically if frame rate drops;
  - the scene only redraws while something moves;
  - `?perf=1` shows a live frame-rate counter.
- **Failure handling:**
  - no WebGL sends the visitor to Quick View;
  - a lost WebGL context shows "Try again", Quick View or the case study;
  - a model that fails to load shows the same fallback without breaking the page;
  - a slow connection shows a message after 8 s;
  - "Skip to Quick View" is offered while loading.

### The FlowDesk demonstration
A deterministic, scripted conversation, labelled **Simulation**: "Scripted from FlowDesk's verified behaviour. Not a live WhatsApp connection, and not real customer data." The visitor plays the customer:

| Step | Customer | What FlowDesk does (verified in the code) |
|---|---|---|
| 1 | "Do you have the wax print, half piece? I need two." | Matches the product in the catalogue; replies with its real price: GHS 250 each, GHS 500 for two |
| 2 | "Can you do GHS 200 each?" | GHS 200 is not on the item's price ladder (list 250, floor 230): refused. The reply can only quote a price that exists: GHS 230 each |
| 3 | "Okay, 460. I'll pay with MoMo." | The order goes through order creation and onto the owner's board; payment stays unconfirmed until checked. The camera moves to the ledger table and the order slab appears |
| 4 | See how it works | The camera moves to the architecture table; its seven layers part; Plain ⇄ Technical captions |

The behaviour comes from `services/pricing/ladder.ts`, `services/assistant/router.ts` ("A price below the floor never goes out, in any mode") and the payment confidence ladder. The product and prices are illustrative. The film scenario and screenshots were not used, pending D8.

**Correction:** the first version said "Ankara". That is the Nigerian term, so it was changed to wax print, sold by the half piece, paid with MoMo.

## 2. Files created or changed

- **Blender:** `blender/scripts/bake_export.py` (new).
- **Generated:** `public/models/court.glb`, `public/models/flowdesk.glb`; `blender/out/bake/*_atlas.png`.
- **Museum logic:**
  - `src/museum/stops.ts`: stops, poses, Blender-to-three.js coordinates;
  - `src/museum/demo.ts`: the scripted demonstration;
  - `src/store/museum.ts`: tour and demo state;
  - `src/lib/motion.ts`: reduced-motion and touch detection.
- **Components:** `src/components/museum/{MuseumExperience, MuseumCanvas, TourPanel, DemoPanel}.tsx` and `museum.module.css`.
- **Changed:**
  - `MuseumGate.tsx` and `app/museum/page.tsx`: full-screen experience;
  - `globals.css`: `.visually-hidden`;
  - `vitest.config.mts`, `vitest.setup.ts`: matchMedia stub, WebGL canvas excluded from coverage;
  - `eslint.config.mjs`: ignore generated coverage.
- **Tests:** `stops.test.ts`, `demo.test.ts`, `TourPanel.test.tsx`, `MuseumExperience.test.tsx`; `routes.test.tsx` updated.
- **Dependencies:**
  - added: `three` 0.186.1, `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9, `@types/three`;
  - GSAP was not needed: camera easing is about 20 lines of code.

## 3. What was tested

| Check | Result |
|---|---|
| Unit and component tests | **60 / 60 pass** (10 files) |
| Coverage | 95.6% statements · 92.4% branches · 96.2% functions · 97.6% lines |
| Lint, typecheck | Clean |
| Production build | Passes; all routes static |
| Browser, production build, HD 520 laptop | All seven stops; the full demonstration replayed step by step; layers part at "Look beneath"; deep links work |
| Phone layout (375 × 812 emulation) | Portrait composition; canvas capped at 1.5× (562 × 593 px); no horizontal scroll |

The WebGL canvas itself is not covered by unit tests (jsdom has no WebGL); it was verified in the browser.

## 4. Measured performance

Development laptop (Intel HD 520, Chrome/ANGLE D3D11), production build, `?perf=1`, a 663 × 598 browser pane at device pixel ratio 1.375:

| Stop | Average fps | Lowest 1 s sample |
|---|---|---|
| The Court | 60 | 58 |
| The Stratum | 55 | 43 |
| Threshold | 59 | 58 |
| Inside FlowDesk (just loaded) | 51 | 27 |
| Play the customer | 53 | 25 |

Single-second dips line up with camera flights and FlowDesk's texture being uploaded to the GPU.

**Not measured yet:** real phones, full-screen desktop, Safari and Firefox. Phone performance is the release gate and belongs to Checkpoint E. I can't claim the 30 fps mobile target until it's measured on actual devices.

## 5. Known issues

1. **No real-device testing yet** (see §4).
2. **Atlas resolution:** the Court atlas gives about 7 cm per texel on the floor. Lattice shadows are soft, and tiny slat surfaces can bleed slightly at grazing angles.
3. **Bake time:** 41 minutes for the Court on this laptop. Any lighting change costs a long re-bake; Checkpoint E could bake on a faster machine or bake only what changed.
4. **No compression yet:** GLBs are not Meshopt/KTX2-compressed. That's Checkpoint E: likely about half the size, and less GPU memory.
5. **Placeholders:** the chat and kiosk screens in 3D are flat colour (the live chat is in the panel), and the trees are low-poly.
6. **No free exploration:** navigation is by stops only. Drag-to-look was left out to keep touch handling simple.
7. **Nothing is committed to git.**

## 6. What requires your approval

1. **The 3D tour and its seven stops**, and the demonstration script as now worded (wax print, half piece, MoMo).
2. **The illustrative prices** (GHS 250 list, GHS 230 floor, GHS 200 offer). Please correct them if they don't feel right for a Ghanaian shop.
3. **Proceeding to Checkpoint E:**
   - Meshopt and KTX2 compression;
   - a budget check;
   - testing on real mid-range Android phones and an iPhone;
   - full-screen desktop measurements and Lighthouse;
   - the performance report.

Still open from earlier: **D8** (film scenario and screenshots), **D1** (attribution), **D3** (FlowDesk repo clean-up), **D5** (Accra We Dey), and contact details.
