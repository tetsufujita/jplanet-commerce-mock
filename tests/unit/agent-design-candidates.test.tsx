// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentDesignCandidatesView } from "@/sazo-commerce/AgentDesignCandidatesView";

afterEach(() => {
  cleanup();
});

describe("AgentDesignCandidatesView", () => {
  it("compares exactly three compact, iPhone-like agent input cards", () => {
    render(<AgentDesignCandidatesView />);

    expect(
      screen.getByRole("heading", { name: "J-Planet AI入力カード — 3案" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("クワイエット・コンポーザー")).toBeTruthy();
    expect(screen.getByText("インセット・シート")).toBeTruthy();
    expect(screen.getByText("オービット・コマンドバー")).toBeTruthy();
  });

  it("keeps text input unified and exposes URL, gallery, and camera from the plus menu", () => {
    render(<AgentDesignCandidatesView />);

    const [addInputButton] = screen.getAllByRole("button", { name: "入力方法を追加" });
    expect(addInputButton).toBeTruthy();
    fireEvent.click(addInputButton!);
    const menu = screen.getByRole("menu");

    expect(within(menu).getByRole("menuitem", { name: "URLを貼る" })).toBeTruthy();
    expect(within(menu).getByRole("menuitem", { name: "写真を選ぶ" })).toBeTruthy();
    expect(within(menu).getByRole("menuitem", { name: "写真を撮る" })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "商品名で相談" })).toBeNull();
  });

  it("keeps each candidate compact enough for the top of the home screen", () => {
    render(<AgentDesignCandidatesView />);

    expect(screen.getAllByTestId("home-agent-preview")).toHaveLength(3);
    expect(screen.getAllByText("J-Planet AIエージェント")).toHaveLength(3);
    expect(screen.queryByText("ひとつの入力欄から始める")).toBeNull();
    expect(screen.queryByText("何をお探しですか？")).toBeNull();
    expect(screen.queryByText("探したいものを、そのまま送る")).toBeNull();
  });
});
