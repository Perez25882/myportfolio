/**
 * Budget gate for the served models. Exits non-zero if any room, or the two
 * rooms resident together, exceed pipeline/budgets.json.
 *
 *   node pipeline/budget.mjs          (npm run models:budget)
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NodeIO, ImageUtils } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL_DIR = path.resolve(ROOT, process.env.MODELS_OUT_DIR ?? path.join("public", "models"));
const MIPMAP_FACTOR = 4 / 3;
const BYTES_PER_TEXEL = 4; // WebP decodes to RGBA8 on the GPU

/** Pure check: returns one message per exceeded limit. */
export function checkBudget(name, metrics, limits) {
  const failures = [];
  const compare = (label, value, max, unit = "") => {
    if (max !== undefined && value > max) failures.push(`${name}: ${label} ${value}${unit} exceeds ${max}${unit}`);
  };
  compare("size", metrics.bytes, limits.maxBytes, " B");
  compare("triangles", metrics.triangles, limits.maxTriangles);
  compare("draw calls", metrics.drawCalls, limits.maxDrawCalls);
  compare("texture memory", metrics.textureMB, limits.maxTextureMB, " MB");
  return failures;
}

export function sumMetrics(all) {
  return all.reduce(
    (total, m) => ({
      bytes: total.bytes + m.bytes,
      triangles: total.triangles + m.triangles,
      drawCalls: total.drawCalls + m.drawCalls,
      textureMB: Math.round((total.textureMB + m.textureMB) * 10) / 10,
    }),
    { bytes: 0, triangles: 0, drawCalls: 0, textureMB: 0 },
  );
}

async function measure(io, file) {
  const document = await io.read(file);
  const root = document.getRoot();
  let triangles = 0;
  let drawCalls = 0;
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    for (const primitive of mesh.listPrimitives()) {
      drawCalls += 1;
      const indices = primitive.getIndices();
      const count = indices ? indices.getCount() : primitive.getAttribute("POSITION").getCount();
      triangles += Math.floor(count / 3);
    }
  }
  let textureBytes = 0;
  for (const texture of root.listTextures()) {
    const size = ImageUtils.getSize(texture.getImage(), texture.getMimeType());
    if (!size) throw new Error(`Cannot read the size of a ${texture.getMimeType()} texture in ${file}`);
    // KTX2/ETC1S transcodes to a GPU block format (~1 byte per texel); WebP/PNG decode to RGBA8.
    const bytesPerTexel = texture.getMimeType() === "image/ktx2" ? 1 : BYTES_PER_TEXEL;
    textureBytes += size[0] * size[1] * bytesPerTexel * MIPMAP_FACTOR;
  }
  return {
    bytes: (await stat(file)).size,
    triangles,
    drawCalls,
    textureMB: Math.round((textureBytes / 1024 / 1024) * 10) / 10,
  };
}

async function main() {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const budgets = JSON.parse(await readFile(path.join(ROOT, "pipeline", "budgets.json"), "utf8"));

  const measured = [];
  const failures = [];
  for (const [room, limits] of Object.entries(budgets.rooms)) {
    const metrics = await measure(io, path.join(MODEL_DIR, `${room}.glb`));
    measured.push(metrics);
    failures.push(...checkBudget(room, metrics, limits));
    console.log(`${room}: ${(metrics.bytes / 1024).toFixed(0)} KB · ${metrics.triangles} triangles · ${metrics.drawCalls} draw calls · ${metrics.textureMB} MB textures`);
  }
  const resident = sumMetrics(measured);
  failures.push(...checkBudget("both rooms resident", resident, budgets.resident));
  console.log(`resident: ${resident.triangles} triangles · ${resident.drawCalls} draw calls · ${resident.textureMB} MB textures`);

  if (failures.length > 0) {
    console.error(`\nBudget exceeded:\n${failures.join("\n")}`);
    process.exit(1);
  }
  console.log("\nAll models within budget.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
