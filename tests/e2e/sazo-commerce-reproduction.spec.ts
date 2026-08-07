import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { height: 1_656, width: 3_022 };
const mobileViewport = { height: 1_470, width: 682 };
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
  const chat = page.getByRole("dialog", { exact: true, name: "SAZOチャット" });
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
  expect(externalRequests).toEqual([]);
}

async function replayMobileScenario(page: Page) {
  const externalRequests = trackExternalRequests(page);

  await page.goto(routePath);
  await expect(page).toHaveURL(`${localOrigin}${routePath}`);
  await expect(page.getByTestId("sazo-hero")).toBeVisible();
  externalRequests.length = 0;

  const secondaryNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルサブメニュー",
  });
  await secondaryNavigation
    .getByRole("button", { exact: true, name: "カテゴリー" })
    .click();
  const categories = page.locator('[data-view-content="categories"]');
  await expect(categories).toBeVisible();
  await categories.getByRole("button", { exact: true, name: "スキンケア" }).click();

  const catalog = page.locator('[data-view-content="catalog"]');
  const catalogProducts = catalog.locator("[data-catalog-mode]");
  await expect(catalog).toBeVisible();
  await expect(catalogProducts).toHaveAttribute("data-catalog-mode", "list");
  await catalog.getByRole("button", { exact: true, name: "グリッド表示" }).click();
  await expect(catalogProducts).toHaveAttribute("data-catalog-mode", "grid");

  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  await mobileNavigation.getByRole("button", { exact: true, name: "ログイン" }).click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await expect(provider).toBeVisible();
  await provider.getByRole("button", { exact: true, name: "Googleで続ける" }).click();

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
  await page.getByLabel("SAZOからのお得な情報を受け取らない", { exact: true }).check();
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
  expect(externalRequests).toEqual([]);
}

test("replays the deterministic SAZO commerce journey", async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop") {
    expect(page.viewportSize()).toEqual(desktopViewport);
    await replayDesktopScenario(page);

    return;
  }

  expect(testInfo.project.name).toBe("mobile");
  expect(page.viewportSize()).toEqual(mobileViewport);
  await replayMobileScenario(page);
});
