export type JplanetCouponCategory = "product" | "shipping" | "brand";

export interface JplanetCoupon {
  actionMode?: "use" | "later";
  id: string;
  category: JplanetCouponCategory;
  displayCategory?: JplanetCouponCategory;
  discount: string;
  expiresAt: string;
  expiresSoon?: boolean;
  maximumDiscount?: string;
  minimumSpend: string;
  name: string;
  quantity?: number;
  target: string;
  combinable: boolean;
}

export const initialJplanetCouponIds = [
  "international-shipping-r30",
  "first-purchase-r50",
  "popular-brands-10",
  "all-products-5",
] as const;

export const jplanetCoupons = [
  {
    id: "international-shipping-r30",
    category: "shipping",
    discount: "R$ 30 OFF",
    expiresAt: "2026年8月31日まで",
    minimumSpend: "R$ 300以上の購入",
    name: "国際送料 R$30 OFF",
    target: "対象配送方法: 国際配送",
    combinable: false,
  },
  {
    actionMode: "later",
    id: "first-purchase-r50",
    category: "shipping",
    displayCategory: "product",
    discount: "R$ 50 OFF",
    expiresAt: "残り1時間",
    expiresSoon: true,
    minimumSpend: "R$ 500以上の購入",
    name: "初回購入 R$50 OFF",
    target: "対象商品: 初回購入の商品",
    combinable: false,
  },
  {
    id: "popular-brands-10",
    category: "brand",
    discount: "10% OFF",
    expiresAt: "2026年8月31日まで",
    maximumDiscount: "割引上限 R$ 80",
    minimumSpend: "R$ 400以上の購入",
    name: "人気ブランド 10% OFF",
    quantity: 3,
    target: "対象ブランド: Nintendo / New Balance / Sony",
    combinable: true,
  },
  {
    id: "all-products-5",
    category: "product",
    discount: "5% OFF",
    expiresAt: "2026年8月31日まで",
    maximumDiscount: "割引上限 R$ 25",
    minimumSpend: "R$ 200以上の購入",
    name: "全商品 5% OFF",
    quantity: 2,
    target: "対象商品: すべての商品",
    combinable: true,
  },
  {
    id: "welcome-code-r20",
    category: "product",
    discount: "R$ 20 OFF",
    expiresAt: "2026年9月15日まで",
    minimumSpend: "R$ 200以上の購入",
    name: "ウェルカムコード R$20 OFF",
    target: "対象商品: すべての商品",
    combinable: false,
  },
  {
    id: "camera-brand-12",
    category: "brand",
    discount: "12% OFF",
    expiresAt: "2026年9月30日まで",
    maximumDiscount: "割引上限 R$ 100",
    minimumSpend: "R$ 600以上の購入",
    name: "カメラブランド 12% OFF",
    target: "対象ブランド: Sony / Canon",
    combinable: false,
  },
  {
    id: "warehouse-shipping-r15",
    category: "shipping",
    discount: "R$ 15 OFF",
    expiresAt: "2026年9月10日まで",
    minimumSpend: "R$ 250以上の購入",
    name: "国際配送 R$15 OFF",
    target: "対象配送方法: 国際配送",
    combinable: true,
  },
  {
    id: "closed-brand-15",
    category: "brand",
    discount: "15% OFF",
    expiresAt: "配布終了",
    minimumSpend: "R$ 500以上の購入",
    name: "ゲームブランド 15% OFF",
    target: "対象ブランド: Nintendo",
    combinable: false,
  },
] as const satisfies readonly JplanetCoupon[];

export const couponById: ReadonlyMap<string, JplanetCoupon> = new Map(
  jplanetCoupons.map((coupon) => [coupon.id, coupon]),
);

export const discoverableCouponIds = [
  "welcome-code-r20",
  "camera-brand-12",
  "warehouse-shipping-r15",
  "closed-brand-15",
] as const;

export const couponHistory = {
  expired: [
    {
      id: "expired-summer-r20",
      name: "夏の国際送料 R$20 OFF",
      discount: "R$ 20 OFF",
      date: "2026年7月31日",
      order: "JP-240731",
    },
  ],
  used: [
    {
      id: "used-first-r50",
      name: "初回購入 R$50 OFF",
      discount: "R$ 50 OFF",
      date: "2026年8月8日",
      order: "JP-240808",
    },
  ],
} as const;

export function getJplanetCoupon(id: string): JplanetCoupon {
  return couponById.get(id) ?? jplanetCoupons[0];
}
