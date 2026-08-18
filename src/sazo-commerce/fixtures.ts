import type {
  BrandFilterId,
  CatalogTabId,
  DirectoryCategoryId,
  ReviewCategoryId,
  ReviewDecisionAxisId,
  SazoHeroFeed,
  SazoView,
} from "@/sazo-commerce/model";

export type SazoImagePath = `/sazo-commerce/${string}`;

export interface ProductSpecification {
  label: string;
  value: string;
}

/**
 * 商品ページの説明を、安全に表示するための構造化コンテンツです。
 * 外部ページの HTML は取り込まず、このブロックだけをレンダーします。
 */
export type ProductContentBlock =
  | {
      id: string;
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      id: string;
      type: "paragraph";
      text: string;
    }
  | {
      id: string;
      type: "bulletList";
      items: readonly string[];
    }
  | {
      id: string;
      type: "specTable";
      rows: readonly ProductSpecification[];
    }
  | {
      id: string;
      type: "image";
      src: SazoImagePath;
      alt: string;
      caption?: string;
      aspectRatio?: number;
    }
  | {
      id: string;
      type: "imageGallery";
      images: readonly {
        src: SazoImagePath;
        alt: string;
        caption?: string;
      }[];
    }
  | {
      id: string;
      type: "divider";
    };

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: SazoImagePath;
  mobileHeight: number;
  mobileImage: SazoImagePath;
  mobileTitleLines: readonly string[];
  mobileWidth: number;
}

export type ShortcutIconId =
  | "feature"
  | "limited"
  | "flea-market"
  | "cosmetics"
  | "k-pop";

export interface Shortcut {
  id: ShortcutIconId;
  label: string;
  badge?: "new";
}

export type HomeShortcutIconId =
  | "feature"
  | "limited"
  | "flea-market"
  | "service"
  | "brands"
  | "categories"
  | "reviews"
  | "help"
  | "news";

export interface HomeShortcutItem {
  id: string;
  labelKey: string;
  icon?: HomeShortcutIconId;
  view?: SazoView;
}

export interface DesktopHomeShortcutItem {
  id:
    | "feature"
    | "limited"
    | "brands"
    | "game"
    | "figure"
    | "camera"
    | "skincare"
    | "categories";
  labelKey: string;
  view: SazoView;
}

/**
 * PC home only: four independent discovery panels placed behind the purchase
 * agent lens. Keeping these as individual fixtures lets the foreground lens
 * remain the only interaction surface while each visual still links to an
 * existing discovery destination.
 */
export interface DesktopAgentLensBackdropBanner {
  action: "campaign" | "categories" | "chatgpt" | "coupons";
  ariaLabel: string;
  id: "chatgpt" | "coupon" | "search" | "summer";
  image: SazoImagePath;
  label: string;
  position: "left-bottom" | "left-top" | "right-bottom" | "right-top";
  supportingCopy?: string;
}

export interface DesktopHomeCategoryItem {
  id: string;
  image: SazoImagePath;
  labelKey: string;
  view: SazoView;
}

export interface HomeCategoryItem {
  id: DirectoryCategoryId;
  labelKey: string;
  image: SazoImagePath;
  view?: SazoView;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: SazoImagePath;
  badge?: string;
  sourceIcon?: SazoImagePath;
  /** 商品仕様。未設定の既存商品は ProductDetail.information を利用します。 */
  specifications?: readonly ProductSpecification[];
  /** リッチな商品説明。文字列だけの既存商品は paragraph ブロックへ変換します。 */
  descriptionBlocks?: readonly ProductContentBlock[];
}

export interface ProductDetail {
  product: Product;
  gallery: readonly SazoImagePath[];
  originalName: string;
  categoryLabel: string;
  originalUrl: string;
  commerce: {
    rating: number;
    reviewCount: number;
    sellerLogoLabel: string;
    sellerName: string;
    soldLabel: string;
  };
  unitPriceAmount: number;
  localDistributionFeeAmount: number;
  purchaseTypeId: "direct" | "marketplace";
  deliveryEstimateDays: number;
  optionLabel: string;
  options: readonly string[];
  purchaseNote: string;
  information: string;
  recommendationIds: readonly string[];
}

export function parseYenPrice(price: string): number {
  return Number.parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
}

export function formatYen(amount: number): string {
  return `¥${new Intl.NumberFormat("ja-JP").format(amount)}`;
}

export function formatBrl(amount: number): string {
  return `R$ ${new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(amount)))}`;
}

export function calculateProductTotal(
  unitPriceAmount: number,
  quantity: number,
  localDistributionFeeAmount: number,
): number {
  return unitPriceAmount * Math.max(1, quantity) + localDistributionFeeAmount;
}

export interface RecordedMediaCrop {
  controlBoundaryY: number;
  crop: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  image: SazoImagePath;
  sourceSecond: number;
}

export interface RankingKeyword {
  rank: number;
  label: string;
}

export interface Brand {
  id: string;
  name: string;
  japaneseName: string;
  image: SazoImagePath;
  logo: SazoImagePath;
  filters: readonly BrandFilterId[];
}

export interface Category {
  id: string;
  name: string;
  image: SazoImagePath;
}

export interface CategoryDirectoryEntry {
  id: DirectoryCategoryId;
  name: string;
  children: readonly CategoryDirectoryChild[];
  mobileChildren?: readonly CategoryDirectoryChild[];
}

export interface CategoryDirectoryChild {
  id: string;
  label: string;
  targetCatalogId: CatalogTabId;
  image?: SazoImagePath;
}

export interface CatalogChip {
  id: string;
  label: string;
}

export interface CatalogTab {
  id: CatalogTabId;
  label: string;
  chips: readonly CatalogChip[];
}

export interface CatalogInventoryEntry {
  product: Product;
  tabIds: readonly CatalogTabId[];
  chipIds: readonly string[];
}

export interface ReviewCategory {
  id: ReviewCategoryId;
  label: string;
}

export interface EditorialReview {
  id: string;
  author: string;
  body: string;
  categoryIds: readonly Exclude<ReviewCategoryId, "all">[];
  likes: number;
  comments: number;
  image: SazoImagePath | null;
}

export interface PurchaseExperienceReview {
  id: string;
  author: string;
  city: string;
  bodyKey: string;
  chipKeys: readonly string[];
  decisionAxes: readonly Exclude<ReviewDecisionAxisId, "all">[];
  image: SazoImagePath;
  imageAltKey: string;
}

export interface PurchaseReviewFilter {
  id: ReviewDecisionAxisId;
  labelKey: string;
}

export interface ServiceStep {
  id: "01" | "02" | "03";
  image: SazoImagePath;
}

export interface Review {
  id: string;
  author: string;
  productName: string;
  comment: string;
  rating: number;
  likes: number;
  comments: number;
  image: SazoImagePath;
}

export interface GramEntry {
  id: string;
  author: string;
  caption: string;
  image: SazoImagePath;
}

export interface HomeGramEntry extends GramEntry {
  product: {
    discount?: string;
    image: SazoImagePath;
    name: string;
    price: string;
  };
}

export interface ReviewRecommendation {
  id: string;
  author: string;
  comment: string;
  rating: number;
  product: Product;
}

export type SazoCountryCode =
  | "JP"
  | "KR"
  | "CN"
  | "US"
  | "TW"
  | "BN"
  | "SG"
  | "DE"
  | "TH"
  | "GU"
  | "RU";

export interface SazoCountryOption {
  code: SazoCountryCode;
  dialingCode: string;
}

export interface SazoAccountFixture {
  birthday: string;
  coupons: number;
  displayName: string;
  email: string;
  expiringPoints: number;
  pendingPoints: number;
  phone: string;
  points: number;
}

export const sazoAccountFixture = {
  birthday: "2001-08-22",
  coupons: 1,
  displayName: "Tetsu Fujita",
  email: "tetsu.fujita@andes.global",
  expiringPoints: 500,
  pendingPoints: 0,
  phone: "08039390822",
  points: 500,
} satisfies SazoAccountFixture;

export const sazoCountryOptions = [
  { code: "JP", dialingCode: "81" },
  { code: "KR", dialingCode: "82" },
  { code: "CN", dialingCode: "86" },
  { code: "US", dialingCode: "1" },
  { code: "TW", dialingCode: "886" },
  { code: "BN", dialingCode: "673" },
  { code: "SG", dialingCode: "65" },
  { code: "DE", dialingCode: "49" },
  { code: "TH", dialingCode: "66" },
  { code: "GU", dialingCode: "1" },
  { code: "RU", dialingCode: "7" },
] satisfies readonly SazoCountryOption[];

export const heroSlides = [
  {
    id: "jplanet-home-japan-brazil",
    title: "日本の買い物を、もっと確かに。",
    subtitle: "日本からブラジルへのショッピング",
    image: "/sazo-commerce/hero/jplanet-home-japan-brazil-v2.png",
    mobileHeight: 852,
    mobileImage: "/sazo-commerce/hero/jplanet-home-japan-brazil-mobile-v4.png",
    mobileTitleLines: ["日本の買い物を、", "もっと確かに。"],
    mobileWidth: 887,
  },
  {
    id: "jplanet-home-chatgpt",
    title: "ChatGPTから、J-Planetで買い物しよう！",
    subtitle: "会話から商品を探す",
    image: "/sazo-commerce/hero/jplanet-home-chatgpt-v2.png",
    mobileHeight: 852,
    mobileImage: "/sazo-commerce/hero/jplanet-home-chatgpt-mobile-v4.png",
    mobileTitleLines: ["ChatGPTから、", "J-Planetで", "買い物しよう！"],
    mobileWidth: 887,
  },
  {
    id: "jplanet-home-popular",
    title: "いま、人気の商品を見つけよう。",
    subtitle: "おすすめ商品",
    image: "/sazo-commerce/hero/jplanet-home-popular-v2.png",
    mobileHeight: 852,
    mobileImage: "/sazo-commerce/hero/jplanet-home-popular-mobile-v4.png",
    mobileTitleLines: ["いま、", "人気の商品を", "見つけよう。"],
    mobileWidth: 887,
  },
  {
    id: "jplanet-home-service",
    title: "探す、確かめる、届けるまで。",
    subtitle: "サービス紹介",
    image: "/sazo-commerce/hero/jplanet-home-service-v2.png",
    mobileHeight: 852,
    mobileImage: "/sazo-commerce/hero/jplanet-home-service-mobile-v4.png",
    mobileTitleLines: ["探す、確かめる、", "届けるまで。"],
    mobileWidth: 887,
  },
] satisfies readonly HeroSlide[];

const jplanetHeroSlideIds = [
  "jplanet-home-japan-brazil",
  "jplanet-home-chatgpt",
  "jplanet-home-popular",
  "jplanet-home-service",
] as const;

const heroSlideIdsByFeed = {
  natural: jplanetHeroSlideIds,
  "cold-first": jplanetHeroSlideIds,
  "delivery-last": jplanetHeroSlideIds,
  "large-first": jplanetHeroSlideIds,
} as const satisfies Record<SazoHeroFeed, readonly string[]>;

export function getHeroSlidesForFeed(feed: SazoHeroFeed): readonly HeroSlide[] {
  return heroSlideIdsByFeed[feed].map((id) => {
    const slide = heroSlides.find((candidate) => candidate.id === id);

    if (slide === undefined) {
      throw new Error(`Missing J-Planet hero slide: ${id}`);
    }

    return slide;
  });
}

export const shortcuts = [
  { id: "feature", label: "J-Planet特集" },
  { id: "limited", label: "限定" },
  { id: "flea-market", label: "フリマ" },
  { badge: "new", id: "cosmetics", label: "コスメ" },
  { badge: "new", id: "k-pop", label: "K-POP" },
] satisfies readonly Shortcut[];

export const homeShortcutItems: readonly HomeShortcutItem[] = [
  { id: "feature", labelKey: "feature", icon: "feature" },
  { id: "limited", labelKey: "limited", icon: "limited" },
  { id: "flea-market", labelKey: "fleaMarket", icon: "flea-market" },
  { id: "service", labelKey: "service", icon: "service", view: "service" },
  { id: "brands", labelKey: "brands", icon: "brands", view: "brands" },
  {
    id: "categories",
    labelKey: "categories",
    icon: "categories",
    view: "categories",
  },
  { id: "reviews", labelKey: "reviews", icon: "reviews", view: "reviews" },
  { id: "help", labelKey: "help", icon: "help", view: "support" },
  { id: "news", labelKey: "news", icon: "news" },
] satisfies readonly HomeShortcutItem[];

export const desktopHomeShortcutItems = [
  { id: "feature", labelKey: "feature", view: "home" },
  { id: "limited", labelKey: "limited", view: "catalog" },
  { id: "brands", labelKey: "brands", view: "brands" },
  { id: "game", labelKey: "game", view: "categories" },
  { id: "figure", labelKey: "figure", view: "categories" },
  { id: "camera", labelKey: "camera", view: "categories" },
  { id: "skincare", labelKey: "skincare", view: "categories" },
  { id: "categories", labelKey: "categories", view: "categories" },
] satisfies readonly DesktopHomeShortcutItem[];

export const desktopAgentLensBackdropBanners = [
  {
    action: "coupons",
    ariaLabel: "初回クーポンを見る",
    id: "coupon",
    image: "/sazo-commerce/generated/agent-lens-premium-coupon-v2.png",
    label: "はじめてのクーポン",
    position: "left-top",
  },
  {
    action: "chatgpt",
    ariaLabel: "J-PlanetをChatGPTから使う",
    id: "chatgpt",
    image: "/sazo-commerce/generated/agent-lens-premium-openai-v1.png",
    label: "ChatGPTから使う",
    position: "right-top",
    supportingCopy: "J-PlanetをChatGPTから使う",
  },
  {
    action: "categories",
    ariaLabel: "おすすめの検索先を見る",
    id: "search",
    image: "/sazo-commerce/generated/agent-lens-premium-search-v1.png",
    label: "おすすめの検索先",
    position: "left-bottom",
  },
  {
    action: "campaign",
    ariaLabel: "サマーセールを見る",
    id: "summer",
    image: "/sazo-commerce/generated/agent-lens-premium-summer-v1.png",
    label: "サマーセールを見る",
    position: "right-bottom",
  },
] satisfies readonly DesktopAgentLensBackdropBanner[];

export const desktopHomeCategoryItems = [
  {
    id: "ladies",
    image: "/sazo-commerce/mobile-picks/20.png",
    labelKey: "ladies",
    view: "categories",
  },
  {
    id: "mens",
    image: "/sazo-commerce/products/07.webp",
    labelKey: "mens",
    view: "categories",
  },
  {
    id: "shoes",
    image: "/sazo-commerce/reference/new-balance-9060.png",
    labelKey: "shoes",
    view: "categories",
  },
  {
    id: "bags",
    image: "/sazo-commerce/reference/handbag.png",
    labelKey: "bags",
    view: "categories",
  },
  {
    id: "beauty",
    image: "/sazo-commerce/reference/lipstick.png",
    labelKey: "beauty",
    view: "categories",
  },
  {
    id: "skincare",
    image: "/sazo-commerce/products/11.webp",
    labelKey: "skincare",
    view: "categories",
  },
  {
    id: "mobile",
    image: "/sazo-commerce/mobile-picks/14.png",
    labelKey: "mobile",
    view: "categories",
  },
  {
    id: "appliances",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
    labelKey: "appliances",
    view: "categories",
  },
  {
    id: "gaming",
    image: "/sazo-commerce/reference/game-controller.png",
    labelKey: "gaming",
    view: "categories",
  },
  {
    id: "figures",
    image: "/sazo-commerce/reference/figure.png",
    labelKey: "figures",
    view: "categories",
  },
  {
    id: "cameras",
    image: "/sazo-commerce/reference/mirrorless-camera.png",
    labelKey: "cameras",
    view: "categories",
  },
  {
    id: "audio",
    image: "/sazo-commerce/mobile-picks/12.png",
    labelKey: "audio",
    view: "categories",
  },
  {
    id: "hobby",
    image: "/sazo-commerce/mobile-picks/01.png",
    labelKey: "hobby",
    view: "categories",
  },
  {
    id: "kids",
    image: "/sazo-commerce/products/02.webp",
    labelKey: "kids",
    view: "categories",
  },
  {
    id: "sports",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    labelKey: "sports",
    view: "categories",
  },
  {
    id: "watches",
    image: "/sazo-commerce/mobile-picks/17.png",
    labelKey: "watches",
    view: "categories",
  },
  {
    id: "living",
    image: "/sazo-commerce/mobile-picks/16.png",
    labelKey: "living",
    view: "categories",
  },
  {
    id: "pets",
    image: "/sazo-commerce/products/01.webp",
    labelKey: "pets",
    view: "categories",
  },
  {
    id: "stationery",
    image: "/sazo-commerce/products/10.webp",
    labelKey: "stationery",
    view: "categories",
  },
  {
    id: "all",
    image: "/sazo-commerce/mobile-picks/29.png",
    labelKey: "all",
    view: "categories",
  },
] satisfies readonly DesktopHomeCategoryItem[];

export const products = [
  {
    id: "p01",
    brand: "11D",
    name: "NCT WISH エンシティウィッシュ - STEADY ミニキーリング",
    price: "¥3,799",
    image: "/sazo-commerce/products/01.webp",
    badge: "1",
  },
  {
    id: "p02",
    brand: "11D",
    name: "エンシティウィッシュ (NCT WISH) - ミニアルバム",
    price: "¥4,012",
    image: "/sazo-commerce/products/02.webp",
  },
  {
    id: "p03",
    brand: "11D",
    name: "エンシティウィッシュ (NCT WISH) - Steady 1st Mini Album",
    price: "¥4,594",
    image: "/sazo-commerce/products/03.webp",
  },
  {
    id: "p04",
    brand: "11D",
    name: "[A フォトカード／ランダム] エンシティウィッシュ",
    price: "¥550",
    image: "/sazo-commerce/products/04.webp",
  },
  {
    id: "p05",
    brand: "11D",
    name: "NCT WISH ミニ1集 Steady QR Ver.",
    price: "¥1,290",
    image: "/sazo-commerce/products/05.webp",
  },
  {
    id: "p06",
    brand: "NAVER",
    name: "[五行 厄除け] お守り 塩キーホルダー",
    price: "¥2,392",
    image: "/sazo-commerce/products/06.webp",
    badge: "21%",
  },
  {
    id: "p07",
    brand: "ABLY",
    name: "[オヌレジブ単独] トゥデイ・スイッチ・カバー",
    price: "¥4,397",
    image: "/sazo-commerce/products/07.webp",
    badge: "10%",
  },
  {
    id: "p08",
    brand: "Alo Yoga",
    name: "Iconic Shopper Tote Bag Grey Tiedye",
    price: "¥6,404",
    image: "/sazo-commerce/products/08.webp",
  },
  {
    id: "p09",
    brand: "Oofos",
    name: "Original Black",
    price: "¥6,997",
    image: "/sazo-commerce/products/09.webp",
  },
  {
    id: "p10",
    brand: "NAVER",
    name: "プチプチ犬ヘッド ピンチ式リボンボンドピン",
    price: "¥806",
    image: "/sazo-commerce/products/10.webp",
    badge: "13%",
  },
  {
    id: "p11",
    brand: "11D",
    name: "高濃縮アンプルマスクパック 6種30枚",
    price: "¥1,578",
    image: "/sazo-commerce/products/11.webp",
  },
  {
    id: "p12",
    brand: "NAVER",
    name: "優しい人形室 手編みマカロン綿糸",
    price: "¥104",
    image: "/sazo-commerce/products/12.webp",
  },
] satisfies readonly Product[];

/** Reference products used by the J-Planet mobile commerce mock. */
export const referenceProducts = [
  {
    id: "jplanet-new-balance-9060",
    brand: "New Balance Japan",
    name: "New Balance 9060",
    price: "¥22,000",
    image: "/sazo-commerce/reference/new-balance-9060.png",
  },
  {
    id: "jplanet-sony-a7c-ii",
    brand: "Sony Japan",
    name: "Sony α7C II ボディ",
    price: "¥189,800",
    image: "/sazo-commerce/reference/mirrorless-camera.png",
  },
  {
    id: "jplanet-nintendo-switch-oled",
    brand: "Rakuten Japan・公式ストア",
    name: "Nintendo Switch OLED",
    price: "¥37,980",
    image: "/sazo-commerce/reference/nintendo-switch-oled.png",
  },
  {
    id: "jplanet-nintendo-pro-controller",
    brand: "Nintendo 公式",
    name: "Nintendo Switch Proコントローラー",
    price: "¥6,900",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    specifications: [
      { label: "対応機種", value: "Nintendo Switch / Nintendo Switch OLED" },
      { label: "接続方式", value: "Bluetooth / USB Type-C" },
      { label: "カラー", value: "ブラック" },
      { label: "バッテリー", value: "充電式リチウムイオン" },
      { label: "連続使用時間", value: "約40時間" },
      { label: "重量", value: "約246g" },
      { label: "付属品", value: "USB充電ケーブル" },
      { label: "型番", value: "HAC-A-FSSKA" },
      { label: "メーカー", value: "Nintendo" },
      { label: "商品状態", value: "新品" },
    ],
    descriptionBlocks: [
      {
        id: "controller-headline",
        type: "heading",
        level: 2,
        text: "快適な操作を、長時間楽しめる。",
      },
      {
        id: "controller-introduction",
        type: "paragraph",
        text: "Nintendo SwitchのTVモードやテーブルモードで、安定した操作を楽しめるワイヤレスコントローラーです。手になじみやすいグリップで、集中したプレイにも自然に対応します。",
      },
      {
        id: "controller-front-image",
        type: "image",
        src: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
        alt: "Nintendo Switch Proコントローラー ブラックの正面",
        caption: "ブラック",
        aspectRatio: 1,
      },
      {
        id: "controller-features",
        type: "bulletList",
        items: [
          "Bluetoothによるワイヤレス接続",
          "USB Type-Cで充電可能",
          "モーションIRカメラ対応",
          "HD振動対応",
          "長時間プレイしやすいグリップ形状",
        ],
      },
      { id: "controller-divider", type: "divider" },
      {
        id: "controller-specification-heading",
        type: "heading",
        level: 3,
        text: "主な仕様",
      },
      {
        id: "controller-specification-table",
        type: "specTable",
        rows: [
          { label: "対応機種", value: "Nintendo Switch / Nintendo Switch OLED" },
          { label: "接続方式", value: "Bluetooth / USB Type-C" },
          { label: "連続使用時間", value: "約40時間" },
          { label: "重量", value: "約246g" },
          { label: "同梱物", value: "USB充電ケーブル" },
        ],
      },
      {
        id: "controller-colors",
        type: "imageGallery",
        images: [
          {
            src: "/sazo-commerce/reference/nintendo-pro-controller-white-v1.png",
            alt: "Nintendo Switch Proコントローラー ホワイト",
            caption: "ホワイト",
          },
          {
            src: "/sazo-commerce/reference/nintendo-pro-controller-splatoon-v1.png",
            alt: "Nintendo Switch Proコントローラー スプラトゥーンカラー",
            caption: "スプラトゥーン",
          },
        ],
      },
    ],
  },
] satisfies readonly Product[];

/** Desktop-only related products for the Nintendo controller detail rail. */
export const desktopControllerRelatedProducts = [
  {
    id: "jplanet-nintendo-switch-oled",
    brand: "Rakuten Japan",
    name: "Nintendo Switch OLED",
    price: "R$ 2,184",
    image: "/sazo-commerce/reference/nintendo-switch-oled.png",
  },
  {
    id: "jplanet-nintendo-joycon",
    brand: "Nintendo",
    name: "Joy-Con (L)/(R)",
    price: "R$ 512",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
  },
  {
    id: "jplanet-nintendo-carrying-case",
    brand: "Rakuten Japan",
    name: "Nintendo Switch キャリングケース",
    price: "R$ 188",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
  },
  {
    id: "jplanet-wireless-game-controller",
    brand: "Nintendo",
    name: "ワイヤレス ゲームコントローラー",
    price: "R$ 318",
    image: "/sazo-commerce/reference/game-controller.png",
  },
  {
    id: "jplanet-controller-storage-case",
    brand: "Rakuten Japan",
    name: "Proコントローラー 収納ケース",
    price: "R$ 164",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
  },
  {
    id: "jplanet-nintendo-joycon-neon",
    brand: "Nintendo",
    name: "Joy-Con ネオンブルー／ネオンレッド",
    price: "R$ 512",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
  },
] satisfies readonly Product[];

export const interestedProducts = [
  {
    id: "interested-nike-rope",
    brand: "11ST",
    name: "[ナイキ] ファンダメンタル 重量減り(AC4197-010)",
    price: "¥3,339",
    image: "/sazo-commerce/interested-items/01.webp",
    sourceIcon: "/sazo-commerce/interested-items/source-11st.png",
  },
  {
    id: "interested-nike-mind",
    brand: "KREAM",
    name: "Nike Mind 001 Black Chrome",
    price: "¥17,432",
    image: "/sazo-commerce/interested-items/02.webp",
    sourceIcon: "/sazo-commerce/interested-items/source-kream.png",
  },
  {
    id: "interested-sprint-sister",
    brand: "29CM",
    name: "[インフルエンサーPick]スプリントシスターW - [リザーロック：オーシャンキューブ：ダークシンダー：セール / IR5693-256]",
    price: "¥12,803",
    image: "/sazo-commerce/interested-items/03.webp",
  },
  {
    id: "interested-meat-keyring",
    brand: "29CM",
    name: "肉ラバーかわいいギフトおいしい肉キリング役に立たない無駄な面白い人形動物キーホルダー",
    price: "¥1,048",
    image: "/sazo-commerce/interested-items/04.webp",
  },
  {
    id: "interested-duck-cushion",
    brand: "11ST",
    name: "アヒル人形睡眠モチ大型抱擁者クッション動物ぬいぐるみアヒル人形かわいい大型大王小さな巨大動物ボディ",
    price: "¥1,651",
    image: "/sazo-commerce/interested-items/05.webp",
  },
] satisfies readonly Product[];

export const searchDiscoveryMediaCrops = [
  {
    controlBoundaryY: 744,
    crop: { height: 464, width: 536, x: 350, y: 272 },
    image: "/sazo-commerce/search-products/01.png",
    sourceSecond: 37.5,
  },
  {
    controlBoundaryY: 744,
    crop: { height: 464, width: 536, x: 935, y: 272 },
    image: "/sazo-commerce/search-products/02.png",
    sourceSecond: 37.5,
  },
  {
    controlBoundaryY: 744,
    crop: { height: 464, width: 536, x: 1520, y: 272 },
    image: "/sazo-commerce/search-products/03.png",
    sourceSecond: 37.5,
  },
  {
    controlBoundaryY: 744,
    crop: { height: 464, width: 536, x: 2105, y: 272 },
    image: "/sazo-commerce/search-products/04.png",
    sourceSecond: 37.5,
  },
] as const satisfies readonly RecordedMediaCrop[];

export const searchDiscoveryProducts = [
  {
    brand: "KREAM",
    id: "recorded-search-01",
    image: searchDiscoveryMediaCrops[0].image,
    name: "防弾BTSマジックショップ マオタームードダウンポカ",
    price: "¥1,152",
  },
  {
    brand: "NAVER",
    id: "recorded-search-02",
    image: searchDiscoveryMediaCrops[1].image,
    name: "休憩室待合室椅子 3人用ロビー教会長椅子",
    price: "¥10,247",
  },
  {
    badge: "12%",
    brand: "NAVER",
    id: "recorded-search-03",
    image: searchDiscoveryMediaCrops[2].image,
    name: "竹箸50個入り 木製の使い捨て調理箸",
    price: "¥440",
  },
  {
    badge: "25%",
    brand: "NAVER",
    id: "recorded-search-04",
    image: searchDiscoveryMediaCrops[3].image,
    name: "14k 18k ミニハートロック ドロップワンタッチイヤリング",
    price: "¥90,146",
  },
] satisfies readonly Product[];

export const rankingKeywords = [
  { rank: 1, label: "NCT WISH(NCT WISH)" },
  { rank: 2, label: "명일방주 엔드필드(アークナイツ エンドフィールド)" },
  { rank: 3, label: "포토카드(トレカ)" },
  { rank: 4, label: "다이소(ダイソー)" },
  { rank: 5, label: "도무송(ドムソン)" },
  { rank: 6, label: "아일릿(ILLIT)" },
  { rank: 7, label: "픽시 바이크(ピストバイク)" },
  { rank: 8, label: "명일방주(アークナイツ)" },
  { rank: 9, label: "보이넥스트도어(BOYNEXTDOOR)" },
  { rank: 10, label: "엔드필드(エンドフィールド)" },
] satisfies readonly RankingKeyword[];

export const brands = [
  {
    id: "nike",
    name: "NIKE",
    japaneseName: "ナイキ",
    image: "/sazo-commerce/brands/01.webp",
    logo: "/sazo-commerce/brand-logos/01.webp",
    filters: ["apparel", "shoes"],
  },
  {
    id: "acne-studios",
    name: "ACNE STUDIOS",
    japaneseName: "アクネ・ストゥディオズ",
    image: "/sazo-commerce/brands/02.webp",
    logo: "/sazo-commerce/brand-logos/02.webp",
    filters: ["apparel", "accessories"],
  },
  {
    id: "arcteryx",
    name: "ARC'TERYX",
    japaneseName: "アークテリクス",
    image: "/sazo-commerce/brands/03.webp",
    logo: "/sazo-commerce/brand-logos/03.webp",
    filters: ["apparel", "accessories", "bags"],
  },
  {
    id: "apple",
    name: "APPLE",
    japaneseName: "アップル",
    image: "/sazo-commerce/brands/04.webp",
    logo: "/sazo-commerce/brand-logos/04.webp",
    filters: ["gadgets"],
  },
  {
    id: "diptyque",
    name: "DIPTYQUE",
    japaneseName: "ディプティック",
    image: "/sazo-commerce/brands/05.webp",
    logo: "/sazo-commerce/brand-logos/05.webp",
    filters: ["beauty"],
  },
  {
    id: "maison-margiela",
    name: "MAISON MARGIELA",
    japaneseName: "メゾン・マルジェラ",
    image: "/sazo-commerce/brands/06.webp",
    logo: "/sazo-commerce/brand-logos/06.webp",
    filters: ["apparel", "accessories"],
  },
  {
    id: "the-north-face",
    name: "THE NORTH FACE",
    japaneseName: "ザ・ノース・フェイス",
    image: "/sazo-commerce/brands/07.webp",
    logo: "/sazo-commerce/brand-logos/07.webp",
    filters: ["apparel", "bags"],
  },
  {
    id: "longchamp",
    name: "LONGCHAMP",
    japaneseName: "ロンシャン",
    image: "/sazo-commerce/brands/08.webp",
    logo: "/sazo-commerce/brand-logos/08.webp",
    filters: ["accessories", "bags"],
  },
] satisfies readonly Brand[];

export type JplanetBrandDirectoryCategory =
  | "apparel"
  | "accessories"
  | "sneakers"
  | "cosmetics"
  | "electronics"
  | "hobby";

export type BrandProductCategory = "general" | "limited" | "flea" | "cosmetics" | "kpop";

export interface BrandProduct {
  id: string;
  brandId: string;
  name: string;
  image: SazoImagePath;
  source: string;
  priceBrl: number;
  category: BrandProductCategory;
  condition?: "new" | "unused" | "used";
  isSaved: boolean;
}

export interface BrandSection {
  id: string;
  title: string;
  category: BrandProductCategory;
  products: readonly BrandProduct[];
}

export interface JplanetBrandDirectoryItem {
  id: string;
  name: string;
  nameJa: string;
  logo?: SazoImagePath;
  category: JplanetBrandDirectoryCategory;
  previewProducts: readonly SazoImagePath[];
  isSaved: boolean;
}

/**
 * J-Planet用のブランドディレクトリ。ロゴが存在しないブランドは、名前だけを
 * タイポグラフィとして表示します。保存状態はアプリの state 側で保持します。
 */
export const jplanetBrandDirectory = [
  {
    id: "nike",
    name: "NIKE",
    nameJa: "ナイキ",
    logo: "/sazo-commerce/brand-logos/01.webp",
    category: "sneakers",
    previewProducts: [
      "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
      "/sazo-commerce/reference/new-balance-9060.png",
      "/sazo-commerce/products/09.webp",
    ],
    isSaved: false,
  },
  {
    id: "acne-studios",
    name: "ACNE STUDIOS",
    nameJa: "アクネ ストゥディオズ",
    category: "accessories",
    previewProducts: [
      "/sazo-commerce/products/08.webp",
      "/sazo-commerce/products/07.webp",
      "/sazo-commerce/products/09.webp",
    ],
    isSaved: false,
  },
  {
    id: "arcteryx",
    name: "ARC'TERYX",
    nameJa: "アークテリクス",
    category: "apparel",
    previewProducts: [
      "/sazo-commerce/products/08.webp",
      "/sazo-commerce/products/06.webp",
      "/sazo-commerce/products/09.webp",
    ],
    isSaved: false,
  },
  {
    id: "new-balance",
    name: "NEW BALANCE",
    nameJa: "ニューバランス",
    category: "sneakers",
    previewProducts: [
      "/sazo-commerce/reference/new-balance-9060.png",
      "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
      "/sazo-commerce/products/09.webp",
    ],
    isSaved: true,
  },
  {
    id: "adidas",
    name: "ADIDAS",
    nameJa: "アディダス",
    category: "sneakers",
    previewProducts: [
      "/sazo-commerce/products/09.webp",
      "/sazo-commerce/reference/new-balance-9060.png",
      "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    ],
    isSaved: false,
  },
  {
    id: "apple",
    name: "APPLE",
    nameJa: "アップル",
    category: "electronics",
    previewProducts: [
      "/sazo-commerce/reference/mirrorless-camera.png",
      "/sazo-commerce/reference/nintendo-switch-oled.png",
      "/sazo-commerce/reference/nintendo-joycon-v1.png",
    ],
    isSaved: false,
  },
  {
    id: "sony",
    name: "SONY",
    nameJa: "ソニー",
    category: "electronics",
    previewProducts: [
      "/sazo-commerce/reference/mirrorless-camera.png",
      "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
      "/sazo-commerce/reference/nintendo-switch-oled.png",
    ],
    isSaved: true,
  },
  {
    id: "nintendo",
    name: "NINTENDO",
    nameJa: "任天堂",
    category: "hobby",
    previewProducts: [
      "/sazo-commerce/reference/nintendo-switch-oled.png",
      "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
      "/sazo-commerce/reference/nintendo-joycon-v1.png",
    ],
    isSaved: false,
  },
] as const satisfies readonly JplanetBrandDirectoryItem[];

/** NIKE詳細で比較するためのBRL建てモック在庫。 */
export const nikeBrandProducts = [
  {
    id: "nike-air-jordan-1-retro",
    brandId: "nike",
    name: "Air Jordan 1 Retro High OG",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    source: "SNKRS Japan",
    priceBrl: 789,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-new-balance-9060",
    brandId: "nike",
    name: "New Balance 9060",
    image: "/sazo-commerce/reference/new-balance-9060.png",
    source: "日本公式サイト",
    priceBrl: 748,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-original-black",
    brandId: "nike",
    name: "Original Black サンダル",
    image: "/sazo-commerce/products/09.webp",
    source: "日本公式サイト",
    priceBrl: 363,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-sneaker-collection",
    brandId: "nike",
    name: "日本限定 スニーカーコレクション",
    image: "/sazo-commerce/products/08.webp",
    source: "Rakuten Japan",
    priceBrl: 472,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-street-runner",
    brandId: "nike",
    name: "ストリート ランナー ブラック",
    image: "/sazo-commerce/products/06.webp",
    source: "日本公式サイト",
    priceBrl: 524,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-limited-jordan",
    brandId: "nike",
    name: "Air Jordan 1 日本限定カラー",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    source: "SNKRS Japan",
    priceBrl: 1_120,
    category: "limited",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-limited-runner",
    brandId: "nike",
    name: "Nike ランナー コラボレーション",
    image: "/sazo-commerce/reference/new-balance-9060.png",
    source: "日本限定",
    priceBrl: 986,
    category: "limited",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-limited-black",
    brandId: "nike",
    name: "限定カラー ブラック エディション",
    image: "/sazo-commerce/products/09.webp",
    source: "ブランド限定",
    priceBrl: 899,
    category: "limited",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-flea-jordan",
    brandId: "nike",
    name: "Air Jordan 1 Retro High OG 中古",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    source: "日本フリマ",
    priceBrl: 612,
    category: "flea",
    condition: "used",
    isSaved: false,
  },
  {
    id: "nike-flea-runner",
    brandId: "nike",
    name: "Nike ランナー 未使用品",
    image: "/sazo-commerce/reference/new-balance-9060.png",
    source: "日本フリマ",
    priceBrl: 581,
    category: "flea",
    condition: "unused",
    isSaved: false,
  },
  {
    id: "nike-flea-sandal",
    brandId: "nike",
    name: "Original Black 中古",
    image: "/sazo-commerce/products/09.webp",
    source: "日本フリマ",
    priceBrl: 294,
    category: "flea",
    condition: "used",
    isSaved: false,
  },
  {
    id: "nike-sport-jacket",
    brandId: "nike",
    name: "スポーツ ジャケット",
    image: "/sazo-commerce/products/07.webp",
    source: "日本公式サイト",
    priceBrl: 658,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-urban-tote",
    brandId: "nike",
    name: "Urban Tote Bag",
    image: "/sazo-commerce/products/08.webp",
    source: "Rakuten Japan",
    priceBrl: 449,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-training-gear",
    brandId: "nike",
    name: "トレーニング ギア",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    source: "日本公式サイト",
    priceBrl: 429,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-tech-edition",
    brandId: "nike",
    name: "Tech Edition アクセサリー",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
    source: "日本公式サイト",
    priceBrl: 512,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-city-pack",
    brandId: "nike",
    name: "City Pack スニーカー",
    image: "/sazo-commerce/products/10.webp",
    source: "Rakuten Japan",
    priceBrl: 538,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-everyday-pack",
    brandId: "nike",
    name: "Everyday スポーツバッグ",
    image: "/sazo-commerce/products/11.webp",
    source: "日本公式サイト",
    priceBrl: 592,
    category: "general",
    condition: "new",
    isSaved: false,
  },
  {
    id: "nike-training-kit",
    brandId: "nike",
    name: "トレーニング キット",
    image: "/sazo-commerce/products/12.webp",
    source: "日本公式サイト",
    priceBrl: 676,
    category: "general",
    condition: "new",
    isSaved: false,
  },
] as const satisfies readonly BrandProduct[];

export const nikeBrandSections = [
  {
    id: "general",
    title: "最安値・一般",
    category: "general",
    products: nikeBrandProducts.filter((product) => product.category === "general"),
  },
  {
    id: "limited",
    title: "限定・ハイブランド",
    category: "limited",
    products: nikeBrandProducts.filter((product) => product.category === "limited"),
  },
  {
    id: "flea",
    title: "フリマ・中古",
    category: "flea",
    products: nikeBrandProducts.filter((product) => product.category === "flea"),
  },
  { id: "cosmetics", title: "コスメ", category: "cosmetics", products: [] },
  { id: "kpop", title: "K-POP", category: "kpop", products: [] },
] as const satisfies readonly BrandSection[];

export const categories = [
  { id: "skincare", name: "スキンケア", image: "/sazo-commerce/products/01.webp" },
  { id: "makeup", name: "メイクアップ", image: "/sazo-commerce/products/02.webp" },
  { id: "haircare", name: "ヘアケア", image: "/sazo-commerce/products/03.webp" },
  { id: "bodycare", name: "ボディケア", image: "/sazo-commerce/products/04.webp" },
  {
    id: "fragrance",
    name: "フレグランス",
    image: "/sazo-commerce/products/05.webp",
  },
  { id: "nail", name: "ネイル", image: "/sazo-commerce/products/06.webp" },
  {
    id: "beauty-device",
    name: "美容家電",
    image: "/sazo-commerce/products/07.webp",
  },
  { id: "fashion", name: "ファッション", image: "/sazo-commerce/products/08.webp" },
  { id: "bags", name: "バッグ・小物", image: "/sazo-commerce/products/09.webp" },
  { id: "home", name: "ホーム・キッチン", image: "/sazo-commerce/products/10.webp" },
  { id: "food", name: "フード", image: "/sazo-commerce/products/11.webp" },
  { id: "wellness", name: "ウェルネス", image: "/sazo-commerce/products/12.webp" },
  { id: "baby", name: "ベビー・キッズ", image: "/sazo-commerce/products/01.webp" },
  { id: "sale", name: "セール", image: "/sazo-commerce/products/02.webp" },
] satisfies readonly Category[];

export const categoryDirectory = [
  {
    id: "beauty",
    name: "化粧品",
    children: [
      { id: "skincare", label: "スキンケア", targetCatalogId: "skincare" },
      {
        id: "base-makeup",
        label: "ベースメイク",
        targetCatalogId: "base-makeup",
      },
      {
        id: "point-makeup",
        label: "ポイントメイク",
        targetCatalogId: "point-makeup",
      },
      { id: "sets", label: "セット商品", targetCatalogId: "sets" },
      { id: "tools", label: "メイク小物", targetCatalogId: "tools" },
      { id: "uv-care", label: "UVケア", targetCatalogId: "uv-care" },
      {
        id: "body-care",
        label: "ボディ・ハンド・フットケア",
        targetCatalogId: "body-care",
      },
      {
        id: "hair-removal",
        label: "脱毛・除毛",
        targetCatalogId: "hair-removal",
      },
      { id: "nails", label: "ネイル", targetCatalogId: "nails" },
      { id: "hair", label: "ヘア", targetCatalogId: "hair" },
      { id: "fragrance", label: "香水", targetCatalogId: "fragrance" },
      {
        id: "mens-cosmetics",
        label: "メンズコスメ",
        targetCatalogId: "mens-cosmetics",
      },
    ],
    mobileChildren: [
      {
        id: "skincare",
        label: "スキンケア",
        targetCatalogId: "skincare",
        image: "/sazo-commerce/categories/beauty-skincare.png",
      },
      {
        id: "base-makeup",
        label: "ベースメイク",
        targetCatalogId: "base-makeup",
        image: "/sazo-commerce/categories/beauty-base-makeup.png",
      },
      {
        id: "point-makeup",
        label: "ポイントメイク",
        targetCatalogId: "point-makeup",
        image: "/sazo-commerce/categories/beauty-point-makeup.png",
      },
      {
        id: "sets",
        label: "セット商品",
        targetCatalogId: "sets",
        image: "/sazo-commerce/categories/beauty-sets.png",
      },
      {
        id: "tools",
        label: "メイク小物",
        targetCatalogId: "tools",
        image: "/sazo-commerce/categories/beauty-tools.png",
      },
      {
        id: "uv-care",
        label: "UVケア",
        targetCatalogId: "uv-care",
        image: "/sazo-commerce/categories/beauty-uv-care.png",
      },
      {
        id: "cleansing",
        label: "クレンジング",
        targetCatalogId: "skincare",
        image: "/sazo-commerce/categories/beauty-cleansing.png",
      },
      {
        id: "haircare",
        label: "ヘアケア",
        targetCatalogId: "hair",
        image: "/sazo-commerce/categories/beauty-haircare.png",
      },
      {
        id: "bodycare",
        label: "ボディケア",
        targetCatalogId: "body-care",
        image: "/sazo-commerce/categories/beauty-bodycare.png",
      },
    ],
  },
  {
    id: "ladies",
    name: "レディース",
    children: [
      { id: "tops", label: "トップス", targetCatalogId: "tops" },
      { id: "outerwear", label: "アウター", targetCatalogId: "outerwear" },
      { id: "bottoms", label: "ボトムス", targetCatalogId: "bottoms" },
      { id: "dresses", label: "ワンピース", targetCatalogId: "dresses" },
      { id: "bags", label: "バッグ", targetCatalogId: "bags" },
    ],
  },
  {
    id: "mens",
    name: "メンズ",
    children: [
      { id: "mens-tops", label: "トップス", targetCatalogId: "tops" },
      { id: "mens-outerwear", label: "アウター", targetCatalogId: "outerwear" },
      { id: "mens-bottoms", label: "ボトムス", targetCatalogId: "bottoms" },
      { id: "shoes", label: "シューズ", targetCatalogId: "shoes" },
    ],
  },
  {
    id: "kids",
    name: "キッズ",
    children: [
      {
        id: "kids-fashion",
        label: "キッズファッション",
        targetCatalogId: "kids-fashion",
      },
      { id: "baby", label: "ベビー", targetCatalogId: "baby" },
      { id: "toys", label: "おもちゃ", targetCatalogId: "toys" },
    ],
  },
  {
    id: "living",
    name: "生活雑貨",
    children: [
      { id: "appliances", label: "家電", targetCatalogId: "appliances" },
      { id: "kitchen", label: "キッチン", targetCatalogId: "kitchen" },
      { id: "interior", label: "インテリア", targetCatalogId: "interior" },
      { id: "daily", label: "日用品", targetCatalogId: "daily" },
    ],
  },
  {
    id: "food",
    name: "食品",
    children: [
      { id: "snacks", label: "お菓子", targetCatalogId: "snacks" },
      { id: "drinks", label: "飲料", targetCatalogId: "drinks" },
      {
        id: "instant-food",
        label: "インスタント食品",
        targetCatalogId: "instant-food",
      },
    ],
  },
  {
    id: "pets",
    name: "ペット",
    children: [
      { id: "pet-food", label: "ペットフード", targetCatalogId: "pet-food" },
      {
        id: "pet-supplies",
        label: "ペット用品",
        targetCatalogId: "pet-supplies",
      },
    ],
  },
  {
    id: "appliances",
    name: "家電",
    children: [
      {
        id: "electronics",
        label: "家電・PC・ゲーム",
        targetCatalogId: "electronics",
      },
    ],
  },
  {
    id: "hobby",
    name: "趣味",
    children: [
      { id: "kpop", label: "K-POP", targetCatalogId: "kpop" },
      { id: "characters", label: "キャラクター", targetCatalogId: "characters" },
      { id: "sports", label: "スポーツ", targetCatalogId: "sports" },
    ],
  },
] satisfies readonly CategoryDirectoryEntry[];

/** Additional parent categories are exposed only in the mobile rail. */
export const mobileCategoryDirectoryEntries = [
  {
    id: "shoes",
    name: "シューズ",
    children: [
      { id: "sneakers", label: "スニーカー", targetCatalogId: "shoes" },
      { id: "sandals", label: "サンダル", targetCatalogId: "shoes" },
      { id: "boots", label: "ブーツ", targetCatalogId: "shoes" },
      { id: "pumps", label: "パンプス", targetCatalogId: "shoes" },
    ],
  },
  {
    id: "sports",
    name: "スポーツ",
    children: [
      { id: "sportswear", label: "スポーツウェア", targetCatalogId: "sports" },
      { id: "training", label: "トレーニング", targetCatalogId: "sports" },
      { id: "outdoor", label: "アウトドア", targetCatalogId: "sports" },
    ],
  },
  {
    id: "characters",
    name: "キャラクター",
    children: [
      { id: "figures", label: "フィギュア", targetCatalogId: "characters" },
      { id: "plush", label: "ぬいぐるみ", targetCatalogId: "characters" },
      { id: "stationery", label: "文具・雑貨", targetCatalogId: "characters" },
    ],
  },
  {
    id: "kpop",
    name: "K-POP",
    children: [
      { id: "albums", label: "アルバム", targetCatalogId: "kpop" },
      { id: "goods", label: "公式グッズ", targetCatalogId: "kpop" },
      { id: "photocards", label: "フォトカード", targetCatalogId: "kpop" },
    ],
  },
  {
    id: "electronics",
    name: "PC・ゲーム",
    children: [
      { id: "games", label: "ゲーム", targetCatalogId: "electronics" },
      { id: "pc", label: "PC・周辺機器", targetCatalogId: "electronics" },
      { id: "audio", label: "オーディオ", targetCatalogId: "electronics" },
    ],
  },
] satisfies readonly CategoryDirectoryEntry[];

export const homeCategoryItems: readonly HomeCategoryItem[] = [
  {
    id: "beauty",
    labelKey: "beauty",
    image: "/sazo-commerce/categories/trend.png",
    view: "categories",
  },
  {
    id: "ladies",
    labelKey: "ladies",
    image: "/sazo-commerce/products/08.webp",
    view: "categories",
  },
  {
    id: "mens",
    labelKey: "mens",
    image: "/sazo-commerce/mobile-picks/07.png",
    view: "categories",
  },
  {
    id: "kids",
    labelKey: "kids",
    image: "/sazo-commerce/products/11.webp",
    view: "categories",
  },
  {
    id: "living",
    labelKey: "living",
    image: "/sazo-commerce/products/02.webp",
    view: "categories",
  },
  {
    id: "food",
    labelKey: "food",
    image: "/sazo-commerce/jplanet-sakura-mark.png",
    view: "categories",
  },
  {
    id: "pets",
    labelKey: "pets",
    image: "/sazo-commerce/jplanet-sakura-mark.png",
    view: "categories",
  },
  {
    id: "appliances",
    labelKey: "appliances",
    image: "/sazo-commerce/products/13.webp",
    view: "categories",
  },
  {
    id: "hobby",
    labelKey: "hobby",
    image: "/sazo-commerce/products/11.webp",
    view: "categories",
  },
] satisfies readonly HomeCategoryItem[];

export const catalogTabs = [
  {
    id: "skincare",
    label: "スキンケア",
    chips: [
      { id: "toner", label: "化粧水" },
      { id: "skin-toner", label: "トナー" },
      { id: "lotion", label: "ローション" },
      { id: "emulsion", label: "乳液" },
      { id: "essence", label: "エッセンス" },
      { id: "sheet-mask", label: "マスクパック" },
    ],
  },
  {
    id: "base-makeup",
    label: "ベースメイク",
    chips: [
      { id: "makeup-base", label: "メイクアップベース" },
      { id: "primer", label: "プライマー" },
      { id: "bb-cream", label: "BBクリーム" },
      { id: "cc-cream", label: "CCクリーム" },
    ],
  },
  {
    id: "point-makeup",
    label: "ポイントメイク",
    chips: [
      { id: "eye-makeup", label: "アイメイク" },
      { id: "lip", label: "リップ" },
      { id: "cheek", label: "チーク" },
    ],
  },
  {
    id: "sets",
    label: "セット商品",
    chips: [
      { id: "cosmetics-set", label: "化粧品セット" },
      { id: "skincare-set", label: "基礎化粧品セット" },
      { id: "gift-set", label: "化粧品ギフトセット" },
    ],
  },
  {
    id: "tools",
    label: "メイク小物",
    chips: [
      { id: "brush", label: "ブラシ" },
      { id: "puff", label: "パフ" },
      { id: "mirror", label: "ミラー" },
    ],
  },
  { id: "uv-care", label: "UVケア", chips: [] },
  { id: "body-care", label: "ボディ・ハンド・フットケア", chips: [] },
  { id: "hair-removal", label: "脱毛・除毛", chips: [] },
  { id: "nails", label: "ネイル", chips: [] },
  { id: "hair", label: "ヘア", chips: [{ id: "hair-accessory", label: "ヘア小物" }] },
  { id: "fragrance", label: "香水", chips: [] },
  { id: "mens-cosmetics", label: "メンズコスメ", chips: [] },
  {
    id: "tops",
    label: "トップス",
    chips: [
      { id: "short-sleeve", label: "半袖" },
      { id: "long-sleeve", label: "長袖" },
    ],
  },
  { id: "outerwear", label: "アウター", chips: [] },
  { id: "bottoms", label: "ボトムス", chips: [] },
  { id: "dresses", label: "ワンピース", chips: [] },
  { id: "bags", label: "バッグ", chips: [{ id: "tote", label: "トートバッグ" }] },
  { id: "shoes", label: "シューズ", chips: [{ id: "sandals", label: "サンダル" }] },
  { id: "kids-fashion", label: "キッズファッション", chips: [] },
  { id: "baby", label: "ベビー", chips: [] },
  { id: "toys", label: "おもちゃ", chips: [] },
  { id: "appliances", label: "家電", chips: [] },
  { id: "kitchen", label: "キッチン", chips: [] },
  { id: "interior", label: "インテリア", chips: [] },
  { id: "daily", label: "日用品", chips: [] },
  { id: "snacks", label: "お菓子", chips: [] },
  { id: "drinks", label: "飲料", chips: [] },
  { id: "instant-food", label: "インスタント食品", chips: [] },
  { id: "pet-food", label: "ペットフード", chips: [] },
  { id: "pet-supplies", label: "ペット用品", chips: [] },
  { id: "electronics", label: "家電・PC・ゲーム", chips: [] },
  { id: "kpop", label: "K-POP", chips: [] },
  { id: "characters", label: "キャラクター", chips: [] },
  { id: "sports", label: "スポーツ", chips: [] },
] satisfies readonly CatalogTab[];

function requireProduct(productId: string) {
  const product = products.find(({ id }) => id === productId);

  if (product === undefined) {
    throw new Error(`Missing SAZO catalog product fixture: ${productId}`);
  }

  return product;
}

export const catalogInventory = [
  { product: requireProduct("p01"), tabIds: ["skincare"], chipIds: ["toner"] },
  {
    product: requireProduct("p02"),
    tabIds: ["skincare"],
    chipIds: ["skin-toner", "lotion"],
  },
  {
    product: requireProduct("p03"),
    tabIds: ["skincare", "base-makeup"],
    chipIds: ["serum", "bb-cream"],
  },
  {
    product: requireProduct("p04"),
    tabIds: ["skincare", "point-makeup"],
    chipIds: ["essence", "eye-makeup"],
  },
  {
    product: requireProduct("p05"),
    tabIds: ["skincare", "sets"],
    chipIds: ["lotion", "cosmetics-set"],
  },
  {
    product: requireProduct("p06"),
    tabIds: ["skincare", "tools"],
    chipIds: ["skin-toner", "brush"],
  },
  {
    product: requireProduct("p07"),
    tabIds: ["skincare", "tops"],
    chipIds: ["serum", "short-sleeve"],
  },
  {
    product: requireProduct("p08"),
    tabIds: ["skincare", "bags"],
    chipIds: ["essence", "tote"],
  },
  {
    product: requireProduct("p09"),
    tabIds: ["skincare", "shoes"],
    chipIds: ["lotion", "sandals"],
  },
  {
    product: requireProduct("p10"),
    tabIds: ["skincare", "hair"],
    chipIds: ["serum", "hair-accessory"],
  },
  {
    product: requireProduct("p11"),
    tabIds: ["skincare"],
    chipIds: ["sheet-mask"],
  },
  {
    product: requireProduct("p12"),
    tabIds: ["skincare", "characters"],
    chipIds: ["skin-toner"],
  },
] satisfies readonly CatalogInventoryEntry[];

export const reviewCategories = [
  { id: "all", label: "全体" },
  { id: "idol", label: "アイドル" },
  { id: "beauty", label: "美容" },
  { id: "clothing", label: "衣類" },
  { id: "food", label: "食品・お菓子" },
  { id: "books", label: "本・文具" },
  { id: "automotive", label: "自動車" },
  { id: "kids-pets", label: "キッズ・ペット" },
] satisfies readonly ReviewCategory[];

/**
 * Review discovery uses decision axes rather than product taxonomy. The older
 * category fixture above remains available to legacy captured-content views.
 */
export const purchaseReviewFilters: readonly PurchaseReviewFilter[] = [
  { id: "all", labelKey: "sazo.views.reviews.filters.all" },
  { id: "condition", labelKey: "sazo.views.reviews.filters.condition" },
  { id: "brl-total", labelKey: "sazo.views.reviews.filters.brlTotal" },
  { id: "shipping-customs", labelKey: "sazo.views.reviews.filters.shippingCustoms" },
  { id: "support", labelKey: "sazo.views.reviews.filters.support" },
] satisfies readonly PurchaseReviewFilter[];

export const purchaseExperienceReviews: readonly PurchaseExperienceReview[] = [
  {
    id: "purchase-review-mika",
    author: "Mika",
    city: "São Paulo",
    bodyKey: "sazo.views.reviews.entries.mika",
    chipKeys: ["sazo.views.reviews.chips.url", "sazo.views.reviews.chips.condition"],
    decisionAxes: ["condition", "brl-total"],
    image: "/sazo-commerce/review-media/mika-sneakers-arrival-v1.png",
    imageAltKey: "sazo.views.reviews.imageAlt",
  },
  {
    id: "purchase-review-kou",
    author: "Kou",
    city: "Curitiba",
    bodyKey: "sazo.views.reviews.entries.kou",
    chipKeys: ["sazo.views.reviews.chips.image", "sazo.views.reviews.chips.shipping"],
    decisionAxes: ["condition", "shipping-customs"],
    image: "/sazo-commerce/reference/nintendo-pro-review-1-v1.png",
    imageAltKey: "sazo.views.reviews.imageAlt",
  },
  {
    id: "purchase-review-yuri",
    author: "Yuri",
    city: "Belo Horizonte",
    bodyKey: "sazo.views.reviews.entries.yuri",
    chipKeys: ["sazo.views.reviews.chips.shipping"],
    decisionAxes: ["condition", "shipping-customs"],
    image: "/sazo-commerce/review-media/r06.jpg",
    imageAltKey: "sazo.views.reviews.imageAlt",
  },
  {
    id: "purchase-review-ken",
    author: "Ken",
    city: "Rio de Janeiro",
    bodyKey: "sazo.views.reviews.entries.ken",
    chipKeys: ["sazo.views.reviews.chips.image"],
    decisionAxes: ["condition", "support"],
    image: "/sazo-commerce/reference/figure.png",
    imageAltKey: "sazo.views.reviews.imageAlt",
  },
  {
    id: "purchase-review-marcela",
    author: "Marcela",
    city: "Recife",
    bodyKey: "sazo.views.reviews.entries.marcela",
    chipKeys: ["sazo.views.reviews.chips.brl"],
    decisionAxes: ["brl-total", "shipping-customs"],
    image: "/sazo-commerce/review-media/r04.jpg",
    imageAltKey: "sazo.views.reviews.imageAlt",
  },
  {
    id: "purchase-review-joao",
    author: "João",
    city: "Porto Alegre",
    bodyKey: "sazo.views.reviews.entries.joao",
    chipKeys: ["sazo.views.reviews.chips.support"],
    decisionAxes: ["support", "brl-total"],
    image: "/sazo-commerce/review-media/r05.jpg",
    imageAltKey: "sazo.views.reviews.imageAlt",
  },
] satisfies readonly PurchaseExperienceReview[];

/**
 * The lead carousel keeps the two strongest full-photo examples first, while
 * the community feed starts with the compact Yuri/Ken pair shown in the mobile
 * review reference. Keeping the order in fixtures avoids presentation order
 * being scattered through the view component.
 */
const purchaseExperienceReviewFeedBase: readonly PurchaseExperienceReview[] = [
  purchaseExperienceReviews[2]!,
  purchaseExperienceReviews[3]!,
  purchaseExperienceReviews[0]!,
  purchaseExperienceReviews[1]!,
  purchaseExperienceReviews[4]!,
  purchaseExperienceReviews[5]!,
];

/**
 * The mock feed deliberately repeats the approved six review examples three
 * times. This gives the mobile review wall enough vertical density for visual
 * testing without implying that these are eighteen distinct customer reviews.
 */
export const purchaseExperienceReviewFeed: readonly PurchaseExperienceReview[] = [
  ...purchaseExperienceReviewFeedBase,
  ...purchaseExperienceReviewFeedBase.map((review) => ({
    ...review,
    id: `${review.id}-test-repeat-2`,
  })),
  ...purchaseExperienceReviewFeedBase.map((review) => ({
    ...review,
    id: `${review.id}-test-repeat-3`,
  })),
];

export const serviceSteps = [
  { id: "01", image: "/sazo-commerce/service-lp/jplanet-how-to-use-1.svg" },
  { id: "02", image: "/sazo-commerce/service-lp/jplanet-how-to-use-2.svg" },
  { id: "03", image: "/sazo-commerce/service-lp/jplanet-how-to-use-3.svg" },
] satisfies readonly ServiceStep[];

export const editorialReviews = [
  {
    id: "editorial-review-01",
    author: "MKT",
    body: "めちゃめちゃ良かったです",
    categoryIds: ["beauty"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/jplanet-sakura-mark.png",
  },
  {
    id: "editorial-review-02",
    author: "加藤奈実",
    body: "無事に届きました。ありがとうございました。",
    categoryIds: ["idol"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/editorial-reviews/02.webp",
  },
  {
    id: "editorial-review-03",
    author: "あ",
    body: "迅速なご対応ありがとうございました！",
    categoryIds: ["beauty"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/editorial-reviews/03.webp",
  },
  {
    id: "editorial-review-04",
    author: "かと",
    body: "とても良い状態で大満足です。有難うございました。",
    categoryIds: ["clothing", "kids-pets"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/editorial-reviews/04.webp",
  },
  {
    id: "editorial-review-05",
    author: "ちか",
    body: "ITZYのアルバム付いてきてました笑笑 綺麗な状態で届きましたー！！",
    categoryIds: ["idol"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/review-media/r07.jpg",
  },
  {
    id: "editorial-review-06",
    author: "ピョピョちゃん",
    body: "ブラジルでは買えないグッズが手に入れられてとても嬉しいです！めちゃめちゃ可愛い～！",
    categoryIds: ["idol", "books"],
    likes: 0,
    comments: 0,
    image: null,
  },
  {
    id: "editorial-review-07",
    author: "YU",
    body: "ありがとうございました( ; ; )",
    categoryIds: ["idol", "automotive"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/review-media/r08.jpg",
  },
  {
    id: "editorial-review-08",
    author: "璃季",
    body: "商品の状態が良かった",
    categoryIds: ["idol", "food"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/reviews/unseen-media.png",
  },
  {
    id: "editorial-review-09",
    author: "ちか",
    body: "丁寧な梱包で届きました。ありがとうございました。",
    categoryIds: ["idol"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/reviews/tail-01.png",
  },
  {
    id: "editorial-review-10",
    author: "Ayu",
    body: "写真どおりの商品で満足しています。",
    categoryIds: ["idol"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/reviews/tail-03-media.png",
  },
  {
    id: "editorial-review-11",
    author: "YU",
    body: "欲しかった商品を購入できて嬉しいです。",
    categoryIds: ["idol"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/reviews/tail-04.png",
  },
  {
    id: "editorial-review-12",
    author: "ももせ",
    body: "とても綺麗な状態で届きました。",
    categoryIds: ["idol"],
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/reviews/tail-02-media.png",
  },
] satisfies readonly EditorialReview[];

export const reviews = [
  {
    id: "r01",
    author: "mm",
    productName: "SicSunday キーリング",
    comment:
      "SNSで見かけてからどうしても欲しくて探していたところ、このサイトを見つけました。",
    rating: 5,
    likes: 4,
    comments: 0,
    image: "/sazo-commerce/review-media/r01.jpg",
  },
  {
    id: "r02",
    author: "なー",
    productName: "アーティストグッズ",
    comment:
      "代行なので遅いかと思ったけど、結構早くてびっくりしました！ありがとうございました。",
    rating: 5,
    likes: 4,
    comments: 0,
    image: "/sazo-commerce/review-media/r02.jpg",
  },
  {
    id: "r03",
    author: "T",
    productName: "レアフォトカード",
    comment:
      "初めて利用しましたが、ブラジルで出回りがなくレアなカードがゲットできて嬉しいです。",
    rating: 4,
    likes: 13,
    comments: 0,
    image: "/sazo-commerce/review-media/r03.jpg",
  },
  {
    id: "r04",
    author: "村上ラッペ",
    productName: "日本のお菓子",
    comment: "美味しそうです！ありがとうございました。",
    rating: 5,
    likes: 15,
    comments: 0,
    image: "/sazo-commerce/review-media/r04.jpg",
  },
  {
    id: "r05",
    author: "코코",
    productName: "日本ファッション",
    comment: "サイズ感もオーバーで、自分が欲しかったサイズ感で満足です！",
    rating: 5,
    likes: 7,
    comments: 0,
    image: "/sazo-commerce/review-media/r05.jpg",
  },
  {
    id: "r06",
    author: "17♡",
    productName: "キャラクターグッズ",
    comment: "好きなアイドルのグッズを購入しました！とても満足しています。",
    rating: 5,
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/review-media/r06.jpg",
  },
  {
    id: "r07",
    author: "ちか",
    productName: "ITZY アルバム",
    comment: "ITZYのアルバム付いてきてました笑笑 綺麗な状態で届きましたー！！",
    rating: 5,
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/review-media/r07.jpg",
  },
  {
    id: "r08",
    author: "YU",
    productName: "S.COUPS × MINGYU アルバム",
    comment: "ありがとうございました( ; ; )",
    rating: 5,
    likes: 0,
    comments: 0,
    image: "/sazo-commerce/review-media/r08.jpg",
  },
] satisfies readonly Review[];

type ReviewId = (typeof reviews)[number]["id"];

export const homeReviewIds = [
  "r06",
  "r02",
  "r03",
  "r01",
  "r04",
  "r05",
] as const satisfies readonly ReviewId[];

function mapReviewIds(ids: readonly ReviewId[], label: string): readonly Review[] {
  return ids.map((id) => {
    const review = reviews.find((candidate) => candidate.id === id);

    if (!review) {
      throw new Error(`Missing SAZO ${label} review fixture: ${id}`);
    }

    return review;
  });
}

export const recordedDesktopRankingReviewIds = [
  "r05",
  "r04",
  "r03",
  "r01",
  "r02",
  "r06",
] as const satisfies readonly ReviewId[];

export const recordedMobileProfileReviewIds = [
  "r06",
  "r02",
  "r03",
  "r01",
  "r04",
  "r05",
] as const satisfies readonly ReviewId[];

export const homeReviews = mapReviewIds(homeReviewIds, "home");
export const recordedDesktopRankingReviews = mapReviewIds(
  recordedDesktopRankingReviewIds,
  "desktop ranking",
);
export const recordedMobileProfileReviews = mapReviewIds(
  recordedMobileProfileReviewIds,
  "mobile profile",
);

export const gramEntries = [
  {
    id: "g01",
    author: "sazo_staff",
    caption: "SPAO×たまごっち 待望のコラボ登場！",
    image: "/sazo-commerce/community/01.webp",
  },
  {
    id: "g02",
    author: "sazo_editor",
    caption: "日本ブランドの有線イヤホンが可愛すぎる",
    image: "/sazo-commerce/community/02.webp",
  },
  {
    id: "g03",
    author: "sazo_staff",
    caption: "日本限定スタバ新作 2026夏グッズ発売！",
    image: "/sazo-commerce/community/03.webp",
  },
  {
    id: "g04",
    author: "sazo_staff",
    caption: "平成女児風 おすすめ推し活バッグ",
    image: "/sazo-commerce/community/12.webp",
  },
  {
    id: "g05",
    author: "sazo_editor",
    caption: "ILLITメンバーのリアル購入品！",
    image: "/sazo-commerce/community/13.webp",
  },
  {
    id: "g06",
    author: "sazo_staff",
    caption: "日本ダイソー新作 キティ＆マイメログッズ",
    image: "/sazo-commerce/community/14.webp",
  },
] satisfies readonly GramEntry[];

type GramEntryId = (typeof gramEntries)[number]["id"];

export const homeGramEntryIds = [
  "g01",
  "g02",
  "g03",
] as const satisfies readonly GramEntryId[];

const homeGramProducts = {
  g01: {
    image: "/sazo-commerce/community/01.webp",
    name: "[たまごっち]長袖パジャマ(Blue)_SPPPG49U09",
    price: "￥4,594",
  },
  g02: {
    image: "/sazo-commerce/gram/home/02-thumb.png",
    name: "スノーイヤホン / Cタイプ",
    price: "￥2,185",
  },
  g03: {
    discount: "20%",
    image: "/sazo-commerce/community/03.webp",
    name: "ユアサマーグラスプレートセット（2p）",
    price: "￥3,495",
  },
} as const satisfies Record<(typeof homeGramEntryIds)[number], HomeGramEntry["product"]>;

export const homeGramEntries: readonly HomeGramEntry[] = homeGramEntryIds.map((id) => {
  const entry = gramEntries.find((candidate) => candidate.id === id);

  if (!entry) {
    throw new Error(`Missing SAZO home GRAM fixture: ${id}`);
  }

  return {
    ...entry,
    image: id === "g02" ? "/sazo-commerce/gram/home/02.png" : entry.image,
    product: homeGramProducts[id],
  };
});

/**
 * The desktop discovery rail intentionally has a deeper set than the mobile
 * home preview. Keeping this fixture separate preserves the mobile DOM and
 * its two-post entry point while giving wide screens the full editorial rail.
 */
export const desktopHomeGramEntryIds = [
  "g01",
  "g03",
  "g02",
  "g04",
  "g05",
] as const satisfies readonly GramEntryId[];

const desktopHomeGramProducts = {
  g01: homeGramProducts.g01,
  g02: homeGramProducts.g02,
  g03: homeGramProducts.g03,
  g04: {
    image: "/sazo-commerce/reference/figure.png",
    name: "日本限定 キャラクターフィギュア",
    price: "R$ 318",
  },
  g05: {
    image: "/sazo-commerce/reference/new-balance-9060.png",
    name: "New Balance 9060",
    price: "R$ 748",
  },
} as const satisfies Record<
  (typeof desktopHomeGramEntryIds)[number],
  HomeGramEntry["product"]
>;

export const desktopHomeGramEntries: readonly HomeGramEntry[] =
  desktopHomeGramEntryIds.map((id) => {
    const entry = gramEntries.find((candidate) => candidate.id === id);

    if (!entry) {
      throw new Error(`Missing J-Planet desktop GRAM entry: ${id}`);
    }

    return {
      ...entry,
      image: id === "g02" ? "/sazo-commerce/gram/home/02.png" : entry.image,
      product: desktopHomeGramProducts[id],
    };
  });

export const reviewRecommendations = [
  {
    id: "recommendation-01",
    author: "RIEKO",
    comment:
      "無事、手元に届きました。ありがとうございました！大切に使わせていただきます♪",
    rating: 5,
    product: {
      id: "recommendation-heart",
      brand: "NAVER",
      name: "ハート宝くじアレンジ＆オブジェ",
      price: "¥1,843",
      image: "/sazo-commerce/recommendations/01.webp",
    },
  },
  {
    id: "recommendation-02",
    author: "RIEKO",
    comment:
      "無事、手元に届きました。ありがとうございました！大切に使わせていただきます♪",
    rating: 5,
    product: {
      id: "recommendation-magic-stick",
      brand: "NAVER",
      name: "魔術棒スクレーパー、ロータリー式",
      price: "¥922",
      image: "/sazo-commerce/recommendations/02.webp",
    },
  },
] satisfies readonly ReviewRecommendation[];

const productRegistry = new Map<string, Product>();

for (const product of [
  ...products,
  ...referenceProducts,
  ...desktopControllerRelatedProducts,
  ...interestedProducts,
  ...searchDiscoveryProducts,
  ...catalogInventory.map(({ product }) => product),
  ...reviewRecommendations.map(({ product }) => product),
]) {
  if (!productRegistry.has(product.id)) {
    productRegistry.set(product.id, product);
  }
}

const defaultProduct: Product =
  products[0] ??
  (() => {
    throw new Error("Missing default SAZO product fixture");
  })();

const productDetailOverrides = new Map<string, Omit<ProductDetail, "product">>([
  [
    "p01",
    {
      gallery: [
        "/sazo-commerce/products/01.webp",
        "/sazo-commerce/products/02.webp",
        "/sazo-commerce/products/03.webp",
      ],
      originalName: "NCT WISH - STEADY Mini Keyring",
      categoryLabel: "K-POP・アイドル",
      originalUrl: "https://example.com/jplanet/source/p01",
      commerce: {
        rating: 4.8,
        reviewCount: 128,
        sellerLogoLabel: "J-Planet",
        sellerName: "J-Planet セレクション",
        soldLabel: "1mil+",
      },
      unitPriceAmount: 3799,
      localDistributionFeeAmount: 350,
      purchaseTypeId: "direct",
      deliveryEstimateDays: 9,
      optionLabel: "商品オプション",
      options: ["標準", "ギフト包装"],
      purchaseNote: "日本で検品後、ブラジルへ国際配送します。",
      information:
        "日本の販売元から手配し、検品後にブラジルへお届けします。配送日数と関税は、お届け先と商品の条件により異なります。",
      recommendationIds: ["p02", "p03", "p04", "p05", "p06", "p07"],
    },
  ],
  [
    "jplanet-nintendo-switch-oled",
    {
      gallery: ["/sazo-commerce/reference/nintendo-switch-oled.png"],
      originalName: "Nintendo Switch OLED / ホワイトセット",
      categoryLabel: "ゲーム・家電",
      originalUrl: "https://example.com/jplanet/source/nintendo-switch-oled",
      commerce: {
        rating: 4.8,
        reviewCount: 864,
        sellerLogoLabel: "Nintendo",
        sellerName: "Nintendo 公式",
        soldLabel: "30mil+",
      },
      unitPriceAmount: 37980,
      localDistributionFeeAmount: 420,
      purchaseTypeId: "direct",
      deliveryEstimateDays: 10,
      optionLabel: "カラー",
      options: ["ホワイト", "ネオンブルー・ネオンレッド"],
      purchaseNote: "日本の公式ストアで手配し、検品後にブラジルへお届けします。",
      information:
        "J-Planetが販売元・規制・ブラジル到着総額を確認してから手配します。配送日数と関税はお届け先と商品の条件により異なります。",
      recommendationIds: ["jplanet-new-balance-9060", "jplanet-sony-a7c-ii", "p02"],
    },
  ],
  [
    "jplanet-nintendo-pro-controller",
    {
      gallery: [
        "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
        "/sazo-commerce/reference/nintendo-pro-controller-white-v1.png",
        "/sazo-commerce/reference/nintendo-pro-controller-splatoon-v1.png",
      ],
      originalName: "Nintendo Switch Proコントローラー",
      categoryLabel: "ゲーム・家電",
      originalUrl: "https://example.com/jplanet/source/nintendo-pro-controller",
      commerce: {
        rating: 4.8,
        reviewCount: 864,
        sellerLogoLabel: "Nintendo",
        sellerName: "Nintendo 公式",
        soldLabel: "30mil+",
      },
      unitPriceAmount: 429,
      localDistributionFeeAmount: 0,
      purchaseTypeId: "direct",
      deliveryEstimateDays: 10,
      optionLabel: "カラー",
      options: ["ブラック", "ホワイト", "スプラトゥーン"],
      purchaseNote: "送料・税金の内訳は購入前に確認が必要です。",
      information:
        "販売元・輸入条件・配送予定を確認してから手配します。表示金額と到着予定は、選択したカラーと配送先により変わる場合があります。",
      recommendationIds: [
        "jplanet-nintendo-switch-oled",
        "jplanet-new-balance-9060",
        "p02",
      ],
    },
  ],
]);

function createGeneratedProductDetail(product: Product): ProductDetail {
  return {
    product,
    gallery: [product.image],
    originalName: product.name,
    categoryLabel: "J-Planet セレクション",
    originalUrl: `https://example.com/jplanet/source/${encodeURIComponent(product.id)}`,
    commerce: {
      rating: 4.8,
      reviewCount: 0,
      sellerLogoLabel: product.brand,
      sellerName: product.brand,
      soldLabel: "",
    },
    unitPriceAmount: parseYenPrice(product.price),
    localDistributionFeeAmount: 350,
    purchaseTypeId: "direct",
    deliveryEstimateDays: 9,
    optionLabel: "商品オプション",
    options: ["標準"],
    purchaseNote: "日本で検品後、ブラジルへ国際配送します。",
    information:
      "日本の販売元から手配し、検品後にブラジルへお届けします。配送日数と関税は、お届け先と商品の条件により異なります。",
    recommendationIds: [...productRegistry.keys()]
      .filter((candidateId) => candidateId !== product.id)
      .slice(0, 6),
  };
}

export function getProductDetail(productId: string | null): ProductDetail {
  const product = productRegistry.get(productId ?? "") ?? defaultProduct;
  const override = productDetailOverrides.get(product.id);

  return override ? { product, ...override } : createGeneratedProductDetail(product);
}
