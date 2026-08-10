# Responsive Bottom Navigation Restoration

Date: 2026-08-10
Status: approved in conversation

## Goal

Restore the persistent five-item bottom navigation shown in the supplied SAZO mobile recording when the J-Planet mock is viewed in the current in-app browser width, without changing the existing desktop layout.

## Reference behavior

- The bottom navigation remains fixed while the page scrolls.
- It spans the viewport, has rounded upper corners, and visually floats above page content.
- The floating chat control overlaps the navigation's upper-right edge.
- The five destinations remain visible and evenly distributed.

## Approved J-Planet adaptation

- Items: `ホーム / 通知 / エージェント / お気に入り / マイページ`.
- Keep `エージェント` in the center instead of reverting to SAZO's `検索`.
- Preserve the existing selected-state behavior and J-Planet colors.
- Show the fixed navigation through `899px` viewport width so it remains visible at the current `822px` in-app browser width.
- Keep the existing desktop-only layout at `900px` and wider.
- Restore the floating chat control on the home view and position it above/over the navigation without covering any navigation target.
- Keep service, campaign, and product-view exceptions already defined by the mock unless a regression test proves they conflict with the reference behavior.

## Implementation boundary

- Prefer CSS-only responsive restoration because the navigation already exists in `SazoShell` and uses the correct actions.
- At `768px–899px`, expose only the mobile navigation portion of the mobile shell; do not duplicate the mobile header, footer, or main content alongside the desktop shell.
- At `767px` and below, retain the existing mobile layout and adjust only home chat visibility/placement.
- Add deterministic tests for the breakpoint contract, fixed positioning, item count, chat placement, and document overflow.

## Acceptance criteria

1. At `822px`, the five-item navigation is visible, fixed to the bottom, and has the approved labels.
2. At `440px` and `341px`, the navigation remains visible and unchanged in function.
3. The chat control is visible above the home navigation and does not obscure a navigation button.
4. At `900px` and wider, no bottom navigation is rendered visually.
5. There is no horizontal document overflow or duplicated header/footer.
6. Existing agent-hub navigation and AI composer flows continue to pass.

## Verification

- Unit/layout-contract tests for responsive shell behavior.
- Playwright checks at `822px`, `440px`, `341px`, and desktop width.
- Fresh screenshots of the home bottom navigation at `822px` and `440px`.
- Full lint, typecheck, unit, build, and SAZO reproduction E2E gates.
