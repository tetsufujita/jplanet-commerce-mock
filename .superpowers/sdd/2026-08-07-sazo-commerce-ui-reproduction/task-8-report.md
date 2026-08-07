# Task 8 report — frame comparison and fidelity loop

## Result

Task 8 is complete. The controlled comparison contract passes, all 21 deterministic checkpoints were freshly captured, and final comparison is **pass 3 / review 18 / fail 0**. The highest ratio is `mobile/catalog-grid` at `0.173880`, below the `0.18` failure threshold.

## Delivered

- Deterministic DPR 2 checkpoint capture for 9 desktop and 12 mobile states.
- Pixelmatch comparison CLI with exact threshold policy, dimension-mismatch failure, diff, side-by-side, and JSON output.
- Controlled PNG contract coverage for identical, one-pixel-different, and dimension-mismatched pairs.
- Recorded campaign, catalogue, review, service, auth persistence, collapsed header, and responsive shell fidelity corrections.
- Fresh desktop/mobile recordings and fresh reference/actual/compare artifacts.
- Full checkpoint table, accepted residual causes, audit scorecard, and every material correction iteration in `design/reproductions/sazo-commerce/fidelity-report.md`.

## Verification

- `pnpm vitest run tests/unit/sazo-comparison-contract.test.ts` — 3 passed.
- `pnpm test` — 97 passed across 10 files.
- `pnpm typecheck` — pass.
- `pnpm lint` — pass.
- `pnpm build` — pass.
- `pnpm test:e2e:sazo` — 2 projects passed.
- `pnpm test:sazo-home-browser` — pass.
- `pnpm test:sazo-views-browser` — pass.
- `pnpm test:sazo-account-browser` — pass.
- `pnpm sazo:record` — desktop 3022x1656 at 5.840s; mobile 682x1470 at 10.800s.
- `pnpm sazo:reference && pnpm sazo:capture && pnpm sazo:compare` — 21/21, fail 0 after the focused mobile catalogue recapture.
- Artifact counts — reference 21, actual 21, diff 21, side-by-side 21.

## Risks

- Eighteen checkpoints remain in review rather than pass. Their documented residuals are restricted to recording compression, source-only cursor location, and platform text/font rasterization.
- Generated QA images and recordings are intentionally gitignored; reproduction depends on the source recording paths declared in the manifest.
