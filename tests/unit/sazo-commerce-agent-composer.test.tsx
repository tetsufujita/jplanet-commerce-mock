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
  it("keeps the composer compact and exposes camera/gallery choices from the plus menu", async () => {
    await renderComposer({ entryIntent: "compose" });

    expect(screen.getByRole("button", { name: "入力メニュー" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "URLを貼る" })).toBeNull();
    expect(screen.queryByRole("button", { name: "商品名で相談" })).toBeNull();
    expect(screen.getByTestId("composer-ai-mark")).toBeTruthy();
    expect(
      screen.getByRole("textbox", { name: "URL・画像・商品名をAIに渡す" }),
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "送信" })
        .disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "入力メニュー" }));
    expect(screen.getByRole("menuitem", { name: "ギャラリー" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "カメラ" })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "URLを貼る" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "商品名で相談" })).toBeNull();

    fireEvent.change(
      screen.getByRole("textbox", { name: "URL・画像・商品名をAIに渡す" }),
      {
      target: { value: "日本限定スニーカー" },
      },
    );

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "送信" })
        .disabled,
    ).toBe(false);
  });

  it("previews an image and revokes its Object URL", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const { unmount } = await renderComposer({ entryIntent: "image-picker" });
    const file = new File(["image"], "item.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("ギャラリー"), {
      target: { files: [file] },
    });

    const preview = screen.getByRole("img", { name: "選択した画像: item.png" });
    expect(preview.getAttribute("src")).toBe("blob:preview");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "送信" })
        .disabled,
    ).toBe(false);

    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:preview");
  });

  it("opens a camera-capable picker from the plus menu", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click");
    await renderComposer();

    fireEvent.click(screen.getByRole("button", { name: "入力メニュー" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "カメラ" }));

    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("カメラ").getAttribute("capture")).toBe(
      "environment",
    );
  });

  it("opens the hidden picker from the plus menu", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click");
    await renderComposer({ entryIntent: "image-picker" });
    click.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "入力メニュー" }));
    const fallback = screen.getByRole<HTMLButtonElement>("menuitem", {
      name: "ギャラリー",
    });

    fireEvent.click(fallback);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("rejects a non-image file without rendering a preview", async () => {
    await renderComposer({ entryIntent: "image-picker" });
    const file = new File(["text"], "notes.txt", { type: "text/plain" });

    fireEvent.change(screen.getByLabelText("ギャラリー"), {
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

    fireEvent.change(screen.getByLabelText("ギャラリー"), {
      target: { files: [firstFile] },
    });
    fireEvent.click(screen.getByRole("button", { name: "画像を差し替える" }));
    fireEvent.change(screen.getByLabelText("ギャラリー"), {
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

  it("uses a seed product name in the shared AI input", async () => {
    await renderComposer({ seedRequest: { revision: 1, value: "日本限定スニーカー" } });

    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "URL・画像・商品名をAIに渡す",
      }).value,
    ).toBe("日本限定スニーカー");
  });

  it("shows submission feedback without a network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await renderComposer();

    fireEvent.change(
      screen.getByRole("textbox", { name: "URL・画像・商品名をAIに渡す" }),
      {
      target: { value: "日本限定スニーカー" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.getByRole("status").textContent).toBe(
      "AIエージェントが商品を探し始めました",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
