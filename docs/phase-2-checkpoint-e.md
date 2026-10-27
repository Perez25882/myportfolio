# Phase 2 · Checkpoint E report: Optimisation and performance

**Date:** 2026-10-27  
**Status:** compression and tooling done; laptop measurements done. **Real-phone results are still needed from you** (§5). The mobile release gate cannot be signed off without them.

## 1. What was implemented

### Model compression (`pipeline/optimize.mjs`, `npm run models:optimize`)
Raw Blender exports now go to `blender/out/raw/` (git-ignored). The pipeline writes compressed copies to `public/models/`:
- dedup → prune → weld → reorder for vertex cache;
- quantize (positions and UVs at 14 bits, so the 2048 px atlas does not shift);
- **Meshopt** compression (`EXT_meshopt_compression`). The browser decodes it with three.js's bundled Meshopt decoder.

| Room | Before | After | Saving |
|---|---|---|---|
| Court | 737 KB | **415 KB** | 44% |
| FlowDesk | 316 KB | **183 KB** | 42% |

### Budget gate (`pipeline/budget.mjs`, `npm run models:budget`)
The gate reads the served GLBs and fails (exit 1) if any room, or both rooms loaded together, exceeds `pipeline/budgets.json`. The budgets are the mobile numbers from the Technical Art Plan §3.

| | Size | Triangles | Draw calls | Texture memory (GPU) |
|---|---|---|---|---|
| Court | 415 KB / 1.5 MB | 10,696 / 150k | 14 / 60 | 21.3 / 40 MB |
| FlowDesk | 183 KB / 1.2 MB | 4,388 / 120k | 11 / 40 | 5.3 / 32 MB |
| **Both resident** | — | **15,084 / 300k** | **25 / 100** | **26.6 / 128 MB** |

**Result: all within budget.**

### Why not KTX2 textures yet
KTX2 mainly reduces GPU texture memory. We use 26.6 MB of a 128 MB budget, so it isn't needed now. It would also mean installing KTX-Software (a system program) on this machine, which I won't do without your approval. Recommended later, if more rooms push memory up.

### One-tap device benchmark (`/museum?perf=1` → "Run benchmark")
The benchmark tours all seven stops: 1.5 s to settle, then 5 s measured at each. It produces a plain-text report you can copy:
- device, GPU, screen, pixel ratio and CPU/memory;
- per-stop average and lowest fps, with draw calls and triangles;
- a pass or fail against the 30 fps target;
- model download times.

The report text is selectable when copying isn't allowed (phones on plain `http://` block the clipboard).

### Bug fixed during testing
The benchmark captured the GPU details at the moment "Run" was pressed, so details arriving later were dropped. It now reads the latest values when it writes the report. A test caught this.

## 2. Files created or changed

- **New:**
  - `pipeline/optimize.mjs`, `pipeline/budget.mjs`, `pipeline/budgets.json`;
  - `src/museum/benchmark.ts` and its test;
  - `src/components/museum/BenchmarkPanel.tsx`.
- **Changed:**
  - `MuseumCanvas.tsx`: the perf probe reports renderer stats and GPU name;
  - `MuseumExperience.tsx`: benchmark wiring;
  - `museum.module.css`;
  - `MuseumExperience.test.tsx`: benchmark test;
  - `blender/scripts/bake_export.py`: exports to `blender/out/raw/`;
  - `package.json`: `models:optimize`, `models:budget`;
  - `.claude/launch.json`: the production server listens on the local network.
- **Dependencies (dev):** `@gltf-transform/core`, `functions` and `extensions` 4.5.1; `meshoptimizer` 1.3.0.

## 3. What was tested

| Check | Result |
|---|---|
| Unit and component tests | **66 / 66 pass** (11 files) |
| Coverage | 95.2% statements · 89.0% branches · 95.7% functions · 96.8% lines |
| Lint, typecheck | Clean |
| Production build | Passes |
| Budget gate | Passes (table above) |
| Compressed GLBs in the browser | Load and render correctly |
| Network serving | `http://172.20.10.2:3001` answers on the laptop's Wi-Fi address |

## 4. Measured performance

### Frame rate: development laptop, full-HD desktop
Intel HD 520 (Chrome / ANGLE D3D11), 1920 × 1080 viewport at pixel ratio 1.38 (about 2650 × 1490 pixels rendered), production build, built-in benchmark:

| Stop | Avg fps | Lowest second | Draw calls | Triangles |
|---|---|---|---|---|
| The Court | 47 | 8* | 25 | 15,074 |
| The Stratum | 49 | 43 | 25 | 15,074 |
| Threshold | 46 | 40 | 12 | 14,918 |
| Inside FlowDesk | 57 | 54 | 12 | 14,918 |
| Play the customer | 51 | 44 | 4 | 14,822 |
| The order | 49 | 49 | 2 | 4,270 |
| Look beneath | 40 | 16 | 9 | 4,354 |

**Worst stop average: 40 fps. The 30 fps target is met on this laptop at full HD.**  
\* The 8 fps second was the first second of the run, while textures were still uploading. The 16 fps second at "Look beneath" was the fade-cut plus the layer animation. Both are brief, but they are real stutters and are listed under known issues.

Downloads over the local network: `court.glb` 329 KB in 54 ms, `flowdesk.glb` 142 KB in 231 ms.

### Lighthouse
Lighthouse's mobile profile simulates a mid-range phone on slow 4G with a 4× CPU slowdown. Here that slowdown is applied on top of an already slow laptop, so mobile scores are pessimistic.

| Page | Profile | Performance | Accessibility | Best practices | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` | Desktop | **99** | 100 | 100 | 0.8 s | 30 ms | 0 |
| `/` | Mobile | **68** | 100 | 100 | 4.1 s | 770 ms | 0 |
| `/quick` | Mobile | **73** | 100 | 100 | 3.9 s | 580 ms | 0 |
| `/quick` | Desktop | **98** | 100 | 100 | 0.9 s | 80 ms | 0 |
| `/museum` | Desktop | **68** | 100 | 100 | 1.0 s | 730 ms | 0 |
| `/museum` | Mobile | **50** | 100 | 100 | 4.8 s | 5,050 ms | 0 |

Accessibility and best practices score 100 on every page. **Mobile performance is the weak point.** On `/` and `/quick`, Total Blocking Time (580–770 ms) and LCP (about 4 s) miss the targets of under 200 ms and under 2.5 s.

**About the `/museum` numbers.** Headless Lighthouse Chrome has no GPU, so WebGL is emulated in software on the CPU, under a 4× CPU slowdown. The 5 s of blocking time overstates what a phone with a real GPU would see. It still shows that starting the 3D scene (Meshopt decoding, texture upload, the first frames) ties up the main thread. Starting the scene after the page is interactive would help. Only the phone benchmark in §5 measures the real thing.

## 5. Real-device testing: what I need from you

I can't run your phones. On any phone **connected to the same Wi-Fi or hotspot as this laptop ("darkRose👑")**, while the laptop is running the server:

1. Open **`http://172.20.10.2:3001/museum?perf=1`**.
2. Wait for the Court to appear, then tap **Run benchmark**. It takes about 45 seconds.
3. Tap **Copy results**, or select the text, and paste it here.

Ideally test one mid-range Android phone, plus an iPhone if you have one.

**Possible blockers:**
- **Windows Firewall:** if the phone can't open the page, Windows may be blocking incoming connections to Node.js. Allow it for **private** networks when Windows asks, or tell me. I won't change firewall settings myself.
- **iPhone hotspot:** the 172.20.10.x address means this laptop is on an iPhone Personal Hotspot. If the phone sharing the hotspot can't reach the page, test with another phone joined to the same hotspot.

## 6. Known issues

1. **Real-phone frame rate is unmeasured.** This is the release gate, and it waits on §5.
2. **Mobile Lighthouse performance is 68–73 on `/` and `/quick`, and 50 on `/museum`** (the latter under software WebGL; see §4).
   - Blocking time comes mainly from JavaScript start-up (the React and Next runtime) on a throttled slow CPU.
   - LCP is late because four font families load.
   - Candidate fixes: trim to two or three fonts and subset them, defer non-critical client code on `/` and `/quick`, and preload the hero font.
3. **Brief stutters:** first-second texture upload at the Court (8 fps) and the cut at "Look beneath" (16 fps). They can be smoothed by warming textures before showing the scene and by easing the layer animation.
4. **No KTX2 texture compression** (see §1). Not needed at the current memory use.
5. **The lighting bake takes 41 minutes** for the Court on this laptop.
6. **Nothing is committed to git.**

## 7. What requires your approval

1. **Run the phone benchmark (§5)** and send the results. That decides whether the mobile gate passes.
2. **Fix mobile Lighthouse performance now** (fonts, JavaScript start-up), or **after** the phone results.
3. **KTX2:** approve installing KTX-Software, or keep WebP for now (recommended).
4. **Commit:** the whole Phase 2 slice is uncommitted. Say the word and I'll commit it in logical steps.
