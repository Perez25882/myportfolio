"""The Code Monument </> (Phase 2F, approved design A · Cast).

Three cast-bronze characters on a long basalt plinth in the Court's pool.
Each character is two cast halves either side of a 3 cm shadow-gap seam,
around a dark steel rib. "Look beneath" parts the halves along the seam.

Runtime parts (separate objects, reflective metal, not baked):
  CT_monument_<lt|slash|gt>_front / _back
Static parts (merged into the Court and baked): plinth, light line, steel
rib, shoe plates, bolts and the exposed steel pins at each base connection.
"""

import bmesh
import bpy

HEIGHT = 4.2
STROKE = 0.85
ARM = 2.1
DEPTH = 0.84
GAP = 0.55
LEAN = 1.5
SEAM = 0.015  # half the shadow gap
BASE_TOP = 0.95
SHOE = 0.08
PLINTH_HALF = (5.7, 2.7)


def _outline(key):
    lt = [(0, HEIGHT / 2), (ARM, HEIGHT), (ARM + STROKE, HEIGHT), (STROKE, HEIGHT / 2), (ARM + STROKE, 0), (ARM, 0)]
    if key == "lt":
        return lt
    if key == "gt":
        width = ARM + STROKE
        return [(width - x, z) for x, z in reversed(lt)]
    return [(0, 0), (STROKE, 0), (STROKE + LEAN, HEIGHT), (LEAN, HEIGHT)]


def layout():
    """(key, outline, width, x offset), the whole symbol centred on the court axis."""
    widths = {"lt": ARM + STROKE, "slash": STROKE + LEAN, "gt": ARM + STROKE}
    keys = ("lt", "slash", "gt")
    x = -(sum(widths.values()) + GAP * 2) / 2
    placed = []
    for key in keys:
        placed.append((key, _outline(key), widths[key], x))
        x += widths[key] + GAP
    return placed


def _contact(key):
    """Where each character meets its shoe: the bottom end of its stroke."""
    return (ARM, ARM + STROKE) if key == "lt" else (0, STROKE)


def _prism_object(name, outline, x0, y0, y1, z0, material, collection, bevel, scale=1.0):
    cx = sum(x for x, _ in outline) / len(outline)
    cz = sum(z for _, z in outline) / len(outline)
    pts = [(cx + (x - cx) * scale, cz + (z - cz) * scale) for x, z in outline]
    bm = bmesh.new()
    front = [bm.verts.new((x0 + x, y0, z0 + z)) for x, z in pts]
    back = [bm.verts.new((x0 + x, y1, z0 + z)) for x, z in pts]
    bm.faces.new(front)
    bm.faces.new(back)
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        bm.faces.new((front[i], front[j], back[j], back[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bevel:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, profile=0.5, affect="EDGES", clamp_overlap=True)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj


def build(batch, collection, mats):
    """Static parts go into the Court's `batch`; the bronze halves are runtime objects in `collection`."""
    bronze, steel, basalt = mats["M_bronze_brushed"], mats["M_steel_dark"], mats["M_basalt"]
    hx, hy = PLINTH_HALF
    batch.box(basalt, -hx, hx, -hy, hy, 0, BASE_TOP)
    batch.box(mats["M_warm_line"], -hx + 0.3, hx - 0.3, -hy - 0.005, -hy + 0.02, BASE_TOP - 0.08, BASE_TOP - 0.05)

    z0 = BASE_TOP + SHOE
    for key, outline, _width, x0 in layout():
        _prism_object(f"CT_monument_{key}_front", outline, x0, -DEPTH / 2, -SEAM, z0, bronze, collection, bevel=0.035)
        _prism_object(f"CT_monument_{key}_back", outline, x0, SEAM, DEPTH / 2, z0, bronze, collection, bevel=0.035)
        # The steel rib is static: it stays put while the halves part around it.
        _rib(batch, steel, outline, x0, z0)

        a, b = _contact(key)
        batch.box(steel, x0 + a - 0.1, x0 + b + 0.1, -DEPTH / 2 - 0.1, DEPTH / 2 + 0.1, BASE_TOP, z0)
        for bx in (x0 + a - 0.04, x0 + b + 0.04):
            for by in (-DEPTH / 2 - 0.05, DEPTH / 2 + 0.05):
                batch.cylinder(steel, bx, by, z0, 0.03, 0.03, segments=8)
        # Exposed steel pins through the base of each character (borrowed from design B).
        for px in (x0 + a + 0.2, x0 + b - 0.2):
            batch.beam(steel, (px, -DEPTH / 2 - 0.03, z0 + 0.35), (px, DEPTH / 2 + 0.03, z0 + 0.35), 0.045, segments=12)


def _rib(batch, steel, outline, x0, z0):
    """A slimmer copy of the character's outline, filling the seam between the halves."""
    cx = sum(x for x, _ in outline) / len(outline)
    cz = sum(z for _, z in outline) / len(outline)
    pts = [(cx + (x - cx) * 0.82, cz + (z - cz) * 0.82) for x, z in outline]
    bm = batch._bm(steel)
    front = [bm.verts.new((x0 + x, -0.1, z0 + z)) for x, z in pts]
    back = [bm.verts.new((x0 + x, 0.1, z0 + z)) for x, z in pts]
    bm.faces.new(front)
    bm.faces.new(back)
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        bm.faces.new((front[i], front[j], back[j], back[i]))
