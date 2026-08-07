# Task 7 report: deterministic Playwright journeys and recordings

## Status

Complete.

## Implemented

- Added Playwright desktop and mobile projects at the exact reference viewports: `3022x1656` and `682x1470`.
- Added one deterministic journey per viewport. The desktop journey covers hero, reviews, chat, and provider login. The mobile journey covers categories, list/grid catalog, provider/birthday/phone auth, My Page, favorites, profile, and cards.
- Added only the stable test IDs needed by those journeys.
- Added a local recording runner with named capture pacing, Japanese locale, light color scheme, normal motion, installed Chrome, no post-readiness external requests, and clean Vite/browser shutdown.
- Added WebM capture plus FFmpeg conversion to H.264 `yuv420p` MP4.
- Fixed the reducer contract found by the RED journey: advancing auth from catalog now returns to the home auth page while preserving the selected catalog mode.
- Added a dedicated Vitest config so Playwright specs are not collected as unit tests.

## TDD evidence

- RED: the mobile catalog → provider → Google journey did not reach the birthday page because `advance-auth` retained `view: "catalog"`.
- GREEN: `advance-auth` now sets `view: "home"`; the focused reducer test passes and the full mobile journey reaches birthday, phone, and all account destinations.
- Regression RED: after adding the Playwright spec, `pnpm test` collected it as a Vitest suite and failed.
- Regression GREEN: `vitest.config.ts` excludes `tests/e2e/**`; unit and E2E runners now pass independently.

## Recordings

| Viewport | WebM                                                                  | MP4                                                        | Duration | MP4 codec                 |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------- | -------: | ------------------------- |
| Desktop  | `design/reproductions/sazo-commerce/qa/actual/desktop/recording.webm` | `design/reproductions/sazo-commerce/qa/actual/desktop.mp4` |  6.120 s | H.264, yuv420p, 3022x1656 |
| Mobile   | `design/reproductions/sazo-commerce/qa/actual/mobile/recording.webm`  | `design/reproductions/sazo-commerce/qa/actual/mobile.mp4`  | 10.760 s | H.264, yuv420p, 682x1470  |

The generated videos and contact sheets were visually inspected. All planned scenes are visible in order without a stalled or blank capture.

## Verification

| Check                            | Result                                                   |
| -------------------------------- | -------------------------------------------------------- |
| `pnpm test`                      | PASS — 93/93 in 9 files                                  |
| `pnpm typecheck`                 | PASS                                                     |
| `pnpm lint`                      | PASS                                                     |
| `pnpm build`                     | PASS — 2,214 modules transformed                         |
| `pnpm test:e2e:sazo`             | PASS — desktop/mobile 2/2                                |
| `pnpm test:sazo-home-browser`    | PASS                                                     |
| `pnpm test:sazo-views-browser`   | PASS                                                     |
| `pnpm test:sazo-account-browser` | PASS                                                     |
| `pnpm sazo:record`               | PASS — WebM and MP4 generated                            |
| `ffprobe`                        | PASS — nonzero duration, exact resolution, H.264/yuv420p |
| `git diff --check`               | PASS                                                     |

## Remaining concern

- Recordings intentionally use short deterministic pacing for QA rather than reproducing the original videos' full runtime.
- The source recordings contain no opened-chat reference frame, so the chat surface remains interaction- and motion-contract-driven.
