# J-Planet home search callout arrow fidelity design

**Date:** 2026-08-08  
**Status:** User-approved approach; written spec pending final review  
**Reference:** `スクリーンショット 2026-08-08 18.17.13.png`  
**Current:** `スクリーンショット 2026-08-08 18.17.21.png`

## Goal

Reproduce the reference search callout's geometry and visual rhythm while retaining the established J-Planet brand palette. The highest-priority defect is the current angular CSS-border arrow, which must become a smooth hand-drawn curve aimed naturally at the search icon.

## Scope

Change only the home `SearchDiscovery` callout:

- heading spacing and reference-aligned vertical rhythm;
- rounded search field height and padding;
- J-Planet sakura search button with a right-arrow icon;
- dedicated decorative SVG guidance arrow;
- two-line guidance copy beneath the field;
- desktop and mobile regression checks.

Do not change global typography, other search surfaces, product cards, navigation, or the J-Planet color system.

## Visual design

### Guidance arrow

- Replace both CSS-border pseudo-elements with one decorative inline SVG.
- Draw the body as a smooth cubic Bezier curve: it begins near the guidance copy, curves left and upward, and terminates beside the search magnifier without touching it.
- Draw the arrowhead as a second open path aligned to the body's tangent, matching the loose hand-drawn character of the reference.
- Use `fill="none"`, round caps, round joins, and a stroke width visually equivalent to about `3px` at desktop size.
- Use the J-Planet navy/ink token rather than SAZO black.
- Mark the SVG `aria-hidden="true"` and non-interactive.
- Hide the decorative arrow at the existing mobile breakpoint, preserving the current compact mobile behavior and preventing overflow.

### Search field and button

- Keep the callout width at `640px` on desktop.
- Increase the field and button slightly toward the reference proportions: approximately `82px` field height and `64px` button height.
- Keep the search icon and placeholder aligned on one baseline.
- Use the J-Planet sakura token for the button and add an `ArrowRight` icon after the search label.
- Preserve visible keyboard focus and the existing button semantics.

### Heading and guidance copy

- Preserve the explicit two-line heading.
- Reduce the overly tight CTA-specific letter spacing without changing global headings.
- Constrain the guidance copy so it renders as exactly two lines on desktop:
  - `欲しい商品の「名前」か`
  - `「URL」をここに入力！`
- Position the copy to the right of the arrow's lower curve as in the reference.
- On mobile, allow natural responsive wrapping without the decorative arrow and without horizontal page overflow.

## Implementation boundaries

- `src/sazo-commerce/HomeView.tsx`: add the decorative SVG and button `ArrowRight`; provide an explicit line-break opportunity for the guidance copy without changing its spoken text.
- `src/sazo-commerce/sazo.css`: remove the old pseudo-element arrow, style the SVG and CTA-only geometry, and retain mobile containment.
- Locale files remain unchanged unless the existing translated string cannot preserve identical accessible text.
- Tests and browser QA must target observable DOM, computed geometry, and SVG presence; they must not duplicate implementation internals unnecessarily.

## Accessibility

- The guidance SVG and button arrow icon are decorative and hidden from assistive technology.
- The search button retains one accessible name: `検索`.
- Heading order and search landmark remain unchanged.
- No new focusable elements are introduced.

## Verification and acceptance

Desktop at the existing reference viewport must verify:

- one dedicated guidance SVG and no CSS-border pseudo-arrow;
- SVG path with round line caps/joins and bounds contained by the callout;
- arrow tip terminates adjacent to the magnifier;
- heading remains two lines;
- callout width `640px`, field near `82px`, button near `64px`;
- button contains a decorative right-arrow icon and resolves to J-Planet sakura;
- guidance copy renders in exactly two lines at the intended position;
- no overlap between arrow, copy, search field, or button.

Mobile at `390px` and `320px` must verify:

- the decorative guidance SVG is hidden;
- the callout, field, button, and copy fit without page-level horizontal overflow;
- the search button remains at least `44px` tall.

Run the focused home unit tests, home browser QA, lint, typecheck, formatting, full tests, build, and final screenshot comparison against both supplied images.

## Out of scope

- Recoloring the entire callout to SAZO pink/black.
- Replacing the shared site font.
- Changing search behavior or navigation.
- Altering sections outside `SearchDiscovery`.
