// @vitest-environment jsdom

import { useReducer } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentComposerSheet } from "@/sazo-commerce/AgentComposerSheet";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";

afterEach(() => {
  document.body.innerHTML = "";
});

function AgentHarness() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, createInitialSazoState);

  return (
    <div data-overlay={state.overlay} data-view={state.view}>
      <button
        onClick={() => {
          dispatch({ type: "open-agent" });
        }}
        type="button"
      >
        エージェントを開く
      </button>
      {state.overlay === "agent" ? <AgentComposerSheet dispatch={dispatch} /> : null}
    </div>
  );
}

describe("AgentComposerSheet", () => {
  it("enables a URL request and navigates to the catalog when submitted", () => {
    render(<AgentHarness />);

    fireEvent.click(screen.getByRole("button", { name: "エージェントを開く" }));
    const dialog = screen.getByRole("dialog", { name: "J-Planet AIエージェント" });
    const submit = within(dialog).getByRole("button", { name: "AIに探してもらう" });

    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "https://example.jp/item" },
    });

    expect((submit as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(submit);
    expect(document.querySelector("[data-view='catalog']")).not.toBeNull();
  });

  it("shows an added image filename and enables submission", () => {
    render(<AgentHarness />);

    fireEvent.click(screen.getByRole("button", { name: "エージェントを開く" }));
    const dialog = screen.getByRole("dialog", { name: "J-Planet AIエージェント" });
    const file = new File(["image"], "sample.png", { type: "image/png" });
    const submit = within(dialog).getByRole("button", { name: "AIに探してもらう" });

    fireEvent.change(within(dialog).getByLabelText("画像を追加"), {
      target: { files: [file] },
    });

    expect(within(dialog).getByText("sample.png")).toBeTruthy();
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });
});
