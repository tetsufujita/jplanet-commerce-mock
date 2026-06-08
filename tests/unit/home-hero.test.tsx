import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { HomeHero } from "@/components/sections/HomeHero";
import { createI18n } from "@/i18n/createI18n";
import en from "@/i18n/locales/en.json";
import ja from "@/i18n/locales/ja.json";
import ptBr from "@/i18n/locales/pt-BR.json";

const repoRoot = process.cwd();
const locales = { ja, en, "pt-BR": ptBr } as const;

describe("HomeHero", () => {
  it.each(Object.entries(locales))("renders the localized hero copy for %s", async (locale, resources) => {
    const i18n = await createI18n(locale);

    const markup = renderToStaticMarkup(
      React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(HomeHero),
      ),
    );

    expect(markup).toContain(resources.home.hero.title.line1);
    expect(markup).toContain(resources.home.hero.title.line2);
    expect(markup).toContain(resources.home.hero.title.line3);
    expect(markup).toContain(resources.home.hero.sub.lead);
    expect(markup).toContain(resources.home.hero.sub.body);
    expect(markup).toContain(resources.home.hero.features.aiAgents.description);
    expect(markup).toContain(resources.home.hero.features.payments.description);
    expect(markup).toContain(resources.home.hero.features.logistics.description);
    expect(markup).toContain(resources.home.hero.features.compliance.description);
  });

  it("keeps the cinematic background as a high-fidelity public webp asset", () => {
    const asset = statSync(join(repoRoot, "public/images/hero-bg.webp"));

    expect(asset.size).toBeGreaterThan(450_000);
    expect(asset.size).toBeLessThan(3_000_000);
  });

  it("does not force the continuous background to upscale from a fixed desktop width", () => {
    const css = readFileSync(join(repoRoot, "src/styles/globals.css"), "utf8");

    expect(css).toContain(".homepage-continuous-bg");
    expect(css).not.toContain("max(100vw, 1440px)");
  });

  it("defines the required Tailwind v4 theme tokens without the mockup red", () => {
    const css = readFileSync(join(repoRoot, "src/styles/globals.css"), "utf8");

    expect(css).toContain("@theme");
    expect(css).toContain("--color-crimson");
    expect(css).toContain("--color-navy");
    expect(css).toContain("--color-bg");
    expect(css).not.toMatch(/#e0392b/i);
  });
});
