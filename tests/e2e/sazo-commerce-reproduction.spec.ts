import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { height: 828, width: 1_511 };
const mobileViewport = { height: 735, width: 341 };
const localOrigin = "http://127.0.0.1:5190";
const routePath = "/sazo-commerce-mock/?qa=1";

function trackExternalRequests(page: Page) {
  const externalRequests: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());

    if (url.protocol.startsWith("http") && url.origin !== localOrigin) {
      externalRequests.push(request.url());
    }
  });

  return externalRequests;
}

function applicationExternalRequests(requests: readonly string[]) {
  return requests.filter((request) => {
    const hostname = new URL(request).hostname;

    return hostname !== "fonts.googleapis.com" && hostname !== "fonts.gstatic.com";
  });
}

function isMobilePickRequest(url: string) {
  return new URL(url).pathname.startsWith("/sazo-commerce/mobile-picks/");
}

function trackMobilePickFailures(page: Page) {
  const failures: string[] = [];

  page.on("requestfailed", (request) => {
    if (isMobilePickRequest(request.url())) {
      failures.push(`${request.url()}: ${request.failure()?.errorText ?? "request failed"}`);
    }
  });
  page.on("response", (response) => {
    if (isMobilePickRequest(response.url()) && !response.ok()) {
      failures.push(`${response.url()}: HTTP ${String(response.status())}`);
    }
  });

  return failures;
}

async function expectLoadedMobilePicks(page: Page, failures: readonly string[]) {
  const images = page.locator(
    '[data-mobile-picks-grid] img[src^="/sazo-commerce/mobile-picks/"]',
  );

  await expect(images).toHaveCount(31);
  await expect
    .poll(() =>
      images.evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              element instanceof HTMLImageElement &&
              (!element.complete || element.naturalWidth <= 0),
          )
          .map((element) => (element as HTMLImageElement).src),
      ),
    )
    .toEqual([]);
  expect(failures).toEqual([]);
}

async function replayDesktopScenario(page: Page) {
  const externalRequests = trackExternalRequests(page);

  await page.goto(routePath);
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  externalRequests.length = 0;

  await page.getByTestId("nav-reviews").click();
  await expect(
    page.getByRole("heading", { exact: true, level: 1, name: "利用レビュー" }),
  ).toBeVisible();

  await page.getByTestId("chat-launcher").click();
  const chat = page.getByRole("dialog", { exact: true, name: "J-Planetチャット" });
  await expect(chat).toBeVisible();
  await page.getByTestId("chat-close").click();
  await expect(chat).toBeHidden();

  await page.getByTestId("login-launcher").click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await expect(provider).toBeVisible();
  await expect(
    provider.getByRole("button", { exact: true, name: "Googleで続ける" }),
  ).toBeVisible();
  expect(applicationExternalRequests(externalRequests)).toEqual([]);
}

async function replayMobileScenario(page: Page) {
  const externalRequests = trackExternalRequests(page);
  const mobilePickFailures = trackMobilePickFailures(page);

  await page.goto(routePath);
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  await expectLoadedMobilePicks(page, mobilePickFailures);
  externalRequests.length = 0;

  const mobileSecondaryNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルサブメニュー",
  });
  await expect(mobileSecondaryNavigation).toBeVisible();
  await expect(mobileSecondaryNavigation.getByRole("button")).toHaveCount(5);
  await expect(
    page
      .getByRole("group", { exact: true, name: "J-Planetショートカット" })
      .getByRole("button"),
  ).toHaveCount(5);

  const topLauncher = page.getByRole("button", {
    exact: true,
    name: "何を注文しますか？",
  });
  await topLauncher.click();
  let agent = page.getByRole("dialog", {
    exact: true,
    name: "J-Planet AIエージェント",
  });
  const background = page.locator(".sazo-shell-background");
  const textbox = agent.getByRole("textbox");

  await expect(agent).toBeVisible();
  await expect(textbox).toBeFocused();
  await expect(background).toHaveAttribute("inert", "");
  await expect(agent.locator('input[type="file"]')).toHaveCSS("display", "none");
  await expect(agent.getByRole("button", { exact: true, name: "画像を追加" })).toHaveCount(
    1,
  );
  await page.keyboard.press("Tab");
  await expect(agent.getByRole("button", { exact: true, name: "閉じる" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(textbox).toBeFocused();
  await agent.getByRole("button", { exact: true, name: "閉じる" }).click();
  await expect(agent).toBeHidden();
  await expect(topLauncher).toBeFocused();
  await expect(background).not.toHaveAttribute("inert", "");

  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  await mobileNavigation
    .getByRole("button", { exact: true, name: "エージェント" })
    .click();
  const agentNavigation = mobileNavigation.getByRole("button", {
    exact: true,
    name: "エージェント",
  });
  const hub = page.locator("[data-mobile-agent-hub]");
  await expect(hub).toBeVisible();
  await expect(hub.getByRole("heading", { exact: true, name: "最近の相談" })).toBeVisible();
  await expect(hub.getByRole("heading", { exact: true, name: "最近見た商品" })).toBeVisible();
  await expect(
    hub.getByRole("heading", {
      exact: true,
      name: "ブラジルで人気の日本アイテム",
    }),
  ).toBeVisible();
  await expect(agentNavigation).toHaveAttribute("aria-pressed", "true");

  await hub.getByRole("button", { exact: true, name: "最近の相談を削除" }).click();
  await expect(hub.getByText("日本限定スニーカーを探したい", { exact: true })).toHaveCount(
    0,
  );
  await expect(hub.getByRole("button", { name: /商品詳細を見る/ })).toHaveCount(3);

  await hub.getByRole("button", { name: /商品詳細を見る/ }).first().click();
  const product = page.locator("[data-product-detail]");
  await expect(product).toBeVisible();
  await product.locator(".sazo-product-detail-header .sazo-product-detail-back").click();
  await expect(hub).toBeVisible();
  await expect(agentNavigation).toHaveAttribute("aria-pressed", "true");

  await hub.getByRole("button", { exact: true, name: "AIエージェントに相談" }).click();
  agent = page.getByRole("dialog", {
    exact: true,
    name: "J-Planet AIエージェント",
  });
  await expect(agent).toBeVisible();
  await agent.getByRole("textbox").fill("日本限定スニーカー");
  const submit = agent.getByRole("button", { exact: true, name: "AIに探してもらう" });
  const [submitBackground, sakuraColor] = await Promise.all([
    submit.evaluate((element) => getComputedStyle(element).backgroundColor),
    page.locator(".sazo-root").evaluate((element) => {
      const swatch = document.createElement("span");
      swatch.style.color = getComputedStyle(element).getPropertyValue("--jplanet-sakura");
      document.body.append(swatch);
      const color = getComputedStyle(swatch).color;
      swatch.remove();

      return color;
    }),
  ]);
  expect(submitBackground).toBe(sakuraColor);
  await submit.click();
  const catalog = page.locator('[data-view-content="catalog"]');
  const catalogProducts = catalog.locator("[data-catalog-mode]");
  await expect(catalog).toBeVisible();
  await expect(catalogProducts).toHaveAttribute("data-catalog-mode", "list");
  await catalog.getByRole("button", { exact: true, name: "グリッド表示" }).click();
  await expect(catalogProducts).toHaveAttribute("data-catalog-mode", "grid");

  await mobileNavigation
    .getByRole("button", { exact: true, name: "マイページ" })
    .click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await expect(provider).toBeVisible();
  await provider.getByRole("button", { exact: true, name: "Googleで続ける" }).click();
  const chooser = page.getByTestId("sazo-google-chooser");
  await expect(chooser).toHaveAttribute("data-local-google-chooser", "true");
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);
  await chooser
    .getByRole("button", {
      exact: true,
      name: "Tetsu Fujita tetsu.fujita@andes.global",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "生年月日を入力してください",
    }),
  ).toBeVisible();
  await page.getByLabel("生年月日（西暦）", { exact: true }).fill("1990-01-01");
  await page.getByRole("button", { exact: true, name: "次へ" }).click();

  await expect(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "電話番号を入力してください",
    }),
  ).toBeVisible();
  await page.getByLabel("電話番号", { exact: true }).fill("9012345678");
  await page
    .getByLabel("J-Planetからのお得な情報を受け取らない", { exact: true })
    .check();
  await page.getByRole("button", { exact: true, name: "次へ" }).click();

  let account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await expect(
    account.getByRole("heading", { exact: true, level: 1, name: "マイページ" }),
  ).toBeVisible();

  await account.getByRole("button", { exact: true, name: "お気に入り" }).click();
  let accountView = page.locator('[data-view-content="favorites"]');
  await expect(accountView).toBeVisible();
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await account.getByRole("button", { exact: true, name: "会員情報の修正" }).click();
  accountView = page.locator('[data-view-content="profile"]');
  await expect(accountView).toBeVisible();
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await expect(account).toBeVisible();
  await account.getByRole("button", { exact: true, name: "登録カード管理" }).click();
  accountView = page.locator('[data-view-content="cards"]');
  await expect(accountView).toBeVisible();
  await expect(
    accountView.getByRole("heading", {
      exact: true,
      level: 2,
      name: "登録されているカードがありません。",
    }),
  ).toBeVisible();
  expect(applicationExternalRequests(externalRequests)).toEqual([]);
}

test("replays the deterministic SAZO commerce journey", async ({ page }, testInfo) => {
  expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2);

  if (testInfo.project.name === "desktop") {
    expect(page.viewportSize()).toEqual(desktopViewport);
    await replayDesktopScenario(page);

    return;
  }

  expect(testInfo.project.name).toBe("mobile");
  expect(page.viewportSize()).toEqual(mobileViewport);
  await replayMobileScenario(page);
});
