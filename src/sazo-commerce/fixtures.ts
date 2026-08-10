import type {
  BrandFilterId,
  CatalogTabId,
  DirectoryCategoryId,
  RankingMetric,
  ReviewCategoryId,
  SazoHeroFeed,
} from "@/sazo-commerce/model";

export type SazoImagePath = `/sazo-commerce/${string}`;

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: SazoImagePath;
  mobileHeight: number;
  mobileImage: SazoImagePath;
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

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: SazoImagePath;
  badge?: string;
  sourceIcon?: SazoImagePath;
}

export interface ProductDetail {
  product: Product;
  gallery: readonly SazoImagePath[];
  originalName: string;
  categoryLabel: string;
  originalUrl: string;
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
}

export interface CategoryDirectoryChild {
  id: string;
  label: string;
  targetCatalogId: CatalogTabId;
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

export type RankingProduct = Product;

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
    id: "delivery-line",
    title: "配送状況をLINEでお届け！",
    subtitle: "配送料50%OFF クーポンプレゼント！",
    image: "/sazo-commerce/hero/slide-1.webp",
    mobileHeight: 490,
    mobileImage: "/sazo-commerce/hero/slide-1.webp",
    mobileWidth: 1200,
  },
  {
    id: "new-benefits",
    title: "新規特典がリニューアル クーポンパック登場！",
    subtitle: "新規会員登録・アプリDL・LINE追加でお得にJ-Planetを利用できます！",
    image: "/sazo-commerce/hero/slide-2.webp",
    mobileHeight: 490,
    mobileImage: "/sazo-commerce/hero/mobile/slide-2.webp",
    mobileWidth: 794,
  },
  {
    id: "large-furniture",
    title: "大型家具、解禁。",
    subtitle: "30kg以上のソファーや棚も、お得な価格で手に入ります！",
    image: "/sazo-commerce/hero/slide-3.webp",
    mobileHeight: 490,
    mobileImage: "/sazo-commerce/hero/slide-3.webp",
    mobileWidth: 1200,
  },
  {
    id: "cold-delivery",
    title: "冷蔵食品・香水など配送可能に",
    subtitle: "配送の幅が広がり、狙っていた商品を手に入れられるチャンス！",
    image: "/sazo-commerce/hero/slide-4.webp",
    mobileHeight: 490,
    mobileImage: "/sazo-commerce/hero/mobile/slide-4.webp",
    mobileWidth: 794,
  },
  {
    id: "friend-invite",
    title: "友達招待でお得！",
    subtitle: "友達招待で友達もあなたも送料無料クーポンをゲット！",
    image: "/sazo-commerce/hero/slide-5.webp",
    mobileHeight: 490,
    mobileImage: "/sazo-commerce/hero/mobile/slide-5.webp",
    mobileWidth: 794,
  },
] satisfies readonly HeroSlide[];

const heroSlideIdsByFeed = {
  natural: [
    "delivery-line",
    "new-benefits",
    "large-furniture",
    "cold-delivery",
    "friend-invite",
  ],
  "cold-first": [
    "cold-delivery",
    "friend-invite",
    "new-benefits",
    "large-furniture",
    "delivery-line",
  ],
  "delivery-last": [
    "new-benefits",
    "large-furniture",
    "cold-delivery",
    "friend-invite",
    "delivery-line",
  ],
  "large-first": [
    "large-furniture",
    "cold-delivery",
    "friend-invite",
    "delivery-line",
    "new-benefits",
  ],
} as const satisfies Record<SazoHeroFeed, readonly string[]>;

export function getHeroSlidesForFeed(feed: SazoHeroFeed): readonly HeroSlide[] {
  return heroSlideIdsByFeed[feed].map((id) => {
    const slide = heroSlides.find((candidate) => candidate.id === id);

    if (slide === undefined) {
      throw new Error(`Missing SAZO hero slide: ${id}`);
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

export const serviceSteps = [
  { id: "01", image: "/sazo-commerce/service-lp/jplanet-how-to-use-1.svg" },
  { id: "02", image: "/sazo-commerce/service-lp/jplanet-how-to-use-2.svg" },
  { id: "03", image: "/sazo-commerce/service-lp/jplanet-how-to-use-3.svg" },
] satisfies readonly ServiceStep[];

const rankingHairpin = {
  id: "ranking-hairpin",
  brand: "NAVER",
  name: "プチプチ犬ヘッドピン 大リボンボンドピン",
  price: "¥806",
  badge: "13%",
  image: "/sazo-commerce/ranking/01.webp",
} satisfies RankingProduct;
const rankingMask = {
  id: "ranking-mask",
  brand: "11D",
  name: "高濃縮アンプルマスクパック 6種30枚",
  price: "¥1,578",
  image: "/sazo-commerce/ranking/02.webp",
} satisfies RankingProduct;
const rankingYarn = {
  id: "ranking-yarn",
  brand: "NAVER",
  name: "優しい人形室 手編みマカロン綿糸",
  price: "¥104",
  image: "/sazo-commerce/ranking/03.webp",
} satisfies RankingProduct;
const rankingPokemon = {
  id: "ranking-pokemon",
  brand: "NAVER",
  name: "ポケモンキーリング人形 ピカチュウミュウ",
  price: "¥714",
  badge: "32%",
  image: "/sazo-commerce/ranking/04.webp",
} satisfies RankingProduct;
const rankingSaltKeyring = {
  id: "ranking-salt-keyring",
  brand: "KREAM",
  name: "TENTSEOUL Five Elements Salt Keyring",
  price: "¥2,522",
  badge: "21%",
  image: "/sazo-commerce/ranking/05.webp",
} satisfies RankingProduct;
const rankingReina = {
  id: "ranking-reina",
  brand: "NAVER",
  name: "レイナ",
  price: "¥403",
  image: "/sazo-commerce/ranking/06.webp",
} satisfies RankingProduct;
const rankingMagikarp = {
  id: "ranking-magikarp",
  brand: "POKÉMON",
  name: "Pokémon TCG Mega Festa 2026 Promo Card Magikarp",
  price: "¥8,894",
  image: "/sazo-commerce/ranking/07.webp",
} satisfies RankingProduct;
const rankingPreorder = {
  id: "ranking-preorder",
  brand: "JORDAN",
  name: "予約購入 ジョーダン コラボラインエディション",
  price: "¥13,701",
  image: "/sazo-commerce/ranking/08.webp",
} satisfies RankingProduct;

export const rankingInventories = {
  purchases: [
    rankingHairpin,
    rankingMask,
    rankingYarn,
    rankingPokemon,
    rankingSaltKeyring,
    rankingReina,
    rankingMagikarp,
    rankingPreorder,
  ],
  views: [
    rankingPokemon,
    rankingHairpin,
    rankingMagikarp,
    rankingMask,
    rankingYarn,
    rankingSaltKeyring,
    rankingPreorder,
    rankingReina,
  ],
} satisfies Record<RankingMetric, readonly RankingProduct[]>;

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
]);

function createGeneratedProductDetail(product: Product): ProductDetail {
  return {
    product,
    gallery: [product.image],
    originalName: product.name,
    categoryLabel: "J-Planet セレクション",
    originalUrl: `https://example.com/jplanet/source/${encodeURIComponent(product.id)}`,
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
