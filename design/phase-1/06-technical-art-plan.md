# F. Technical Art Plan

All budgets are **hypotheses carried over from Phase 0**. They must be validated by profiling in the Phase 4 vertical slice on real devices, including the HD 520 development laptop.

**Labels**
- **[V]** verified (tested in Phase 0).
- **[A]** assumption.
- **[R]** recommendation.

---

## 1. Modular asset strategy

Everything sits on the **1.2 m module**. A shared **kit GLB** is downloaded once and cached; each room GLB references only its own unique meshes and lightmaps.

| Kit module | Size (m) | Notes | Reuse |
|---|---|---|---|
| `KIT_wall_bay` | 3.6 × 3.6 × 1.2 | Board-formed face, bevelled reveal | All rooms |
| `KIT_wall_bay_tall` | 3.6 × 10.8 | Single mesh, so a tall bay is not three stacked bays | Court, wings |
| `KIT_screen_block` | 0.4 × 0.4 × 0.12 | Seam Screen block, ≈ 60 tris | Instanced (thousands) |
| `KIT_column` | 1.2 × 1.2 × var | Height by scale; UV2 per instance via atlas | Instanced |
| `KIT_beam` | 1.2 × 0.6 × 3.6 | | Instanced |
| `KIT_stair_tread` | 2.4 × 0.4 × 0.18 | Basalt | Instanced (great stair ≈ 240 treads) |
| `KIT_stringer_seg` | 3.6 | Bronze | Instanced |
| `KIT_threshold` | 7.2 × 6.0 × 10.8 | Passage with dog-leg | 4× |
| `KIT_plinth` | 1.2 × 1.2 × 0.9 | Basalt | Instanced |
| `KIT_seam_strip` | 1.2 length | Emissive strip | Instanced |
| `KIT_rail` | 3.6 | Bronze handrail | Instanced |
| `KIT_plaque` | 0.6 × 0.4 | Bronze frame. Text is DOM | Instanced |
| `KIT_scaffold_*` | 1.2 grid | Odum members + bronze couplers | Unfinished Wing |
| `KIT_token` | 0.12 × 0.12 × 0.02 | Bronze tile | Instanced |

**Lightmaps and instancing.** Instanced meshes share one mesh but need per-instance lightmap UVs.
- **[R] Approach:** bake per room. Merge static instances into **per-room merged meshes** at export (fewer draw calls, unique UV2).
- Keep true GPU instancing only for **dynamic or very numerous** elements: screen blocks (lit by a shared baked pattern texture), tokens, treads.

## 2. Mobile adaptation per architectural proposal

| Room | Geometry simplification | Textures | Lighting / lightmap | Instancing | LOD | Portrait framing | Touch | Streaming | Likely GPU bottleneck |
|---|---|---|---|---|---|---|---|---|---|
| Court | Screen wall → instanced blocks; ring and walls merged; bevels only within 15 m | Trim 512; lightmap 1K (mobile), 2K (desktop) | Fully baked; sculpture seams emissive | Blocks, treads | LOD0 within the Court; LOD1 (≈ 300 KB) used from the wings | Stacked vertical (S2) | Tap the sculpture / thresholds | Always resident (LOD1 when away) | Overdraw if screen blocks use alpha. **Use opaque geometry, not alpha cut-outs** |
| FlowDesk | Housings as simple bevelled boxes; detail in lightmap | 512 trim + 1K lightmap | Baked; tokens use env reflection | Tokens | 1 level | Pane + sill vertical | Message chips (DOM) | Prefetch from Court | Transparent pane: one layer only |
| LedgerMind | Very low | 512 + 1K | Baked; beam additive | Tokens, fins | 1 | Naturally vertical | Large Sell / Cut / Reconnect buttons | Prefetch | Additive beam fill rate: keep it thin |
| Accra We Dey | Diorama merged by material; houses and trees instanced | Diorama atlas 1K; character 512 | Vitrine has its own baked light | Houses, trees, umbrellas | Diorama LOD1 for the far view | Steep top-down | Pins as DOM | Stream on threshold entry | **Skinned character + diorama draw calls**: merge aggressively |
| JoyDataBundle | Towers as instanced segments | 512 + 1K | Baked; cable pulse via a uniform | Tower segments, nodes | 1 | Single tower | DOM slider | Prefetch | Low |
| Foundations | 5 bays from one parametric module | 512 earth trim + 1K lightmap | Baked slit light | — | 1 | One bay per frame | Next / prev | Stream on ramp | Low |
| Laboratory | Benches instanced; wire models as merged tubes (low radial segments) | 512 + 1K | Even baked | Benches, tiles | Models LOD by distance | One bench per frame | Bench list (DOM) | Stream on spiral | Tube geometry triangle count: cap at 40k |
| Unfinished Wing | Scaffold from Geometry Nodes → realized → merged | 512 timber trim | Baked raking | Couplers | 1 | One bay | Plaques (DOM) | Stream on stair | Thin geometry aliasing: thicken members (≥ 8 cm) |
| Open Door | Trivial | Gradient sky only | AO only | — | — | Door centred | Contact panel (DOM) | Stream on stair top | None |

## 3. Performance budgets per room (mobile / desktop)

| Room | GLB (compressed) | Tris visible | Draw calls | Texture GPU memory |
|---|---|---|---|---|
| Kit (shared, cached) | ≤ 350 KB | — | — | ≤ 8 MB |
| Court | ≤ 1.5 MB / ≤ 3 MB | ≤ 150k / ≤ 400k | ≤ 60 / ≤ 120 | ≤ 40 MB / ≤ 80 MB |
| Each wing | ≤ 1.2 MB / ≤ 2 MB | ≤ 120k / ≤ 300k | ≤ 40 / ≤ 90 | ≤ 32 MB / ≤ 64 MB |
| Accra We Dey (exception) | ≤ 2 MB / ≤ 3 MB | ≤ 150k / ≤ 350k | ≤ 50 / ≤ 100 | ≤ 40 MB |
| **Resident total (2 rooms + kit)** | — | **≤ 300k** | **≤ 100** | **≤ 128 MB** |

**Frame time targets**
- Mid-tier Android: p95 ≤ 33 ms.
- Capable devices: aim for 60 FPS.
- HD 520 laptop: ≥ 30 FPS on medium tier, as the integrated-GPU reference.

## 4. Lighting strategy

- **Static:** everything is baked in Cycles (CPU on the dev machine [V]) into per-room **lightmap atlases** on UV2.
  - Combined diffuse with AO.
  - Emissive seams are included as light sources in the bake.
- **Runtime material:**
  - **Medium/high tier:** `MeshStandardMaterial` with `lightMap` plus a small prefiltered environment (256 px) for bronze and glass highlights.
  - **Low tier:** `MeshBasicMaterial` with the baked texture multiplied in, with no real-time lighting at all.
- **Dynamic:** only machine parts and tokens get env reflections. No real-time shadows anywhere. Contact shadows are high tier only.
- **Bake budget on the dev machine:** 1K lightmaps at 64–128 samples with OIDN denoise. **[A]** Roughly 5–20 minutes per room on an i5-6200U, extrapolated from the 128 px / 8-sample test (4.4 s). Run overnight batches for 2K desktop maps.
- **Time-of-day progression:** sky gradient, fog colour and emissive intensity are uniforms, so there is no rebake.

## 5. Blender source-file structure

**Proposed. Not created yet.**

```
blender/
  README.md                 how to rebuild every room
  refs/                     approved reference images + SOURCE.md (licence, prompt, date)
  src/
    kit.blend
    court.blend
    wing_flowdesk.blend
    wing_ledgermind.blend
    wing_accrawedey.blend
    wing_joydatabundle.blend
    foundations.blend
    laboratory.blend
    unfinished.blend
    opendoor.blend
  scripts/
    lib/
      module.py             1.2 m grid helpers, naming, collections
      materials.py          the M_* material library (one source of truth)
      kit.py                kit module builders
      uv.py                 lightmap UV2 packing
      bake.py               Cycles bake routines (atlas, denoise, save)
      export.py             glTF export presets (per room, active collection only)
      render.py             preview renders (landscape + portrait) via bpy.ops.render
      guard.py              idempotency: wipe-by-prefix, build-in-temp-scene, swap on success
    rooms/
      court.py  flowdesk.py  ledgermind.py  ...
    build_all.py            rebuild → bake → export → render, room by room
  out/
    raw/                    raw GLB exports (git-ignored)
    previews/               PNG previews committed for review
pipeline/
  optimize.mjs              gltf-transform: dedup, prune, weld, (simplify), meshopt, ktx2
  budget.mjs                fails if size / tris / draw calls / texture memory exceed budget
  budgets.json              the numbers in §3
public/models/              optimised, content-hashed GLBs (generated)
```

**Naming conventions**
- Collections: `EXPORT_<room>`, `BAKE_LIGHTS_<room>`, `REF_<room>`, `WIP_<room>`.
- Objects: `<ROOM>_<part>_<variant>`, e.g. `FD_housing_03`.
- Materials: `M_<token>` from the material library only. No ad-hoc materials.
- Images: `LM_<room>_<res>` for lightmaps, `TRIM_<name>` for trims.

## 6. Reproducible workflow

Each step is driven by MCP `execute_blender_code` calling repo scripts. **[V]** The MCP supports this.

1. **Block-out** (`rooms/<room>.py --stage blockout`). Primitive volumes from the master-plan dimensions, on the module grid.
2. **Reference check.** Load the approved reference boards from `refs/`. Render the landscape (1920 × 1080) and portrait (1080 × 1920) cameras via `render.py`. EEVEE at low samples. **[V]** Python-based rendering works; the thumbnail tool timed out.
3. **Kit pass.** Replace volumes with kit modules. Realize Geometry Nodes instances that must export **[V]**.
4. **Materials** from `materials.py` only. Procedural shaders are baked to textures **[V]** (they don't export to glTF).
5. **UV2 and bake** (`uv.py`, `bake.py`). Lightmap atlas per room; save PNG/EXR into `out/`.
6. **Export** (`export.py`):
   - GLB with `use_active_collection` + `use_active_scene` **[V]** (this avoids the stray-object leak seen in Phase 0);
   - apply modifiers;
   - no Draco (Meshopt is applied downstream);
   - no lights except intentional ones.
7. **Optimise** (`pipeline/optimize.mjs`, gltf-transform): dedup → prune → weld → (simplify for LOD1) → **Meshopt** → **KTX2** (ETC1S for colour and lightmaps; UASTC for the few maps that band). **[V]** Requires installing gltf-transform + KTX-Software (Phase 0 D9).
8. **Budget check** (`pipeline/budget.mjs`): reads each GLB, reports size, triangles, materials (as a draw-call proxy) and texture memory, then fails the build if over budget.
9. **Visual review.** Commit preview renders. Compare with the reference. Founder or art-director sign-off per room.
10. **Device check.** Load the room in the Phase 4 test harness on the device matrix; record frame time and memory.

**Idempotency and failure safety** (`guard.py`). MCP scripts can leave partial state on failure **[V]**. So every stage:
- builds into a temporary scene `TMP_<room>`;
- swaps into the room's collection only when the stage succeeds;
- deletes its own previous output by name prefix first;
- saves a numbered `.blend` backup before destructive steps.

## 7. Risks and mitigation

| Risk | Mitigation |
|---|---|
| Lightmap seams and instancing conflict | Merge static instances per room; keep instancing only for dynamic or numerous items with a shared baked texture |
| Bake times on CPU-only laptop | 1K mobile maps first; batch 2K overnight; option to bake on a more powerful machine later |
| Accra We Dey assets too heavy | One re-exported character ≤ 400 KB; diorama atlas; LOD1; budget gate |
| Transparent glass overdraw on mobile | Max 2 transparent layers per view; frosted surfaces opaque |
| Thin geometry aliasing (scaffold, cables) | Minimum 8 cm members; FXAA / SMAA only on high tier; avoid sub-pixel detail |
| Drift between rooms' looks | Single material library, single kit, shared lighting presets, review renders side by side |
| MCP session state loss | Scripts in git; `.blend` saved after each stage; nothing done "by hand only" |
| Budget creep | `budget.mjs` fails CI; numbers revisited only after device profiling |
