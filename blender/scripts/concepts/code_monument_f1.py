"""Phase 2F · F1 concept previews: two Code Monument (</>) alternatives in the Court.

PREVIEW ONLY. Loads the production scene in memory, hides the Stratum, adds a
monument variant, renders review views, and saves a separate concept file.
blender/src/museum.blend and the exported GLBs are never written.

    blender -b blender/src/museum.blend -P blender/scripts/concepts/code_monument_f1.py -- \
        [--samples 32] [--percent 60] [--variants A B]

A · Cast: three monolithic cast-bronze glyphs on a basalt plinth. Each glyph is
    split by a fine shadow-gap seam; the reveal parts the two halves along it,
    exposing a dark steel internal rib.
B · Laminated: each glyph assembled from four precision bronze plates with
    visible steel spacer pins, on a dark steel base. The reveal slides the
    plates apart along their pins.
"""

import argparse
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

SCRIPTS = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, SCRIPTS)

import review  # noqa: E402
from lib.materials import rgba  # noqa: E402

REPO = os.path.abspath(os.path.join(SCRIPTS, "..", ".."))
OUT_DIR = os.path.join(REPO, "blender", "out", "previews", "f1")
CONCEPT_BLEND = os.path.join(REPO, "blender", "src", "concepts", "code_monument_f1.blend")

# Glyph proportions (metres). Strokes are as thick as they are deep, like cast sections.
HEIGHT = 4.2
STROKE = 0.85
ARM = 2.1
DEPTH = 0.84
GAP = 0.55
LEAN = 1.5
BASE_TOP = 0.95  # the plinth fully covers the Stratum's old 0.9 m plinth
SHOE = 0.08

LANDSCAPE = (1600, 900)
PORTRAIT = (900, 1600)

# name: (location, target, lens, size)
VIEWS = {
    "front": ((0.0, -15.5, 2.0), (0.0, 0.0, 2.8), 32, LANDSCAPE),
    "three_quarter": ((8.5, -9.5, 2.2), (0.3, 0.0, 2.7), 35, LANDSCAPE),
    "courtyard_wide": ((6.0, -21.0, 3.6), (-0.6, 18.0, 5.0), 24, LANDSCAPE),
    "portrait_mobile": ((4.2, -16.8, 3.6), (-0.4, 18.0, 7.5), 18, PORTRAIT),
    "detail": ((-0.9, -2.7, 1.5), (-2.25, -0.2, 1.25), 50, LANDSCAPE),
    "reveal": ((8.5, -9.5, 2.2), (0.3, 0.0, 2.7), 35, LANDSCAPE),
}


# ---------- glyph outlines (x across, z up; origin at bottom-left) ----------

def outline_lt():
    return [(0, HEIGHT / 2), (ARM, HEIGHT), (ARM + STROKE, HEIGHT), (STROKE, HEIGHT / 2), (ARM + STROKE, 0), (ARM, 0)]


def outline_gt():
    width = ARM + STROKE
    return [(width - x, z) for x, z in reversed(outline_lt())]


def outline_slash():
    return [(0, 0), (STROKE, 0), (STROKE + LEAN, HEIGHT), (LEAN, HEIGHT)]


def glyph_layout():
    """(key, outline, width, x offset) with the whole symbol centred on the court axis."""
    glyphs = [("lt", outline_lt(), ARM + STROKE), ("slash", outline_slash(), STROKE + LEAN), ("gt", outline_gt(), ARM + STROKE)]
    total = sum(width for _, _, width in glyphs) + GAP * (len(glyphs) - 1)
    x = -total / 2
    placed = []
    for key, outline, width in glyphs:
        placed.append((key, outline, width, x))
        x += width + GAP
    return placed


def contact_spans(key, width):
    """Where each glyph meets the base: the ends of its strokes at z = 0."""
    if key == "lt":
        return [(ARM, ARM + STROKE)]
    if key == "gt":
        return [(0, STROKE)]
    return [(0, STROKE)]


# ---------- mesh helpers ----------

def _prism(bm, outline, x0, y0, y1, z0, scale=1.0):
    cx = sum(x for x, _ in outline) / len(outline)
    cz = sum(z for _, z in outline) / len(outline)
    pts = [(cx + (x - cx) * scale, cz + (z - cz) * scale) for x, z in outline]
    front = [bm.verts.new((x0 + x, y0, z0 + z)) for x, z in pts]
    back = [bm.verts.new((x0 + x, y1, z0 + z)) for x, z in pts]
    bm.faces.new(front)
    bm.faces.new(back)
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        bm.faces.new((front[i], front[j], back[j], back[i]))


def _finish(name, bm, material, collection, bevel=0.0):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, profile=0.5, affect="EDGES", clamp_overlap=True)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material)
    for polygon in mesh.polygons:
        polygon.use_smooth = False
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj


def prism(name, outline, x0, y0, y1, z0, material, collection, bevel, scale=1.0):
    bm = bmesh.new()
    _prism(bm, outline, x0, y0, y1, z0, scale)
    return _finish(name, bm, material, collection, bevel)


def box(name, x0, x1, y0, y1, z0, z1, material, collection, bevel=0.0):
    bm = bmesh.new()
    created = bmesh.ops.create_cube(bm, size=1.0)
    for v in created["verts"]:
        v.co.x = min(x0, x1) if v.co.x < 0 else max(x0, x1)
        v.co.y = min(y0, y1) if v.co.y < 0 else max(y0, y1)
        v.co.z = min(z0, z1) if v.co.z < 0 else max(z0, z1)
    return _finish(name, bm, material, collection, bevel)


def pin_y(name, x, z, y0, y1, radius, material, collection):
    bm = bmesh.new()
    created = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=radius, radius2=radius, depth=abs(y1 - y0))
    bmesh.ops.rotate(bm, verts=created["verts"], cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, "X"))
    bmesh.ops.translate(bm, verts=created["verts"], vec=(x, (y0 + y1) / 2, z))
    return _finish(name, bm, material, collection)


# ---------- concept materials (move to lib/materials.py if approved) ----------

def _material(name, colour, metallic, roughness, roughness_noise=0.0, emission=0.0):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    if material.node_tree is None and hasattr(material, "use_nodes"):
        material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = rgba(colour)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if roughness_noise:
        # Brushed, hand-finished metal: roughness varies across the surface.
        coords = nodes.new("ShaderNodeTexCoord")
        mapping = nodes.new("ShaderNodeMapping")
        mapping.inputs["Scale"].default_value = (1.0, 1.0, 18.0)  # streaks run horizontally
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 6.0
        noise.inputs["Detail"].default_value = 8.0
        ramp = nodes.new("ShaderNodeMapRange")
        ramp.inputs["To Min"].default_value = roughness - roughness_noise
        ramp.inputs["To Max"].default_value = roughness + roughness_noise
        links.new(coords.outputs["Object"], mapping.inputs["Vector"])
        links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
        links.new(noise.outputs["Fac"], ramp.inputs["Value"])
        links.new(ramp.outputs["Result"], bsdf.inputs["Roughness"])
    if emission:
        bsdf.inputs["Emission Color"].default_value = rgba(colour)
        bsdf.inputs["Emission Strength"].default_value = emission
    material.diffuse_color = rgba(colour)
    return material


def concept_materials():
    return {
        # Brushed rather than polished, so it reads warm from a distance instead of mirroring the shade.
        "bronze": _material("MC_bronze_champagne", "#C4A06A", 1.0, 0.42, roughness_noise=0.1),
        "steel": _material("MC_steel_dark", "#2E2D2B", 1.0, 0.45),
        "basalt": bpy.data.materials["M_basalt"],
        "light": _material("MC_warm_line", "#FFD9AE", 0.0, 0.5, emission=1.5),
    }


# ---------- variants ----------

def _base(collection, mats, material, prefix):
    half_x, half_y = 5.7, 2.7
    box(f"{prefix}_plinth", -half_x, half_x, -half_y, half_y, 0, BASE_TOP, material, collection, bevel=0.01)
    # A single warm line along the front edge of the plinth: embedded lighting, not neon.
    box(f"{prefix}_light", -half_x + 0.3, half_x - 0.3, -half_y - 0.005, -half_y + 0.02, BASE_TOP - 0.08, BASE_TOP - 0.05, mats["light"], collection)


def _shoes(collection, mats, prefix, key, width, x0):
    for index, (a, b) in enumerate(contact_spans(key, width)):
        box(f"{prefix}_{key}_shoe_{index}", x0 + a - 0.1, x0 + b + 0.1, -DEPTH / 2 - 0.1, DEPTH / 2 + 0.1, BASE_TOP, BASE_TOP + SHOE, mats["steel"], collection, bevel=0.006)
        for bx in (x0 + a - 0.04, x0 + b + 0.04):
            for by in (-DEPTH / 2 - 0.05, DEPTH / 2 + 0.05):
                bolt = bmesh.new()
                created = bmesh.ops.create_cone(bolt, cap_ends=True, segments=8, radius1=0.03, radius2=0.03, depth=0.03)
                bmesh.ops.translate(bolt, verts=created["verts"], vec=(bx, by, BASE_TOP + SHOE + 0.015))
                _finish(f"{prefix}_{key}_bolt", bolt, mats["steel"], collection)


def build_cast(collection, mats):
    """A · Cast: monolithic bronze halves either side of a fine seam, around a steel rib."""
    z0 = BASE_TOP + SHOE
    parts = {"front": [], "back": []}
    _base(collection, mats, mats["basalt"], "F1A")
    for key, outline, width, x0 in glyph_layout():
        parts["front"].append(prism(f"F1A_{key}_front", outline, x0, -DEPTH / 2, -0.015, z0, mats["bronze"], collection, bevel=0.035))
        parts["back"].append(prism(f"F1A_{key}_back", outline, x0, 0.015, DEPTH / 2, z0, mats["bronze"], collection, bevel=0.035))
        prism(f"F1A_{key}_rib", outline, x0, -0.1, 0.1, z0, mats["steel"], collection, bevel=0.0, scale=0.82)
        _shoes(collection, mats, "F1A", key, width, x0)
    return parts


def build_laminated(collection, mats):
    """B · Laminated: four precision plates per glyph on steel spacer pins."""
    plates, gap = 4, 0.1
    thickness = (DEPTH - gap * (plates - 1)) / plates
    z0 = BASE_TOP + SHOE
    layers = []
    _base(collection, mats, mats["steel"], "F1B")
    for key, outline, width, x0 in glyph_layout():
        for i in range(plates):
            y0 = -DEPTH / 2 + i * (thickness + gap)
            layers.append((i, prism(f"F1B_{key}_plate_{i}", outline, x0, y0, y0 + thickness, z0, mats["bronze"], collection, bevel=0.012)))
        for px, pz in _pin_points(key):
            pin_y(f"F1B_{key}_pin", x0 + px, z0 + pz, -DEPTH / 2 - 0.02, DEPTH / 2 + 0.02, 0.05, mats["steel"], collection)
        _shoes(collection, mats, "F1B", key, width, x0)
    return layers


def _pin_points(key):
    if key == "slash":
        return [(STROKE / 2 + LEAN * t, HEIGHT * t) for t in (0.2, 0.5, 0.8)]
    upper = (ARM * 0.6 + STROKE * 0.5, HEIGHT * 0.8)
    lower = (ARM * 0.6 + STROKE * 0.5, HEIGHT * 0.2)
    tip = (STROKE * 0.75, HEIGHT / 2)
    points = [tip, upper, lower]
    if key == "gt":
        width = ARM + STROKE
        points = [(width - x, z) for x, z in points]
    return points


# ---------- rendering ----------

def _camera(name, location, target, lens):
    camera = bpy.data.cameras.new(name)
    camera.lens = lens
    camera.clip_end = 500
    obj = bpy.data.objects.new(name, camera)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector(target) - Vector(location)).to_track_quat("-Z", "Y").to_euler()
    return obj


def render(variant, view, percent):
    location, target, lens, size = VIEWS[view]
    scene = bpy.context.scene
    scene.camera = _camera(f"CAM_F1_{variant}_{view}", location, target, lens)
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.resolution_percentage = percent
    scene.render.filepath = os.path.join(OUT_DIR, f"monument_{variant}_{view}.png")
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {scene.render.filepath}", flush=True)


def _reveal(variant, parts):
    if variant == "A":
        for obj in parts["front"]:
            obj.location.y -= 0.35
        for obj in parts["back"]:
            obj.location.y += 0.35
    else:
        for index, obj in parts:
            obj.location.y += (index - 1.5) * 0.2


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", type=int, default=32)
    parser.add_argument("--percent", type=int, default=60)
    parser.add_argument("--variants", nargs="*", default=["A", "B"])
    args = parser.parse_args(argv)

    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(CONCEPT_BLEND), exist_ok=True)
    scene = bpy.context.scene
    review.configure_cycles(scene, args.samples)

    for obj in bpy.data.objects:
        if obj.name.startswith("CT_stratum_"):
            obj.hide_render = True  # the Code Monument replaces the Stratum

    mats = concept_materials()
    builders = {"A": build_cast, "B": build_laminated}
    for variant in args.variants:
        collection = bpy.data.collections.new(f"F1_monument_{variant}")
        scene.collection.children.link(collection)
        parts = builders[variant](collection, mats)
        for view in ("front", "three_quarter", "courtyard_wide", "portrait_mobile", "detail"):
            render(variant, view, args.percent)
        _reveal(variant, parts)
        render(variant, "reveal", args.percent)
        collection.hide_render = True

    bpy.ops.wm.save_as_mainfile(filepath=CONCEPT_BLEND, copy=True)
    print(f"SAVED {CONCEPT_BLEND}", flush=True)


main()
