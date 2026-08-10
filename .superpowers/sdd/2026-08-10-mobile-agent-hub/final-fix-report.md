# Mobile Agent Hub — Final Contrast Fix Report

- Date: 2026-08-10
- Baseline: `234d3dc5decc0fb018d969069ffb271212fcb0c7`
- Scope: `src/sazo-commerce/sazo.css`, `scripts/sazo-mobile-home-capture.mjs`
- Review item: `[Important][Accessibility] New sakura foregrounds and focus rings do not meet minimum contrast`

## Change

Added the mobile-agent-hub-scoped `--jplanet-sakura-ink: #a83d53` token and reused it for:

- the clear-control `X` foreground,
- the 13px `J-Planet AI` label,
- ranks 1–3,
- hub button/link focus outlines.

The existing light sakura values remain unchanged for decorative use:

- `--jplanet-sakura: #fea2ac`
- `--jplanet-sakura-soft: #fff4f5`

The capture script now reads the target computed styles and calculates WCAG contrast deterministically. It requires `4.5:1` for small text and `3:1` for the clear icon and focus outline.

## TDD Evidence

### RED

Command:

```text
node scripts/sazo-mobile-home-capture.mjs
```

Before the CSS change it exited `1` at the new assertion:

```text
Agent hub brand text contrast 1.91:1 is below 4.5:1
(rgb(254, 162, 172) on rgb(255, 255, 255))
```

### GREEN

The same command exited `0` after the scoped token change and printed `sazo-mobile-home-capture-ok`.

Computed contrast results:

| Target | Foreground | Background | Ratio | Required |
| --- | --- | --- | ---: | ---: |
| `J-Planet AI` small text | `#a83d53` | `#ffffff` | 6.07:1 | 4.5:1 |
| ranks 1–3 small text | `#a83d53` | `#ffffff` | 6.07:1 | 4.5:1 |
| clear-control `X` | `#a83d53` | `#fff4f5` | 5.64:1 | 3:1 |
| focus outline | `#a83d53` | `#ffffff` | 6.07:1 | 3:1 |

## Fresh Verification

| Gate | Result |
| --- | --- |
| `pnpm lint` | PASS, exit 0 |
| `pnpm typecheck` | PASS, exit 0 |
| `pnpm test -- --reporter=dot` | PASS, 18 files / 227 tests |
| `pnpm build` | PASS, 2,230 modules transformed |
| `pnpm test:e2e:sazo` | PASS, desktop/mobile 2 tests |
| `node scripts/sazo-mobile-home-capture.mjs` | PASS, `sazo-mobile-home-capture-ok` |
| HTTP `GET /sazo-commerce-mock/` on `127.0.0.1:5190` | PASS, 200 |
| `git diff --check 234d3dc5decc0fb018d969069ffb271212fcb0c7` | PASS |

The E2E run retained the pre-existing Vite public-font-path warnings documented by the final review; no test failed.

## Visual Inspection

- `/tmp/jplanet-mobile-agent-hub.png` at 440×956: dark sakura brand/ranks/clear icons remain visually consistent with the light sakura decoration; no document overflow, duplicate header, broken product image, bottom-nav overlap, or SAZO branding observed.
- `/tmp/jplanet-mobile-agent-hub-341x735.png` at 341×735: header launcher remains a single clipped/ellipsis line; the product rail remains the only horizontal overflow; no bottom-nav overlap observed.
- Capture geometry remained unchanged: hub header 440×52, fixed nav 440×76, compact launcher 139px client width / 168px scroll width.

## Scope Audit

Only the two implementation/test files above and this report are owned by the fix. Existing unrelated dirty/untracked files were not edited, reverted, staged, or committed.
