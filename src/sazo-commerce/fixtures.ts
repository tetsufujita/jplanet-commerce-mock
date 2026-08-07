export type SazoImagePath = `/sazo-commerce/${string}`;

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: SazoImagePath;
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

export const heroSlides = [
  {
    id: "summer",
    title: "SUMMER BEAUTY",
    subtitle: "夏を楽しむビューティーアイテム",
    image: "/sazo-commerce/hero/slide-1.webp",
  },
  {
    id: "new",
    title: "NEW ARRIVALS",
    subtitle: "いま注目の新着アイテム",
    image: "/sazo-commerce/hero/slide-2.webp",
  },
  {
    id: "skincare",
    title: "SKINCARE PICK",
    subtitle: "毎日のスキンケアをもっと楽しく",
    image: "/sazo-commerce/hero/slide-3.webp",
  },
  {
    id: "makeup",
    title: "MAKEUP COLLECTION",
    subtitle: "気分を彩るメイクアップ",
    image: "/sazo-commerce/hero/slide-4.webp",
  },
  {
    id: "lifestyle",
    title: "LIFESTYLE EDIT",
    subtitle: "暮らしに寄り添うセレクション",
    image: "/sazo-commerce/hero/slide-5.webp",
  },
] satisfies readonly HeroSlide[];

export const shortcuts = [
  { id: "ranking", label: "ランキング", image: "/sazo-commerce/products/01.webp" },
  { id: "new", label: "新着アイテム", image: "/sazo-commerce/products/02.webp" },
  { id: "beauty", label: "ビューティー", image: "/sazo-commerce/products/03.webp" },
  { id: "fashion", label: "ファッション", image: "/sazo-commerce/products/04.webp" },
  {
    id: "lifestyle",
    label: "ライフスタイル",
    image: "/sazo-commerce/products/05.webp",
  },
] satisfies readonly Shortcut[];

export const products = [
  {
    id: "p01",
    brand: "innisfree",
    name: "レチノール シカ リペア セラム",
    price: "¥3,960",
    image: "/sazo-commerce/products/01.webp",
    badge: "BEST",
  },
  {
    id: "p02",
    brand: "rom&nd",
    name: "ジューシーラスティングティント",
    price: "¥1,320",
    image: "/sazo-commerce/products/02.webp",
  },
  {
    id: "p03",
    brand: "VT",
    name: "リードルショット 100",
    price: "¥3,520",
    image: "/sazo-commerce/products/03.webp",
    badge: "人気",
  },
  {
    id: "p04",
    brand: "hince",
    name: "セカンドスキンメッシュマットクッション",
    price: "¥3,520",
    image: "/sazo-commerce/products/04.webp",
  },
  {
    id: "p05",
    brand: "AMUSE",
    name: "デューティント",
    price: "¥1,760",
    image: "/sazo-commerce/products/05.webp",
  },
  {
    id: "p06",
    brand: "Anua",
    name: "ドクダミ 77 スージングトナー",
    price: "¥2,650",
    image: "/sazo-commerce/products/06.webp",
  },
  {
    id: "p07",
    brand: "Torriden",
    name: "ダイブイン セラム",
    price: "¥2,420",
    image: "/sazo-commerce/products/07.webp",
  },
  {
    id: "p08",
    brand: "CLIO",
    name: "プロ アイ パレット エアー",
    price: "¥3,740",
    image: "/sazo-commerce/products/08.webp",
  },
  {
    id: "p09",
    brand: "medicube",
    name: "AGE-R ブースタープロ",
    price: "¥45,000",
    image: "/sazo-commerce/products/09.webp",
  },
  {
    id: "p10",
    brand: "dasique",
    name: "シャドウパレット",
    price: "¥4,180",
    image: "/sazo-commerce/products/10.webp",
  },
  {
    id: "p11",
    brand: "ma:nyo",
    name: "ピュアクレンジングオイル",
    price: "¥2,530",
    image: "/sazo-commerce/products/11.webp",
  },
  {
    id: "p12",
    brand: "ETUDE",
    name: "フィクシングティント",
    price: "¥1,485",
    image: "/sazo-commerce/products/12.webp",
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

export const reviews = [
  {
    id: "r01",
    author: "mika",
    productName: "レチノール シカ リペア セラム",
    comment: "肌なじみがよく、毎晩使っています。",
    rating: 5,
    image: "/sazo-commerce/products/01.webp",
  },
  {
    id: "r02",
    author: "yuri",
    productName: "ジューシーラスティングティント",
    comment: "発色がきれいで落ちにくいです。",
    rating: 5,
    image: "/sazo-commerce/products/02.webp",
  },
  {
    id: "r03",
    author: "hana",
    productName: "ドクダミ 77 スージングトナー",
    comment: "さっぱりした使い心地がお気に入り。",
    rating: 4,
    image: "/sazo-commerce/products/06.webp",
  },
  {
    id: "r04",
    author: "rina",
    productName: "ダイブイン セラム",
    comment: "乾燥する季節にも頼れます。",
    rating: 5,
    image: "/sazo-commerce/products/07.webp",
  },
  {
    id: "r05",
    author: "mai",
    productName: "プロ アイ パレット エアー",
    comment: "毎日使いやすいカラーです。",
    rating: 4,
    image: "/sazo-commerce/products/08.webp",
  },
  {
    id: "r06",
    author: "aya",
    productName: "フィクシングティント",
    comment: "マスクでも色もちが良いです。",
    rating: 5,
    image: "/sazo-commerce/products/12.webp",
  },
  {
    id: "r07",
    author: "nana",
    productName: "ピュアクレンジングオイル",
    comment: "メイクがすっきり落ちます。",
    rating: 4,
    image: "/sazo-commerce/products/11.webp",
  },
  {
    id: "r08",
    author: "saki",
    productName: "シャドウパレット",
    comment: "ラメ感がとてもきれいでした。",
    rating: 5,
    image: "/sazo-commerce/products/10.webp",
  },
] satisfies readonly Review[];

export const gramEntries = [
  {
    id: "g01",
    author: "sazo_staff",
    caption: "夏のベースメイク特集",
    image: "/sazo-commerce/community/01.webp",
  },
  {
    id: "g02",
    author: "mika_beauty",
    caption: "お気に入りのリップを紹介",
    image: "/sazo-commerce/community/02.webp",
  },
  {
    id: "g03",
    author: "skincare_note",
    caption: "夜のスキンケアルーティン",
    image: "/sazo-commerce/community/03.webp",
  },
  {
    id: "g04",
    author: "daily_cosme",
    caption: "ポーチの中身",
    image: "/sazo-commerce/community/04.webp",
  },
  {
    id: "g05",
    author: "kbeauty_love",
    caption: "今週の購入品",
    image: "/sazo-commerce/community/05.webp",
  },
  {
    id: "g06",
    author: "sazo_editor",
    caption: "SAZO PICK",
    image: "/sazo-commerce/community/06.webp",
  },
] satisfies readonly GramEntry[];
