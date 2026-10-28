# The scroll journey: implementation report

Directive: *Fully immersive 3D portfolio, complete Three.js scroll-driven experience overhaul* (2026-10-27).
Status: built, tested locally, committed locally. **Not pushed, not deployed.**

Commits (local only):

- `96b8ef8` is the 2D redesign, kept as the recoverable checkpoint before this work.
- `97b59b1` adds the scroll-driven 3D journey on the home page.
- `3211542` bakes the bronze's reflections and fixes the finale and phone framing.
- `a6600fe` makes chapter links land on their chapter.
- `bbd2838` publishes Perez's contact details and removes the review markers.
- `01b7e5e` adds the project showroom and tells each bay in Perez's own voice.

`docs/phase-2f/phase-2f-report.md` stays uncommitted, as asked.

---

## What the home page is now

The home page is one continuous scroll through ten chapters, with a single persistent 3D canvas behind them:

| # | Chapter | Scene |
|---|---|---|
| 1 | Opening: **PEREZ** / "I build ideas into things that work." | The Dawn Courtyard (Blender), Code Monument in view |
| 2 | The Code Monument | Camera approaches the monument. The casts part along their seams to show the steel. The camera rises over the monument, already looking ahead to FlowDesk. |
| 3 | FlowDesk (showroom bay 1) | Camera walks from the court into the showroom's first bay: the customer's phone wall, then the seven-layer pipeline (the order slip moves down the table, the price-floor gate rises, the lid lifts), then the owner's board. |
| 4 | LedgerMind OS (bay 2) | A branch counter, its till and queue tray, and the server, joined by an overhead connection. A sale goes through; the connection goes dark and sales queue on the till; it returns and the queue syncs (a resent sale is recognised, not counted twice); the counter then takes the server's stock. |
| 5 | Accra We Dey (bay 3) | An architectural model of an Accra-inspired city on a plinth, the sea along its south edge: players walk the streets, venues stand in the squares, the game server's ticks ripple out. **Labelled as an illustration, not the game's map or art.** |
| 6 | JoyDataBundle (bay 4) | A round dais: customers, resellers, the backend hub (grey, labelled as a teammate's work), the frontend ring (Perez's part) and the admin payout desk (Perez's flow). Orders flow in; payouts wait for review, then go out. |
| 7 | About | "Curiosity made me explore." Scattered pieces settle into a lattice tower: "Ambition made me build." The Experience timeline follows. |
| 8 | Skills | One system rather than a logo grid: web and mobile interfaces, backend, databases, architecture posts, a security ring, and AI-assisted engineering beside the stack. Readable labels throughout. |
| 9 | Work with me | Six services, then "Have a project in mind? Let's build it." and Contact. |
| 10 | Contact finale | The court turns to dusk. "Let's build something together." Contact, GitHub, Work with me and the 2D portfolio are all real HTML. |

**The project showroom (2026-10-28).** The FlowDesk building now continues north as one showroom with a bay per project, built in Blender (`blender/scripts/rooms/showroom.py`) and baked like the rest of the museum. The camera walks from the court through all four bays without a cut. Each bay opens in Perez's own voice, using only verified facts (`src/content/showroom.ts`): what the project solves, what he built, and when its code first went public.

All text is server-rendered HTML in the page, not drawn in WebGL. Every project chapter links to its full case study. Contact is reachable at all times from the top bar, and from the opening links ("See the projects", Services, About, Contact, 2D portfolio). A chapter rail on the right links every chapter directly.

The guided tour (`/museum`), the 2D portfolio (`/quick`), the case studies and Work with me are unchanged, apart from the shared improvements listed under Performance.

## How it works

- **One number drives everything.** A single GSAP ScrollTrigger turns the scroll position into `s` = chapter index + progress through that chapter. `s` is stored outside React (`src/journey/state.ts`), so scrolling never re-renders a component.
- **One camera rig.** It eases `s`, samples the authored camera keys (`src/journey/chapters.ts`, in Blender coordinates) and sets the sky, the lights and the veil. Every scene reads the same eased value in the same frame, so there are no competing loops. The canvas renders on demand and draws nothing while the page is still.
- **Worlds are streamed, not resident.** The Court loads first. The showroom streams in when the visitor heads down the page, or after six quiet seconds. About and Skills, the two scenes built in code, exist only around their own chapters, compiled off the main thread before they are shown and released afterwards. Changes of world happen behind a short veil.
- **Mobile.** Pixel ratio is capped at 1.5 on touch devices and adapts to frame rate. Phones get a smaller city, wider lenses, and text panels anchored low with the scene framed above them. Materials are baked and unlit, plus one sun for the code-built worlds. All repeated objects are instanced.
- **Reduced motion.** The camera holds each authored composition and cuts between them, never flying. Scenes still show the state the text describes. The veil and the text entrances are off.
- **No WebGL, or a failure.** The page switches to a flat layout: chapters stack with their pictures, and everything stays readable and linked. A lost graphics context switches to the same layout, with a notice.

## Verification (this laptop, production build)

**Unit and route tests: 105 passing**

- New camera tests cover path continuity, key order, and clearance over the monument, under the FlowDesk rail and above its table.
- New route tests cover the home page: opening links, every chapter link resolving to its section, the four projects with case-study links, the contact finale, and the flat fallback when WebGL is unavailable.

**Type check and lint:** clean.

**Visual review:** I captured every chapter at 1440×900 and 390×844 and fixed these issues:

- The camera clipped the monument's crown while rising.
- On phones the camera stepped back through the court's south wall.
- The finale's descent passed through the arcade roof.
- The overhead monument shot showed only floor tiles.
- Floor edges were visible at the horizon.
- The finale's text covered the monument.

**Navigation:**

- `/#ledgermind` lands on LedgerMind.
- The rail moves to Skills, and the back button returns to LedgerMind.
- Keyboard Tab order is logical, and no focused element is hidden or faded.

**Accessibility:** axe finds no violations on `/`, `/quick` or `/museum` at 1440 and 390 wide. Lighthouse accessibility, best practices and SEO score 100.

**Reduced motion and no-WebGL:** both checked visually.

**Console:** no errors or warnings across a full scroll.

## Performance

**Measured locally, Lighthouse on the home page (production build, GPU enabled):**

| | Performance | LCP | Total blocking time | CLS |
|---|---|---|---|---|
| Desktop | **92** | 0.9 s | 160 ms | 0 |
| Mobile (simulated 4× CPU, slow 4G) | **61** | 3.6 s | 1.5 s | 0 |

**With the showroom (2026-10-28):** the showroom building is 1.06 MB (it replaces FlowDesk's 0.42 MB file and the three code-built scenes) and streams in after the Court. Loading tasks stay under about 0.2 s on this laptop; across two full scrolls, one 0.65 s task appeared once near the Contact chapter and did not repeat. Lighthouse was not re-run after the showroom.

**Long tasks on this laptop (Intel HD 520, unthrottled):** the longest task while loading the home page was cut from **4.9 s to under 0.2 s**. A full scroll through all ten chapters stays under about 0.1 s per task in repeated runs.

The cause was the bronze's reflections: three.js was prefiltering them in the browser, blocking the main thread for 0.5 to 5 s on both the journey and `/museum`. They are now baked once (`tools/env-bake`) into a 137 KB PNG. A related cost also went: three's per-shader error check blocked on the driver, and it is now skipped in production.

## Known limitations

- **No real-device testing yet.** All figures above come from this laptop and Lighthouse's simulation. Performance on the iPhone and on a mid-range Android phone is unmeasured, and needs the same kind of check you did for Phase 2F.
- **Simulated mobile score is 61.** The remaining blocking time is mostly the three.js bundle evaluating and the first shader compiles. The mobile LCP element is the courtyard poster.
- **One 2-second stall appeared once** mid-scroll, in the first of four runs, and never reappeared. It was most likely a first shader compile. On Windows, ANGLE can report shaders ready before Direct3D has compiled them, so a first frame can still stall on some drivers.
- **The 3D path is roughly 2.2 MB of JavaScript and assets.** The page's text arrives first; the 3D loads after it, once the browser is idle.
- **Only Chrome on Windows was tested.** Safari (iOS and macOS) and Firefox are untested.
- **Panels move with the page.** Text panels pin only briefly before scrolling on; they never freeze the page. On phones a long panel, such as the experience timeline, scrolls inside itself.

## Resolved on 2026-10-28

- **Contact:** both email addresses (perez25882@gmail.com and pereztegbey66@gmail.com, each with a copy button), WhatsApp and a call link for +233 55 842 5882, and LinkedIn appear in the finale, the contact panel, the 2D portfolio and Work with me.
- **Review markers:** every open decision was resolved by the founder; the "to confirm" markers and their code are gone. FlowDesk's and Accra We Dey's repositories stay private.
- **CV:** none, by the founder's choice. Nothing links to one.

## Reviewing it

```bash
npm run build && npm run start
```

Open `http://localhost:3000/` and scroll. Try a chapter link (`/#accra`), the rail, the back button, reduced motion in your OS settings, and your phone on the same network.
