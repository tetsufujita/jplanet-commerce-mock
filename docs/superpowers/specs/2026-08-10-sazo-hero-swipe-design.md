# SAZO Hero Swipe Design

**Date:** 2026-08-10  
**Status:** Approved in conversation  
**Surface:** J-Planet commerce mock home hero

## Goal

Allow users to change the home hero banner by swiping horizontally with a finger, while preserving vertical page scrolling, short taps, automatic playback, arrow controls, pause/play, counter updates, and circular wrapping.

## Chosen Approach

Use native Pointer Events on the existing `.sazo-hero-viewport`.

This keeps the current carousel DOM and reducer actions intact, supports touch, pen, and mouse drag through one event model, and avoids a new dependency or a scroll-snap rewrite.

## Interaction Contract

- Pointer down records the starting client coordinates and pointer identifier.
- Pointer up evaluates the completed gesture.
- A gesture changes slides only when:
  - horizontal travel is at least 40px; and
  - absolute horizontal travel is greater than absolute vertical travel.
- A left swipe dispatches the existing `hero-next` behavior.
- A right swipe uses the existing circular previous behavior.
- Gestures below the threshold do nothing.
- Vertically dominant gestures do nothing and retain normal page scrolling.
- Pointer cancellation clears the pending gesture without changing slides.
- The swipe does not change the current pause/play state or reset the automatic-play model.
- Existing campaign-link taps remain usable because a short tap does not meet the swipe threshold.

## Component Design

`HeroCarousel` owns one small pointer-start record in a React ref. The existing `goNext` and `goPrevious` callbacks remain the single path for changing slides. Pointer handlers are attached only to `.sazo-hero-viewport`; no slide markup, fixtures, assets, reducer state, or navigation is changed.

The viewport receives `touch-action: pan-y`, allowing the browser to retain vertical scrolling while the component interprets horizontal gestures. No continuous drag transform is introduced in this iteration: the slide changes after gesture completion, matching the current deterministic carousel animation.

## Accessibility

- Keyboard users retain the existing previous/next buttons.
- Pause/play remains focusable and retains its localized accessible name.
- Pointer interaction adds no new focus target and does not remove existing semantics.
- The carousel continues to expose its localized section label and live counter.

## Error and Edge Handling

- Ignore a pointer-up event when no matching pointer-down record exists.
- Ignore mismatched pointer identifiers.
- Clear stored gesture state after pointer up or pointer cancel.
- Circular boundaries continue to use the existing next/previous callbacks, so first-to-last and last-to-first behavior remains unchanged.

## Verification

### Unit tests

- Left swipe of at least 40px advances one slide.
- Right swipe of at least 40px reverses one slide with circular wrapping.
- A short horizontal movement does not change the counter.
- A vertically dominant movement does not change the counter.
- Pointer cancellation does not change the counter.

### Browser test

- On the mobile project, dispatch a touch pointer sequence on the hero viewport and verify the counter advances from `1/5` to `2/5`.
- Verify a vertical gesture leaves the counter unchanged.

### Regression gates

- Lint, typecheck, unit tests, build, desktop/mobile E2E, and mobile-home capture all pass.
- The local preview remains available at `/sazo-commerce-mock/`.

## Out of Scope

- Continuous finger-following drag animation.
- Momentum, velocity, or multi-slide flings.
- Changes to autoplay timing.
- Changes to hero artwork, geometry, search overlap, status-control placement, bottom navigation, product sections, or non-home views.
