import { expect, test } from "@playwright/test";

const couponRoute = "/sazo-commerce-mock/?qa=1&view=coupons";

test("matches the approved coupon V5 hierarchy at 341, 390, and 440px", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project owns the coupon V5 layout");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(couponRoute);

    const wallet = page.getByTestId("jplanet-coupons");
    const tickets = page.getByTestId("jplanet-coupon-ticket");
    await expect(wallet).toBeVisible();
    await expect(tickets).toHaveCount(4);

    const metrics = await wallet.evaluate((element) => {
      const required = <T extends Element>(selector: string) => {
        const match = element.querySelector<T>(selector);
        if (match === null) throw new Error(`Missing coupon V5 element: ${selector}`);
        return match;
      };
      const style = (selector: string) => getComputedStyle(required<HTMLElement>(selector));
      const rect = (selector: string) => required<HTMLElement>(selector).getBoundingClientRect();
      const number = (value: string) => Number.parseFloat(value);

      const header = rect(".sazo-coupon-center-header");
      const tabs = rect(".sazo-coupon-tabs");
      const actions = rect(".sazo-coupon-actions");
      const list = rect(".sazo-coupon-ticket-list");
      const ticket = rect(".sazo-coupon-ticket");
      const body = rect(".sazo-coupon-ticket-body");
      const footer = rect(".sazo-coupon-ticket-footer");
      const icon = rect(".sazo-coupon-ticket-icon");
      const cta = rect(".sazo-coupon-ticket-footer > button:last-child");

      return {
        actionsHeight: actions.height,
        actionType: {
          fontSize: style(".sazo-coupon-actions button").fontSize,
          fontWeight: style(".sazo-coupon-actions button").fontWeight,
          lineHeight: style(".sazo-coupon-actions button").lineHeight,
        },
        bodyHeight: body.height,
        card: {
          borderRadius: style(".sazo-coupon-ticket").borderRadius,
          boxShadow: style(".sazo-coupon-ticket").boxShadow,
          height: ticket.height,
          width: ticket.width,
        },
        cta: { height: cta.height, width: cta.width },
        ctaType: {
          fontSize: style(".sazo-coupon-ticket-footer > button:last-child").fontSize,
          fontWeight: style(".sazo-coupon-ticket-footer > button:last-child").fontWeight,
          lineHeight: style(".sazo-coupon-ticket-footer > button:last-child").lineHeight,
        },
        discountType: {
          fontSize: style(".sazo-coupon-ticket-main > strong").fontSize,
          fontWeight: style(".sazo-coupon-ticket-main > strong").fontWeight,
          letterSpacing: style(".sazo-coupon-ticket-main > strong").letterSpacing,
          lineHeight: style(".sazo-coupon-ticket-main > strong").lineHeight,
        },
        footerHeight: footer.height,
        headerHeight: header.height,
        historyType: {
          fontSize: style(".sazo-coupon-history-link").fontSize,
          fontWeight: style(".sazo-coupon-history-link").fontWeight,
          lineHeight: style(".sazo-coupon-history-link").lineHeight,
        },
        icon: {
          borderRadius: style(".sazo-coupon-ticket-icon").borderRadius,
          height: icon.height,
          width: icon.width,
        },
        list: {
          background: style(".sazo-coupon-ticket-list").backgroundColor,
          columnGap: number(style(".sazo-coupon-ticket-list").columnGap),
          paddingLeft: number(style(".sazo-coupon-ticket-list").paddingLeft),
          paddingRight: number(style(".sazo-coupon-ticket-list").paddingRight),
          rowGap: number(style(".sazo-coupon-ticket-list").rowGap),
          width: list.width,
        },
        nameType: {
          fontSize: style(".sazo-coupon-ticket h2").fontSize,
          fontWeight: style(".sazo-coupon-ticket h2").fontWeight,
          lineHeight: style(".sazo-coupon-ticket h2").lineHeight,
        },
        rootFontFamily: getComputedStyle(element).fontFamily,
        tabsHeight: tabs.height,
        tabType: {
          defaultWeight: style('.sazo-coupon-tabs button[aria-selected="false"]').fontWeight,
          fontSize: style(".sazo-coupon-tabs button").fontSize,
          lineHeight: style(".sazo-coupon-tabs button").lineHeight,
          selectedWeight: style('.sazo-coupon-tabs button[aria-selected="true"]').fontWeight,
        },
        titleType: {
          fontSize: style(".sazo-coupon-center-header h1").fontSize,
          fontWeight: style(".sazo-coupon-center-header h1").fontWeight,
          letterSpacing: style(".sazo-coupon-center-header h1").letterSpacing,
          lineHeight: style(".sazo-coupon-center-header h1").lineHeight,
        },
      };
    });

    expect(metrics.headerHeight).toBe(60);
    expect(metrics.tabsHeight).toBe(52);
    expect(metrics.actionsHeight).toBe(56);
    expect(metrics.bodyHeight).toBe(124);
    expect(metrics.footerHeight).toBe(56);
    expect(metrics.card).toMatchObject({
      borderRadius: "8px",
      boxShadow: "none",
      height: 180,
      width: viewport.width - 24,
    });
    expect(metrics.list).toMatchObject({
      background: "rgb(245, 246, 248)",
      columnGap: 10,
      paddingLeft: 12,
      paddingRight: 12,
      rowGap: 10,
      width: viewport.width,
    });
    expect(metrics.icon).toEqual({ borderRadius: "10px", height: 48, width: 48 });
    expect(metrics.cta).toEqual({ height: 44, width: 100 });
    expect(metrics.rootFontFamily.startsWith('"Noto Sans JP Variable"')).toBe(true);
    expect(metrics.titleType).toEqual({
      fontSize: "17px",
      fontWeight: "700",
      letterSpacing: "-0.2px",
      lineHeight: "24px",
    });
    expect(metrics.actionType).toEqual({
      fontSize: "13.5px",
      fontWeight: "500",
      lineHeight: "20px",
    });
    expect(metrics.historyType).toEqual({
      fontSize: "12.5px",
      fontWeight: "500",
      lineHeight: "18px",
    });
    expect(metrics.tabType).toEqual({
      defaultWeight: "500",
      fontSize: "13px",
      lineHeight: "20px",
      selectedWeight: "700",
    });
    expect(metrics.nameType).toEqual({
      fontSize: "13px",
      fontWeight: "500",
      lineHeight: "20px",
    });
    expect(metrics.discountType).toEqual({
      fontSize: "27px",
      fontWeight: "700",
      letterSpacing: "-0.3px",
      lineHeight: "32px",
    });
    expect(metrics.ctaType).toEqual({
      fontSize: "13.5px",
      fontWeight: "700",
      lineHeight: "20px",
    });

    await expect(wallet.locator(".sazo-coupon-ticket-ribbon")).toHaveCount(4);
    await expect(wallet.locator(".sazo-coupon-ticket-ribbon")).toHaveText([
      "送料",
      "初回",
      "残り3枚",
      "残り2枚",
    ]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
  }
});

test("keeps the coupon V5 treatment below the 768px boundary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project owns the coupon boundary check");

  await page.setViewportSize({ height: 900, width: 768 });
  await page.goto(couponRoute);

  await expect(page.getByTestId("jplanet-coupons")).toBeVisible();
  await expect(page.locator(".sazo-coupon-ticket-ribbon")).toHaveCount(4);
  await expect(page.locator(".sazo-coupon-ticket-ribbon").first()).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath("coupon-v6-boundary-768.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

test("stacks a filtered coupon list from the top without stretching its rows", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project owns the coupon V6 stack");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(couponRoute);
    await page.getByRole("tab", { name: "配送 (2)" }).click();

    const tickets = page.getByTestId("jplanet-coupon-ticket");
    await expect(tickets).toHaveCount(2);
    const layout = await page.locator(".sazo-coupon-ticket-list").evaluate((list) => {
      const cards = [...list.querySelectorAll<HTMLElement>(".sazo-coupon-ticket")].map((card) =>
        card.getBoundingClientRect(),
      );
      const listStyle = getComputedStyle(list);
      return {
        alignContent: listStyle.alignContent,
        firstTop: Math.round(cards[0]?.top ?? 0),
        gap: Math.round((cards[1]?.top ?? 0) - (cards[0]?.bottom ?? 0)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(layout).toEqual({ alignContent: "start", firstTop: 180, gap: 10, overflow: 0 });
    await page.screenshot({
      path: testInfo.outputPath(`coupon-v6-filtered-${viewport.width}.png`),
    });
  }
});

test("uses the approved mobile bottom sheet and one-column discovery tickets", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project owns the coupon V6 states");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(couponRoute);
    await page.getByRole("button", { name: "コードを入力" }).click();

    const codeForm = page.getByRole("form", { name: "クーポンコードを入力" });
    const applyButton = codeForm.getByRole("button", { name: "適用" });
    await expect(codeForm).toBeVisible();
    await expect(applyButton).toBeDisabled();
    const sheetLayout = await codeForm.evaluate((form) => {
      const input = form.querySelector<HTMLInputElement>("input");
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (input === null || submit === null) throw new Error("Missing coupon code controls");
      const formRect = form.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const submitRect = submit.getBoundingClientRect();
      return {
        bottom: Math.round(formRect.bottom),
        formWidth: Math.round(formRect.width),
        inputHeight: Math.round(inputRect.height),
        inputWidth: Math.round(inputRect.width),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        submitHeight: Math.round(submitRect.height),
        submitWidth: Math.round(submitRect.width),
      };
    });
    expect(sheetLayout).toEqual({
      bottom: viewport.height,
      formWidth: viewport.width,
      inputHeight: 52,
      inputWidth: viewport.width - 32,
      overflow: 0,
      submitHeight: 48,
      submitWidth: viewport.width - 32,
    });
    await page.screenshot({
      path: testInfo.outputPath(`coupon-v6-code-${viewport.width}.png`),
    });

    await codeForm.getByRole("button", { name: "閉じる" }).click();
    await page.getByRole("button", { name: "クーポンを探す" }).click();
    const discover = page.locator(".sazo-coupon-discover");
    const discoveryTickets = discover.getByTestId("jplanet-coupon-ticket");
    await expect(discoveryTickets).toHaveCount(4);
    await expect(discover.getByRole("button", { name: "取得する" })).toHaveCount(3);
    await expect(discover.getByRole("button", { name: "配布終了" })).toBeDisabled();

    const discoveryLayout = await discover.evaluate((main) => {
      const list = main.querySelector<HTMLElement>(".sazo-coupon-ticket-list");
      const cards = [...main.querySelectorAll<HTMLElement>(".sazo-coupon-ticket")].map((card) =>
        card.getBoundingClientRect(),
      );
      if (list === null) throw new Error("Missing discovery coupon ticket list");
      return {
        columns: getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length,
        firstHeight: Math.round(cards[0]?.height ?? 0),
        firstWidth: Math.round(cards[0]?.width ?? 0),
        gap: Math.round((cards[1]?.top ?? 0) - (cards[0]?.bottom ?? 0)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(discoveryLayout).toEqual({
      columns: 1,
      firstHeight: 180,
      firstWidth: viewport.width - 24,
      gap: 10,
      overflow: 0,
    });
    await page.screenshot({
      fullPage: true,
      path: testInfo.outputPath(`coupon-v6-discover-${viewport.width}.png`),
    });
  }
});

test("uses the approved coupon ticket hierarchy for used and expired history", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project owns coupon history V7");

  for (const viewport of [
    { height: 735, width: 341 },
    { height: 844, width: 390 },
    { height: 956, width: 440 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(couponRoute);
    await page.getByRole("button", { name: "利用履歴" }).click();

    const history = page.locator(".sazo-coupon-history");
    await expect(history).toBeVisible();
    await expect(history.getByRole("tab", { name: "使用済み" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const readLayout = () =>
      history.evaluate((main) => {
        const required = <T extends Element>(selector: string) => {
          const match = main.querySelector<T>(selector);
          if (match === null) throw new Error(`Missing coupon history V7 element: ${selector}`);
          return match;
        };
        const rect = (selector: string) =>
          required<HTMLElement>(selector).getBoundingClientRect();
        const style = (selector: string) => getComputedStyle(required<HTMLElement>(selector));
        const tablist = rect('[role="tablist"]');
        const card = rect("article");
        const icon = rect(".sazo-coupon-history-icon");
        const cta = rect("article > button");

        return {
          background: getComputedStyle(main).backgroundColor,
          card: {
            borderRadius: style("article").borderRadius,
            boxShadow: style("article").boxShadow,
            height: Math.round(card.height),
            top: Math.round(card.top),
            width: Math.round(card.width),
          },
          cta: {
            borderRadius: style("article > button").borderRadius,
            fontSize: style("article > button").fontSize,
            fontWeight: style("article > button").fontWeight,
            height: Math.round(cta.height),
            width: Math.round(cta.width),
          },
          discountType: {
            fontSize: style("article p strong").fontSize,
            fontWeight: style("article p strong").fontWeight,
            letterSpacing: style("article p strong").letterSpacing,
            lineHeight: style("article p strong").lineHeight,
          },
          icon: {
            borderRadius: style(".sazo-coupon-history-icon").borderRadius,
            height: Math.round(icon.height),
            width: Math.round(icon.width),
          },
          nameType: {
            fontSize: style("article h2").fontSize,
            fontWeight: style("article h2").fontWeight,
            lineHeight: style("article h2").lineHeight,
          },
          overflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          supportingType: {
            fontSize: style("article p span").fontSize,
            lineHeight: style("article p span").lineHeight,
          },
          tablist: {
            height: Math.round(tablist.height),
            width: Math.round(tablist.width),
          },
        };
      });

    const usedLayout = await readLayout();
    expect(usedLayout).toEqual({
      background: "rgb(245, 246, 248)",
      card: {
        borderRadius: "8px",
        boxShadow: "none",
        height: 180,
        top: 132,
        width: viewport.width - 24,
      },
      cta: {
        borderRadius: "7px",
        fontSize: "13.5px",
        fontWeight: "700",
        height: 44,
        width: 100,
      },
      discountType: {
        fontSize: "27px",
        fontWeight: "700",
        letterSpacing: "-0.3px",
        lineHeight: "32px",
      },
      icon: { borderRadius: "10px", height: 48, width: 48 },
      nameType: { fontSize: "13px", fontWeight: "500", lineHeight: "20px" },
      overflow: 0,
      supportingType: { fontSize: "12px", lineHeight: "18px" },
      tablist: { height: 56, width: viewport.width },
    });
    await page.screenshot({
      path: testInfo.outputPath(`coupon-history-v7-used-${viewport.width}.png`),
    });

    await history.getByRole("tab", { name: "期限切れ" }).click();
    await expect(history.getByText("夏の国際送料 R$20 OFF")).toBeVisible();
    await expect(history.getByRole("button", { name: "注文を見る" })).toBeEnabled();
    expect(await readLayout()).toEqual(usedLayout);
    await page.screenshot({
      path: testInfo.outputPath(`coupon-history-v7-expired-${viewport.width}.png`),
    });
  }

  await page.getByRole("button", { name: "注文を見る" }).click();
  await expect(page.getByText("注文履歴").first()).toBeVisible();
});

test("keeps coupon history V7 mobile-only at the 768px boundary", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project owns coupon history boundary");

  await page.setViewportSize({ height: 900, width: 768 });
  await page.goto(couponRoute);

  await expect(page.getByTestId("jplanet-coupons")).toBeVisible();
  await expect(page.locator(".sazo-mobile-shell")).toBeHidden();
  await expect(page.locator(".sazo-coupon-history")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("coupon-history-v7-boundary-768.png") });
});
