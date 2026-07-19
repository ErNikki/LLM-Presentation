---
name: Sotto il Cofano degli LLM
description: A projected, keyboard-driven technical deck explaining how LLMs work — engineering-grade clarity, diagrams as the argument.
colors:
  primary: "#6c5ce7"
  teal: "#0a9d92"
  magenta: "#e84393"
  reward: "#caa11e"
  danger: "#e0395e"
  bg: "#f6f7fb"
  surface-white: "#ffffff"
  surface-tint: "#1416280a"
  border: "#1416281f"
  ink: "#1b1d2b"
  ink-dim: "#4d5165"
  ink-faint: "#646a82"
  on-accent: "#ffffff"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(3rem, 9vw, 7rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 700
    lineHeight: 1.25
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.1rem, 2vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "18px"
  lg: "26px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
  button-ghost:
    backgroundColor: "{colors.surface-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.lg}"
    padding: "26px"
  card-hover:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.lg}"
---

# Design System: Sotto il Cofano degli LLM

## 1. Overview

**Creative North Star: "The Lab Notebook"**

This is a technical deck that explains a machine by drawing it. Findings are laid
out with engineering clarity on a cool, near-white page; ink-dark text carries the
prose, a monospace voice marks the technical asides, and every slide resolves to
one figure that makes a single mechanism visible. The lineage is Distill.pub and
3Blue1Brown (the diagram *is* the explanation) crossed with Stripe/Linear docs
(generous space, restrained accent, hierarchy carried by type). It is shown
projected to a room of technical peers, so it reads from the back row, not just
on a laptop.

The personality is **precise, lucid, unshowy**. Depth comes from sequence —
one idea per slide — not from cramming. Color is used as signal: a cool violet
primary and a teal counter-voice separate the two halves of an idea (supervised
vs. unsupervised, input vs. output), never as decoration for its own sake.
Surfaces are soft-lifted: a quiet stratified shadow at rest, a gentle rise on
hover, so the deck feels physical without feeling like a SaaS landing page.

It explicitly rejects the things that make a deck look generated or templated:
corporate-PowerPoint bullet walls and clip-art, AI-slop SaaS marketing (gradient
text everywhere, identical icon-card grids, tracked uppercase eyebrows on every
slide, decorative glass), flashy motion that competes with the content, and
anything childish or cartoonish.

**Key Characteristics:**
- Cool near-white page (#f6f7fb), ink-dark text, projection-legible contrast.
- One accent as signal (violet primary), one counter-voice (teal); magenta/red reserved for warnings.
- Inter across the whole hierarchy, JetBrains Mono for the technical/label voice.
- Diagrams (hand-built SVG) lead; text annotates.
- Soft-lifted surfaces: quiet shadow at rest, rise on hover.

## 2. Colors

A cool, low-temperature palette: a near-white page, ink neutrals, and a small set
of saturated accents used as signal.

### Primary
- **Signal Violet** (#6c5ce7): The brand's primary voice. Active navigation marker, primary buttons, card hover borders, link/emphasis accent, the violet end of the two-tone diagram language. The ambient page glows (radial washes in the background) are this hue at very low opacity.

### Secondary
- **Diagram Teal** (#0a9d92): The counter-voice. Carries the second half of any two-part idea in diagrams, the `kicker`/eyebrow label color, emphasized `<em>` text, and the live slide counter. Pairs against Signal Violet to separate concepts.

### Tertiary
- **Accent Magenta** (#e84393): Rare third signal, mostly the `--grad-danger` pairing and occasional diagram highlights. Use sparingly.
- **Reward Gold** (#caa11e, dark-on-gold text #8a6d10, fill `--reward-rgb` 245,193,66): The deliberate **4th** diagram signal — "reward / positive / +1" in the RL and transformer figures. The one sanctioned exception to the Two-Voice Rule; it means *reward*, nothing else.
- **Warning Red** (#e0395e): Reserved for genuine warnings, limits, and "what breaks" callouts. Never decorative.

### Neutral
- **Cool Page** (#f6f7fb): The body background. A true cool near-white — not a warm cream — set by a faint violet/teal radial wash, not by tinting the base.
- **Pure Surface** (#ffffff): Card and panel backgrounds, lifted off the page.
- **Surface Tint** (rgba(20,22,40,0.035–0.06)): Inset fills for chips, icon wells, ghost buttons.
- **Border** (rgba(20,22,40,0.12)): Hairline 1px separation on all cards and controls.
- **Ink** (#1b1d2b): Primary text, headings, `<strong>`.
- **Ink Dim** (#4d5165): Body paragraphs.
- **Ink Faint** (#646a82): Captions, footnotes, examples, hints, diagram micro-labels. ~5:1 on the page — projection-legible AA floor; never go lighter for any real copy.

### Channel tokens
For arbitrary-alpha fills, glows, and shadows in diagrams, the brand colors are also exposed as comma-separated RGB channels: `--ink-rgb`, `--accent-rgb`, `--accent-2-rgb`, `--accent-3-rgb`, `--danger-rgb`, `--accent-glow-rgb` (a lighter violet #8b7bff used only for accent glows), and `--reward-rgb`. Use `rgba(var(--accent-rgb), 0.12)` rather than re-typing the literal triplet — that's how the figures stay re-themable from `:root`.

### Named Rules
**The Two-Voice Rule.** Diagrams speak in exactly two hues — Signal Violet and Diagram Teal — to separate the two sides of an idea. A third color in a figure must mean a third thing (Warning Red for failure, Reward Gold for positive/+1), or it doesn't belong.

**The Signal-Not-Decoration Rule.** Color carries meaning. If a fill, glow, or accent isn't distinguishing one concept from another, it's decoration — remove it or make it neutral.

## 3. Typography

**Display / Body Font:** Inter (with system-ui, -apple-system, sans-serif)
**Label / Mono Font:** JetBrains Mono (monospace)

**Character:** One humanist-geometric sans across the whole hierarchy, ranged from light (300) to black (900), with a monospace as the deliberate "technical voice" for labels, counters, and code. The contrast axis is sans-vs-mono, not two similar sans — the pairing is intentional, not accidental. Base is set at 17px so every rem-sized box reads large on a projector.

### Hierarchy
- **Display** (900, clamp(3rem → 7rem), lh 0.95, -0.03em): Cover title only. The one place the deck raises its voice.
- **Headline** (800, clamp(2rem → 3.4rem), lh 1.05, -0.02em): Per-slide `h2`. The argument of the slide.
- **Title** (700, 1.18rem, lh 1.25): `h3` — card and figure headings.
- **Lead** (400, clamp(1.1rem → 1.5rem), lh 1.4, max 60ch): The opening statement under a headline. Light weight, ink-dark, `<strong>` carries emphasis.
- **Body** (400, 1.05rem, lh 1.6): Paragraph copy in ink-dim. Keep to ~65ch.
- **Label** (JetBrains Mono, 500, 0.72rem, +0.06em, uppercase): Tags, the HUD counter, technical micro-labels.

### Named Rules
**The One Display Rule.** The 900-weight display scale appears on the cover and nowhere else. Inside the deck, hierarchy is carried by the headline/lead/body steps — not by making more things huge.

**The Mono-Is-Technical Rule.** JetBrains Mono means "this is a machine artifact" — a count, a tag, a token, code. Never use it for prose just for flavor.

## 4. Elevation

Soft-lifted and layered. Surfaces carry a quiet, stratified shadow at rest and
rise on interaction — the deck feels physical without resorting to heavy drop
shadows or glass. Shadows are warm-neutral (tinted with the ink hue
rgba(20,22,40,…)), never pure black, so they read as soft ambient depth rather
than hard edges. Depth scales with importance: small for cards at rest, large on
hover, and a colored accent glow reserved for the primary action and active nav.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 2px 6px rgba(20,22,40,0.05), 0 1px 2px rgba(20,22,40,0.04)`): Cards and chips at rest.
- **Raised** (`box-shadow: 0 10px 30px -8px rgba(20,22,40,0.12), 0 2px 6px rgba(20,22,40,0.05)`): Branch cards, nav arrows, HUD.
- **Lifted** (`box-shadow: 0 26px 60px -16px rgba(20,22,40,0.20), 0 6px 16px rgba(20,22,40,0.07)`): Card hover state.
- **Accent Glow** (`box-shadow: 0 14px 36px -10px rgba(108,92,231,0.40)`): Primary button and active nav arrow only — the violet halo that marks the live action.

### Named Rules
**The Rise-On-Hover Rule.** Interactive surfaces translate up (−6px cards, −2px buttons) and deepen their shadow on hover. The motion and the shadow change together; one without the other looks broken.

## 5. Components

### Buttons
- **Shape:** Gently rounded (10px radius).
- **Primary:** Violet→teal gradient fill (`--grad`), white text, accent glow shadow, 12px 24px padding. *(Carried as a gradient in the sidecar; the frontmatter token approximates it with the violet primary.)*
- **Hover / Focus:** Lifts −2px and deepens to a stronger violet glow.
- **Ghost:** Surface-tint fill, ink text, 1px border — the secondary action.
- **Disabled:** 40% opacity, no lift, no shadow.

### Chips / Tags
- **Style:** `.tag` — JetBrains Mono, 0.72rem, uppercase, teal text, no background; sits as a label above a heading. The `.kicker` is a pill variant: teal text, 1px border, surface-tint fill, 999px radius.
- **State:** Static labels, not interactive.

### Cards / Containers
- **Corner Style:** Large radius (18px).
- **Background:** Pure white over a subtle top-down gradient to surface-tint; branch cards use flat white.
- **Shadow Strategy:** Resting → Lifted on hover (see Elevation).
- **Border:** 1px hairline border, shifts to Signal Violet on hover.
- **Internal Padding:** 24–26px.

### Inputs / Fields
- None in the deck (it is navigation-only). If added, follow the card surface: white fill, 1px border, violet focus border + soft glow, 10px radius.

### Navigation
- **Nav arrows:** Fixed circular (52px) glass buttons, mid-screen left/right; on hover fill violet with white glyph, scale 1.08, accent glow. Disabled at deck ends (20% opacity).
- **HUD:** Top-right section label + mono slide counter (`n / total`), violet current number.
- **Progress bar:** 3px top bar, violet→teal gradient fill with a soft violet glow, width tracks deck position.
- **Keyboard-first:** ←/→ navigate, Shift+0 opens the overview grid, F fullscreen. The kbd hint and overview are the real nav; the arrows are a mouse affordance.

### Signature Component — Diagram Figures
Hand-built inline SVG figures (class `v`) are the heart of the deck: thin consistent strokes, the two-voice fill language (violet `.fill` / teal `.fill2`), dashed guide lines (`.dash`), rings, and small `+1` reward glyphs for RL. Each figure explains exactly one mechanism. These are the argument of the slide; prose annotates them.

## 6. Do's and Don'ts

### Do:
- **Do** lead each slide with one figure that makes a single mechanism visible; let prose annotate the figure, never the reverse.
- **Do** keep the two-voice color discipline in diagrams: Signal Violet (#6c5ce7) and Diagram Teal (#0a9d92), with a third hue only when it means a third thing.
- **Do** keep contrast projection-safe: ink (#1b1d2b) / ink-dim (#4d5165) on the cool page; never drop body copy to ink-faint (#898ea3).
- **Do** reserve the 900-weight display scale for the cover; carry in-deck hierarchy with headline/lead/body.
- **Do** use JetBrains Mono only for machine artifacts — counts, tags, tokens, code.
- **Do** pair the −6px/−2px hover rise with a shadow change; reserve the violet accent glow for the primary action and active nav.

### Don't:
- **Don't** ship generic corporate-PowerPoint moves — bullet-point walls, clip-art, stock-photo gradients, template chrome.
- **Don't** fall into AI-slop SaaS landing tells: gradient text via `background-clip: text`, identical icon-card grids, tiny tracked uppercase eyebrows above every slide, or decorative glassmorphism. *(The current deck still carries some of these — gradient text on the cover/inline `.grad`, numbered `01 · …` eyebrows, a glass blur token — treat them as debt to retire, not patterns to extend.)*
- **Don't** overstimulate: no motion for its own sake, no neon, no animation that competes with the content. Motion reveals an idea or it's cut.
- **Don't** go childish — no cartoonish illustration, bubbly rounded everything, or emoji.
- **Don't** add color that isn't signal. If a fill or glow doesn't distinguish one concept from another, make it neutral or remove it.
