---
name: Ars Fabula
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f1eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#57423f'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0e9'
  outline: '#8b716e'
  outline-variant: '#dec0bb'
  surface-tint: '#a6392f'
  primary: '#6b0d0a'
  on-primary: '#ffffff'
  primary-container: '#8b261e'
  on-primary-container: '#ffa396'
  inverse-primary: '#ffb4aa'
  secondary: '#7c5715'
  on-secondary: '#ffffff'
  secondary-container: '#ffcc7f'
  on-secondary-container: '#795512'
  tertiary: '#253738'
  on-tertiary: '#ffffff'
  tertiary-container: '#3b4e4f'
  on-tertiary-container: '#aabfbf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#85221b'
  secondary-fixed: '#ffddaf'
  secondary-fixed-dim: '#f0be72'
  on-secondary-fixed: '#281800'
  on-secondary-fixed-variant: '#614000'
  tertiary-fixed: '#d2e6e7'
  tertiary-fixed-dim: '#b6cacb'
  on-tertiary-fixed: '#0b1e1f'
  on-tertiary-fixed-variant: '#374a4b'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
typography:
  display-lg:
    fontFamily: ebGaramond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: ebGaramond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: ebGaramond
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: ebGaramond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: sourceSerifFour
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: sourceSerifFour
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: hankenGrotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is rooted in **Scholarly Hermeticism**. It bridges the gap between a 13th-century illuminated manuscript and a Renaissance-era scientific treatise. The UI should feel like a private, enchanted grimoire: authoritative, focused, and deeply immersive.

The aesthetic direction is **Tactile Minimalism**. It avoids the clutter of traditional "skeuomorphic" fantasy interfaces in favor of high-quality digital craftsmanship. We utilize "Digital Parchment"—not through distracting photo-textures, but through subtle grain, nuanced color layering, and precise typography. The emotional response is one of quiet contemplation, intellectual rigor, and the weight of ancient secrets.

## Colors

The palette is derived from historical medieval pigments.
- **Primary (Cinnabar Red):** Used sparingly for critical actions, important highlights, and rubrication.
- **Secondary (Aged Gold):** Used for decorative accents, active states, and signifying rarity or value.
- **Neutral (Parchment):** The foundation. We use a multi-tiered parchment system: a base "Deep Parchment" for the background and "Fresh Vellum" for elevated cards or surfaces.
- **Ink (Iron-Gall):** A near-black with a slight brown-blue undertone, ensuring text feels etched rather than rendered.

The default mode is **Light**, mimicking the physical page.

## Typography

This design system employs a hierarchical typographic structure that mimics historical typesetting.
- **Headings:** Use **EB Garamond**. These should feel like hand-set metal type. Titles use "Rubrication" (Cinnabar Red) for emphasis.
- **Body:** Use **Source Serif 4**. This provides a sturdy, academic readability that handles long-form campaign notes and spell descriptions with ease.
- **Functional Labels:** Use **Hanken Grotesk**. For metadata, UI controls, and small technical details, a clean sans-serif provides the necessary modern utility without breaking the immersion.

Vertical rhythm is maintained through a strict baseline grid to simulate the ruled lines of a manuscript.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model inspired by classic book design. Content is centered within generous "Manuscript Margins" to focus the eye.

- **Grid:** A 12-column grid is used for complex dashboards (like Covenant management), while single-column layouts are preferred for character sheets and lore entries.
- **Rhythm:** We use an 8px square grid for component internal spacing, but layout-level spacing utilizes 24px and 48px increments to maintain a spacious, scholarly feel.
- **Responsive:** On mobile, margins shrink, and the layout collapses to a single column, but the "Display" type remains prominent to maintain the brand's authoritative voice.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Surface Tiers:** The background is the "Deep Parchment." Interactive cards use a slightly lighter "Fresh Vellum" tint.
- **Borders:** We use "Iron-Gall" ink borders (0.5px to 1px) with low opacity (15-20%) to define containers.
- **Depth:** Active elements or modals use a very soft, high-diffusion shadow (`blur: 20px, opacity: 0.05`) to suggest a page being lifted slightly off the desk.
- **Decorative Accents:** We use double-line borders for primary containers and "Alchemical Corners" (tiny L-shaped glyphs) to anchor important sections.

## Shapes

The shape language is predominantly **Rectilinear**. 
- UI elements use a "Soft" (0.25rem) corner radius. This represents the slightly worn edges of heavy paper or vellum.
- Completely sharp corners are reserved for decorative separators and dividers.
- Circular shapes are strictly reserved for alchemical symbols, progress rings, or character avatars (seals).

## Components

- **Buttons:** Primary buttons are solid "Iron-Gall" with "Aged Gold" text. Secondary buttons use a thin ink border and no fill.
- **Input Fields:** Fields are styled as underlined "ruled lines" rather than enclosed boxes, mimicking a scribe's ledger.
- **Cards:** Cards feature a very subtle grain texture and a 1px inner border in Aged Gold for "Rare" or "Magical" items.
- **Chips/Tags:** These take the form of small "Wax Seals" or parchment snippets with "Label-sm" typography.
- **Checkboxes:** Styled as small hand-drawn squares. When checked, they show a cinnabar red "X" or a flourished checkmark.
- **Lists:** Bullet points are replaced with geometric alchemical symbols (dots, triangles, or mercury signs).
- **Special Component: The Grimoire Header:** A decorative top-bar featuring a centered title flanked by horizontal rules and a small alchemical glyph representing the current section (e.g., a flame for Ignem spells).