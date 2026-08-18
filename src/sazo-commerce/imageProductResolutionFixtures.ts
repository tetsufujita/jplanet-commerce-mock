import type { SazoImagePath } from "@/sazo-commerce/fixtures";

export interface ImageSearchColor {
  id: string;
  label: string;
  image: SazoImagePath;
}

/** A candidate only identifies a likely product. Purchase claims stay out of this step. */
export interface ImageSearchCandidate {
  id: string;
  productId: string;
  name: string;
  color: string;
  image: SazoImagePath;
}

const newBalanceImage = "/sazo-commerce/reference/new-balance-9060.png" as const;

/** A dedicated detail ID keeps the image-selected New Balance separate from the controller mock. */
export const imageSearchResolvedNewBalanceProductId = "jplanet-new-balance-9060";

/** The supplied image is represented with an existing catalog/review asset in this Mock. */
export const imageSearchSubmittedPreview =
  "/sazo-commerce/review-media/mika-sneakers-arrival-v1.png" as const;

/**
 * Candidate identity is deliberately independent of price, source, stock, and
 * purchase conditions. Those claims are not made while an image is identified.
 */
export const imageSearchNearestCandidate = {
  id: "new-balance-9060-white-green",
  productId: imageSearchResolvedNewBalanceProductId,
  name: "New Balance 9060",
  color: "ホワイト／グリーン",
  image: newBalanceImage,
} as const satisfies ImageSearchCandidate;

export const imageSearchOtherCandidates = [
  {
    id: "new-balance-9060-gray",
    productId: imageSearchResolvedNewBalanceProductId,
    name: "New Balance 9060",
    color: "グレー",
    image: newBalanceImage,
  },
  {
    id: "new-balance-9060-beige",
    productId: imageSearchResolvedNewBalanceProductId,
    name: "New Balance 9060",
    color: "ベージュ",
    image: newBalanceImage,
  },
  imageSearchNearestCandidate,
  {
    id: "new-balance-9060-black",
    productId: imageSearchResolvedNewBalanceProductId,
    name: "New Balance 9060",
    color: "ブラック",
    image: newBalanceImage,
  },
] as const satisfies readonly ImageSearchCandidate[];

/**
 * The resolved product remains an existing product-detail flow. Its product
 * data lives here so the image search surface itself does not own detail copy.
 */
export const imageSearchNewBalanceDetail = {
  productId: imageSearchResolvedNewBalanceProductId,
  name: "New Balance 9060",
  gallery: [newBalanceImage, newBalanceImage, newBalanceImage],
  originalUrl: "https://www.newbalance.jp/",
  sellerLabel: "New Balance Japan 候補",
  priceEstimate: "R$ 748",
  soldLabel: "8,600件販売",
  domesticArrivalEstimate: "日本国内:1〜2日",
  internationalArrivalEstimate: "日本→ブラジル:7〜10日",
  reviewSummary: "4.8 ★ (864件)・New Balance Japan 候補",
  specificationSummary: "メッシュ / スエード / ラバーソール",
  description:
    "ボリュームのあるソールとメッシュ・スエードを組み合わせたスニーカーです。購入前にカラー・サイズを選んでください。",
  buyerReview: "写真のイメージに近く、梱包も丁寧でした。",
  colors: [
    { id: "white-green", label: "ホワイト／グリーン", image: newBalanceImage },
    { id: "white", label: "ホワイト", image: newBalanceImage },
  ],
  sizes: ["25.0", "25.5", "26.0", "26.5"],
} as const;
