# C. Exhibit Design Bible

**Labels**
- **[V]** verified in Phase 0, or by the follow-up code reading for this phase.
- **[A]** assumption.
- **[R]** recommendation.
- **[F]** needs founder confirmation.

**Rule:** no exhibit states a fact that is not marked [V] or approved by the founder.

---

## 0. Shared exhibit grammar

Every installation follows the same three-beat structure, so the museum feels authored as one:

1. **Encounter: the surface.** A single sculptural machine in a composed room. The visitor understands the *problem* in about 10 seconds, without reading.
2. **Operate: the product.** One primary interaction that demonstrates what the product *does*.
3. **Look beneath: the mechanism.** A "Look beneath" control (always the same icon and position) parts the machine along its seams into **strata**. Each stratum is a real part of the project's architecture, with two captions:
   - **Plain:** one sentence for anyone.
   - **Technical:** components, libraries, files and patterns, with a link to source.

A global **Plain ⇄ Technical** toggle sets which caption shows first. Both are always reachable.

**Mandatory plaques** (DOM, accessible, identical style everywhere):
- **Status:** e.g. *Pre-launch · runs locally with test credentials*.
- **Role:** e.g. *Solo-built* or *Team project · Perez: frontend & payout review*. [F] Pending Phase 0 decisions D1 and D2.
- **Evidence:** repository link, case-study page, video.

**The Stratum sculpture link.** Finishing an exhibit's reveal opens one stratum of the central sculpture. The visitor's progress is remembered per visitor in local storage, as a convenience only.

---

## 1. FlowDesk: The Conversation Engine

**Wing:** north. **Room:** the Conversation Hall, 14.4 × 32.4 × 14.4 m.

**What we can say** [V]
- A WhatsApp operations layer for Ghanaian SMEs. It turns chats into tracked orders, confirmed payments and bookings.
- A grounded AI assistant whose price floor lives in the database.
- Payment confidence ladder, MoMo screenshot review, Paystack billing, RBAC and security review.
- **Status:** pre-launch. Runs locally against Meta's test number. No production users claimed.

| Aspect | Design |
|---|---|
| **Architectural concept** | A long axial hall, like a production line in a market hall. Board-formed concrete walls, a clerestory of Seam Screen blocks. The machine runs the length of the hall; the visitor walks beside it from "message" to "order" |
| **Primary machine** | **The Engine**: a 21.6 m bronze-and-basalt machine on a basalt plinth. At the south end stands a tall smoked-glass **Conversation Pane** where chat bubbles appear. Messages become **cast tokens** (small bronze tiles) that drop into a channel and travel through housings. At the north end each emerges as a **stamped order slab** that settles onto a ledger table |
| **Entry composition** | From the threshold dog-leg the visitor faces the Conversation Pane head-on (portrait-friendly: a tall pane). The Engine recedes behind it in perspective, ending at a warm-lit ledger table |
| **Problem demonstration** | The Pane fills with a realistic shop chat: product questions, haggling, a payment screenshot. Nothing on the ledger table moves. *Plain:* "For many shops, orders and payments live inside chat threads." [A — wording to be confirmed by Perez] |
| **Main interaction** | The visitor **plays the customer** by tapping message chips, replaying the product's documented demo scenario (from FlowDesk's own film script [V]): <br>1. "2 bags of the 5kg jasmine rice and a crate of eggs." <br>2. "Can you do GHS 90?" <br>3. Payment proof. <br>Each message becomes a token that travels through the Engine. This is labelled as an **illustrative scenario**, not real customer data |
| **Signature moment** | The GHS 90 token reaches a **basalt sill**, the price floor. It is engraved with the floor value and *"stored in the database"*. The token cannot pass; it rebounds. A GHS 95 counter-offer token is cast and continues. Caption (from the product's own thesis [V]): **"The floor lives in the database, not the prompt."** |
| **Visual transformation** | Accepted tokens fuse into an order slab stamped `FD-02214` (the film's demo order [V]), which slides onto the ledger table. The ledger table's live total updates |
| **Engineering reveal** | "Look beneath" lifts the Engine's housings into **seven strata** (next table) |
| **Information hierarchy** | 1. One-line purpose. 2. The floor moment. 3. Strata. 4. Plaques (status / role / evidence). 5. Links |
| **Exit composition** | The order slab continues on a rail through the threshold back into the Court, so the visitor leaves with continuity |
| **Mobile alternative** | Portrait camera frames the Pane (top two-thirds) and the sill (bottom third). The token journey is a vertical drop rather than a horizontal run. Strata appear as a scrollable DOM list; tapping an item highlights its stratum |
| **Performance cost** | Medium. ≈ 1.2 MB GLB; ≈ 60k tris; ≈ 25 draw calls. Tokens are instanced (one draw call). Chat text is DOM/SVG, not 3D text |
| **Technical feasibility** | High. Scripted animation along a spline, plus instancing |
| **Blender assets** | Hall shell (kit); Engine housing (7 separable strata modules); Conversation Pane frame; token (1 mesh, instanced); order slab; basalt sill with engraved floor (engraving baked to normal-in-lightmap); ledger table; lightmap atlas 1–2K |
| **Required evidence** | Confirm the queue names, worker roles and confidence-tier names below against `main` at build time. Permission to use the film scenario. Screenshots from `qa/shots` (only after D8) |

**FlowDesk strata**

Names come from the repository's actual modules [V, read 2026-10-27].

| # | Stratum | Plain caption | Technical caption (source) |
|---|---|---|---|
| 1 | Intake | "Every WhatsApp message arrives at FlowDesk's front door." | Meta webhook → Fastify route `modules/webhook` |
| 2 | Queue | "Messages wait in line so none are lost, even at 6 am." | BullMQ on Redis: `queues/message`; `workers/message-processor`; `dead-letter` worker; tenant-fairness scheduling |
| 3 | Understanding | "FlowDesk works out what the customer wants." | `services/intent`: rule engine first, then a pluggable AI classifier (`intent-classifier` worker) |
| 4 | Grounding | "Answers come only from the shop's real catalogue and prices." | `services/assistant`: context builder, evidence (`priceFloors`), grounding, decision |
| 5 | Guardrails | "The assistant can't be talked below the shop's price, or tricked by hostile messages." | Negotiation gate on the DB floor; nonce-fenced prompt with sanitiser; quantity ceiling |
| 6 | Money | "Payments are tracked by how certain they are, not just yes or no." | Payment confidence ladder (attest / void); MoMo screenshot review queue; Paystack billing |
| 7 | The shop's view | "The owner sees orders appear live on a board." | React + TanStack Query dashboard, live updates over SSE (role-scoped); `queues/outbound` replies via WhatsApp Cloud API |

---

## 2. LedgerMind OS: The Offline Vault

**Wing:** east. **Room:** 21.6 × 21.6 × 18 m, a vault.

**What we can say** [V]
- An offline-first retail OS for multi-branch chains: Flutter POS, Next.js dashboard, Supabase with 22 migrations, RLS and branch scope.
- An offline queue in Hive with idempotency keys, retry counts and a dead-letter box.
- A documented conflict matrix: server wins for catalogue and inventory; first client submission wins for sales, with idempotent replay; Paystack is authoritative for electronic payments.
- **Status:** not live with customers; pre-launch blockers documented.
- **Provenance** [F]: the POS app may be built on a third-party open-source Flutter base. The plaque wording waits for D1.

| Aspect | Design |
|---|---|
| **Architectural concept** | A square vault of earth-toned concrete with a frosted-glass **Cloud** mass hovering under the ceiling. A single **beam of light** connects the Cloud to the shop counter below: connectivity made visible |
| **Primary machine** | **The Counter**: a basalt shop counter with a POS slab and a bronze **drawer** (the local offline store). Behind it, three **branch counters** are separated by glass fins (branch isolation) |
| **Entry composition** | The visitor enters on axis with the counter. The beam rises from it to the Cloud. Vertical, which suits portrait |
| **Problem demonstration** | The beam flickers. Plain caption: "Internet in many shops is unreliable. A cloud-only till stops selling when the connection drops." [V, from PRD problem statement] |
| **Main interaction** | **Sell → Cut the connection → Keep selling → Reconnect.** <br>• **Online sale:** a token rises up the beam into the Cloud ledger. <br>• **Cut** (a large, clear switch): the beam goes dark. <br>• **Offline sales:** tokens stack in the bronze drawer, each stamped with a short idempotency key. <br>• **Reconnect:** tokens rise one by one; the Cloud's ledger and the counter's stock numbers reconcile |
| **Signature moment** | **Duplicate replay.** One token is re-sent after a simulated timeout. It reaches the Cloud, which *recognises* it, returns the original receipt and records no second sale. Caption: "Sent twice, counted once." [V: idempotency keys reused on retry] |
| **Visual transformation** | Inventory numbers on the counter snap to the server's values after sync ("the server is authoritative for stock" [V]). Branch counters' tokens can only enter their own glass column (RLS / branch scope) |
| **Engineering reveal** | The counter splits into strata: <br>① Flutter POS (BLoC, Hive boxes) <br>② `offline_queue` with retry, back-off and dead-letter <br>③ Sync service (delta catalogue sync) <br>④ Supabase checkout RPC (idempotent) <br>⑤ RLS + branch scope walls <br>⑥ Paystack Edge Function webhook (provider authoritative) |
| **Evolution: v1 → OS** | A side alcove holds a smaller, plaster-cast earlier machine: **LedgerMind v1** (Next.js 14 + Firebase + function-calling AI, March 2026 [V]). Its shadow on the wall is the outline of the current Counter. Caption: "Rebuilt from a single web app into a POS + dashboard + database platform." |
| **Information hierarchy** | Purpose → offline demo → duplicate replay → strata → v1 alcove → plaques |
| **Exit composition** | The beam stays lit as you leave; a last token rises |
| **Mobile alternative** | Vertical composition: Cloud at top, beam, counter at bottom. The switch and "Sell" are large DOM buttons; tokens are animated in 3D. Branch fins collapse to one branch plus a "3 branches" note |
| **Performance cost** | Low–medium. ≈ 1.0 MB; ≈ 40k tris; ≈ 20 draw calls. Beam is a single additive quad; tokens instanced; frosted Cloud opaque with a baked gradient |
| **Technical feasibility** | High. A state machine (online / offline / syncing) drives simple animation |
| **Blender assets** | Vault shell; Cloud mass; counter + drawer (separable strata); 3 branch counters + glass fins; token; v1 cast; beam quad |
| **Required evidence** | `docs/SYNC_PROTOCOL.md` and `features/sync/*` [V]; confirm the retry cap and back-off numbers before captioning them. **D1 answer on POS provenance.** Founder approval to show the PRD problem statement |

---

## 3. Accra We Dey: A World Within a World

**Wing:** south, toward the sea. **Room:** 18 × 25.2 × 21.6 m.

**What we can say** [V]
- A portrait-mobile browser multiplayer life sim set in Accra, built with Three.js and Vite.
- Server: uWebSockets.js + ws, Postgres and Redis, with shards and rooms.
- Real place coordinates and coastline on the map.
- CC0 MakeHuman-derived rigged characters, built by scripts.
- Load-test figures are self-reported in the README.
- **Status:** not deployed; tested locally.
- **Rating:** 18+. **Only general-audience content appears here** [F: D5].

| Aspect | Design |
|---|---|
| **Architectural concept** | A cantilevered basalt platform projects over a deep void. On it sits a **vitrine**, a smoked-glass case 7.2 × 4.8 m. Inside is a living diorama of Accra **with its own sun**. This is the only place in the museum with saturated colour and daylight: Perez's world inside Perez's museum |
| **Primary machine** | **The Diorama**: the game's own Accra map (coastline, districts and landmarks at real coordinates), rebuilt from the game's map data and kit. One character walks. A trotro or taxi loops a road. Tiny light pulses rise from venues to a bronze ring above the case |
| **Entry composition** | The visitor emerges onto the platform's end. The vitrine glows ahead, the void drops away around it, and the coastline faces the viewer (south) |
| **Problem demonstration** | Not a "problem" exhibit. Its job is to show **world-building and realtime systems**. Plain caption: "A whole city, running in a phone browser, shared by many players at once." [V for the design goals; scale numbers are labelled as self-reported] |
| **Main interaction** | Tap a place pin (e.g. a market, the beach, a trotro stop). The camera dips into that venue's **cutaway room**, one isometric room from the game, with two or three figures, then returns. A "Ride" button plays a short chase-camera trotro ride on the procedural road, if performance allows (high tier) |
| **Signature moment** | **Look beneath:** the diorama lifts on bronze pistons. Underneath, the **server** is revealed: <br>• a ring of glass cells (rooms of 25 players) inside a shard of 2,500; <br>• WebSocket messages as light pulses travelling up; <br>• a ticking counter labelled "README load test: 1,500 bots, 7–13 ms per tick (self-reported)"; <br>• Postgres and Redis plinths, and a second shard ring showing cross-shard scaling |
| **Optional extra** | A basalt **Oware board** at the exit (Oware is implemented in the game [V]). Visitors can play one move against the game's own Oware AI, **only if** the rules module can be reused cleanly. Phase 6+ |
| **Content curation** | Shown: map, markets, rides, the in-game phone UI, Oware, character creator. **Excluded:** every adult or 18+ system named in the README (e.g. crime and romance mechanics) and any venue that depends on them |
| **Information hierarchy** | Purpose → explore a venue → server reveal → character pipeline note (CC0 MakeHuman → scripts → GLB) → plaques |
| **Exit composition** | Looking back, the vitrine's sun casts a warm patch on the dark basalt: a world left running |
| **Mobile alternative** | Portrait: the diorama seen from a steep three-quarter top view. Pins are DOM buttons. The cutaway uses a pre-rendered still plus one animated figure on low tier. The server reveal is a vertical cutaway |
| **Performance cost** | **Highest risk.** <br>• Game character GLBs are 1.5–1.8 MB each raw [V]; the target is one re-exported character ≤ 400 KB (decimated, Meshopt, KTX2, 1 animation clip). <br>• Diorama ≤ 900 KB, with instanced houses and trees. <br>• ≈ 45 draw calls with merging; ≤ 120k tris. <br>• Skinned mesh ×1 only |
| **Technical feasibility** | Medium. Re-target the game's map data into museum GLBs (via a build script that runs the game's map generator and exports with GLTFExporter, then optimises). Do not embed the live game |
| **Blender assets** | Platform + vitrine; bronze ring; piston lift rig; server-reveal strata (shard ring, room cells, DB plinths); diorama imported from the generator export for clean-up and baking; 1 character (re-export) |
| **Required evidence** | Map data provenance (real coordinates) [V in code comments]; CC0 licence notes [V]; **D5 decision**; a short screen recording of the real game on a phone (to be made) for the case study |

---

## 4. JoyDataBundle: The Distribution Network

**Wing:** west. **Room:** 14.4 × 28.8 × 21.6 m.

**What we can say** [V]
- A team-built platform selling mobile data bundles: public buying and order tracking, reseller custom pricing and earnings, and an admin area for payment confirmation, payouts and complaints.
- The live frontend responds (HTTP 200; not functionally tested).
- **Team:** Dee (DeeGodman), Daxomar (Chuks), Perez. [F] Naming teammates needs permission (D1).
- **Perez's verified commits:** initial frontend import, frontend update, and an **admin payout-review feature** (admins see and confirm payouts).
- The backend has no Perez commits.

| Aspect | Design |
|---|---|
| **Architectural concept** | A tall hall with three slender **towers** on a dark basalt plain. They are told apart by **form** (lattice, solid, fin), **never by carrier colours or logos**. Bronze cables connect them to a central **Exchange** |
| **Primary machine** | **The Exchange**: a bronze switching table where bundles (light capsules) are routed. Around it stand **reseller nodes**, small plinths each with their own adjustable price ring |
| **Entry composition** | Portrait-friendly: towers rise out of frame, with the Exchange low in the foreground |
| **Problem demonstration** | Plain: "Resellers sell data bundles to their own customers at their own prices; someone has to confirm payments and pay resellers fairly." [A — wording to be confirmed by the team] |
| **Main interaction** | Follow one order. <br>Buyer → capsule enters the Exchange → **payment confirmation gate** (an admin approves) → the capsule travels up a tower's cable: "delivered". <br>Turn a reseller's price ring: their margin and earnings stack grow on the next order |
| **Signature moment** | **The payout gate:** a reseller's earnings stack reaches a bronze gate. An admin figure reviews and confirms, and the payout is released. Highlighted as **Perez's verified contribution** |
| **Engineering reveal: "Who built what"** | The plain splits into two strata: <br>• **Frontend:** Next.js 16 / React 19 pages (buy, track, reseller, admin), credited to the team, with Perez's commits highlighted. <br>• **Backend:** Express, Docker, queue and retry, provider API integration, credited to Daxomar. <br>**Attribution is the reveal.** Honest credit is shown as a strength in collaboration |
| **Information hierarchy** | Purpose → order flow → payout gate → who built what → live link → plaques |
| **Exit composition** | The cables hum faintly with light. The live site link is offered as a DOM button |
| **Mobile alternative** | Single tower in frame; the Exchange below. Order flow is a 3-step vertical animation. The reseller price ring becomes a DOM slider |
| **Performance cost** | Low. ≈ 0.8 MB; ≈ 35k tris; ≈ 20 draw calls. Cables are tubes with an emissive pulse in a shader uniform |
| **Technical feasibility** | High |
| **Blender assets** | Hall shell; 3 towers (modular segments, instanced); Exchange table; reseller node (instanced); payout gate; cable curves (bevelled, exported as meshes) |
| **Required evidence** | **Teammates' permission and preferred names (D1).** Confirmation of Perez's role beyond commits, if any. Live site check before publishing |

---

## 5. Evidence register

[R] This register is to be maintained in `content/` in Phase 3.

| Claim used in an exhibit | Source | Status |
|---|---|---|
| FlowDesk pipeline modules (webhook, queues, workers, intent, assistant) | Repo tree, read 2026-10-27 | [V] |
| FlowDesk floor stored in DB (`priceFloors`, negotiation gate) | `services/assistant/evidence.ts`, tests | [V] |
| FlowDesk demo scenario (06:41, GHS 90/95, FD-02214) | `brag/brag-plan.md` | [V]; usage needs D8 |
| LedgerMind offline queue, idempotency, dead-letter | `features/sync/data/services/offline_queue_service.dart` | [V] |
| LedgerMind conflict matrix | `docs/SYNC_PROTOCOL.md` §9 | [V] (design doc) |
| LedgerMind POS origin | — | [F] D1 |
| Accra We Dey map uses real coordinates | `client/src/v2/scene/map.js` comments | [V] |
| Accra We Dey load-test numbers | README | Self-reported. Must be labelled as such |
| JoyDataBundle Perez contributions | git history | [V] |
| Teammate names on plaques | — | [F] permission |
