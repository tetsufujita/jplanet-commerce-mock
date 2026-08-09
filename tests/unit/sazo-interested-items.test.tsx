// @vitest-environment jsdom

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getProductDetail, interestedProducts } from "@/sazo-commerce/fixtures";

describe("J-Planet interested items fixtures", () => {
  it("keeps the five source products in the captured order", () => {
    expect(
      interestedProducts.map(({ id, name, price }) => ({ id, name, price })),
    ).toEqual([
      {
        id: "interested-nike-rope",
        name: "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
        price: "¥3,339",
      },
      {
        id: "interested-nike-mind",
        name: "Nike Mind 001 Black Chrome",
        price: "¥17,432",
      },
      {
        id: "interested-sprint-sister",
        name: "[インフルエンサーPick]スプリントシスターW - [リザーロック：オーシャンキューブ：ダークシンダー：セール / IR5693-256]",
        price: "¥12,803",
      },
      {
        id: "interested-meat-keyring",
        name: "肉ラバーかわいいギフトおいしい肉キリング役に立たない無駄な面白い人形動物キーホルダー",
        price: "¥1,048",
      },
      {
        id: "interested-duck-cushion",
        name: "アヒル人形睡眠モチ大型抱擁者クッション動物ぬいぐるみアヒル人形かわいい大型大王小さな巨大動物ボディ",
        price: "¥1,651",
      },
    ]);
  });

  it("ships every interested-item image locally and resolves a mock detail", () => {
    for (const product of interestedProducts) {
      expect(product.image).toMatch(/^\/sazo-commerce\/interested-items\/\d{2}\.webp$/);
      expect(existsSync(resolve(`public${product.image}`))).toBe(true);
      expect(getProductDetail(product.id).product).toEqual(product);
    }
  });
});
