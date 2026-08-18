export interface AiSearchRecentItem {
  id: string;
  label: string;
}

export interface AiSearchGuideStep {
  id: string;
  label: string;
}

export interface AiSearchPopularItem {
  id: string;
  label: string;
}

export type AiSearchResultGroupId = "all" | "general" | "limited" | "flea";

export interface AiSearchResultProduct {
  id: string;
  image: `/${string}`;
  name: string;
  price: string;
  supportingText: string;
}

export interface AiSearchResultGroup {
  count: number;
  id: Exclude<AiSearchResultGroupId, "all">;
  infoLabel?: string;
  products: readonly AiSearchResultProduct[];
  title: string;
}

/**
 * These entries describe discovery inputs only. They deliberately do not
 * claim a product match, price, or purchase condition.
 */
export const aiSearchInitialRecentItems: readonly AiSearchRecentItem[] = [
  { id: "new-balance-9060", label: "New Balance 9060" },
  { id: "sensitive-skin-lotion", label: "敏感肌 化粧水" },
] as const;

export const aiSearchGuideSteps: readonly AiSearchGuideStep[] = [
  { id: "product", label: "商品名や型番を入力" },
  { id: "keyword", label: "気になるキーワードで検索" },
  { id: "image", label: "写真を送って近い商品を検索" },
  { id: "url", label: "商品ページのURLを貼り付け" },
] as const;

export const aiSearchPopularItems: readonly AiSearchPopularItem[] = [
  { id: "new-balance-9060", label: "New Balance 9060" },
  { id: "nintendo-switch", label: "Nintendo Switch" },
  { id: "uniqlo", label: "ユニクロ" },
  { id: "sk-ii-lotion", label: "SK-II 化粧水" },
  { id: "anessa-sunscreen", label: "アネッサ 日焼け止め" },
  { id: "onitsuka-tiger", label: "オニツカタイガー" },
  { id: "pokemon-goods", label: "ポケモン グッズ" },
  { id: "loewe-puzzle-bag", label: "LOEWE Puzzle バッグ" },
  { id: "refa-hair-iron", label: "ReFa ヘアアイロン" },
  { id: "shiseido-skincare", label: "資生堂 スキンケア" },
] as const;

export const newBalanceSearchKeywords = [
  "9060",
  "ホワイト",
  "グリーン",
  "スニーカー",
  "24.5cm",
] as const;

export const tonerSearchKeywords = [
  "化粧水",
  "トナー",
  "ローション",
  "敏感肌",
  "保湿",
] as const;

export const genericSearchKeywords = [
  "人気商品",
  "日本公式",
  "限定",
  "フリマ",
  "日本から直送",
] as const;

export const newBalanceSearchTabs: readonly {
  id: AiSearchResultGroupId;
  label: string;
}[] = [
  { id: "all", label: "全体" },
  { id: "general", label: "一般" },
  { id: "limited", label: "限定" },
  { id: "flea", label: "フリマ" },
] as const;

export const newBalanceSearchGroups: readonly AiSearchResultGroup[] = [
  {
    count: 84,
    id: "general",
    title: "一般・すぐ買える",
    products: [
      {
        id: "nb-9060-general-green",
        image: "/sazo-commerce/reference/new-balance-9060.png",
        name: "New Balance 9060\nグリーン ホワイト",
        price: "R$ 748",
        supportingText: "日本から直送",
      },
      {
        id: "nb-9060-general-gray",
        image: "/sazo-commerce/search-results/new-balance-9060-gray-silver.png",
        name: "New Balance 9060\nグレー シルバー",
        price: "R$ 789",
        supportingText: "日本から直送",
      },
      {
        id: "nb-9060-general-beige",
        image: "/sazo-commerce/search-results/new-balance-9060-beige-cream.png",
        name: "New Balance 9060\nベージュ クリーム",
        price: "R$ 829",
        supportingText: "日本から直送",
      },
    ],
  },
  {
    count: 19,
    id: "limited",
    infoLabel: "購入前に最終金額と納期を確認",
    title: "限定・ハイブランド",
    products: [
      {
        id: "nb-9060-limited-black",
        image: "/sazo-commerce/search-results/new-balance-9060-black-gray.png",
        name: "New Balance 9060\n限定カラー ブラック",
        price: "R$ 1,295",
        supportingText: "見積確認",
      },
      {
        id: "nb-9060-limited-pink",
        image: "/sazo-commerce/search-results/new-balance-9060-pink-beige.png",
        name: "New Balance 9060\n限定カラー ピンク",
        price: "R$ 1,480",
        supportingText: "見積確認",
      },
      {
        id: "nb-9060-limited-blue",
        image: "/sazo-commerce/search-results/new-balance-9060-blue-silver.png",
        name: "New Balance 9060\nコラボモデル ブルー",
        price: "R$ 1,690",
        supportingText: "見積確認",
      },
    ],
  },
  {
    count: 25,
    id: "flea",
    infoLabel: "商品状態・価格・納期を確認",
    title: "フリマ・中古",
    products: [
      {
        id: "nb-9060-flea-gray",
        image: "/sazo-commerce/search-results/new-balance-9060-gray-silver.png",
        name: "New Balance 9060\nグレー 中古",
        price: "R$ 520",
        supportingText: "状態確認",
      },
      {
        id: "nb-9060-flea-green",
        image: "/sazo-commerce/reference/new-balance-9060.png",
        name: "New Balance 9060\nグリーン 中古",
        price: "R$ 689",
        supportingText: "状態確認",
      },
      {
        id: "nb-9060-flea-black",
        image: "/sazo-commerce/search-results/new-balance-9060-black-gray.png",
        name: "New Balance 9060\nブラック 中古",
        price: "R$ 740",
        supportingText: "状態確認",
      },
    ],
  },
] as const;

export const tonerSearchGroups: readonly AiSearchResultGroup[] = [
  {
    count: 1_420,
    id: "general",
    title: "一般・すぐ買える",
    products: [
      {
        id: "toner-general-hada-labo",
        image: "/images/hada-labo-bottle.png",
        name: "肌ラボ 極潤ヒアルロン液\nしっとりタイプ",
        price: "R$ 118",
        supportingText: "日本から直送",
      },
      {
        id: "toner-general-naturie",
        image: "/sazo-commerce/categories/beauty-skincare.png",
        name: "ナチュリエ\nハトムギ化粧水",
        price: "R$ 132",
        supportingText: "日本から直送",
      },
      {
        id: "toner-general-curel",
        image: "/sazo-commerce/categories/beauty-bodycare.png",
        name: "キュレル 潤浸保湿\n化粧水 III",
        price: "R$ 149",
        supportingText: "日本から直送",
      },
    ],
  },
  {
    count: 214,
    id: "limited",
    infoLabel: "購入前に最終金額と納期を確認",
    title: "限定・ハイブランド",
    products: [
      {
        id: "toner-limited-sk-ii",
        image: "/sazo-commerce/beauty/skincare-01.webp",
        name: "SK-II フェイシャル\nトリートメント エッセンス",
        price: "R$ 895",
        supportingText: "見積確認",
      },
      {
        id: "toner-limited-shiseido",
        image: "/sazo-commerce/beauty/skincare-03.webp",
        name: "資生堂 オイデルミン\nエッセンスローション",
        price: "R$ 648",
        supportingText: "見積確認",
      },
      {
        id: "toner-limited-cle-de-peau",
        image: "/sazo-commerce/categories/beauty-sets.png",
        name: "クレ・ド・ポー ボーテ\nローションイドロA n",
        price: "R$ 720",
        supportingText: "見積確認",
      },
    ],
  },
  {
    count: 92,
    id: "flea",
    infoLabel: "未開封・使用期限・保管状態を確認",
    title: "フリマ・未開封",
    products: [
      {
        id: "toner-flea-sekkisei",
        image: "/sazo-commerce/beauty/skincare-02.webp",
        name: "雪肌精 薬用雪肌精\n化粧水 未開封",
        price: "R$ 198",
        supportingText: "未開封確認",
      },
      {
        id: "toner-flea-ipsa",
        image: "/sazo-commerce/categories/beauty-cleansing.png",
        name: "イプサ ザ・タイムR\nアクア 未開封",
        price: "R$ 220",
        supportingText: "未開封確認",
      },
      {
        id: "toner-flea-albion",
        image: "/sazo-commerce/categories/beauty-uv-care.png",
        name: "アルビオン\nフローラドリップ 未開封",
        price: "R$ 305",
        supportingText: "未開封確認",
      },
    ],
  },
] as const;

/**
 * Generic keyword results keep arbitrary text searches inside the existing
 * AI-search result surface instead of falling through to the retired ranking
 * page. The products reuse assets and purchase paths already present in this
 * mock and intentionally avoid claiming live ranking data.
 */
export const genericSearchGroups: readonly AiSearchResultGroup[] = [
  {
    count: 3,
    id: "general",
    title: "一般・すぐ買える",
    products: [
      {
        id: "generic-nintendo-switch-oled",
        image: "/sazo-commerce/reference/nintendo-switch-oled.png",
        name: "Nintendo Switch OLED\nホワイト",
        price: "R$ 2,184",
        supportingText: "日本から直送",
      },
      {
        id: "generic-nintendo-controller",
        image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
        name: "Nintendo Switch\nProコントローラー",
        price: "R$ 429",
        supportingText: "日本から直送",
      },
      {
        id: "generic-new-balance-9060",
        image: "/sazo-commerce/reference/new-balance-9060.png",
        name: "New Balance 9060\nホワイト グリーン",
        price: "R$ 748",
        supportingText: "日本から直送",
      },
    ],
  },
  {
    count: 3,
    id: "limited",
    infoLabel: "購入前に最終金額と納期を確認",
    title: "限定・ハイブランド",
    products: [
      {
        id: "generic-loewe-puzzle",
        image: "/sazo-commerce/reference/handbag.png",
        name: "LOEWE Puzzle バッグ\nスモール",
        price: "R$ 684",
        supportingText: "見積確認",
      },
      {
        id: "generic-sk-ii-essence",
        image: "/sazo-commerce/beauty/skincare-01.webp",
        name: "SK-II フェイシャル\nトリートメント エッセンス",
        price: "R$ 895",
        supportingText: "見積確認",
      },
      {
        id: "generic-anessa-sunscreen",
        image: "/sazo-commerce/categories/beauty-uv-care.png",
        name: "アネッサ パーフェクトUV\nスキンケアミルク N",
        price: "R$ 174",
        supportingText: "見積確認",
      },
    ],
  },
  {
    count: 3,
    id: "flea",
    infoLabel: "状態・付属品・出品者評価を確認",
    title: "フリマ・中古",
    products: [
      {
        id: "generic-pokemon-keyring",
        image: "/sazo-commerce/ranking/04.webp",
        name: "ポケモン キーリング\nピカチュウ",
        price: "R$ 714",
        supportingText: "状態確認",
      },
      {
        id: "generic-uniqlo-bag",
        image: "/sazo-commerce/products/08.webp",
        name: "ユニクロ\nラウンドミニショルダーバッグ",
        price: "R$ 168",
        supportingText: "状態確認",
      },
      {
        id: "generic-refa-hair-iron",
        image: "/sazo-commerce/categories/beauty-haircare.png",
        name: "ReFa\nストレートアイロン プロ",
        price: "R$ 522",
        supportingText: "状態確認",
      },
    ],
  },
] as const;
