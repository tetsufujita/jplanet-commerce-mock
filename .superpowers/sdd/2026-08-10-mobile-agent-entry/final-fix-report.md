# Final fix report — J-Planet mobile purchasing-agent entry

Date: 2026-08-10

Fix base: `243df87f5aeb5dd26a91c14406bcc568c415dd0f`

Status: `DONE`

## Changes

| Review finding | Resolution |
| --- | --- |
| Important 1 — 31 PICK images missing from Git and false-positive capture | Added `01.png`–`31.png` to the Git index. Both Playwright and the capture script now require exactly 31 local PICK images, `complete && naturalWidth > 0`, and no failed/non-2xx local PICK requests. |
| Important 2 — keyboard focus escaped and hidden file input was exposed | The dialog now cycles `Tab`/`Shift+Tab` through its own enabled controls, marks `.sazo-shell-background` inert for the modal lifetime, restores the prior inert/body-scroll/focus state on cleanup, and uses a `hidden`, `aria-hidden`, `tabIndex=-1` file input operated by the visible chip. |
| Important 3 — approved sakura/cross-border treatment missing | Replaced the generic header glyph with tracked `/sazo-commerce/jplanet-sakura-mark.png`, added concise Japan purchase-to-Brazil delivery copy, and changed the enabled primary action to `var(--jplanet-sakura)`. |
| Minor 1 — incomplete two-launcher E2E | Mobile E2E opens and closes the shared dialog through the top launcher, then opens it through the bottom navigation and submits to the catalog. Capture now opens the same dialog from the top launcher. |
| Minor 2 — direct interaction gaps | Added direct coverage for initial focus, focus containment, inert cleanup, hidden-input exclusion, focus restoration, Escape, close button, backdrop, visible image chip, filename, and submission. |
| Minor 3 — write-only `dialogRef` | `dialogRef` now owns focusable-element discovery and Tab containment. |
| Minor 4 — unnamed capability cluster | Added `role="group"` with localized accessible name. |
| Minor 5 — i18n/token convention gaps | Moved all new agent UI copy to `sazo.agent.*` in `ja`, `en`, and `pt-BR`; the four binding Japanese strings remain exact. Replaced the new disabled hardcoded hex with `color-mix` using existing tokens. |

## TDD evidence

- Focused RED: `pnpm exec vitest run tests/unit/sazo-commerce-agent.test.tsx tests/unit/sazo-commerce-home.test.tsx tests/unit/sazo-commerce-shell.test.tsx --reporter=dot`
  - Result before production changes: 3 files failed, 9 failed / 47 passed.
  - Expected failures covered missing inert state, missing Tab loop, missing sakura/cross-border copy, and missing `en`/`pt-BR` launcher/navigation/component copy.
- Focused GREEN: same three focused files.
  - Result: 3 files passed, 56/56 tests passed.
- Final focused composer run after lint-safe test narrowing:
  - `pnpm exec vitest run tests/unit/sazo-commerce-agent.test.tsx --reporter=dot`
  - Result: 1 file passed, 10/10 tests passed.

## Verification

| Command / proof | Result |
| --- | --- |
| `pnpm lint` | PASS, exit 0 |
| `pnpm typecheck` | PASS, exit 0 |
| `pnpm test -- --reporter=dot` | PASS, 17 files / 217 tests |
| `pnpm build` | PASS, 2,228 modules transformed |
| `pnpm test:e2e:sazo` | PASS, desktop + mobile, 2/2 tests |
| `node scripts/sazo-mobile-home-capture.mjs` | PASS, `sazo-mobile-home-capture-ok` |
| `git ls-files public/sazo-commerce/mobile-picks \| wc -l` | PASS, `31` |
| staged-tree clean-checkout equivalent | PASS: `git write-tree` → `git archive` into an empty temp directory → capture script; all 31 images loaded and capture returned OK |
| 440 × 956 | PASS: launcher `416 × 50`, nav `76`, all PICK images loaded, top launcher opened shared dialog |
| 341 × 735 | PASS: document width exactly `341`, no horizontal overflow |
| desktop 1511 × 828 | PASS: no mobile-home branch; existing desktop branch retained |
| `http://127.0.0.1:5190/sazo-commerce-mock/` | PASS: HTTP `200`; listener verified on `127.0.0.1:5190` |

The existing listener belonged to this repository. The user-owned dirty `playwright.config.ts` already allowed reuse, so the full E2E gate ran without changing or stopping that file/listener.

## Remaining matters

- No release-blocking item remains from the final review.
- Unrelated dirty/untracked files, including `playwright.config.ts`, `docs/superpowers/plans/2026-08-07-jplanet-commerce-theme.md`, service assets, and auxiliary scripts, were not edited or staged.
