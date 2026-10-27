# E. Visual Development Package

**Status:** **No concept art has been generated.** This document contains written briefs only.

Image generation is available through connected tools (e.g. Higgsfield, Canva), but they spend **paid credits**. Nothing will be generated until the founder approves a budget (see [08-founder-review.md](08-founder-review.md), decision P1-7).

---

## 1. How the briefs will be used

1. **Generate** two or three candidates per study (after approval), with the shared style block below plus the study prompt.
2. **Curate:** the founder picks one per study, or rejects it. Rejected candidates are deleted, not reused.
3. **Store** approved images in `blender/refs/<study-id>/`, with a `SOURCE.md` recording:
   - tool and model;
   - prompt;
   - date;
   - licence terms of the generating service.
4. **Use in Blender** as reference boards (image empties at 40–60% opacity), aligned to the study's camera. Reference import is guidance for hand-scripted modelling; **it is not image-to-3D reconstruction.**
5. **Photographic references** of real buildings (§4) are for **internal study only**. Each needs its licence checked before any use, and none is published in the portfolio.

## 2. Shared style block (prepend to every prompt)

> Architectural visualization, cinematic, photographic realism, restrained and premium. A monumental contemporary museum in tropical brutalist concrete with surreal moments. Materials: warm board-formed concrete with red laterite aggregate, honed charcoal basalt, patinated dark bronze, smoked glass, dark terrazzo floor. Light: cool blue-hour skylight from above, thin warm-white (2900 K) light seams in stone, deep soft shadows, subtle atmospheric haze. Palette: charcoal, warm grey-ochre, bronze, dawn blue, warm white. No people, or only one or two tiny distant silhouettes for scale. Clean composition, controlled asymmetry, large negative space.

**Shared negative prompt**
> neon, cyberpunk, holograms, floating code, circuit boards, glowing brain, sci-fi corridor, video game lobby, crypto, purple gradient, kente pattern, adinkra symbols, Ghana flag colours, text, logos, watermark, clutter, fisheye, oversaturated, plastic look, people in foreground

**Camera note:** focal lengths are 35 mm full-frame equivalents. Three.js vertical FOV is given for the matching in-engine camera.

## 3. The twelve studies

### S1. Main Atrium: cinematic wide
- **Composition:** rule of thirds. The Stratum sits on the right third; the great stair climbs the left; the oculus is at top; the Arrival Landing edge is in the foreground bottom-left.
- **Camera:** from the Arrival Landing, 8.8 m above the floor, pitched down 8°. 24 mm (vertical FOV 45°, 16:9).
- **Architecture:** 36 m square void, full-height Seam Screen wall on the right, gallery ring at mid-height.
- **Materials:** laterite concrete, terrazzo, basalt, bronze.
- **Lighting:** blue-hour oculus light; screen-shadow pattern on the floor; warm seams.
- **Palette:** charcoal / ochre-grey / dawn blue / warm white.
- **Focal object:** the Stratum.
- **Narrative purpose:** first impression; "this is exceptional and calm".
- **References:** tropical-modernist concrete; deep-shadow museum interiors.
- **Mobile adaptation:** see S2.
- **Blender approach:** kit walls + instanced screen-block field + sculpture; Cycles bake.
- **Complexity:** high (hero).
- **Prompt:** *"Vast square concrete atrium seen from a high cantilevered stone landing, a floating monolith of stacked dark basalt layers hovering above a dark terrazzo floor, thin warm light glowing from the seams between its layers, a cantilevered stair climbing the left wall toward a square skylight, the right wall a full-height perforated concrete screen casting meandering lines of light, blue hour."*

### S2. Main Atrium: portrait mobile
- **Composition:** vertical stack: oculus (top 20%), Stratum (centre), floor cut ring and FlowDesk threshold glow (bottom 25%). The UI-safe zone keeps the bottom 18% calm.
- **Camera:** same position as S1, rotated 12° toward the sculpture. 28 mm (vertical FOV 62°, 9:19.5).
- **Architecture, materials, lighting:** as S1.
- **Focal object:** the Stratum.
- **Narrative purpose:** proves the hero works on a phone.
- **References:** S1.
- **Mobile adaptation:** this is the mobile view.
- **Blender approach:** a second camera in the same scene.
- **Complexity:** low once S1 exists.
- **Prompt:** S1 prompt + *"tall vertical composition, the floating monolith centered, skylight at the top of the frame, a glowing ring cut into the floor at the bottom."*

### S3. The Stratum sculpture, close study
- **Composition:** three states side by side: closed, 4 open, 8 open.
- **Camera:** eye level at 6 m distance. 50 mm (vertical FOV 27°).
- **Architecture:** sculpture only, against the dark Court.
- **Materials:** honed basalt strata; bronze mechanism (bearings, conduits, machined plates, no gears-as-cliché).
- **Lighting:** seam light from inside, cool rim from above.
- **Focal object:** an exposed mechanism layer.
- **Narrative purpose:** defines the signature object and its "open" language.
- **References:** machined industrial components; cutaway engineering drawings.
- **Mobile adaptation:** a single state, tight crop.
- **Blender approach:** 12 slab objects + mechanism modules (bevelled, instanced bolts); per-stratum pivot empties.
- **Complexity:** medium.
- **Prompt:** *"A monolith of twelve stacked honed basalt slabs floating in darkness, some slabs shifted and rotated slightly apart revealing an intricate patinated bronze mechanism inside, warm light leaking from the seams, museum object photography."*

### S4. FlowDesk: the Conversation Engine
- **Composition:** one-point perspective down a long hall. A tall smoked-glass pane in the foreground with faint chat bubbles; a long bronze machine receding; a warm-lit ledger table at the far end.
- **Camera:** 1.6 m eye height, 2 m off-axis. 28 mm (vertical FOV 46°).
- **Architecture:** long hall; clerestory of screen blocks.
- **Materials:** bronze, basalt plinth, smoked glass, concrete.
- **Lighting:** warm machine glow; cool clerestory.
- **Focal object:** the basalt price-floor sill mid-machine, with one bronze token stopped against it.
- **Narrative purpose:** conversations become operations.
- **References:** mid-century industrial production lines; museum machine halls.
- **Mobile adaptation:** a vertical crop of the pane over the sill.
- **Blender approach:** spline-driven token path; 7 housing modules.
- **Complexity:** high.
- **Prompt:** *"Long monumental concrete hall, a long patinated bronze machine on a basalt plinth running its length, small bronze tiles travelling through it, in the foreground a tall smoked glass pane with faint message bubbles, at the far end a warm lit stone table receiving engraved slabs, one bronze tile stopped against a raised black stone sill midway."*

### S5. LedgerMind OS: the Offline Vault
- **Composition:** symmetrical, centred. A shop counter at the bottom, a vertical light beam rising to a frosted-glass mass hovering near the ceiling; side fins of glass.
- **Camera:** 1.6 m, on axis, pitched up 10°. 24 mm (vertical FOV 50°).
- **Architecture:** square vault with earth-toned concrete.
- **Materials:** basalt counter, bronze drawer, frosted glass, glass fins.
- **Lighting:** one warm vertical beam; soft cool ambient.
- **Focal object:** the beam and the drawer of stacked tokens.
- **Narrative purpose:** selling continues offline.
- **References:** bank vaults; Ghanaian shop counters [F: Perez to suggest].
- **Mobile adaptation:** naturally vertical.
- **Blender approach:** simple kit; beam is a quad.
- **Complexity:** medium.
- **Prompt:** *"Square monumental vault room of warm concrete, a dark basalt shop counter with a bronze drawer holding stacked bronze tokens, a single vertical beam of warm light rising from the counter to a hovering frosted glass mass under the ceiling, thin glass fins separating three smaller counters behind."*

### S6. Accra We Dey: the diorama
- **Composition:** platform tip foreground, vitrine centre, void below. The coastline inside the case faces the camera.
- **Camera:** 2 m above the platform, three-quarter top-down, pitched down 25°. 35 mm (vertical FOV 38°).
- **Architecture:** cantilevered basalt platform; dark void.
- **Materials:** smoked-glass vitrine; bronze ring above it.
- **Lighting:** the only daylight in the museum is inside the case (5500 K); darkness outside.
- **Palette:** dark museum, with **colour only inside the case**.
- **Focal object:** the living miniature city.
- **Narrative purpose:** a world within a world.
- **References:** the actual game's map render [V, from repo]; architectural dioramas.
- **Mobile adaptation:** steeper top-down, vertical frame.
- **Blender approach:** diorama import from the game generator export + cleanup.
- **Complexity:** high.
- **Prompt:** *"Dark museum space, a cantilevered black stone platform over a deep void, on it a glass display case containing a sunlit colourful miniature coastal West African city with roads, markets and small buses, its own warm daylight inside the case, a bronze ring hovering above the case."*

### S7. JoyDataBundle: the Distribution Network
- **Composition:** low angle; three slender towers rising out of frame, of different forms (lattice, solid, fin); bronze cables converging on a low bronze table in the foreground.
- **Camera:** 0.9 m, pitched up 18°. 20 mm (vertical FOV 56°).
- **Architecture:** tall hall.
- **Materials:** blackened steel, bronze, basalt plain.
- **Lighting:** light pulses along cables; cool top light.
- **Focal object:** the Exchange table and the payout gate.
- **Narrative purpose:** a network of people and payments.
- **References:** telecom lattice towers (abstracted, no branding).
- **Mobile adaptation:** a single tower and the table.
- **Blender approach:** modular tower segments, instanced.
- **Complexity:** medium.
- **Prompt:** *"Tall dark hall, three slender abstract towers of different structures rising into darkness, fine bronze cables with small points of warm light descending to a low bronze switching table on a black stone floor, small stone plinths around it, no logos, no brand colours."*

### S8. The Origin: the Foundations
- **Composition:** a long trench in perspective. The ceiling rises and a roof slit widens toward the far end; single plinths in bays.
- **Camera:** 1.6 m, centred. 35 mm (vertical FOV 38°).
- **Architecture:** burnished earth-plaster walls, split-face basalt floor.
- **Materials:** earth plaster, basalt, bronze tablet.
- **Lighting:** daylight slits growing; warm.
- **Focal object:** the bronze tablet (first contract) on plinth 2.
- **Narrative purpose:** honest beginnings.
- **References:** earthen architecture of northern Ghana *[licensed photos for study only]*.
- **Mobile adaptation:** a vertical crop of one bay at a time.
- **Blender approach:** 5 bay modules with a parametric height script.
- **Complexity:** low–medium.
- **Prompt:** *"Long narrow underground gallery with hand-burnished reddish earth plaster walls, a thin slit of daylight in the ceiling that widens and rises toward the far end, single small objects on stone plinths in each bay, quiet and intimate."*

### S9. The Engineering Laboratory
- **Composition:** a wide, low room; a coffered ceiling grid; the bronze spine column descending in the centre; workbenches with glass cases of wire models; a wall of small stacked tiles.
- **Camera:** 1.6 m. 24 mm (vertical FOV 50°).
- **Architecture:** low and wide; coffered concrete.
- **Materials:** basalt, bronze wire, glass, blackened steel.
- **Lighting:** even 3500 K work light from the coffers.
- **Focal object:** an exploded axonometric bronze-wire system model.
- **Narrative purpose:** credibility.
- **References:** engineering workshops; cutaway models.
- **Mobile adaptation:** one bench at a time.
- **Blender approach:** bench kit, instanced; wire models from curves.
- **Complexity:** medium.
- **Prompt:** *"Low wide underground workshop with a coffered concrete ceiling, a thick bronze column descending through the middle, rows of dark stone workbenches holding glass cases with intricate bronze wire architectural models, a wall of small stacked stone tiles, even warm work light."*

### S10. The Unfinished Wing
- **Composition:** a gallery ring in raking light. Odum-timber scaffolding; some bays complete, some in formwork, some only scaffold; chalk lines and survey marks; precise, not messy.
- **Camera:** 1.6 m on the ring, looking along its curve. 28 mm (vertical FOV 46°).
- **Architecture:** cantilevered gallery ring.
- **Materials:** odum timber, concrete, formwork ply, bronze fittings.
- **Lighting:** raking warm light through gaps.
- **Focal object:** a half-cast plinth bearing a status plaque.
- **Narrative purpose:** ideas still becoming.
- **References:** permanent timber scaffolding in Sudano-Sahelian earthen buildings (study only).
- **Mobile adaptation:** a single bay.
- **Blender approach:** scaffold generated by Geometry Nodes, then realized; formwork kit.
- **Complexity:** medium.
- **Prompt:** *"High concrete gallery balcony partially under construction, beautifully detailed hardwood timber scaffolding with bronze fittings, some bays finished in smooth concrete, others still in wooden formwork, chalk lines and survey marks, warm raking light, orderly and intentional."*

### S11. The Open Door
- **Composition:** an endless dark roof plane. A single free-standing tall bronze door frame with its leaf open, facing a dawn horizon; the stair emerging through a square opening in the foreground.
- **Camera:** 1.6 m, slightly behind the stair head. 35 mm (vertical FOV 38°).
- **Architecture:** roof plane; free-standing door frame.
- **Materials:** terrazzo, bronze.
- **Lighting:** dawn glow `#C98A5B` to blue.
- **Focal object:** the open door.
- **Narrative purpose:** possibility and invitation.
- **References:** land-art minimalism.
- **Mobile adaptation:** naturally vertical: door centre, sky above.
- **Blender approach:** minimal geometry; gradient sky; no bake needed beyond AO.
- **Complexity:** low.
- **Prompt:** *"An endless dark polished stone rooftop at dawn, a single monumental free-standing bronze door frame with its door open toward the glowing horizon, a stair emerging through a square opening in the foreground, vast sky, quiet and hopeful."*

### S12. Persistent navigation and recruiter Quick View
- **Composition:** UI mock, not a render. Two artboards:
  - (a) the museum with its overlay: top bar (wordmark, Plain/Technical, Quick View, **Contact**), bottom tour bar, caption card;
  - (b) the Quick View page at 390 px and 1440 px.
- **Camera:** —
- **Materials and palette:** per [07-design-system.md](07-design-system.md).
- **Focal object:** the Contact button; flagship list.
- **Narrative purpose:** recruiter speed.
- **References:** design system.
- **Mobile adaptation:** both artboards cover mobile.
- **Blender approach:** n/a; built as HTML in Phase 3.
- **Complexity:** low.
- **Prompt:** none. Produce as a design file, not an image-generation prompt.

## 4. Real-world reference list (internal study, licences to check)

| Topic | Source to look for | Licence status |
|---|---|---|
| Asante courtyard compounds | UNESCO site documentation; Wikimedia Commons photos | Check each image |
| Ghanaian tropical modernism | V&A *Tropical Modernism* (2024) materials; KNUST archives | Study only |
| Screen-block walls in Accra | Photographs (own, or licensed) | Check |
| Earthen architecture, Upper East | Licensed photography | Check; never reproduce wall paintings |
| Larabanga scaffolding | Licensed photography | Study only |
| Accra We Dey visuals | Perez's own repo screenshots and renders | Owned by Perez [V] |
