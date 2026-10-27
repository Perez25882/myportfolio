# Phase 2 · Checkpoint B report: Blender blockout

**Date:** 2026-10-27  
**Status:** blockout built and rendered. **Waiting for your approval before Checkpoint C** (detailing, materials, lighting).

## 1. What was implemented

Simple architectural massing for the Court and the FlowDesk wing, built entirely by version-controlled Python scripts through the Blender MCP. No decoration, textures or lighting work yet.

**The Court** (36 × 36 m, open to the sky)
- A two-storey verandah building, 7.2 m deep and 10.8 m high, rings the court. Columns every 3.6 m carry the upper floor over a shaded walkway.
- **North:** the FlowDesk threshold (7.2 wide × 5.4 high), flanked by two **timber screen towers** 21.6 m high that mark the axis.
- **South:** the arrival terrace at +1.8 m with six steps down into the court.
- **East and west:** closed basalt thresholds where the other wings will go later.
- **Centre:** a shallow pool, a basalt plinth and **the Stratum**: 12 basalt layers on a bronze spine, 6 m to the top, hovering 0.3 m above its plinth.
- Four planting beds with tree placeholders.

**The FlowDesk wing**
- A low vestibule (4.8 m) behind the threshold opens into a 14.4 × 28.8 × 10.8 m daylit hall, with a timber-screen clerestory along both long walls.
- Exhibit volumes, from the entrance:
  - the **conversation wall** (the WhatsApp-style display);
  - the **kiosk** where the visitor plays the customer;
  - the **architecture table**, a seven-layer "Look beneath" model of the system;
  - the **shop setting** (shelves and a counter), representing the business FlowDesk serves;
  - the **ledger table**, where the recorded order lands.

Red cylinders are 1.75 m scale figures. They are reference only and never exported.

## 2. Design decisions that need your approval

Your Phase 2 brief asks for natural daylight, human scale, realistic geometry and no floating machinery, and the approved concept image shows an open-air courtyard. The Phase 1 master plan, whose structure (P1-2) was not yet approved, described something different. I followed the brief:

| Phase 1 plan | Blockout | Why |
|---|---|---|
| Enclosed Court 43.2 m high with an oculus | Open-air court ringed by a 10.8 m verandah building | Natural daylight, human scale, matches the concept image |
| Stratum 14.4 m tall, hovering 6 m | Stratum 6 m tall, hovering 0.3 m in a pool | Restrained surrealism; reads as a real sculpture |
| Arrival landing cantilevered at +7.2 m | Arrival terrace at +1.8 m with steps | Believable construction; same off-axis first view |
| Conversation Engine: a 21.6 m machine | A gallery around a real shop setting, a display, a kiosk and an architecture model | "Projects must look and behave like the actual software" |
| Threshold 10.8 m high with a dog-leg | 5.4 m opening, then a low vestibule that releases into the hall | Human scale; compression then release replaces the dog-leg |

Kept from Phase 1: the 1.2 m module, the courtyard hub, FlowDesk on the north axis, a 12-layer Stratum, and closed thresholds for later wings.

## 3. Files created or changed

- `blender/scripts/build_blockout.py`: entry point (build, save, render).
- `blender/scripts/review.py`: seven review cameras, Workbench settings, preview rendering.
- `blender/scripts/lib/{geometry, materials, guard}.py`: builders, material library, idempotent rebuild.
- `blender/scripts/rooms/{court, flowdesk}.py`: the two rooms.
- `blender/README.md`: how to rebuild.
- `.gitignore`: ignores Blender backup files and raw exports.

## 4. Blender assets generated

| Asset | Size |
|---|---|
| `blender/src/museum_blockout.blend` | 155 KB |
| `blender/out/previews/checkpoint-b/*.png`: 7 renders | about 1.2 MB each |

| Collection | Objects | Triangles | Materials |
|---|---|---|---|
| `EXPORT_court` | 100 | 1,536 | 8 |
| `EXPORT_flowdesk` | 33 | 396 | 6 |

The object counts are far above the draw-call budget only because the blockout keeps every box separate for easy editing. Static parts are merged per room at Checkpoint C/E, as the Technical Art Plan specifies. No GLBs were exported at this checkpoint.

## 5. Preview renders

All in `blender/out/previews/checkpoint-b/`. Workbench engine: flat colours with soft shadows, for massing review only.

| File | What it shows |
|---|---|
| `arrival_landscape.png` | Desktop first view from the terrace: Stratum, twin towers, FlowDesk threshold on axis |
| `arrival_portrait.png` | Mobile first view: sky, towers, Stratum, threshold stacked vertically |
| `court_aerial.png` | Overall massing of the courtyard |
| `plan_top.png` | Plan: court, verandah, beds, pool, terrace, FlowDesk wing |
| `flowdesk_entry_landscape.png` / `_portrait.png` | View from the vestibule into the hall |
| `flowdesk_cutaway.png` | The hall with its roof hidden, showing the exhibit layout |

## 6. What was tested

- The build runs end to end from scripts and is **idempotent**: three consecutive runs give identical counts (100 / 33 objects) and no duplicated data.
- All seven renders were produced and reviewed. Renders take 0.7–1.3 s each on the HD 520 laptop.
- **Fixed during review:** the scene was too dark (switched from AgX to the Standard view transform); four holes at the roof corners; a column and a scale figure in front of the cameras; an arrival view where the Stratum hid the threshold.
- **Not tested:** nothing is in the browser yet. Real-time performance can only be measured once GLBs exist (Checkpoints D–E).

## 7. Measured performance

Not applicable yet: no web 3D at this checkpoint. Triangle counts above are far under budget (Court budget ≤ 150k on mobile).

## 8. Known issues

1. **The FlowDesk hall reads dark in previews.** Workbench shades it under its roof with no bounce light. Clerestory daylight is baked at Checkpoint C.
2. **Placeholder forms:** trees are spheres, the screen towers are solid (no lattice yet), and glass is not modelled.
3. **Arrival from outside** (approach steps to the south gate) is not modelled; the visitor starts on the terrace.
4. Blender's default startup collection (cube, camera, light) is still in the file, excluded from the view layer. It is harmless; I left it rather than delete anything I didn't create.

## 9. What requires your approval

1. **The adaptations in §2**, especially the open-air court and the 6 m Stratum.
2. **The FlowDesk room layout:** conversation wall → kiosk → architecture table → shop → ledger table.
3. **Proceeding to Checkpoint C:** screen lattice, board-formed concrete, baked daylight, planting, and real exhibit forms.

Your founder answers (D1, D3, D5, D8, contact) are still outstanding. D8 (film scenario and screenshots) is needed by Checkpoint D.
