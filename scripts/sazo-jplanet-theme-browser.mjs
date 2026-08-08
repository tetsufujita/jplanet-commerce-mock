import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

const views = [
  "home",
  "service",
  "brands",
  "categories",
  "catalog",
  "campaign",
  "reviews",
  "ranking",
  "mypage",
  "favorites",
  "profile",
  "cards",
  "product",
];
const authSteps = ["google", "birthday", "phone"];
const viewports = [
  { height: 828, label: "desktop", width: 1511 },
  { height: 844, label: "mobile", width: 390 },
];
const legacyColors = new Set([
  "rgb(216, 50, 82)",
  "rgb(229, 41, 105)",
  "rgb(235, 54, 88)",
  "rgb(239, 70, 102)",
  "rgb(254, 130, 145)",
]);

function normalizeRenderedCopy(text) {
  return text.normalize("NFKC").replace(/\s+/g, " ").trim();
}

const forbiddenRouteCopy = ["韓国", "KOREA", "TO JAPAN", "韓国代行", "日本まで発送"];
const forbiddenBrandPattern = /\bSAZO(?:SHOP)?\b/i;
const forbiddenLogoSelectors = ["[data-sazo-wordmark]", ".sazo-logo"];
const forbiddenAssetFragments = [
  "/sazo-logo",
  "/logo-sazo",
  "/sazo-commerce/campaign/coupon-banner.png",
  "/sazo-commerce/service-lp/how-to-use-1.png",
  "/sazo-commerce/service-lp/how-to-use-2.png",
  "/sazo-commerce/service-lp/how-to-use-3.png",
];
const approvedServiceStepAssets = [
  "/sazo-commerce/service-lp/jplanet-how-to-use-1.svg",
  "/sazo-commerce/service-lp/jplanet-how-to-use-2.svg",
  "/sazo-commerce/service-lp/jplanet-how-to-use-3.svg",
];

function contentSelector(view) {
  if (view === "home") return "[data-home-view]";
  if (view === "product") return '[data-view-content="product"]';
  return `[data-view-content="${view}"]`;
}

function viewUrl(baseUrl, view) {
  const parameters = new URLSearchParams({ qa: "1", view });

  if (view === "product") {
    parameters.set("product", "p01");
  }

  return `${baseUrl}?${parameters.toString()}`;
}

async function assertJplanetTheme(page, label) {
  const root = page.locator(".sazo-root");
  await root.locator("img").evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (image) => {
        image.loading = "eager";
        if (image.complete) return;

        await new Promise((resolve) => {
          const finish = () => resolve();
          image.addEventListener("error", finish, { once: true });
          image.addEventListener("load", finish, { once: true });
          setTimeout(finish, 8_000);
        });
      }),
    );
  });
  const palette = await root.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      background: style.backgroundColor,
      deepNavy: style.getPropertyValue("--jplanet-deep-navy").trim(),
      navy: style.getPropertyValue("--jplanet-navy").trim(),
      sakura: style.getPropertyValue("--jplanet-sakura").trim(),
      surface: style.getPropertyValue("--jplanet-surface").trim(),
    };
  });

  assert.deepEqual(
    palette,
    {
      background: "rgb(255, 255, 255)",
      deepNavy: "#1f2e4f",
      navy: "#1f3864",
      sakura: "#fea2ac",
      surface: "#ffffff",
    },
    `${label} palette`,
  );

  const legacyHits = await root.locator("*").evaluateAll(
    (elements, forbidden) => {
      const forbiddenColors = new Set(forbidden);
      const hits = [];

      for (const element of elements) {
        const style = getComputedStyle(element);
        const values = [
          style.backgroundColor,
          style.borderBottomColor,
          style.borderLeftColor,
          style.borderRightColor,
          style.borderTopColor,
          style.color,
          style.fill,
          style.outlineColor,
          style.stroke,
        ];

        for (const value of values) {
          if (forbiddenColors.has(value)) {
            hits.push(`${element.className || element.tagName}:${value}`);
          }
        }

        for (const value of forbiddenColors) {
          if (style.backgroundImage.includes(value)) {
            hits.push(`${element.className || element.tagName}:background:${value}`);
          }
        }
      }

      return hits;
    },
    [...legacyColors],
  );

  assert.deepEqual(legacyHits, [], `${label} legacy color hits`);
  const renderedText = normalizeRenderedCopy(await root.innerText());
  const pseudoElementCopy = await root.evaluate((rootElement) => {
    const hasZeroClip = (style) => {
      const clip = style.clip.replace(/\s/g, "");
      const inset = style.clipPath.match(/^inset\((.+)\)$/);
      const values = inset?.[1].trim().split(/\s+/) ?? [];
      const [top, right = top, bottom = top, left = right] = values;
      const percentage = (value) =>
        value?.endsWith("%") ? Number.parseFloat(value) : Number.NaN;
      const zeroInset =
        Number.isFinite(percentage(top)) &&
        Number.isFinite(percentage(right)) &&
        Number.isFinite(percentage(bottom)) &&
        Number.isFinite(percentage(left)) &&
        (percentage(top) + percentage(bottom) >= 100 ||
          percentage(left) + percentage(right) >= 100);

      return (
        /^rect\(0px,0px,0px,0px\)$/.test(clip) ||
        zeroInset ||
        style.clipPath.startsWith("circle(0px") ||
        style.clipPath.startsWith("circle(0%")
      );
    };
    const isHidden = (style) =>
      style.display === "none" ||
      style.visibility !== "visible" ||
      Number.parseFloat(style.opacity) <= 0 ||
      style.contentVisibility === "hidden" ||
      hasZeroClip(style);
    const isRendered = (element) => {
      for (let current = element; current; current = current.parentElement) {
        if (isHidden(getComputedStyle(current))) {
          return false;
        }
      }

      return true;
    };

    return [rootElement, ...rootElement.querySelectorAll("*")]
      .flatMap((element) =>
        ["::before", "::after"].flatMap((pseudo) => {
          const style = getComputedStyle(element, pseudo);

          return isRendered(element) &&
            !isHidden(style) &&
            style.content !== "none" &&
            style.content !== "normal"
            ? [style.content]
            : [];
        }),
      )
      .join(" ");
  });
  const visibleControlCopy = await root
    .locator("input, textarea")
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.display !== "none" && style.visibility === "visible";
        })
        .map(
          (element) =>
            `${element.getAttribute("placeholder") ?? ""} ${element.value ?? ""}`,
        )
        .join(" "),
    );
  const visibleCopy = normalizeRenderedCopy(
    `${renderedText} ${pseudoElementCopy} ${visibleControlCopy}`,
  );

  for (const forbiddenCopy of forbiddenRouteCopy) {
    assert.equal(
      visibleCopy.includes(forbiddenCopy),
      false,
      `${label} legacy route copy: ${forbiddenCopy}`,
    );
  }
  assert.equal(
    forbiddenBrandPattern.test(visibleCopy),
    false,
    `${label} legacy brand copy`,
  );

  for (const selector of forbiddenLogoSelectors) {
    assert.equal(
      await root.locator(selector).count(),
      0,
      `${label} legacy logo selector: ${selector}`,
    );
  }

  const imageAudit = await root
    .locator("img")
    .evaluateAll((images, forbiddenFragments) => {
      const failures = [];
      const forbiddenAssets = [];

      for (const image of images) {
        const source = image.currentSrc || image.getAttribute("src") || "<missing-src>";
        if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
          failures.push(
            `${source} complete=${String(image.complete)} size=${String(image.naturalWidth)}x${String(image.naturalHeight)}`,
          );
        }
        if (
          forbiddenFragments.some((fragment) => source.toLowerCase().includes(fragment))
        ) {
          forbiddenAssets.push(source);
        }
      }

      return { count: images.length, failures, forbiddenAssets };
    }, forbiddenAssetFragments);

  assert.deepEqual(imageAudit.failures, [], `${label} image load failures`);
  assert.deepEqual(imageAudit.forbiddenAssets, [], `${label} legacy brand assets`);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
    `${label} horizontal overflow`,
  );

  return { imageCount: imageAudit.count, visibleCopy };
}

async function assertMobileTopPlacement(page, view, width) {
  const label = `mobile-${String(width)}/${view}`;
  const desktopBand = page.locator(".sazo-desktop-header-band");
  assert.equal(
    await desktopBand.evaluate((element) => getComputedStyle(element).display),
    "none",
    `${label} desktop band display`,
  );
  assert.equal(await desktopBand.boundingBox(), null, `${label} desktop band bounds`);

  const contentBounds = await page.locator(contentSelector(view)).boundingBox();
  assert(contentBounds !== null, `${label} content bounds`);

  if (view === "home") {
    const mobileHeaderBounds = await page.locator(".sazo-mobile-header").boundingBox();
    assert(mobileHeaderBounds !== null, `${label} mobile header bounds`);
    assert.ok(
      Math.abs(mobileHeaderBounds.y) <= 1,
      `${label} mobile header y=${String(mobileHeaderBounds.y)}`,
    );
    assert.ok(
      Math.abs(contentBounds.y - 76) <= 1,
      `${label} home content y=${String(contentBounds.y)}`,
    );
    return;
  }

  assert.ok(
    Math.abs(contentBounds.y) <= 1,
    `${label} content y=${String(contentBounds.y)}`,
  );
}

let browser;
let auditedImages = 0;
let auditedStates = 0;
let auditedMobileTopStates = 0;

try {
  await server.listen();
  const address = server.httpServer?.address();

  assert(address !== null && typeof address === "object");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const baseUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { height: viewport.height, width: viewport.width },
    });
    page.setDefaultTimeout(8_000);

    for (const view of views) {
      await page.goto(viewUrl(baseUrl, view), { waitUntil: "networkidle" });
      await page.locator(contentSelector(view)).waitFor();

      if (view === "home") {
        const homeHeading = page.locator("[data-home-view] .sazo-home-intro h1");
        await homeHeading.waitFor();
        assert.equal(
          normalizeRenderedCopy(await homeHeading.innerText()),
          "ブラジル最大級 日本直輸入ショップ",
          `${viewport.label}/${view} home heading`,
        );
      }
      if (view === "service") {
        const serviceHeading = page.locator(
          '[data-view-content="service"] .sazo-service-hero h1',
        );
        const routeHeading = page.locator(
          '[data-view-content="service"] .sazo-service-hero-outline',
        );

        await serviceHeading.waitFor();
        await routeHeading.waitFor();
        assert.equal(
          normalizeRenderedCopy(await serviceHeading.innerText()),
          "日本代行",
          `${viewport.label}/${view} service heading`,
        );
        assert.equal(
          normalizeRenderedCopy(await routeHeading.innerText()),
          "FROM JAPAN TO BRAZIL",
          `${viewport.label}/${view} service route heading`,
        );
      }

      if (view === "campaign") {
        await page.waitForFunction(
          () =>
            document
              .querySelector('[data-view-content="campaign"]')
              ?.getAttribute("data-campaign-loaded") === "true",
        );
      }

      if (view === "product") {
        const productCopy = normalizeRenderedCopy(
          await page.locator(contentSelector(view)).innerText(),
        );
        assert.equal(
          productCopy.includes("日本の販売サイトから直接購入"),
          true,
          `${viewport.label}/${view} direct purchase copy`,
        );
        assert.equal(
          productCopy.includes("ブラジルへお届け"),
          true,
          `${viewport.label}/${view} Brazil delivery copy`,
        );
      }

      if (viewport.label === "mobile") {
        await assertMobileTopPlacement(page, view, viewport.width);
        auditedMobileTopStates += 1;
      }

      const audit = await assertJplanetTheme(page, `${viewport.label}/${view}`);
      auditedImages += audit.imageCount;
      auditedStates += 1;
      if (view === "campaign") {
        assert.equal(
          audit.visibleCopy.includes("FROM JAPAN TO BRAZIL"),
          true,
          `${viewport.label}/${view} campaign pseudo-element copy`,
        );
      }
      await page.screenshot({
        fullPage: true,
        path: `/tmp/sazo-jplanet-${viewport.label}-${view}.png`,
      });
    }

    for (const authStep of authSteps) {
      await page.goto(`${baseUrl}?qa=1&auth=${authStep}`, { waitUntil: "networkidle" });
      const selector =
        authStep === "google"
          ? '[data-testid="sazo-google-chooser"]'
          : "[data-testid=sazo-auth-page]";
      await page.locator(selector).waitFor();
      const audit = await assertJplanetTheme(page, `${viewport.label}/auth-${authStep}`);
      auditedImages += audit.imageCount;
      auditedStates += 1;
      await page.screenshot({
        fullPage: true,
        path: `/tmp/sazo-jplanet-${viewport.label}-auth-${authStep}.png`,
      });
    }

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const visibleShell = page.locator(`[data-shell="${viewport.label}"]`);
    await visibleShell.getByRole("button", { name: "ログイン" }).click();
    await page.getByTestId("sazo-auth-backdrop").waitFor();
    const providerAudit = await assertJplanetTheme(
      page,
      `${viewport.label}/auth-provider`,
    );
    auditedImages += providerAudit.imageCount;
    auditedStates += 1;
    await page.screenshot({
      path: `/tmp/sazo-jplanet-${viewport.label}-auth-provider.png`,
    });

    await page.locator(".sazo-auth-dialog .sazo-overlay-close").click();
    await page.getByTestId("chat-launcher").click();
    await page.getByTestId("sazo-chat-backdrop").waitFor();
    const chatAudit = await assertJplanetTheme(page, `${viewport.label}/chat`);
    auditedImages += chatAudit.imageCount;
    auditedStates += 1;
    await page.screenshot({ path: `/tmp/sazo-jplanet-${viewport.label}-chat.png` });

    await page.close();
  }

  const compactPage = await browser.newPage({ viewport: { height: 844, width: 320 } });
  compactPage.setDefaultTimeout(8_000);
  for (const view of views) {
    await compactPage.goto(viewUrl(baseUrl, view), { waitUntil: "networkidle" });
    await compactPage.locator(contentSelector(view)).waitFor();
    await assertMobileTopPlacement(compactPage, view, 320);
    auditedMobileTopStates += 1;
    if (["home", "service", "campaign", "product"].includes(view)) {
      await compactPage.screenshot({
        fullPage: true,
        path: `/tmp/sazo-jplanet-mobile-320-${view}.png`,
      });
    }
  }
  await compactPage.close();

  const servicePage = await browser.newPage({ viewport: { height: 844, width: 390 } });
  await servicePage.goto(`${baseUrl}?qa=1&view=service`, { waitUntil: "networkidle" });
  const serviceStepSources = await servicePage
    .locator(".sazo-service-step-image img")
    .evaluateAll((images) => images.map((image) => new URL(image.currentSrc).pathname));
  assert.deepEqual(
    serviceStepSources,
    approvedServiceStepAssets,
    "service approved step assets",
  );
  await servicePage.close();

  assert.equal(auditedStates, 36, "browser audit state count");
  assert.equal(auditedMobileTopStates, 26, "mobile top-placement state count");
  process.stdout.write(
    `sazo-jplanet-theme-browser-ok states=${String(auditedStates)} mobileTopStates=${String(auditedMobileTopStates)} images=${String(auditedImages)}\n`,
  );
} finally {
  await browser?.close();
  await server.close();
}
