---
name: Ethos News
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#410002'
  on-tertiary-container: '#ef453c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  metadata:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 64px
---

## Brand & Style

The design system is built on a foundation of **Minimalism** and **High-Contrast Editorial** design. It targets a modern audience seeking clarity, speed, and authority in regional reporting. The aesthetic prioritizes "content as interface," where the news itself provides the visual texture. 

The emotional response should be one of immediate trust and intellectual calm. By stripping away non-functional decorative elements and utilizing a stark color contrast, the UI recedes to allow high-fidelity photography and bold typography to command attention. The style mimics the precision of a high-end broadsheet newspaper reimagined for a fluid digital experience.

## Colors

The palette is intentionally restricted to maintain an authoritative editorial feel.

*   **Background (#FAFAFA):** A slightly "off-white" paper-like surface that reduces eye strain compared to pure white.
*   **Primary Text (#1A1A1A):** Deep charcoal used for headlines and body copy to ensure maximum legibility and high contrast.
*   **Secondary Text (#666666):** Used for metadata, captions, and secondary labels to create a clear visual hierarchy.
*   **Accent (#B91C1C):** A deep "News Red" reserved strictly for breaking news alerts, category tags, and critical interactive indicators. It acts as the primary "wayfinding" color in a monochromatic environment.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic and utilitarian look that remains highly readable at all scales.

The hierarchy relies on heavy weight variances. **Display** and **Headline** levels use tight tracking and bold weights to ground the page. **Body** copy utilizes a generous 1.6 line-height to facilitate long-form reading. **Label-caps** are used for categories (e.g., "POLITICS", "SPORTS") to distinguish them from content headlines. 

For mobile, headlines scale down to prevent excessive line-breaking, while body text remains consistent to preserve accessibility.

## Layout & Spacing

The layout follows a **Fixed-Width Centered Grid** on desktop (1280px max) and a **Fluid Grid** on mobile devices.

*   **Desktop:** 12-column grid with 24px gutters. Sidebars should occupy 3 or 4 columns, while main news feeds occupy 8 or 9.
*   **Mobile:** Single column with 16px side margins. 
*   **Rhythm:** Vertical spacing uses a base-4 scale. Large sections (e.g., between "Top Stories" and "Local News") are separated by a 64px gap to ensure the "generous whitespace" requirement.
*   **Sticky Elements:** The primary navigation bar is sticky with a subtle bottom border (`1px solid #E5E5E5`) appearing only upon scroll.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

*   **Flat Surface:** Elements sit directly on the #FAFAFA background. Depth is communicated via hair-line borders (`1px`) in a light gray (#E5E5E5).
*   **Interactive Depth:** Hovering over a news card does not lift it; instead, it triggers a subtle opacity shift (0.8) on the image or a color change in the headline. 
*   **Sticky Nav:** Uses a `backdrop-filter: blur(8px)` with a semi-transparent background (`rgba(250, 250, 250, 0.9)`) to maintain context while scrolling.

## Shapes

The design system employs a **Sharp (0px)** corner radius for all UI elements. 

This decision reinforces the editorial, "hard-news" aesthetic. Images, buttons, input fields, and containers must all have 90-degree angles. This geometric rigidity creates a structural, grid-like appearance that feels professional and uncompromising.

## Components

*   **News Cards:** Vertical or horizontal layouts. Images must have a 16:9 or 4:3 aspect ratio. Headlines are `headline-md`, metadata is placed below in `metadata` style. No cards have shadows; they are separated by white space or a 1px divider.
*   **Buttons:** Primary buttons are solid `#1A1A1A` with `#FAFAFA` text, sharp corners. Secondary buttons are ghost-style with a 1px border. 
*   **Breaking News Ticker:** A full-width bar using `#B91C1C` background and `label-caps` white text. 
*   **Input Fields:** Minimalist design with only a bottom-border (`1px solid #1A1A1A`). Label sits above in `label-caps`.
*   **Chips/Tags:** Small, sharp-edged boxes with a `#F0F0F0` background. Used for article keywords.
*   **Lists (Sidebar):** Numbered or bulleted lists using `#B91C1C` for the indicators to draw the eye to "Trending" or "Latest" updates.
*   **Interactive States:** Transitions should be instant or very fast (150ms). Use `opacity` shifts for hover states on images and `text-decoration: underline` for headline hovers.