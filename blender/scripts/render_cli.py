"""Render daylight previews in a background Blender process.

    blender -b blender/src/museum.blend -P blender/scripts/render_cli.py -- \
        --out blender/out/previews/checkpoint-c [--samples 48] [--percent 100] [--shots arrival_landscape ...]

Prints one "RENDERED <file> <seconds>" line per shot.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

import review  # noqa: E402


def _args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    parser.add_argument("--samples", type=int, default=48)
    parser.add_argument("--percent", type=int, default=100)
    parser.add_argument("--shots", nargs="*")
    return parser.parse_args(argv)


def main():
    args = _args()
    scene = bpy.context.scene
    review.configure_cycles(scene, args.samples)
    scene.render.resolution_percentage = args.percent
    for path, seconds in review.render_previews(scene, os.path.abspath(args.out), only=args.shots):
        print(f"RENDERED {path} {seconds}s", flush=True)


main()
