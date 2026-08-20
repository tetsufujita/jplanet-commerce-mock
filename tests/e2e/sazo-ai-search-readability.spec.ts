import { expect, test } from "@playwright/test";

const resultsRoute =
  "/sazo-commerce-mock/?qa=1&view=ai-search&query=New%20Balance%209060";
const initialRoute = "/sazo-commerce-mock/?qa=1&view=ai-search";

test("matches the approved AI Search v1.10 mobile chrome at 390px", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile visual contract");

  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(initialRoute);

  const search = page.locator("[data-ai-search-view]");
  const header = search.locator(".sazo-ai-search-header");
  await expect(header).toHaveCSS("height", "64px");
  await expect(header).toHaveCSS("background-color", "rgba(251, 252, 254, 0.96)");
  await expect(header).toHaveCSS("backdrop-filter", "none");

  const back = search.locator(".sazo-ai-search-back");
  await expect(back).toHaveCSS("width", "44px");
  await expect(back).toHaveCSS("height", "44px");
  expect(await back.evaluate((element) => getComputedStyle(element).backdropFilter)).toContain(
    "blur(8px)",
  );

  const bridge = search.locator(".sazo-ai-search-agent-bridge");
  await expect(bridge).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(bridge).toHaveCSS("border-radius", "18px");
  for (const side of ["top", "right", "bottom", "left"] as const) {
    await expect(bridge).toHaveCSS(`border-${side}-width`, "1px");
  }
  const paragraphLines = await bridge.locator("p").evaluate((paragraph) => {
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    return range.getClientRects().length;
  });
  expect(paragraphLines).toBe(2);

  const markAlignment = await bridge
    .locator(".sazo-ai-search-agent-bridge-intro")
    .evaluate((intro) => {
      const mark = intro.querySelector("img")?.getBoundingClientRect();
      const title = intro.querySelector("h2")?.getBoundingClientRect();
      if (mark === undefined || title === undefined) {
        throw new Error("Missing AI mark or title");
      }
      return Math.abs(mark.top + mark.height / 2 - (title.top + title.height / 2));
    });
  expect(markAlignment).toBeLessThanOrEqual(1);

  await expect(
    search.locator(".sazo-ai-search-popular .lucide-chevron-right").first(),
  ).toHaveCSS("color", "rgb(39, 76, 126)");

  const navBox = await page
    .getByRole("navigation", { name: "モバイルメニュー" })
    .boundingBox();
  expect(navBox).not.toBeNull();
  expect(navBox?.x).toBeCloseTo(11, 0);
  expect(navBox?.width).toBeCloseTo(368, 0);
  expect(navBox?.height).toBeCloseTo(68, 0);
  expect(844 - (navBox?.y ?? 0) - (navBox?.height ?? 0)).toBeCloseTo(10, 0);
});

test("keeps the mobile AI-search entry history-first and buttonless", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile entry-state contract");

  for (const width of [341, 390, 440]) {
    await page.setViewportSize({ height: 956, width });
    await page.goto(initialRoute);

    const main = page.locator(".sazo-ai-search-main");
    const bridge = main.getByRole("region", {
      name: "欲しい商品を、J-Planetに相談",
    });
    const popular = main.getByRole("region", { name: "今、人気の検索" });

    await expect(main).toBeVisible();
    expect(
      await main.locator(":scope > section").evaluateAll((sections) =>
        sections.map((section) => section.className),
      ),
    ).toEqual([
      "sazo-ai-search-recent",
      "sazo-ai-search-agent-bridge",
      "sazo-ai-search-popular",
    ]);
    await expect(bridge).toContainText(
      "日本の商品を、ブラジルで買える条件まで確認します。",
    );
    await expect(bridge.locator("button, a, input")).toHaveCount(0);
    for (const label of ["販売元", "購入可否", "関税・配送", "BRL総額"]) {
      await expect(bridge.getByText(label, { exact: true })).toBeVisible();
    }

    await expect(main.getByText("AI検索で商品を探してみよう！")).toHaveCount(0);
    await expect(main.getByRole("button", { name: "写真から探す" })).toHaveCount(0);
    await expect(main.getByRole("button", { name: "URLを貼る" })).toHaveCount(0);
    await expect(main.getByRole("button", { name: "商品名を入力" })).toHaveCount(0);

    await expect(popular.getByRole("button")).toHaveCount(5);
    await expect(popular.locator(".lucide-chevron-right")).toHaveCount(5);
    for (const label of [
      "New Balance 9060",
      "Nintendo Switch",
      "ユニクロ",
      "SK-II 化粧水",
      "アネッサ 日焼け止め",
    ]) {
      await expect(
        popular.getByRole("button", { exact: true, name: label }),
      ).toBeVisible();
    }

    await expect(bridge.locator("h2")).toHaveCSS("font-size", "16px");
    await expect(bridge.locator("p")).toHaveCSS("font-size", "14px");
    for (const item of await bridge.locator("li").all()) {
      await expect(item).toHaveCSS("font-size", "14px");
    }

    const fixedUi = await page.evaluate(() => {
      const box = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (element === null) throw new Error(`Missing ${selector}`);
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, top: rect.top };
      };

      return {
        chat: box(".sazo-chat-button"),
        nav: box(".sazo-mobile-nav"),
        overflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(fixedUi.overflow).toBeLessThanOrEqual(0);
    expect(fixedUi.chat.bottom).toBeLessThanOrEqual(fixedUi.nav.top);

    await main
      .getByRole("button", { name: "すべての検索履歴を削除" })
      .click();
    await expect(main.getByText("最近の検索")).toHaveCount(0);
    expect(
      await main.locator(":scope > section").evaluateAll((sections) =>
        sections.map((section) => section.className),
      ),
    ).toEqual(["sazo-ai-search-agent-bridge", "sazo-ai-search-popular"]);
  }
});

test("keeps mobile AI-search cards within the approved v1.10 product hierarchy", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile typography contract");

  for (const width of [341, 390, 440]) {
    await page.setViewportSize({ height: 956, width });
    await page.goto(resultsRoute);

    const results = page.locator("[data-ai-search-results]");
    const firstProduct = results.locator(".sazo-ai-search-result-group li").first();
    const productCopy = firstProduct.locator(".sazo-ai-search-result-copy");
    await expect(productCopy).toBeVisible();

    const sourceLogos = results.locator(".sazo-ai-search-source-logo img");
    await expect(sourceLogos).toHaveCount(9);
    await expect(results.getByText("J-Planet", { exact: true })).toHaveCount(0);

    const sourceLogoUrls = await sourceLogos.evaluateAll((logos) =>
      logos.map((logo) => (logo as HTMLImageElement).src),
    );
    expect(new Set(sourceLogoUrls).size).toBeGreaterThanOrEqual(3);

    const sourceLogoBox = await sourceLogos.first().boundingBox();
    expect(sourceLogoBox).not.toBeNull();
    expect(sourceLogoBox?.width).toBeGreaterThanOrEqual(14);
    expect(sourceLogoBox?.width).toBeLessThanOrEqual(16);
    expect(Math.abs((sourceLogoBox?.width ?? 0) - (sourceLogoBox?.height ?? 0))).toBeLessThan(
      1,
    );

    const typography = await productCopy.evaluate((copy) => {
      const styleOf = (selector: string) => {
        const element = copy.querySelector<HTMLElement>(selector);
        if (element === null) throw new Error(`Missing ${selector}`);
        const style = getComputedStyle(element);

        return {
          backgroundColor: style.backgroundColor,
          fontFamily: style.fontFamily,
          fontSize: Number.parseFloat(style.fontSize),
          fontWeight: Number.parseInt(style.fontWeight, 10),
          letterSpacing: Number.parseFloat(style.letterSpacing),
          lineHeight: Number.parseFloat(style.lineHeight),
        };
      };

      return {
        price: styleOf("b"),
        title: styleOf("strong"),
      };
    });

    expect(typography.title.fontFamily).toContain("Noto Sans JP Variable");
    expect(typography.title.fontSize).toBe(13);
    expect(typography.title.lineHeight).toBeGreaterThanOrEqual(18);
    expect(typography.title.fontWeight).toBeGreaterThanOrEqual(700);
    expect(typography.title.letterSpacing).toBeGreaterThanOrEqual(0);
    expect(typography.price.fontSize).toBe(18);
    expect(typography.price.fontWeight).toBeGreaterThanOrEqual(800);

    const image = firstProduct.locator(".sazo-ai-search-result-image");
    const imageBox = await image.boundingBox();
    expect(imageBox).not.toBeNull();
    expect((imageBox?.width ?? 0) / (imageBox?.height ?? 1)).toBeCloseTo(1.07, 1);

    const sectionHeading = results.locator(".sazo-ai-search-result-group h2").first();
    const sectionHeadingWeight = await sectionHeading.evaluate((element) =>
      Number.parseInt(getComputedStyle(element).fontWeight, 10),
    );
    expect(sectionHeadingWeight).toBeGreaterThanOrEqual(800);

    await expect(results.getByText("日本から直送", { exact: true })).toHaveCount(0);
    await expect(results.getByText("見積確認", { exact: true })).toHaveCount(0);
    await expect(results.getByText("状態確認", { exact: true })).toHaveCount(0);

    const cardSeparation = await firstProduct.evaluate((product) => {
      const style = getComputedStyle(product);
      return {
        borderBottomWidth: style.borderBottomWidth,
        borderLeftWidth: style.borderLeftWidth,
        borderRightWidth: style.borderRightWidth,
        borderTopWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
      };
    });
    expect(cardSeparation).toEqual(
      expect.objectContaining({
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
        borderRightWidth: "1px",
        borderTopWidth: "1px",
      }),
    );
    expect(cardSeparation.boxShadow).not.toBe("none");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
