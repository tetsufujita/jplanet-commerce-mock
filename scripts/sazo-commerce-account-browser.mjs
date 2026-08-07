import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const desktopViewport = { height: 1656, width: 3022 };
const mobileViewport = { height: 1470, width: 682 };

const server = await createServer({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

function closestSample(samples, elapsed) {
  return samples.reduce((closest, sample) =>
    Math.abs(sample.elapsed - elapsed) < Math.abs(closest.elapsed - elapsed)
      ? sample
      : closest,
  );
}

function firstStableSample(samples, predicate) {
  const sample = samples.find((candidate, index) =>
    samples.slice(index).every(predicate),
  );

  assert(sample !== undefined, "motion never reached a stable final state");

  return sample;
}

async function traceChatMotion(page, duration) {
  return page.evaluate(async (traceDuration) => {
    const launcher = document.querySelector('button[aria-label="チャットを開く"]');

    if (launcher === null) {
      throw new Error("Chat launcher not found");
    }

    const startedAt = performance.now();
    const samples = [];
    const sample = () => {
      const panel = document.querySelector(".sazo-chat-panel");

      if (panel === null) {
        return;
      }

      const style = getComputedStyle(panel);
      const matrix =
        style.transform === "none"
          ? new DOMMatrixReadOnly()
          : new DOMMatrixReadOnly(style.transform);
      const bounds = panel.getBoundingClientRect();

      samples.push({
        elapsed: performance.now() - startedAt,
        opacity: Number.parseFloat(style.opacity),
        transformX: matrix.m41,
        transformY: matrix.m42,
        x: bounds.x,
        y: bounds.y,
      });
    };

    launcher.click();
    sample();

    await new Promise((resolve) => {
      const onFrame = () => {
        sample();

        if (performance.now() - startedAt >= traceDuration) {
          resolve(undefined);
        } else {
          requestAnimationFrame(onFrame);
        }
      };

      requestAnimationFrame(onFrame);
    });

    return samples;
  }, duration);
}

function assertDesktopMotion(samples) {
  assert(samples.length >= 8);
  const initial = samples[0];
  const middle = closestSample(samples, 110);
  const final = samples.at(-1);
  const settled = firstStableSample(
    samples,
    (sample) => Math.abs(sample.transformX) < 0.75,
  );

  assert(initial !== undefined && final !== undefined);
  assert(initial.elapsed < 50);
  assert(initial.transformX > 250);
  assert(initial.x - final.x > 250);
  assert(middle.transformX > 3 && middle.transformX < initial.transformX - 3);
  assert(final.transformX < 0.75);
  assert(Math.abs(final.x - 2598) < 2);
  assert(settled.elapsed >= 170 && settled.elapsed <= 280);
}

function assertMobileMotion(samples) {
  assert(samples.length >= 7);
  const initial = samples[0];
  const middle = closestSample(samples, 90);
  const final = samples.at(-1);
  const settled = firstStableSample(
    samples,
    (sample) => Math.abs(sample.transformY) < 0.75 && Math.abs(sample.opacity - 1) < 0.01,
  );

  assert(initial !== undefined && final !== undefined);
  assert(initial.elapsed < 50);
  assert(initial.transformY > 10);
  assert(initial.opacity < 0.3);
  assert(middle.transformY > 0.5 && middle.transformY < initial.transformY);
  assert(middle.opacity > initial.opacity && middle.opacity < 1);
  assert(final.transformY < 0.75);
  assert(final.opacity > 0.99);
  assert(Math.abs(final.y - 810) < 2);
  assert(settled.elapsed >= 130 && settled.elapsed <= 240);
}

let browser;

try {
  await server.listen();
  const address = server.httpServer?.address();

  assert(address !== null && typeof address === "object");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const baseUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;

  const desktopPage = await browser.newPage({ viewport: desktopViewport });

  await desktopPage.goto(baseUrl);
  const desktopLogin = desktopPage
    .locator('[data-shell="desktop"]')
    .getByRole("button", { name: "ログイン" });
  await desktopLogin.focus();
  await desktopLogin.click();
  const desktopAuth = desktopPage.getByRole("dialog", {
    name: "ログイン または会員登録",
  });
  const desktopAuthBounds = await desktopAuth.boundingBox();

  assert(desktopAuthBounds !== null);
  assert(desktopAuthBounds.width >= 400 && desktopAuthBounds.width <= 440);
  assert(
    Math.abs(
      desktopAuthBounds.x + desktopAuthBounds.width / 2 - desktopViewport.width / 2,
    ) < 2,
  );
  assert.equal(
    await desktopPage
      .locator('[data-overlay-background="true"]')
      .getAttribute("aria-hidden"),
    "true",
  );
  assert.equal(await desktopPage.locator(".sazo-root").getAttribute("aria-hidden"), null);
  assert.equal(await desktopPage.locator(".sazo-root").getAttribute("inert"), null);
  assert.equal(await desktopPage.evaluate(() => document.body.style.overflow), "hidden");
  await desktopPage.screenshot({ path: "/tmp/sazo-task6-fix-desktop-provider.png" });

  await desktopPage.keyboard.press("Escape");
  await desktopAuth.waitFor({ state: "detached" });
  assert.equal(
    await desktopLogin.evaluate((element) => element === document.activeElement),
    true,
  );

  const desktopMotionSamples = await traceChatMotion(desktopPage, 330);

  assertDesktopMotion(desktopMotionSamples);
  const desktopChat = desktopPage.getByRole("dialog", { name: "SAZOチャット" });
  const desktopChatClose = desktopChat.getByRole("button", {
    name: "チャットを閉じる",
  });

  await desktopChatClose.focus();
  await desktopPage.keyboard.press("Shift+Tab");
  assert.equal(
    await desktopChat
      .getByRole("textbox", { name: "メッセージ" })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await desktopPage.keyboard.press("Tab");
  assert.equal(
    await desktopChatClose.evaluate((element) => element === document.activeElement),
    true,
  );
  await desktopPage.keyboard.press("Escape");
  await desktopChat.waitFor({ state: "detached" });

  const mobilePage = await browser.newPage({ viewport: mobileViewport });

  await mobilePage.goto(baseUrl);
  await mobilePage
    .getByRole("navigation", { name: "モバイルメニュー" })
    .getByRole("button", { name: "ログイン" })
    .click();
  const mobileProvider = mobilePage.getByRole("dialog", {
    name: "ログイン または会員登録",
  });
  const mobileProviderBounds = await mobileProvider.boundingBox();

  assert(mobileProviderBounds !== null);
  assert.equal(Math.round(mobileProviderBounds.width), mobileViewport.width);
  assert.equal(Math.round(mobileProviderBounds.height), mobileViewport.height);
  await mobileProvider.getByRole("button", { name: "Googleで続ける" }).click();

  const birthdayPage = mobilePage.getByTestId("sazo-auth-page");
  const birthdayHeader = birthdayPage.getByRole("banner");
  const birthdayMain = birthdayPage.getByRole("main", { name: "会員登録" });
  const birthdayHeading = birthdayMain.getByRole("heading", {
    name: "生年月日を入力してください",
  });
  const birthdayHeaderBounds = await birthdayHeader.boundingBox();
  const birthdayHeadingBounds = await birthdayHeading.boundingBox();
  const birthdayFooterBounds = await birthdayPage.getByRole("contentinfo").boundingBox();

  assert(
    birthdayHeaderBounds !== null &&
      birthdayHeadingBounds !== null &&
      birthdayFooterBounds !== null,
  );
  assert.equal(Math.round(birthdayHeaderBounds.width), mobileViewport.width);
  assert(Math.abs(birthdayHeaderBounds.height - 82) < 2);
  assert(Math.abs(birthdayHeadingBounds.x - 34) < 2);
  assert(birthdayHeadingBounds.y >= 140 && birthdayHeadingBounds.y <= 180);
  assert(birthdayHeadingBounds.width < 430 && birthdayHeadingBounds.height > 70);
  assert(birthdayFooterBounds.y >= 1000 && birthdayFooterBounds.y <= 1080);
  assert.equal(await mobilePage.locator(".sazo-root").getAttribute("aria-hidden"), null);
  assert.equal(await birthdayPage.getAttribute("inert"), null);
  assert.equal(await mobilePage.evaluate(() => document.body.style.overflow), "");
  for (const link of [
    "会社紹介",
    "採用情報",
    "プレスリリース",
    "利用規約",
    "プライバシー規約",
    "特定商取引法に基づく表記",
  ]) {
    assert.equal(await birthdayPage.getByRole("link", { name: link }).isVisible(), true);
  }
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-fix-mobile-birthday.png" });

  await birthdayMain.getByLabel("生年月日（西暦）").fill("2001-08-22");
  await birthdayMain.getByRole("button", { name: "次へ" }).click();

  const phonePage = mobilePage.getByTestId("sazo-auth-page");
  const country = phonePage.getByLabel("国番号");
  const phoneLabelBounds = await phonePage
    .locator('label[for="sazo-auth-phone"]')
    .boundingBox();

  assert(phoneLabelBounds !== null);
  assert(
    phoneLabelBounds.y >= 420 && phoneLabelBounds.y <= 480,
    `phone label y=${String(phoneLabelBounds.y)}`,
  );
  assert.deepEqual(await country.locator("option").allTextContents(), [
    "JP +81",
    "KR +82",
    "CN +86",
    "US +1",
    "TW +886",
    "BN +673",
    "SG +65",
    "DE +49",
    "TH +66",
    "GU +1",
    "RU +7",
  ]);
  assert.equal(await country.locator("option:checked").textContent(), "JP +81");
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-fix-mobile-phone.png" });

  await phonePage
    .getByRole("textbox", { exact: true, name: "電話番号" })
    .fill("8012345678");
  await phonePage
    .getByRole("checkbox", { name: "SAZOからのお得な情報を受け取らない" })
    .check();
  await phonePage.getByRole("button", { name: "次へ" }).click();
  await mobilePage.locator('[data-view-content="mypage"]').waitFor();

  const mobileNavigation = mobilePage.getByRole("navigation", {
    name: "モバイルメニュー",
  });
  await mobileNavigation.getByRole("button", { name: "お気に入り" }).click();
  await mobilePage.getByText("お気に入り商品がありません", { exact: true }).waitFor();
  const favoritesHeaderBounds = await mobilePage
    .locator('[data-view-content="favorites"] .sazo-account-header')
    .boundingBox();
  const favoritesTabsBounds = await mobilePage
    .locator(".sazo-favorite-tabs")
    .boundingBox();
  const favoritesEmptyBounds = await mobilePage
    .locator(".sazo-favorites-content .sazo-account-empty-state")
    .boundingBox();

  assert(
    favoritesHeaderBounds !== null &&
      favoritesTabsBounds !== null &&
      favoritesEmptyBounds !== null,
  );
  assert(favoritesHeaderBounds.height >= 80 && favoritesHeaderBounds.height <= 85);
  assert(favoritesTabsBounds.height >= 76 && favoritesTabsBounds.height <= 84);
  assert(
    favoritesEmptyBounds.y >= 285 && favoritesEmptyBounds.y <= 305,
    `favorites empty y=${String(favoritesEmptyBounds.y)}`,
  );
  assert(favoritesEmptyBounds.height >= 400 && favoritesEmptyBounds.height <= 440);
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-fix-mobile-favorites.png" });
  await mobilePage.getByRole("tab", { name: "レビュー" }).click();
  assert.equal(
    await mobilePage.getByRole("button", { name: "レビューを見に行く" }).isVisible(),
    true,
  );

  await mobilePage.getByRole("button", { name: "前の画面に戻る" }).click();
  await mobilePage.getByRole("button", { name: "会員情報の修正" }).click();
  const profilePhone = mobilePage.getByRole("group", { name: "電話番号" });

  assert.equal(await profilePhone.getByText("JP").isVisible(), true);
  assert.equal(await profilePhone.getByRole("combobox").count(), 0);
  assert.equal(
    await profilePhone
      .getByRole("textbox", { name: "認証済み電話番号" })
      .getAttribute("readonly"),
    "",
  );
  assert.equal(
    await mobilePage.getByText("電話番号を認証すると自動で入力されます").isVisible(),
    true,
  );
  await profilePhone.scrollIntoViewIfNeeded();
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-fix-mobile-profile.png" });

  await mobilePage.getByRole("button", { name: "前の画面に戻る" }).click();
  await mobilePage.getByRole("button", { name: "登録カード管理" }).click();
  await mobilePage.getByText("登録されているカードがありません。").waitFor();
  const cardsEmptyBounds = await mobilePage
    .locator(".sazo-cards-content .sazo-account-empty-state")
    .boundingBox();

  assert(cardsEmptyBounds !== null);
  assert(cardsEmptyBounds.y >= 125 && cardsEmptyBounds.y <= 145);
  assert(cardsEmptyBounds.height >= 185 && cardsEmptyBounds.height <= 205);
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-fix-mobile-cards.png" });

  await mobilePage.getByRole("button", { name: "前の画面に戻る" }).click();
  const mobileMotionSamples = await traceChatMotion(mobilePage, 290);

  assertMobileMotion(mobileMotionSamples);
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-fix-mobile-chat.png" });
  await mobilePage.keyboard.press("Escape");
  await mobilePage
    .getByRole("dialog", { name: "SAZOチャット" })
    .waitFor({ state: "detached" });

  const reducedPage = await browser.newPage({
    reducedMotion: "reduce",
    viewport: desktopViewport,
  });

  await reducedPage.goto(baseUrl);
  await reducedPage.getByRole("button", { name: "チャットを開く" }).waitFor();
  const reducedMotionSamples = await traceChatMotion(reducedPage, 80);
  const reducedSettled = firstStableSample(
    reducedMotionSamples,
    (sample) => Math.abs(sample.transformX) < 0.75 && Math.abs(sample.opacity - 1) < 0.01,
  );

  assert(reducedSettled.elapsed <= 40);
  assert(Math.abs((reducedMotionSamples.at(-1)?.x ?? 0) - 2598) < 2);

  process.stdout.write("sazo-account-browser-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
