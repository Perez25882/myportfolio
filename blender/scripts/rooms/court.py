"""The Court: an open-air courtyard on the 1.2 m module (Phase 2F refinement).

Plan (metres, +Y north, origin at the court centre):
- Court 36 x 36, open to the sky, ringed by a two-storey verandah building
  7.2 deep and 10.8 high. Upper-floor bays vary by type: solid corner piers,
  fin bays (concrete fins over recessed glazing) and timber-screen bays.
- Every threshold is a double-height portal with a basalt-lined reveal. North
  opens into FlowDesk between two timber Seam Screen towers 21.6 high; south
  is the arrival; east and west are closed with basalt for future wings.
- Centre: a pool around the Code Monument (rooms/monument.py).
- Floor: large-format stone paving with bronze seam inlays to each threshold.
- Accent lighting (baked only): tower uplights, portal grazers, verandah
  downlights, step nosings.
"""

import math

import bpy

from lib import planting
from lib.geometry import BAY, Batch, lattice_face
from rooms import monument

HALF = 18.0
OUTER = 25.2
VERANDAH = 3.6
FIRST_FLOOR = 5.4
ROOF = 10.8
DOOR_HALF = 3.6
REVEAL = 0.3  # basalt lining thickness in the portals
TOWER_HEIGHT = 21.6
TERRACE_HEIGHT = 1.8
STEP = 0.3
TERRACE_FRONT = -HALF + 5.4
STEPS_END = TERRACE_FRONT + round(TERRACE_HEIGHT / STEP) * STEP

SLAB_EDGE = 0.45
PARAPET = 0.6
FIN_DEPTH = 0.6
FIN_WIDTH = 0.15
FIN_PITCH = 1.2
INLAY = 0.04
POOL_OUTER = 8.4
POOL_RIM = 0.6
WARM = (1.0, 0.78, 0.55)


def _xy(side, u0, u1, v0, v1):
    if side == "N":
        return u0, u1, v0, v1
    if side == "S":
        return u0, u1, -v1, -v0
    if side == "E":
        return v0, v1, u0, u1
    return -v1, -v0, u0, u1


def _put(batch, material, side, u0, u1, v0, v1, z0, z1):
    x0, x1, y0, y1 = _xy(side, u0, u1, v0, v1)
    batch.box(material, x0, x1, y0, y1, z0, z1)


# ---------- facades ----------

def _upper_bay(batch, mats, side, u0, u1, kind):
    concrete, glass, timber = mats["M_concrete_laterite"], mats["M_glass"], mats["M_timber_screen"]
    face, back = HALF + FIN_DEPTH, HALF + VERANDAH
    low, high = FIRST_FLOOR + SLAB_EDGE, ROOF - PARAPET
    _put(batch, concrete, side, u0, u1, HALF, face, FIRST_FLOOR, low)
    _put(batch, concrete, side, u0, u1, HALF, face, high, ROOF)
    _put(batch, timber, side, u0, u1, HALF + 0.6, back, FIRST_FLOOR - 0.08, FIRST_FLOOR)
    if kind == "solid":
        _put(batch, concrete, side, u0, u1, HALF + 0.15, back, FIRST_FLOOR, ROOF)
        return
    _put(batch, concrete, side, u0, u1, face, back, FIRST_FLOOR, ROOF)
    _put(batch, glass, side, u0, u1, face - 0.05, face, low, high)
    if kind == "fins":
        for i in range(int(round((u1 - u0) / FIN_PITCH))):
            u = u0 + FIN_PITCH / 2 + i * FIN_PITCH
            _put(batch, concrete, side, u - FIN_WIDTH / 2, u + FIN_WIDTH / 2, HALF, face, low, high)
    else:  # timber screen in front of the glazing
        x0, x1, y0, y1 = _xy(side, u0 + 0.1, u1 - 0.1, HALF + 0.15, HALF + 0.27)
        plane = ("y", y0, y1) if side in ("N", "S") else ("x", x0, x1)
        a0, a1 = (x0, x1) if side in ("N", "S") else (y0, y1)
        lattice_face(batch, timber, plane, a0, a1, low, high, 0.3, 0.06)


def _upper_runs(side):
    """Upper-floor bays (u0, u1, kind). Corners are solid piers; between, two fin bays then a screen bay."""
    if side == "N":
        spans = [(-21.6, -9.0), (9.0, 21.6)]
    elif side == "S":
        spans = [(-21.6, -DOOR_HALF), (DOOR_HALF, 21.6)]
    else:
        spans = [(-HALF, -DOOR_HALF), (DOOR_HALF, HALF)]
    bays = []
    for u0, u1 in spans:
        count = int(round((u1 - u0) / BAY))
        for i in range(count):
            a = u0 + i * BAY
            b = min(a + BAY, u1)
            corner = abs(a) >= 18.0 - 1e-6 or abs(b) >= 21.6 - 1e-6
            kind = "solid" if corner and side in ("N", "S") else ("screen" if i % 3 == 2 else "fins")
            bays.append((a, b, kind))
    return bays


def _portal(batch, mats, side, closed):
    """Double-height threshold: a deep opening lined in basalt, with a lintel at the parapet."""
    concrete, basalt = mats["M_concrete_laterite"], mats["M_basalt"]
    _put(batch, concrete, side, -DOOR_HALF, DOOR_HALF, HALF, OUTER, ROOF - PARAPET, ROOF)
    _put(batch, basalt, side, -DOOR_HALF, DOOR_HALF, HALF, OUTER, ROOF - PARAPET - 0.12, ROOF - PARAPET)
    for u0, u1 in ((-DOOR_HALF, -DOOR_HALF + REVEAL), (DOOR_HALF - REVEAL, DOOR_HALF)):
        _put(batch, basalt, side, u0, u1, HALF, OUTER, 0, ROOF - PARAPET)
    if closed:
        _put(batch, basalt, side, -DOOR_HALF + REVEAL, DOOR_HALF - REVEAL, OUTER - 0.6, OUTER, 0, ROOF - PARAPET - 0.12)


def _perimeter_side(batch, mats, side):
    concrete, basalt = mats["M_concrete_laterite"], mats["M_basalt"]
    span = OUTER if side in ("N", "S") else HALF + VERANDAH
    back = HALF + VERANDAH
    _put(batch, concrete, side, -span, -DOOR_HALF, back, OUTER, 0, ROOF)
    _put(batch, concrete, side, DOOR_HALF, span, back, OUTER, 0, ROOF)
    _portal(batch, mats, side, closed=side in ("E", "W"))
    if side == "N":  # narrow piers between the portal and the towers
        for u0, u1 in ((-5.4, -DOOR_HALF), (DOOR_HALF, 5.4)):
            _put(batch, concrete, side, u0, u1, HALF, back, FIRST_FLOOR, ROOF)
    for u0, u1, kind in _upper_runs(side):
        _upper_bay(batch, mats, side, u0, u1, kind)

    positions = [i * BAY for i in range(-5, 6)]
    if side in ("E", "W"):
        positions = positions[1:-1]
    for u in positions:
        if abs(u) <= DOOR_HALF + 1e-6 or (side == "N" and abs(u) == 7.2):
            continue
        _put(batch, basalt, side, u - 0.4, u + 0.4, HALF - 0.1, HALF + 0.7, 0, 0.3)  # base
        _put(batch, concrete, side, u - 0.3, u + 0.3, HALF, HALF + 0.6, 0.3, FIRST_FLOOR - 0.15)
        _put(batch, concrete, side, u - 0.4, u + 0.4, HALF - 0.1, HALF + 0.7, FIRST_FLOOR - 0.15, FIRST_FLOOR)  # capital


def _screen_towers(batch, mats, lights):
    timber, concrete, warm = mats["M_timber_screen"], mats["M_concrete_laterite"], mats["M_warm_line"]
    y0, y1 = HALF, HALF + VERANDAH
    base = 2.4
    for x0, x1 in ((-9.0, -5.4), (5.4, 9.0)):
        batch.box(concrete, x0 - 0.15, x1 + 0.15, y0 - 0.15, y1 + 0.15, 0, base)
        batch.box(warm, x0 - 0.16, x1 + 0.16, y0 - 0.16, y1 + 0.16, base, base + 0.04)
        batch.box(concrete, x0 - 0.15, x1 + 0.15, y0 - 0.15, y1 + 0.15, TOWER_HEIGHT, TOWER_HEIGHT + 0.35)
        for px, py in ((x0, y0), (x1 - 0.25, y0), (x0, y1 - 0.25), (x1 - 0.25, y1 - 0.25)):
            batch.box(timber, px, px + 0.25, py, py + 0.25, base, TOWER_HEIGHT)  # frame posts
        z = base + 1.2
        while z < TOWER_HEIGHT - 0.1:  # frame rails every 1.2 m
            batch.box(timber, x0, x1, y0, y0 + 0.18, z, z + 0.2)
            batch.box(timber, x0, x1, y1 - 0.18, y1, z, z + 0.2)
            batch.box(timber, x0, x0 + 0.18, y0, y1, z, z + 0.2)
            batch.box(timber, x1 - 0.18, x1, y0, y1, z, z + 0.2)
            z += 1.2
        for plane, a0, a1 in (
            (("y", y0 + 0.04, y0 + 0.14), x0 + 0.25, x1 - 0.25),
            (("y", y1 - 0.14, y1 - 0.04), x0 + 0.25, x1 - 0.25),
            (("x", x0 + 0.04, x0 + 0.14), y0 + 0.25, y1 - 0.25),
            (("x", x1 - 0.14, x1 - 0.04), y0 + 0.25, y1 - 0.25),
        ):
            lattice_face(batch, timber, plane, a0, a1, base, TOWER_HEIGHT, 0.4, 0.08)
        _light(lights, f"LGT_tower_uplight_{'W' if x0 < 0 else 'E'}", ((x0 + x1) / 2, (y0 + y1) / 2, base + 0.3), 900, 2.2, up=True)


# ---------- ground, terrace, pool ----------

def _floors(batch, mats):
    batch.box(mats["M_ground"], -80, 80, -80, 80, -0.6, -0.3)
    batch.box(mats["M_paving"], -OUTER, OUTER, -OUTER, OUTER, -0.3, 0)
    bronze = mats["M_bronze"]
    batch.box(bronze, -INLAY, INLAY, POOL_OUTER, OUTER, 0, 0.004)
    batch.box(bronze, -INLAY, INLAY, STEPS_END, -POOL_OUTER, 0, 0.004)
    batch.box(bronze, POOL_OUTER, OUTER, -INLAY, INLAY, 0, 0.004)
    batch.box(bronze, -OUTER, -POOL_OUTER, -INLAY, INLAY, 0, 0.004)


def _arrival_terrace(batch, mats):
    basalt, warm = mats["M_basalt"], mats["M_warm_line"]
    batch.box(basalt, -10.8, 10.8, -OUTER, TERRACE_FRONT, 0, TERRACE_HEIGHT)
    for i in range(int(round(TERRACE_HEIGHT / STEP))):
        top = TERRACE_HEIGHT - STEP * (i + 1)
        y0 = TERRACE_FRONT + STEP * i
        batch.box(basalt, -10.8, 10.8, y0, y0 + STEP, 0, top)
        batch.box(warm, -10.6, 10.6, y0 + STEP - 0.01, y0 + STEP, top - 0.06, top - 0.04)  # nosing light


def _pool(batch, mats):
    basalt = mats["M_basalt"]
    outer, inner = POOL_OUTER, POOL_OUTER - POOL_RIM
    batch.box(basalt, -outer, outer, inner, outer, 0, 0.45)
    batch.box(basalt, -outer, outer, -outer, -inner, 0, 0.45)
    batch.box(basalt, inner, outer, -inner, inner, 0, 0.45)
    batch.box(basalt, -outer, -inner, -inner, inner, 0, 0.45)
    batch.box(mats["M_water"], -inner, inner, -inner, inner, -0.3, 0.3)


# ---------- planting ----------

BEDS = {
    "NW": (-16.2, -9.6, 9.6, 16.2),
    "NE": (9.6, 16.2, 9.6, 16.2),
    "W": (-16.2, -12.6, -7.2, 4.8),
    "E": (12.6, 16.2, -7.2, 4.8),
}


def _planting(batch, mats):
    concrete, earth = mats["M_concrete_laterite"], mats["M_ground"]
    for index, (key, (x0, x1, y0, y1)) in enumerate(BEDS.items()):
        batch.box(concrete, x0, x1, y0, y1, 0, 0.6)
        batch.box(earth, x0 + 0.15, x1 - 0.15, y0 + 0.15, y1 - 0.15, 0.6, 0.63)
        planting.bed_planting(batch, mats, x0 + 0.15, x1 - 0.15, y0 + 0.15, y1 - 0.15, 0.63, seed=10 + index)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if key in ("NW", "NE"):
            planting.canopy_tree(batch, mats, cx, cy, 0.63, height=7.6, seed=20 + index)
        else:
            planting.palm(batch, mats, cx, y0 + 2.6, 0.63, height=8.4, seed=30 + index)
            planting.palm(batch, mats, cx, y1 - 2.6, 0.63, height=7.2, seed=40 + index)


# ---------- lights ----------

def _light(lights, name, location, power, size, up=False):
    light = bpy.data.lights.new(name, "AREA")
    light.shape = "SQUARE"
    light.size = size
    light.energy = power
    light.color = WARM
    obj = bpy.data.objects.new(name, light)
    lights.objects.link(obj)
    obj.location = location
    if up:
        obj.rotation_euler = (math.pi, 0, 0)  # area lights face -Z; flip to wash upward
    return obj


def _accent_lights(lights):
    for side, sign in (("N", 1), ("S", -1)):
        for x in (-DOOR_HALF + 0.45, DOOR_HALF - 0.45):
            _light(lights, f"LGT_portal_{side}", (x, sign * (HALF + 1.0), 0.15), 250, 0.4, up=True)
    for u in (-14.4, -7.2, 7.2, 14.4):
        for side in ("N", "S", "E", "W"):
            x0, x1, y0, y1 = _xy(side, u, u, HALF + 1.8, HALF + 1.8)
            _light(lights, f"LGT_verandah_{side}", (x0, y0, FIRST_FLOOR - 0.2), 120, 0.6)


def _people(mats, ref_collection):
    batch = Batch("REF_people_court", ref_collection)
    figure = mats["M_ref_figure"]
    for x, y, z in ((-6.0, -15.6, TERRACE_HEIGHT), (-4.2, -10.2, 0), (8.4, 9.6, 0), (-1.2, 19.8, 0), (11.4, -10.8, 0)):
        batch.cylinder(figure, x, y, z, 1.45, 0.2, segments=10)
        batch.sphere(figure, x, y, z + 1.6, 0.12, subdivisions=1)
    batch.build()


def build(collection, ref_collection, mats, lights_collection):
    """Build the Court; people go to `ref_collection` and bake-only lights to `lights_collection`."""
    batch = Batch("CT", collection)
    _floors(batch, mats)
    for side in ("N", "S", "E", "W"):
        _perimeter_side(batch, mats, side)
    _screen_towers(batch, mats, lights_collection)
    _arrival_terrace(batch, mats)
    _pool(batch, mats)
    monument.build(batch, collection, mats)
    _planting(batch, mats)
    batch.build()
    _accent_lights(lights_collection)
    _people(mats, ref_collection)
    return {"threshold_north_y": OUTER}
