import type { SazoImagePath } from "@/sazo-commerce/fixtures";

export interface AgentRecentSearch {
  id: string;
  label: string;
}

export interface AgentRecentViewedProduct {
  id: string;
  image: SazoImagePath;
  name: string;
  price: string;
}

export interface AgentCommonSearchKeyword {
  id: string;
  label: string;
  productId: string;
}

/**
 * Mock search intents are intentionally separate from products: this rail only
 * describes what a customer searched for, never a queued purchase request.
 */
export const agentRecentSearches: readonly AgentRecentSearch[] = [
  { id: "rakuten-sneakers", label: "楽天のスニーカー" },
  { id: "nintendo-switch", label: "Nintendo Switch" },
  { id: "japan-skincare", label: "日本のスキンケア" },
] as const;

/**
 * These fixture rows stand in for product pages already opened in this mock.
 * They are deliberately not derived from search submissions or order state.
 */
export const agentRecentViewedProducts: readonly AgentRecentViewedProduct[] = [
  {
    id: "jplanet-new-balance-9060",
    image: "/sazo-commerce/reference/new-balance-9060.png",
    name: "New Balance 9060",
    price: "R$ 748",
  },
  {
    id: "jplanet-sony-a7c-ii",
    image: "/sazo-commerce/reference/mirrorless-camera.png",
    name: "Sony α7C II",
    price: "R$ 9,899",
  },
  {
    id: "jplanet-nintendo-switch-oled",
    image: "/sazo-commerce/reference/nintendo-switch-oled.png",
    name: "Nintendo Switch OLED",
    price: "R$ 2,184",
  },
  {
    id: "jplanet-nintendo-pro-controller",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    name: "Nintendo Switch Proコントローラー",
    price: "R$ 429",
  },
  {
    id: "jplanet-nintendo-joycon",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
    name: "Nintendo Joy-Con (L)/(R)",
    price: "R$ 512",
  },
  {
    id: "jplanet-air-jordan-1",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    name: "Air Jordan 1 Retro High OG",
    price: "R$ 789",
  },
  {
    id: "jplanet-character-figure",
    image: "/sazo-commerce/reference/figure.png",
    name: "日本限定 キャラクターフィギュア",
    price: "R$ 318",
  },
  {
    id: "jplanet-switch-carrying-case",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
    name: "Nintendo Switch キャリングケース",
    price: "R$ 188",
  },
] as const;

/**
 * These are aggregate search terms for the mock, rather than a personalized
 * recommendation claim. Selecting one simply enters the existing product
 * resolution flow.
 */
export const agentCommonSearchKeywords: readonly AgentCommonSearchKeyword[] = [
  {
    id: "japan-sneakers",
    label: "日本のスニーカー",
    productId: "jplanet-new-balance-9060",
  },
  {
    id: "nintendo-switch",
    label: "Nintendo Switch",
    productId: "jplanet-nintendo-switch-oled",
  },
  {
    id: "japan-skincare",
    label: "日本のスキンケア",
    productId: "jplanet-character-figure",
  },
  {
    id: "figures",
    label: "フィギュア",
    productId: "jplanet-character-figure",
  },
  {
    id: "cameras",
    label: "カメラ",
    productId: "jplanet-sony-a7c-ii",
  },
] as const;

export const agentHowItWorksSteps = ["URLを貼る", "画像を送る", "商品名で探す"] as const;
