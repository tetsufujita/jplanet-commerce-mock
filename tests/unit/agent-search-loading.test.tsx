// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentSearchLoadingView } from "@/sazo-commerce/AgentSearchLoadingView";

describe("AgentSearchLoadingView", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows Kurone and Jupi as the only pixel sprites", () => {
    const dispatch = vi.fn();

    const { container } = render(
      <AgentSearchLoadingView
        dispatch={dispatch}
        request={{ imageName: "limited.png", summary: "日本限定スニーカー" }}
      />,
    );

    const jupi = container.querySelector('[data-pet-id="jupi"]');

    expect(container.querySelector("[data-agent-pet-stage]")).not.toBeNull();
    expect(jupi).not.toBeNull();
    expect(container.querySelector('[data-pet-id="kurone"]')).not.toBeNull();
    expect(container.querySelector(".sazo-agent-pet-ball")).toBeNull();
    expect(jupi?.querySelector("img")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("日本限定スニーカー")).toBeNull();
  });

  it("keeps the game-like pet story visible for the full ten seconds", () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();

    const { container } = render(
      <AgentSearchLoadingView
        dispatch={dispatch}
        request={{ imageName: null, summary: "日本限定スニーカー" }}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(7_500);
    });
    expect(
      container.querySelector("[data-agent-pet-stage]")?.getAttribute("data-play-phase"),
    ).toBe("3");
    expect(dispatch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2_500);
    });
    expect(dispatch).toHaveBeenCalledWith({ type: "complete-agent-search" });
  });
});
