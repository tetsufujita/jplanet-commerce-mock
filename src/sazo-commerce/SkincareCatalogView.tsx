import { useRef, useState } from "react";
import {
  JplanetRecommendationGrid,
  type HomeDenseProduct,
} from "@/sazo-commerce/HomeView";
import { catalogTabs } from "@/sazo-commerce/fixtures";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import { ProductMediaHeader } from "@/sazo-commerce/ProductDetailView";
import type { ViewDispatchProps } from "@/sazo-commerce/DirectoryViews";

const skincareCatalogTabIds = new Set([
  "skincare",
  "base-makeup",
  "point-makeup",
  "sets",
  "tools",
  "uv-care",
]);

const skincareCategoryTabs = catalogTabs.filter(({ id }) =>
  skincareCatalogTabIds.has(id),
);

type SkincareRecommendationProduct = HomeDenseProduct & {
  categoryIds: readonly string[];
  chipIds: readonly string[];
};

const skincareRecommendationProducts: readonly SkincareRecommendationProduct[] = [
  {
    categoryIds: ["skincare"],
    chipIds: ["toner", "lotion"],
    discount: "18% OFF",
    id: "hada-labo-gokujun-lotion",
    image: "/images/hada-labo-bottle.png",
    label: "日本公式",
    mediaAspect: "portrait",
    name: "肌ラボ 極潤ヒアルロン液 しっとりタイプ",
    originalPrice: "R$ 144",
    price: "R$ 118",
    salesCount: "7,240件販売",
  },
  {
    categoryIds: ["skincare"],
    chipIds: ["emulsion", "essence"],
    discount: "12% OFF",
    id: "aestura-atobarrier-cream",
    image: "/sazo-commerce/beauty/skincare-03.webp",
    label: "人気",
    mediaAspect: "square",
    name: "AESTURA アトバリア365 クリーム",
    originalPrice: "R$ 198",
    price: "R$ 174",
    salesCount: "4,830件販売",
  },
  {
    categoryIds: ["skincare"],
    chipIds: ["sheet-mask"],
    discount: "15% OFF",
    id: "drg-red-blemish-serum",
    image: "/sazo-commerce/beauty/skincare-02.webp",
    label: "人気",
    mediaAspect: "square",
    name: "Dr.G レッドブレミッシュ クリアスージングセラム",
    originalPrice: "R$ 176",
    price: "R$ 150",
    salesCount: "5,610件販売",
  },
  {
    categoryIds: ["skincare", "point-makeup"],
    chipIds: ["essence", "eye-makeup"],
    discount: "10% OFF",
    id: "missha-night-repair-ampoule",
    image: "/sazo-commerce/beauty/skincare-01.webp",
    label: "限定",
    mediaAspect: "square",
    name: "MISSHA タイムレボリューション ナイトリペア アンプル",
    originalPrice: "R$ 222",
    price: "R$ 200",
    salesCount: "3,920件販売",
  },
  {
    categoryIds: ["skincare", "base-makeup", "uv-care"],
    chipIds: ["makeup-base", "primer"],
    discount: "14% OFF",
    id: "anessa-perfect-uv-milk",
    image: "/sazo-commerce/categories/beauty-uv-care.png",
    label: "日本公式",
    mediaAspect: "wide",
    name: "資生堂 アネッサ パーフェクトUV スキンケアミルク N",
    originalPrice: "R$ 168",
    price: "R$ 144",
    salesCount: "9,820件販売",
  },
  {
    categoryIds: ["skincare", "sets"],
    chipIds: ["skin-toner", "skincare-set"],
    discount: "11% OFF",
    id: "attenir-cleansing-oil",
    image: "/sazo-commerce/categories/beauty-cleansing.png",
    label: "日本公式",
    mediaAspect: "square",
    name: "アテニア スキンクリア クレンズ オイル",
    originalPrice: "R$ 158",
    price: "R$ 140",
    salesCount: "6,450件販売",
  },
  {
    categoryIds: ["base-makeup"],
    chipIds: ["bb-cream", "cc-cream"],
    discount: "13% OFF",
    id: "base-makeup-compact",
    image: "/sazo-commerce/categories/beauty-base-makeup.png",
    label: "人気",
    mediaAspect: "square",
    name: "クッションファンデーション ナチュラル",
    originalPrice: "R$ 142",
    price: "R$ 124",
    salesCount: "5,180件販売",
  },
  {
    categoryIds: ["point-makeup"],
    chipIds: ["lip", "cheek"],
    discount: "16% OFF",
    id: "point-makeup-palette",
    image: "/sazo-commerce/categories/beauty-point-makeup.png",
    label: "限定",
    mediaAspect: "square",
    name: "リップ＆アイカラー コレクション",
    originalPrice: "R$ 128",
    price: "R$ 108",
    salesCount: "4,120件販売",
  },
  {
    categoryIds: ["sets"],
    chipIds: ["cosmetics-set", "gift-set"],
    discount: "15% OFF",
    id: "beauty-trial-set",
    image: "/sazo-commerce/categories/beauty-sets.png",
    label: "日本公式",
    mediaAspect: "square",
    name: "スキンケア トライアルセット",
    originalPrice: "R$ 218",
    price: "R$ 185",
    salesCount: "3,760件販売",
  },
  {
    categoryIds: ["tools"],
    chipIds: ["brush", "puff", "mirror"],
    discount: "12% OFF",
    id: "beauty-tools-set",
    image: "/sazo-commerce/categories/beauty-tools.png",
    label: "人気",
    mediaAspect: "square",
    name: "メイクブラシ＆ツールセット",
    originalPrice: "R$ 136",
    price: "R$ 120",
    salesCount: "2,940件販売",
  },
];

export function SkincareCatalogView({ dispatch }: ViewDispatchProps) {
  const agentEntryRef = useRef<HTMLElement>(null);
  const [activeTabId, setActiveTabId] = useState("skincare");
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const activeTab =
    skincareCategoryTabs.find(({ id }) => id === activeTabId) ?? skincareCategoryTabs[0];

  if (activeTab === undefined) {
    throw new Error("Missing skincare category rail fixture");
  }

  const visibleProducts = skincareRecommendationProducts.filter(
    ({ categoryIds, chipIds }) =>
      categoryIds.includes(activeTab.id) &&
      (activeChipId === null || chipIds.includes(activeChipId)),
  );

  return (
    <div className="sazo-skincare-catalog" data-testid="skincare-catalog-view">
      <ProductMediaHeader
        dispatch={dispatch}
        onBack={() => {
          dispatch({ type: "navigate", view: "categories" });
        }}
        productInfoRef={agentEntryRef}
        productName={activeTab.label}
      />

      <section
        aria-labelledby="skincare-agent-title"
        className="sazo-skincare-agent-entry"
        ref={agentEntryRef}
      >
        <h1 id="skincare-agent-title">AIに探してもらう</h1>
        <MobileAgentComposer
          entryIntent={null}
          onEntryIntentConsumed={() => undefined}
          onSubmitted={(request) => {
            dispatch({ type: "start-agent-search", request });
          }}
          placeholder="肌悩み・商品名・画像を送る"
          presentation="agent-hub"
          seedRequest={null}
          showHeader={false}
        />
      </section>

      <section
        aria-label="化粧品カテゴリーを選ぶ"
        className="sazo-skincare-category-rail"
        data-testid="skincare-category-rail"
      >
        <div aria-label="中カテゴリー" className="sazo-skincare-category-tabs" role="tablist">
          {skincareCategoryTabs.map((tab) => (
            <button
              aria-controls="skincare-subcategory-chips"
              aria-selected={activeTab.id === tab.id}
              id={`skincare-category-tab-${tab.id}`}
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setActiveChipId(null);
              }}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab.chips.length > 0 ? (
          <div
            aria-labelledby={`skincare-category-tab-${activeTab.id}`}
            className="sazo-skincare-subcategory-chips"
            id="skincare-subcategory-chips"
          >
            {activeTab.chips.map((chip) => (
              <button
                aria-pressed={activeChipId === chip.id}
                key={chip.id}
                onClick={() => {
                  setActiveChipId((current) => (current === chip.id ? null : chip.id));
                }}
                type="button"
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <JplanetRecommendationGrid
        dispatch={dispatch}
        heading="あなたへのおすすめ"
        products={visibleProducts}
        sectionClassName="sazo-skincare-product-recommendations"
        testId="skincare-recommendation-grid"
      />
    </div>
  );
}
