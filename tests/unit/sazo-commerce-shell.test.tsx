import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { SazoCommercePage } from "@/sazo-commerce/SazoCommercePage";

async function renderSazoCommercePage(locale: "ja" | "en" | "pt-BR") {
  const i18n = await createI18n(locale);

  return renderToStaticMarkup(
    React.createElement(I18nextProvider, { i18n }, React.createElement(SazoCommercePage)),
  );
}

describe("SazoCommercePage shell", () => {
  it("renders the accessible desktop and mobile navigation contract", async () => {
    const markup = await renderSazoCommercePage("ja");

    expect(markup).toContain("SAZO");
    expect(markup).toContain("キーワードまたはURLを入力");
    expect(markup).toContain("サービス紹介");
    expect(markup).toContain("お気に入り");
    expect(markup).toContain('aria-label="チャットを開く"');
    expect(markup).toContain('data-shell="desktop"');
    expect(markup).toContain('data-shell="mobile"');
    expect(markup).toContain("<header");
    expect(markup).toContain("<nav");
    expect(markup).toContain("<main");
    expect(markup).toContain("<footer");
  });

  it.each(["ja", "en", "pt-BR"] as const)(
    "keeps the captured Japanese labels fixed for %s",
    async (locale) => {
      const markup = await renderSazoCommercePage(locale);

      expect(markup).toContain("キーワードまたはURLを入力");
      expect(markup).toContain("サービス紹介");
      expect(markup).toContain("カテゴリー");
      expect(markup).toContain("マイページ");
    },
  );
});
