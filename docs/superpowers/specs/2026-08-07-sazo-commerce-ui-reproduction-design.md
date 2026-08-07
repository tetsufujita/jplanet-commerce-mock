# SAZO Commerce UI Recording Reproduction Design

**Date:** 2026-08-07  
**Status:** approved in conversation; pending written-spec review  
**Owner:** Codex  
**Implementation target:** isolated `Andes-Website` worktree, route `/sazo-commerce-mock`

## 1. Objective

Reproduce the commerce UI and interaction states visible in the two supplied SAZO screen recordings as a local, responsive React mock. The recordings—not the live SAZO website—are the visual and behavioral source of truth.

- [sir-decided] The first version retains the SAZO logo, Japanese copy, layout, products, and interaction patterns visible in the recordings.
- [sir-decided] Visual placement, typography, reactions, transitions, loading states, and animations are in scope.
- [sir-decided] Completion requires a record-and-compare loop rather than a one-time visual review.
- [inferred] The mock reproduces the flows visible in the recordings; it does not attempt to implement unseen checkout, payment, fulfillment, or backend behavior.

## 2. Sources and Fidelity Boundary

| Source | Verified properties | Purpose |
|---|---|---|
| `/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.24.01.mov` | [verified] 3022×1656, 448.230 seconds, H.264 | Desktop layout, scrolling, navigation, drawers/modals, chat, and content states |
| `/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.31.56.mov` | [verified] 682×1470, 211.957 seconds, H.264 | Mobile layout, bottom navigation, responsive lists/grids, authentication, account screens |

[missing] Original logos, banner art, product images, fonts, and source CSS are not provided. When an asset cannot be recovered at a useful resolution, the captured recording pixels are the authoritative reference. Fidelity is evaluated at the recorded viewport sizes first, with intermediate breakpoints required to remain coherent and usable.

## 3. Approach

Use a recording-driven, high-fidelity React implementation rather than screenshot hotspots or a generalized commerce platform.

1. Build semantic React components for repeated UI structures.
2. Store products, reviews, rankings, brands, categories, and account values in local typed fixtures.
3. Represent route and overlay behavior with a deterministic mock state model.
4. Use CSS and Motion only where the recording shows movement.
5. Drive the same paths with Playwright, record them, extract checkpoint frames, and compare them with the reference recordings.

This preserves responsive behavior and interaction quality while allowing pixel-level correction.

## 4. Scope

### 4.1 Global shell

- Desktop header: SAZO wordmark, URL/search field, action icons, login button, locale indicator, and secondary navigation.
- Mobile header: SAZO wordmark, locale, search, cart, and horizontally scrollable secondary navigation.
- Desktop footer and mobile legal/footer blocks visible in the recordings.
- Floating chat launcher on all relevant screens.
- Mobile fixed bottom navigation with active state.
- Responsive breakpoint that switches between the recorded desktop and mobile shells.

### 4.2 Home and discovery

- Hero/banner carousel with neighboring slide visibility, arrows, counter, pause control, and timed movement.
- Search field positioned over or below the hero according to viewport.
- Five quick-category icons and labels.
- Introductory SAZO section and first-use callout.
- Community review strip and review recommendations.
- SAZO GRAM masonry/grid content.
- SAZO PICK, ranking, popular keyword, and product-card sections shown in the recordings.
- Loading placeholders and centered SAZO loading mark during transitions.

### 4.3 Navigation and catalog

- Service introduction page sections visible in the desktop recording, including URL-entry explanation, step cards, trust section, FAQ, and support/footer.
- Popular-brand directory with brand rows, preview images, and save/bookmark controls.
- Two-column category navigator and category drill-down.
- Category product listing in list and grid modes.
- Horizontal subcategory tabs and filter chips.
- Ranking period/type controls and product grid.
- Review category controls and content grid.
- Product-card overlays, price treatment, discount labels, badges, and truncation behavior visible in the sources.

### 4.4 Authentication and account

- Login/register modal or full-screen sheet appropriate to viewport.
- Google, Apple, and email continuation controls as deterministic mock actions.
- Date-of-birth and phone-number registration screens.
- Country-code selector state shown in the mobile recording.
- My Page overview, order entry, favorites, coupons, points, review links, and profile entry.
- Favorites empty state and tab/filter controls.
- Member-information edit form and card-management empty state.
- No real OAuth, account creation, payment-card storage, or personal-data persistence.

### 4.5 Chat

- Floating launcher open/close animation.
- Desktop side panel and mobile-sized chat surface visible in the recordings.
- Initial loading/empty state and fixed chat navigation treatment.
- Local-only mock state; no external messaging service.

## 5. Architecture

```text
/sazo-commerce-mock
  → responsive app shell
  → route/state controller
     ├─ home/discovery views
     ├─ catalog/directory views
     ├─ service/review views
     ├─ authentication/account views
     └─ global overlays: chat, login, loaders
  → typed fixture catalog and timeline scenarios
  → deterministic animations and timers
```

The feature lives under a new `src/sazo-commerce/` boundary. It may add one route to the existing app router, but it does not refactor or replace the current Andes website. Styles are namespaced below a `.sazo-root` class to prevent leakage into existing pages.

## 6. State and Data Flow

- The browser path selects the principal mock view.
- Local fixture modules supply all visible text and cards.
- User actions update a small UI state store containing active carousel index, selected tab, list/grid mode, open overlay, authentication step, and chat state.
- Navigation and overlay transitions are deterministic so Playwright can reproduce the same recording on every run.
- Timers are centralized and can be disabled or advanced in tests.
- A scenario query parameter selects desktop and mobile QA timelines without exposing a production dependency.

## 7. Motion and Interaction Rules

- Match observed durations and easing by measuring frame-to-frame change in the reference videos.
- Use opacity/translation only when visible in the recordings; avoid decorative motion not present in the source.
- Preserve sticky/fixed behavior for headers, bottom navigation, and chat controls.
- Match hover, pressed, selected, paused, loading, and modal-backdrop states.
- Support `prefers-reduced-motion`; QA recordings run with full motion enabled.
- Keep all scripted interactions keyboard operable and retain visible focus states without disturbing recorded pointer states.

## 8. Asset Strategy

- Extract reference frames and required visual crops from the supplied recordings into a feature-local reference/asset folder.
- Rebuild icons as Lucide/CSS/SVG only when they match the recording closely; otherwise use a locally prepared crop.
- Use local assets only during playback so network speed cannot change the recording.
- Do not fetch or depend on the live SAZO site.
- Optimize delivery copies separately from untouched QA reference frames.

## 9. Error and Edge-State Handling

- Unknown mock routes redirect to the mock home, not the Andes corporate home.
- Missing fixture images render a fixed-ratio neutral placeholder matching the captured skeleton treatment.
- Authentication buttons never contact external providers; they advance to the corresponding mock step.
- Empty favorites and empty card-management states are explicit fixtures.
- All timers and overlays clean up on navigation to avoid nondeterministic recordings.
- The mock remains usable at widths between the two reference viewports even though pixel scoring is performed at the recorded sizes.

## 10. Testing and Visual Verification

### 10.1 Functional tests

- Unit tests cover state transitions, route mapping, carousel controls, tab/filter selection, login progression, list/grid switching, and chat open/close behavior.
- Accessibility-oriented assertions cover semantic buttons, labels, focus movement, Escape handling, and reduced-motion behavior.
- Tests use real components and local fixtures; external network calls are prohibited.

### 10.2 Recording loop

1. Record the desktop scenario at 3022×1656.
2. Record the mobile scenario at 682×1470.
3. Extract frames at named interaction checkpoints and additional fixed time intervals.
4. Align each produced frame to its source checkpoint.
5. Calculate pixel difference and produce side-by-side/difference images.
6. Inspect mismatches by region: shell, typography, spacing, image crop, color, and motion timing.
7. Fix the largest mismatch, rerun tests, and record again.
8. Repeat until remaining differences are attributable only to unrecoverable source compression, cursor position, or platform text rasterization.

### 10.3 Completion evidence

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Playwright desktop and mobile scenario runs
- Final desktop and mobile recordings
- Checkpoint comparison report with remaining known differences

## 11. Deliverables

- High-fidelity mock route at `/sazo-commerce-mock` in an isolated worktree.
- Feature-local assets and typed fixtures.
- Automated functional and visual scenario tests.
- Desktop and mobile QA recordings.
- Frame comparison artifacts and final fidelity report.
- A concise handoff describing how to run, record, and inspect the mock.

## 12. Explicit Non-Goals

- Recreating parts of SAZO that are not visible in either recording.
- Connecting to the live SAZO website or copying its backend behavior.
- Real search, payment, ordering, delivery tracking, OAuth, or personal-data storage.
- Rebranding to J-Planet in this first reproduction pass.
- Refactoring unrelated Andes corporate pages or committing existing unrelated working-tree changes.

