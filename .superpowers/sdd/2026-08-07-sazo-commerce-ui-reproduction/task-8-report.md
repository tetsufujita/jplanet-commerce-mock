# Task 8 Fix Round 2 — frame comparison and fidelity loop

## Result

Fix Round 2 is complete. The final 21-checkpoint distribution is **pass 7 / review 14 / fail 0**. Two consecutive fresh reference/capture/compare chains produced byte-identical reference PNGs, actual PNGs, and normalized summaries. Every remaining review cause is limited to source compression/media-frame variance (**C**), platform font/text rasterization (**T**), platform/browser-rendered surfaces (**P**), or a cursor present only in the source recording.

## Delivered

- Mutation-resistant comparison output cleanup and 13 comparison-contract tests.
- Exact QA-only hero feeds/indexes with capture-time counter and neighboring-slide assertions; production keeps natural autoplay.
- QA-only desktop-ranking/mobile-profile review feeds with explicit fixture arrays and DOM-order assertions; production keeps one coherent natural order.
- QA-only loading surfaces for catalog, directory, keyword products, and first-search states.
- Exact source-backed inline SAZO logo shared by shell, campaign, and authentication.
- Source-media-only product/search fixtures while keeping names, discounts, prices, controls, review copy, and reactions as live DOM.
- Service, editorial reviews, home GRAM, campaign, authentication, and GRAM catalogue geometry/copy corrections.
- Correct local Google chooser recording flow: provider → chooser assertion → account → birthday.
- Viewport-selectable recording (`--viewport desktop|mobile`) and a clean browser lifecycle per recording.
- Full evidence and all residual classifications in `design/reproductions/sazo-commerce/fidelity-report.md`.

## Final checkpoint distribution

| Status | Count | Checkpoints                                                                                                                                                                                                                                                     |
| ------ | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pass   |     7 | mobile/categories, mobile/mypage, mobile/registration, mobile/service, mobile/brands, desktop/chat-open, desktop/brands                                                                                                                                         |
| review |    14 | mobile/profile, desktop/login-modal, mobile/catalog-list, mobile/ranking, desktop/reviews, mobile/home-hero, desktop/gram, desktop/home-hero, desktop/service, mobile/catalog-grid, mobile/login, desktop/ranking, mobile/home-community, desktop/home-sections |
| fail   |     0 | —                                                                                                                                                                                                                                                               |

The highest ratio is `mobile/profile` at `0.164462`, below the `0.18` failure boundary. Runs 2 and 3 are exact across all 21 reference hashes, all 21 actual hashes, and summaries with `generatedAt` removed.

## Recording evidence

`pnpm sazo:record` regenerated both journeys successfully. `ffprobe` verified:

| Viewport | MP4                   | WebM                  |
| -------- | --------------------- | --------------------- |
| desktop  | `3022x1656`, `5.960s` | `3022x1656`, `5.960s` |
| mobile   | `682x1470`, `10.760s` | `682x1470`, `10.760s` |

Generated QA videos and comparison media remain gitignored and reproducible.

## Verification

- `pnpm test` — 125/125, three consecutive runs during Round 2; final post-record run also passed.
- Focused home/model/account suite — 57/57.
- Comparison contract — 13/13.
- `pnpm lint` — pass.
- `pnpm typecheck` — pass.
- `pnpm build` — pass.
- `pnpm test:sazo-home-browser` — pass.
- `pnpm test:sazo-views-browser` — pass.
- `pnpm test:sazo-account-browser` — pass.
- `pnpm test:e2e:sazo` — desktop/mobile 2/2 pass.
- `pnpm sazo:record` — desktop/mobile pass with asserted dimensions and positive durations.
- Changed source/report files — Prettier pass; `git diff --check` pass.

## Remaining risks

Fourteen checkpoints remain `review`, but no known route, state, product/review identity, counter, loading surface, DOM copy, or regional-anchor mismatch remains. Improving those ratios further depends on source decode timing/compression, source cursor removal, provider/browser rendering, or matching the source machine's exact font rasterization rather than an application correction.
