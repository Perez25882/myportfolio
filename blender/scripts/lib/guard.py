"""Idempotency helpers: every build wipes its own collections before rebuilding,
so running a script twice gives the same scene, and a failed run can simply be
re-run. Nothing outside the named collections is touched.
"""

import bpy


def reset_collection(scene, name):
    """Get or create a top-level collection and remove everything in it."""
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
    if collection.name not in scene.collection.children:
        scene.collection.children.link(collection)
    for obj in list(collection.objects):
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if data is not None and data.users == 0:
            _data_store(data).remove(data)
    return collection


def _data_store(data):
    if isinstance(data, bpy.types.Mesh):
        return bpy.data.meshes
    if isinstance(data, bpy.types.Camera):
        return bpy.data.cameras
    if isinstance(data, bpy.types.Light):
        return bpy.data.lights
    raise TypeError(f"Unexpected data type {type(data).__name__}")
