# Phase 2F · F2: Blender visual refinement

**Date:** 2026-10-27  
**Status:** modelled, rendered, baked and exported. **Stopped for your visual approval.** One budget item needs a decision (§5).  
**The live prototype is unchanged.** New GLBs are candidates in `public/models/f2/`; the site still serves `public/models/*.glb` until F3 integrates them.

## 1. What changed

**Code Monument (approved A · Cast)**, in `blender/scripts/rooms/monument.py`:
- three brushed champagne-bronze characters `<` `/` `>`, 4.2 m tall, on an 11.4 × 5.4 m basalt plinth in an enlarged pool;
- each character is two cast halves around a dark steel rib, with a 3 cm seam;
- bolted steel shoe plates and exposed steel pins at each base (borrowed from B);
- a warm light line along the plinth edge.

The six bronze halves are separate runtime objects for the reveal. They keep a real metal material and are not baked, so F3 can give them reflections. The Stratum is gone.

**Courtyard**, in `rooms/court.py`:
- **Portals:** all four are now **double height** (10.2 m), lined in basalt, with a lintel at the parapet. East and west are closed with basalt.
- **Upper-floor bays by type:** solid corner piers; fin bays; and timber-screen bays (every third bay) in front of the glazing.
- **Columns:** basalt bases and concrete capitals.
- **Lattice towers:** heavier, with 25 cm frame posts, rails every 1.2 m, and infill lattice. Each has a 2.4 m concrete base with a warm light band.
- **Pool:** enlarged (15.6 m inner) around the monument plinth.
- **Floor:** large-format **stone paving** (1.2 × 2.4 m slabs, running bond, 2.5 cm joints, per-slab tone). Bronze inlays kept. The floor now has its **own 2048 px lightmap**, roughly 2.4 cm per texel, against 7 cm before.
- **Accent lighting (22 lights, baked only):** tower uplights, portal grazers, verandah downlights, step-nosing lines.

**Landscaping**, in the new `lib/planting.py`:
- two spreading canopy trees, four palms, and layered beds of groundcover, shrubs and grass tufts;
- all opaque low-poly geometry (no alpha cut-outs), seeded so rebuilds are identical.

**FlowDesk**, in `rooms/flowdesk.py`: one order's journey, **Customer → FlowDesk → Shop owner**.
1. **Customer:** a 2.2 × 4.0 m portrait phone wall on the west wall, in a bronze frame; kiosk and bench.
2. **FlowDesk:** a basalt pipeline table with seven bronze stations. The **price-floor gate** is a bronze stop at station 5. An order slip sits at station 1. A liftable lid covers a dark steel pit holding the seven modules ("Look beneath", Night Foundry treatment).
3. **Shop owner:** a 5.4 × 3.0 m order dashboard on the east wall, beside the counter and stocked shelves; the order slab sits on the counter.

A bronze rail overhead and a bronze path in the floor tie the three zones together.

The two displays show **interface reconstructions** (`blender/refs/ui/*.html` → PNG). Each is labelled "RECONSTRUCTION · SIMULATION" and uses only the verified scenario: wax print, half piece, GHS 250 → offer of GHS 200 refused → GHS 460, payment unconfirmed. No real screenshots are used (D8 still open).

**Materials** added: stone paving, brushed bronze, dark steel, bark, two extra foliage tones, warm light line, two screen materials.

## 2. Preview renders

Cycles, 60% resolution, 32 samples, in `blender/out/previews/f2/`:

| File | Shows |
|---|---|
| `arrival_landscape.png` | Desktop arrival: monument, towers, double-height FlowDesk portal, trees |
| `arrival_portrait.png` | Phone arrival: stacked composition |
| `monument.png` | Hero view: bronze, seams, shoes, pins |
| `court_aerial.png` | Whole courtyard: bays, beds, palms, pool |
| `flowdesk_entry_landscape.png` | The hall from the vestibule: rail, table, dashboard |
| `flowdesk_pipeline.png` | The pipeline table and the owner zone |
| `flowdesk_cutaway.png` | Three-zone layout from above (rendered before the final screen scale-up) |

## 3. Assets and budget check

| | Phase 2 (served now) | F2 candidate | Mobile budget |
|---|---|---|---|
| Court GLB | 415 KB | **792 KB** | 1.5 MB ✓ |
| FlowDesk GLB | 183 KB | **230 KB** | 1.2 MB ✓ |
| Court triangles | 10.7k | **22.0k** | 150k ✓ |
| FlowDesk triangles | 4.4k | **4.5k** | 120k ✓ |
| Draw calls, both rooms | 25 | **15** | 100 ✓ |
| Court texture memory | 21.3 MB | **42.7 MB** | 40 MB ✗ |
| FlowDesk texture memory | 5.3 MB | **11.4 MB** | 32 MB ✓ |
| Both resident | 26.6 MB | **54.1 MB** | 128 MB ✓ |
| Bake time (this laptop) | 41 min + 7 min | **23 min + 6 min** | — |

Draw calls dropped because static parts now merge into two atlas groups per room, while the Court gained detail. Meshopt compression saved 45% (Court) and 37% (FlowDesk).

**The budget gate fails on Court texture memory: 42.7 MB against 40 MB**, from two 2048 px lightmaps that decode to RGBA on the GPU. Download size, triangles and draw calls all pass.

## 4. Backups

Nothing approved was overwritten without a recoverable copy:
- `blender/src/museum_phase2.blend`;
- `blender/out/raw/phase2/*.glb`;
- `blender/out/bake/phase2/*.png`.

The served `public/models/*.glb` files are unchanged.

## 5. Known issues and decisions

1. **Court texture memory over budget (decision needed).** Options:
   - **a. KTX2 compression (recommended).** Cuts GPU texture memory about 4–6×, to roughly 8–12 MB, and is also the likely fix for the iPhone first-view stall (F1 §6). Requires installing KTX-Software (Khronos, open source).
   - **b.** Bake the floor at 1024 px. That gives 32 MB with no install, but the floor drops to about 4.9 cm per texel and the lattice shadows soften.
   - **c.** Raise the Court budget to 45 MB, if the iPhone results allow it.
2. **The FlowDesk hall is better but still spacious.** The rail and larger screens help, but 28.8 m remains a long room for three exhibits. In F3 the camera stops will frame each zone closely; if it still feels sparse, a shorter hall (21.6 m) is a cheap geometry change.
3. **Roof seams:** thin dark gaps are visible from the aerial view above the portals. Never seen from visitor eye level; to be fixed in the next pass.
4. **Phone arrival framing:** the top half of the portrait view is sky. The camera will be lowered in F3.
5. **Display content** is reconstructions, pending D8.
6. **Nothing is committed to git.**

## 6. What needs your approval

1. **The F2 visuals**: monument, courtyard, landscaping, FlowDesk layout.
2. **The texture budget fix:** a (KTX2, recommended), b or c.
3. **Proceed to F3** (frontend integration and the mobile redesign) once 1 and 2 are settled.
