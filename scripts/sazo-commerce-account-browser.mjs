import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const server = await createServer({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

let browser;

try {
  await server.listen();
  const address = server.httpServer?.address();

  assert(address !== null && typeof address === "object");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const baseUrl = `http://127.0.0.1:${String(address.port)}/sazo-commerce-mock/`;
  const desktopPage = await browser.newPage({ viewport: { height: 828, width: 1511 } });

  await desktopPage.goto(baseUrl);
  const desktopLogin = desktopPage
    .locator('[data-shell="desktop"]')
    .getByRole("button", { name: "ログイン" });
  await desktopLogin.focus();
  await desktopLogin.click();
  const desktopAuth = desktopPage.getByRole("dialog", {
    name: "ログイン または会員登録",
  });
  await desktopAuth.waitFor();
  const desktopAuthBounds = await desktopAuth.boundingBox();

  assert(desktopAuthBounds !== null);
  assert(desktopAuthBounds.width >= 400 && desktopAuthBounds.width <= 440);
  assert(Math.abs(desktopAuthBounds.x + desktopAuthBounds.width / 2 - 1511 / 2) < 2);
  assert.match(await desktopAuth.innerText(), /送料50%OFFクーポン/);
  assert.equal(await desktopAuth.getByRole("button", { name: /で続ける$/ }).count(), 3);
  assert.equal(
    await desktopPage.locator(".sazo-root").getAttribute("aria-hidden"),
    "true",
  );
  assert.equal(await desktopPage.locator(".sazo-root").getAttribute("inert"), "");
  assert.equal(await desktopPage.evaluate(() => document.body.style.overflow), "hidden");
  await desktopPage.screenshot({ path: "/tmp/sazo-task6-desktop-auth.png" });

  await desktopAuth.getByRole("button", { name: "Googleで続ける" }).click();
  await desktopPage.getByLabel("生年月日（西暦）").fill("2001-08-22");
  await desktopPage.getByRole("button", { name: "次へ" }).click();
  assert.deepEqual(
    await desktopPage
      .getByLabel("国番号")
      .locator("option")
      .evaluateAll((options) => options.map((option) => option.value)),
    ["JP", "KR", "CN", "US", "TW", "BN", "SG", "DE", "TH", "GU", "RU"],
  );
  await desktopPage.keyboard.press("Escape");
  await desktopAuth.waitFor({ state: "detached" });
  assert.equal(
    await desktopLogin.evaluate((element) => element === document.activeElement),
    true,
  );
  assert.equal(await desktopPage.locator(".sazo-root").getAttribute("aria-hidden"), null);
  assert.equal(await desktopPage.locator(".sazo-root").getAttribute("inert"), null);
  assert.equal(await desktopPage.evaluate(() => document.body.style.overflow), "");

  await desktopLogin.click();
  await desktopPage.getByRole("button", { name: "メールで続ける" }).click();
  await desktopPage.getByLabel("生年月日（西暦）").fill("2001-08-22");
  await desktopPage.getByRole("button", { name: "次へ" }).click();
  await desktopPage
    .getByRole("textbox", { exact: true, name: "電話番号" })
    .fill("8012345678");
  await desktopPage
    .getByRole("checkbox", { name: "SAZOからのお得な情報を受け取らない" })
    .check();
  await desktopPage.getByRole("button", { name: "次へ" }).click();
  await desktopPage.locator('[data-view-content="mypage"]').waitFor();
  assert.match(
    await desktopPage.locator('[data-view-content="mypage"]').innerText(),
    /Tetsu Fujita さん/,
  );
  await desktopPage.screenshot({ path: "/tmp/sazo-task6-desktop-mypage.png" });

  const myPage = desktopPage.locator('[data-view-content="mypage"]');
  await myPage.getByRole("button", { name: "お気に入り" }).click();
  await desktopPage.getByText("お気に入り商品がありません", { exact: true }).waitFor();
  await desktopPage.getByRole("button", { name: "前の画面に戻る" }).click();
  await desktopPage.getByRole("button", { name: "会員情報の修正" }).click();
  assert.equal(await desktopPage.getByLabel("ニックネーム").inputValue(), "Tetsu Fujita");
  assert.equal(
    await desktopPage.getByLabel("メールアドレス").inputValue(),
    "tetsu.fujita@andes.global",
  );
  await desktopPage.getByRole("button", { name: "前の画面に戻る" }).click();
  await desktopPage.getByRole("button", { name: "登録カード管理" }).click();
  await desktopPage.getByText("登録されているカードがありません。").waitFor();

  const desktopChatLauncher = desktopPage.getByRole("button", {
    name: "チャットを開く",
  });
  await desktopChatLauncher.focus();
  await desktopChatLauncher.click();
  const desktopChat = desktopPage.getByRole("dialog", { name: "SAZOチャット" });
  await desktopChat.waitFor();
  assert.equal(await desktopChat.getAttribute("data-motion-duration"), "0.22");
  assert.equal(await desktopChat.getAttribute("data-motion-mode"), "desktop");
  await desktopPage.waitForTimeout(250);
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
  await desktopPage.screenshot({ path: "/tmp/sazo-task6-desktop-chat.png" });
  await desktopPage.getByText("メッセージはまだありません", { exact: true }).waitFor();
  await desktopPage.keyboard.press("Escape");
  await desktopChat.waitFor({ state: "detached" });
  assert.equal(
    await desktopChatLauncher.evaluate((element) => element === document.activeElement),
    true,
  );

  const mobilePage = await browser.newPage({ viewport: { height: 844, width: 390 } });

  await mobilePage.goto(baseUrl);
  await mobilePage
    .getByRole("navigation", { name: "モバイルメニュー" })
    .getByRole("button", { name: "ログイン" })
    .click();
  const mobileAuth = mobilePage.getByRole("dialog", {
    name: "ログイン または会員登録",
  });
  const mobileAuthBounds = await mobileAuth.boundingBox();

  assert(mobileAuthBounds !== null);
  assert.equal(Math.round(mobileAuthBounds.width), 390);
  assert.equal(Math.round(mobileAuthBounds.height), 844);
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-mobile-auth.png" });
  await mobileAuth.getByRole("button", { name: "Googleで続ける" }).click();
  await mobilePage.getByLabel("生年月日（西暦）").fill("2001-08-22");
  await mobilePage.getByRole("button", { name: "次へ" }).click();
  await mobilePage
    .getByRole("textbox", { exact: true, name: "電話番号" })
    .fill("8012345678");
  await mobilePage.getByRole("button", { name: "次へ" }).click();
  await mobilePage.locator('[data-view-content="mypage"]').waitFor();
  assert.equal(
    await mobilePage.getByRole("heading", { name: "マイページ" }).isVisible(),
    true,
  );
  assert.equal(
    await mobilePage.getByRole("button", { name: "会員情報の修正" }).isVisible(),
    true,
  );
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-mobile-mypage.png" });

  await mobilePage.getByRole("button", { name: "チャットを開く" }).click();
  const mobileChat = mobilePage.getByRole("dialog", { name: "SAZOチャット" });
  assert.equal(await mobileChat.getAttribute("data-motion-duration"), "0.18");
  assert.equal(await mobileChat.getAttribute("data-motion-mode"), "mobile");
  await mobilePage.waitForTimeout(210);
  await mobilePage.screenshot({ path: "/tmp/sazo-task6-mobile-chat.png" });
  await mobilePage
    .getByTestId("sazo-chat-backdrop")
    .click({ position: { x: 10, y: 10 } });
  await mobileChat.waitFor({ state: "detached" });

  const reducedPage = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { height: 828, width: 1511 },
  });
  await reducedPage.goto(baseUrl);
  await reducedPage.getByRole("button", { name: "チャットを開く" }).click();
  assert.equal(
    await reducedPage
      .getByRole("dialog", { name: "SAZOチャット" })
      .getAttribute("data-motion-duration"),
    "0",
  );

  process.stdout.write("sazo-account-browser-ok\n");
} finally {
  await browser?.close();
  await server.close();
}
