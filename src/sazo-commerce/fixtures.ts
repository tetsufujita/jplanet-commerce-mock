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

export interface Shortcut {
  id: string;
  label: string;
  image: SazoImagePath;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: SazoImagePath;
  badge?: string;
}

export interface RankingKeyword {
  rank: number;
  label: string;
}

export interface Brand {
  id: string;
  name: string;
  image: SazoImagePath;
}

export interface Category {
  id: string;
  name: string;
  image: SazoImagePath;
}

export interface Review {
  id: string;
  author: string;
  productName: string;
  comment: string;
  rating: number;
  image: SazoImagePath;
}

export interface GramEntry {
  id: string;
  author: string;
  caption: string;
  image: SazoImagePath;
}

export interface ReviewRecommendation {
  id: string;
  author: string;
  comment: string;
  rating: number;
  product: Product;
}

export const heroSlides = [
  {
    id: "delivery-line",
    title: "配送状況をLINEでお届け！",
    subtitle: "配送料50%OFF クーポンプレゼント！",
    image: "/sazo-commerce/hero/slide-1.webp",
    mobileHeight: 278,
    mobileImage: "/sazo-commerce/hero/mobile/slide-1.webp",
    mobileWidth: 450,
  },
  {
    id: "new-benefits",
    title: "新規特典がリニューアル クーポンパック登場！",
    subtitle: "新規会員登録・アプリDL・LINE追加でお得にSAZOを利用できます！",
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
    mobileImage: "/sazo-commerce/hero/mobile/slide-3.webp",
    mobileWidth: 794,
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

export const shortcuts = [
  { id: "feature", label: "SAZO特集", image: "/sazo-commerce/products/01.webp" },
  { id: "limited", label: "限定", image: "/sazo-commerce/products/02.webp" },
  { id: "flea-market", label: "フリマ", image: "/sazo-commerce/products/03.webp" },
  { id: "cosmetics", label: "コスメ", image: "/sazo-commerce/products/04.webp" },
  {
    id: "k-pop",
    label: "K-POP",
    image: "/sazo-commerce/products/05.webp",
  },
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
  { id: "anua", name: "Anua", image: "/sazo-commerce/brands/01.webp" },
  { id: "amuse", name: "AMUSE", image: "/sazo-commerce/brands/02.webp" },
  { id: "clio", name: "CLIO", image: "/sazo-commerce/brands/03.webp" },
  { id: "dasique", name: "dasique", image: "/sazo-commerce/brands/04.webp" },
  { id: "hince", name: "hince", image: "/sazo-commerce/brands/05.webp" },
  { id: "innisfree", name: "innisfree", image: "/sazo-commerce/brands/06.webp" },
  { id: "romand", name: "rom&nd", image: "/sazo-commerce/brands/07.webp" },
  { id: "torriden", name: "Torriden", image: "/sazo-commerce/brands/08.webp" },
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

export const homeReviews = [
  {
    id: "r01",
    author: "mm",
    productName: "SicSunday キーリング",
    comment:
      "SNSで見かけてからどうしても欲しくて探していたところ、このサイトを見つけました。",
    rating: 5,
    image: "/sazo-commerce/community/04.webp",
  },
  {
    id: "r02",
    author: "T",
    productName: "レアフォトカード",
    comment:
      "初めて利用しましたが、日本で出回りがなくレアなカードがゲットできて嬉しいです。",
    rating: 4,
    image: "/sazo-commerce/community/05.webp",
  },
  {
    id: "r03",
    author: "17♡",
    productName: "キャラクターグッズ",
    comment: "好きなアイドルのグッズを購入しました！とても満足しています。",
    rating: 5,
    image: "/sazo-commerce/community/06.webp",
  },
] satisfies readonly Review[];

export const reviews = [
  ...homeReviews,
  {
    id: "r04",
    author: "mm",
    productName: "SicSunday キーリング",
    comment:
      "SNSで見かけてからどうしても欲しくて探していたところ、このサイトを見つけました。",
    rating: 5,
    image: "/sazo-commerce/community/04.webp",
  },
  {
    id: "r05",
    author: "T",
    productName: "レアフォトカード",
    comment:
      "初めて利用しましたが、日本で出回りがなくレアなカードがゲットできて嬉しいです。",
    rating: 4,
    image: "/sazo-commerce/community/05.webp",
  },
  {
    id: "r06",
    author: "17♡",
    productName: "キャラクターグッズ",
    comment: "好きなアイドルのグッズを購入しました！とても満足しています。",
    rating: 5,
    image: "/sazo-commerce/community/06.webp",
  },
  {
    id: "r07",
    author: "mm",
    productName: "SicSunday キーリング",
    comment:
      "SNSで見かけてからどうしても欲しくて探していたところ、このサイトを見つけました。",
    rating: 5,
    image: "/sazo-commerce/community/04.webp",
  },
  {
    id: "r08",
    author: "T",
    productName: "レアフォトカード",
    comment:
      "初めて利用しましたが、日本で出回りがなくレアなカードがゲットできて嬉しいです。",
    rating: 4,
    image: "/sazo-commerce/community/05.webp",
  },
] satisfies readonly Review[];

export const homeGramEntries = [
  {
    id: "g01",
    author: "sazo_staff",
    caption: "SPAO×たまごっち 待望のコラボ登場！",
    image: "/sazo-commerce/community/01.webp",
  },
  {
    id: "g02",
    author: "sazo_editor",
    caption: "韓国ブランドの有線イヤホンが可愛すぎる",
    image: "/sazo-commerce/community/02.webp",
  },
  {
    id: "g03",
    author: "sazo_staff",
    caption: "韓国スタバ新作 2026夏グッズ発売！",
    image: "/sazo-commerce/community/03.webp",
  },
] satisfies readonly GramEntry[];

export const gramEntries = [
  ...homeGramEntries,
  {
    id: "g04",
    author: "sazo_staff",
    caption: "SPAO×たまごっち 待望のコラボ登場！",
    image: "/sazo-commerce/community/01.webp",
  },
  {
    id: "g05",
    author: "sazo_editor",
    caption: "韓国ブランドの有線イヤホンが可愛すぎる",
    image: "/sazo-commerce/community/02.webp",
  },
  {
    id: "g06",
    author: "sazo_staff",
    caption: "韓国スタバ新作 2026夏グッズ発売！",
    image: "/sazo-commerce/community/03.webp",
  },
] satisfies readonly GramEntry[];

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
