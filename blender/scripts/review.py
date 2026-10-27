"""Review cameras, daylight and preview renders.

Two render modes:
- Workbench: flat colours for massing review (Checkpoint B). Seconds per shot.
- Cycles (CPU): morning daylight with bounce light for visual review
  (Checkpoint C onward). Run it in a background Blender process
  (scripts/render_cli.py) because it takes minutes per shot on the dev laptop.

Landscape and portrait cameras share positions so desktop and mobile
compositions can be judged side by side.
"""

import math
import os
import time
from dataclasses import dataclass, field

import bpy
from mathutils import Vector

LANDSCAPE = (1600, 900)
PORTRAIT = (900, 1600)
SQUARE = (1200, 1200)

# Morning sun from the south-east, a three-quarter light on the arrival view:
# it lights the north facade (which faces south) and throws the screen towers'
# lattice shadows diagonally across the court. Sky fill is kept low for contrast.
SUN_ELEVATION = math.radians(30)
SUN_HEADING = math.radians(55)
SUN_COLOUR = (1.0, 0.8, 0.62)
SUN_STRENGTH = 5.5
SKY_STRENGTH = 0.12
INTERIOR_EXPOSURE = 0.3

ROOF_OBJECTS = ("FD_roof_concrete_laterite", "FD_roof_timber_screen")


@dataclass(frozen=True)
class Shot:
    name: str
    location: tuple
    target: tuple
    lens: float
    size: tuple
    hide: tuple = field(default_factory=tuple)
    ortho_scale: float = 0.0
    exposure: float = 0.0  # added to the scene exposure, as a photographer would for interiors
    shift: tuple = (0.0, 0.0)  # lens shift: reframes without tilting, so verticals stay vertical


SHOTS = (
    # Arrival: from the terrace, off-axis so the Code Monument and the FlowDesk threshold both read.
    Shot("CAM_arrival_landscape", (6.0, -21.0, 3.6), (-0.6, 18.0, 5.0), 24, LANDSCAPE),
    # Portrait stands at the terrace edge, clear of the verandah columns.
    Shot("CAM_arrival_portrait", (4.2, -16.8, 3.6), (-0.4, 18.0, 7.5), 18, PORTRAIT),
    Shot("CAM_court_aerial", (34.0, -40.0, 32.0), (0.0, 8.0, 0.0), 32, LANDSCAPE),
    Shot("CAM_monument", (8.5, -9.5, 2.2), (0.3, 0.0, 2.7), 35, LANDSCAPE),
    Shot("CAM_flowdesk_pipeline", (4.2, 37.2, 2.8), (-0.6, 46.0, 0.9), 26, LANDSCAPE, exposure=INTERIOR_EXPOSURE),
    # FlowDesk: from inside the low vestibule, so the hall opens up beyond it.
    Shot("CAM_flowdesk_entry_landscape", (0.6, 27.0, 1.6), (0.0, 59.0, 3.2), 20, LANDSCAPE, exposure=INTERIOR_EXPOSURE),
    Shot("CAM_flowdesk_entry_portrait", (0.6, 27.0, 1.6), (0.0, 59.0, 3.8), 16, PORTRAIT, exposure=INTERIOR_EXPOSURE),
    Shot("CAM_flowdesk_cutaway", (17.0, 26.0, 30.0), (0.0, 46.0, 0.0), 26, LANDSCAPE, ROOF_OBJECTS),
    Shot("CAM_plan_top", (0.0, 17.0, 120.0), (0.0, 17.0, 0.0), 50, SQUARE, ROOF_OBJECTS, 96.0),
    # Arrival page posters (Phase 2F): the arrival views, shifted so the monument clears the
    # text: right of the text column on desktop, in the top band on phones.
    Shot("CAM_poster_landscape", (6.0, -21.0, 3.6), (-0.6, 18.0, 5.0), 24, (1920, 1080), shift=(-0.2, 0.0)),
    Shot("CAM_poster_portrait", (4.2, -16.8, 3.6), (-0.4, 18.0, 7.5), 18, (1080, 1920), shift=(0.0, -0.3)),
)


def _aim(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def _camera(shot, collection):
    camera = bpy.data.cameras.new(shot.name)
    camera.lens = shot.lens
    camera.clip_end = 500
    camera.shift_x, camera.shift_y = shot.shift
    if shot.ortho_scale:
        camera.type = "ORTHO"
        camera.ortho_scale = shot.ortho_scale
    obj = bpy.data.objects.new(shot.name, camera)
    collection.objects.link(obj)
    obj.location = shot.location
    _aim(obj, shot.target)
    return obj


def _cameras(collection):
    for shot in SHOTS:
        _camera(shot, collection)


def _sun(collection):
    sun = bpy.data.lights.new("LGT_sun_morning", "SUN")
    sun.energy = SUN_STRENGTH
    sun.color = SUN_COLOUR
    sun.angle = math.radians(1.0)
    obj = bpy.data.objects.new("LGT_sun_morning", sun)
    collection.objects.link(obj)
    obj.rotation_euler = (math.pi / 2 - SUN_ELEVATION, 0, SUN_HEADING)


def _world(scene):
    world = scene.world or bpy.data.worlds.new("WORLD_museum")
    scene.world = world
    world.color = (0.36, 0.47, 0.58)  # Workbench background
    if world.node_tree is None and hasattr(world, "use_nodes"):
        world.use_nodes = True
    nodes, links = world.node_tree.nodes, world.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputWorld")
    background = nodes.new("ShaderNodeBackground")
    background.inputs["Strength"].default_value = SKY_STRENGTH
    sky = nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_elevation = SUN_ELEVATION
    sky.sun_rotation = SUN_HEADING + math.pi
    sky.sun_disc = False  # the sun lamp provides direct light
    links.new(sky.outputs["Color"], background.inputs["Color"])
    links.new(background.outputs["Background"], output.inputs["Surface"])


def setup(scene, collection):
    """Cameras, sun and sky. Call one of the configure_* functions before rendering."""
    _cameras(collection)
    _sun(collection)
    _world(scene)
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.resolution_percentage = 100


def configure_workbench(scene):
    scene.render.engine = "BLENDER_WORKBENCH"
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.color_type = "MATERIAL"
    shading.show_shadows = True
    shading.shadow_intensity = 0.35
    shading.show_cavity = True
    shading.cavity_type = "WORLD"
    scene.display.light_direction = (0.55, -0.35, 0.76)
    scene.display.render_aa = "8"
    # AgX crushes flat colours; Standard shows the palette as authored.
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.exposure = 0.4


def configure_cycles(scene, samples=48):
    scene.render.engine = "CYCLES"
    cycles = scene.cycles
    cycles.device = "CPU"
    cycles.samples = samples
    cycles.use_adaptive_sampling = True
    cycles.adaptive_threshold = 0.05
    cycles.use_denoising = True
    cycles.denoiser = "OPENIMAGEDENOISE"
    cycles.max_bounces = 4
    cycles.diffuse_bounces = 3
    cycles.glossy_bounces = 2
    cycles.transmission_bounces = 2
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = 0.0


def render_previews(scene, out_dir, only=None):
    """Render review shots to out_dir (all, or the names in `only`); returns [(file, seconds)]."""
    os.makedirs(out_dir, exist_ok=True)
    results = []
    for shot in SHOTS:
        if only and shot.name not in only and shot.name.replace("CAM_", "") not in only:
            continue
        hidden = [bpy.data.objects[name] for name in shot.hide if name in bpy.data.objects]
        for obj in hidden:
            obj.hide_render = True
        base_exposure = scene.view_settings.exposure
        scene.view_settings.exposure = base_exposure + shot.exposure
        try:
            # Shots added after museum.blend was last built get their camera on demand.
            camera = bpy.data.objects.get(shot.name) or _camera(shot, scene.collection)
            scene.camera = camera
            scene.render.resolution_x, scene.render.resolution_y = shot.size
            path = os.path.join(out_dir, shot.name.replace("CAM_", "") + ".png")
            scene.render.filepath = path
            started = time.perf_counter()
            bpy.ops.render.render(write_still=True)
            results.append((path, round(time.perf_counter() - started, 2)))
        finally:
            scene.view_settings.exposure = base_exposure
            for obj in hidden:
                obj.hide_render = False
    return results
