"""Material library: one source of truth for the museum's surfaces.

Colours follow design/phase-1/01-creative-direction.md §5. Each material is
procedural and driven by world-space coordinates, so it works on merged
meshes without UVs. Procedural shaders do not export to glTF; they are baked
to textures before export (06-technical-art-plan §6, step 4).

Every material also sets `diffuse_color`, which the Workbench massing
renders use.
"""

import bpy

BOARD_HEIGHT = 0.3  # board-formed concrete: one horizontal board line every 0.3 m
STRIP_WIDTH = 2.4  # terrazzo laid in long north-south strips

# name: (display hex, roughness, metallic, builder)
SPECS = {
    "M_concrete_laterite": ("#9A8976", 0.85, 0.0, "concrete"),
    "M_basalt": ("#3A3835", 0.72, 0.0, "basalt"),
    "M_timber_screen": ("#8A5A32", 0.6, 0.0, "timber"),
    "M_floor_terrazzo": ("#6B625A", 0.45, 0.0, "terrazzo"),
    "M_ground": ("#8C7B66", 0.95, 0.0, "earth"),
    "M_water": ("#1F3540", 0.03, 0.0, "flat"),
    "M_planting": ("#4F6B3A", 0.8, 0.0, "foliage"),
    "M_bronze": ("#6B5235", 0.35, 1.0, "flat"),
    "M_display": ("#111818", 0.2, 0.0, "display"),
    "M_glass": ("#20292B", 0.08, 0.2, "flat"),
    "M_cardboard": ("#B39062", 0.8, 0.0, "flat"),
    "M_ref_figure": ("#2A2826", 0.7, 0.0, "flat"),
    # Phase 2F
    "M_paving": ("#B3A08A", 0.6, 0.0, "paving"),
    "M_planting_dark": ("#3A5129", 0.85, 0.0, "flat"),
    "M_foliage_light": ("#6B8A45", 0.8, 0.0, "flat"),
    "M_bark": ("#5A4636", 0.9, 0.0, "flat"),
    "M_bronze_brushed": ("#C4A06A", 0.42, 1.0, "brushed"),
    "M_steel_dark": ("#2E2D2B", 0.45, 1.0, "flat"),
    "M_warm_line": ("#FFD9AE", 0.5, 0.0, "warm_light"),
    "M_screen_customer": ("#0F1716", 0.25, 0.0, "screen_customer"),
    "M_screen_owner": ("#0F1716", 0.25, 0.0, "screen_owner"),
    # The project showroom (2026-10-28): each project's own tone, and the plaster of the 2D portfolio.
    "M_plaster": ("#E9E1D4", 0.8, 0.0, "flat"),
    "M_sand": ("#D8C3A2", 0.9, 0.0, "flat"),
    "M_laterite_clay": ("#A0583A", 0.85, 0.0, "flat"),
    "M_ochre": ("#C08A4A", 0.8, 0.0, "flat"),
    "M_sea": ("#5F7F7A", 0.2, 0.0, "flat"),
    "M_ledgermind": ("#3F5A52", 0.7, 0.0, "flat"),
    "M_teal": ("#69B9C4", 0.6, 0.0, "flat"),
    "M_teal_deep": ("#0F7C8F", 0.5, 0.0, "flat"),
    "M_backend_grey": ("#7A8486", 0.7, 0.0, "flat"),
    # Runtime-coloured parts, left unbaked: the browser recolours them (online, offline).
    "M_live_screen": ("#7FC4A4", 0.4, 0.0, "flat"),
    "M_live_link": ("#B48A4E", 0.5, 0.0, "flat"),
}

# Interface reconstructions shown on the FlowDesk displays (rendered from blender/refs/ui/*.html).
SCREEN_IMAGES = {
    "screen_customer": "blender/refs/ui/customer-chat.png",
    "screen_owner": "blender/refs/ui/owner-dashboard.png",
}

# Secondary tones for the procedural builders.
TONES = {
    "concrete": ("#A88C70", "#8F765E", "#6A5644"),
    "basalt": ("#3E3C39", "#2C2A28"),
    "timber": ("#8A5A32", "#6E4526"),
    "terrazzo": ("#7A6A5C", "#685A4E", "#B3A391"),
    "earth": ("#8C7B66", "#6F5F4C"),
    "foliage": ("#56733D", "#3A5129"),
}


def _srgb_to_linear(channel):
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def rgba(hex_colour):
    """sRGB hex to linear RGBA."""
    value = hex_colour.lstrip("#")
    rgb = [_srgb_to_linear(int(value[i : i + 2], 16) / 255) for i in (0, 2, 4)]
    return (*rgb, 1.0)


class _Graph:
    """Small helper over a material node tree."""

    def __init__(self, material):
        if material.node_tree is None and hasattr(material, "use_nodes"):
            material.use_nodes = True
        self.nodes = material.node_tree.nodes
        self.links = material.node_tree.links
        self.nodes.clear()
        self.output = self.nodes.new("ShaderNodeOutputMaterial")
        self.bsdf = self.nodes.new("ShaderNodeBsdfPrincipled")
        self.links.new(self.bsdf.outputs["BSDF"], self.output.inputs["Surface"])
        self._coords = None

    def coords(self):
        if self._coords is None:
            texcoord = self.nodes.new("ShaderNodeTexCoord")
            self._coords = texcoord.outputs["Object"]
        return self._coords

    def axis(self, name):
        separate = self.nodes.new("ShaderNodeSeparateXYZ")
        self.links.new(self.coords(), separate.inputs[0])
        return separate.outputs[name]

    def math(self, operation, a, b=0.0):
        node = self.nodes.new("ShaderNodeMath")
        node.operation = operation
        for index, value in enumerate((a, b)):
            if isinstance(value, (int, float)):
                node.inputs[index].default_value = value
            else:
                self.links.new(value, node.inputs[index])
        return node.outputs["Value"]

    def noise(self, scale, detail=4.0):
        node = self.nodes.new("ShaderNodeTexNoise")
        node.inputs["Scale"].default_value = scale
        node.inputs["Detail"].default_value = detail
        self.links.new(self.coords(), node.inputs["Vector"])
        return node.outputs["Fac"]

    def ramp(self, factor, stops, constant=False):
        """Map a 0–1 factor onto colour stops [(position, hex)]."""
        node = self.nodes.new("ShaderNodeValToRGB")
        ramp = node.color_ramp
        ramp.interpolation = "CONSTANT" if constant else "LINEAR"
        ramp.elements[0].position, ramp.elements[0].color = stops[0][0], rgba(stops[0][1])
        ramp.elements[1].position, ramp.elements[1].color = stops[-1][0], rgba(stops[-1][1])
        for position, colour in stops[1:-1]:
            ramp.elements.new(position).color = rgba(colour)
        self.links.new(factor, node.inputs["Fac"])
        return node.outputs["Color"]

    def base_colour(self, socket):
        self.links.new(socket, self.bsdf.inputs["Base Color"])


def _concrete(graph):
    light, mid, line = TONES["concrete"]
    mottling = graph.math("MULTIPLY", graph.noise(3.0), 0.55)
    board = graph.math("FRACT", graph.math("DIVIDE", graph.axis("Z"), BOARD_HEIGHT))
    line_mask = graph.math("LESS_THAN", board, 0.035)
    graph.base_colour(graph.ramp(graph.math("MAXIMUM", mottling, line_mask), [(0.0, light), (0.55, mid), (1.0, line)]))


def _terrazzo(graph):
    tone_a, tone_b, chip = TONES["terrazzo"]
    strip = graph.math("LESS_THAN", graph.math("FRACT", graph.math("DIVIDE", graph.axis("X"), STRIP_WIDTH)), 0.5)
    voronoi = graph.nodes.new("ShaderNodeTexVoronoi")
    voronoi.inputs["Scale"].default_value = 28.0
    graph.links.new(graph.coords(), voronoi.inputs["Vector"])
    chips = graph.math("LESS_THAN", voronoi.outputs["Distance"], 0.12)
    factor = graph.math("MAXIMUM", graph.math("MULTIPLY", strip, 0.5), chips)
    graph.base_colour(graph.ramp(factor, [(0.0, tone_a), (0.5, tone_b), (1.0, chip)], constant=True))


PAVING = (1.2, 2.4)  # large-format slabs, running bond along Y


def _paving(graph):
    """Stone paving: per-slab tone variation and 2.5 cm joints, all in world space."""
    light, dark, joint = "#BCA78D", "#A48E74", "#6A5A4A"
    u = graph.math("DIVIDE", graph.axis("X"), PAVING[0])
    v = graph.math("DIVIDE", graph.axis("Y"), PAVING[1])
    row = graph.math("FLOOR", v)
    u_bond = graph.math("ADD", u, graph.math("MULTIPLY", graph.math("MODULO", row, 2.0), 0.5))
    joint_u = graph.math("LESS_THAN", graph.math("FRACT", u_bond), 0.025 / PAVING[0])
    joint_v = graph.math("LESS_THAN", graph.math("FRACT", v), 0.025 / PAVING[1])
    combine = graph.nodes.new("ShaderNodeCombineXYZ")
    graph.links.new(graph.math("FLOOR", u_bond), combine.inputs["X"])
    graph.links.new(row, combine.inputs["Y"])
    tone = graph.nodes.new("ShaderNodeTexWhiteNoise")
    tone.noise_dimensions = "3D"
    graph.links.new(combine.outputs["Vector"], tone.inputs["Vector"])
    slab = graph.math("MULTIPLY", tone.outputs["Value"], 0.6)
    grain = graph.math("MULTIPLY", graph.noise(9.0), 0.2)
    factor = graph.math("MAXIMUM", graph.math("ADD", slab, grain), graph.math("MAXIMUM", joint_u, joint_v))
    graph.base_colour(graph.ramp(factor, [(0.0, light), (0.75, dark), (0.99, joint)]))


def _timber(graph):
    light, dark = TONES["timber"]
    wave = graph.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 3.0
    wave.inputs["Distortion"].default_value = 6.0
    graph.links.new(graph.coords(), wave.inputs["Vector"])
    graph.base_colour(graph.ramp(wave.outputs["Fac"], [(0.2, light), (0.9, dark)]))


def _two_tone(key, scale):
    def build(graph):
        light, dark = TONES[key]
        graph.base_colour(graph.ramp(graph.noise(scale), [(0.35, light), (0.7, dark)]))

    return build


def _brushed(graph):
    """Brushed metal: roughness streaks run horizontally across the surface."""
    mapping = graph.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 1.0, 18.0)
    graph.links.new(graph.coords(), mapping.inputs["Vector"])
    noise = graph.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6.0
    noise.inputs["Detail"].default_value = 8.0
    graph.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    graph.links.new(graph.math("ADD", graph.math("MULTIPLY", noise.outputs["Fac"], 0.2), 0.32), graph.bsdf.inputs["Roughness"])


def _warm_light(graph):
    graph.bsdf.inputs["Emission Color"].default_value = rgba("#FFD9AE")
    graph.bsdf.inputs["Emission Strength"].default_value = 1.5


def _screen(key):
    """An emissive display showing an interface reconstruction image."""

    def build(graph):
        import os

        repo = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
        path = os.path.join(repo, SCREEN_IMAGES[key])
        if not os.path.exists(path):
            return _display(graph)
        texture = graph.nodes.new("ShaderNodeTexImage")
        texture.image = bpy.data.images.load(path, check_existing=True)
        uv = graph.nodes.new("ShaderNodeTexCoord")
        graph.links.new(uv.outputs["UV"], texture.inputs["Vector"])
        graph.links.new(texture.outputs["Color"], graph.bsdf.inputs["Base Color"])
        graph.links.new(texture.outputs["Color"], graph.bsdf.inputs["Emission Color"])
        graph.bsdf.inputs["Emission Strength"].default_value = 0.9

    return build


def _display(graph):
    graph.bsdf.inputs["Emission Color"].default_value = rgba("#2C4A44")
    graph.bsdf.inputs["Emission Strength"].default_value = 1.2


BUILDERS = {
    "concrete": _concrete,
    "terrazzo": _terrazzo,
    "timber": _timber,
    "basalt": _two_tone("basalt", 8.0),
    "earth": _two_tone("earth", 2.0),
    "foliage": _two_tone("foliage", 4.0),
    "display": _display,
    "flat": lambda graph: None,
    "brushed": _brushed,
    "paving": _paving,
    "warm_light": _warm_light,
    "screen_customer": _screen("screen_customer"),
    "screen_owner": _screen("screen_owner"),
}


def get(name):
    """Return the named material, (re)building its node graph from the spec."""
    if name not in SPECS:
        raise KeyError(f"{name} is not in the material library")
    display_hex, roughness, metallic, builder = SPECS[name]
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.diffuse_color = rgba(display_hex)
    material.roughness = roughness
    material.metallic = metallic
    graph = _Graph(material)
    graph.bsdf.inputs["Base Color"].default_value = rgba(display_hex)
    graph.bsdf.inputs["Roughness"].default_value = roughness
    graph.bsdf.inputs["Metallic"].default_value = metallic
    BUILDERS[builder](graph)
    return material


def library():
    """All library materials keyed by name."""
    return {name: get(name) for name in SPECS}
