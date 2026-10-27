# Phase 2F · F3: Frontend integration

**Date:** 2026-10-27  
**Status:** integrated and checked on this laptop, at desktop and phone-sized viewports. **Stopped for your approval.** There are no real-device numbers yet; those belong to F4.  
**Nothing is committed or deployed.**

## 1. Texture budget: KTX2 (your instruction)

KTX-Software 4.4.2 is installed from Khronos's signed installer, at `C:\Program Files\KTX-Software`. `pipeline/optimize.mjs` now encodes every texture as KTX2:

- **Lightmaps:** ETC1S, quality 220.
- **The two interface screens:** UASTC, which keeps small text sharp.
- **Sizes:** textures that aren't a power of two are resized to the nearest power of two.

The browser transcodes them with three.js's Basis transcoder, served from `public/basis/`.

KTX2 textures stay compressed on the GPU, at about a quarter of the memory of decoded WebP. They also skip the main-thread image decode and mipmap generation at upload. That decode and mipmap work is the prime suspect for the Phase 2 iPhone freeze at the Threshold.

| | Download | Triangles | Draw calls | GPU textures | Budget |
|---|---|---|---|---|---|
| Court | 1,026 KB | 22,048 | 8 | 10.7 MB (F2 WebP: 42.7 MB) | 1.5 MB · 150k · 60 · 40 MB ✓ |
| FlowDesk | 412 KB | 4,480 | 7 | 2.7 MB | 1.2 MB · 120k · 40 · 32 MB ✓ |
| Both resident | 1.4 MB | 26,528 | 15 | 13.4 MB | 300k · 100 · 128 MB ✓ |

These are now the served models: `public/models/court.glb` and `flowdesk.glb`. The Phase 2 versions are backed up in `blender/out/served-phase2/`, outside `public/` so they don't ship.

## 2. Bugs found while integrating, and their fixes

| Symptom | Cause | Fix |
|---|---|---|
| Court never finished loading ("Opening the Court… 0%") | three-stdlib's `KTX2Loader` is older than the r186 transcoder and hangs silently with it | Use three's own `KTX2Loader` (`MuseumCanvas.tsx`) |
| Monument read as matte cardboard | Blender drives the bronze's roughness from a brushed-grain node that glTF can't carry, so the export fell back to roughness 1.0 | Cast-bronze roughness is set in the runtime (0.38) |
| FlowDesk's rail, stations and floor path, and the Court's bronze inlays, steel rib and bolts, were black | The bake skips glossy light (correct for an unlit atlas), and a metal has no diffuse light, so it baked black | Metals bake as their base colour: `bake_export.py` zeroes Metallic during the bake and restores it afterwards. Both rooms rebaked |
| FlowDesk screens were black | The 540×1000 screen texture's smaller mip levels aren't whole 4×4 blocks, so ANGLE leaves the compressed texture incomplete | Power-of-two resize in the KTX2 step (512×1024 and 1024×512) |
| Screens then showed only a dim, blurry ghost of their content | Each screen faced into its wall, so browsers hid it as a back face. What showed was the bronze frame 1 cm behind it, which had baked a soft copy of the screen's glow. Blender renders both sides, so the F2 previews never showed this | `flowdesk.py` `_screen()` now builds each screen facing the room and reading left to right. museum.blend rebuilt from the scripts; FlowDesk rebaked |
| Screen text smeared | ETC1S is designed for photographic lightmaps | UASTC for the two screens, plus 8× anisotropic filtering |

The F2 previews showed none of the black-metal or screen-facing problems, because they were full Cycles renders rather than bakes. Recoverable copies:
- `blender/src/museum_f2.blend`: the approved F2 scene, before the screen fix.
- `blender/out/{bake,raw}/f2-premetal/`: the pre-fix bakes and raw GLBs.

## 3. What is integrated

**Code Monument.**
- The cast-bronze `</>` uses a real-time metal material lit by a small reflection environment.
- "Look beneath" parts each character along its seams to show the steel core. "Close the casts" closes them.
- Reduced motion snaps instead of easing.
- Stop 2 of 7.

**FlowDesk: one order's journey.** The approved Customer → FlowDesk → Shop owner layout is in place:

- **Hall.** Looks down the pipeline table to the owner's board.
  - The caption now reads: "from the customer's phone wall by the entrance, down FlowDesk's pipeline, to the shop owner's board at the far end".
  - The two screens face each other from opposite ends of the hall, so no single view shows both. The earlier caption ("chat on the left … owner's view on the right") promised a frame that doesn't exist.
- **Play the customer.** Square-on to the phone wall. The reconstructed chat (wax print, half piece, GHS 230 floor, MoMo) is readable in the room and in the panel.
- **The owner's view.** Square-on to the order board, with the counter where the order slab appears once the order is recorded.
- **Look beneath.** The lid lifts over the seven pipeline modules.
- **Unchanged simulation.** Both screens and the panel keep their "Reconstruction · Simulation" and "Not a live WhatsApp connection, and not real customer data" labels. The script, the GHS 230 floor refusal and "unconfirmed until checked" are as before.

**Arrival page.** The CSS placeholder, which still had a Stratum stand-in, is replaced by two Cycles renders of the courtyard: `review.py` `CAM_poster_landscape` and `CAM_poster_portrait`, 64 samples.
- **Desktop:** the monument sits right of the text.
- **Phone:** the poster is a band sized to the screen width, so the monument always lands above the text.
- **Delivery:** WebP sources (111 KB and 79 KB), served through Next's optimiser with art direction.

**Phone tour.**
- **Sheet.** The panel is a sheet over the full-screen scene. Elsewhere it's a caption peek; on the two demo stops it's open. "More"/"Less" now works on every stop; before, "Less" did nothing on the demo stops.
- **Stop list.** "All stops" opens the sheet. Before, it did nothing on a phone, because the collapsed sheet hid the list.
- **Exit.** The stop list ends with **Leave 3D · Quick View**.
- **Composition.** The phone composition of the monument stop is pulled back, so the ">" isn't cropped.

## 4. Benchmark instrumentation (for the F4 iPhone run)

`?perf=1 → Run benchmark` now records what the Phase 2 report could not explain:

- **Arrival vs standing still.** Each stop is measured twice: the 1.5 s camera move into it, then 5 s standing still. Uploads and shader compiles land in the first window.
- **Frame timing.** The longest frame, and the number of frames over 50 ms and over 100 ms, per stop. It's measured on the wall clock, because three.js's clock would hide a frozen main thread inside one large delta.
- **Stalls.** Any gap over 250 ms between frames is recorded, with its time and the stop it happened at. A stall during the run fails the 30 fps target, however high the average.
- **"No frames rendered (stall)"** replaces the old "0 / 0" row, which looked like a measurement.
- **Timeline.** Court ready, FlowDesk ready, tab hidden/visible and pagehide. Gaps while the tab is hidden don't count as stalls.
- **Model timing.** When each GLB was requested, and how long it took.

FlowDesk now **uploads its textures and compiles its shaders as soon as it loads**, while the visitor is still in the Court (`gl.initTexture` and `gl.compile`). Before, it paid for them on the first frame that saw the room. I confirmed by intercepting WebGL calls that all three FlowDesk textures upload at full resolution with complete mip chains (BC7 on this laptop).

## 5. Checks

- **Unit and component tests:** 74 pass in 11 files. Eight are new: stall verdicts, the arrival/steady split, the stall wording, the stop-list exit, and sheet behaviour on phones and demo stops.
- **Typecheck and production build:** clean.
- **Lint:** clean. One warning remains, in the generated `coverage/` folder.
- **Pipeline:** `node pipeline/budget.mjs` reports all models within budget.
- **Browser, this laptop (production build, Intel HD 520):**
  - every stop renders at 1440×900;
  - the monument stop and arrival page render at 375×812;
  - both screens are readable and the right way round;
  - models and transcoder load with HTTP 200.
- **Test-environment note.** My in-app browser pane is hidden while I work, and a hidden page gets no animation frames. So the museum appears to "hang" at 0% until something forces a frame. This is not an app bug: a visible tab loads the Court in a few seconds. It does mean I could not take valid frame-rate numbers here; desktop benchmarks are an F4 task in a visible browser.

## 6. Known issues

1. **No real-device evidence yet.** Whether KTX2 and pre-warming remove the iPhone freeze is unproven until the F4 run on your phone.
2. **The overhead bronze rail crosses the phone wall.** It starts at the wall at 3.6 m and passes in front of the chat screen at the "Play the customer" stop. This needs a small reroute in `flowdesk.py` and a FlowDesk rebake (about 8 minutes). I'd do it at the start of F4 unless you'd rather keep the rail as designed.
3. **The owner board is a still image of the final state.** It shows the recorded order even before the visitor has played the conversation. The order slab on the counter does wait for the order, and the panel text is driven by the simulation. Making the board change with the demo needs two or three board images. Your call whether it matters.
4. **FlowDesk still reads a little sparse** at the Hall stop, and the 1024 lightmap is soft on the large walls. Both carry over from F2.
5. **Roof seam gaps** above the Court portals, visible only from the air. Carried over from F2.
6. **Review markers are still on** (`SHOW_REVIEW_MARKERS`) and must be switched off before launch. Founder answers D1, D2, D3, D5, D6, D8, P1-6, Q10, Q11 and demo prices are still open.

## 7. What needs your approval

1. **F3 as integrated:** the monument, FlowDesk screens and stops, arrival posters, and phone tour behaviour.
2. **The Hall caption change** (§3), which describes the route instead of promising all three zones in one view.
3. **Known issues 2 and 3:** reroute the rail? Animate the owner board?

On approval I'll start F4: automated and accessibility checks, desktop benchmarks in a visible browser, then a request for a fresh benchmark run on your iPhone, compared against the Phase 2 baseline.
