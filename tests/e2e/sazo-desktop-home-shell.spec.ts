import { expect, test } from "@playwright/test";

const homePath = "/sazo-commerce-mock/";

test("bounds the PC home to 1360px with safe gutters while keeping the header wider", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC home shell");

  for (const viewport of [
    { height: 900, width: 1024, expectedHomeWidth: 960, expectedLeft: 32 },
    { height: 900, width: 1280, expectedHomeWidth: 1216, expectedLeft: 32 },
    { height: 1024, width: 1536, expectedHomeWidth: 1312, expectedLeft: 112 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(homePath);

    const desktopHome = page.locator("[data-desktop-home-view]");
    const desktopHeader = page.locator(".sazo-desktop-header-card");
    await expect(desktopHome).toBeVisible();
    await expect(desktopHeader).toBeVisible();

    const layout = await page.evaluate(() => {
      const home = document.querySelector<HTMLElement>("[data-desktop-home-view]");
      const header = document.querySelector<HTMLElement>(".sazo-desktop-header-card");
      if (home === null || header === null) throw new Error("Missing PC home shell or header");

      const homeRect = home.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      return {
        headerWidth: headerRect.width,
        homeLeft: homeRect.left,
        homeRight: document.documentElement.clientWidth - homeRect.right,
        homeWidth: homeRect.width,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(layout.homeWidth).toBeCloseTo(viewport.expectedHomeWidth, 0);
    expect(layout.homeLeft).toBeCloseTo(viewport.expectedLeft, 0);
    expect(layout.homeRight).toBeCloseTo(viewport.expectedLeft, 0);
    expect(layout.headerWidth).toBeGreaterThan(layout.homeWidth);
    expect(layout.overflow).toBeLessThanOrEqual(0);
  }
});

test("keeps the PC home header at 124px while lowering its first row", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC home shell");

  for (const viewport of [
    { expectedHeroTop: 156, height: 900, width: 1024 },
    { expectedHeroTop: 152, height: 900, width: 1280 },
    { expectedHeroTop: 152, height: 1024, width: 1536 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${homePath}?qa=1`);
    await expect(page.locator(".sazo-desktop-header")).toBeVisible();

    const layout = await page.evaluate(() => {
      const rectFor = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (element === null) throw new Error(`Missing ${selector}`);
        const rect = element.getBoundingClientRect();
        return { height: rect.height, top: rect.top };
      };
      const header = document.querySelector<HTMLElement>(".sazo-desktop-header");
      if (header === null) throw new Error("Missing PC home header");

      return {
        header: rectFor(".sazo-desktop-header"),
        hero: rectFor('[data-testid="desktop-aligned-home-hero"]'),
        nav: rectFor(".sazo-desktop-nav"),
        rows: getComputedStyle(header).gridTemplateRows,
      };
    });

    expect(layout.rows).toBe("80px 44px");
    expect(layout.header.height).toBeCloseTo(124, 0);
    expect(layout.nav.top).toBeCloseTo(80, 0);
    expect(layout.nav.height).toBeCloseTo(44, 0);
    expect(layout.hero.top).toBeCloseTo(viewport.expectedHeroTop, 0);
  }
});

test("matches the approved PC hero hierarchy with its mobile-compatible AI composer", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC home hero");

  for (const viewport of [
    { height: 900, width: 1024 },
    { height: 900, width: 1280 },
    { height: 1024, width: 1536 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${homePath}?qa=1`);

    const hero = page.getByTestId("desktop-aligned-home-hero");
    const heroImage = hero.locator(".sazo-desktop-aligned-home-hero-image");
    const heroBrandMark = hero.locator(".sazo-desktop-aligned-home-hero-brand-mark");
    const desktopHeroSource = hero.locator('source[media="(min-width: 1024px)"]');
    const heroTitle = hero.getByRole("heading", {
      level: 1,
      name: /日本の買い物を、.*もっと確かに。/,
    });
    const heroSubtitle = hero.locator(".sazo-desktop-aligned-home-subtitle");
    const duplicateSearchCard = page.getByTestId("desktop-aligned-agent-card");
    const headerSearch = page
      .locator(".sazo-desktop-header")
      .getByRole("search", { name: "AI検索" });
    const headerSearchLabel = page.locator(".sazo-desktop-ai-search-tray-label");
    const shortcuts = page.getByTestId("desktop-aligned-shortcuts");
    const pixBanner = page.getByTestId("desktop-aligned-pix-banner");

    await expect(hero).toBeVisible();
    await expect(heroTitle).toBeVisible();
    await expect(heroSubtitle).toHaveText(
      "販売元・購入可否・関税・配送を確認し、BRL総額まで見通せます。",
    );
    await expect(heroSubtitle).toBeVisible();
    await expect(duplicateSearchCard).toBeVisible();
    await expect(heroBrandMark).toBeVisible();
    await expect(desktopHeroSource).toHaveAttribute(
      "srcset",
      "/sazo-commerce/reference/japan-brazil-hero-desktop-v2.png",
    );
    await expect(headerSearch).toBeVisible();
    await expect(headerSearchLabel).toBeVisible();
    await expect(headerSearchLabel).toHaveText("AI商品検索");
    await expect(shortcuts.getByRole("button")).toHaveCount(9);

    const layout = await page.evaluate(() => {
      const rectFor = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (element === null) throw new Error(`Missing ${selector}`);
        const rect = element.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          height: rect.height,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };
      };

      const image = document.querySelector<HTMLImageElement>(
        ".sazo-desktop-aligned-home-hero-image",
      );
      if (image === null) throw new Error("Missing desktop hero image");

      return {
        copy: rectFor(".sazo-desktop-aligned-home-copy"),
        headerSearchTray: rectFor(".sazo-desktop-ai-search-tray"),
        hero: rectFor(".sazo-desktop-aligned-home-hero"),
        imageFit: getComputedStyle(image).objectFit,
        imageNaturalHeight: image.naturalHeight,
        imageNaturalWidth: image.naturalWidth,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        agent: rectFor('[data-testid="desktop-aligned-agent-card"]'),
        shortcuts: rectFor('[data-testid="desktop-aligned-shortcuts"]'),
      };
    });

    expect(layout.hero.height).toBeGreaterThanOrEqual(420);
    expect(layout.hero.height).toBeLessThanOrEqual(460);
    if (viewport.width === 1536) {
      expect(layout.hero.width / layout.hero.height).toBeGreaterThanOrEqual(2.9);
      expect(layout.hero.width / layout.hero.height).toBeLessThanOrEqual(3);
    }
    expect(layout.imageFit).toBe("cover");
    expect(layout.imageNaturalWidth).toBe(2114);
    expect(layout.imageNaturalHeight).toBe(744);
    expect(layout.copy.left).toBeGreaterThan(layout.hero.left + layout.hero.width / 2);
    expect(layout.agent.width).toBeCloseTo(720, 0);
    expect(layout.agent.left + layout.agent.width / 2).toBeCloseTo(
      layout.hero.left + layout.hero.width / 2,
      0,
    );
    if (viewport.width === 1536) {
      expect(layout.headerSearchTray.width).toBeGreaterThanOrEqual(840);
      expect(layout.headerSearchTray.width).toBeLessThanOrEqual(880);
    }
    expect(layout.shortcuts.left).toBeCloseTo(layout.hero.left, 0);
    expect(layout.shortcuts.right).toBeCloseTo(layout.hero.right, 0);
    expect(layout.shortcuts.top - layout.hero.bottom).toBeCloseTo(64, 0);
    expect(layout.shortcuts.height).toBeCloseTo(136, 0);
    expect(layout.overflow).toBeLessThanOrEqual(0);
  }
});

test("follows the approved full Figma home sequence and desktop item counts", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC home composition");

  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto(`${homePath}?qa=1`);

  const sectionSelectors = [
    '[data-testid="desktop-aligned-home-hero"]',
    '[data-testid="desktop-aligned-shortcuts"]',
    '[data-testid="desktop-home-search-trend"]',
    '[data-testid="desktop-home-coupons"]',
    '[data-testid="desktop-home-uniqlo-discovery"]',
    '[data-testid="desktop-home-reviews"]',
    '[data-testid="desktop-home-gram"]',
    '[data-testid="desktop-home-product-rail"]',
    '[data-testid="desktop-home-keywords"]',
    '[data-testid="desktop-home-category-grid"]',
    '[data-testid="desktop-home-recommendation-continuation"]',
    '[data-testid="desktop-home-category-products"]',
    '[data-testid="desktop-home-support"]',
    '[data-testid="desktop-home-footer"]',
  ] as const;

  await expect(page.getByTestId("desktop-aligned-shortcuts").getByRole("button")).toHaveCount(9);
  await expect(page.getByTestId("desktop-home-coupons").getByRole("article")).toHaveCount(3);
  await expect(
    page
      .getByTestId("desktop-home-product-rail")
      .getByTestId("home-dense-product-card"),
  ).toHaveCount(4);
  await expect(page.getByTestId("desktop-home-keywords").getByRole("listitem")).toHaveCount(6);
  await expect(
    page.getByTestId("desktop-home-category-grid").locator(".sazo-desktop-home-categories-grid > button"),
  ).toHaveCount(20);
  await expect(
    page
      .getByTestId("desktop-home-recommendation-continuation")
      .getByTestId("home-dense-product-card"),
  ).toHaveCount(4);
  await expect(
    page
      .getByTestId("desktop-home-category-products")
      .getByTestId("home-dense-product-card"),
  ).toHaveCount(8);
  await expect(page.getByTestId("desktop-home-support").getByRole("listitem")).toHaveCount(3);

  const layout = await page.evaluate((selectors) => {
    const sections = selectors.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element === null) throw new Error(`Missing ${selector}`);
      const rect = element.getBoundingClientRect();
      return { bottom: rect.bottom, selector, top: rect.top, width: rect.width };
    });

    return {
      documentHeight: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sections,
    };
  }, sectionSelectors);

  layout.sections.slice(1).forEach((section, index) => {
    const previous = layout.sections[index];
    if (previous === undefined) throw new Error("Missing previous Figma section");
    expect(section.top).toBeGreaterThanOrEqual(previous.bottom);
  });
  expect(layout.documentHeight).toBeGreaterThanOrEqual(6500);
  expect(layout.documentHeight).toBeLessThanOrEqual(7200);
  expect(layout.overflow).toBeLessThanOrEqual(0);
});

test("shows the three approved desktop coupon cards without changing their fixture conditions", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC campaign layout");

  for (const viewport of [
    { height: 900, width: 1024 },
    { height: 900, width: 1280 },
    { height: 1024, width: 1536 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${homePath}?qa=1`);

    const coupons = page.getByTestId("desktop-home-coupons");
    const cards = coupons.getByRole("article");
    await expect(cards).toHaveCount(3);
    await expect(coupons).toContainText("10% OFF");
    await expect(coupons).toContainText("12% OFF");
    await expect(coupons).toContainText("5% OFF");
    await expect(coupons).toContainText("R$ 400以上の購入");
    await expect(coupons).toContainText("R$ 600以上の購入");
    await expect(coupons).toContainText("R$ 200以上の購入");

    const layout = await cards.evaluateAll((elements) => ({
      cardHeights: elements.map((element) => element.getBoundingClientRect().height),
      cardRows: [...new Set(elements.map((element) => Math.round(element.getBoundingClientRect().top)))],
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    expect(layout.cardRows).toHaveLength(1);
    layout.cardHeights.forEach((height) => expect(height).toBeCloseTo(220, 0));
    expect(layout.overflow).toBeLessThanOrEqual(0);
  }
});

test("keeps the PC header search, campaign, and shortcut actions connected", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC home actions");

  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto(`${homePath}?qa=1`);

  const headerSearch = page.getByTestId("desktop-header-ai-search-tray");
  const headerInput = headerSearch.getByRole("textbox", {
    name: "商品名・キーワード・画像・URLで検索",
  });
  await headerInput.click();
  await expect(page.getByRole("dialog", { name: "最近の検索" })).toBeVisible();
  await headerInput.press("Escape");

  await headerInput.fill("Nintendo");
  await headerSearch.getByRole("button", { name: "AI検索を実行" }).click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-searching");

  await page.goto(`${homePath}?qa=1`);
  await page
    .getByTestId("desktop-header-ai-search-tray")
    .getByRole("button", { name: "カメラ" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "agent-hub");

  await page.goto(`${homePath}?qa=1`);
  await page
    .getByTestId("desktop-home-coupons")
    .getByRole("button", { name: "人気ブランド 10% OFFを見る" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "coupons");

  await page.goto(`${homePath}?qa=1`);
  await page
    .getByTestId("desktop-aligned-shortcuts")
    .getByRole("button", { name: "カテゴリー" })
    .click();
  await expect(page.locator(".sazo-root")).toHaveAttribute("data-view", "categories");
});

test("matches the approved Figma V3 density for the PC Uniqlo rail", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC home rail");

  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto(`${homePath}?qa=1`);

  const rail = page.getByTestId("desktop-home-uniqlo-discovery");
  const cards = rail.getByTestId("home-dense-product-card");
  const headingLogo = rail.locator(".sazo-uniqlo-discovery-heading-mark");
  const cardLogos = rail.locator('.sazo-home-dense-product-brand-source[data-brand-source="uniqlo"]');

  await expect(rail).toBeVisible();
  await expect(cards).toHaveCount(6);
  await expect(headingLogo).toHaveCount(1);
  await expect(cardLogos).toHaveCount(6);

  const layout = await rail.evaluate((section) => {
    const cardElements = Array.from(
      section.querySelectorAll<HTMLElement>("[data-testid=home-dense-product-card]"),
    );
    const logos = Array.from(
      section.querySelectorAll<HTMLElement>(
        '.sazo-home-dense-product-brand-source[data-brand-source="uniqlo"]',
      ),
    );
    const sectionRect = section.getBoundingClientRect();
    const cardRects = cardElements.map((card) => card.getBoundingClientRect());

    return {
      cardGaps: cardRects.slice(1).map((rect, index) => {
        const previousRect = cardRects[index];
        if (previousRect === undefined) throw new Error("Missing previous Uniqlo card");
        return rect.left - previousRect.right;
      }),
      cardRows: [...new Set(cardRects.map((rect) => Math.round(rect.top)))],
      cardWidths: cardRects.map((rect) => rect.width),
      logoWidths: logos.map((logo) => logo.getBoundingClientRect().width),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sectionLeft: sectionRect.left,
      sectionWidth: sectionRect.width,
    };
  });

  expect(layout.sectionLeft).toBeCloseTo(80, 0);
  expect(layout.sectionWidth).toBeCloseTo(1280, 0);
  expect(layout.cardRows).toHaveLength(1);
  layout.cardWidths.forEach((width) => expect(width).toBeCloseTo(200, 0));
  layout.cardGaps.forEach((gap) => expect(gap).toBeCloseTo(16, 0));
  layout.logoWidths.forEach((width) => expect(width).toBeCloseTo(18, 0));
  expect(layout.overflow).toBeLessThanOrEqual(0);
});

test("keeps the new PC Uniqlo heading logo out of the 768px tablet layout", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the tablet boundary");

  await page.setViewportSize({ height: 1000, width: 768 });
  await page.goto(`${homePath}?qa=1`);

  const rail = page.getByTestId("desktop-home-uniqlo-discovery");
  const headingLogo = rail.locator(".sazo-uniqlo-discovery-heading-mark");

  await expect(rail).toBeVisible();
  await expect(headingLogo).toBeHidden();
  await expect(rail.getByTestId("home-dense-product-card")).toHaveCount(6);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("matches the approved Figma V3 two-row PC category grid", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop project owns the PC category grid");

  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto(`${homePath}?qa=1`);

  const section = page.getByTestId("desktop-home-category-grid");
  const grid = section.locator(".sazo-desktop-home-categories-grid");
  const cards = grid.getByRole("button");

  await expect(section).toBeVisible();
  await expect(cards).toHaveCount(20);

  const layout = await section.evaluate((categorySection) => {
    const categoryGrid = categorySection.querySelector<HTMLElement>(
      ".sazo-desktop-home-categories-grid",
    );
    const categoryCards = Array.from(
      categorySection.querySelectorAll<HTMLElement>(
        ".sazo-desktop-home-categories-grid > button",
      ),
    );
    const categoryImages = Array.from(
      categorySection.querySelectorAll<HTMLElement>(
        ".sazo-desktop-home-category-image",
      ),
    );
    const firstCategoryCard = categoryCards[0];
    const firstCategoryImage = categoryImages[0];
    if (
      categoryGrid === null ||
      firstCategoryCard === undefined ||
      firstCategoryImage === undefined
    ) {
      throw new Error("Missing PC category grid content");
    }

    const sectionRect = categorySection.getBoundingClientRect();
    const cardRects = categoryCards.map((card) => card.getBoundingClientRect());
    const firstCardRect = cardRects[0];
    if (firstCardRect === undefined) throw new Error("Missing first PC category card bounds");
    const gridStyle = getComputedStyle(categoryGrid);
    const firstCardStyle = getComputedStyle(firstCategoryCard);

    return {
      cardHeight: firstCardRect.height,
      cardRadius: firstCardStyle.borderRadius,
      cardRows: [...new Set(cardRects.map((rect) => Math.round(rect.top)))],
      cardWidth: firstCardRect.width,
      columnGap: gridStyle.columnGap,
      gridRadius: gridStyle.borderRadius,
      imageWidth: firstCategoryImage.getBoundingClientRect().width,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      rowGap: gridStyle.rowGap,
      sectionLeft: sectionRect.left,
      sectionWidth: sectionRect.width,
    };
  });

  expect(layout.sectionLeft).toBeCloseTo(64, 0);
  expect(layout.sectionWidth).toBeCloseTo(1312, 0);
  expect(layout.cardRows).toHaveLength(2);
  expect(layout.cardWidth).toBeCloseTo(124, 0);
  expect(layout.cardHeight).toBeCloseTo(139, 0);
  expect(layout.columnGap).toBe("4px");
  expect(layout.rowGap).toBe("16px");
  expect(layout.cardRadius).toBe("17px");
  expect(layout.gridRadius).toBe("28px");
  expect(layout.imageWidth).toBeCloseTo(78, 0);
  expect(layout.overflow).toBeLessThanOrEqual(0);
});
