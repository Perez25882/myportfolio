# G. Design System Specification

The UI is the museum's **signage and plaques**: quiet, precise, cast-bronze-and-stone in spirit, and always more readable than decorative.

**Labels:** **[R]** recommendation. **[F]** needs founder input.

---

## 1. Wordmark direction

- **PEREZ** set in a wide grotesque (Archivo, expanded width, weight 800), uppercase, with generous tracking (+4%).
- **The Seam.** A horizontal cut runs through all five letters at 55% height. It is a 1–2 px gap that shows a warm bronze line beneath.
  - On hover or focus, or once on first load (not on reduced motion), the gap opens to about 4 px for 600 ms: the "Look beneath" gesture in miniature.
- **Lockup:** wordmark + `MUSEUM OF WHAT'S POSSIBLE` in the text face at 11–12 px, letter-spacing 0.14em, set below or to the right.
- **Favicon / app icon:** a square of charcoal with a single horizontal bronze seam.
- [F] Whether the wordmark is "PEREZ" or the full name "PEREZ TEGBEY".

## 2. Typography

All faces are SIL Open Font License, served via Google Fonts or self-hosted.

| Role | Face | Use | Fallback |
|---|---|---|---|
| Display / signage | **Archivo** (variable: width 112–125, weight 600–800) | Wordmark, room names, plaque titles | "Arial Narrow", system-ui |
| Text | **Public Sans** (400 / 600) | Captions, Quick View, forms | "Segoe UI", system-ui |
| Narrative | **Newsreader** (400 italic / 400) | Origin reflections and the narrative line only | Georgia, serif |
| Technical | **JetBrains Mono** (400 / 600) | Technical captions, file and component names, status chips | ui-monospace, Consolas |

**Type scale** (rem, base 16 px, ratio ≈ 1.25)

| Token | Size / line-height | Use |
|---|---|---|
| `xs` | 0.75 / 1.4 | Chips, labels (uppercase, +0.1em) |
| `sm` | 0.875 / 1.5 | Technical captions |
| `base` | 1 / 1.6 | Body, Plain captions |
| `lg` | 1.25 / 1.45 | Caption headline |
| `xl` | 1.563 / 1.2 | Panel title |
| `2xl` | 2.441 / 1.05 | Room name (Archivo, uppercase) |
| `3xl` | 3.815 / 0.95 | Quick View hero (desktop) |

Line length ≤ 65 characters in panels.

## 3. Palette

**UI tokens.** Museum materials are listed separately in [01-creative-direction.md](01-creative-direction.md) §5.

| Token | Dark (museum default) | Light (Quick View option) | Use |
|---|---|---|---|
| `--ground` | `#141312` charcoal | `#F3EFE8` lime-plaster white | Page / overlay ground |
| `--surface` | `#1D1B19` | `#FBF8F3` | Panels |
| `--surface-glass` | `rgba(20,19,18,0.78)` + 12 px blur (high tier only) | `rgba(251,248,243,0.86)` | Caption cards over 3D |
| `--text` | `#EDE7DD` | `#1A1816` | Primary text |
| `--text-muted` | `#9C958A` | `#5E574E` | Secondary text |
| `--line` | `#2E2B27` | `#DDD5C9` | Hairlines |
| `--bronze` | `#C9A063` | `#8A6A3A` | Accent: seams, focus, primary CTA |
| `--seam` | `#FFD9AE` | `#B7864A` | Glows, progress |
| `--dawn` | `#C98A5B` | `#A86A3F` | Open Door only |
| `--status-live` | `#8FC79A` | `#2F6B3B` | "Live" chip |
| `--status-pre` | `#E2B866` | `#8A5A10` | "Pre-launch" chip |
| `--status-concept` | `#AFA8C0` | `#5E5A72` | "Concept" chip |
| `--status-team` | `#9CC0E0` | `#2D5378` | "Team project" chip |

**Contrast** (dark theme, computed against `#141312`):
- `--text` ≈ 15:1.
- `--text-muted` ≈ 6.2:1.
- `--bronze` ≈ 7.6:1.
- CTA uses charcoal `#141312` text on bronze `#C9A063` (≈ 7.6:1).

Light-theme values are to be verified with a contrast checker in Phase 3.

## 4. Surface language and lighting temperature (UI)

- **Panels:** solid or near-solid charcoal "stone" with a **1 px bronze hairline on the top edge only** (the plaque). Corner radius 2 px, so architecture stays square.
- **No glassmorphism stacks.** At most one translucent caption card is visible at once. Text sits on ≥ 78% opacity ground.
- **UI warmth matches the scene:** UI highlights use `--seam` (≈ 2900 K) so overlays feel lit by the same light.

## 5. UI components

| Component | Spec |
|---|---|
| **Top bar** | Left: wordmark (→ Court). Right: `Plain ⇄ Technical` toggle · **Quick View** · **Contact** (filled bronze, always visible). Height 56 px desktop / 52 px mobile; respects safe-area insets |
| **Bottom tour bar** | Prev · stop title (n / 10) · Next · Map · Explore. On mobile it merges with the caption card as a bottom sheet (peek 30% / expanded 85%) |
| **Caption card** | Room name (Archivo), Plain sentence, Technical line (mono), "Look beneath" button, plaque row (status / role / evidence) |
| **Status chips** | Mono `xs` uppercase; outline + tinted text, never colour alone. Always include words: LIVE · PRE-LAUNCH · CONCEPT · TEAM PROJECT · SELF-REPORTED |
| **Hotspots** | DOM buttons anchored to 3D positions: a 44 × 44 px circle with a bronze ring, label on focus or hover, numbered in tab order |
| **Map overlay** | Full-screen plan and section line drawing (1 px bronze on charcoal); rooms are buttons; "You are here" pulses gently (static on reduced motion) |
| **Contact panel / sheet** | Intent chips (Employment / Freelance / Collaboration) → form (name, email, message, optional link) → submit. Email shown as copyable text with a Copy button. CV + profile links |
| **Loader** | A single bronze line that draws across the bottom with the room name, and a "Skip to Quick View" link. No spinners, no percentage theatre beyond a simple percentage |

## 6. Iconography

- 24 px grid, 1.5 px stroke, square caps and joins, geometric. Drawn to match the 1.2 m module logic (a 3 × 3 sub-grid).
- **Set:** map, play/pause tour, next, previous, look-beneath (a square split by a horizontal seam), plain/technical (paragraph / brackets), quick view (a single column of lines), contact (an open door frame), CV (document with a seam), GitHub (official mark, per brand rules), external link, sound on/off, reduced motion, close, back.
- Never icon-only for primary actions: Contact and Quick View always have text labels.

## 7. Motion principles

1. **Mass moves slowly; light moves quickly.** Stone and bronze use long, damped motion. Light and UI respond fast.
2. **Every motion reveals or orients.** No decorative loops.
3. **Settle, don't bounce.** No overshoot springs on architecture.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `ui-fast` | 160 ms | ease-out `cubic-bezier(.2,.7,.2,1)` | Hover, focus, chips |
| `ui` | 240 ms | same | Panels, sheets |
| `reveal` | 900–1200 ms | `cubic-bezier(.65,0,.35,1)` | Look beneath strata |
| `camera` | 1600–2400 ms | Spline with ease-in-out; max angular velocity capped | Tour flights |
| `seam` | 600 ms | ease-in-out | Wordmark seam, sculpture glow |
| `fade-cut` | 300 ms | linear | All reduced-motion transitions |

## 8. Transition behaviour

- **Room-to-room:** a camera flight through the threshold. The UI dims to 60% during flight and the caption card swaps at the dog-leg.
- **Reveal:**
  - the housing separates along seams;
  - seam light brightens first (150 ms);
  - stratum labels appear after the motion settles, never mid-motion.
- **Panel:** slides from the right on desktop, from the bottom on mobile; focus moves into the panel; Esc and back close it.

## 9. Loading states

| State | What shows |
|---|---|
| First paint | Poster still + DOM intro + three buttons (no waiting) |
| 3D loading | Bronze line progress + room name + "Skip to Quick View" |
| Next room not ready | Flight pauses at the threshold dog-leg with its plaque visible; the line progresses there |
| Slow network (> 8 s) | Message: "Taking a while on this connection. The Quick View has everything at a glance." + button |

## 10. Sound-design direction

**Off by default.** A clear toggle; never autoplay.
- **Room tones:** low, warm stone-hall ambience, with slight reverb differences per room. The Foundations are drier; the Court has a long tail.
- **Reveal:** a soft machined bronze slide plus one low resonant tone. No sci-fi whooshes.
- **Tokens:** quiet ceramic-metal clicks.
- **Accra vitrine:** a distant, gentle city ambience, from CC0 field recordings only, with licences logged.
- **Volume ceiling:** −18 LUFS integrated. Every sound is non-essential: no information lives only in audio.

## 11. Accessibility

Target WCAG 2.2 AA for all DOM.
- Contrast ≥ 4.5:1 for text and ≥ 3:1 for UI components.
- Targets ≥ 24 px (WCAG minimum); **44 px** used for primary controls.
- Focus is always visible (2 px bronze outline, 2 px offset) and never hidden under the top or bottom bars (WCAG 2.2 "Focus Not Obscured").
- Full keyboard support; logical tab order; skip link to "Quick View content".
- The canvas is `aria-hidden`; each room's DOM mirror carries the content.
- `prefers-reduced-motion` → cut transitions, no idle motion, the wordmark seam stays static. A manual toggle overrides the OS setting in both directions.
- `prefers-contrast: more` → solid panels, no translucency, thicker hairlines.
- No content conveyed by colour alone (chips carry words).
- Text resizes to 200% without loss in Quick View.

## 12. Error and fallback states

Copy is written to be specific and calm.

| Situation | Behaviour and copy |
|---|---|
| WebGL unavailable | Go to Quick View. "This device can't show the 3D museum, so here's everything at a glance." |
| WebGL context lost | One silent restore attempt; then: "The 3D view stopped responding. Continue in Quick View, or try again." [Try again] [Quick View] |
| Room failed to load | Stay in the current room. "The FlowDesk room didn't load. Read its case study instead." [Case study] [Retry] |
| Low tier detected | No message; quality adapts silently. A settings menu shows the current quality, adjustable |
| Contact form failure | "Your message wasn't sent. Please email {address} directly." The address is copyable; the form content is kept |
| No JavaScript | The Quick View HTML renders fully (static) |
