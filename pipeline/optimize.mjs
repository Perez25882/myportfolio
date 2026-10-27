/**
 * Optimise the raw room GLBs exported by Blender (blender/scripts/bake_export.py)
 * into the files the site serves.
 *
 *   node pipeline/optimize.mjs        (npm run models:optimize)
 *
 * blender/out/raw/<room>.glb  →  public/models/<room>.glb
 * Steps: dedup → prune → weld → reorder for cache locality → quantize → KTX2 (ETC1S) → Meshopt.
 * Needs KTX-Software (https://github.com/KhronosGroup/KTX-Software) installed.
 */

import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { Mode, toktx } from "@gltf-transform/cli";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, quantize, reorder, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = path.join(ROOT, "blender", "out", "raw");
// MODELS_OUT_DIR lets a candidate set be built beside the served one (e.g. public/models/f2).
const OUT_DIR = path.resolve(ROOT, process.env.MODELS_OUT_DIR ?? path.join("public", "models"));
const ROOMS = ["court", "flowdesk"];

// KTX-Software (Khronos) installs here on Windows; make its `ktx` tool findable.
const KTX_BIN = "C:\\Program Files\\KTX-Software\\bin";
if (existsSync(KTX_BIN)) process.env.PATH = `${KTX_BIN}${path.delimiter}${process.env.PATH}`;

// ETC1S: GPU-compressed textures, about 4-6x less GPU memory than decoded WebP, and no
// main-thread image decode or mipmap generation on upload (the suspected iPhone stall).
// Power-of-two sizes keep every mip level a whole number of 4x4 blocks; the 540x1000 screen
// rendered black on ANGLE because its smaller levels (135x125...) were not.
// The resize runs through sharp (already installed as a Next.js image dependency).
const KTX2 = { mode: Mode.ETC1S, quality: 220, resize: "nearest-pot", encoder: sharp };
// The interface displays carry small text that ETC1S smears; UASTC keeps it legible at
// about 1 byte per texel. Encoded first; the ETC1S pass then skips them as already KTX2.
const SCREEN_KTX2 = { mode: Mode.UASTC, pattern: /^(customer-chat|owner-dashboard)$/, resize: "nearest-pot", encoder: sharp };

// toktx only reads PNG/JPEG. Blender embeds WebP, so swap each texture back to its lossless PNG source.
const PNG_SOURCES = [path.join(ROOT, "blender", "out", "bake"), path.join(ROOT, "blender", "refs", "ui")];

async function swapInPngSources(document) {
  for (const texture of document.getRoot().listTextures()) {
    if (texture.getMimeType() === "image/png") continue;
    const name = texture.getName() || path.parse(texture.getURI()).name;
    const source = PNG_SOURCES.map((dir) => path.join(dir, `${name}.png`)).find((file) => existsSync(file));
    if (!source) throw new Error(`No PNG source for texture "${name}"; KTX2 encoding needs PNG or JPEG input`);
    texture.setImage(new Uint8Array(await readFile(source))).setMimeType("image/png");
  }
}

// 14-bit texture coordinates: 12-bit would move UVs by half a texel on the 2048 px Court atlas.
const QUANTIZE = { quantizePosition: 14, quantizeTexcoord: 14 };

async function main() {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

  await mkdir(OUT_DIR, { recursive: true });
  for (const room of ROOMS) {
    const input = path.join(RAW_DIR, `${room}.glb`);
    const output = path.join(OUT_DIR, `${room}.glb`);
    const document = await io.read(input);
    await swapInPngSources(document);
    await document.transform(dedup(), prune(), weld(), reorder({ encoder: MeshoptEncoder }), quantize(QUANTIZE), toktx(SCREEN_KTX2), toktx(KTX2));
    document
      .createExtension(EXTMeshoptCompression)
      .setRequired(true)
      .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
    await io.write(output, document);
    const before = (await stat(input)).size;
    const after = (await stat(output)).size;
    console.log(`${room}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (${Math.round((1 - after / before) * 100)}% smaller)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
