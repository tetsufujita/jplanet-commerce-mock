import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import { createServer } from "vite";
import manifest from "../design/reproductions/sazo-commerce/reference-manifest.json" with { type: "json" };

const host = "127.0.0.1";
const port = 5_191;
const localOrigin = `http://${host}:${String(port)}`;
const routeUrl = `${localOrigin}/sazo-commerce-mock/?qa=1&cursor=0`;
const actualRoot = resolve("design/reproductions/sazo-commerce/qa/actual");

const checkpointStates = Object.freeze({
  "desktop/brands": { loading: "directory" },
  "desktop/chat-open": { loading: "keyword-products" },
  "desktop/home-hero": {
    heroFeed: "natural",
    heroIndex: 1,
    heroSnapshot: {
      active: "new-benefits",
      counter: "2/5",
      next: "large-furniture",
      previous: "delivery-line",
    },
  },
  "desktop/home-sections": { loading: "search-first" },
  "desktop/login-modal": {
    heroFeed: "cold-first",
    heroIndex: 1,
    heroSnapshot: {
      active: "friend-invite",
      counter: "2/5",
      next: "new-benefits",
      previous: "cold-delivery",
    },
  },
  "desktop/ranking": {
    reviewFeed: "desktop-ranking",
    reviewSnapshot: ["r05", "r04", "r03", "r01", "r02", "r06"],
  },
  "mobile/brands": { loading: "catalog" },
  "mobile/categories": { loading: "catalog" },
  "mobile/catalog-list": {
    heroFeed: "large-first",
    heroIndex: 0,
    heroSnapshot: {
      active: "large-furniture",
      counter: "1/5",
      next: "cold-delivery",
      previous: "new-benefits",
    },
  },
  "mobile/home-community": {
    heroFeed: "natural",
    heroIndex: 1,
  },
  "mobile/home-hero": {
    heroFeed: "delivery-last",
    heroIndex: 4,
    heroSnapshot: {
      active: "delivery-line",
      counter: "5/5",
      next: "new-benefits",
      previous: "friend-invite",
    },
  },
  "mobile/profile": {
    heroFeed: "large-first",
    heroIndex: 0,
    heroSnapshot: {
      active: "large-furniture",
      counter: "1/5",
      next: "cold-delivery",
      previous: "new-benefits",
    },
    reviewFeed: "mobile-profile",
    reviewSnapshot: ["r06", "r02", "r03", "r01", "r04", "r05"],
  },
  "mobile/ranking": {
    heroFeed: "natural",
    heroIndex: 1,
  },
});

function parseArguments(arguments_) {
  const selection = { checkpoint: undefined, viewport: undefined };

  for (let index = 0; index < arguments_.length; index += 2) {
    const flag = arguments_[index];
    const value = arguments_[index + 1];

    if (value === undefined || !["--checkpoint", "--viewport"].includes(flag)) {
      throw new Error(
        "Usage: node scripts/sazo-capture-checkpoints.mjs [--viewport desktop|mobile] [--checkpoint <name>]",
      );
    }

    if (flag === "--viewport") {
      if (!Object.hasOwn(manifest, value)) {
        throw new Error(`Unknown viewport: ${value}`);
      }

      selection.viewport = value;
    } else {
      selection.checkpoint = value;
    }
  }

  return selection;
}

async function waitForVisible(locator) {
  await locator.waitFor({ state: "visible" });
}

async function openHome(page, captureState) {
  const url = new URL(routeUrl);

  if (captureState.loading !== undefined) {
    url.searchParams.set("loading", captureState.loading);
  }

  if (captureState.heroFeed !== undefined) {
    url.searchParams.set("heroFeed", captureState.heroFeed);
  }

  if (captureState.heroIndex !== undefined) {
    url.searchParams.set("heroIndex", String(captureState.heroIndex));
  }

  if (captureState.reviewFeed !== undefined) {
    url.searchParams.set("reviewFeed", captureState.reviewFeed);
  }

  await page.goto(url.href, { waitUntil: "networkidle" });
  await waitForVisible(page.locator(".sazo-root"));
  await page.addStyleTag({
    content: `
      html, body { scroll-behavior: auto !important; }
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        cursor: none !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await waitForVisible(page.getByTestId("sazo-hero"));
}

async function settle(page) {
  await page.mouse.move(1, 500);
  await page.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const images = Array.from(document.images);

    for (const image of images) {
      image.loading = "eager";
    }

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolveImage, rejectImage) => {
            const timeout = window.setTimeout(() => {
              rejectImage(new Error(`Timed out loading image: ${image.currentSrc}`));
            }, 5_000);
            const finish = () => {
              window.clearTimeout(timeout);
              resolveImage();
            };

            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", finish, { once: true });
          });
        }

        await image.decode().catch(() => undefined);
      }),
    );
    for (let frame = 0; frame < 3; frame += 1) {
      await new Promise((resolveFrame) => {
        requestAnimationFrame(resolveFrame);
      });
    }
  });
}

async function scrollTo(page, selector, topOffset) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: "attached" });
  await target.evaluate((element, offset) => {
    const bounds = element.getBoundingClientRect();
    window.scrollTo({ behavior: "instant", top: window.scrollY + bounds.top - offset });
  }, topOffset);
}

async function clickMobileSecondary(page, name) {
  await page
    .getByRole("navigation", { exact: true, name: "モバイルサブメニュー" })
    .getByRole("button", { exact: true, name })
    .click();
}

async function openDesktopView(page, testId, expectedView) {
  await page.getByTestId(testId).click();
  await waitForVisible(page.locator(`[data-view-content="${expectedView}"]`));
}

async function openMobileView(page, name, expectedView) {
  await clickMobileSecondary(page, name);
  await waitForVisible(page.locator(`[data-view-content="${expectedView}"]`));
}

async function openMobileCatalog(page) {
  await openMobileView(page, "カテゴリー", "categories");
  const categories = page.locator('[data-view-content="categories"]');
  await categories.getByRole("button", { exact: true, name: "スキンケア" }).click();
  await waitForVisible(page.locator('[data-view-content="catalog"]'));
}

async function openMobilePhoneRegistration(page) {
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
  await provider.getByRole("button", { exact: true, name: "Googleで続ける" }).click();
  const chooser = page.getByTestId("sazo-google-chooser");
  await waitForVisible(chooser);
  assert.equal(await chooser.getAttribute("data-local-google-chooser"), "true");
  assert.equal(new URL(page.url()).pathname, "/sazo-commerce-mock/");
  await chooser
    .getByRole("button", {
      exact: true,
      name: "Tetsu Fujita tetsu.fujita@andes.global",
    })
    .click();
  await waitForVisible(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "生年月日を入力してください",
    }),
  );
  await page.getByLabel("生年月日（西暦）", { exact: true }).fill("2001-08-22");
  await page.getByRole("button", { exact: true, name: "次へ" }).click();
  await waitForVisible(
    page.getByRole("heading", {
      exact: true,
      level: 1,
      name: "電話番号を入力してください",
    }),
  );
}

async function completeMobileRegistration(page) {
  await openMobilePhoneRegistration(page);
  await page.getByLabel("電話番号", { exact: true }).fill("9012345678");
  await page.getByRole("button", { exact: true, name: "次へ" }).click();
  await waitForVisible(page.locator('[data-view-content="mypage"]'));
}

const desktopCaptures = Object.freeze({
  "home-hero": async () => undefined,
  "home-sections": async (page) => {
    await scrollTo(page, ".sazo-search-discovery", 70);
  },
  "chat-open": async (page) => {
    await scrollTo(page, ".sazo-keyword-section", 215);
  },
  reviews: async (page) => {
    await openDesktopView(page, "nav-reviews", "reviews");
    await settle(page);
    await scrollTo(page, ".sazo-review-masonry", -108);
  },
  gram: async (page) => {
    await scrollTo(page, ".sazo-gram-catalog-grid", 96);
  },
  ranking: async (page) => {
    await scrollTo(page, ".sazo-gram-strip", 280);
  },
  service: async (page) => {
    await page
      .locator(".sazo-desktop-nav")
      .getByRole("button", { exact: true, name: "サービス紹介" })
      .click();
    await waitForVisible(page.locator('[data-view-content="service"]'));
  },
  brands: async (page) => {
    await page
      .locator(".sazo-desktop-nav")
      .getByRole("button", { exact: true, name: "カテゴリー" })
      .click();
    await waitForVisible(page.locator('[data-view-content="categories"]'));
  },
  "login-modal": async () => undefined,
});

const mobileCaptures = Object.freeze({
  "home-hero": async () => undefined,
  "home-community": async (page) => {
    await page
      .getByRole("button", { exact: true, name: "クーポンキャンペーンを見る" })
      .click();
    await waitForVisible(page.locator('[data-campaign-loaded="false"]'));
  },
  ranking: async (page) => {
    await page
      .getByRole("button", { exact: true, name: "クーポンキャンペーンを見る" })
      .click();
    await waitForVisible(page.locator('[data-campaign-loaded="true"]'));
  },
  service: async (page) => {
    await openMobileView(page, "カテゴリー", "categories");
    await page
      .locator('[data-view-content="categories"]')
      .getByRole("button", { exact: true, name: "家電" })
      .click();
  },
  brands: async (page) => {
    await openMobileCatalog(page);
    await page
      .locator('[data-view-content="catalog"]')
      .getByRole("tab", { exact: true, name: "ベースメイク" })
      .click();
  },
  categories: async (page) => {
    await openMobileCatalog(page);
    await page
      .locator('[data-view-content="catalog"]')
      .getByRole("tab", { exact: true, name: "セット商品" })
      .click();
  },
  "catalog-list": async () => undefined,
  "catalog-grid": async (page) => {
    await page
      .getByRole("navigation", { exact: true, name: "モバイルメニュー" })
      .getByRole("button", { exact: true, name: "ログイン" })
      .click();
    const provider = page.getByRole("dialog", {
      exact: true,
      name: "ログイン または会員登録",
    });
    await waitForVisible(provider);
    await provider.getByRole("button", { exact: true, name: "Googleで続ける" }).click();
    const chooser = page.getByTestId("sazo-google-chooser");
    await waitForVisible(chooser);
    assert.equal(await chooser.getAttribute("data-local-google-chooser"), "true");
    assert.equal(page.url(), routeUrl);
  },
  login: async (page) => {
    await openMobilePhoneRegistration(page);
    assert.equal(await page.getByLabel("電話番号", { exact: true }).inputValue(), "");
  },
  registration: async (page) => {
    await completeMobileRegistration(page);
    assert.equal(await page.evaluate(() => window.scrollY), 0);
    await waitForVisible(page.locator(".sazo-member-summary"));
  },
  mypage: async (page) => {
    await completeMobileRegistration(page);
    await scrollTo(page, ".sazo-account-group:last-of-type", 213);
    const settingsBounds = await page
      .locator(".sazo-account-group:last-of-type > h2")
      .boundingBox();
    assert(settingsBounds !== null);
    assert((await page.evaluate(() => window.scrollY)) > 0);
    assert(settingsBounds.y >= 180 && settingsBounds.y <= 250);
  },
  profile: async (page) => {
    await completeMobileRegistration(page);
    await page
      .getByRole("navigation", { exact: true, name: "モバイルメニュー" })
      .getByRole("button", { exact: true, name: "ホーム" })
      .click();
    await waitForVisible(page.locator("[data-home-view]"));
    await page.evaluate(() => {
      window.scrollTo({ behavior: "instant", top: 136 });
    });
  },
});

async function captureCheckpoint(browser, viewportName, viewport, checkpoint) {
  const captures = viewportName === "desktop" ? desktopCaptures : mobileCaptures;
  const prepare = captures[checkpoint.name];
  const captureState = checkpointStates[`${viewportName}/${checkpoint.name}`] ?? {};
  const expectedCssViewport = {
    height: viewport.height / 2,
    width: viewport.width / 2,
  };

  assert(
    typeof prepare === "function",
    `Missing capture function: ${viewportName}/${checkpoint.name}`,
  );

  const context = await browser.newContext({
    colorScheme: "light",
    deviceScaleFactor: 2,
    locale: "ja-JP",
    reducedMotion: "reduce",
    viewport: expectedCssViewport,
  });
  await context.route("https://**", async (route) => {
    await route.abort();
  });
  const page = await context.newPage();
  const outputPath = join(actualRoot, viewportName, `${checkpoint.name}.png`);

  try {
    assert.deepEqual(await page.evaluate(() => [window.innerWidth, window.innerHeight]), [
      expectedCssViewport.width,
      expectedCssViewport.height,
    ]);
    await openHome(page, captureState);
    await prepare(page);
    await settle(page);
    assert.equal(
      await page.locator(".sazo-root").getAttribute("data-loading-surface"),
      captureState.loading ?? "none",
    );

    assert.equal(
      await page.locator(".sazo-root").getAttribute("data-review-feed"),
      captureState.reviewFeed ?? "natural",
    );

    if (captureState.reviewSnapshot !== undefined) {
      assert.deepEqual(
        await page
          .locator(".sazo-review-strip .sazo-review-card")
          .evaluateAll((cards) =>
            cards.map((card) => card.getAttribute("data-review-id")),
          ),
        captureState.reviewSnapshot,
      );
    }

    if (captureState.heroSnapshot !== undefined) {
      const { active, counter, next, previous } = captureState.heroSnapshot;

      assert.equal(
        await page.locator(".sazo-root").getAttribute("data-hero-feed"),
        captureState.heroFeed,
      );
      assert.equal(
        await page
          .locator('.sazo-hero-slide[data-active="true"]')
          .getAttribute("data-hero-slide"),
        active,
      );
      assert.equal(await page.getByTestId("sazo-hero-counter").innerText(), counter);
      assert.equal(
        await page
          .locator('.sazo-hero-slide[data-hero-offset="-1"]')
          .getAttribute("data-hero-slide"),
        previous,
      );
      assert.equal(
        await page
          .locator('.sazo-hero-slide[data-hero-offset="1"]')
          .getAttribute("data-hero-slide"),
        next,
      );
    }

    if (captureState.loading === "catalog") {
      await waitForVisible(page.getByRole("status", { name: "商品を検索しています" }));
      assert.equal(await page.locator(".sazo-catalog-products").count(), 0);
    } else if (captureState.loading === "directory") {
      await waitForVisible(
        page.getByRole("status", { name: "カテゴリーを読み込んでいます" }),
      );
      assert.equal(await page.locator(".sazo-category-layout").count(), 0);
    } else if (captureState.loading === "keyword-products") {
      assert.equal(await page.locator(".sazo-keyword-skeleton").count(), 5);
      assert.equal(
        await page.locator(".sazo-keyword-section .sazo-product-card").count(),
        0,
      );
    } else if (captureState.loading === "search-first") {
      const searchMedia = page.locator(".sazo-search-discovery .sazo-product-card-media");

      assert.equal(await searchMedia.count(), 4);
      assert.equal(await searchMedia.first().locator("img").count(), 0);
      assert.equal(
        await page
          .locator(".sazo-search-discovery img.sazo-recorded-product-media")
          .count(),
        3,
      );
    }
    await mkdir(join(actualRoot, viewportName), { recursive: true });
    await page.screenshot({
      animations: "disabled",
      caret: "hide",
      fullPage: false,
      path: outputPath,
      scale: "device",
    });
    const captured = PNG.sync.read(await readFile(outputPath));
    assert.deepEqual(
      { height: captured.height, width: captured.width },
      viewport,
      `Unexpected captured dimensions for ${viewportName}/${checkpoint.name}`,
    );
  } finally {
    await page.close();
    await context.close();
  }

  process.stdout.write(`${viewportName}/${checkpoint.name}: ${outputPath}\n`);
}

const selection = parseArguments(process.argv.slice(2));
const selectedRecordings = Object.entries(manifest).filter(
  ([viewportName]) =>
    selection.viewport === undefined || selection.viewport === viewportName,
);

if (selection.checkpoint !== undefined) {
  const exists = selectedRecordings.some(([, recording]) =>
    recording.checkpoints.some(({ name }) => name === selection.checkpoint),
  );

  if (!exists) {
    throw new Error(`Unknown checkpoint for selection: ${selection.checkpoint}`);
  }
}

const server = await createServer({
  logLevel: "error",
  server: { host, port, strictPort: true },
});
let browser;

try {
  await server.listen();
  browser = await chromium.launch({ channel: "chrome", headless: true });

  for (const [viewportName, recording] of selectedRecordings) {
    const outputDirectory = join(actualRoot, viewportName);

    if (selection.checkpoint === undefined) {
      await rm(outputDirectory, { force: true, recursive: true });
    }

    for (const checkpoint of recording.checkpoints) {
      if (
        selection.checkpoint === undefined ||
        selection.checkpoint === checkpoint.name
      ) {
        await captureCheckpoint(browser, viewportName, recording.viewport, checkpoint);
      }
    }

    if (viewportName === "mobile" && selection.checkpoint === undefined) {
      const registration = await readFile(join(actualRoot, "mobile", "registration.png"));
      const mypage = await readFile(join(actualRoot, "mobile", "mypage.png"));
      assert.notDeepEqual(
        registration,
        mypage,
        "mobile/registration and mobile/mypage must capture distinct scroll states",
      );
    }
  }
} finally {
  await browser?.close();
  await server.close();
}
