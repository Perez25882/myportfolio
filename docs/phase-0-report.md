# PEREZ — Museum of What's Possible
## Phase 0 Report: Research, Discovery & Technical Feasibility

**Date:** 2026-10-27
**Status:** Research only. Nothing was scaffolded, installed or built.

**Labels used throughout**
- **[V] Verified:** I checked this directly (repo contents, git history, tool output, test run).
- **[A] Assumption:** inferred from evidence, not confirmed.
- **[R] Recommendation:** my proposal, for founder approval.
- **[?] Unknown:** not available from the sources I had.

---

## 0. Executive summary

- **The material is real and strong enough for a museum.** [V] GitHub `Perez25882` has 19 public repos. Four can carry major installations:
  - **FlowDesk**: WhatsApp operations layer for Ghanaian SMEs. This is the deepest engineering in the account.
  - **LedgerMind OS**: offline-first retail OS, with its earlier v1 showing how it evolved.
  - **Accra We Dey**: a Three.js multiplayer life game. It shows real 3D and realtime skill, which matters for a 3D portfolio.
  - **JoyDataBundle**: a team-built data-bundle reseller platform, live on Vercel.
- **None of the flagships shows evidence of real users, revenue or a production launch.** [V] Each README describes a local, test-number or pre-launch state. The museum should present them as *built and engineered*, not as *adopted*.
- **Five attribution points need founder confirmation before any public claim** (§1.4):
  - FlowDesk commits by an unidentified author `d <d@f>`.
  - Commits authored by "Claude" (AI-assisted work).
  - A Flutter POS that appears to be derived from a third-party template.
  - Team ownership of JoyDataBundle.
  - The commit identity "Tracy Semanu Foundation" (it uses Perez's email).
- **The Blender MCP is fully usable for this project.** [V] Every core capability passed in a sandboxed test scene: Python, meshes, Geometry Nodes, materials, textures, reference images, lights, cameras, renders, Cycles baking, and GLB export with Draco, Meshopt and WebP.
  - **Gaps:** no KTX2 output from Blender, and the thumbnail-render tool timed out.
- **The local machine is a low-end laptop** [V]: i5-6200U, 8 GB RAM, Intel HD 520.
  - **Upside:** it is a useful worst-case test device.
  - **Downside:** Cycles light baking will be slow (CPU only).
- **Recommended stack** [R]: Next.js 16 (App Router), hybrid rendering, React Three Fiber 9, Drei 10, GSAP for cinematic timelines, Motion for DOM UI, and an offline gltf-transform pipeline with Meshopt and KTX2.
- **Recommended order** [R]: ship a recruiter Quick View first. Then build the 3D museum on top of it, with a go/no-go gate after a vertical slice measured on real phones.

---

## 1. GitHub repository audit

**Method** [V]
- Public API: profile and repo list.
- Cloned all 19 repos into a scratch folder. Read READMEs, manifests, structure and git history.
- No project code was run, so feature claims below come from code and docs, not live use.
- **Profile:** "Perez Tegbey". Account created 2024-03-04. No bio, location or hireable flag set.

### 1.1 Repository inventory

| Repo | Type | Stack | Commits (Perez identity / total) | Activity | Verdict |
|---|---|---|---|---|---|
| **flowdesk** | Own | TS monorepo: Fastify, BullMQ, Prisma/Postgres, Redis, React/Vite | 27 / 47 (+15 `d <d@f>`, 5 "Claude") | 2026-06 → 2026-09 | **Flagship** |
| **ledmi_os** (LedgerMind OS) | Own | Next.js 16, Flutter, Supabase (Postgres/RLS/Edge Functions) | 11 / 12 (+1 "Claude") | 2026-07 → 2026-10 | **Flagship** |
| **ledgermindv1** | Own | Next.js 14, Firebase, Moonshot (Kimi) function-calling | 5 / 5 | 2026-03 | Evolution story for LedgerMind |
| **accrawedey** (Accra We Dey) | Own | Three.js 0.180 + Vite client; uWebSockets.js/ws, Postgres, Redis server | 2 / 2 (imported in bulk) | 2026-10 | **Flagship (3D proof)** |
| **JoyBundleFrontend / JBFrontNew** | Fork of `DeeGodman/JoyBundleFrontend` | Next.js 16, React 19, Tailwind 4 (JS) | 6 / 23 in JBFrontNew | 2025-11 → 2025-12 | **Flagship (team)** |
| JBNewOriginal | Fork of `Daxomar/JBNewOriginal` | Node/Express backend, Docker, queues | 0 / 55 (all Daxomar) | 2026-01 → 06 | Teammate's work. Not Perez's |
| JoyBundlesBackend, Vendly_backend | Empty forks (0 KB) | — | — | — | Ignore |
| **project-store-pos** (BuildMat POS) | Own | React/Vite/TS, Fastify, Prisma, Postgres, Redis, Docker/PM2/Nginx | 18 / 18 | 2026-06 | Secondary (Engineering Lab) |
| kipaa-mobile | Own | Expo 54, React Native 0.81 | 2 / 2 | 2026-02 | Unfinished gallery |
| novasphere | Own | React 19, Vite, Supabase edge functions (Google AI Studio scaffold) | 1 / 1 | 2026-01 | Unfinished gallery |
| vendly-frontend / vendly-alt-repo | Own | Next.js client, Express + Mongoose server | 1 + 2 | 2026-04 | Unfinished gallery (purpose undocumented) |
| SecureVoteChain | Own (co-authored) | React/Vite, ethers v5, Solidity | 2 / 4 (+2 mustaphahaadi) | 2025-05 | Origin gallery |
| decentralized-voting-dapp | Own | 160 MB repo; default branch is README only, code on `master` | 4 / 4 | 2025-06 → 08 | Origin gallery (not inspected in depth) |
| MyFirstSmartContract | Own | Solidity (SimpleStorage, course modules 2.2–2.4) | 3 / 3 | 2024-10 | **Origin: first public code** |
| razewebsite | Fork (Daxomar) | — | 0 / 63 | — | Not Perez's |
| kesie-s-wig-and-beauty-palace | Fork (Redd-Reddington) | — | 0 / 16 | — | Not Perez's |

[V] Commits under "Tracy Semanu Foundation" use `perez25882@gmail.com`, the email in Perez's account context. [A] I count them as Perez's. See decision D1.

### 1.2 Flagship deep-dives

#### FlowDesk: WhatsApp operations layer for Ghanaian SMEs
- **Problem** [V, from docs]: Shops sell over WhatsApp. FlowDesk turns those chats into tracked orders, confirmed payments and a booking diary. The customer installs nothing and keeps messaging the same number.
- **Architecture** [V]:
  - pnpm + Turborepo monorepo: `apps/api`, `apps/web`, `packages/shared`.
  - **API:** Fastify 4 with helmet, rate-limit, cookie, swagger. BullMQ workers share the API process. Prisma on Postgres (24 models, 1,282-line schema, migrations plus tested rollbacks). Redis/ioredis, Sentry, S3 client, pino.
  - **Web:** React 18, Vite, Tailwind, Radix, TanStack Query/Virtual, Zustand, dnd-kit order board, react-hook-form + zod.
  - **Deploy config:** Render (Frankfurt, chosen for latency to Accra; reasoning documented in `render.yaml`), Supabase Postgres, Vercel web.
- **Notable engineering** [V, from code and commit history]:
  - **Grounded AI assistant:** catalogue matching plus a **price floor held in the database, not the prompt**. A negotiation gate refuses offers below the floor.
  - **Prompt-injection defences:** nonce-fenced prompts with a fixed-point sanitiser.
  - **Order limits:** a quantity ceiling on model-created order lines.
  - **Enquiry-led mode** for shops without a catalogue. A server-composed reply is described as "provably claim-free".
  - **Payments:** a payment confidence ladder (attest/void instead of a verified boolean). MoMo screenshot review queue. Paystack billing (trials, grace periods, downgrade/pause).
  - **Security:** RBAC, SSE role scoping, PII removed from logs, a staff lockout, and a pre-launch security review whose 10 findings were closed.
  - **Tests:** about 64 test files in `apps/api/tests`, covering security (`sec-*`), payment integrity, webhooks, and a pipeline integration test.
  - **QA:** QA harness with journeys, a performance harness, and 37 desktop/mobile screenshots in `qa/shots`.
- **AI provider** [V]: The API depends on `@anthropic-ai/sdk`. The local setup doc names `meta/llama-3.1-8b-instruct` on NVIDIA NIM, and a Groq-related test exists. [A] The provider is pluggable (`assistant-providers/`).
- **Status** [V]:
  - The `launch` PR was merged on 2026-09-22.
  - The docs describe a *local* run over an ngrok tunnel with **Meta's test WhatsApp number** and one connected test shop.
  - [?] No evidence of a production deployment, paying shops or usage metrics. Do not claim any.
- **Museum-ready assets** [V]:
  - `brag/brag.mp4` and `brag.jpg`, a finished product film script (`brag-plan.md`).
  - Logo PNG.
  - 37 QA screenshots, desktop and mobile.
  - The scripted "06:41 rice order → GHS 90 offer → floor GHS 95 → order FD-02214" story is ready-made installation choreography.
- **Contribution evidence** [V]:
  - 26 commits under the Perez identity plus 1 merge.
  - **15 commits by `d <d@f>`.** These are dense, multi-feature commits from 2026-08-20/21. [?] Author unidentified.
  - **5 commits authored by "Claude"** on 2026-08-21/22.
  - Commit messages include "the month of work that was never committed".
- **Privacy issue** [V]: `RUNNING-LOCALLY.md` is public. It contains personal and shop phone numbers, the WABA ID, the WhatsApp phone-number ID, and a reserved ngrok URL. Scrub it before the portfolio sends recruiters to this repo (D3).

#### LedgerMind OS (`ledmi_os`) + LedgerMind v1 (`ledgermindv1`)
- **Problem** [V, from PRD]: Retail chains in Ghana (3–20 branches) lose sales when the internet drops. They have no cross-branch stock visibility and fragmented payments (cash, MoMo, card).
  - **Product:** offline-first mobile POS, back-office dashboard, and an embedded AI analyst ("Ledmi").
- **Architecture** [V]:
  - **Dashboard:** Next.js 16 with Tailwind 4, Supabase SSR, Recharts, zod.
  - **POS:** Flutter (BLoC, get_it, fpdart, Hive offline storage, go_router; 88 Dart files).
  - **Backend:** Supabase Postgres with **22 ordered migrations**: core schema, branch model, RLS policies, checkout/refund/quick-sale RPCs, Paystack webhook RPC, shifts, AI insights aggregations, security hardening, branch-scope enforcement.
  - **Edge Functions:** a verification script keeps source and deploy copies byte-identical.
- **Documentation** [V]: PRD, RESEARCH, company charter, decision log (AD-xx records), sync protocol, security remediation, runbook, GTM strategy, and HTML client/investor pitch decks.
- **Notable** [V, self-reported in README]:
  - An adversarial audit (2026-08-14) found and fixed cross-tenant and privilege-escalation issues (anonymous sale forgery, invite-based owner escalation, missing branch scoping).
  - Baseline checks are recorded: typecheck clean, build passes, `flutter analyze` 0 issues, 20 Flutter tests passing.
- **Status** [V]: Not live with customers. The README lists open blockers: redeploy Edge Functions, Android signing, SMTP/OAuth, remove seed data.
- **Evolution story** [V]:
  - `ledgermindv1`: Next.js 14 + Firebase + Moonshot function-calling AI. It can add products and update stock through tools.
  - It was rebuilt as a Supabase + Flutter multi-app platform. This makes a good "how I think now vs. then" exhibit.
- **Provenance caveat** [A]: `flutter_billing_app-main/` looks derived from a third-party open-source Flutter POS. Its README is a generic product description with an external video asset, and the `-main` suffix suggests a downloaded zip. **Confirm what is original before claiming the POS** (D1).
- **Hygiene** [V]:
  - About 2,800 tracked files, many of them vendored AI-tool skill folders (`.claude/`, `.windsurf/`, `.devin/`, `.agents/`).
  - The README links to a local Windows path.
  - Cleaning these up would make the repo read better to recruiters.

#### Accra We Dey (`accrawedey`): mobile multiplayer life game
- **What it is** [V, from README]:
  - An 18+ portrait-mobile browser life sim set in Accra.
  - 33 venues, an isometric room system, a city map at real coordinates.
  - An in-game phone with about 20 apps, player-to-player MoMo transfers with "exactly-once" delivery.
  - Multiplayer games including Oware vs. AI, procedural 3D ride scenes, and a character creator with Ghanaian clothing.
  - The README describes it as playing "like Lagos Life".
- **Architecture** [V]:
  - **Client:** Three.js 0.180 + Vite, about 40 modules (scene/avatars/bake/map/ride/room/studio, UI, phone).
  - **Server:** uWebSockets.js + ws, Postgres, Redis, shards of 2,500 players with 25-player rooms, hardened Docker deploy.
  - **Characters:** rigged GLB characters derived from **CC0 MakeHuman** assets through Python build scripts. The licence notes are in the repo.
- **Scale claims** [V that the README says this; not reproduced by me]: a 1,500-bot load test at 7–13 ms per tick, about 1 ms event-loop lag, 91 MB RAM.
- **Status** [V]: The README says it was tested locally with two browser sessions and **is not deployed and not tested on two physical phones**.
- **Why it matters** [R]: It is direct proof that Perez already ships Three.js, rigged GLBs, baking and mobile-portrait 3D. That makes the museum's technical promise credible.
- **Caveat:** The 18+ content needs careful curation (D5).

#### JoyDataBundle (JoyBundleFrontend / JBFrontNew + teammates' backend)
- **What it is** [V, from routes]:
  - Mobile-data bundle sales for MTN, Telecel and AirtelTigo.
  - **Public:** buy, track order, support.
  - **Reseller:** dashboard, custom pricing, earnings, settings.
  - **Admin:** bundles, orders, payment confirmation, transactions, users, resellers, payouts, complaints, messages.
- **Live** [V]: `https://joy-bundle-frontend-nine.vercel.app` returns HTTP 200. I did not test it functionally.
- **Team** [V]:
  - The repo is a fork of `DeeGodman/JoyBundleFrontend`. Contributors are Daxomar ("Chuks"), Dee and Perez.
  - The backend (`Daxomar/JBNewOriginal`: Express, Docker, retry queue, "BOSSU" API integration) has **no Perez commits**.
- **Perez's commits** [V]:
  - Initial frontend import (128 files).
  - "Updated frontend changes" (106 files).
  - A **payout-improvements PR** (admin sees and confirms payouts, 4 files, +928 lines).
- **Line counts** [A]: They are inflated by lockfiles and scaffolding. `components.json` and `convert-to-js.js` suggest a generated UI converted to JS. Present this as a **collaboration exhibit** and credit the teammates.

### 1.3 Secondary repos (summary)
- **BuildMat POS** (`project-store-pos`) [V]: full-stack multi-store POS for building-material retailers. It has JWT refresh, procurement, ledger and CSV export, audit log, reports, and Docker/PM2/Nginx/SSL. It was built in phases in June 2026 and shares FlowDesk's stack. Fits the **Engineering Lab** as a stack-mastery piece.
- **Kipaa** [V]: Expo/React Native "positive friction" savings app with a protected pool, cooldowns, reflection prompts and **simulated** MoMo. It is a concept MVP.
- **NovaSphere** [V]: a single-commit marketing site from a Google AI Studio scaffold, plus Supabase waitlist and launch email functions. Positioned as "connecting underrepresented founders with global opportunities". Thin as engineering, but a good **Unfinished Gallery** idea.
- **Vendly** [V]: Next.js + Express/Mongoose. It has no README or purpose statement. [?] What it is for is unknown; ask Perez.
- **Blockchain trio** [V]: SimpleStorage (Oct 2024) → SecureVoteChain (May 2025, co-authored) → decentralized-voting-dapp (Jun–Aug 2025). This is the beginning of the **Origin** timeline.

### 1.4 Verified vs. unknown: attribution and claims

| Claim | Status |
|---|---|
| Perez authored the Tracy Semanu Foundation commits | [A] Same email. Confirm (D1) |
| Who `d <d@f>` is (15 FlowDesk commits) | [?] |
| Role of AI coding agents (commits authored by "Claude"; agent config folders) | [V] present. Disclosure stance is a founder decision (D2) |
| Flutter POS originality | [?] Likely template-based |
| Any production users, revenue, uptime or metrics for any project | [?] None found. **Do not state any** |
| JoyBundle live site | [V] HTTP 200 only |
| Accra We Dey load-test numbers | Self-reported in README. Not reproduced |

### 1.5 Origin timeline from verified commit dates
Commit dates are not necessarily project start dates.
- **Oct 2024:** first Solidity contract.
- **May–Aug 2025:** blockchain voting.
- **Sep 2025:** LedgerMind v1 repo created.
- **Nov–Dec 2025:** JoyDataBundle, team work.
- **Jan 2026:** NovaSphere.
- **Feb 2026:** Kipaa.
- **Apr 2026:** Vendly.
- **Jun 2026:** BuildMat POS, then FlowDesk.
- **Jul 2026:** LedgerMind OS.
- **Sep 2026:** FlowDesk launch PR.
- **Oct 2026:** Accra We Dey.

The arc runs from Web3 experiments to multi-tenant commerce, payments and AI products for Ghanaian businesses. It is a strong, honest story.

---

## 2. Recommended flagship projects

| Rank | Exhibit | Why | Installation concept [R] |
|---|---|---|---|
| 1 | **FlowDesk** | Deepest engineering (AI guardrails, payments integrity, security, tests) and a clear local-market problem | **"The Conversation Engine"**: a chat thread unfurls into physical order tickets on a conveyor. The visitor can make the customer haggle and watch the **price floor gate** refuse GHS 90 and counter at 95. The thesis is engraved on it: *the floor lives in the database, not the prompt.* |
| 2 | **LedgerMind OS** (+v1) | Offline-first, multi-tenant RLS, and a two-generation product story | **"The Offline Vault"**: a shop counter keeps selling when the visitor cuts a glowing network cable. Sales queue up as tokens, then sync when it is reconnected. A side alcove shows v1 → OS. |
| 3 | **Accra We Dey** | Proves 3D and realtime skill. Uses Perez's own CC0-derived GLB characters | **"Window on Accra"**: a diorama of the city map with a walking character. It links to a video and to the repo. Curate it for a general audience. |
| 4 | **JoyDataBundle** | Live and collaborative. A real reseller and admin domain | **"Three Towers"**: signal towers (generic, **no carrier logos**) route bundles from buyer → reseller → admin payout. Teammates are credited on the plaque. |

The **Engineering Lab** holds BuildMat POS, architecture models, and test and security evidence. The **Unfinished Gallery** holds Kipaa, NovaSphere, Vendly and the voting dapps.

---

## 3. Blender MCP capability matrix

**Test method** [V]
- Blender **5.2.2 LTS** with the MCP add-on `bl_ext.user_default.mcp`.
- All tests ran in a temporary scene `MCP_Probe`, which I deleted afterwards.
- The user's default scene (Cube, Camera, Light; unsaved, no file path) was not modified.
- **One side effect:** `orphans_purge` removed the startup file's unused grease-pencil material "Dots Stroke" (0 users, unsaved default data). Nothing else changed.
- Output files are in the session scratchpad (`blender_probe/`): renders, bake, and the probe GLBs.

| Capability | Result | Evidence / notes |
|---|---|---|
| Blender Python execution | ✅ [V] | `execute_blender_code` (bpy, bmesh, gpu, mathutils). Return values must be put in a `result` variable |
| Scene inspection | ✅ [V] | `get_objects_summary`, `get_blendfile_summary_*`, `get_object_detail_summary` |
| Mesh creation | ✅ [V] | bmesh grid. `bpy.ops.mesh.primitive_cylinder_add` |
| Mesh editing | ✅ [V] | Edit mode + `uv.smart_project`. Bevel modifier |
| Procedural geometry | ✅ [V] | Geometry Nodes tree built in Python: a ring of 12 instanced columns |
| GN instances in glTF | ⚠️ [V] | Instances were **not exported** until a *Realize Instances* node was added. Plan for this |
| Materials / shaders | ✅ [V] | Principled BSDF, Noise → ColorRamp |
| Procedural shaders in glTF | ❌ [V] | Procedural nodes do not export (expected glTF limitation). They must be **baked to textures** |
| Texture loading | ✅ [V] | `bpy.data.images.load` + Image Texture node. Exported as WebP (`EXT_texture_webp`) |
| Reference image import | ✅ [V] | Image empty (`empty_display_type='IMAGE'`, 50% alpha). The `image.import_as_mesh_planes` operator exists (not exercised) |
| Lighting | ✅ [V] | Sun light. Exported via `KHR_lights_punctual` |
| Camera control | ✅ [V] | Camera + Track-To constraint, lens set, scene camera assigned |
| Preview rendering | ✅ [V] | Via `bpy.ops.render.render`: Workbench 480×270 in 0.28 s; EEVEE 480×270 at 4 spp in 1.8 s |
| `render_thumbnail_to_path` tool | ❌ [V] | **Timed out.** Workaround: render through Python (above) |
| `render_viewport_to_path` tool | ? | Not tested |
| Window screenshot | ✅ [V] | Works. Blender's splash screen was open over the viewport, so close it for clean captures |
| Cycles light baking | ✅ [V] | COMBINED bake, 128 px, 8 spp: 4.4 s. **CPU only.** No GPU compute device on the Intel HD 520 |
| Engines | ✅ [V] | EEVEE, Cycles and Workbench can all be set |
| GLB export | ✅ [V] | `export_scene.gltf`, GLB format |
| Draco compression | ✅ [V] | 19.1 KB → 6.5 KB on the probe |
| Meshopt compression | ✅ [V] | `export_meshopt_compression_enable` (`EXT_meshopt_compression`). It relies on gzip/brotli on top, so raw size is larger at tiny scale |
| KTX2 textures | ❌ [V] | Exporter offers only AUTO/JPEG/WEBP/NONE. Use **gltf-transform + KTX-Software** after export. Neither is installed |
| GPU instancing export | ⚠️ | Option `export_gpu_instances` exists. Not validated with R3F |
| Selection-scoped export | ⚠️ [V] | `use_selection` also exported a selected object **from another scene**. Fix: `use_active_scene=True` or `use_active_collection` |
| Scene organisation | ✅ [V] | Collections, naming, scene switching |
| Saving .blend files | ? | Not tested; no file path yet. Planned: one `.blend` per room, saved into the repo |
| API / manual docs | ✅ | `search_api_docs`, `get_python_api_docs` and the bundled manual are available |

**Workarounds and practices** [R]
- Keep every scene-building step as **idempotent Python scripts in the repo** (`blender/scripts/*.py`), so scenes can be rebuilt reproducibly.
  - Reason: a failing script left partial state during my test, and MCP calls have no transaction or rollback.
- Build in dedicated collections. Export with `use_active_collection`.
- Bake procedural materials and lighting to textures.
- Run gltf-transform for Meshopt and KTX2.
- Render previews through Python, not the thumbnail tool.

**Also present but separate from Blender** [V]: another connected MCP (Higgsfield) exposes `generate_3d` and image-generation tools.
- [?] Not tested. It uses paid credits.
- [R] Use it at most for props or concept images, never for hero architecture (topology, file size and style control).

---

## 4. Development environment findings

| Item | Finding [V] | Implication [R] |
|---|---|---|
| OS / hardware | Windows 10 Pro; i5-6200U; **8 GB RAM**; Intel HD 520 (shared memory, OpenGL 4.6); 41 GB free on C: | A good **low-end test device**. Slow Cycles bakes. Running Blender, `next dev` and a browser together will push RAM |
| Node | **v20.19.0 active.** nvm-windows 1.2.2 also has **22.14.0** and 25.9.0 | Node 20 is end-of-life and deprecated on Vercel. Next 16.4.3 needs ≥ 20.9. **Switch to 22.14.0** (or install 24 LTS, Vercel's default) |
| Package managers | npm 10.8.2, yarn 1.22.22, corepack 0.31.0. **No pnpm, no bun** | Either npm or pnpm (enable via corepack) works. FlowDesk already uses pnpm |
| Git / GitHub | git 2.49. **`gh` CLI not installed.** Workspace is **not a git repo** and is empty | Install `gh` (approval needed) and `git init` in Phase 3 |
| Blender | 5.2.2 LTS, MCP connected, glTF add-on with Draco and Meshopt bridges | Ready |
| 3D CLI tools | gltf-transform and KTX-Software (`toktx`/`ktx`) **not installed** | Needed for KTX2 and optimisation (approval needed) |
| Other | Docker 29.5.3, VS Code 1.135, Python 3.13.5 | Fine |
| `NODE_ENV` | Not set at User or Machine level | The global trap described in FlowDesk's doc is no longer present |

**Current package versions (npm registry, today)** [V]
- `next` 16.4.3, `react` 19.3.1, `three` 0.186.1.
- `@react-three/fiber` 9.8.2 (peer: react ≥ 19 < 19.4).
- `@react-three/drei` 10.7.9, `@react-three/postprocessing` 3.2.2.
- `gsap` 3.15.0, `motion` 14.6.0, `zustand` 5.0.16.
- `@gltf-transform/cli` 4.5.1, `r3f-perf` 7.2.3.

Pin exact versions when scaffolding.

---

## 5. Proposed technical architecture [R]

**Rendering mode: hybrid, deployed on Vercel.**
- **Static (SSG):**
  - `/`: museum shell + 3D.
  - `/quick`: recruiter Quick View, pure HTML, fully indexable.
  - `/exhibits/[slug]`: case-study pages, which double as the non-3D content for every installation.
  - `/origin`, `/open-door`.
- **Server (minimal):**
  - One Route Handler or Server Action for the contact form, with validation, rate limiting and spam protection.
  - The email provider is chosen in Phase 3.
- Pure `output: 'export'` was rejected only because of the contact endpoint. Everything else is static and CDN-cached.

**Structure (proposed)**
```
app/                    Next.js App Router (RSC for content, client islands for 3D)
  (site)/quick/         recruiter quick view (no WebGL)
  exhibits/[slug]/      case studies (static, SEO)
components/museum/      R3F scene graph: <Museum>, <Room>, <Installation>, <TourCamera>
components/ui/          DOM overlay: nav, captions, contact CTA, tour controls (accessible HTML)
content/                typed project data: facts carry {status: verified|claimed, source: url}
lib/quality/            GPU tiering, adaptive DPR, budgets, WebGL fallback
public/models/          optimised GLB (meshopt + KTX2), content-hashed
blender/                .blend sources + scripts/*.py (reproducible scene builds)
pipeline/               gltf-transform scripts, budget checks (CI)
```

**Libraries**
- **R3F 9 + Drei 10 + three 0.18x.**
  - The `<Canvas>` loads through `next/dynamic` with `ssr: false`, only after a capability check.
  - Drei provides `useGLTF` (with Meshopt/KTX2 loaders), `PerformanceMonitor`, `AdaptiveDpr`, `Bvh`, `Html` and `CameraControls`.
- **Animation:**
  - **GSAP** for scripted, scrubbable cinematic camera timelines (guided tour).
  - **Drei CameraControls** for free exploration.
  - **Motion** for DOM UI transitions.
  - No physics engine: navigation runs on authored waypoints and a clamped walkable area.
- **State:** Zustand (tour step, room, quality tier, mode).
- **Content as data, not text baked into the 3D:** every label and case study is DOM text, which keeps it accessible, translatable and SEO-friendly.
- **Postprocessing:** high tier only, with minimal effects (bloom/tonemapping).
- **Asset pipeline:**
  1. Blender export to glTF.
  2. `gltf-transform`: dedup, prune, weld, simplify where needed, Meshopt, KTX2 (ETC1S for colour/lightmaps, UASTC for normals).
  3. `gltfjsx` generates typed components.
  4. A CI script fails the build when a budget is exceeded.

---

## 6. Mobile performance strategy

**Principle.** Mobile is the baseline, and desktop *adds* to it. Universal 60 FPS is not promised.

**Quality tiers** [R]
- Initial tier comes from detect-gpu + `navigator.deviceMemory` + `hardwareConcurrency` + Save-Data.
- It then adapts at runtime with `PerformanceMonitor`, stepping down and then holding.

| | Low | Medium | High |
|---|---|---|---|
| DPR cap | 1.0 | 1.5 | 2.0 |
| Lighting | Baked only (unlit materials) | Baked + 1 dynamic accent | Baked + dynamic + light postFX |
| Textures | 512–1K KTX2 | 1–2K | 2K (hero 4K max) |
| Particles / sculpture detail | Minimal | Reduced | Full |
| Shadows | Baked | Baked | Baked + contact shadows |

**Initial budgets** [R] (to validate in the Phase 4 vertical slice)
- **Quick View:**
  - LCP ≤ 2.5 s on mid-tier Android over 4G.
  - JS ≤ 120 KB gz.
  - No WebGL.
- **Museum shell before 3D:** ≤ 180 KB gz JS. The 3D chunk is lazy, about ≤ 350 KB gz.
- **First interactive 3D view:**
  - ≤ 5 s on a mid-tier phone over 4G.
  - Atrium download ≤ 1.5 MB on mobile, ≤ 3 MB on desktop.
  - Each installation is streamed on approach: ≤ 1–2 MB each.
- **GPU:**
  - Texture memory ≤ 128 MB mobile, ≤ 256 MB desktop.
  - Draw calls ≤ 100 mobile, ≤ 250 desktop.
  - Visible triangles ≤ 300k mobile, ≤ 1M desktop.
- **Frame time:**
  - Mid-tier Android: p95 ≤ 33 ms (30 FPS floor).
  - Recent iPhones and desktops: aim for 60 FPS.
  - Low tier: 30 FPS or better, with motion reduced.

**Techniques**
- Baked lightmaps (Cycles) instead of real-time lights.
- Instancing for repeated architecture (columns, plinths, benches).
- One material atlas per room.
- KTX2 + Meshopt.
- Streaming per room through Suspense, plus a preload of the next stop.
- `frameloop="demand"` when idle. Pause when the tab is hidden.
- BVH raycasting.
- Dispose rooms that are left behind.

**Responsive camera**
- Every waypoint stores portrait and landscape framings (FOV and distance).
- Hotspots render as DOM buttons of at least 44 px, plus an "exhibit list" alternative.

**Touch**
- Tap to visit.
- Drag to look.
- Explicit Next/Back controls.
- No pinch conflicts.
- Never trap page scroll on the Quick View.

**Reduced motion**
- `prefers-reduced-motion` switches to cuts and fades instead of camera flights.
- No auto-rotation and no parallax.
- Users can also toggle it manually.

**WebGL failure recovery**
- Pre-check for context creation.
- An `ErrorBoundary` around the Canvas.
- Handle `webglcontextlost`: try one restore, then fall back to Quick View with a short message.
- `noscript` and Save-Data users go straight to Quick View.

**Lightweight mode**
- `/quick` is reachable from every screen.
- It holds the same content model: who Perez is, flagship case studies, stack, CV and contact.

**Real-device testing strategy** [R]

| Device class | Example | Purpose |
|---|---|---|
| Low Android | 2–3 GB RAM, Mali-G52 class | Fallback and tier-down correctness |
| Mid Android | Snapdragon 6/7-series | Primary 30-FPS target |
| iPhone | Recent iPhone + one older (e.g. iPhone 11) | Safari WebGL and memory limits |
| Tablet | iPad | Landscape compositions |
| Low laptop | **This HD 520 machine** | Integrated-GPU worst case |
| Desktop | Discrete GPU / Apple Silicon | High tier |

- **Tools:**
  - Chrome remote debugging over USB; Safari Web Inspector.
  - `r3f-perf` / `renderer.info` in a hidden debug overlay.
  - Lighthouse on Quick View.
  - Optional cloud real-device runs: BrowserStack or WebPageTest (costs money; D10).
- **Pass criteria per device:**
  - Meets the frame-time and memory budgets above.
  - No crash or context loss during a full guided tour.
  - Fallback is reachable in at most 1 tap.

---

## 7. Creative feasibility assessment

| Element | Feasibility | Notes [R] |
|---|---|---|
| Monumental central atrium | **High** | Modular kit (floor, columns, arches, skylight) built by script and baked. One hero composition per orientation |
| Transforming central sculpture | **Medium** | Use vertex-shader or morph-target transformation with tier-scaled instanced particles. Avoid heavy simulation. It transforms as the visitor progresses (e.g. one facet per exhibit seen) |
| Unique project installations | **Medium–High** | One signature interaction each (see §2), with DOM case-study panels. Do not build full app replicas |
| The Origin (personal story) | **High** | A corridor timeline built from §1.5. Founder supplies the personal narrative, photos and voice |
| Engineering Laboratory | **High** | Physical architecture models (FlowDesk services and queues, Supabase RLS layers), real test and security counts, links to code |
| Unfinished-project gallery | **High** | Scaffolding and wireframe aesthetic with honest status plaques. A low-poly room, so cheap to render |
| The Open Door (contact) | **High** | Room plus DOM form. States roles sought (employment, freelance, collaboration) |
| Cinematic guided tour (default) | **High** | GSAP timelines over waypoints. Skippable; every stop is reachable directly |
| Optional free exploration | **Medium** | Constrained controls on a walkable area. Desktop first, simplified on mobile |
| Always-on recruiter Quick View | **High** | Top-bar button plus `/quick`. Built first |
| Persistent contact action | **High** | Fixed DOM button on every screen and tier |

**Usability guardrails** [R]
- First meaningful content appears within 3 seconds, even before 3D loads (DOM headline + "Quick View" + "Enter museum").
- No mandatory intro.
- Every installation has a 1-tap text equivalent.
- The tour can be exited at any time.

---

## 8. Major risks and mitigations

| # | Risk | Impact | Mitigation [R] |
|---|---|---|---|
| 1 | Spectacle hurts usability or recruiter speed | High | Quick View first. Guided tour default. Persistent contact and skip |
| 2 | Mobile performance and thermals | High | Budgets, tiers, baked lighting, Phase 4 go/no-go on real phones |
| 3 | Overclaiming (users, revenue, authorship) | **Critical for credibility** | Content model with verified/claimed status and source links. Founder sign-off on every fact (D1, D2) |
| 4 | Attribution ambiguity (team repos, template-based Flutter POS, `d <d@f>`, AI-authored commits) | High | Credit teammates. Clarify before publishing. Pick an explicit AI-assisted-development stance |
| 5 | Sensitive data in public repos (FlowDesk phone numbers and IDs; local paths) | Medium | Scrub before linking (D3) |
| 6 | Weak dev machine (8 GB, CPU-only Cycles) | Medium | Small lightmaps, overnight bakes, profile on this machine as the low-end reference |
| 7 | MCP fragility (thumbnail timeout, partial-state failures) | Medium | Scripted, idempotent scene builds in git. Python-based renders. Frequent `.blend` saves |
| 8 | Scope creep | High | Phase gates. Ship Quick View early. One installation at a time |
| 9 | Asset licensing and trademarks (WhatsApp UI, carrier logos, fonts, HDRIs) | Medium | Generic chat and tower styling. CC0 assets (e.g. Poly Haven). Licences tracked in repo |
| 10 | Accra We Dey 18+ content | Medium | Show only general-audience scenes (D5) |
| 11 | Node 20 end-of-life | Low | Move to Node 22/24 before scaffolding |
| 12 | Canvas not accessible or indexable | Medium | All content in DOM/SSG pages. Canvas is decorative and interactive only |

---

## 9. Recommended development phases [R]

| Phase | Goal | Exit criteria |
|---|---|---|
| **1. Content & truth** | Founder interview. Verified fact sheet per project. Collect screenshots and videos. Repo cleanup | Every public claim marked verified, with a source. D1–D5 answered |
| **2. Creative direction** | Moodboard. Architecture style. Palette and type. 3–5 approved concept key frames (atrium, one installation, Open Door, mobile frame) | Signed-off key frames + wayfinding map |
| **3. Foundation + Quick View** | Scaffold Next.js. Content model. `/quick`, case-study pages, contact. Deploy | **A live, shareable portfolio** (useful while 3D is built). Lighthouse ≥ 90 on mobile |
| **4. 3D vertical slice (gate)** | Greybox atrium + 1 installation. Full Blender → GLB → gltf-transform → R3F pipeline. Tiers + fallback | Meets budgets on the device matrix → **go/no-go** |
| **5. Atrium, navigation, sculpture** | Final atrium, guided tour, free-explore, reduced motion | Tour runs end to end on low/mid devices |
| **6. Flagship installations** | FlowDesk → LedgerMind → Accra We Dey → JoyDataBundle | Each passes budget + a11y + content sign-off |
| **7. Secondary galleries** | Origin, Lab, Unfinished, Open Door | Complete museum |
| **8. Hardening** | Performance, accessibility (WCAG 2.2 AA for DOM), WebGL failure tests, analytics, SEO/OG images | Device-matrix pass |
| **9. Launch** | Domain, monitoring, share kit | Live |

---

## 10. Decisions requiring founder approval

1. **D1 – Attribution.**
   - Confirm that "Tracy Semanu Foundation" commits are yours.
   - Who is `d <d@f>` in FlowDesk?
   - How much of the LedgerMind Flutter POS is original versus template-based?
   - Your exact role in JoyDataBundle, and permission to name teammates.
2. **D2 – AI-assisted development.** Several commits are authored by "Claude", and agent tooling is present. Choose a stance:
   - present it openly ("AI-augmented product builder");
   - mention it neutrally; or
   - leave it out.

   I recommend presenting it openly; it is verifiable from your repos anyway.
3. **D3 – Repo cleanup.** Approve scrubbing `flowdesk/RUNNING-LOCALLY.md` (phone numbers and IDs). Also approve tidying the vendored AI-skill folders and local paths in `ledmi_os`.
4. **D4 – Flagship list and order.** Confirm FlowDesk, LedgerMind OS, Accra We Dey and JoyDataBundle, or change them. What is Vendly?
5. **D5 – Accra We Dey.** Include it, curated to general-audience scenes, or leave it out?
6. **D6 – Personal story.** What to share: background, location (Ghana/Accra?), photo, the financial-independence motivation and how to phrase it, roles and availability, CV, contact channels.
7. **D7 – Visual direction.** Architecture language (e.g. warm brutalist concrete, white-marble classical-futurist, or contemporary Ghanaian/Afro-futurist motifs). Who creates the concept art: I draft it with image tools, or you commission it?
8. **D8 – Media.** May I use the FlowDesk brag film, QA screenshots and pitch decks? Should live demo links be shown?
9. **D9 – Tooling installs.** Approve installing Node 22/24, the `gh` CLI, pnpm (via corepack), gltf-transform and KTX-Software.
10. **D10 – Hosting and budget.** Vercel plus a custom domain (which name?), an email provider for the contact form, analytics (privacy-friendly?), and optional paid real-device testing or image-generation credits.

---
*End of Phase 0. No implementation starts until these decisions are approved.*
