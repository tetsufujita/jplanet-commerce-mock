# SAZO Commerce fidelity report — Fix Round 2

Generated: 2026-08-07

Route: `/sazo-commerce-mock/?qa=1&cursor=0`

Comparison: Pixelmatch `threshold: 0.12`, `includeAA: false`; pass `<= 0.08`, review `<= 0.18`, fail `> 0.18`.

Residual labels: **C** = source-recording compression/media-frame variance, **T** = platform font/text rasterization, **P** = platform/browser-rendered surface, **cursor** = cursor present only in the source recording.

## Outcome

- Final distribution: **pass 7 / review 14 / fail 0** across all 21 checkpoints. Round 1 ended at pass 3 / review 18 / fail 0.
- Highest final ratio is `mobile/profile` at approximately `0.16446`, below the `0.18` failure boundary.
- All recorded route, state, fixture identity, counter, neighboring-slide, loading, DOM-copy, and regional-anchor discrepancies found in the 21-frame re-audit are resolved.
- Every remaining review-level region is attributable only to C, T, P, or the source cursor. There is no remaining known wrong product/review identity, baked application UI, missing loading state, wrong counter, or wrong checkpoint state.
- Desktop output is `3022x1656`; mobile output is `682x1470`. Capture uses DPR 2 from CSS viewports `1511x828` and `341x735`.
- Authentication remains a local deterministic mock. The Google chooser neither navigates nor makes an application request to Google.

## Fresh-chain determinism

| Run | Scope                                            | Pass | Review | Fail | Cross-run evidence                                                           |
| --- | ------------------------------------------------ | ---: | -----: | ---: | ---------------------------------------------------------------------------- |
| 1   | cold-cache reference + all 21 captures + compare |    7 |     14 |    0 | Baseline hashes saved                                                        |
| 2   | fresh reference + all 21 captures + compare      |    7 |     14 |    0 | 21/21 reference PNG hashes and 20/21 actual PNG hashes identical to cold run |
| 3   | fresh reference + all 21 captures + compare      |    7 |     14 |    0 | 21/21 reference and 21/21 actual PNG hashes identical to run 2               |

The only cold-run hash difference was `mobile/profile`: the comparison delta changed by 24 threshold pixels out of 1,002,540 (`0.164438 → 0.164462`) without a status, state, fixture, or anchor change. The capture waits for `document.fonts.ready`, eagerly loads and decodes every image, removes animation/transition/caret/cursor state, blurs focus, and settles for three animation frames. Runs 2 and 3 then produced byte-identical actual PNGs and byte-identical normalized summaries across all 21 checkpoints.

## Round 2 correction log

| Area                   | Round 1/open evidence                                                        | Round 2 result                                                                            | Correction                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Compare output         | Stale per-checkpoint files could survive failed/incomplete runs              | Clean output contract, 13 comparison tests                                                | Clear output before batch work; verify boundary, missing-input, dimension, side-by-side, diff, and stale-artifact cases.                     |
| Hero states            | Counter/neighbor identity differed across recorded moments                   | Four audited hero checkpoints have exact identity, counter, previous, and next assertions | Added QA-only recorded feeds/indexes and capture-time snapshot assertions; production keeps natural autoplay.                                |
| Header logo            | Reconstructed mark plus text differed from the source wordmark               | Exact source-backed inline SVG in shell, campaign, and auth page                          | Added reusable `SazoLogo` with a unit contract.                                                                                              |
| Home search            | Wrong callout geometry and unrelated product media                           | `desktop/home-sections` `0.175864 → 0.086543`                                             | Corrected heading/search geometry and used four media-only recording crops at 37.5s; live names, discounts, prices, and controls remain DOM. |
| Loading states         | Captures showed populated content against recorded loading surfaces          | Four checkpoints now use their evidenced loading state                                    | Added QA-only `catalog`, `directory`, `keyword-products`, and `search-first` states with capture assertions.                                 |
| Service                | Title/card scale, colors, clock, and copy density differed                   | `desktop/service` `0.154954 → 0.118968`; mobile stays pass                                | Matched title treatment, STEP split, panel tones, card geometry, copy rhythm, and clock icon.                                                |
| Editorial reviews      | Placeholder height and row offsets differed                                  | Exact no-image placeholder and recorded row offsets                                       | Kept all author/body/action UI as DOM; only fixture media remains image-backed.                                                              |
| SAZO GRAM home         | Wrong second media, product captions, prices, and preceding review tail      | `desktop/ranking` `0.123576 → 0.105187`                                                   | Used the correct source-media frame, exact three product rows, corrected media ratio/section rhythm, and recorded review order.              |
| Responsive review feed | Desktop ranking and mobile profile recorded different feed snapshots         | Both checkpoints asserted without changing production order                               | Added QA-only `desktop-ranking` and `mobile-profile` review feeds plus explicit fixture arrays and DOM-order capture assertions.             |
| Campaign               | Reconstructed wordmark, missing clock semantics, and headline scale differed | Mobile campaign regions use exact logo, `Clock3`, and split headline styling              | Preserved loading/loaded campaign states and card identity.                                                                                  |
| Phone registration     | Title, logo, vertical rhythm, CTA, chat, and footer differed                 | `mobile/login` `0.126982 → 0.110660`                                                      | Exact logo, explicit two-line accessible title, recorded spacing, gradient CTA, and local chat glyph treatment.                              |
| GRAM catalogue         | Generic author copy differed from recorded product rows                      | Exact ten names/discounts/prices in DOM                                                   | Media stays fixture-backed; copy remains selectable and semantic.                                                                            |

## Final checkpoint evidence

The review rows below intentionally use only C/T/P/cursor labels. Side-by-side evidence is under `qa/compare/<viewport>/<checkpoint>.side-by-side.png`; the corresponding magenta diff is under the same path with `.diff.png`.

| Viewport | Checkpoint     |    Ratio | Status | Residual evidence                                                                                                             |
| -------- | -------------- | -------: | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| mobile   | profile        | 0.164462 | review | C/T/cursor: exact large-furniture `1/5` state and natural mobile review order; source cursor and text/media raster remain.    |
| desktop  | login-modal    | 0.161432 | review | C/T: exact friend-invite `2/5` state and neighbors; banner compression and text raster remain.                                |
| mobile   | catalog-list   | 0.157385 | review | C/T/cursor: exact large-furniture `1/5` state, search, shortcuts, intro, and nav anchors.                                     |
| mobile   | ranking        | 0.156938 | review | C/T: exact campaign banner, timer, thumbnail rail, headline, and search anchors.                                              |
| desktop  | reviews        | 0.156520 | review | C/T/cursor: exact four-column masonry, placeholder, DOM copy/actions, and row offsets.                                        |
| mobile   | home-hero      | 0.155618 | review | C/T: exact delivery-line `5/5` identity, counter, and neighboring slides.                                                     |
| desktop  | gram           | 0.141418 | review | C/T: exact two-row catalogue geometry and recorded product-copy sequence.                                                     |
| desktop  | home-hero      | 0.119932 | review | C/T: exact new-benefits `2/5` identity, counter, and neighboring slides.                                                      |
| desktop  | service        | 0.118968 | review | C/T: title/card/panel anchors and tones align; typography and recording compression remain.                                   |
| mobile   | catalog-grid   | 0.111643 | review | P/T: exact local Google chooser state; browser-chrome and provider text rendering remain platform-specific.                   |
| mobile   | login          | 0.110660 | review | T/C: exact two-line title, fields, CTA, footer start, and auth-page wordmark.                                                 |
| desktop  | ranking        | 0.105187 | review | C/T/cursor: exact preceding review tail, GRAM media/product rows, and recommendation anchor.                                  |
| mobile   | home-community | 0.091494 | review | C/T: exact campaign loading state, wordmark, timer, headline, and search anchors.                                             |
| desktop  | home-sections  | 0.086543 | review | C/T/cursor: exact search geometry and four recorded product-media fixtures; source cursor/compression and text raster remain. |
| mobile   | categories     | 0.068730 | pass   | Exact recorded loading catalogue state.                                                                                       |
| mobile   | mypage         | 0.067461 | pass   | Exact authenticated settings-scroll state.                                                                                    |
| mobile   | registration   | 0.066484 | pass   | Exact authenticated account-top state.                                                                                        |
| mobile   | service        | 0.065376 | pass   | Exact appliance catalogue action/state.                                                                                       |
| mobile   | brands         | 0.065289 | pass   | Exact base-makeup loading state.                                                                                              |
| desktop  | chat-open      | 0.027087 | pass   | Exact keyword-product loading state and open chat.                                                                            |
| desktop  | brands         | 0.018495 | pass   | Exact directory loading state.                                                                                                |

## Fixture and UI boundary

- Search discovery uses four `536x464` media-only crops from the supplied desktop recording at 37.5s. Each crop ends at source Y=736, before the recorded control boundary at Y=744; dimensions and boundaries are unit-tested.
- The home GRAM second card uses the source media frame at 0.55s. Instagram glyph, product thumbnail, name, discount, price, recommendation content, carousel control, and chat control are separately rendered DOM/UI.
- Editorial-review fixtures contain media only. Author pills, review copy, ratings, reactions, product copy, bookmarks, navigation, counters, and chat controls are live elements.
- No whole-screen reference image is used as an implementation surface.

## Verification

- `pnpm test` — 125/125 tests, three consecutive runs.
- Focused home/model/account suite — 57/57.
- Comparison contract — 13/13.
- `pnpm typecheck` — pass.
- `pnpm build` — pass.
- `pnpm test:sazo-home-browser` — pass.
- `pnpm test:sazo-views-browser` — pass.
- `pnpm test:sazo-account-browser` — pass.
- `pnpm test:e2e:sazo` — desktop/mobile 2/2 pass.
- `pnpm sazo:record` — pass; the desktop and mobile journeys were regenerated through the local Google chooser. `ffprobe` verified `3022x1656` / `5.960s` desktop MP4+WebM and `682x1470` / `10.760s` mobile MP4+WebM.
- Runs 2 and 3 of the fresh 21-checkpoint reference/capture/compare chain — both pass 7 / review 14 / fail 0, with exact reference hashes, actual hashes, and normalized summaries.

## Remaining risk

No known application-state or fixture-identity mismatch remains in the audited frames. Tighter ratios would require matching the source machine's video-decode moment, cursor recording, browser-provider chrome, installed font metrics, and lossy recording pipeline; those are C/T/P constraints rather than product implementation gaps.

Generated QA media remains gitignored; the manifest, report, deterministic tooling, implementation, fixture media, and tests are tracked.
