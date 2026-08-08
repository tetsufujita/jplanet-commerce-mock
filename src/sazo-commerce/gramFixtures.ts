import { gramEntries, products } from "@/sazo-commerce/fixtures";

export type GramCategoryId =
  | "all"
  | "influencer"
  | "hot"
  | "daily"
  | "health"
  | "food"
  | "starbucks"
  | "beauty"
  | "fashion"
  | "drama"
  | "idol";

export interface GramCategory {
  id: GramCategoryId;
  label: string;
}

export interface GramProduct {
  id: string;
  image: string;
  name: string;
  price: string;
  discount?: string;
  productId?: string;
}

export interface GramPost {
  id: string;
  image: string;
  caption: string;
  author: string;
  categories: readonly Exclude<GramCategoryId, "all">[];
  products: readonly GramProduct[];
}

export const gramCategories = [
  { id: "all", label: "全体" },
  { id: "influencer", label: "インフルエンサーPick" },
  { id: "hot", label: "HOT🔥" },
  { id: "daily", label: "日用品" },
  { id: "health", label: "健康・サプリ" },
  { id: "food", label: "食べ物" },
  { id: "starbucks", label: "スタバ" },
  { id: "beauty", label: "コスメ・スキンケア" },
  { id: "fashion", label: "ファッション" },
  { id: "drama", label: "ドラマ" },
  { id: "idol", label: "アイドル" },
] as const satisfies readonly GramCategory[];

function linkedProduct(index: number): GramProduct {
  const product = products[index % products.length];

  if (product === undefined) {
    throw new Error(`Missing SAZO local product at index ${index}`);
  }

  return {
    id: `linked-${product.id}`,
    image: product.image,
    name: product.name,
    price: product.price,
    productId: product.id,
  };
}

function recordedGramEntry(index: number) {
  const entry = gramEntries[index];

  if (entry === undefined) {
    throw new Error(`Missing recorded GRAM entry at index ${index}`);
  }

  return entry;
}

export const gramPosts = [
  {
    id: "gram-01",
    image: "/sazo-commerce/community/01.webp",
    caption: recordedGramEntry(0).caption,
    author: recordedGramEntry(0).author,
    categories: ["idol", "fashion", "hot"],
    products: [
      {
        id: "gram-01-primary",
        image: "/sazo-commerce/community/01.webp",
        name: "[たまごっち]長袖パジャマ(Blue)_SPPPG49U09",
        price: "￥4,594",
      },
      linkedProduct(0),
    ],
  },
  {
    id: "gram-02",
    image: "/sazo-commerce/gram/home/02.png",
    caption: recordedGramEntry(1).caption,
    author: recordedGramEntry(1).author,
    categories: ["daily", "beauty"],
    products: [
      {
        id: "gram-02-primary",
        image: "/sazo-commerce/gram/home/02.png",
        name: "スノーイヤホン / Cタイプ",
        price: "￥2,185",
      },
      linkedProduct(1),
    ],
  },
  {
    id: "gram-03",
    image: "/sazo-commerce/community/03.webp",
    caption: recordedGramEntry(2).caption,
    author: recordedGramEntry(2).author,
    categories: ["starbucks", "hot"],
    products: [
      {
        id: "gram-03-primary",
        discount: "20%",
        image: "/sazo-commerce/community/03.webp",
        name: "ユアサマーグラスプレートセット（2p）",
        price: "￥3,495",
      },
      linkedProduct(2),
    ],
  },
  {
    id: "gram-04",
    image: "/sazo-commerce/community/12.webp",
    caption: recordedGramEntry(3).caption,
    author: recordedGramEntry(3).author,
    categories: ["influencer", "fashion"],
    products: [
      {
        id: "gram-04-primary",
        discount: "50%",
        image: "/sazo-commerce/community/12.webp",
        name: "バニーバニートートバッグ",
        price: "¥9,719",
      },
      linkedProduct(3),
    ],
  },
  {
    id: "gram-05",
    image: "/sazo-commerce/community/13.webp",
    caption: recordedGramEntry(4).caption,
    author: recordedGramEntry(4).author,
    categories: ["idol", "hot"],
    products: [
      {
        id: "gram-05-primary",
        discount: "42%",
        image: "/sazo-commerce/community/13.webp",
        name: "サブアークケル Thin バッグ",
        price: "¥2,280",
      },
      linkedProduct(4),
    ],
  },
  {
    id: "gram-06",
    image: "/sazo-commerce/community/14.webp",
    caption: recordedGramEntry(5).caption,
    author: recordedGramEntry(5).author,
    categories: ["daily", "drama"],
    products: [
      {
        id: "gram-06-primary",
        image: "/sazo-commerce/community/14.webp",
        name: "マイメロディードール",
        price: "¥110",
      },
      linkedProduct(5),
    ],
  },
  {
    id: "gram-07",
    image: "/sazo-commerce/gram/list-02.png",
    caption: "REMINI Plush キャラぬいキーリング",
    author: "KREAM",
    categories: ["beauty", "influencer"],
    products: [
      {
        id: "gram-07-primary",
        discount: "10%",
        image: "/sazo-commerce/gram/list-02.png",
        name: "REMINI Plush キャラぬいキーリング",
        price: "¥4,914",
      },
      linkedProduct(6),
    ],
  },
  {
    id: "gram-08",
    image: "/sazo-commerce/community/04.webp",
    caption: "ブラジルからの購入代行リクエスト",
    author: "J-Planet",
    categories: ["health", "daily"],
    products: [
      {
        id: "gram-08-primary",
        image: "/sazo-commerce/community/04.webp",
        name: "購入代行依頼",
        price: "¥1",
      },
      linkedProduct(7),
    ],
  },
  {
    id: "gram-09",
    image: "/sazo-commerce/gram/list-04.png",
    caption: "rd check pants スウェットパンツまとめ",
    author: "MUSINSA",
    categories: ["fashion", "influencer"],
    products: [
      {
        id: "gram-09-primary",
        discount: "50%",
        image: "/sazo-commerce/gram/list-04.png",
        name: "rd check pants スウェットパンツまとめ",
        price: "¥12,469",
      },
      linkedProduct(8),
    ],
  },
  {
    id: "gram-10",
    image: "/sazo-commerce/gram/list-05.png",
    caption: "夏の日本トレンドまとめ",
    author: "KREAM",
    categories: ["food", "drama"],
    products: [
      {
        id: "gram-10-primary",
        image: "/sazo-commerce/gram/list-05.png",
        name: "[@xanaduany SET] 夏の日本トレンドまとめ",
        price: "¥12,160",
      },
      linkedProduct(9),
    ],
  },
] as const satisfies readonly GramPost[];

if (new Set(gramPosts.map(({ id }) => id)).size !== gramPosts.length) {
  throw new Error("GRAM post IDs must be unique");
}

if (gramPosts.some(({ products: postProducts }) => postProducts.length !== 2)) {
  throw new Error("Every GRAM post must have exactly two products");
}

export function getGramPosts(category: GramCategoryId): readonly GramPost[] {
  return category === "all"
    ? gramPosts
    : gramPosts.filter(({ categories }) =>
        (categories as readonly Exclude<GramCategoryId, "all">[]).includes(category),
      );
}

export function getGramPost(id: string | null): GramPost {
  return gramPosts.find((post) => post.id === id) ?? gramPosts[0];
}
