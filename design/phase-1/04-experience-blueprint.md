# D. Experience and Storytelling Blueprint

**Labels**
- **[V]** verified.
- **[A]** assumption.
- **[R]** recommendation.
- **[F]** needs founder input.

---

## 1. Four ways to experience the museum

| Mode | Who it's for | How to enter | How to leave |
|---|---|---|---|
| **Quick View** (HTML, no WebGL) | Recruiters with 30–60 s; low-end devices; WebGL failure | Top-bar "Quick View"; `/quick`; CV and email links point here | "Enter the museum" button; browser back |
| **Guided tour** | First-time visitors who want the story | "Begin tour" on arrival; the Map's "Resume tour" | "Exit tour" (always visible) → free mode at the current room |
| **Direct exhibit selection** | Returning visitors; recruiters who want one project | The Map overlay (plan + section) or the exhibit list; deep links (`/museum/flowdesk`, …) | Back returns to the previous room or the Court |
| **Free exploration** (optional) | Curious visitors, mostly on desktop | "Explore" toggle | Toggle off; Map; Esc |

**Rules**
- No mandatory intro.
- No required WASD.
- **Contact** and **Quick View** are visible in every mode.

## 2. Arrival experience (0–5 seconds)

1. **0 ms: HTML first.** The DOM shell renders immediately over a **poster still** of the Arrival view (a pre-rendered AVIF, ≤ 80 KB, from the exact camera the 3D scene will use):
   - wordmark;
   - one line: *"Perez Tegbey: developer and product builder. Open to work."* [F] wording per D6;
   - three buttons: **Enter the museum** · **Quick View** · **Contact**.
2. **In the background:** capability check → GPU tier → load the Court GLB (≤ 1.5 MB on mobile).
3. **"Enter the museum"** cross-fades the poster into the live scene from the same camera. There is no fly-in. On reduced motion it is an instant cut.
   - If 3D is not ready, the button shows quiet progress with a "Skip to Quick View" link.
   - If 3D fails, the visitor gets Quick View with one sentence of explanation.
4. **First view.** From the Arrival Landing (+7.2 m), looking north-west across the void:
   - the Stratum sculpture centre-frame;
   - the great stair climbing the north wall;
   - dawn-blue oculus light;
   - the FlowDesk threshold glowing on axis.

   In portrait, the composition stacks vertically: oculus top, sculpture centre, threshold seam bottom.
5. **The intro plaque** on the Landing rail introduces Perez in two sentences. Below it are **Begin tour** and **Choose an exhibit**.

## 3. The Origin (the Foundations): the making of a builder

**Architecture:** a 43.2 m trench gallery at −7.2 m with burnished earth-plaster walls and five bays. In each bay **the roof slit widens and the ceiling rises**: 3.6 → 5.4 → 7.2 → 9.0 → 10.8 m. Light grows as the story grows. No text panels on walls. Each bay has **one object on one plinth**, one short line of text (DOM), and an optional founder-supplied photo or reflection.

| Bay | Theme | Object (all real or founder-supplied) | Evidence |
|---|---|---|---|
| 1 | Fascination with how technology works | A **cut-open mechanism**: an object sectioned to show its inside. [F] Perez chooses what it should be (something that actually fascinated him) | Founder story only. No invented anecdote |
| 2 | Discovering he could create software | The **first public contract**, `SimpleStorage.sol`, cast as a bronze tablet with its first lines legible | [V] Oct 2024 |
| 3 | Learning through building | A cluster of small **plaster casts** (rough, honest): voting dApps, SecureVoteChain (co-authored, credited), LedgerMind v1 | [V] 2025–Mar 2026 |
| 4 | Increasingly ambitious products | A **scale jump**: the bay opens up and one sees, through a slot, the foot of the FlowDesk Engine in the wing above | [V] chronology |
| 5 | Pursuing independence, growth and opportunity | A **stair** up into the Court's light. The proposed line *"Curiosity made me explore. Ambition made me build."* is engraved on the riser, if approved | [F] wording |

**Integration of authentic material (later, with approval)**
- Founder photos are printed as small **cyanotype-like plates** (a duotone treatment in museum palette) set into the plaster.
- Short written reflections, in his own words, are set in the narrative serif.
- An optional **voice note per bay**, only if Perez records it, with captions always provided.
- **Dates** show as "first public commit: Oct 2024", never as life milestones.

**Sound:** near silence. Footsteps on split-face basalt. A faint room tone that warms as the slits widen.

## 4. Guided tour

User-paced. Each stop waits for **Next**; optional auto-advance after reading time. Captions are always on screen (DOM), with no voice required.

| # | Stop | Camera | Interaction | Est. time |
|---|---|---|---|---|
| 1 | Arrival Landing | Wide, north-west over the void | Intro plaque | 15 s |
| 2 | The Court and the Stratum | Low angle at the sculpture base; the floor ring shows the Lab | "This sculpture opens as you explore" | 15 s |
| 3 | The Foundations | Ramp descent, then bay-by-bay dolly | Five plinths | 60–90 s |
| 4 | FlowDesk | Pane head-on → along the Engine | Play the customer → floor moment → Look beneath | 90 s |
| 5 | LedgerMind OS | Counter on axis | Sell → cut → sell → reconnect → Look beneath | 75 s |
| 6 | Accra We Dey | Platform end, vitrine ahead | Tap a venue → Look beneath | 60 s |
| 7 | JoyDataBundle | Exchange foreground, towers rising | Follow an order → payout gate → who built what | 60 s |
| 8 | The Laboratory | Spiral descent around the bronze spine | Choose benches | 60 s+ |
| 9 | The Unfinished Wing | Rising along the great stair | Status plaques | 45 s |
| 10 | The Open Door | Through the oculus onto the roof at dawn | Contact | open |

- **Full tour:** about 8–10 minutes.
- **[R] Short tour: "3 minutes".** Stops 1 → 4 → 5 → 8 → 10, offered on arrival and in Quick View as "See the highlights".

**Transitions between stops**
- **Default:** a 1.6–2.4 s camera flight along authored splines through thresholds. Never through walls.
- **Reduced motion:** a 300 ms cross-fade cut.
- **Loading:** the next stop's GLB is prefetched at the current stop. If it is not ready, the flight waits at the threshold dog-leg, which is designed as a natural pause point with its plaque.

## 5. Direct navigation and free exploration

- **Map overlay:**
  - plan view (with a section view toggle) showing all rooms;
  - "You are here", the next tour stop, and visited rooms;
  - tap a room to fly there.
- **Exhibit list:** a text list with one-line purposes and status chips.
- **Deep links:** every room has a URL; sharing an exhibit link opens straight into it, after the arrival poster.
- **Free exploration:**
  - **Desktop:** drag to look; click floor **viewpoint discs** to move (camera glides); optional WASD and arrow keys; scroll for a small dolly.
  - **Mobile:** drag to look; tap discs or hotspots; no virtual joystick.
  - Movement is clamped to authored walkable zones, so visitors never get lost or stuck.

## 6. Recruiter journey and contact

**Quick View** (`/quick`): a single HTML page in the museum's identity, readable in 30–60 seconds. Order:
1. **Header:** name, role line, *Open to work* chip, **Download CV** · **Contact** · **GitHub**.
2. **What I build:** three lines, e.g. *products for businesses; backends with queues, payments and security; 3D and realtime web*. [F] Founder to approve.
3. **Four flagship cards** (not a card wall; a compact list). Each has purpose, role, status chip, stack line, and links: case study · repository · (live, where it exists).
4. **Capabilities:** grouped from verified stacks, e.g. TypeScript/Node (Fastify, BullMQ, Prisma), React/Next.js, Supabase/Postgres/RLS, Flutter, Three.js, payments (Paystack/MoMo), AI integration with guardrails.
5. **Evidence:** test counts, security reviews, architecture notes, linked to the Lab and repos.
6. **Contact block:** email (copyable), form, profiles.
7. **"See the 3-minute highlights"** opens the short tour.

**Global contact**
- A persistent **Contact** button on every screen opens a side panel (desktop) or bottom sheet (mobile).
- It holds the same form as the Open Door, the email shown as copyable text, and CV and profile links.
- **The Open Door** is the ceremonial version of the same content.

**The Open Door, in detail**
- **Architecture:** the visitor steps from the great stair onto the roof plane. A free-standing bronze door frame, 12 m high, stands open toward the dawn horizon. Nothing else is on the roof.
- **Interaction:** approaching the door raises a **DOM panel** framed by the doorway:
  - *"Open to work."*
  - Three choices: **Employment** · **Freelance** · **Collaboration** (they pre-fill the form's subject);
  - a short form (name, email, message, optional link);
  - **Download CV**, GitHub, [F] LinkedIn and other profiles.
- **After submitting:** honest states only. *"Sent. Perez will reply to you at {email}."* on success, or a clear error with the email as fallback. Never claim a message was sent when it wasn't.
- **The Stratum's last state:** returning to the Court after the Open Door shows the sculpture fully opened. Twelve strata, four still closed, labelled "still becoming", which links to the Unfinished Wing.

## 7. Controls

| Action | Desktop | Portrait mobile |
|---|---|---|
| Next / previous tour stop | Buttons, → / ←, Space | Large buttons in the bottom bar; swipe left/right on the caption card |
| Look around | Drag | Drag (one finger) |
| Move (free mode) | Click viewpoint disc; optional WASD | Tap viewpoint disc |
| Interact | Click hotspot (DOM button anchored in 3D) | Tap hotspot (≥ 44 × 44 px) |
| Look beneath | Button in caption card; `B` | Button in caption card |
| Plain ⇄ Technical | Toggle in top bar; `T` | Toggle in the caption card menu |
| Map | `M` / button | Bottom-bar button |
| Close / back | Esc → closes panel → leaves exhibit to its overview → Court | System back gesture follows the same ladder |
| Contact / Quick View | Top bar, always | Top bar, always |

**Escape and back ladder:** panel → exhibit overview → room entry view → Court → (browser back) previous page. Every step is undoable, with no dead ends.

## 8. Accessibility in the experience

- Every room has a **DOM mirror**: headings, captions and case-study text in reading order. Screen readers follow the tour through the DOM. The canvas is marked decorative.
- Keyboard: every hotspot is a real button in tab order, with visible focus on bronze outlines.
- Captions for any audio. Sound is **off by default**, with a toggle.
- No flashing. Light pulses stay under 3 per second and are low contrast.
- **Reduced motion:** cuts instead of flights; reveals cross-fade between closed and open states; no idle animation except a slow light change.
