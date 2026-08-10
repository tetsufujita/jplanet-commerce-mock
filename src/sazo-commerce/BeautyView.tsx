import { useEffect, useState, type Dispatch, type ReactElement } from "react";
import {
  ArrowRight,
  ChevronRight,
  Globe2,
  ImagePlus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { beautyCategories, beautyProductsByCategory, beautyTrendKeywords, beautyTrendProducts, type BeautyCategoryId, type BeautyProduct } from "@/sazo-commerce/beautyFixtures";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import type { SazoAction } from "@/sazo-commerce/model";

export interface BeautyViewProps {
  dispatch: Dispatch<SazoAction>;
}

export function BeautyView({ dispatch }: BeautyViewProps): ReactElement {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
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

  const normalizedQuery = submittedQuery.toLocaleLowerCase("ja-JP");
  const visibleProducts = beautyProductsByCategory[activeCategory].filter(
    ({ brand, keywords, name }) =>
      normalizedQuery.length === 0 ||
      [brand, name, ...keywords]
        .join(" ")
        .toLocaleLowerCase("ja-JP")
        .includes(normalizedQuery),
  );

  return (
    <main className="sazo-beauty" data-beauty-view>
      <BeautyHeader dispatch={dispatch} />
      <section className="sazo-beauty-hero" data-beauty-section="hero">
        <span className="sazo-beauty-store-badge">J-Beauty</span>
        <h1>これからは<br />J-Planetで探す</h1>
        <p>日本で人気のJ-ビューティーを、今すぐ見つけて注文しよう！</p>
        <BeautySearch
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={() => {
            setSubmittedQuery(inputValue.trim());
          }}
        />
        <BeautySearchGuidance />
      </section>

      <section className="sazo-beauty-discovery" data-beauty-section="discovery">
        <h2>日本のショップから<br />欲しい商品を探してみよう！</h2>
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

function BeautyHeader({ dispatch }: BeautyViewProps): ReactElement {
  const focusSearch = () => {
    document.getElementById("sazo-beauty-search-input")?.focus();
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
        <strong className="sazo-beauty-wordmark">BEAUTY</strong>
        <div className="sazo-beauty-header-actions">
          <button aria-label="言語" type="button"><Globe2 aria-hidden /></button>
          <button aria-label="検索へ移動" onClick={focusSearch} type="button"><Search aria-hidden /></button>
          <button aria-label="カート" type="button"><ShoppingCart aria-hidden /></button>
        </div>
      </div>
      <nav aria-label="BEAUTYサブメニュー" className="sazo-beauty-header-nav">
        <button aria-current="page" type="button">コスメ</button>
        <button type="button">ヘルプ</button>
        <button type="button">お知らせ</button>
      </nav>
    </header>
  );
}

function BeautySearch(props: {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}): ReactElement {
  return (
    <form
      className="sazo-beauty-search"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
      role="search"
    >
      <label className="sazo-visually-hidden" htmlFor="sazo-beauty-search-input">
        BEAUTYの商品を検索
      </label>
      <Search aria-hidden className="sazo-beauty-search-icon" />
      <input
        id="sazo-beauty-search-input"
        onChange={(event) => {
          props.onInputChange(event.target.value);
        }}
        placeholder="キーワードまたはURLを入力"
        type="search"
        value={props.inputValue}
      />
      <button aria-label="検索する" type="submit">
        <ArrowRight aria-hidden />
      </button>
    </form>
  );
}

function BeautySearchGuidance(): ReactElement {
  return (
    <div className="sazo-beauty-search-guidance">
      <svg aria-hidden focusable="false" viewBox="0 0 140 92">
        <path d="M114 84 C86 72 74 92 50 87 C17 82 8 61 15 39 C18 29 33 30 36 20" />
        <path d="M21 25 L36 20 L38 36" />
      </svg>
      <p>気になる商品名やURLを入力してね</p>
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
