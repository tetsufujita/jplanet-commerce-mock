// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import type { AgentComposerSeedRequest } from "@/sazo-commerce/MobileAgentComposer";
import type { AgentEntryIntent } from "@/sazo-commerce/model";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderComposer({
  entryIntent = null,
  seedRequest = null,
}: {
  entryIntent?: AgentEntryIntent | null;
  seedRequest?: AgentComposerSeedRequest | null;
} = {}) {
  const i18n = await createI18n("ja");
  const onEntryIntentConsumed = vi.fn();

  return {
    i18n,
    onEntryIntentConsumed,
    ...render(
      <I18nextProvider i18n={i18n}>
        <MobileAgentComposer
          entryIntent={entryIntent}
          onEntryIntentConsumed={onEntryIntentConsumed}
          seedRequest={seedRequest}
        />
      </I18nextProvider>,
    ),
  };
}

describe("MobileAgentComposer", () => {
  it("shows all modes and enables submit only when input exists", async () => {
    await renderComposer({ entryIntent: "compose" });

    expect(screen.getByRole("button", { name: "URLを貼る" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "画像を追加" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "商品名で相談" })).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "AIに探してもらう" })
        .disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "商品名で相談" }));
    fireEvent.change(screen.getByRole("textbox", { name: "探したい商品" }), {
      target: { value: "日本限定スニーカー" },
    });

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "AIに探してもらう" })
        .disabled,
    ).toBe(false);
  });

  it("previews an image and revokes its Object URL", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const { unmount } = await renderComposer({ entryIntent: "image-picker" });
    const file = new File(["image"], "item.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("画像を選択"), {
      target: { files: [file] },
    });

    const preview = screen.getByRole("img", { name: "選択した画像: item.png" });
    expect(preview.getAttribute("src")).toBe("blob:preview");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "AIに探してもらう" })
        .disabled,
    ).toBe(false);

    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:preview");
  });

  it("keeps the visible image fallback focusable and opens the hidden picker", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click");
    await renderComposer({ entryIntent: "image-picker" });
    click.mockClear();

    const fallback = screen.getByRole<HTMLButtonElement>("button", {
      name: "画像を選択",
    });
    fallback.focus();

    expect(fallback.type).toBe("button");
    expect(fallback.tabIndex).toBe(0);
    expect(document.activeElement).toBe(fallback);
    fireEvent.click(fallback);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("rejects a non-image file without rendering a preview", async () => {
    await renderComposer({ entryIntent: "image-picker" });
    const file = new File(["text"], "notes.txt", { type: "text/plain" });

    fireEvent.change(screen.getByLabelText("画像を選択"), {
      target: { files: [file] },
    });

    expect(screen.getByRole("status").textContent).toBe("画像ファイルを選択してください");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("revokes each replaced and removed image URL exactly once", async () => {
    vi.spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:first")
      .mockReturnValueOnce("blob:second");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    await renderComposer({ entryIntent: "image-picker" });
    const firstFile = new File(["first"], "first.png", { type: "image/png" });
    const secondFile = new File(["second"], "second.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("画像を選択"), {
      target: { files: [firstFile] },
    });
    fireEvent.click(screen.getByRole("button", { name: "画像を差し替える" }));
    fireEvent.change(screen.getByLabelText("画像を選択"), {
      target: { files: [secondFile] },
    });
    fireEvent.click(screen.getByRole("button", { name: "画像を削除" }));

    expect(revoke.mock.calls).toEqual([["blob:first"], ["blob:second"]]);
  });

  it("consumes an image-picker entry intent exactly once", async () => {
    const { i18n, onEntryIntentConsumed, rerender } = await renderComposer({
      entryIntent: "image-picker",
    });

    expect(onEntryIntentConsumed).toHaveBeenCalledTimes(1);
    rerender(
      <I18nextProvider i18n={i18n}>
        <MobileAgentComposer
          entryIntent="image-picker"
          onEntryIntentConsumed={onEntryIntentConsumed}
          seedRequest={null}
        />
      </I18nextProvider>,
    );
    expect(onEntryIntentConsumed).toHaveBeenCalledTimes(1);
  });

  it("consumes a compose entry intent exactly once", async () => {
    const { i18n, onEntryIntentConsumed, rerender } = await renderComposer({
      entryIntent: "compose",
    });

    expect(onEntryIntentConsumed).toHaveBeenCalledTimes(1);
    rerender(
      <I18nextProvider i18n={i18n}>
        <MobileAgentComposer
          entryIntent="compose"
          onEntryIntentConsumed={onEntryIntentConsumed}
          seedRequest={null}
        />
      </I18nextProvider>,
    );
    expect(onEntryIntentConsumed).toHaveBeenCalledTimes(1);
  });

  it("opens the file chooser when an image-picker intent arrives after mount", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click");
    const { i18n, onEntryIntentConsumed, rerender } = await renderComposer();

    rerender(
      <I18nextProvider i18n={i18n}>
        <MobileAgentComposer
          entryIntent="image-picker"
          onEntryIntentConsumed={onEntryIntentConsumed}
          seedRequest={null}
        />
      </I18nextProvider>,
    );

    expect(click).toHaveBeenCalledTimes(1);
    expect(onEntryIntentConsumed).toHaveBeenCalledTimes(1);
  });

  it("uses a seed product name as a product-name consultation", async () => {
    await renderComposer({ seedRequest: { revision: 1, value: "日本限定スニーカー" } });

    expect(
      screen.getByRole("button", { name: "商品名で相談" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", { name: "探したい商品" }).value,
    ).toBe("日本限定スニーカー");
  });

  it("shows submission feedback without a network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await renderComposer();

    fireEvent.change(screen.getByRole("textbox", { name: "探したい商品" }), {
      target: { value: "日本限定スニーカー" },
    });
    fireEvent.click(screen.getByRole("button", { name: "AIに探してもらう" }));

    expect(screen.getByRole("status").textContent).toBe(
      "AIエージェントが商品を探し始めました",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
