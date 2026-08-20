import { expect, test, type Page } from "@playwright/test";

const homePath = "/sazo-commerce-mock/?qa=1&view=home&heroIndex=0";

function backgroundAlpha(color: string) {
  const alpha = /^rgba\([^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)$/.exec(color)?.[1];

  return alpha === undefined ? 1 : Number(alpha);
}

interface MobileHomeGlassSnapshot {
  agentCardBackdrop: string;
  agentCardBackground: string;
  chatBackdrop: string;
  headerActionBackground: string;
  headerActionBorder: string;
  headerBackdrop: string;
  headerBackground: string;
  headerHeight: number;
  navBackdrop: string;
  navBackground: string;
  pageOverflow: number;
  primaryBackdrop: string;
  primaryBackground: string;
  primaryBorderRadius: string;
  primaryBorderWidth: string;
  searchBackdrop: string;
  searchBackground: string;
  searchBorder: string;
  markCenterDelta: number;
  shortcutBackdrop: string;
  shortcutBackground: string;
}

async function readGlassSnapshot(page: Page) {
  return page.evaluate<MobileHomeGlassSnapshot>(() => {
    const select = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);

      if (element === null) {
        throw new Error(`Missing mobile home element: ${selector}`);
      }

      return element;
    };
    const style = (selector: string) => getComputedStyle(select(selector));
    const header = select('.sazo-mobile-header[data-sazo-topbar="true"]');
    const markSlot = select("[data-jplanet-ai-mark-slot]").getBoundingClientRect();
    const mark = select("[data-jplanet-sakura-mark]").getBoundingClientRect();

    return {
      agentCardBackdrop: style("[data-home-agent-entry]").backdropFilter,
      agentCardBackground: style("[data-home-agent-entry]").backgroundColor,
      chatBackdrop: style("[data-shell-chat-button]").backdropFilter,
      headerActionBackground: style("[data-shell-cart-button]").backgroundColor,
      headerActionBorder: style("[data-shell-cart-button]").borderColor,
      headerBackdrop: getComputedStyle(header).backdropFilter,
      headerBackground: getComputedStyle(header).backgroundColor,
      headerHeight: header.getBoundingClientRect().height,
      navBackdrop: style('.sazo-mobile-nav[aria-label="モバイルメニュー"]')
        .backdropFilter,
      navBackground: style('.sazo-mobile-nav[aria-label="モバイルメニュー"]')
        .backgroundColor,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
      primaryBackdrop: style("[data-sazo-topbar-primary]").backdropFilter,
      primaryBackground: style("[data-sazo-topbar-primary]").backgroundColor,
      primaryBorderRadius: style("[data-sazo-topbar-primary]").borderRadius,
      primaryBorderWidth: style("[data-sazo-topbar-primary]").borderWidth,
      searchBackdrop: style(".sazo-mobile-agent-searchbar").backdropFilter,
      searchBackground: style(".sazo-mobile-agent-searchbar").backgroundColor,
      searchBorder: style(".sazo-mobile-agent-searchbar").borderColor,
      markCenterDelta: Math.max(
        Math.abs(mark.x + mark.width / 2 - (markSlot.x + markSlot.width / 2)),
        Math.abs(mark.y + mark.height / 2 - (markSlot.y + markSlot.height / 2)),
      ),
      shortcutBackdrop: style(".sazo-shortcut-icon").backdropFilter,
      shortcutBackground: style(".sazo-shortcut-icon").backgroundColor,
    };
  });
}

for (const viewport of [
  { height: 735, width: 341 },
  { height: 844, width: 390 },
  { height: 956, width: 440 },
  { height: 900, width: 767 },
]) {
  test(`${String(viewport.width)}px home changes its liquid-glass header at the real hero boundary`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto(homePath);
    await expect(page.locator("[data-home-agent-entry]")).toBeVisible();

    const initial = await readGlassSnapshot(page);

    expect(initial.headerBackground).toBe("rgba(0, 0, 0, 0)");
    expect(initial.headerBackdrop).toBe("none");
    expect(initial.headerHeight).toBeCloseTo(64, 0);
    expect(initial.primaryBackdrop).toBe("none");
    expect(initial.primaryBackground).toBe("rgba(0, 0, 0, 0)");
    expect(initial.primaryBorderRadius).toBe("0px");
    expect(initial.primaryBorderWidth).toBe("0px");
    expect(initial.searchBackdrop).toContain("blur(");
    expect(initial.chatBackdrop).toContain("blur(");
    expect(initial.agentCardBackdrop).toContain("blur(");
    expect(initial.shortcutBackdrop).toBe("none");
    expect(initial.navBackdrop).toContain("blur(");
    expect(initial.searchBackground).toContain("rgba(");
    expect(backgroundAlpha(initial.searchBackground)).toBeLessThanOrEqual(
      backgroundAlpha(initial.headerActionBackground) + 0.02,
    );
    expect(backgroundAlpha(initial.searchBorder)).toBeLessThanOrEqual(
      backgroundAlpha(initial.headerActionBorder) + 0.04,
    );
    expect(initial.agentCardBackground).toContain("rgba(");
    expect(initial.shortcutBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(initial.navBackground).toContain("rgba(");
    expect(initial.markCenterDelta).toBeLessThanOrEqual(0.5);
    expect(initial.pageOverflow).toBeLessThanOrEqual(0);

    const heroBoundary = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>("[data-testid='sazo-hero']");
      const header = document.querySelector<HTMLElement>("[data-sazo-topbar='true']");

      if (hero === null || header === null) throw new Error("Missing hero boundary");

      return (
        window.scrollY +
        hero.getBoundingClientRect().bottom -
        header.getBoundingClientRect().bottom
      );
    });

    await page.evaluate((top) => {
      window.scrollTo({ behavior: "instant", top: top - 1 });
    }, heroBoundary);
    await expect(page.locator(".sazo-root")).toHaveAttribute(
      "data-header-collapsed",
      "false",
    );

    await page.evaluate((top) => {
      window.scrollTo({ behavior: "instant", top: top + 1 });
    }, heroBoundary);
    await expect(page.locator(".sazo-root")).toHaveAttribute(
      "data-header-collapsed",
      "true",
    );
    await expect
      .poll(async () => (await readGlassSnapshot(page)).headerBackdrop)
      .toContain("blur(26px)");
    await expect
      .poll(async () => backgroundAlpha((await readGlassSnapshot(page)).headerBackground))
      .toBeGreaterThanOrEqual(0.7);

    const collapsed = await readGlassSnapshot(page);

    expect(collapsed.headerHeight).toBeCloseTo(initial.headerHeight, 0);
    expect(collapsed.primaryBackdrop).toBe("none");
    expect(collapsed.primaryBackground).toBe("rgba(0, 0, 0, 0)");
    expect(collapsed.primaryBorderRadius).toBe("0px");
    expect(collapsed.primaryBorderWidth).toBe("0px");
    expect(collapsed.searchBackdrop).toContain("blur(26px)");
    expect(collapsed.searchBackground).not.toBe(initial.searchBackground);
    expect(backgroundAlpha(collapsed.searchBackground)).toBeGreaterThanOrEqual(0.8);
    expect(collapsed.pageOverflow).toBeLessThanOrEqual(0);

    await page.evaluate(() => {
      window.scrollTo({ behavior: "instant", top: 0 });
    });
    await expect(page.locator(".sazo-root")).toHaveAttribute(
      "data-header-collapsed",
      "false",
    );
    await expect(page.locator('.sazo-mobile-header[data-sazo-topbar="true"]')).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
  });
}
