// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  beautyCategories,
  beautyProductsByCategory,
  beautyTrendKeywords,
  beautyTrendProducts,
} from "@/sazo-commerce/beautyFixtures";

describe("J-Planet BEAUTY fixtures", () => {
  it("keeps the recorded category order and scrollable three-column mobile rails", () => {
    expect(beautyCategories.map(({ id, label }) => [id, label])).toEqual([
      ["skincare", "スキンケア"],
      ["mask-pack", "マスクパック"],
      ["cleansing", "クレンジング"],
      ["sun-care", "日焼け止め"],
      ["makeup", "メイクアップ"],
      ["mens-care", "メンズケア"],
      ["fragrance", "香水"],
      ["hair-care", "ヘアケア"],
    ]);

    for (const { id } of beautyCategories) {
      expect(beautyProductsByCategory[id]).toHaveLength(6);
    }
    expect(beautyTrendProducts).toHaveLength(6);
    expect(beautyTrendKeywords).toHaveLength(7);
  });
});
