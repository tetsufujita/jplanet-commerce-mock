# SAZO Commerce fidelity report — Fix Round 1

Generated: 2026-08-07

Route: `/sazo-commerce-mock/?qa=1&cursor=0`

Comparison: Pixelmatch `threshold: 0.12`, `includeAA: false`; pass `<= 0.08`, review `<= 0.18`, fail `> 0.18`.

## Outcome

- Final fresh distribution: **pass 3 / review 18 / fail 0** across all 21 checkpoints.
- Highest final ratio: `desktop/home-sections` at `0.175864`; every checkpoint is at or below the `0.18` failure boundary.
- Two consecutive full `reference → capture → compare` chains produced identical statuses, ratios, and all 42 reference/actual PNG hashes. The JSON `generatedAt` timestamp is intentionally different.
- `desktop/reviews` was additionally captured three consecutive times with the identical SHA-256 `0c94249faf94f38c94c315b2d4f8f421b72efa836745e72ab96c63dbcf3a5ea3` and ratio `0.1543409921`.
- Desktop output is `3022x1656`; mobile output is `682x1470`. Capture uses DPR 2 from CSS viewports `1511x828` and `341x735`.
- Authentication remains a local deterministic mock. The Google account chooser does not navigate or make an application request to Google.

## Fresh-chain determinism

| Run | Scope | Pass | Review | Fail | PNG hash mismatch |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | fresh reference + all captures + compare | 3 | 18 | 0 | — |
| 2 | fresh reference + all captures + compare | 3 | 18 | 0 | 0/42 vs run 1 |

Both runs returned the same ratio for every checkpoint. The final `summary.json` and generated diff/side-by-side files come only from run 2.

## Formal design re-audit

Baseline: committed Task 8 state `ecb45e3`, its screenshots, and the Round 1 review findings. Because the baseline had no prior 1–5 design score, the scores below are a retrospective application of the same rubric to baseline and final evidence.

### Preset: ecommerce

Overall: **2.5/5 → 4.2/5 (`+1.7`)**. The purchase and registration journey is now locally complete, semantically rendered, and deterministic. Remaining review-level gaps are concentrated in recorded loading states, product fixture imagery, and source-vs-live typography.

| Area | Baseline | Final | Delta | Status |
| --- | ---: | ---: | ---: | --- |
| Product clarity | 3/5 | 4/5 | +1 | Improved |
| Conversion quality | 2/5 | 4/5 | +2 | Improved |
| Trust signals | 2/5 | 4/5 | +2 | Improved |
| Interaction design | 2/5 | 5/5 | +3 | Fixed |
| Performance perception | 3/5 | 4/5 | +1 | Improved |
| Accessibility | 3/5 | 4/5 | +1 | Improved |

### Preset: mobile-first

Overall: **3.0/5 → 4.0/5 (`+1.0`)**. Mobile login, account navigation, focus containment, and the recorded settings scroll now behave correctly. The principal remaining weakness is that a few reference frames record loading states while the deterministic mock already shows populated content.

| Area | Baseline | Final | Delta | Status |
| --- | ---: | ---: | ---: | --- |
| Responsive behavior | 3/5 | 4/5 | +1 | Improved |
| Touch target quality | 4/5 | 4/5 | 0 | Stable |
| Mobile navigation | 3/5 | 4/5 | +1 | Improved |
| Performance perception | 3/5 | 4/5 | +1 | Improved |
| Visual hierarchy | 2/5 | 4/5 | +2 | Improved |
| Accessibility | 3/5 | 4/5 | +1 | Improved |

### Fix verification

| Previous issue | Status | Confidence |
| --- | --- | --- |
| Mobile catalogue captured the provider dialog instead of the account chooser | Fixed | High |
| Mobile mypage duplicated the registration frame | Fixed | High |
| Mobile phone registration was approximately twice the target scale | Fixed | High |
| Review tiles used screenshots containing author/text/action UI | Fixed | High |
| Friend-invite hero used a captured page screenshot | Fixed | High |
| Compare CLI left stale artifacts and under-tested boundary behavior | Fixed | High |
| Chat close cleanup depended on animation unmount timing | Fixed | High |
| Home search section had the wrong scroll/heading/search geometry | Improved | High |

Verification notes:

- `mobile/catalog-grid`: local chooser, stable URL, and no application external request; ratio `0.173880 → 0.111643`.
- `mobile/mypage`: settings section is visible at the recorded lower scroll; final file differs from registration byte-for-byte; ratio `0.069850`.
- `mobile/login`: corrected header/form scale, country field width, vertical rhythm, and footer position; focused ratio `0.200835 → 0.126982`.
- `desktop/reviews`: media-only assets plus live DOM author/body/actions; final ratio `0.154341` and three identical capture hashes.
- `desktop/login-modal`: clean `slide-5.webp`, live carousel controls, and correct neighboring campaign slide; final ratio `0.163852`.
- `desktop/home-sections`: heading/search/product-grid geometry now aligns regionally; overall ratio is `0.175864` because the visible product fixture set differs from the recording.

## Final checkpoint evidence

Each review row names the observed region responsible for the remaining difference. These are not blanket compression/font/cursor exemptions.

| Viewport | Checkpoint | Ratio | Status | Checkpoint-specific regional evidence |
| --- | --- | ---: | --- | --- |
| desktop | home-sections | 0.175864 | review | Heading/search/grid Y and width align; lower product media differs: reference chair/green bundle/earrings vs mock keyring/cosmetics/bag/sandal. |
| mobile | profile | 0.165790 | review | Upper hero counter/slide crop differs and the intro heading/body line lengths are larger in the live mock; bottom nav geometry aligns. |
| mobile | ranking | 0.164789 | review | Coupon banner content aligns; remaining difference is the lower headline scale, thumbnail-rail spacing, and search-field icon/text sizing. |
| desktop | login-modal | 0.163852 | review | Clean friend artwork and neighboring pink campaign align; reference contains a baked `2/5`, while the live DOM correctly shows `4/5`, plus narrow side-extension color differences. |
| mobile | brands | 0.163625 | review | Reference is base-makeup loading/empty content; mock is the populated skincare list. Header shell aligns; content-state timing remains open. |
| desktop | home-hero | 0.161896 | review | Campaign slide identity aligns; text/art scale inside the banner and live `5/5` vs recorded `2/5` counter dominate the hero band. |
| mobile | catalog-list | 0.158940 | review | Both show the large-furniture hero; the hero crop/counter and intro typography differ while shortcuts/search/nav align. |
| mobile | home-hero | 0.157277 | review | Both show the delivery-line hero; recorded `5/5` vs live `1/5` and source-image crop are confined to the hero region. |
| desktop | service | 0.154954 | review | Service title and STEP 01 card exist in both; mock card/title are smaller and shifted right, with different copy density in the right panel. |
| desktop | reviews | 0.154341 | review | Four masonry columns and lower-row offsets align; residual is in the clipped first row plus media crop/DOM text raster within review tiles. |
| desktop | chat-open | 0.144156 | review | Keyword list aligns; reference right column is placeholder cards while the mock shows loaded product media and prices. |
| desktop | gram | 0.138816 | review | Two-row grid placement aligns; first-row card imagery/copy and blank-tile distribution differ from the recording. |
| mobile | login | 0.126982 | review | Correct phone-registration state and form geometry; title line break, copy weight, and the footer start differ by a small vertical offset. |
| mobile | categories | 0.124876 | review | Set-product tab/chips align; reference remains in loading/empty state while the mock displays one product card and fixed bottom navigation. |
| desktop | ranking | 0.123576 | review | Reference includes review snippets above SAZO GRAM; mock shows the prior product-price tail, so the residual is the scroll/state band above the shared heading. |
| mobile | catalog-grid | 0.111643 | review | Correct local chooser state; browser-chrome text width and account-panel vertical spacing differ from the recorded Google surface. |
| desktop | brands | 0.107279 | review | Reference shows a categories loading screen; mock shows the populated popular-brands directory. Difference is localized to route/content state below the shared shell. |
| mobile | home-community | 0.101073 | review | Campaign skeleton structure aligns; logo size, timer icon, lower headline type scale, and search-field vertical position remain different. |
| mobile | mypage | 0.069850 | pass | Correct lower settings/account scroll state; distinct from registration. |
| mobile | registration | 0.068814 | pass | Correct authenticated mypage top state at scrollY 0. |
| mobile | service | 0.067726 | pass | Correct catalogue state after the appliance-category action. |

Side-by-side evidence is at `qa/compare/<viewport>/<checkpoint>.side-by-side.png`; magenta diffs are at the matching `.diff.png` paths.

## Round 1 correction log

| Area | Baseline/failing evidence | Final | Correction |
| --- | --- | --- | --- |
| Compare contract | 3 narrow tests; stale output possible | 9 tests pass | Exact `.08/.18` boundaries, `>.08/>.18`, threshold/AA, magenta/dimensions, batch totals, missing/dimension exits, cleanup. |
| Mobile catalogue | provider dialog, `0.173880` | local chooser, `0.111643` | Added a fully local chooser state and verified URL/request isolation. |
| Mobile mypage | registration-equivalent frame | settings scroll, `0.069850` | Added explicit lower-account scroll contract and byte-distinct capture assertion. |
| Mobile login | focused `0.200835` | `0.126982` | Corrected header, form width, line breaking, select width, margins, inputs, consent, CTA, and footer. |
| Desktop reviews | screenshot-backed tile UI and flaky report | `0.154341`, stable hash | Cropped media only, restored DOM copy/actions, stabilized image decode/layout, and corrected per-column/scroll offsets. |
| Desktop hero modal | captured page screenshot | clean art, `0.163852` | Removed baked screenshot, used clean slide artwork, kept controls live, and corrected carousel neighbor order. |
| Desktop home sections | wrong size/scroll geometry, `0.172982` | regionally aligned, `0.175864` | Corrected capture anchor, callout width, heading size, and search/product vertical rhythm; fixture imagery remains open. |
| Chat cleanup | cleanup after animated unmount | synchronous close cleanup | Restores `aria-hidden`, `inert`, body scroll, and focus before dispatch; focused test passed three consecutive runs. |

## Verification

- `pnpm test` — 104/104 tests, three consecutive runs.
- Focused chat close regression — 3/3 consecutive runs.
- `pnpm exec vitest run tests/unit/sazo-comparison-contract.test.ts` — 9/9.
- `pnpm typecheck` — pass.
- `pnpm lint` — pass.
- `pnpm build` — pass.
- `pnpm test:e2e:sazo` — desktop/mobile 2/2 pass.
- `pnpm test:sazo-home-browser` — pass.
- `pnpm test:sazo-views-browser` — pass.
- `pnpm test:sazo-account-browser` — pass.
- Two consecutive `pnpm sazo:reference && pnpm sazo:capture && pnpm sazo:compare` chains — identical 21 ratios/statuses, zero fail, zero reference/actual PNG hash mismatch.

## Remaining priorities

1. Replace the remaining reference loading-vs-populated state differences (`mobile/brands`, `mobile/categories`, `desktop/chat-open`, `desktop/brands`) with explicit deterministic loading checkpoints if tighter visual parity is required.
2. Source the four recorded home-search product media items instead of substituting current fixture products.
3. Align service-card typography/geometry and the mobile/desktop hero counter semantics without reintroducing captured UI.

Generated QA media remains gitignored; the manifest, report, deterministic tooling, implementation, and tests are tracked.
