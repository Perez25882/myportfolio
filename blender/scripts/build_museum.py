"""Entry point: rebuild the museum scene (Court + FlowDesk) and save it.

Run inside Blender (for example through the Blender MCP):

    import sys
    sys.path.insert(0, r"<repo>/blender/scripts")
    import build_museum
    build_museum.main()

Re-running is safe: each collection is wiped and rebuilt. Daylight renders
are slow, so they run in a background process instead (render_cli.py).
"""

import importlib
import os

import bpy

import review
from lib import geometry, guard, materials, planting
from rooms import court, flowdesk, monument, showroom

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BLEND_PATH = os.path.join(REPO, "blender", "src", "museum.blend")
PREVIEW_ROOT = os.path.join(REPO, "blender", "out", "previews")

COLLECTIONS = ("EXPORT_court", "EXPORT_flowdesk", "BAKE_LIGHTS_court", "BAKE_LIGHTS_flowdesk", "REF_scale", "REVIEW")
EXPORTED = ("EXPORT_court", "EXPORT_flowdesk")


def _reload():
    """Pick up script edits without restarting Blender (helpers first, then their users)."""
    for module in (geometry, materials, guard, planting, monument, court, flowdesk, showroom, review):
        importlib.reload(module)


def _stats(collection):
    triangles = 0
    draw_calls = 0
    for obj in collection.objects:
        if obj.type == "MESH":
            obj.data.calc_loop_triangles()
            triangles += len(obj.data.loop_triangles)
            draw_calls += max(1, len(obj.material_slots))
    return {"objects": len(collection.objects), "draw_calls": draw_calls, "triangles": triangles}


def build(scene):
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    collections = {name: guard.reset_collection(scene, name) for name in COLLECTIONS}
    mats = materials.library()
    court.build(collections["EXPORT_court"], collections["REF_scale"], mats, collections["BAKE_LIGHTS_court"])
    flowdesk.build(collections["EXPORT_flowdesk"], collections["REF_scale"], mats, collections["BAKE_LIGHTS_flowdesk"])
    # The FlowDesk wing continues as the project showroom: same collection, one building.
    showroom.build(collections["EXPORT_flowdesk"], mats, collections["BAKE_LIGHTS_flowdesk"])
    review.setup(scene, collections["REVIEW"])
    review.configure_cycles(scene)
    return {name: _stats(collections[name]) for name in EXPORTED}


def main(save=True, massing_previews=None):
    """Build and save. Pass a checkpoint folder name to also render quick Workbench massing previews."""
    _reload()
    scene = bpy.context.scene
    result = {"stats": build(scene)}
    if save:
        os.makedirs(os.path.dirname(BLEND_PATH), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        result["blend"] = BLEND_PATH
    if massing_previews:
        review.configure_workbench(scene)
        out_dir = os.path.join(PREVIEW_ROOT, massing_previews, "massing")
        result["renders"] = review.render_previews(scene, out_dir)
        review.configure_cycles(scene)
    return result
