# Task 6 report: SAZO account and chat flows

## Status

Complete.

## Implemented

- Added the local provider → birthday → phone authentication flow, with a centered desktop modal and full-height mobile sheet.
- Added the exact recorded country-code options (`JP`, `KR`, `CN`, `US`, `TW`, `BN`, `SG`, `DE`, `TH`, `GU`, `RU`), labelled fields, visible focus states, consent control, local-only transitions, and no external provider navigation.
- Added semantic My Page, Favorites, Profile, and Cards views. The captured member values are sourced from the typed local fixture in `src/sazo-commerce/fixtures.ts`.
- Added a Motion chat panel with 220 ms desktop slide-in, 180 ms mobile fade/translate, reduced-motion duration 0, local loading → empty state, and no messaging network calls.
- Added focus traps, Escape/backdrop/close behavior, background `inert`/`aria-hidden`, body scroll locking, cleanup, and launcher focus restoration for both overlays.
- Added Japanese account/auth/chat copy to all three locale files and connected the views and overlays to the existing page reducer.
- Added real-DOM account tests and an installed-Chrome desktop/mobile/reduced-motion QA script.

## Recording and reference review

- Desktop source: `/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.24.01.mov`
- Mobile source: `/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.31.56.mov`
- Reference PNGs: `design/reproductions/sazo-commerce/qa/reference/`
- Compared the provider, birthday, phone, favorites, My Page, profile, and cards frames. The source chat checkpoint does not expose an opened chat surface, so the opened panel follows the explicit Task 6 interaction and motion contract.

## TDD evidence

- RED: `pnpm vitest run tests/unit/sazo-commerce-account.test.tsx` failed because `@/sazo-commerce/AccountViews` did not exist.
- GREEN: the focused account/model suite passes with 31 tests.
- Added regression coverage for provider/birthday/phone transitions, exact country ordering, account fixture values, account empty states, overlay focus/cleanup, local loading/empty behavior, desktop/mobile motion durations, and reduced motion.

## Verification

| Check                                                                                              | Result                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `pnpm vitest run tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-commerce-model.test.ts` | PASS — 31/31                           |
| `pnpm test`                                                                                        | PASS — 88/88 in 9 files                |
| `pnpm typecheck`                                                                                   | PASS                                   |
| `pnpm lint`                                                                                        | PASS                                   |
| `pnpm build`                                                                                       | PASS — 2,214 modules transformed       |
| `pnpm test:sazo-account-browser`                                                                   | PASS — desktop, mobile, reduced motion |
| `pnpm test:sazo-home-browser`                                                                      | PASS — regression                      |
| `pnpm test:sazo-views-browser`                                                                     | PASS — regression                      |
| locale key parity and `git diff --check`                                                           | PASS                                   |

## Self-review and remaining concern

- Named exports, `@/` imports, scoped SAZO CSS, locale-backed user copy, and typed fixtures are preserved.
- No `any`, `console.*`, external provider link, chat fetch, or new hardcoded color was introduced in the Task 6 modules.
- The opened chat panel cannot be pixel-compared to an opened source frame because the supplied recording checkpoint only shows the launcher; its visual and motion behavior is therefore contract-driven rather than direct-frame-driven.

## Fix Round 1

### Review findings resolved

1. Split authentication into two presentation modes. Provider selection remains the only overlay; birthday and phone are normal SAZO auth pages with the recorded header, company/legal footer, and chat launcher. Only the shell/auth-page background wrapper is made `inert` while an overlay is open; `.sazo-root` remains the single CSS scope and is never made inert.
2. Added the review-empty-state CTA, `レビューを見に行く`, in Japanese, English, and Brazilian Portuguese. The CTA dispatches the existing local `reviews` navigation and is covered through the rendered page DOM.
3. Reproduced the profile-specific phone state: `電話番号`, `認証する`, fixed `JP` read-only phone field, `電話番号を認証すると自動で入力されます`, and the exact recorded email/LINE linkage notice. The authentication control is a local state change only.
4. Rebuilt Chrome QA around actual browser motion. It samples computed opacity, DOMMatrix translation, and bounding boxes on every animation frame at the source viewports (3022×1656 desktop and 682×1470 mobile), checks intermediate and settled states for 220 ms/180 ms, and checks immediate reduced motion.
5. Restored every SAZO stylesheet rule under `.sazo-root`, kept overlays inside that root, and limited overlay accessibility effects to `[data-overlay-background="true"]`.

### RED → GREEN evidence

- Auth/page split RED: the birthday step still exposed a dialog and `advance-auth` left `overlay: "login"`; `complete-auth` was unhandled. GREEN: birthday/phone expose normal page landmarks, the overlay closes between provider and page, chat preserves the auth step, and completion enters My Page.
- Favorites RED: the rendered review tab had no `レビューを見に行く` button. GREEN: the rendered CTA reaches `[data-view-content="reviews"]`.
- Profile RED: the old notice and reusable country combobox remained. GREEN: exact notice, phone label/button, fixed JP field, helper, and local pressed state all pass through the real DOM.
- Visual-layout RED: reference-derived assertions caught the unwrapped birthday title and phone label at the wrong vertical position. GREEN: birthday, phone, favorites, profile, and cards meet the source-viewport structural bounds.
- Motion mutation proof: temporarily changing the desktop duration from 220 ms to 100 ms fails on the measured settle-time assertion. Restoring 220 ms passes, demonstrating that QA reads the actual animation rather than metadata.

### Fix Round 1 Chrome artifacts

- `/tmp/sazo-task6-fix-desktop-provider.png`
- `/tmp/sazo-task6-fix-mobile-birthday.png`
- `/tmp/sazo-task6-fix-mobile-phone.png`
- `/tmp/sazo-task6-fix-mobile-favorites.png`
- `/tmp/sazo-task6-fix-mobile-profile.png`
- `/tmp/sazo-task6-fix-mobile-cards.png`
- `/tmp/sazo-task6-fix-mobile-chat.png`

The phone QA also verifies every visible recorded option in order: JP, KR, CN, US, TW, BN, SG, DE, TH, GU, and RU with their displayed calling codes.

### Fix Round 1 verification

| Check                                                                                              | Result                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `pnpm vitest run tests/unit/sazo-commerce-account.test.tsx tests/unit/sazo-commerce-model.test.ts` | PASS — 35/35                           |
| `pnpm test`                                                                                        | PASS — 92/92 in 9 files                |
| `pnpm typecheck`                                                                                   | PASS                                   |
| `pnpm lint`                                                                                        | PASS                                   |
| `pnpm build`                                                                                       | PASS — 2,214 modules transformed       |
| `pnpm test:sazo-account-browser`                                                                   | PASS — desktop, mobile, reduced motion |
| `pnpm test:sazo-home-browser`                                                                      | PASS — regression                      |
| `pnpm test:sazo-views-browser`                                                                     | PASS — regression                      |
| locale key parity, CSS scope audit, and `git diff --check`                                         | PASS                                   |

### Remaining concern

- The provided reference still has no opened-chat frame. Motion is now measured from real computed styles and geometry, but the opened chat surface remains contract-driven rather than pixel-compared to a source frame.
