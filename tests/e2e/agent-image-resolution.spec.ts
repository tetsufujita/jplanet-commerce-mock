import { expect, test } from '@playwright/test';

const route = '/sazo-commerce-mock/?qa=1&view=agent-hub';
const imageAttachment = {
  name: 'sneakers-reference.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLvkQAAAABJRU5ErkJggg==',
    'base64',
  ),
};

test.describe('mobile agent image resolution', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('uses image input to show product candidates and opens the New Balance product detail', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(route);

    await expect(page.getByRole('heading', { name: '購入したい商品を送る' })).toBeVisible();
    const initialSendButton = page.getByRole('button', { name: '送信' });
    await expect(initialSendButton).toBeDisabled();
    await expect(initialSendButton).toHaveCSS('background-color', 'rgb(254, 162, 172)');
    await expect(initialSendButton.locator('svg')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.screenshot({ path: testInfo.outputPath('agent-send-390.png') });
    await page.locator('#sazo-mobile-agent-image').setInputFiles(imageAttachment);
    await expect(page.getByText('sneakers-reference.png')).toBeVisible();

    await page.locator('#sazo-mobile-agent-image').setInputFiles({
      ...imageAttachment,
      name: 'replacement-sneakers.png',
    });
    await expect(page.getByText('replacement-sneakers.png')).toBeVisible();
    await expect(page.getByText('sneakers-reference.png')).toHaveCount(0);
    await page.getByRole('button', { name: '添付画像を削除' }).click();
    await expect(page.getByText('replacement-sneakers.png')).toHaveCount(0);
    await expect(initialSendButton).toBeDisabled();

    await page.locator('#sazo-mobile-agent-image').setInputFiles(imageAttachment);

    await page.getByRole('button', { name: /送信|候補を探す/ }).click();

    await expect(page.getByRole('heading', { name: '画像に近い商品を見つけました' })).toBeVisible();
    await expect(page.getByRole('img', { name: '送った画像' })).toBeVisible();
    await expect(page.getByRole('region', { name: '最も近い商品' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'その他の候補' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'モバイルメニュー' })).toBeVisible();
    await expect(
      page
        .getByRole('button', { name: 'New Balance 9060 ホワイト／グリーンを選ぶ' })
        .first(),
    ).toBeVisible();
    await expect(page.getByText(/R\$/)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('agent-candidates-390.png') });

    await page
      .getByRole('button', { name: 'New Balance 9060 ホワイト／グリーンを選ぶ' })
      .first()
      .click();
    await expect(page.getByTestId('jplanet-image-search-new-balance-detail')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Balance 9060' })).toBeVisible();
    await expect(page.getByText('New Balance Japan 候補', { exact: true })).toBeVisible();
    await expect(page.getByText('R$ 748')).toBeVisible();
    await expect(page.getByText('8,600件販売')).toBeVisible();
    await expect(page.getByRole('region', { name: '通常日本商品' })).toBeVisible();
    await expect(page.getByRole('region', { name: '通関配送情報' })).toBeVisible();
    await expect(page.getByText('元ページの商品レビュー')).toBeVisible();
    await expect(page.getByText('商品仕様')).toBeVisible();
    await expect(page.getByRole('heading', { name: '商品説明' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '購入者レビュー' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '一緒に検討されている商品' })).toBeVisible();
    await expect(page.getByLabel('画像 1 / 3')).toBeVisible();
    await expect(page.getByText('Nintendo Switch Proコントローラー')).toHaveCount(0);

    const expectProductSurfaceToMatchViewport = async () => {
      const widths = await page.evaluate(() => ({
        viewport: window.innerWidth,
        surface: Math.round(
          document.querySelector<HTMLElement>('[data-testid="jplanet-image-search-new-balance-detail"]')
            ?.getBoundingClientRect().width ?? 0,
        ),
      }));
      expect(widths.surface).toBe(widths.viewport);
    };

    await expectProductSurfaceToMatchViewport();
    await page.setViewportSize({ width: 330, height: 740 });
    await expectProductSurfaceToMatchViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('agent-selected-product-330.png') });
    await page.setViewportSize({ width: 341, height: 735 });
    await page.screenshot({ path: testInfo.outputPath('agent-selected-product-341.png') });
    await page.setViewportSize({ width: 379, height: 740 });
    await page.screenshot({ path: testInfo.outputPath('agent-selected-product-379.png') });
    await page.setViewportSize({ width: 390, height: 736 });
    await expectProductSurfaceToMatchViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('agent-selected-product-390.png') });
    await page.setViewportSize({ width: 440, height: 736 });
    await expectProductSurfaceToMatchViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('agent-selected-product-440.png') });
    await page.setViewportSize({ width: 375, height: 736 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('agent-selected-product-375.png') });

    await page.getByRole('button', { name: '画像3を表示' }).click();
    await expect(page.getByLabel('画像 3 / 3')).toBeVisible();

    await page.getByRole('button', { name: '配送・通関の詳細を開く' }).click();
    await expect(page.getByRole('heading', { name: '配送・通関の詳細' })).toBeVisible();
    await expect(page.getByText('New Balance 9060', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '戻る' }).click();

    await page.getByText('元ページの商品レビュー', { exact: true }).click();
    await expect(page.getByRole('heading', { name: '商品レビュー' })).toBeVisible();
    await expect(page.getByText('New Balance 9060', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '戻る' }).click();

    const descriptionToggle = page.getByRole('button', { name: '商品説明をもっと見る' });
    await descriptionToggle.click();
    const expandedDescriptionToggle = page.getByRole('button', { name: '商品説明を閉じる' });
    await expect(expandedDescriptionToggle).toHaveAttribute('aria-expanded', 'true');
    await expandedDescriptionToggle.click();

    await page.getByRole('button', { name: '商品仕様を開く' }).click();
    await expect(page.getByRole('dialog', { name: '商品仕様' })).toBeVisible();
    await expect(
      page.getByRole('dialog', { name: '商品仕様' }).getByText('アッパー', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: '商品仕様を閉じる' }).click();

    await page.getByRole('button', { name: '購入に進む' }).click();
    await expect(page.getByRole('dialog', { name: 'New Balance 9060の購入手続き' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'サイズを選ぶ', exact: true })).toBeVisible();
  });

  test('keeps URL submission on the direct existing product route', async ({ page }) => {
    await page.goto(route);

    await page.getByPlaceholder('URL・画像・商品名を送る').fill('https://shop.example.com/product');
    await page.getByRole('button', { name: /送信|候補を探す/ }).click();

    await expect(
      page.getByRole('heading', { name: 'Nintendo Switch Proコントローラー' }),
    ).toBeVisible();
  });

  for (const width of [341, 390, 440]) {
    test(`keeps the mobile agent states within ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route);

      await expect(page.getByRole('heading', { name: '購入したい商品を送る' })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'モバイルメニュー' })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`agent-send-${width}.png`) });

      await page.locator('#sazo-mobile-agent-image').setInputFiles(imageAttachment);
      await page.getByRole('button', { name: /送信|候補を探す/ }).click();
      await expect(page.getByRole('heading', { name: '画像に近い商品を見つけました' })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`agent-candidates-${width}.png`) });
    });
  }
});
