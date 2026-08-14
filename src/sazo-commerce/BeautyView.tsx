import { useEffect, useState, type Dispatch, type ReactElement } from "react";
import {
  ChevronRight,
  Globe2,
  ImagePlus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { beautyCategories, beautyProductsByCategory, beautyTrendKeywords, beautyTrendProducts, type BeautyCategoryId, type BeautyProduct } from "@/sazo-commerce/beautyFixtures";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import type { DirectoryCategoryId, SazoAction } from "@/sazo-commerce/model";

interface CategoryAgentCopy {
  badge: string;
  description: string;
  discoveryTitle: string;
  guidance: string;
  nav: readonly [string, string, string];
  wordmark: string;
}

const categoryAgentCopy: Record<DirectoryCategoryId, CategoryAgentCopy> = {
  beauty: {
    badge: "J-Beauty",
    description: "日本で人気のビューティーアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のビューティーショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、ビューティー商品をリアルタイム検索！",
    nav: ["コスメ", "ヘルプ", "お知らせ"],
    wordmark: "BEAUTY",
  },
  ladies: {
    badge: "J-Fashion",
    description: "日本で人気のレディースアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のファッションショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、レディース商品をリアルタイム検索！",
    nav: ["レディース", "ブランド", "お知らせ"],
    wordmark: "FASHION",
  },
  mens: {
    badge: "J-Mens",
    description: "日本で人気のメンズアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のメンズショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、メンズ商品をリアルタイム検索！",
    nav: ["メンズ", "ブランド", "お知らせ"],
    wordmark: "FASHION",
  },
  kids: {
    badge: "J-Kids",
    description: "日本で人気のキッズアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のキッズショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、キッズ商品をリアルタイム検索！",
    nav: ["キッズ", "限定", "お知らせ"],
    wordmark: "KIDS",
  },
  living: {
    badge: "J-Living",
    description: "日本で人気の暮らしのアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本の暮らしのショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、暮らしの商品をリアルタイム検索！",
    nav: ["インテリア", "キッチン", "お知らせ"],
    wordmark: "LIVING",
  },
  food: {
    badge: "J-Food",
    description: "日本で人気の食品やおやつを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本の食品ショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、日本の食品をリアルタイム検索！",
    nav: ["食品", "おやつ", "お知らせ"],
    wordmark: "FOOD",
  },
  pets: {
    badge: "J-Pets",
    description: "日本で人気のペットアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のペットショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、ペット商品をリアルタイム検索！",
    nav: ["ペット", "ケア用品", "お知らせ"],
    wordmark: "PETS",
  },
  appliances: {
    badge: "J-Select",
    description: "日本で人気の家電やガジェットを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本の家電ショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、家電をリアルタイム検索！",
    nav: ["家電", "ガジェット", "お知らせ"],
    wordmark: "SELECT",
  },
  hobby: {
    badge: "J-Hobby",
    description: "日本で人気のホビーアイテムを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のホビーショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、ホビー商品をリアルタイム検索！",
    nav: ["ホビー", "限定", "お知らせ"],
    wordmark: "HOBBY",
  },
  shoes: {
    badge: "J-Sneakers",
    description: "日本で人気のスニーカーを、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のスニーカーショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、スニーカーをリアルタイム検索！",
    nav: ["スニーカー", "ブランド", "お知らせ"],
    wordmark: "SNEAKERS",
  },
  electronics: {
    badge: "J-Game",
    description: "日本で人気のゲームや家電を、今すぐ見つけて注文しよう！",
    discoveryTitle: "日本のゲーム・家電ショップで欲しい商品を探してみよう！",
    guidance: "J-Planetで、ゲームと家電をリアルタイム検索！",
    nav: ["ゲーム", "家電", "お知らせ"],
    wordmark: "GAME",
  },
};

export interface BeautyViewProps {
  dispatch: Dispatch<SazoAction>;
  categoryId?: DirectoryCategoryId;
}

export function BeautyView({ dispatch, categoryId = "beauty" }: BeautyViewProps): ReactElement {
  const copy = categoryAgentCopy[categoryId];
  const [activeCategory, setActiveCategory] = useState<BeautyCategoryId>("skincare");
  const [pendingCategory, setPendingCategory] = useState<BeautyCategoryId | null>(null);

  useEffect(() => {
    if (pendingCategory === null) {
      return undefined;
    }
    const nextCategory = pendingCategory;
    const timeout = window.setTimeout(() => {
      setActiveCategory(nextCategory);
      setPendingCategory(null);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pendingCategory]);

  const visibleProducts = beautyProductsByCategory[activeCategory];

  return (
    <main className="sazo-beauty" data-beauty-view data-category-id={categoryId}>
      <BeautyHeader copy={copy} dispatch={dispatch} />
      <section className="sazo-beauty-hero" data-beauty-section="hero">
        <span className="sazo-beauty-store-badge">{copy.badge}</span>
        <h1>これからは<br />J-Planetで探す</h1>
        <p>{copy.description}</p>
        <section
          className="sazo-category-agent"
          data-category-id={categoryId}
          data-testid="category-agent-intro"
        >
          <MobileAgentComposer
            entryIntent={null}
            onEntryIntentConsumed={() => undefined}
            onSubmitted={(request) => {
              dispatch({ type: "start-agent-search", request });
            }}
            seedRequest={null}
          />
        </section>
        <BeautySearchGuidance text={copy.guidance} />
      </section>

      <section className="sazo-beauty-discovery" data-beauty-section="discovery">
        <h2>{copy.discoveryTitle}</h2>
        <BeautyCategoryRail
          activeCategory={pendingCategory ?? activeCategory}
          onSelect={setPendingCategory}
        />
        <BeautyProductRail
          dispatch={dispatch}
          loadingCategory={pendingCategory}
          products={visibleProducts}
        />
      </section>

      <BeautyTrendList dispatch={dispatch} />
    </main>
  );
}

function BeautyHeader({ copy, dispatch }: BeautyViewProps & { copy: CategoryAgentCopy }): ReactElement {
  const focusSearch = () => {
    document.querySelector<HTMLTextAreaElement>(".sazo-category-agent textarea")?.focus();
  };

  return (
    <header className="sazo-beauty-header" data-beauty-header>
      <div className="sazo-beauty-header-main">
        <button
          aria-label="ホームへ戻る"
          className="sazo-beauty-logo"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <JplanetLogo />
          <span>J-Planet</span>
        </button>
        <strong className="sazo-beauty-wordmark">{copy.wordmark}</strong>
        <div className="sazo-beauty-header-actions">
          <button aria-label="言語" type="button"><Globe2 aria-hidden /></button>
          <button aria-label="検索へ移動" onClick={focusSearch} type="button"><Search aria-hidden /></button>
          <button
            aria-label="カート"
            onClick={() => {
              dispatch({ type: "navigate", view: "cart" });
            }}
            type="button"
          >
            <ShoppingCart aria-hidden />
          </button>
        </div>
      </div>
      <nav aria-label={`${copy.wordmark}サブメニュー`} className="sazo-beauty-header-nav">
        {copy.nav.map((label, index) => (
          <button aria-current={index === 0 ? "page" : undefined} key={label} type="button">
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function BeautySearchGuidance({ text }: { text: string }): ReactElement {
  return (
    <div className="sazo-beauty-search-guidance">
      <svg aria-hidden focusable="false" viewBox="0 0 140 92">
        <path d="M114 84 C86 72 74 92 50 87 C17 82 8 61 15 39 C18 29 33 30 36 20" />
        <path d="M21 25 L36 20 L38 36" />
      </svg>
      <p>{text}</p>
    </div>
  );
}

function BeautyCategoryRail({
  activeCategory,
  onSelect,
}: {
  activeCategory: BeautyCategoryId;
  onSelect: (category: BeautyCategoryId) => void;
}): ReactElement {
  return (
    <div className="sazo-beauty-category-rail" data-beauty-category-rail>
      {beautyCategories.map((category) => (
        <button
          aria-pressed={activeCategory === category.id}
          key={category.id}
          onClick={() => {
            onSelect(category.id);
          }}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

function BeautyProductRail({
  dispatch,
  loadingCategory,
  products,
}: {
  dispatch: Dispatch<SazoAction>;
  loadingCategory: BeautyCategoryId | null;
  products: readonly BeautyProduct[];
}): ReactElement {
  if (loadingCategory !== null) {
    const label = beautyCategories.find(({ id }) => id === loadingCategory)?.label ?? loadingCategory;
    return <p aria-label={`${label}の商品を読み込んでいます`} className="sazo-beauty-loading" role="status">{label}の商品を読み込んでいます</p>;
  }

  if (products.length === 0) {
    return <p className="sazo-beauty-empty">該当する商品がありません</p>;
  }

  return (
    <div className="sazo-beauty-product-rail" data-testid="sazo-beauty-product-rail" data-beauty-product-rail>
      {products.map((product) => (
        <article className="sazo-beauty-product-card" key={product.id}>
          <button
            aria-label={`商品を開く ${product.name}`}
            className="sazo-beauty-product-open"
            onClick={() => {
              dispatch({ type: "open-product", productId: product.detailProductId });
            }}
            type="button"
          >
            <BeautyProductImage product={product} />
            <span className="sazo-beauty-product-brand">{product.brand}</span>
            <strong>{product.name}</strong>
            <b>{product.price}</b>
          </button>
        </article>
      ))}
    </div>
  );
}

function BeautyProductImage({ product }: { product: BeautyProduct }): ReactElement {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span aria-label={`${product.name}の画像`} className="sazo-beauty-image-fallback" data-testid="sazo-beauty-image-fallback" role="img"><ImagePlus aria-hidden /></span>;
  }

  return (
    <span className="sazo-beauty-product-image">
      <img
        alt={product.name}
        onError={() => {
          setFailed(true);
        }}
        src={product.image}
      />
    </span>
  );
}

function BeautyTrendList({ dispatch }: BeautyViewProps): ReactElement {
  return (
    <section className="sazo-beauty-trends" data-beauty-section="trends">
      <div className="sazo-beauty-section-heading">
        <h2>今話題のJ-Beautyトレンド</h2>
        <button type="button">もっと見る <ChevronRight aria-hidden /></button>
      </div>
      <ul className="sazo-beauty-trend-list">
        {beautyTrendKeywords.map((keyword, index) => (
          <li aria-label={`トレンドキーワード ${keyword}`} key={keyword}>
            <span>{index + 1}</span>
            <button
              onClick={() => {
                dispatch({ type: "open-product", productId: beautyTrendProducts[index % beautyTrendProducts.length]?.detailProductId ?? "p01" });
              }}
              type="button"
            >
              {keyword}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
