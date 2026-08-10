# J-Planet mobile agent entry design

Date: 2026-08-10  
Status: approved design

## Goal

Keep the current SAZO-style mobile home hierarchy and product discovery density, while making J-Planet's differentiator—the cross-border purchasing agent—obvious at the two highest-frequency entry points.

## Scope

This change affects the mobile home experience only:

1. The search pill above the shortcut grid becomes an AI-agent entry.
2. The third item in the fixed mobile bottom navigation changes from `検索` to `エージェント`.
3. Both entry points open the same J-Planet AI composer sheet.

The category grid, hero, introduction, reviews, gift-fair sections, GRAM, 31-item PICK grid, footer, product detail, cart, checkout, and desktop home remain structurally unchanged.

## Visual design

### Home agent entry

- Preserve the existing 416 × 50 px pill at a 440 px viewport so the SAZO reproduction geometry does not move.
- Replace the search-only treatment with a sparkle icon, a compact sakura `AI` badge, and the prompt `URL・画像・商品名をAIに相談`.
- Add a small image-add affordance at the trailing edge.
- Keep the white surface, navy text, thin neutral border, and restrained shadow.

### Bottom navigation

- Replace the magnifying-glass icon with a sparkle/agent icon.
- Replace the label `検索` with `エージェント`.
- Opening the sheet marks the item active in sakura pink, matching the existing active-navigation treatment.
- The other four items and the fixed 76 px navigation geometry remain unchanged.

### Agent composer sheet

- Open as a modal bottom sheet above the fixed navigation with a dimmed backdrop.
- Use a white sheet with 24 px top corners, navy typography, and sakura action color.
- Header: J-Planet sakura mark, `J-Planet AIエージェント`, a short Japan-to-Brazil purchase explanation, and a close button.
- Input supports free text or a pasted URL.
- Provide three explicit capability chips: `URLを貼る`, `画像を追加`, and `商品名で相談`.
- Primary action: `AIに探してもらう`.
- Empty submission stays disabled. Selecting an image shows its filename in the composer.
- In this mock, submitting closes the sheet and opens the existing catalog results screen. No AI backend or checkout behavior is introduced.

## Architecture

### Shared state

- Extend `SazoOverlay` with `agent`.
- Add an `open-agent` reducer action.
- Continue using the existing `close-overlay` action for backdrop, close-button, and Escape handling.
- Navigation keeps closing overlays through the existing reducer behavior.

### Components

- `MobileDiscoveryTop` receives `dispatch` and opens the agent overlay.
- `SazoShell` renders the bottom-navigation agent control and opens the same overlay.
- A new isolated `AgentComposerSheet` owns only transient draft text, selected filename, file input, and submit behavior.
- `SazoCommercePage` renders the sheet when `state.overlay === "agent"`.

This keeps the home sections independent from the modal implementation and provides one consistent agent entry regardless of where the user taps.

## Interaction and accessibility

- The sheet uses `role="dialog"`, `aria-modal="true"`, and an explicit accessible name.
- Opening moves focus to the composer.
- Escape, close button, or backdrop closes the sheet.
- The close action returns focus to the triggering control when possible.
- The hidden file input accepts images only.
- Motion uses the existing reduced-motion behavior and a short bottom-sheet transition.

## Test requirements

1. Reducer test: `open-agent` sets the overlay and `close-overlay` clears it.
2. Mobile home test: the agent prompt exists and opens the shared dialog.
3. Mobile shell test: five navigation items remain, the third is `エージェント`, and it opens the dialog.
4. Composer test: empty submit is disabled; text or an image enables it; submit opens the catalog.
5. Mobile E2E: both the home entry and bottom-navigation entry open the same dialog.
6. Visual regression capture: 440 × 956 and 341 × 735 have no horizontal overflow; desktop remains on its current branch.

## Non-goals

- Calling an AI model or purchasing API.
- Changing PRC-dependent product detail, cart, or checkout content.
- Replacing the existing catalog result fixtures.
- Redesigning the desktop search bar in this iteration.
