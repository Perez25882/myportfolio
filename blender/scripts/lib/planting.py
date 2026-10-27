"""Low-poly tropical planting for the Court (Phase 2F).

Opaque geometry only (no alpha cut-outs, which are expensive on phones),
built into a Batch so each foliage colour is one draw call. Placement uses a
seeded random generator, so every rebuild produces the same garden.
"""

import math
import random

FOLIAGE = ("M_planting", "M_planting_dark", "M_foliage_light")


def canopy_tree(batch, mats, x, y, z, height=7.2, seed=1):
    """Spreading, neem-like shade tree: a forked trunk under a broad umbrella canopy."""
    rng = random.Random(seed)
    bark = mats["M_bark"]
    fork = z + height * 0.38
    batch.beam(bark, (x, y, z), (x, y, fork), 0.26, 0.2, segments=8)
    crown_r = height * 0.42
    for i in range(4):
        angle = i * math.pi / 2 + rng.uniform(-0.4, 0.4)
        tip = (x + math.cos(angle) * crown_r * 0.55, y + math.sin(angle) * crown_r * 0.55, z + height * 0.72)
        batch.beam(bark, (x, y, fork), tip, 0.16, 0.08, segments=6)
    for i in range(9):
        angle = i * 2 * math.pi / 9 + rng.uniform(-0.3, 0.3)
        reach = crown_r * rng.uniform(0.35, 0.8)
        cz = z + height * rng.uniform(0.74, 0.92)
        radius = rng.uniform(1.3, 1.9)
        batch.sphere(mats[FOLIAGE[i % 3]], x + math.cos(angle) * reach, y + math.sin(angle) * reach, cz, radius, scale=(1, 1, 0.55), subdivisions=1)
    batch.sphere(mats["M_planting_dark"], x, y, z + height * 0.9, crown_r * 0.5, scale=(1, 1, 0.4), subdivisions=1)


def palm(batch, mats, x, y, z, height=8.0, seed=2):
    """A gently curved trunk with an arching crown of fronds."""
    rng = random.Random(seed)
    lean = (rng.uniform(-0.6, 0.6), rng.uniform(-0.6, 0.6))
    segments = 6
    points = []
    for i in range(segments + 1):
        t = i / segments
        points.append((x + lean[0] * t * t, y + lean[1] * t * t, z + height * t))
    for i in range(segments):
        r0 = 0.22 - 0.05 * i / segments
        batch.beam(mats["M_bark"], points[i], points[i + 1], r0, r0 - 0.008, segments=8)
    top = points[-1]
    for i in range(10):
        angle = i * 2 * math.pi / 10 + rng.uniform(-0.2, 0.2)
        length = rng.uniform(2.6, 3.2)
        mid = (top[0] + math.cos(angle) * length * 0.5, top[1] + math.sin(angle) * length * 0.5, top[2] + 0.5)
        tip = (top[0] + math.cos(angle) * length, top[1] + math.sin(angle) * length, top[2] - 0.6)
        material = mats[FOLIAGE[i % 2]]
        batch.beam(material, top, mid, 0.05, 0.22, segments=3)
        batch.beam(material, mid, tip, 0.22, 0.03, segments=3)


def bed_planting(batch, mats, x0, x1, y0, y1, top, seed=3):
    """Layered bed: groundcover mounds, shrub clusters and grass tufts, back to front."""
    rng = random.Random(seed)
    width, depth = x1 - x0, y1 - y0
    area = width * depth
    for _ in range(int(area / 4) + 4):  # groundcover
        batch.sphere(mats["M_foliage_light"], rng.uniform(x0 + 0.4, x1 - 0.4), rng.uniform(y0 + 0.4, y1 - 0.4), top + 0.05, rng.uniform(0.5, 0.9), scale=(1, 1, 0.28), subdivisions=1)
    for _ in range(int(area / 7) + 3):  # shrubs
        sx, sy = rng.uniform(x0 + 0.6, x1 - 0.6), rng.uniform(y0 + 0.6, y1 - 0.6)
        for k in range(3):
            batch.sphere(mats[FOLIAGE[(k + 1) % 3]], sx + rng.uniform(-0.35, 0.35), sy + rng.uniform(-0.35, 0.35), top + 0.35 + 0.15 * k, rng.uniform(0.35, 0.55), scale=(1, 1, 0.75), subdivisions=1)
    for _ in range(int(area / 10) + 2):  # grass tufts
        gx, gy = rng.uniform(x0 + 0.3, x1 - 0.3), rng.uniform(y0 + 0.3, y1 - 0.3)
        for blade in range(9):
            angle = blade * 2 * math.pi / 9
            tip = (gx + math.cos(angle) * 0.35, gy + math.sin(angle) * 0.35, top + rng.uniform(0.7, 1.1))
            batch.beam(mats["M_planting"], (gx, gy, top), tip, 0.025, 0.004, segments=3)
