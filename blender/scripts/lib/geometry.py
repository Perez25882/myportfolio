"""Primitive builders for museum geometry.

Data API only (no bpy.ops), so builds are repeatable and independent of
editor selection or mode. All dimensions are metres on the 1.2 m module.

Two ways to build:
- `box`, `cylinder`, `sphere` create one standalone object. Use them for
  parts that move or change at runtime (Stratum layers, screens).
- `Batch` merges static parts into one object per material, which keeps
  draw calls within the mobile budget (docs: 06-technical-art-plan §3).
"""

import bmesh
import bpy

MODULE = 1.2
BAY = 3.6


def _add_box(bm, x0, x1, y0, y1, z0, z1):
    (xa, xb), (ya, yb), (za, zb) = sorted((x0, x1)), sorted((y0, y1)), sorted((z0, z1))
    created = bmesh.ops.create_cube(bm, size=1.0)
    for vert in created["verts"]:
        vert.co.x = xa if vert.co.x < 0 else xb
        vert.co.y = ya if vert.co.y < 0 else yb
        vert.co.z = za if vert.co.z < 0 else zb


def _add_cylinder(bm, x, y, z0, height, radius, segments):
    created = bmesh.ops.create_cone(
        bm, cap_ends=True, segments=segments, radius1=radius, radius2=radius, depth=height
    )
    bmesh.ops.translate(bm, verts=created["verts"], vec=(x, y, z0 + height / 2))


def _add_beam(bm, start, end, radius, segments):
    """Cylinder between two points (any direction): pins, branches, palm trunks."""
    from mathutils import Vector

    a, b = Vector(start), Vector(end)
    axis = b - a
    created = bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=radius[0], radius2=radius[1], depth=axis.length)
    rotation = Vector((0, 0, 1)).rotation_difference(axis.normalized()).to_matrix()
    bmesh.ops.rotate(bm, verts=created["verts"], cent=(0, 0, 0), matrix=rotation)
    bmesh.ops.translate(bm, verts=created["verts"], vec=(a + b) / 2)


def _add_sphere(bm, x, y, z, radius, scale, subdivisions):
    created = bmesh.ops.create_icosphere(bm, subdivisions=subdivisions, radius=radius)
    bmesh.ops.scale(bm, vec=scale, verts=created["verts"])
    bmesh.ops.translate(bm, verts=created["verts"], vec=(x, y, z))


def _object(name, bm, material, collection):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj


def box(name, x0, x1, y0, y1, z0, z1, material, collection):
    """Standalone axis-aligned box between two corners, in world coordinates."""
    bm = bmesh.new()
    _add_box(bm, x0, x1, y0, y1, z0, z1)
    return _object(name, bm, material, collection)


def cylinder(name, x, y, z0, height, radius, material, collection, segments=12):
    """Standalone upright cylinder standing on z0."""
    bm = bmesh.new()
    _add_cylinder(bm, x, y, z0, height, radius, segments)
    return _object(name, bm, material, collection)


def sphere(name, x, y, z, radius, material, collection, scale=(1, 1, 1)):
    """Standalone low-poly icosphere."""
    bm = bmesh.new()
    _add_sphere(bm, x, y, z, radius, scale, 2)
    return _object(name, bm, material, collection)


class Batch:
    """Accumulates static parts and emits one merged object per material."""

    def __init__(self, prefix, collection):
        self.prefix = prefix
        self.collection = collection
        self._parts = {}

    def _bm(self, material):
        if material.name not in self._parts:
            self._parts[material.name] = (material, bmesh.new())
        return self._parts[material.name][1]

    def box(self, material, x0, x1, y0, y1, z0, z1):
        _add_box(self._bm(material), x0, x1, y0, y1, z0, z1)

    def cylinder(self, material, x, y, z0, height, radius, segments=12):
        _add_cylinder(self._bm(material), x, y, z0, height, radius, segments)

    def sphere(self, material, x, y, z, radius, scale=(1, 1, 1), subdivisions=2):
        _add_sphere(self._bm(material), x, y, z, radius, scale, subdivisions)

    def beam(self, material, start, end, radius, end_radius=None, segments=8):
        """Cylinder (or taper, with end_radius) from start to end."""
        _add_beam(self._bm(material), start, end, (radius, end_radius if end_radius is not None else radius), segments)

    def build(self):
        """Create the merged objects; the batch is empty afterwards."""
        objects = [
            _object(f"{self.prefix}_{name.removeprefix('M_')}", bm, material, self.collection)
            for name, (material, bm) in self._parts.items()
        ]
        self._parts = {}
        return objects


def lattice_face(batch, material, plane, a0, a1, z0, z1, pitch, bar):
    """Square lattice in a vertical plane: stiles every `pitch` along a, rails every `pitch` up z.

    plane: ("x", x0, x1) for a face lying in Y-Z, or ("y", y0, y1) for a face lying in X-Z.
    """
    axis, p0, p1 = plane

    def put(lo, hi, zlo, zhi):
        if axis == "y":
            batch.box(material, lo, hi, p0, p1, zlo, zhi)
        else:
            batch.box(material, p0, p1, lo, hi, zlo, zhi)

    count = int(round((a1 - a0) / pitch))
    for i in range(count + 1):
        a = min(a0 + i * pitch, a1 - bar)
        put(a, a + bar, z0, z1)
    rails = int(round((z1 - z0) / pitch))
    for i in range(rails + 1):
        z = min(z0 + i * pitch, z1 - bar)
        put(a0, a1, z, z + bar)
