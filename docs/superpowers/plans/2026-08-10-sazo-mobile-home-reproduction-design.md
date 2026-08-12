# SAZO Mobile Home Reproduction Design

## Objective

Reproduce the captured SAZO mobile-web home as the mobile baseline for the J-Planet mock. Keep the J-Planet logo and theme, but match the captured mobile composition, density, spacing, fixed navigation, carousel timing, and scrolling behavior before adding the AI-agent touchpoint.

## Approved Scope

- Mobile home only.
- Primary reference viewport: 440 × 956 CSS pixels (1320 × 2868 recording at DPR 3).
- Secondary regression viewport: 341 × 735 CSS pixels.
- Product detail, cart, checkout, and PRC-dependent content are unchanged.
- Desktop home remains unchanged.
- Phase 1 keeps the captured search wording and behavior as a SAZO-style baseline. AI URL/image/name entry is a later controlled change.

## Reference Material

- `/Users/fujitatetsu/Downloads/ScreenRecording_08-10-2026 02-30-04_1.MP4`
- `/Users/fujitatetsu/Downloads/IMG_8623.PNG` through `/Users/fujitatetsu/Downloads/IMG_8639.PNG`

The recording is 80.515 seconds, HEVC, 1320 × 2868, approximately 60 fps.

## Mobile Composition

1. Sticky primary header: J-Planet wordmark on the left and cart on the right.
2. Top-only search pill: full-width prompt below the header.
3. Two-row shortcut grid: five columns and ten shortcuts.
4. Full-bleed 2:1 hero carousel with five-second automatic progression, dots, and a compact counter.
5. Intro block: two-line headline, body copy, and beginner-guide button.
6. Horizontal customer-review strip.
7. Four two-card editorial rows under `MY GIFT FAIR` headings.
8. Two-column `J-Planet GRAM` editorial cards with linked product summaries.
9. Two-column `J-Planet's PICK` ranked product grid with corner rank badges.
10. Footer and support panel.
11. Fixed five-item bottom navigation with safe-area padding.

## Visual Contracts

- Mobile primary header height: 84 px; wordmark width: 108 px; cart icon: 30 px.
- Search pill: 416 × 50 px at the 440 px reference viewport, 12 px side margin, 25 px radius.
- Shortcut grid: five equal columns; icon tile 56 px; two rows.
- Hero: full viewport width, approximately 215 px tall, no rounded outer corners.
- Page content margins: 16-20 px depending on section.
- Ranked catalog: two equal columns with 12 px gutter.
- Bottom navigation: minimum 72 px plus `env(safe-area-inset-bottom)`.
- Primary text: J-Planet navy; active/accent: sakura pink; surface: white.
- Mobile section headings use compact Japanese sans-serif with approximately 24 px size and 1.25 line height.

## Responsive Behavior

- Below 768 px, render the mobile composition and hide desktop-only home sections.
- At 768 px and above, preserve the existing desktop composition.
- Sticky header remains visible while search, shortcuts, and banner scroll away.
- Bottom navigation remains fixed throughout the home scroll.
- Horizontal review/editorial strips use native touch scrolling with snap points.

## Verification

- Unit tests cover mobile section inventory and order, ten shortcuts, ranked grid inventory, and shell controls.
- Browser capture runs at 440 × 956 and 341 × 735.
- Compare the 440 × 956 top viewport to `IMG_8623.PNG` after excluding the iOS/Chrome status region.
- Compare scroll checkpoints for reviews, editorial rows, GRAM, ranked products, and footer against `IMG_8624.PNG`–`IMG_8639.PNG`.

