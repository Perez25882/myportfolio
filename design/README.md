# PEREZ — Museum of What's Possible · Design

Design documents for the interactive 3D portfolio.

**Status:** Phase 1 (creative direction and blueprint) is complete. The art direction (P1-1: Dawn Courtyard, plus Night Foundry's darker Laboratory) was approved on 2026-10-27. The other decisions and the founder questions are still open. No application code, Blender scenes, GLBs or concept images exist yet.

## Phase 1 executive summary

**Direction: *Dawn Courtyard*** (within the approved Hybrid Monumental Surrealism).
- A tropical-brutalist museum in warm laterite concrete, basalt and patinated bronze, organised as a **courtyard**: four Invention wings around a monumental Court.
- Beneath the Court: the **Foundations** (Origin) and the **Laboratory**.
- Above: the **Unfinished Wing** on a scaffolded gallery ring, and the **Open Door** on the roof, facing a dawn horizon.
- Light moves from blue hour to dawn as the visitor progresses.

**Signature idea: Look Beneath the Surface.** Every installation presents a calm surface, then parts along seams to reveal its real architecture.
- Each layer has two captions, *Plain* (for anyone) and *Technical* (for engineers), switched by one global toggle.
- The central sculpture, **Stratum**, is 12 floating basalt layers over a bronze mechanism. It opens one layer for each space explored.

**Flagships**
- **FlowDesk:** the Conversation Engine, with the price-floor sill as its signature moment.
- **LedgerMind OS:** the Offline Vault (cut the connection, keep selling, "sent twice, counted once").
- **Accra We Dey:** a living diorama in a vitrine; the only colour in the museum.
- **JoyDataBundle:** the Distribution Network, where honest team credit *is* the reveal.

**Recruiters**
- An HTML **Quick View** with no WebGL.
- A persistent **Contact** button on every screen.
- A **3-minute highlights** tour.
- No forced intro: an HTML poster renders instantly and 3D loads behind it.

**Production**
- A 1.2 m modular kit and per-room GLBs with baked lightmaps.
- Meshopt + KTX2 via gltf-transform.
- At most two detailed rooms resident on mobile.
- Idempotent Blender scripts with a budget gate.

## Phase 1 deliverables

| | Document | Contents |
|---|---|---|
| A | [Creative Direction](phase-1/01-creative-direction.md) | Central concept, emotional arc, architectural identity, Ghanaian references with origins, material palette, lighting, Seam Screen pattern, principles |
| B | [Architectural Master Plan](phase-1/02-architectural-master-plan.md) | Structure options and recommendation, layout and section, Mermaid map, dimensions, circulation, wayfinding, rooms, Laboratory benches, Unfinished Wing bays, loading boundaries, Atrium and the three sculpture concepts |
| C | [Exhibit Design Bible](phase-1/03-exhibit-design-bible.md) | Shared exhibit grammar; FlowDesk, LedgerMind OS, Accra We Dey and JoyDataBundle in full; evidence register |
| D | [Experience & Storytelling Blueprint](phase-1/04-experience-blueprint.md) | Four visit modes, arrival, the Origin, guided and short tours, navigation, recruiter and contact journeys, controls, escape ladder |
| E | [Visual Development Package](phase-1/05-visual-development.md) | Concept-art workflow, shared style block, 12 visual study briefs with cameras and prompts (not yet generated), reference list |
| F | [Technical Art Plan](phase-1/06-technical-art-plan.md) | Kit modules, per-room mobile adaptation, budgets, lighting, Blender file structure, reproducible pipeline, risks |
| G | [Design System](phase-1/07-design-system.md) | Wordmark, type, palette and contrast, components, icons, motion, transitions, loading, sound, accessibility, fallback states |
| H | [Founder Review](phase-1/08-founder-review.md) | Three art directions, recommendation, decisions to approve, questions for Perez |

Earlier: [Phase 0 report](../docs/phase-0-report.md).

## Proposed future repository layout

Not created; for reference only.

```
design/        this folder (approved design documents)
content/       fact register + case-study content (Phase 3)
blender/       .blend sources, scripts, approved refs (Phase 4+)
pipeline/      gltf-transform optimisation + budget checks
app/ …         Next.js application (Phase 3)
```
