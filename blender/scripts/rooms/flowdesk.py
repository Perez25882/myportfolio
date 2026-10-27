"""FlowDesk wing: a daylit gallery around a real small-shop setting (approved at Checkpoint B).

Reached through the Court's north threshold, then a low vestibule (4.8 high)
that releases into the hall: compression before expansion.

Hall: 14.4 wide x 28.8 long x 10.8 high. Daylight enters through a slatted
timber clerestory on both long walls and a louvred slot along the roof axis.

Exhibits, from the entrance:
- conversation wall: the WhatsApp-style display, facing the visitor
- kiosk: the touch point where the visitor plays the customer
- architecture table: the seven-layer "Look beneath" model of the system
- shop setting: shelves of stock and a counter, the business FlowDesk serves
- ledger table: where the recorded order lands

Screens, architecture layers and the order slab are separate objects because
they change at runtime; everything else is merged per material.
"""

import bpy

from lib.geometry import Batch, box

WALL = 0.6
HALF_WIDTH = 7.2
HALL_START = 30.6  # inner face of the south wall
HALL_END = 59.4  # inner face of the north wall
HEIGHT = 10.8
CLERESTORY = (8.4, 10.2)
SLAT_PITCH = 0.4
SLAT = 0.12
SKYLIGHT_HALF = 1.2
LOUVRE_PITCH = 0.6
VESTIBULE_START = 25.2
VESTIBULE_HALF = 3.6
VESTIBULE_HEIGHT = 4.8


def _shell(batch, roof, mats):
    """Walls and floor go to `batch`; the roof goes to `roof` so it can be hidden for cutaways."""
    concrete, timber, terrazzo = mats["M_concrete_laterite"], mats["M_timber_screen"], mats["M_floor_terrazzo"]
    outer = HALF_WIDTH + WALL
    south0 = HALL_START - WALL
    north1 = HALL_END + WALL

    batch.box(terrazzo, -outer, outer, VESTIBULE_START, north1, -0.3, 0)
    batch.box(mats["M_bronze"], -0.04, 0.04, VESTIBULE_START, 34.8, 0, 0.004)  # seam inlay continues from the Court

    # Vestibule: a low passage from the Court threshold, with a timber ceiling.
    batch.box(concrete, -VESTIBULE_HALF - WALL, -VESTIBULE_HALF, VESTIBULE_START, south0, 0, VESTIBULE_HEIGHT + WALL)
    batch.box(concrete, VESTIBULE_HALF, VESTIBULE_HALF + WALL, VESTIBULE_START, south0, 0, VESTIBULE_HEIGHT + WALL)
    roof.box(concrete, -VESTIBULE_HALF - WALL, VESTIBULE_HALF + WALL, VESTIBULE_START, south0, VESTIBULE_HEIGHT, VESTIBULE_HEIGHT + WALL)
    roof.box(timber, -VESTIBULE_HALF, VESTIBULE_HALF, VESTIBULE_START, south0, VESTIBULE_HEIGHT - 0.06, VESTIBULE_HEIGHT)

    # South wall with the vestibule opening.
    batch.box(concrete, -outer, -VESTIBULE_HALF, south0, HALL_START, 0, HEIGHT)
    batch.box(concrete, VESTIBULE_HALF, outer, south0, HALL_START, 0, HEIGHT)
    batch.box(concrete, -VESTIBULE_HALF, VESTIBULE_HALF, south0, HALL_START, VESTIBULE_HEIGHT, HEIGHT)

    # Long walls: solid below, an open slatted clerestory, solid band above.
    low, high = CLERESTORY
    slats = int((north1 - south0) / SLAT_PITCH)
    for x0, x1 in ((-outer, -HALF_WIDTH), (HALF_WIDTH, outer)):
        batch.box(concrete, x0, x1, south0, north1, 0, low)
        batch.box(concrete, x0, x1, south0, north1, high, HEIGHT)
        for i in range(slats + 1):
            y = min(south0 + i * SLAT_PITCH, north1 - SLAT)
            batch.box(timber, x0, x1, y, y + SLAT, low, high)

    batch.box(concrete, -outer, outer, HALL_END, north1, 0, HEIGHT)

    # Roof in two halves with a louvred skylight slot along the axis.
    roof.box(concrete, -outer, -SKYLIGHT_HALF, south0, north1, HEIGHT, HEIGHT + WALL)
    roof.box(concrete, SKYLIGHT_HALF, outer, south0, north1, HEIGHT, HEIGHT + WALL)
    louvres = int((north1 - south0) / LOUVRE_PITCH)
    for i in range(louvres):
        y = south0 + i * LOUVRE_PITCH + LOUVRE_PITCH / 2
        roof.box(timber, -SKYLIGHT_HALF, SKYLIGHT_HALF, y - SLAT / 2, y + SLAT / 2, HEIGHT, HEIGHT + WALL)


# ---------- Phase 2F: one order's journey, Customer → FlowDesk → Shop owner ----------

def _screen(name, x, y0, y1, z0, z1, facing_east, material, collection):
    """A UV-mapped display surface on a long wall, showing an interface reconstruction.

    Corners run bottom-left, bottom-right, top-right, top-left as seen by the visitor, so the
    face points into the room (browsers cull back faces) and the image reads left to right.
    Facing east, the visitor's right is +Y; facing west, it is -Y.
    """
    mesh = bpy.data.meshes.new(name)
    if facing_east:
        verts = [(x, y0, z0), (x, y1, z0), (x, y1, z1), (x, y0, z1)]
    else:
        verts = [(x, y1, z0), (x, y0, z0), (x, y0, z1), (x, y1, z1)]
    mesh.from_pydata(verts, [], [(0, 1, 2, 3)])
    uv = mesh.uv_layers.new(name="UVMap")
    for loop, coord in zip(mesh.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[loop.index].uv = coord
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj


def _customer_zone(batch, collection, mats):
    """1 · The customer: a 2.4 m portrait 'phone wall' on the west wall, a kiosk and bench."""
    bronze, basalt, timber = mats["M_bronze"], mats["M_basalt"], mats["M_timber_screen"]
    batch.box(basalt, -7.2, -6.6, 32.4, 35.6, 0, 0.6)
    batch.box(bronze, -7.2, -7.06, 32.78, 35.18, 0.58, 4.82)  # frame
    # 2.16 x 4.0 m: the reconstruction's own 540 x 1000 portrait proportion.
    _screen("FD_screen_customer", -7.05, 32.9, 35.06, 0.7, 4.7, True, mats["M_screen_customer"], collection)
    batch.box(basalt, -4.9, -4.3, 33.7, 34.3, 0, 1.0)  # kiosk
    batch.box(bronze, -4.95, -4.25, 33.65, 34.35, 1.0, 1.04)
    batch.box(timber, -5.6, -3.6, 36.0, 36.5, 0.42, 0.46)  # bench
    for x in (-5.4, -3.8):
        batch.box(basalt, x, x + 0.2, 36.05, 36.45, 0, 0.42)


def _pipeline_zone(batch, collection, mats):
    """2 · FlowDesk: a basalt table with seven bronze stations; the price floor is a physical stop at station 5."""
    basalt, bronze, steel, warm = mats["M_basalt"], mats["M_bronze"], mats["M_steel_dark"], mats["M_warm_line"]
    y0, y1 = 40.2, 49.8
    batch.box(basalt, -1.2, 1.2, y0, y1, 0, 0.8)  # table body
    batch.box(steel, -1.0, 1.0, y0 + 0.2, y1 - 0.2, 0.55, 0.6)  # the dark pit under the lid
    for i in range(7):  # verified modules inside the pit, revealed by "Look beneath"
        cy = y0 + 0.9 + i * 1.3
        batch.box(steel, -0.7, 0.7, cy - 0.4, cy + 0.4, 0.6, 0.78)
        batch.box(warm, -0.7, 0.7, cy - 0.41, cy - 0.4, 0.74, 0.76)
    lid = Batch("FD_pipeline_lid", collection)
    lid.box(basalt, -1.2, 1.2, y0, y1, 0.8, 0.92)
    lid.build()
    for i in range(7):
        cy = y0 + 0.9 + i * 1.3
        batch.box(bronze, -0.45, 0.45, cy - 0.45, cy + 0.45, 0.92, 1.12)  # station
    gate = Batch("FD_floor_gate", collection)
    gate.box(bronze, -1.15, 1.15, y0 + 0.9 + 4 * 1.3 - 0.75, y0 + 0.9 + 4 * 1.3 - 0.69, 0.92, 1.7)
    gate.build()
    slip = Batch("FD_order_slip", collection)
    slip.box(mats["M_cardboard"], -0.25, 0.25, y0 + 0.65, y0 + 1.15, 1.12, 1.14)
    slip.build()
    # Bronze path in the floor: phone wall → table → dashboard.
    batch.box(bronze, -6.6, -1.2, 34.0, 34.06, 0, 0.004)
    batch.box(bronze, -1.23, -1.17, 34.0, y0, 0, 0.004)
    batch.box(bronze, -0.03, 0.03, y1, 53.7, 0, 0.004)
    batch.box(bronze, 0.0, 6.6, 53.67, 53.73, 0, 0.004)


# Deterministic stock on the shop shelves: (offset along the shelf, width, height, material key).
_STOCK = ((0.1, 0.5, 0.35, "M_cardboard"), (0.7, 0.4, 0.5, "M_cardboard"), (1.2, 0.6, 0.3, "M_planting"),
          (1.9, 0.45, 0.42, "M_cardboard"), (2.45, 0.4, 0.28, "M_bronze"))


def _owner_zone(batch, collection, mats):
    """3 · The shop owner: the order dashboard on the east wall, beside the shop it serves."""
    bronze, basalt, timber = mats["M_bronze"], mats["M_basalt"], mats["M_timber_screen"]
    batch.box(bronze, 7.06, 7.2, 50.88, 56.52, 0.88, 4.12)  # frame
    # 5.4 x 3.0 m: the reconstruction's 1080 x 600 proportion.
    _screen("FD_screen_owner", 7.05, 51.0, 56.4, 1.0, 4.0, False, mats["M_screen_owner"], collection)
    # Overhead bronze rail tying the three zones into one flow: phone wall → table → dashboard.
    # It leaves the phone wall just north of the screen frame (F4), so it never crosses the chat.
    for start, end in (((-6.9, 36.0, 3.6), (0.0, 40.2, 3.6)), ((0.0, 40.2, 3.6), (0.0, 49.8, 3.6)), ((0.0, 49.8, 3.6), (6.9, 53.7, 3.6))):
        batch.beam(bronze, start, end, 0.045, segments=10)
    for x, y in ((0.0, 40.2), (0.0, 49.8)):
        batch.beam(mats["M_steel_dark"], (x, y, 3.6), (x, y, HEIGHT), 0.015, segments=6)  # hangers
    batch.box(timber, 2.4, 5.4, 55.8, 56.7, 0, 0.95)  # counter
    batch.box(basalt, 2.35, 5.45, 55.75, 56.75, 0.95, 1.0)
    box("FD_order_slab", 3.6, 4.2, 56.05, 56.45, 1.0, 1.05, bronze, collection)
    for x0, x1 in ((0.6, 2.6), (2.8, 4.8), (5.0, 7.0)):
        batch.box(timber, x0, x0 + 0.06, 58.8, 59.4, 0, 2.4)
        batch.box(timber, x1 - 0.06, x1, 58.8, 59.4, 0, 2.4)
        for level in (0.1, 0.6, 1.1, 1.6, 2.1):
            batch.box(timber, x0, x1, 58.8, 59.4, level, level + 0.04)
            for offset, width, height, key in _STOCK[:4]:
                start = x0 + 0.08 + offset * 0.8
                batch.box(mats[key], start, min(start + width * 0.8, x1 - 0.08), 58.88, 59.32, level + 0.04, level + 0.04 + height)
    for x, y in ((-6.0, 57.6), (6.0, 38.4)):
        batch.cylinder(basalt, x, y, 0, 0.6, 0.35, segments=12)
        batch.sphere(mats["M_planting"], x, y, 1.1, 0.6, scale=(1, 1, 1.1))


# Gallery lighting: two rows of warm (about 3000 K) ceiling panels. Baked, never exported.
GALLERY_LIGHT_POWER = 350.0
GALLERY_LIGHT_COLOUR = (1.0, 0.82, 0.64)


def _gallery_lights(lights_collection):
    for row, x in enumerate((-3.6, 3.6)):
        for i, y in enumerate((34.2, 40.2, 46.2, 52.2, 57.0)):
            light = bpy.data.lights.new(f"LGT_flowdesk_{row}_{i}", "AREA")
            light.shape = "SQUARE"
            light.size = 1.8
            light.energy = GALLERY_LIGHT_POWER
            light.color = GALLERY_LIGHT_COLOUR
            obj = bpy.data.objects.new(light.name, light)
            lights_collection.objects.link(obj)
            obj.location = (x, y, HEIGHT - 0.4)  # area lights point down (-Z) by default


def _people(mats, ref_collection):
    batch = Batch("REF_people_flowdesk", ref_collection)
    figure = mats["M_ref_figure"]
    for x, y in ((3.6, 37.8), (-3.6, 46.2), (3.0, 52.8)):
        batch.cylinder(figure, x, y, 0, 1.45, 0.2, segments=10)
        batch.sphere(figure, x, y, 1.6, 0.12, subdivisions=1)
    batch.build()


def build(collection, ref_collection, mats, lights_collection):
    """Build the FlowDesk wing into `collection`; bake-only lights go to `lights_collection`."""
    batch = Batch("FD", collection)
    roof = Batch("FD_roof", collection)
    _shell(batch, roof, mats)
    _customer_zone(batch, collection, mats)
    _pipeline_zone(batch, collection, mats)
    _owner_zone(batch, collection, mats)
    batch.build()
    roof.build()
    _gallery_lights(lights_collection)
    _people(mats, ref_collection)
    return {"hall": (HALF_WIDTH * 2, HALL_END - HALL_START, HEIGHT)}
