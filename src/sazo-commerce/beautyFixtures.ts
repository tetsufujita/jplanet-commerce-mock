export type BeautyCategoryId =
  | "skincare"
  | "mask-pack"
  | "cleansing"
  | "sun-care"
  | "makeup"
  | "mens-care"
  | "fragrance"
  | "hair-care";

export interface BeautyProduct {
  id: string;
  detailProductId: string;
  brand: string;
  name: string;
  price: string;
  image: `/sazo-commerce/beauty/${string}.webp`;
  keywords: readonly string[];
}

export const beautyCategories = [
  { id: "skincare", label: "スキンケア" },
  { id: "mask-pack", label: "マスクパック" },
  { id: "cleansing", label: "クレンジング" },
  { id: "sun-care", label: "日焼け止め" },
  { id: "makeup", label: "メイクアップ" },
  { id: "mens-care", label: "メンズケア" },
  { id: "fragrance", label: "香水" },
  { id: "hair-care", label: "ヘアケア" },
] as const satisfies readonly { id: BeautyCategoryId; label: string }[];

const product = (
  id: string,
  detailProductId: string,
  brand: string,
  name: string,
  price: string,
  image: BeautyProduct["image"],
  keywords: readonly string[],
): BeautyProduct => ({ id, detailProductId, brand, name, price, image, keywords });

const skincare = [
  product("beauty-01", "p01", "資生堂", "高保湿ビタミンC美容液", "¥4,111", "/sazo-commerce/beauty/skincare-01.webp", ["美容液", "ビタミンC", "保湿"]),
  product("beauty-02", "p02", "Anua", "ドクダミ鎮静アンプル 1+1", "¥3,088", "/sazo-commerce/beauty/skincare-02.webp", ["アンプル", "鎮静", "化粧水"]),
  product("beauty-03", "p03", "AESTURA", "アトバリア365クリーム", "¥3,040", "/sazo-commerce/beauty/skincare-03.webp", ["クリーム", "敏感肌", "保湿"]),
] as const;

const trend = [
  product("beauty-trend-01", "p04", "JILL STUART", "限定リップケアセット", "¥2,591", "/sazo-commerce/beauty/trend-01.webp", ["リップ", "限定"]),
  product("beauty-trend-02", "p05", "CEZANNE", "ニュアンスカラーチーク", "¥1,014", "/sazo-commerce/beauty/trend-02.webp", ["チーク", "メイク"]),
  product("beauty-trend-03", "p06", "KATE", "リップモンスター", "¥1,071", "/sazo-commerce/beauty/trend-03.webp", ["リップ", "口紅"]),
] as const;

const allProducts = [...skincare, ...trend] as const;

export const beautyProductsByCategory: Record<BeautyCategoryId, readonly BeautyProduct[]> = {
  skincare: allProducts,
  "mask-pack": [skincare[1], skincare[2], trend[0], skincare[0], trend[1], trend[2]],
  cleansing: [skincare[2], skincare[0], trend[1], skincare[1], trend[2], trend[0]],
  "sun-care": [skincare[0], skincare[2], trend[2], skincare[1], trend[0], trend[1]],
  makeup: [...trend, ...skincare],
  "mens-care": [skincare[2], skincare[1], trend[0], skincare[0], trend[2], trend[1]],
  fragrance: [trend[2], trend[0], skincare[0], trend[1], skincare[1], skincare[2]],
  "hair-care": [trend[1], trend[2], skincare[2], trend[0], skincare[0], skincare[1]],
};

export const beautyTrendProducts = [...trend, ...skincare] as const;
export const beautyTrendKeywords = [
  "逃したら終わり",
  "夏の透明感メイク",
  "毛穴ケア",
  "ツヤ肌ベース",
  "敏感肌スキンケア",
  "落ちないリップ",
  "香りで選ぶヘアケア",
] as const;
