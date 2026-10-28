"""The project showroom (2026-10-28): the FlowDesk hall's architecture continued north as three
more bays, one per project, so the building shows all four of Perez's flagship projects.

    FlowDesk bay (rooms/flowdesk.py)   y 30.6 – 59.4
    LedgerMind OS                      y 60.0 – 76.8
    Accra We Dey                       y 77.4 – 94.2
    JoyDataBundle                      y 94.8 – 111.6

Bays are separated by partitions with wide openings, so the journey's camera walks straight
through. Each exhibit is a physical model of the project's verified behaviour; the parts the
browser animates are separate objects (SR_lm_*), and the journey adds its moving pieces
(players, ticks, packets) in code at the coordinates below. Keep the two in step:
src/components/journey/scenes/showroomLayout.ts mirrors these constants.
"""

import math
import random

import bpy

from lib.geometry import Batch, box
from rooms.flowdesk import HALF_WIDTH, HEIGHT, SHOWROOM_END

PARTITION = 0.6
OPENING_HEIGHT = 6.0
# (south face, opening from x, opening to x): FlowDesk's opening sits west of its shop shelves.
PARTITIONS = ((59.4, -6.0, 0.0), (76.8, -3.6, 3.6), (94.2, -3.6, 3.6))

# ---------- LedgerMind OS: one branch's counter, the server, and the connection between ----------
LM_COUNTER = (-5.4, -1.8, 63.0, 64.0)  # x0, x1, y0, y1
LM_POS = (-4.6, 63.45)
LM_TRAY = (-2.6, 63.5)  # centre of the queue tray; slots at x -3.0, -2.6, -2.2
LM_LINK_FROM = (-4.6, 63.45, 2.6)
LM_LINK_TO = (4.2, 66.5, 3.3)
LM_SERVER = (3.0, 5.4, 66.6, 68.4, 3.6)  # x0, x1, y0, y1, height
STOCK_FULL = 2.4  # metres of bar at full stock

# ---------- Accra We Dey: an architectural model of an Accra-inspired city ----------
CITY = (-5.4, 5.4, 80.4, 91.2, 0.95)  # plinth x0, x1, y0, y1, model surface height
CITY_PITCH = 0.42
CITY_COLS = 24
CITY_ROWS = 21
CITY_X0 = -(CITY_COLS - 1) / 2 * CITY_PITCH
CITY_Y0 = 82.2
ROAD_EVERY = 5
ROAD_OFFSET = 2
VENUES = ((4, 4), (19, 5), (9, 15), (15, 18))  # (col, row) squares with a venue
TICK_TOWER = (12, 12)  # (col, row): a street crossing near the middle

# ---------- JoyDataBundle: customers, resellers, the backend and the payout review ----------
NETWORK_CENTRE = (0.0, 103.2)
DAIS = (6.0, 0.25)  # radius, height
RESELLERS = 6
RESELLER_RADIUS = 3.4
CUSTOMER_RADIUS = 5.3
FRONTEND_RADIUS = 4.4
ADMIN_DESK = (-0.9, 0.9, 105.3, 105.9)


def _anchored_box(name, x0, x1, y0, y1, z0, z1, material, collection):
    """A runtime part with its origin at the middle of its base, so the browser can grow it upward."""
    ax, ay = (x0 + x1) / 2, (y0 + y1) / 2
    obj = box(name, x0 - ax, x1 - ax, y0 - ay, y1 - ay, 0, z1 - z0, material, collection)
    obj.location = (ax, ay, z0)
    return obj


def _partitions(batch, mats):
    concrete = mats["M_concrete_laterite"]
    for y0, open0, open1 in PARTITIONS:
        y1 = y0 + PARTITION
        batch.box(concrete, -HALF_WIDTH, open0, y0, y1, 0, HEIGHT)
        batch.box(concrete, open1, HALF_WIDTH, y0, y1, 0, HEIGHT)
        batch.box(concrete, open0, open1, y0, y1, OPENING_HEIGHT, HEIGHT)
        # The Court's bronze seam runs on through every opening: one line through the whole story.
        mid = (open0 + open1) / 2
        batch.box(mats["M_bronze"], mid - 0.03, mid + 0.03, y0 - 1.2, y1 + 1.2, 0, 0.004)


def _stock(batch, mats, x0, x1, y0, y1, levels, seed):
    """Shelving with boxes of stock, deterministic per seed."""
    random_ = random.Random(seed)
    timber = mats["M_timber_screen"]
    keys = ("M_cardboard", "M_ochre", "M_ledgermind", "M_laterite_clay", "M_plaster")
    for level in levels:
        batch.box(timber, x0, x1, y0, y1, level, level + 0.04)
        y = y0 + 0.08
        while y < y1 - 0.5:
            width = 0.25 + random_.random() * 0.25
            height = 0.2 + random_.random() * 0.3
            batch.box(mats[keys[random_.randrange(len(keys))]], x0 + 0.06, x1 - 0.06, y, y + width, level + 0.04, level + 0.04 + height)
            y += width + 0.06


def _ledgermind(batch, collection, mats):
    timber, basalt, bronze = mats["M_timber_screen"], mats["M_basalt"], mats["M_bronze"]
    x0, x1, y0, y1 = LM_COUNTER
    batch.box(timber, x0, x1, y0, y1, 0, 1.0)  # the branch counter
    batch.box(basalt, x0 - 0.05, x1 + 0.05, y0 - 0.05, y1 + 0.05, 1.0, 1.05)
    batch.box(timber, -7.2, -6.6, 60.6, 67.8, 0, 2.6)  # back shelving on the west wall
    _stock(batch, mats, -6.6, -6.1, 60.8, 67.6, (0.3, 0.9, 1.5, 2.1), seed=5)
    px, py = LM_POS
    batch.box(basalt, px - 0.05, px + 0.05, py - 0.05, py + 0.05, 1.05, 1.35)  # the till's stand
    box("SR_lm_screen", px - 0.4, px + 0.4, py - 0.04, py + 0.04, 1.35, 1.85, mats["M_live_screen"], collection)
    tx, ty = LM_TRAY
    batch.box(basalt, tx - 0.6, tx + 0.6, ty - 0.3, ty + 0.3, 1.05, 1.1)  # the queue on the device
    for i in range(4):  # sale 0 goes straight through; 1–3 wait in the tray while offline
        cx = px if i == 0 else tx + (i - 2) * 0.4
        cz = 1.9 if i == 0 else 1.1
        _anchored_box(f"SR_lm_token_{i}", cx - 0.14, cx + 0.14, ty - 0.17, ty + 0.17, cz, cz + 0.12, mats["M_cardboard"], collection)
    # Stock bars: the counter's own figure and the server's authoritative one.
    _anchored_box("SR_lm_bar_counter", -1.7, -1.5, 63.4, 63.6, 1.05, 1.05 + STOCK_FULL / 2, mats["M_ochre"], collection)
    sx0, sx1, sy0, sy1, sh = LM_SERVER
    batch.box(basalt, sx0, sx1, sy0, sy1, 0, sh)  # the server
    batch.box(mats["M_ledgermind"], sx0 - 0.04, sx1 + 0.04, sy0 - 0.04, sy1 + 0.04, sh, sh + 0.15)
    _anchored_box("SR_lm_bar_server", 4.08, 4.32, sy0 - 0.08, sy0 - 0.02, 0.6, 0.6 + STOCK_FULL, mats["M_ochre"], collection)
    # The connection: a line from the till up and across to the server, recoloured when it drops.
    link = Batch("SR_lm_link", collection)
    link.beam(mats["M_live_link"], (px, py, 1.85), LM_LINK_FROM, 0.035)
    link.beam(mats["M_live_link"], LM_LINK_FROM, LM_LINK_TO, 0.035, segments=10)
    link.build()[0].name = "SR_lm_link"
    for x, y in ((LM_LINK_FROM[0], LM_LINK_FROM[1]), (LM_LINK_TO[0], LM_LINK_TO[1])):
        batch.beam(mats["M_steel_dark"], (x, y, LM_LINK_FROM[2] if x < 0 else LM_LINK_TO[2]), (x, y, HEIGHT), 0.012, segments=6)
    batch.beam(bronze, (sx0 + 1.2, sy0, sh + 0.15), LM_LINK_TO, 0.035)


def _city_cell(col, row):
    return CITY_X0 + col * CITY_PITCH, CITY_Y0 + row * CITY_PITCH


def _accra(batch, mats):
    basalt, bronze = mats["M_basalt"], mats["M_bronze"]
    x0, x1, y0, y1, top = CITY
    batch.box(basalt, x0, x1, y0, y1, 0, top - 0.05)  # the plinth
    batch.box(mats["M_sand"], x0, x1, y0 + 1.2, y1, top - 0.05, top)
    batch.box(mats["M_sea"], x0, x1, y0, y0 + 1.2, top - 0.05, top - 0.02)  # the Gulf of Guinea, south
    batch.box(mats["M_plaster"], x0, x1, y0 + 1.2, y0 + 1.32, top - 0.05, top + 0.005)  # the shore
    random_ = random.Random(1957)
    tones = (mats["M_plaster"], mats["M_plaster"], mats["M_concrete_laterite"], mats["M_laterite_clay"], mats["M_ochre"], mats["M_sand"])
    tower_x, tower_y = _city_cell(*TICK_TOWER)
    for col in range(CITY_COLS):
        for row in range(CITY_ROWS):
            if col % ROAD_EVERY == ROAD_OFFSET or row % ROAD_EVERY == ROAD_OFFSET or (col, row) in VENUES:
                continue
            x, y = _city_cell(col, row)
            if math.hypot(x - tower_x, y - tower_y) < 0.7:
                continue
            roll = random_.random()
            height = 0.08 + random_.random() * 0.3 + (0.45 if roll > 0.94 else 0.0)
            batch.box(tones[random_.randrange(len(tones))], x - 0.15, x + 0.15, y - 0.15, y + 0.15, top, top + height)
    for col, row in VENUES:
        x, y = _city_cell(col, row)
        batch.cylinder(mats["M_plaster"], x, y, top, 0.01, 0.17, segments=16)
        batch.cylinder(bronze, x, y, top, 0.55, 0.025, segments=8)
        batch.sphere(bronze, x, y, top + 0.6, 0.06, subdivisions=1)
    batch.cylinder(basalt, tower_x, tower_y, top, 1.2, 0.16, segments=16)  # the game server's tower
    batch.cylinder(bronze, tower_x, tower_y, top + 1.2, 0.06, 0.2, segments=16)


def _network_point(radius, angle, z):
    cx, cy = NETWORK_CENTRE
    return (cx + math.sin(angle) * radius, cy + math.cos(angle) * radius, z)


def _joydatabundle(batch, mats):
    cx, cy = NETWORK_CENTRE
    radius, height = DAIS
    batch.cylinder(mats["M_floor_terrazzo"], cx, cy, 0, height, radius, segments=64)
    batch.cylinder(mats["M_backend_grey"], cx, cy, height, 0.8, 0.9, segments=32)  # the backend: a teammate's work
    ax0, ax1, ay0, ay1 = ADMIN_DESK
    batch.box(mats["M_bronze_brushed"], ax0, ax1, ay0, ay1, height, height + 0.75)  # the payout review: Perez's flow
    surface = height + 0.006
    ring = [_network_point(FRONTEND_RADIUS, i / 64 * math.tau, surface) for i in range(65)]
    for start, end in zip(ring, ring[1:]):  # the frontend customers and resellers use: Perez's part
        batch.beam(mats["M_teal_deep"], start, end, 0.04, segments=6)
    for i in range(RESELLERS):
        angle = (i / RESELLERS) * math.tau + math.pi / RESELLERS
        rx, ry, _ = _network_point(RESELLER_RADIUS, angle, 0)
        batch.box(mats["M_teal"], rx - 0.3, rx + 0.3, ry - 0.3, ry + 0.3, height, height + 0.7)
        batch.beam(mats["M_steel_dark"], (rx, ry, surface), (cx, cy, surface), 0.015, segments=6)
        for k in range(3):
            px, py, _ = _network_point(CUSTOMER_RADIUS, angle + (k - 1) * 0.2, 0)
            batch.cylinder(mats["M_plaster"], px, py, height, 0.45, 0.18, segments=12)
            batch.beam(mats["M_steel_dark"], (px, py, surface), (rx, ry, surface), 0.012, segments=6)
    batch.beam(mats["M_steel_dark"], (cx, cy, surface), (cx, ay0, surface), 0.015, segments=6)


# Gallery lights for the new bays, matching FlowDesk's warm ceiling panels. Baked, never exported.
def _gallery_lights(lights_collection):
    from rooms.flowdesk import GALLERY_LIGHT_COLOUR, GALLERY_LIGHT_POWER

    for row, x in enumerate((-3.6, 3.6)):
        for i, y in enumerate((62.4, 67.2, 72.0, 79.8, 84.6, 89.4, 97.2, 102.0, 106.8)):
            light = bpy.data.lights.new(f"LGT_showroom_{row}_{i}", "AREA")
            light.shape = "SQUARE"
            light.size = 1.8
            light.energy = GALLERY_LIGHT_POWER
            light.color = GALLERY_LIGHT_COLOUR
            obj = bpy.data.objects.new(light.name, light)
            lights_collection.objects.link(obj)
            obj.location = (x, y, HEIGHT - 0.4)


def build(collection, mats, lights_collection):
    """Add the showroom's partitions and three project bays to the FlowDesk wing's collection."""
    batch = Batch("SR", collection)
    _partitions(batch, mats)
    _ledgermind(batch, collection, mats)
    _accra(batch, mats)
    _joydatabundle(batch, mats)
    batch.build()
    _gallery_lights(lights_collection)
    return {"bays": 4, "length": SHOWROOM_END - 30.6}
