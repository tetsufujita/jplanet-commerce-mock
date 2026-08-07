import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const host = "127.0.0.1";
const port = 5_190;
const localOrigin = `http://${host}:${String(port)}`;
const routeUrl = `${localOrigin}/sazo-commerce-mock/?qa=1`;
const actualRoot = resolve("design/reproductions/sazo-commerce/qa/actual");
const viewports = Object.freeze({
  desktop: { height: 1_656, width: 3_022 },
  mobile: { height: 1_470, width: 682 },
});
const captureTimingMs = Object.freeze({
  desktop: Object.freeze({
    chatClosed: 450,
    chatOpen: 900,
    homeHero: 1_100,
    loginProvider: 1_100,
    reviews: 1_100,
  }),
  mobile: Object.freeze({
    birthday: 850,
    cards: 850,
    catalogGrid: 850,
    catalogList: 850,
    categories: 850,
    favorites: 850,
    homeHero: 850,
    loginProvider: 850,
    mypage: 850,
    phone: 850,
    profile: 850,
  }),
});

function runCommand(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.error !== undefined) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} failed with status ${String(result.status)}\n${result.stderr}`,
    );
  }

  return result.stdout.trim();
}

function convertRecording(inputPath, outputPath) {
  runCommand("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);
}

function readDuration(path) {
  const output = runCommand("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    path,
  ]);
  const duration = Number.parseFloat(output);

  assert(Number.isFinite(duration) && duration > 0, `Invalid video duration for ${path}`);

  return duration;
}

async function capturePace(page, duration) {
  await page.waitForTimeout(duration);
}

async function waitForVisible(locator) {
  await locator.waitFor({ state: "visible" });
}

async function replayDesktop(page) {
  await page.goto(routeUrl);
  await waitForVisible(page.getByTestId("sazo-hero"));
  await capturePace(page, captureTimingMs.desktop.homeHero);

  await page.getByTestId("nav-reviews").click();
  await waitForVisible(
    page.getByRole("heading", { exact: true, level: 1, name: "利用レビュー" }),
  );
  await capturePace(page, captureTimingMs.desktop.reviews);

  await page.getByTestId("chat-launcher").click();
  const chat = page.getByRole("dialog", { exact: true, name: "SAZOチャット" });
  await waitForVisible(chat);
  await capturePace(page, captureTimingMs.desktop.chatOpen);
  await page.getByTestId("chat-close").click();
  await chat.waitFor({ state: "hidden" });
  await capturePace(page, captureTimingMs.desktop.chatClosed);

  await page.getByTestId("login-launcher").click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await waitForVisible(provider);
  await waitForVisible(
    provider.getByRole("button", { exact: true, name: "Googleで続ける" }),
  );
  await capturePace(page, captureTimingMs.desktop.loginProvider);
}

async function replayMobile(page) {
  await page.goto(routeUrl);
  await waitForVisible(page.getByTestId("sazo-hero"));
  await capturePace(page, captureTimingMs.mobile.homeHero);

  const secondaryNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルサブメニュー",
  });
  await secondaryNavigation
    .getByRole("button", { exact: true, name: "カテゴリー" })
    .click();
  const categories = page.locator('[data-view-content="categories"]');
  await waitForVisible(categories);
  await capturePace(page, captureTimingMs.mobile.categories);

  await categories.getByRole("button", { exact: true, name: "スキンケア" }).click();
  const catalog = page.locator('[data-view-content="catalog"]');
  const catalogProducts = catalog.locator("[data-catalog-mode]");
  await waitForVisible(catalog);
  assert.equal(await catalogProducts.getAttribute("data-catalog-mode"), "list");
  await capturePace(page, captureTimingMs.mobile.catalogList);

  await catalog.getByRole("button", { exact: true, name: "グリッド表示" }).click();
  await expect(catalogProducts).toHaveAttribute("data-catalog-mode", "grid");
  await capturePace(page, captureTimingMs.mobile.catalogGrid);

  const mobileNavigation = page.getByRole("navigation", {
    exact: true,
    name: "モバイルメニュー",
  });
  await mobileNavigation.getByRole("button", { exact: true, name: "ログイン" }).click();
  const provider = page.getByRole("dialog", {
    exact: true,
    name: "ログイン または会員登録",
  });
  await waitForVisible(provider);
  await capturePace(page, captureTimingMs.mobile.loginProvider);
  await provider.getByRole("button", { exact: true, name: "Googleで続ける" }).click();

  await waitForVisible(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "生年月日を入力してください",
    }),
  );
  await page.getByLabel("生年月日（西暦）", { exact: true }).fill("1990-01-01");
  await capturePace(page, captureTimingMs.mobile.birthday);
  await page.getByRole("button", { exact: true, name: "次へ" }).click();

  await waitForVisible(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "電話番号を入力してください",
    }),
  );
  await page.getByLabel("電話番号", { exact: true }).fill("9012345678");
  await page.getByLabel("SAZOからのお得な情報を受け取らない", { exact: true }).check();
  await capturePace(page, captureTimingMs.mobile.phone);
  await page.getByRole("button", { exact: true, name: "次へ" }).click();

  let account = page.locator('[data-view-content="mypage"]');
  await waitForVisible(account);
  await capturePace(page, captureTimingMs.mobile.mypage);
  await account.getByRole("button", { exact: true, name: "お気に入り" }).click();

  let accountView = page.locator('[data-view-content="favorites"]');
  await waitForVisible(accountView);
  await capturePace(page, captureTimingMs.mobile.favorites);
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await waitForVisible(account);
  await account.getByRole("button", { exact: true, name: "会員情報の修正" }).click();
  accountView = page.locator('[data-view-content="profile"]');
  await waitForVisible(accountView);
  await capturePace(page, captureTimingMs.mobile.profile);
  await accountView.getByRole("button", { exact: true, name: "前の画面に戻る" }).click();

  account = page.locator('[data-view-content="mypage"]');
  await waitForVisible(account);
  await account.getByRole("button", { exact: true, name: "登録カード管理" }).click();
  accountView = page.locator('[data-view-content="cards"]');
  await waitForVisible(accountView);
  await capturePace(page, captureTimingMs.mobile.cards);
}

async function recordScenario(browser, viewportName, replay) {
  const viewport = viewports[viewportName];
  const outputDirectory = join(actualRoot, viewportName);
  const webmPath = join(outputDirectory, "recording.webm");
  const mp4Path = join(actualRoot, `${viewportName}.mp4`);
  const temporaryDirectory = await mkdtemp(join(tmpdir(), `sazo-${viewportName}-`));

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([rm(webmPath, { force: true }), rm(mp4Path, { force: true })]);

  const context = await browser.newContext({
    colorScheme: "light",
    locale: "ja-JP",
    recordVideo: { dir: temporaryDirectory, size: viewport },
    reducedMotion: "no-preference",
    viewport,
  });
  await context.route("https://**", async (route) => {
    await route.abort();
  });
  const page = await context.newPage();
  const video = page.video();

  assert(video !== null, `Video recording did not start for ${viewportName}`);

  try {
    await replay(page);
  } finally {
    await page.close();
    await context.close();
  }

  await video.saveAs(webmPath);
  await rm(temporaryDirectory, { force: true, recursive: true });
  convertRecording(webmPath, mp4Path);

  return {
    mp4Duration: readDuration(mp4Path),
    mp4Path,
    webmDuration: readDuration(webmPath),
    webmPath,
  };
}

const server = await createServer({
  logLevel: "error",
  server: { host, port, strictPort: true },
});
let browser;

try {
  await server.listen();
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const desktop = await recordScenario(browser, "desktop", replayDesktop);
  const mobile = await recordScenario(browser, "mobile", replayMobile);

  for (const [name, recording] of Object.entries({ desktop, mobile })) {
    process.stdout.write(
      `${name}: ${recording.webmPath} (${recording.webmDuration.toFixed(3)}s)\n`,
    );
    process.stdout.write(
      `${name}: ${recording.mp4Path} (${recording.mp4Duration.toFixed(3)}s)\n`,
    );
  }
} finally {
  await browser?.close();
  await server.close();
}
