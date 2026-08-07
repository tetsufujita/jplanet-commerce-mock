export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface Shortcut {
  id: string;
  label: string;
  image: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  image: string;
  badge?: string;
}

export interface RankingKeyword {
  rank: number;
  label: string;
}

export interface Brand {
  id: string;
  name: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Review {
  id: string;
  author: string;
  productName: string;
  comment: string;
  rating: number;
  image: string;
}

export interface GramEntry {
  id: string;
  author: string;
  caption: string;
  image: string;
}

export const heroSlides = [
  {
    id: "summer",
    title: "SUMMER BEAUTY",
    subtitle: "夏を楽しむビューティーアイテム",
    image: "/sazo-commerce/hero-summer.jpg",
  },
  {
    id: "new",
    title: "NEW ARRIVALS",
    subtitle: "いま注目の新着アイテム",
    image: "/sazo-commerce/hero-new.jpg",
  },
  {
    id: "skincare",
    title: "SKINCARE PICK",
    subtitle: "毎日のスキンケアをもっと楽しく",
    image: "/sazo-commerce/hero-skincare.jpg",
  },
  {
    id: "makeup",
    title: "MAKEUP COLLECTION",
    subtitle: "気分を彩るメイクアップ",
    image: "/sazo-commerce/hero-makeup.jpg",
  },
  {
    id: "lifestyle",
    title: "LIFESTYLE EDIT",
    subtitle: "暮らしに寄り添うセレクション",
    image: "/sazo-commerce/hero-lifestyle.jpg",
  },
] satisfies readonly HeroSlide[];

export const shortcuts = [
  { id: "ranking", label: "ランキング", image: "/sazo-commerce/shortcut-ranking.jpg" },
  { id: "new", label: "新着アイテム", image: "/sazo-commerce/shortcut-new.jpg" },
  { id: "beauty", label: "ビューティー", image: "/sazo-commerce/shortcut-beauty.jpg" },
  { id: "fashion", label: "ファッション", image: "/sazo-commerce/shortcut-fashion.jpg" },
  {
    id: "lifestyle",
    label: "ライフスタイル",
    image: "/sazo-commerce/shortcut-lifestyle.jpg",
  },
] satisfies readonly Shortcut[];

export const products = [
  {
    id: "p01",
    brand: "innisfree",
    name: "レチノール シカ リペア セラム",
    price: "¥3,960",
    image: "/sazo-commerce/product-retinol-serum.jpg",
    badge: "BEST",
  },
  {
    id: "p02",
    brand: "rom&nd",
    name: "ジューシーラスティングティント",
    price: "¥1,320",
    image: "/sazo-commerce/product-tint.jpg",
  },
  {
    id: "p03",
    brand: "VT",
    name: "リードルショット 100",
    price: "¥3,520",
    image: "/sazo-commerce/product-reedle-shot.jpg",
    badge: "人気",
  },
  {
    id: "p04",
    brand: "hince",
    name: "セカンドスキンメッシュマットクッション",
    price: "¥3,520",
    image: "/sazo-commerce/product-cushion.jpg",
  },
  {
    id: "p05",
    brand: "AMUSE",
    name: "デューティント",
    price: "¥1,760",
    image: "/sazo-commerce/product-dew-tint.jpg",
  },
  {
    id: "p06",
    brand: "Anua",
    name: "ドクダミ 77 スージングトナー",
    price: "¥2,650",
    image: "/sazo-commerce/product-toner.jpg",
  },
  {
    id: "p07",
    brand: "Torriden",
    name: "ダイブイン セラム",
    price: "¥2,420",
    image: "/sazo-commerce/product-dive-in.jpg",
  },
  {
    id: "p08",
    brand: "CLIO",
    name: "プロ アイ パレット エアー",
    price: "¥3,740",
    image: "/sazo-commerce/product-eye-palette.jpg",
  },
  {
    id: "p09",
    brand: "medicube",
    name: "AGE-R ブースタープロ",
    price: "¥45,000",
    image: "/sazo-commerce/product-booster.jpg",
  },
  {
    id: "p10",
    brand: "dasique",
    name: "シャドウパレット",
    price: "¥4,180",
    image: "/sazo-commerce/product-shadow-palette.jpg",
  },
  {
    id: "p11",
    brand: "ma:nyo",
    name: "ピュアクレンジングオイル",
    price: "¥2,530",
    image: "/sazo-commerce/product-cleansing-oil.jpg",
  },
  {
    id: "p12",
    brand: "ETUDE",
    name: "フィクシングティント",
    price: "¥1,485",
    image: "/sazo-commerce/product-fixing-tint.jpg",
  },
] satisfies readonly Product[];

export const rankingKeywords = [
  { rank: 1, label: "リップ" },
  { rank: 2, label: "クッションファンデ" },
  { rank: 3, label: "美容液" },
  { rank: 4, label: "日焼け止め" },
  { rank: 5, label: "アイシャドウ" },
  { rank: 6, label: "化粧水" },
  { rank: 7, label: "クレンジング" },
  { rank: 8, label: "チーク" },
  { rank: 9, label: "ヘアケア" },
  { rank: 10, label: "ボディケア" },
] satisfies readonly RankingKeyword[];

export const brands = [
  { id: "anua", name: "Anua", image: "/sazo-commerce/brand-anua.jpg" },
  { id: "amuse", name: "AMUSE", image: "/sazo-commerce/brand-amuse.jpg" },
  { id: "clio", name: "CLIO", image: "/sazo-commerce/brand-clio.jpg" },
  { id: "dasique", name: "dasique", image: "/sazo-commerce/brand-dasique.jpg" },
  { id: "hince", name: "hince", image: "/sazo-commerce/brand-hince.jpg" },
  { id: "innisfree", name: "innisfree", image: "/sazo-commerce/brand-innisfree.jpg" },
  { id: "romand", name: "rom&nd", image: "/sazo-commerce/brand-romand.jpg" },
  { id: "torriden", name: "Torriden", image: "/sazo-commerce/brand-torriden.jpg" },
] satisfies readonly Brand[];

export const categories = [
  { id: "skincare", name: "スキンケア", image: "/sazo-commerce/category-skincare.jpg" },
  { id: "makeup", name: "メイクアップ", image: "/sazo-commerce/category-makeup.jpg" },
  { id: "haircare", name: "ヘアケア", image: "/sazo-commerce/category-haircare.jpg" },
  { id: "bodycare", name: "ボディケア", image: "/sazo-commerce/category-bodycare.jpg" },
  {
    id: "fragrance",
    name: "フレグランス",
    image: "/sazo-commerce/category-fragrance.jpg",
  },
  { id: "nail", name: "ネイル", image: "/sazo-commerce/category-nail.jpg" },
  {
    id: "beauty-device",
    name: "美容家電",
    image: "/sazo-commerce/category-beauty-device.jpg",
  },
  { id: "fashion", name: "ファッション", image: "/sazo-commerce/category-fashion.jpg" },
  { id: "bags", name: "バッグ・小物", image: "/sazo-commerce/category-bags.jpg" },
  { id: "home", name: "ホーム・キッチン", image: "/sazo-commerce/category-home.jpg" },
  { id: "food", name: "フード", image: "/sazo-commerce/category-food.jpg" },
  { id: "wellness", name: "ウェルネス", image: "/sazo-commerce/category-wellness.jpg" },
  { id: "baby", name: "ベビー・キッズ", image: "/sazo-commerce/category-baby.jpg" },
  { id: "sale", name: "セール", image: "/sazo-commerce/category-sale.jpg" },
] satisfies readonly Category[];

export const reviews = [
  {
    id: "r01",
    author: "mika",
    productName: "レチノール シカ リペア セラム",
    comment: "肌なじみがよく、毎晩使っています。",
    rating: 5,
    image: "/sazo-commerce/review-01.jpg",
  },
  {
    id: "r02",
    author: "yuri",
    productName: "ジューシーラスティングティント",
    comment: "発色がきれいで落ちにくいです。",
    rating: 5,
    image: "/sazo-commerce/review-02.jpg",
  },
  {
    id: "r03",
    author: "hana",
    productName: "ドクダミ 77 スージングトナー",
    comment: "さっぱりした使い心地がお気に入り。",
    rating: 4,
    image: "/sazo-commerce/review-03.jpg",
  },
  {
    id: "r04",
    author: "rina",
    productName: "ダイブイン セラム",
    comment: "乾燥する季節にも頼れます。",
    rating: 5,
    image: "/sazo-commerce/review-04.jpg",
  },
  {
    id: "r05",
    author: "mai",
    productName: "プロ アイ パレット エアー",
    comment: "毎日使いやすいカラーです。",
    rating: 4,
    image: "/sazo-commerce/review-05.jpg",
  },
  {
    id: "r06",
    author: "aya",
    productName: "フィクシングティント",
    comment: "マスクでも色もちが良いです。",
    rating: 5,
    image: "/sazo-commerce/review-06.jpg",
  },
  {
    id: "r07",
    author: "nana",
    productName: "ピュアクレンジングオイル",
    comment: "メイクがすっきり落ちます。",
    rating: 4,
    image: "/sazo-commerce/review-07.jpg",
  },
  {
    id: "r08",
    author: "saki",
    productName: "シャドウパレット",
    comment: "ラメ感がとてもきれいでした。",
    rating: 5,
    image: "/sazo-commerce/review-08.jpg",
  },
] satisfies readonly Review[];

export const gramEntries = [
  {
    id: "g01",
    author: "sazo_staff",
    caption: "夏のベースメイク特集",
    image: "/sazo-commerce/gram-01.jpg",
  },
  {
    id: "g02",
    author: "mika_beauty",
    caption: "お気に入りのリップを紹介",
    image: "/sazo-commerce/gram-02.jpg",
  },
  {
    id: "g03",
    author: "skincare_note",
    caption: "夜のスキンケアルーティン",
    image: "/sazo-commerce/gram-03.jpg",
  },
  {
    id: "g04",
    author: "daily_cosme",
    caption: "ポーチの中身",
    image: "/sazo-commerce/gram-04.jpg",
  },
  {
    id: "g05",
    author: "kbeauty_love",
    caption: "今週の購入品",
    image: "/sazo-commerce/gram-05.jpg",
  },
  {
    id: "g06",
    author: "sazo_editor",
    caption: "SAZO PICK",
    image: "/sazo-commerce/gram-06.jpg",
  },
] satisfies readonly GramEntry[];
