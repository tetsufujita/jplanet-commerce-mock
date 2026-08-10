# SAZO Hero Swipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reliable horizontal swipe navigation to the existing J-Planet home hero without changing vertical scrolling, autoplay, controls, geometry, or carousel assets.

**Architecture:** Keep the reducer and current `goNext`/`goPrevious` callbacks as the only slide-transition paths. `HeroCarousel` records one primary pointer start in a ref, classifies the completed gesture on pointer up, and uses `touch-action: pan-y` so the browser retains vertical scrolling.

**Tech Stack:** React 19, TypeScript, Pointer Events, CSS, Vitest, Testing Library, Playwright.

## Global Constraints

- A horizontal gesture must travel at least 40px and be more horizontal than vertical.
- Left swipe advances one slide; right swipe reverses one slide with circular wrapping.
- Short movements, vertical gestures, canceled pointers, and mismatched pointer identifiers do nothing.
- Existing autoplay, pause/play state, arrow buttons, campaign-link taps, counter, assets, geometry, search overlap, status placement, and bottom navigation remain unchanged.
- Do not add a gesture dependency or continuous finger-following animation.
- Preserve all pre-existing modified and untracked files outside the owned files below.

---

### Task 1: Add thresholded pointer swipe navigation

**Files:**
- Modify: `tests/unit/sazo-commerce-home.test.tsx:413-465`
- Modify: `src/sazo-commerce/HomeView.tsx:1-3,174-306`
- Modify: `src/sazo-commerce/sazo.css:8330-8460`
- Modify: `tests/e2e/sazo-commerce-reproduction.spec.ts:102-140`

**Interfaces:**
- Consumes: existing `dispatch({ type: "hero-next" })`, `goNext(): void`, and `goPrevious(): void`.
- Produces: pointer handlers on `.sazo-hero-viewport`; no exported API.

- [ ] **Step 1: Write failing unit tests for horizontal and ignored gestures**

Add the following cases inside `describe("SAZO hero controls", ...)`:

```tsx
it("changes slides for thresholded horizontal pointer swipes", async () => {
  installReducedMotion(false);
  vi.useFakeTimers();
  const { container } = await renderHomePage();
  const viewport = container.querySelector<HTMLElement>(".sazo-hero-viewport");
  const counter = screen.getByTestId("sazo-hero-counter");

  expect(viewport).not.toBeNull();
  if (viewport === null) throw new Error("Missing hero viewport");

  fireEvent.pointerDown(viewport, {
    clientX: 300,
    clientY: 100,
    isPrimary: true,
    pointerId: 1,
  });
  fireEvent.pointerUp(viewport, {
    clientX: 240,
    clientY: 106,
    isPrimary: true,
    pointerId: 1,
  });
  expect(counter.textContent).toBe("2/5");

  fireEvent.pointerDown(viewport, {
    clientX: 140,
    clientY: 100,
    isPrimary: true,
    pointerId: 2,
  });
  fireEvent.pointerUp(viewport, {
    clientX: 200,
    clientY: 103,
    isPrimary: true,
    pointerId: 2,
  });
  expect(counter.textContent).toBe("1/5");
});

it("ignores short, vertical, canceled, and mismatched pointer gestures", async () => {
  installReducedMotion(false);
  vi.useFakeTimers();
  const { container } = await renderHomePage();
  const viewport = container.querySelector<HTMLElement>(".sazo-hero-viewport");
  const counter = screen.getByTestId("sazo-hero-counter");

  expect(viewport).not.toBeNull();
  if (viewport === null) throw new Error("Missing hero viewport");

  const swipe = (
    start: { x: number; y: number; pointerId: number },
    end: { x: number; y: number; pointerId: number },
  ) => {
    fireEvent.pointerDown(viewport, {
      clientX: start.x,
      clientY: start.y,
      isPrimary: true,
      pointerId: start.pointerId,
    });
    fireEvent.pointerUp(viewport, {
      clientX: end.x,
      clientY: end.y,
      isPrimary: true,
      pointerId: end.pointerId,
    });
  };

  swipe({ x: 200, y: 100, pointerId: 3 }, { x: 170, y: 101, pointerId: 3 });
  swipe({ x: 200, y: 100, pointerId: 4 }, { x: 140, y: 180, pointerId: 4 });
  swipe({ x: 200, y: 100, pointerId: 5 }, { x: 140, y: 101, pointerId: 6 });
  fireEvent.pointerDown(viewport, {
    clientX: 200,
    clientY: 100,
    isPrimary: true,
    pointerId: 7,
  });
  fireEvent.pointerCancel(viewport, { isPrimary: true, pointerId: 7 });
  fireEvent.pointerUp(viewport, {
    clientX: 140,
    clientY: 101,
    isPrimary: true,
    pointerId: 7,
  });

  expect(counter.textContent).toBe("1/5");
});
```

- [ ] **Step 2: Run the focused unit tests and verify RED**

Run:

```bash
pnpm test -- tests/unit/sazo-commerce-home.test.tsx --reporter=dot
```

Expected: the new horizontal swipe test fails because pointer gestures do not yet change `1/5` to `2/5`.

- [ ] **Step 3: Implement the minimal pointer classifier in `HeroCarousel`**

Update the React imports:

```tsx
import type {
  CSSProperties,
  Dispatch,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
```

Add the local record type above `HeroCarousel`:

```tsx
interface HeroPointerStart {
  pointerId: number;
  x: number;
  y: number;
}

const heroSwipeThreshold = 40;
```

Inside `HeroCarousel`, after `goPrevious`, add:

```tsx
const pointerStart = useRef<HeroPointerStart | null>(null);
const handlePointerDown = useCallback(
  (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;

    pointerStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  },
  [],
);
const handlePointerCancel = useCallback(
  (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStart.current?.pointerId === event.pointerId) {
      pointerStart.current = null;
    }
  },
  [],
);
const handlePointerUp = useCallback(
  (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;

    if (!event.isPrimary || start?.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (
      Math.abs(deltaX) < heroSwipeThreshold ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX < 0) goNext();
    else goPrevious();
  },
  [goNext, goPrevious],
);
```

Attach the handlers to `.sazo-hero-viewport`:

```tsx
<div
  className="sazo-hero-viewport"
  onPointerCancel={handlePointerCancel}
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
>
```

- [ ] **Step 4: Preserve vertical scrolling in mobile CSS**

Add to the final mobile-home CSS block:

```css
.sazo-root[data-view="home"] .sazo-hero-viewport {
  touch-action: pan-y;
}
```

- [ ] **Step 5: Run the focused unit tests and verify GREEN**

Run:

```bash
pnpm test -- tests/unit/sazo-commerce-home.test.tsx --reporter=dot
```

Expected: all tests in `sazo-commerce-home.test.tsx` pass.

- [ ] **Step 6: Add a real mobile browser swipe regression**

Immediately after the mobile hero becomes visible in `replayMobileScenario`, add:

```ts
const heroViewport = page.locator(".sazo-hero-viewport");
const heroCounter = page.getByTestId("sazo-hero-counter");

await expect(heroCounter).toHaveText("1/5");
await heroViewport.dispatchEvent("pointerdown", {
  clientX: 320,
  clientY: 210,
  isPrimary: true,
  pointerId: 41,
  pointerType: "touch",
});
await heroViewport.dispatchEvent("pointerup", {
  clientX: 250,
  clientY: 214,
  isPrimary: true,
  pointerId: 41,
  pointerType: "touch",
});
await expect(heroCounter).toHaveText("2/5");

await heroViewport.dispatchEvent("pointerdown", {
  clientX: 250,
  clientY: 210,
  isPrimary: true,
  pointerId: 42,
  pointerType: "touch",
});
await heroViewport.dispatchEvent("pointerup", {
  clientX: 245,
  clientY: 285,
  isPrimary: true,
  pointerId: 42,
  pointerType: "touch",
});
await expect(heroCounter).toHaveText("2/5");
```

- [ ] **Step 7: Run focused browser and capture checks**

Run:

```bash
pnpm test:e2e:sazo
node scripts/sazo-mobile-home-capture.mjs
```

Expected: desktop/mobile E2E passes 2/2 and capture prints `sazo-mobile-home-capture-ok` without geometry changes.

- [ ] **Step 8: Run all regression gates**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --reporter=dot
pnpm build
pnpm test:e2e:sazo
node scripts/sazo-mobile-home-capture.mjs
curl -I http://127.0.0.1:5190/sazo-commerce-mock/
git diff --check
```

Expected: all commands exit 0, the full unit count increases by two, both E2E projects pass, capture succeeds, and the local URL returns HTTP 200.

- [ ] **Step 9: Commit only the owned implementation files**

Run:

```bash
git add \
  src/sazo-commerce/HomeView.tsx \
  src/sazo-commerce/sazo.css \
  tests/unit/sazo-commerce-home.test.tsx \
  tests/e2e/sazo-commerce-reproduction.spec.ts
git diff --cached --name-only
git commit -m "feat: add hero swipe navigation"
```

Confirm no pre-existing account-view, configuration, planning, QA, or asset changes are staged.
