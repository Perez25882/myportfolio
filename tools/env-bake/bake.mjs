// Bakes the bronze's reflection environment (three's RoomEnvironment through PMREMGenerator, as
// components/three/baked.tsx used to do at runtime) into public/env/, as gzipped RGBE texels in
// three's CubeUV layout. The file is an ordinary opaque PNG, twice as tall as the texture: the top
// half holds each texel's RGB mantissas, the bottom half its shared exponent (no alpha, so nothing
// is premultiplied on decode). Run from the repository root:
//   node tools/env-bake/bake.mjs 128 public/env/bronze-room-128.png
// Needs Chrome and puppeteer-core (PUPPETEER_FROM: a folder whose node_modules has it).
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const puppeteer = createRequire(`${process.env.PUPPETEER_FROM ?? process.cwd()}/package.json`)("puppeteer-core");
const THREE_DIR = `${process.cwd()}/node_modules/three`;
const HERE = fileURLToPath(new URL(".", import.meta.url));
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const file = url.pathname.startsWith("/three/") ? THREE_DIR + url.pathname.slice(6) : HERE + "bake.html";
  try { res.writeHead(200, { "content-type": file.endsWith(".js") ? "text/javascript" : "text/html" }); res.end(readFileSync(file)); }
  catch { res.writeHead(404); res.end(); }
}).listen(4510);
const size = process.argv[2] ?? "128";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(`http://localhost:4510/?size=${size}`);
await page.waitForFunction(() => window.result, { timeout: 30000 });
const { width, height, max, data } = await page.evaluate(() => window.result);
const rgbe = Buffer.from(data, "base64");
const pixels = Buffer.alloc(width * height * 2 * 3);
for (let i = 0; i < width * height; i += 1) {
  rgbe.copy(pixels, i * 3, i * 4, i * 4 + 3);
  pixels.fill(rgbe[i * 4 + 3], (width * height + i) * 3, (width * height + i) * 3 + 3);
}
const sharp = createRequire(`${process.cwd()}/package.json`)("sharp");
await sharp(pixels, { raw: { width, height: height * 2, channels: 3 } }).png({ compressionLevel: 9 }).toFile(process.argv[3]);
console.log({ width, height, max });
await browser.close(); server.close();
