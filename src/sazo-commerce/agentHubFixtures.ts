import { referenceProducts, type Product } from "@/sazo-commerce/fixtures";

export interface AgentHubHistoryItem {
  id: string;
  inputKind: "image" | "url";
  inputLabel: string;
  product: {
    image: string;
    name: string;
    priceAndDelivery: string;
  };
  timestamp: string;
}

export interface AgentHubCustomsAction {
  itemLabel: string;
  productImage: string;
  productName: string;
  reason: string;
  requiredFields: string;
  source: string;
  title: string;
}

/**
 * The agent is a return point for customer submissions, not a purchase queue.
 * Only the two newest submissions occupy the default viewport.
 */
export const agentHubLatestHistory: readonly AgentHubHistoryItem[] = [
  {
    id: "rakuten-new-balance",
    inputKind: "url",
    inputLabel: "rakuten.co.jp/products/… を送信",
    product: {
      image: "/sazo-commerce/reference/new-balance-9060.png",
      name: "New Balance 9060",
      priceAndDelivery: "R$ 748 ・ 7〜10日",
    },
    timestamp: "今日 14:24",
  },
  {
    id: "image-sony-a7c",
    inputKind: "image",
    inputLabel: "画像から商品を確認",
    product: {
      image: "/sazo-commerce/reference/mirrorless-camera.png",
      name: "Sony α7C II",
      priceAndDelivery: "R$ 9.899 ・ 10〜14日",
    },
    timestamp: "昨日 19:12",
  },
] as const;

/** Compact samples shown only after the user opens the older-history disclosure. */
export const agentHubArchivedHistory: readonly AgentHubHistoryItem[] = [
  {
    id: "url-switch-oled",
    inputKind: "url",
    inputLabel: "rakuten.co.jp/item/… を送信",
    product: {
      image: "/sazo-commerce/reference/nintendo-switch-oled.png",
      name: "Nintendo Switch OLED",
      priceAndDelivery: "R$ 2.184 ・ 8〜12日",
    },
    timestamp: "8月10日 10:11",
  },
  {
    id: "image-pro-controller",
    inputKind: "image",
    inputLabel: "画像から商品を確認",
    product: {
      image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
      name: "Nintendo Switch Proコントローラー",
      priceAndDelivery: "R$ 429 ・ 8〜12日",
    },
    timestamp: "8月8日 18:43",
  },
] as const;

/** The explicit exception fixture is intentionally opt-in. */
export const agentHubCustomsAction: AgentHubCustomsAction = {
  itemLabel: "受取人情報を入力してください",
  productImage: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
  productName: "Air Jordan 1 Retro High OG",
  reason: "通関に提出する情報として必要です",
  requiredFields: "CPF・お届け先の確認",
  source: "SNKRS Japan の商品ページを送信",
  title: "通関手続きに必要な情報があります",
};

function referenceProductAt(index: number): Product {
  const product = referenceProducts[index];

  if (product === undefined) {
    throw new Error(`Missing J-Planet reference product at index ${index}`);
  }

  return product;
}

/** Product rail intentionally stays distinct from submission history. */
export const agentHubRecentProducts: readonly Product[] = [
  referenceProductAt(2),
  referenceProductAt(3),
  referenceProductAt(0),
  referenceProductAt(1),
];
