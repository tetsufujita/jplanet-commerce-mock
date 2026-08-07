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

async function openHome(page) {
  await page.goto(routeUrl, { waitUntil: "networkidle" });
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

    const visibleImages = Array.from(document.images).filter((image) => {
      const bounds = image.getBoundingClientRect();

      return (
        bounds.bottom > 0 &&
        bounds.right > 0 &&
        bounds.top < window.innerHeight &&
        bounds.left < window.innerWidth
      );
    });

    await Promise.all(
      visibleImages.map(async (image) => image.decode().catch(() => undefined)),
    );
    await new Promise((resolveFrame) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolveFrame);
      });
    });
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

async function advanceHero(page, count) {
  const nextButton = page.locator(".sazo-hero-arrow-next");

  for (let index = 0; index < count; index += 1) {
    if (await nextButton.isVisible()) {
      await nextButton.click();
    } else {
      await nextButton.evaluate((button) => {
        button.click();
      });
    }
  }
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
  "home-hero": async (page) => {
    await advanceHero(page, 1);
  },
  "home-sections": async (page) => {
    await scrollTo(page, ".sazo-search-discovery", 235);
  },
  "chat-open": async (page) => {
    await scrollTo(page, ".sazo-keyword-section", 215);
  },
  reviews: async (page) => {
    await openDesktopView(page, "nav-reviews", "reviews");
    await scrollTo(page, ".sazo-review-masonry", -120);
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
      .getByRole("button", { exact: true, name: "人気ブランド" })
      .click();
    await waitForVisible(page.locator('[data-view-content="brands"]'));
  },
  "login-modal": async (page) => {
    await advanceHero(page, 4);
  },
});

const mobileCaptures = Object.freeze({
  "home-hero": async () => undefined,
  "home-community": async (page) => {
    await advanceHero(page, 1);
    await page
      .getByRole("button", { exact: true, name: "クーポンキャンペーンを見る" })
      .click();
    await waitForVisible(page.locator('[data-campaign-loaded="false"]'));
  },
  ranking: async (page) => {
    await advanceHero(page, 1);
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
  },
  categories: async (page) => {
    await openMobileCatalog(page);
    await page
      .locator('[data-view-content="catalog"]')
      .getByRole("tab", { exact: true, name: "セット商品" })
      .click();
  },
  "catalog-list": async (page) => {
    await advanceHero(page, 2);
  },
  "catalog-grid": async (page) => {
    await page
      .getByRole("navigation", { exact: true, name: "モバイルメニュー" })
      .getByRole("button", { exact: true, name: "ログイン" })
      .click();
    await waitForVisible(
      page.getByRole("dialog", { exact: true, name: "ログイン または会員登録" }),
    );
  },
  login: async (page) => {
    await openMobilePhoneRegistration(page);
    await page.getByLabel("電話番号", { exact: true }).fill("9012345678");
  },
  registration: async (page) => {
    await completeMobileRegistration(page);
  },
  mypage: async (page) => {
    await completeMobileRegistration(page);
  },
  profile: async (page) => {
    await completeMobileRegistration(page);
    await page
      .getByRole("navigation", { exact: true, name: "モバイルメニュー" })
      .getByRole("button", { exact: true, name: "ホーム" })
      .click();
    await waitForVisible(page.locator("[data-home-view]"));
    await advanceHero(page, 2);
    await page.evaluate(() => {
      window.scrollTo({ behavior: "instant", top: 136 });
    });
  },
});

async function captureCheckpoint(browser, viewportName, viewport, checkpoint) {
  const captures = viewportName === "desktop" ? desktopCaptures : mobileCaptures;
  const prepare = captures[checkpoint.name];
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
    await openHome(page);
    await prepare(page);
    await settle(page);
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
  }
} finally {
  await browser?.close();
  await server.close();
}
