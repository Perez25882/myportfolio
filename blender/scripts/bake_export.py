"""Bake each room's lighting into one texture atlas and export a GLB per room.

    blender -b blender/src/museum.blend -P blender/scripts/bake_export.py -- \
        [--size 1024] [--samples 32] [--rooms court flowdesk]

For each room:
1. Pack every exported object into one shared UV space ("bake").
2. Bake Cycles COMBINED lighting (diffuse direct + indirect + emission) into a
   float image, then save it display-referred (AgX + the room's exposure), so
   the browser shows it unlit, exactly as Blender rendered it.
3. Replace materials with one material using that atlas, merge the static
   parts into `<prefix>_static`, keep runtime parts separate, export the GLB.

Works on the file in memory only; museum.blend is never saved by this script.
Outputs: blender/out/bake/<room>_atlas.png and blender/out/raw/<room>.glb.
Then run `npm run models:optimize` to compress them into public/models/.
"""

import argparse
import os
import sys
import time

import bpy

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
BAKE_DIR = os.path.join(REPO, "blender", "out", "bake")
MODEL_DIR = os.path.join(REPO, "blender", "out", "raw")

ROOMS = {
    # The Court floor gets its own atlas so shadows and paving joints stay sharp (Phase 2F).
    "court": {"collection": "EXPORT_court", "prefix": "CT", "exclude": ("CT_ground",), "exposure": 0.0, "split": ("CT_paving",)},
    # The FlowDesk wing and the project showroom it opens into: one building, one GLB.
    "showroom": {"collection": "EXPORT_flowdesk", "prefix": "SR", "exclude": (), "exposure": 0.3, "size": 2048},
}

# Parts the browser moves or replaces at runtime; everything else is merged.
RUNTIME_PREFIXES = (
    "CT_monument_",
    "FD_screen_",
    "FD_pipeline_lid",
    "FD_floor_gate",
    "FD_order_slip",
    "FD_order_slab",
    "SR_lm_",
)
# Reflective bronze and the interface displays keep their own materials instead of the baked atlas.
UNBAKED_PREFIXES = ("CT_monument_", "FD_screen_", "SR_lm_screen", "SR_lm_link")


def _args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--size", type=int, default=1024)  # mobile lightmap size (06-technical-art-plan §2)
    parser.add_argument("--samples", type=int, default=32)  # denoised afterwards
    parser.add_argument("--rooms", nargs="*", default=list(ROOMS))
    return parser.parse_args(argv)


def _select_only(objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


def _pack_uvs(objects):
    """One shared UV space with uniform texel density, so big floors get pixels in proportion to their area."""
    for obj in objects:
        uv = obj.data.uv_layers.get("bake") or obj.data.uv_layers.new(name="bake")
        obj.data.uv_layers.active = uv
    _select_only(objects)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.0, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.uv.average_islands_scale()
    # Thousands of tiny lattice and fin islands: a small margin raises atlas use from 23% to 58%
    # (measured on the Court), at the cost of slight bleeding on those tiny islands.
    bpy.ops.uv.pack_islands(rotate=True, scale=True, margin=0.0005, shape_method="AABB")
    bpy.ops.object.mode_set(mode="OBJECT")


def _bake(objects, image, samples):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    bake = scene.render.bake
    bake.margin = 4
    bake.use_pass_direct = True
    bake.use_pass_indirect = True
    bake.use_pass_diffuse = True
    bake.use_pass_glossy = False  # view-dependent; meaningless in a static atlas
    bake.use_pass_transmission = True
    bake.use_pass_emit = True

    materials = {slot.material for obj in objects for slot in obj.material_slots if slot.material}
    targets = []
    for material in materials:
        node = material.node_tree.nodes.new("ShaderNodeTexImage")
        node.image = image
        material.node_tree.nodes.active = node
        targets.append((material, node))
    # With glossy off, a metal has no diffuse term and bakes black. Bake baked metals (rails,
    # stations, inlays) as their base colour instead; the live monument bronze is not baked.
    metals = [
        (node.inputs["Metallic"], node.inputs["Metallic"].default_value)
        for material in materials
        for node in material.node_tree.nodes
        if node.type == "BSDF_PRINCIPLED" and node.inputs["Metallic"].default_value > 0
    ]
    for socket, _ in metals:
        socket.default_value = 0.0
    try:
        _select_only(objects)
        bpy.ops.object.bake(type="COMBINED", margin=4, use_clear=True)
    finally:
        for socket, value in metals:
            socket.default_value = value
        for material, node in targets:
            material.node_tree.nodes.remove(node)


def _denoise_and_save(image, path, exposure):
    """Denoise the float bake with OpenImageDenoise and save it display-referred (AgX + exposure).

    Runs the image through the compositor: a cheap Workbench render whose
    output is replaced by Image → Denoise. Cycles cannot denoise bakes itself,
    and denoising lets the bake use far fewer samples on the dev laptop.
    """
    scene = bpy.context.scene
    tree = bpy.data.node_groups.new("BAKE_denoise", "CompositorNodeTree")
    tree.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    source = tree.nodes.new("CompositorNodeImage")
    source.image = image
    denoise = tree.nodes.new("CompositorNodeDenoise")
    output = tree.nodes.new("NodeGroupOutput")
    tree.links.new(source.outputs["Image"], denoise.inputs["Image"])
    tree.links.new(denoise.outputs["Image"], output.inputs[0])

    engine = scene.render.engine
    scene.compositing_node_group = tree
    scene.render.use_compositing = True
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x, scene.render.resolution_y = image.size
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = exposure
    settings = scene.render.image_settings
    settings.file_format = "PNG"
    settings.color_mode = "RGB"
    settings.color_depth = "8"
    scene.render.filepath = path
    try:
        bpy.ops.render.render(write_still=True)
    finally:
        scene.compositing_node_group = None
        bpy.data.node_groups.remove(tree)
        scene.render.engine = engine


def _atlas_material(name, path):
    material = bpy.data.materials.new(name)
    if material.node_tree is None and hasattr(material, "use_nodes"):
        material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = bpy.data.images.load(path, check_existing=False)
    texture.image.colorspace_settings.name = "sRGB"
    links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 1.0
    return material


def _merge_static(objects, prefix):
    runtime = [obj for obj in objects if obj.name.startswith(RUNTIME_PREFIXES)]
    static = [obj for obj in objects if obj not in runtime]
    if len(static) > 1:
        _select_only(static)
        bpy.ops.object.join()
    merged = bpy.context.view_layer.objects.active if len(static) > 1 else static[0]
    merged.name = f"{prefix}_static"
    merged.data.name = merged.name
    return [merged, *runtime]


def _export(objects, room):
    collection = bpy.data.collections.new(f"GLB_{room}")
    bpy.context.scene.collection.children.link(collection)
    for obj in objects:
        collection.objects.link(obj)
    layer = bpy.context.view_layer.layer_collection.children[collection.name]
    bpy.context.view_layer.active_layer_collection = layer
    os.makedirs(MODEL_DIR, exist_ok=True)
    path = os.path.join(MODEL_DIR, f"{room}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_active_collection=True,
        use_active_scene=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=False,  # unlit atlas: normals are never used
        export_materials="EXPORT",
        export_image_format="WEBP",
        export_image_quality=85,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
    )
    return path


def bake_room(room, size, samples):
    spec = ROOMS[room]
    started = time.perf_counter()
    objects = [
        obj
        for obj in bpy.data.collections[spec["collection"]].objects
        if obj.type == "MESH" and obj.name not in spec["exclude"]
    ]
    unbaked = [obj for obj in objects if obj.name.startswith(UNBAKED_PREFIXES)]
    split = [obj for obj in objects if obj.name in spec.get("split", ())]
    rest = [obj for obj in objects if obj not in unbaked and obj not in split]

    os.makedirs(BAKE_DIR, exist_ok=True)
    bake_seconds = {}
    for suffix, group in (("floor", split), ("atlas", rest)):
        if not group:
            continue
        group_started = time.perf_counter()
        _pack_uvs(group)
        room_size = spec.get("size", size)
        image = bpy.data.images.new(f"LM_{room}_{suffix}", room_size, room_size, float_buffer=True, alpha=False)
        _bake(group, image, samples)
        path = os.path.join(BAKE_DIR, f"{room}_{suffix}.png")
        _denoise_and_save(image, path, spec["exposure"])
        material = _atlas_material(f"MB_{room}_{suffix}", path)
        for obj in group:
            obj.data.materials.clear()
            obj.data.materials.append(material)
        bake_seconds[suffix] = round(time.perf_counter() - group_started, 1)

    exported = _export([*_merge_static(rest, spec["prefix"]), *split, *unbaked], room)
    return {
        "room": room,
        "bake_seconds": bake_seconds,
        "total_seconds": round(time.perf_counter() - started, 1),
        "glb_bytes": os.path.getsize(exported),
    }


def main():
    args = _args()
    for obj in bpy.data.collections["REF_scale"].objects:
        obj.hide_render = True  # people are for scale only; they must not cast baked shadows
    for room in args.rooms:
        result = bake_room(room, args.size, args.samples)
        print(f"BAKED {result}", flush=True)


main()
