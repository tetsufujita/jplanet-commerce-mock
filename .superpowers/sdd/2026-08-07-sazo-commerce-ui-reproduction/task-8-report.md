# Task 8 Fix Round 1 — frame comparison and fidelity loop

## Result

Fix Round 1 is complete. Two consecutive fresh reference/capture/compare chains returned **pass 3 / review 18 / fail 0**, with identical per-checkpoint ratios and identical hashes for all 42 reference/actual PNGs. `desktop/reviews` also produced the same screenshot hash in three additional focused captures.

## Delivered

- Mutation-resistant comparison contract with exact `.08` and `.18` boundaries, threshold/AA fixtures, magenta diff/dimension checks, batch totals/exits, and stale-output cleanup.
- Local Google account chooser with no external application request or navigation.
- Distinct registration and lower-settings mypage captures with explicit state/scroll assertions.
- Corrected mobile phone-registration geometry (`0.200835 → 0.126982` focused).
- Removed captured friend-invite page UI and restored clean hero artwork with live DOM controls.
- Replaced review screenshot tiles with media-only crops and live DOM author/body/actions.
- Stable review image decode/layout and per-column positioning (`0.154341`, three identical hashes).
- Synchronous chat isolation cleanup preserving focus, `aria-hidden`, `inert`, and body scroll.
- Formal `ecommerce` and `mobile-first` baseline/final re-audit, fix verification, and checkpoint-specific residual evidence in `design/reproductions/sazo-commerce/fidelity-report.md`.

## Final ratios changed by this round

| Checkpoint | Baseline/focused | Final |
| --- | ---: | ---: |
| mobile/catalog-grid | 0.173880 | 0.111643 |
| mobile/login | 0.200835 | 0.126982 |
| desktop/reviews | 0.170283 before media cleanup | 0.154341 |
| desktop/login-modal | captured screenshot UI | clean DOM/media, 0.163852 |
| mobile/mypage | wrong/duplicate state | correct settings state, 0.069850 |

`desktop/home-sections` is regionally corrected but finishes at `0.175864` because the visible product fixture images differ from the reference recording.

## Verification

- `pnpm test` — 104/104, three consecutive runs.
- Focused synchronous chat-close test — 3/3 consecutive runs.
- `pnpm exec vitest run tests/unit/sazo-comparison-contract.test.ts` — 9/9.
- `pnpm typecheck` — pass.
- `pnpm lint` — pass.
- `pnpm build` — pass.
- `pnpm test:e2e:sazo` — desktop/mobile 2/2 pass.
- `pnpm test:sazo-home-browser` — pass.
- `pnpm test:sazo-views-browser` — pass.
- `pnpm test:sazo-account-browser` — pass.
- Full fresh chain run 1 — pass 3 / review 18 / fail 0.
- Full fresh chain run 2 — pass 3 / review 18 / fail 0; all 42 PNG hashes identical to run 1.

## Remaining risks

- Eighteen checkpoints remain `review`, though none exceed the `0.18` fail boundary.
- Four reference frames intentionally caught loading/placeholder states while the mock shows populated content; these are listed as open state/timing residuals rather than generic compression noise.
- Generated QA media is gitignored and reproducible from the source recording paths in the manifest.
