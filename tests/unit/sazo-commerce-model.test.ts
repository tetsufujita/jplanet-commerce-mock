import { describe, expect, it } from "vitest";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";

describe("sazoReducer", () => {
  it("navigates catalog and preserves its display mode", () => {
    const state = createInitialSazoState();
    const catalog = sazoReducer(state, { type: "navigate", view: "catalog" });
    const grid = sazoReducer(catalog, { type: "set-catalog-mode", mode: "grid" });

    expect(grid.view).toBe("catalog");
    expect(grid.catalogMode).toBe("grid");
  });

  it("wraps the five-slide hero and toggles pause", () => {
    let state = createInitialSazoState();

    for (let index = 0; index < 5; index += 1) {
      state = sazoReducer(state, { type: "hero-next" });
    }

    expect(state.heroIndex).toBe(0);
    expect(sazoReducer(state, { type: "toggle-hero-pause" }).heroPaused).toBe(true);
  });

  it("advances the mock registration and opens chat deterministically", () => {
    let state = sazoReducer(createInitialSazoState(), { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "birthday" });
    state = sazoReducer(state, { type: "open-chat" });

    expect(state.authStep).toBe("birthday");
    expect(state.overlay).toBe("chat");
  });

  it("resets every stateful screen choice", () => {
    let state = sazoReducer(createInitialSazoState(), {
      type: "navigate",
      view: "catalog",
    });
    state = sazoReducer(state, { type: "set-catalog-mode", mode: "grid" });
    state = sazoReducer(state, { type: "hero-next" });
    state = sazoReducer(state, { type: "open-login" });
    state = sazoReducer(state, { type: "advance-auth", step: "phone" });
    state = sazoReducer(state, { type: "select-category", category: "beauty" });
    state = sazoReducer(state, { type: "select-tab", tab: "popular" });

    expect(sazoReducer(state, { type: "reset" })).toEqual(createInitialSazoState());
  });
});
