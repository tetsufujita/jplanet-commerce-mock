// @vitest-environment jsdom

import { useReducer } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n, type Locale } from "@/i18n/createI18n";
import { AgentComposerSheet } from "@/sazo-commerce/AgentComposerSheet";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
});

function AgentHarness() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, createInitialSazoState);

  return (
    <div data-overlay={state.overlay} data-view={state.view}>
      <div className="sazo-shell-background">
        <button
          onClick={() => {
            dispatch({ type: "open-agent" });
          }}
          type="button"
        >
          エージェントを開く
        </button>
      </div>
      {state.overlay === "agent" ? <AgentComposerSheet dispatch={dispatch} /> : null}
    </div>
  );
}

async function renderAgent(locale: Locale = "ja") {
  const i18n = await createI18n(locale);

  return render(
    <I18nextProvider i18n={i18n}>
      <AgentHarness />
    </I18nextProvider>,
  );
}

function openAgent() {
  const trigger = screen.getByRole("button", { name: "エージェントを開く" });

  trigger.focus();
  fireEvent.click(trigger);

  return {
    dialog: screen.getByRole("dialog"),
    trigger,
  };
}

describe("AgentComposerSheet", () => {
  it("enables a URL request and navigates to the catalog when submitted", async () => {
    await renderAgent();

    const { dialog } = openAgent();
    const submit = within(dialog).getByRole("button", { name: "AIに探してもらう" });

    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "https://example.jp/item" },
    });

    expect((submit as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(submit);
    expect(document.querySelector("[data-view='catalog']")).not.toBeNull();
  });

  it("opens the hidden image picker from the visible chip and enables submission", async () => {
    const { container } = await renderAgent();

    const { dialog } = openAgent();
    const file = new File(["image"], "sample.png", { type: "image/png" });
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
    const submit = within(dialog).getByRole("button", { name: "AIに探してもらう" });
    let filePickerClicks = 0;

    if (fileInput === null) {
      throw new Error("Agent file input is missing");
    }
    fileInput.addEventListener("click", () => {
      filePickerClicks += 1;
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "画像を追加" }));
    expect(filePickerClicks).toBe(1);

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(within(dialog).getByText("sample.png")).toBeTruthy();
    expect((submit as HTMLButtonElement).disabled).toBe(false);
  });

  it("makes the background inert, focuses the composer, and excludes the file input", async () => {
    const { container } = await renderAgent();
    const background = container.querySelector<HTMLElement>(".sazo-shell-background");
    const { dialog } = openAgent();
    const textbox = within(dialog).getByRole("textbox");
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');

    await waitFor(() => {
      expect(document.activeElement).toBe(textbox);
    });
    expect(background?.hasAttribute("inert")).toBe(true);
    expect(fileInput?.hidden).toBe(true);
    expect(fileInput?.tabIndex).toBe(-1);
    expect(fileInput?.getAttribute("aria-hidden")).toBe("true");
    expect(within(dialog).getAllByRole("button", { name: "画像を追加" })).toHaveLength(
      1,
    );
    expect(within(dialog).getByRole("group", { name: "入力方法" })).toBeTruthy();
  });

  it("cycles Tab and Shift+Tab inside the dialog", async () => {
    await renderAgent();

    const { dialog } = openAgent();
    const textbox = within(dialog).getByRole("textbox");
    const close = within(dialog).getByRole("button", { name: "閉じる" });
    const submit = within(dialog).getByRole("button", { name: "AIに探してもらう" });

    fireEvent.change(textbox, { target: { value: "限定スニーカー" } });
    submit.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(submit);
  });

  it.each(["escape", "close", "backdrop"] as const)(
    "dismisses via %s and restores trigger focus and background state",
    async (dismissal) => {
      const { container } = await renderAgent();
      const background = container.querySelector<HTMLElement>(".sazo-shell-background");
      const { dialog, trigger } = openAgent();

      if (dismissal === "escape") {
        fireEvent.keyDown(document, { key: "Escape" });
      } else if (dismissal === "close") {
        fireEvent.click(within(dialog).getByRole("button", { name: "閉じる" }));
      } else {
        const backdrop = container.querySelector<HTMLElement>(".sazo-agent-backdrop");

        if (backdrop === null) {
          throw new Error("Agent backdrop is missing");
        }
        fireEvent.mouseDown(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(trigger);
      });
      expect(background?.hasAttribute("inert")).toBe(false);
    },
  );

  it.each([
    [
      "ja",
      "J-Planet AIエージェント",
    ],
    [
      "en",
      "J-Planet AI Agent",
    ],
    [
      "pt-BR",
      "Agente de IA J-Planet",
    ],
  ] as const)("renders localized agent title for %s", async (locale, title) => {
    const { container } = await renderAgent(locale);
    const { dialog } = openAgent();

    expect(within(dialog).getByRole("heading", { name: title })).toBeTruthy();
    expect(within(dialog).queryByText(/日本の商品探し|AI helps you find|A IA ajuda a encontrar/)).toBeNull();
    expect(
      container.querySelector<HTMLImageElement>(
        'img[src="/sazo-commerce/jplanet-sakura-mark.png"]',
      ),
    ).not.toBeNull();
  });
});
