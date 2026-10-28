# Blender sources

Everything here is rebuilt from scripts; nothing is modelled by hand only.

```
scripts/
  build_museum.py     entry point: rebuild the Court and FlowDesk, save museum.blend
  render_cli.py       daylight (Cycles) previews in a background Blender process
  review.py           review cameras, sun and sky, Workbench and Cycles settings
  lib/geometry.py     box / cylinder / sphere builders, Batch (merge per material), lattice
  lib/materials.py    material library: procedural, world-space, one source of truth
  lib/guard.py        idempotency: wipe and rebuild named collections
  rooms/court.py      the Court
  rooms/flowdesk.py   the FlowDesk wing: the showroom's first bay
  rooms/showroom.py   the project showroom: LedgerMind OS, Accra We Dey and JoyDataBundle bays
src/
  museum.blend            current scene (Checkpoint C onward)
  museum_blockout.blend   Checkpoint B blockout, kept for reference
out/previews/             review renders, one folder per checkpoint
```

## Rebuild

With Blender 5.2 open and the Blender MCP connected:

```python
import sys, importlib
sys.path.insert(0, r"C:\Users\DELL\Desktop\MyPortfolio\blender\scripts")
import build_museum
importlib.reload(build_museum)            # after editing build_museum.py itself
result = build_museum.main()              # build + save
# build_museum.main(massing_previews="checkpoint-c")   # + quick Workbench previews
```

Re-running is safe. The script wipes and rebuilds only its own collections:
- `EXPORT_court`, `EXPORT_flowdesk`: what will be exported to GLB.
- `BAKE_LIGHTS_flowdesk`: gallery lights, used for baking only, never exported.
- `REF_scale`: people for scale, never exported.
- `REVIEW`: cameras and the sun.

## Daylight previews

Cycles takes about 40 s per shot at half resolution on the dev laptop, so it runs outside the MCP session:

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b blender/src/museum.blend \
  -P blender/scripts/render_cli.py -- --out blender/out/previews/checkpoint-c --samples 40 --percent 75
```

Add `--shots arrival_landscape flowdesk_entry_landscape` to render a subset.

## Conventions

- Units: metres, +Y north, origin at the centre of the Court floor. Everything sits on the 1.2 m module (3.6 m bays, 0.4 m screen blocks).
- Static geometry is merged per material per room (`CT_<material>`, `FD_<material>`, `FD_roof_<material>`). Parts that change at runtime stay separate: `CT_stratum_01…12`, `CT_stratum_spine`, `FD_chat_screen`, `FD_kiosk_screen`, `FD_architecture_layer_1…7`, `FD_order_slab`.
- Prefixes: `CT_` Court, `FD_` FlowDesk, `SR_` the rest of the project showroom (`SR_lm_*` are LedgerMind's moving parts), `REF_` reference only, `CAM_` cameras, `LGT_` lights.
- The FlowDesk wing and the showroom bake and export together as one building: `showroom.glb` (`bake_export.py --rooms showroom`, 2048 atlas). The journey's moving pieces in the Accra and JoyDataBundle bays are drawn in code at coordinates mirrored in `src/components/journey/scenes/showroomLayout.ts`.
- Materials come only from `lib/materials.py` (`M_*`). They are procedural, so they must be baked to textures before GLB export.
