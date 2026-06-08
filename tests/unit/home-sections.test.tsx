import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/pages/HomePage";
import { createI18n } from "@/i18n/createI18n";

function includesInOrder(markup: string, values: readonly string[]) {
  let cursor = -1;

  for (const value of values) {
    const next = markup.indexOf(value, cursor + 1);
    expect(next).toBeGreaterThan(cursor);
    cursor = next;
  }
}

describe("HomePage below-hero sections", () => {
  it("renders the hero, product, and how-it-works sections in order", async () => {
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(HomePage),
      ),
    );

    includesInOrder(markup, [
      "Making",
      "OUR PRODUCT",
      "AIがつなぐ、新しい商取引体験。",
      "HOW IT WORKS",
      "Agentic Commerceの仕組み",
    ]);
  });

  it("keeps the hero image as a continuous page background below the hero", async () => {
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(HomePage),
      ),
    );

    expect(markup).toContain('data-background="continuous-hero"');
    expect(markup).toContain("homepage-continuous-bg");
    expect(markup).toContain("/images/hero-bg.webp");
  });

  it("uses verified market numbers and excludes mockup placeholders", async () => {
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(HomePage),
      ),
    );

    expect(markup).toContain("中南米市場の今");
    expect(markup).toContain("6.6 億人");
    expect(markup).toContain("US$ 7,690 億");
    expect(markup).toContain("1.7 億人");
    expect(markup).toContain("World Bank");
    expect(markup).toContain("PCMI");
    expect(markup).toContain("ブラジル中銀");
    expect(markup).not.toContain("6.4億");
    expect(markup).not.toContain("$1.6兆");
    expect(markup).not.toContain("20%+");
  });

  it("renders the shopping assistant mock and five-step flow", async () => {
    const i18n = await createI18n("ja");
    const markup = renderToStaticMarkup(
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(HomePage),
      ),
    );

    expect(markup).toContain("AI Shopping Assistant");
    expect(markup).toContain("Looks good. Buy it.");
    expect(markup).toContain("Order Confirmed");
    includesInOrder(markup, ["発見", "提案", "購入", "処理", "配送"]);
    expect(markup).toContain("国境を越えた取引を、AIがあたりまえに。");
    expect(markup).toContain("Agentic Commerce.");
  });

  it.each([
    ["en", "AI-connected commerce, built for a new buying experience."],
    ["pt-BR", "Comércio conectado por IA para uma nova experiência de compra."],
  ])("localizes the product headline for %s", async (locale, expectedHeadline) => {
    const i18n = await createI18n(locale);
    const markup = renderToStaticMarkup(
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(HomePage),
      ),
    );

    expect(markup).toContain(expectedHeadline);
  });
});
