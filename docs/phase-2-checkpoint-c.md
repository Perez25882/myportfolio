# Phase 2 · Checkpoint C report: Visual detailing

**Date:** 2026-10-27  
**Status:** detailing complete and rendered in daylight. **Waiting for your approval before Checkpoint D** (interaction and the FlowDesk demonstration).

## 1. What was implemented

### Architecture (Court)
- **Upper floors in a tropical-modernist language:** concrete fins every 1.2 m over recessed glazing, between an exposed slab edge and a parapet band.
- **Verandah:** timber ceilings over the shaded walkway.
- **Thresholds:** lined in basalt; the east and west ones are closed with basalt infill.
- **Seam Screen towers:** now true see-through timber lattices on the 0.4 m screen-block module, with basalt bases and concrete caps. Morning sun through them throws patterned shadows across the court, the signature light effect from the creative direction.
- **Floor:** terrazzo laid in 2.4 m north–south strips, the strip-weaving principle used as construction logic, not as a pattern. Bronze seam inlays run from the pool to each threshold.
- **Planting:** four raised beds with shrubs and three-lobed tree canopies.
- **Removed:** a bronze rail along the terrace edge, after review, because it cut across the arrival view.

### FlowDesk hall
- **Daylight:** a slatted timber clerestory along both long walls and a louvred skylight slot along the roof axis.
- **Vestibule:** timber ceiling; the bronze seam inlay continues in from the Court.
- **Exhibits detailed:**
  - **Conversation wall:** bronze frame on a basalt base.
  - **Kiosk:** bronze-edged top.
  - **Architecture table:** timber, with a bronze spine through the seven layers.
  - **Shop:** three stocked shelving units and a basalt-topped counter.
  - **Ledger table:** carries the order slab.
  - **Also:** a bench and two potted plants.
- **Gallery lighting:** ten warm (about 3000 K) ceiling panels, kept in `BAKE_LIGHTS_flowdesk`: used for baking, never exported.

### Materials
All in `blender/scripts/lib/materials.py`, procedural and driven by world-space coordinates, so they work on merged meshes:

| Material | Treatment |
|---|---|
| Laterite concrete | Warm mottling, horizontal board lines every 0.3 m |
| Terrazzo | Two-tone strips with stone chips |
| Basalt | Dark, low-gloss with variation |
| Timber | Grain via wave texture |
| Bronze | Metallic patina |
| Water, foliage, earth, glazing, display, cardboard | Simple physically based surfaces |

### Lighting
- **Sun:** mid-morning, from the south-east at 30°, warm. This is a three-quarter light on the arrival view: it lights the north facade and throws the lattice shadows diagonally across the court.
- **Sky:** a physical sky (Blender's multiple-scattering model) at low strength, for contrast.
- **Interiors:** shots get +0.8 exposure, as a photographer would.

### Performance structure
Static geometry is now merged per material per room. Parts that change at runtime stay separate:
- the 12 Stratum layers and its spine;
- the chat and kiosk screens;
- the 7 architecture layers;
- the order slab.

| Collection | Draw calls (budget) | Triangles (budget, mobile) |
|---|---|---|
| `EXPORT_court` | **22** (≤ 60) | **10,756** (≤ 150k) |
| `EXPORT_flowdesk` | **19** (≤ 40) | **4,388** (≤ 120k) |

At Checkpoint B, before merging, the Court alone was 100 objects.

## 2. Files created or changed

- **New:**
  - `blender/scripts/build_museum.py`: build and save `museum.blend`.
  - `blender/scripts/render_cli.py`: daylight renders in a background Blender process.
- **Rewritten:**
  - `lib/geometry.py`: `Batch` merges per material, plus a lattice builder.
  - `lib/materials.py`: procedural library.
  - `rooms/court.py`, `rooms/flowdesk.py`: detailing.
  - `review.py`: sun, sky, Cycles, per-shot exposure.
- **Removed:** `build_blockout.py`. It was replaced by `build_museum.py`; the blockout itself is kept as `blender/src/museum_blockout.blend`.
- `blender/README.md` updated.

## 3. Blender assets generated

| Asset | Notes |
|---|---|
| `blender/src/museum.blend` | Current scene |
| `blender/out/previews/checkpoint-c/*.png` | 7 Cycles daylight renders, 75% resolution (1200 × 675 / 675 × 1200 / 900 × 900), 40 samples, denoised |
| `blender/out/previews/checkpoint-c/massing/*.png` | 7 Workbench massing renders |

No GLBs yet (see §6).

## 4. What was tested

- The build is idempotent across repeated runs: identical counts and no duplicated data.
- Sun direction verified by raycasting from the court toward the sun. The court floor and north facade are sunlit; the expected spots are shaded by the Stratum.
- **Fixed during review:**
  - a solid terrace rail across the arrival view;
  - a dark FlowDesk hall, fixed with gallery lighting and interior exposure;
  - flat, front-lit court lighting, fixed by moving the sun to a three-quarter angle;
  - basalt too glossy, so it read as water;
  - a stale-module bug in my own rebuild loop.

## 5. Measured performance

| Measure | Value |
|---|---|
| Cycles render, 75% resolution, 40 samples, i5-6200U CPU | 71–129 s per shot; about 12 min for all seven |
| Cycles, 50% resolution, 32 samples | 40–51 s per shot |

Real-time performance in the browser is not measured yet; nothing is exported.

## 6. Known issues and what moves to Checkpoint D

1. **Lighting is not baked yet.** The procedural materials and lights render in Blender but don't export to glTF. At the start of Checkpoint D I will:
   - unwrap lightmap UVs;
   - bake one lightmap atlas per room (1K mobile, 2K desktop);
   - export per-room GLBs;
   - measure bake time and file size.

   Phase 0 estimated 5–20 minutes per room on this laptop.
2. **Screens are flat teal placeholders.** In the browser they will be live HTML, the actual simulated chat and kiosk. No real FlowDesk screenshots are used, pending D8.
3. **Trees and shrubs are low-poly placeholders.** Proper planting is best done as a few baked card or GLB assets in Checkpoint E, within budget.
4. **The sky below the horizon renders dark navy** in the aerial and cutaway views. It is never seen from visitor eye height; a ground horizon will be added if those views are ever used.
5. **People are silhouettes for scale** and are never exported.

## 7. What requires your approval

1. **The visual direction of these renders:** materials, the timber lattice towers, the fins and glazing, the light quality.
2. **The FlowDesk hall with gallery lighting:** warm and bright, as in a real exhibition space.
3. **Proceeding to Checkpoint D:** bake and export the GLBs, put the courtyard and FlowDesk room in the browser with navigation, and build the scripted FlowDesk demonstration (order → products identified → lower offer → price floor holds → order recorded → system architecture), labelled as a simulation.

For Checkpoint D I need **D8**: may I use the FlowDesk film scenario (the rice order, the GHS 90 offer against a GHS 95 floor) and QA screenshots? Without it I'll write an equivalent illustrative scenario, clearly labelled, using only behaviour verified in the code.
