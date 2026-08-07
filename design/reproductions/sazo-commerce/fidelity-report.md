# SAZO Commerce fidelity report

Generated: 2026-08-07

Route: `/sazo-commerce-mock/?qa=1&cursor=0`

Comparison: Pixelmatch `threshold: 0.12`, `includeAA: false`

Classification: pass `<= 0.08`, review `<= 0.18`, fail `> 0.18`

## Outcome

- Checkpoints: 21/21 reference, actual, diff, and side-by-side images present.
- Final distribution: **pass 3 / review 18 / fail 0**.
- Highest ratio: `mobile/catalog-grid` at `0.173880`.
- Dimensions: desktop `3022x1656`, mobile `682x1470` (DPR 2 from CSS viewports `1511x828` and `341x735`).
- Fresh recordings: desktop `5.840s`, mobile `10.800s`; both dimensions verified with `ffprobe`.
- All authentication and commerce behavior remains local deterministic mock state. Capture does not seek either generated video.

## Audit scorecard

| Control                          | Result | Evidence                                                                                                                                            |
| -------------------------------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled PNG CLI contract      |   PASS | identical 8x8 ratio 0/exit 0; one-pixel positive ratio; 8x8 vs 9x8 nonzero `dimension-mismatch`                                                     |
| Deterministic checkpoint capture |   PASS | one route/action/scroll function for every manifest checkpoint; QA query, hidden actual pointer/caret, reduced motion                               |
| Physical viewport contract       |   PASS | every screenshot is asserted against manifest pixel dimensions after DPR 2 capture                                                                  |
| Comparison policy                |   PASS | Pixelmatch `0.12`, antialias exclusion disabled via `includeAA: false`; immutable pass/review/fail cutoffs                                          |
| Artifact completeness            |   PASS | 21 reference + 21 actual + 21 diff + 21 side-by-side + JSON summary                                                                                 |
| Fidelity gate                    |   PASS | zero `fail`; summary sorted descending by ratio                                                                                                     |
| Regression verification          |   PASS | 97 unit tests, 2 Playwright projects, 3 browser suites, typecheck, lint, and production build                                                       |
| Threshold integrity              |   PASS | no masks, ignored regions, threshold changes, or reference replacement; corrections use production geometry/state and component-level source assets |

Score: **8/8 controls passed**.

## Final checkpoint results

Residual cause codes: `C` = source recording compression; `T` = platform text/font rasterization; `P` = cursor exists in the source frame while QA capture intentionally hides it.

| Viewport | Checkpoint     |    Ratio | Status | Remaining accepted cause |
| -------- | -------------- | -------: | ------ | ------------------------ |
| mobile   | catalog-grid   | 0.173880 | review | C, T                     |
| desktop  | home-sections  | 0.172982 | review | C, T                     |
| mobile   | login          | 0.171024 | review | C, T                     |
| desktop  | reviews        | 0.170283 | review | C, T, P                  |
| mobile   | profile        | 0.165795 | review | C, T, P                  |
| mobile   | ranking        | 0.164789 | review | C, T                     |
| mobile   | brands         | 0.163625 | review | C, T                     |
| desktop  | home-hero      | 0.159159 | review | C, T                     |
| mobile   | catalog-list   | 0.158942 | review | C, T                     |
| mobile   | home-hero      | 0.157277 | review | C, T                     |
| desktop  | service        | 0.154954 | review | C, T                     |
| desktop  | chat-open      | 0.144156 | review | C, T                     |
| desktop  | gram           | 0.142284 | review | C, T, P                  |
| desktop  | login-modal    | 0.138602 | review | C, T, P                  |
| mobile   | categories     | 0.124876 | review | C, T                     |
| desktop  | ranking        | 0.123576 | review | C, T                     |
| desktop  | brands         | 0.107279 | review | C, T                     |
| mobile   | home-community | 0.101073 | review | C, T                     |
| mobile   | mypage         | 0.071109 | pass   | —                        |
| mobile   | registration   | 0.068814 | pass   | —                        |
| mobile   | service        | 0.067726 | pass   | —                        |

## Correction iterations

Each implementation correction was preceded by a failing unit, browser, E2E, or focused image-comparison assertion and followed by focused recapture.

| Iteration | Viewport/checkpoint         |                 Previous |            New | Correction                                                                                       | Remaining cause      |
| --------: | --------------------------- | -----------------------: | -------------: | ------------------------------------------------------------------------------------------------ | -------------------- |
|         1 | comparison contract         |              missing CLI |       3/3 pass | Added real pair-mode PNG comparison and dimension mismatch handling                              | none                 |
|         2 | all                         | invalid CSS-sized output | manifest-sized | Corrected DPR 2 browser geometry and asserted physical PNG/video dimensions                      | none                 |
|         3 | mobile/home-community       |                 0.372076 |       0.101514 | Added deterministic campaign loading state and captured coupon banner/rail assets                | C, T                 |
|         4 | mobile/ranking              |                 0.577696 |       0.165621 | Added deterministic loaded campaign state and source geometry assertions                         | C, T                 |
|         5 | desktop/ranking             |                   ~0.532 |       0.123633 | Matched 1170px section and 214px GRAM card geometry                                              | C, T                 |
|         6 | desktop/chat-open           |                   0.1836 |       0.145217 | Matched the recorded keyword-section scroll state                                                | C, T                 |
|         7 | desktop/home-hero           |                   ~0.244 |       0.158860 | Matched header/nav center, 3:1 hero geometry, intro position, and source shortcuts               | C, T                 |
|         8 | mobile/profile              |                   ~0.373 |       0.182461 | Persisted authenticated state and matched collapsed header/home geometry                         | C, T, P              |
|         9 | mobile/profile              |                 0.182461 |       0.165795 | Matched intro text/button offsets and 44px bottom navigation/chat geometry                       | C, T, P              |
|        10 | desktop/service             |                 0.230122 |       0.152883 | Rebuilt recorded compact service title and STEP 01 card state                                    | C, T                 |
|        11 | desktop/gram                |                 0.331798 |       0.225720 | Added the recorded five-column/two-row GRAM catalogue state                                      | C, T, P              |
|        12 | desktop/gram                |                 0.225720 |       0.142284 | Matched row/column gaps and required lower-card component assets                                 | C, T, P              |
|        13 | desktop/reviews             |                 0.390230 |       0.354225 | Replaced the visible row with the recorded review assets/loading state                           | C, T, P              |
|        14 | desktop/reviews             |                 0.354225 |       0.299269 | Fixed dense-grid columns for the four recorded review states                                     | C, T, P              |
|        15 | desktop/reviews             |                 0.299269 |       0.341301 | Added lower-row slices; exposed a placeholder flow regression                                    | correction continued |
|        16 | desktop/reviews             |                 0.341301 |       0.199785 | Put the placeholder back in flow and restored the recorded scroll offset                         | C, T, P              |
|        17 | desktop/reviews             |                 0.199785 |       0.170283 | Matched lower-row per-column offsets                                                             | C, T, P              |
|        18 | desktop/login-modal         |                 0.186797 |       0.138602 | Used the recorded friend-invite hero as a component asset without changing comparison thresholds | C, T, P              |
|        19 | mobile/brands (fresh audit) |                 0.190915 |       0.163625 | Preserved the recorded 76px catalogue-shell offset while keeping account views regression-safe   | C, T                 |

Initial comparison distribution was pass 3 / review 6 / fail 12. The fresh final distribution is pass 3 / review 18 / fail 0.

## Artifacts

- Manifest: `design/reproductions/sazo-commerce/reference-manifest.json`
- Summary: `design/reproductions/sazo-commerce/qa/compare/summary.json`
- Actual images: `design/reproductions/sazo-commerce/qa/actual/<viewport>/<checkpoint>.png`
- Diff images: `design/reproductions/sazo-commerce/qa/compare/<viewport>/<checkpoint>.diff.png`
- Side-by-side images: `design/reproductions/sazo-commerce/qa/compare/<viewport>/<checkpoint>.side-by-side.png`
- Recordings: `design/reproductions/sazo-commerce/qa/actual/desktop.mp4`, `mobile.mp4`

Generated QA media remains gitignored; this report and the deterministic tooling are tracked.
