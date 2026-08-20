import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  CircleHelp,
  Grid2X2,
  List,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState, type Dispatch } from "react";
import {
  formatBrl,
  jplanetBrandDirectory,
  nikeBrandProducts,
  nikeBrandSections,
  type BrandProduct,
  type BrandProductCategory,
  type JplanetBrandDirectoryCategory,
  type JplanetBrandDirectoryItem,
} from "@/sazo-commerce/fixtures";
import type { SazoAction, SazoState } from "@/sazo-commerce/model";

type BrandDetailTab = "all" | BrandProductCategory;
type ProductPresentation = "grid" | "list";

const directoryCategories: readonly {
  id: "all" | JplanetBrandDirectoryCategory;
  label: string;
}[] = [
  { id: "all", label: "全体" },
  { id: "apparel", label: "アパレル" },
  { id: "accessories", label: "ファッション小物" },
  { id: "sneakers", label: "スニーカー" },
  { id: "cosmetics", label: "コスメ" },
  { id: "electronics", label: "家電" },
  { id: "hobby", label: "ホビー" },
];

const detailTabs: readonly { id: BrandDetailTab; label: string }[] = [
  { id: "all", label: "全体" },
  { id: "general", label: "最安値" },
  { id: "limited", label: "限定" },
  { id: "flea", label: "フリマ" },
  { id: "cosmetics", label: "コスメ" },
  { id: "kpop", label: "K-POP" },
];

function BrandCommerceHeader({
  cartCount,
  dispatch,
  onBack,
  onSearchChange,
  searchLabel = "ブランド名・商品名を検索",
  searchPlaceholder = "ブランド名・商品名を検索",
  searchValue,
}: {
  cartCount: number;
  dispatch: Dispatch<SazoAction>;
  onBack: () => void;
  onSearchChange?: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
}) {
  return (
    <header className="jplanet-brand-header sazo-unified-mobile-header">
      <button aria-label="戻る" className="jplanet-brand-header-icon" onClick={onBack} type="button">
        <ArrowLeft aria-hidden size={24} strokeWidth={2} />
      </button>
      <label className="jplanet-brand-header-search">
        <Search aria-hidden size={19} strokeWidth={2} />
        <input
          aria-label={searchLabel}
          defaultValue={onSearchChange === undefined ? searchValue : undefined}
          onChange={onSearchChange === undefined ? undefined : (event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={onSearchChange === undefined ? undefined : searchValue}
        />
      </label>
      <button
        aria-label="カート"
        className="jplanet-brand-header-icon jplanet-brand-header-cart"
        onClick={() => dispatch({ type: "navigate", view: "cart" })}
        type="button"
      >
        <ShoppingCart aria-hidden size={24} strokeWidth={2} />
        <span aria-hidden>{cartCount}</span>
      </button>
    </header>
  );
}

function BrandSaveButton({
  brandId,
  dispatch,
  saved,
}: {
  brandId: string;
  dispatch: Dispatch<SazoAction>;
  saved: boolean;
}) {
  return (
    <button
      aria-label={saved ? "保存を解除" : "ブランドを保存"}
      aria-pressed={saved}
      className="jplanet-brand-save"
      onClick={(event) => {
        event.stopPropagation();
        dispatch({ type: "toggle-saved-brand", brandId });
      }}
      type="button"
    >
      <Bookmark aria-hidden fill={saved ? "currentColor" : "none"} size={22} strokeWidth={1.8} />
    </button>
  );
}

function BrandDirectoryRow({
  brand,
  dispatch,
  saved,
}: {
  brand: JplanetBrandDirectoryItem;
  dispatch: Dispatch<SazoAction>;
  saved: boolean;
}) {
  const openBrand = () => {
    dispatch({ type: "open-brand-detail" });
  };

  return (
    <article className="jplanet-brand-directory-row">
      <button aria-label={`${brand.name}を開く`} className="jplanet-brand-directory-main" onClick={openBrand} type="button">
        <div className="jplanet-brand-directory-heading">
          {brand.logo === undefined ? (
            <span aria-hidden className="jplanet-brand-typography-mark">
              {brand.name.slice(0, 1)}
            </span>
          ) : (
            <img alt="" aria-hidden decoding="async" src={brand.logo} />
          )}
          <span>
            <strong>{brand.name}</strong>
            <small>{brand.nameJa}</small>
          </span>
        </div>
        <div className="jplanet-brand-directory-previews">
          {brand.previewProducts.map((image, index) => (
            <img
              alt=""
              aria-hidden
              decoding="async"
              key={`${brand.id}-${image}`}
              loading={index > 0 ? "lazy" : undefined}
              src={image}
            />
          ))}
          <span className="jplanet-brand-directory-more">もっと見る <ChevronRight aria-hidden size={17} /></span>
        </div>
      </button>
      <BrandSaveButton brandId={brand.id} dispatch={dispatch} saved={saved} />
    </article>
  );
}

export function JplanetBrandsView({
  dispatch,
  state,
}: {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}) {
  const [activeCategory, setActiveCategory] = useState<(typeof directoryCategories)[number]["id"]>(
    "all",
  );
  const [brandQuery, setBrandQuery] = useState("");
  const normalizedQuery = brandQuery.trim().toLocaleLowerCase("ja-JP");
  const visibleBrands = jplanetBrandDirectory.filter((brand) => {
    const categoryMatches = activeCategory === "all" || brand.category === activeCategory;
    const searchMatches =
      normalizedQuery.length === 0 ||
      [brand.name, brand.nameJa].some((value) =>
        value.toLocaleLowerCase("ja-JP").includes(normalizedQuery),
      );

    return categoryMatches && searchMatches;
  });

  return (
    <section className="jplanet-brand-page" data-view-content="brands">
      <BrandCommerceHeader
        cartCount={state.cartItems.length}
        dispatch={dispatch}
        onBack={() => dispatch({ type: "navigate", view: "home" })}
        onSearchChange={setBrandQuery}
        searchLabel="ブランド・商品を検索"
        searchPlaceholder="ブランド・商品を検索"
        searchValue={brandQuery}
      />
      <main className="jplanet-brand-directory-content">
        <div aria-label="ブランドカテゴリ" className="jplanet-brand-category-rail">
          {directoryCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category.id}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
        <p className="jplanet-brand-directory-count">{directoryCategories.find((category) => category.id === activeCategory)?.label} {visibleBrands.length}件</p>
        {visibleBrands.length === 0 ? (
          <div className="jplanet-brand-empty" role="status">
            <p>該当するブランドはありません</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setBrandQuery("");
              }}
              type="button"
            >
              検索条件をクリア
            </button>
          </div>
        ) : (
          <div className="jplanet-brand-directory-list">
            {visibleBrands.map((brand) => (
              <BrandDirectoryRow
                brand={brand}
                dispatch={dispatch}
                key={brand.id}
                saved={state.savedBrandIds.includes(brand.id)}
              />
            ))}
          </div>
        )}
      </main>
    </section>
  );
}

function ProductSaveButton({ saved, setSaved }: { saved: boolean; setSaved: () => void }) {
  return (
    <button
      aria-label={saved ? "商品を保存解除" : "商品を保存"}
      aria-pressed={saved}
      className="jplanet-brand-product-save"
      onClick={(event) => {
        event.stopPropagation();
        setSaved();
      }}
      type="button"
    >
      <Bookmark aria-hidden fill={saved ? "currentColor" : "none"} size={19} strokeWidth={1.9} />
    </button>
  );
}

function BrandProductCard({
  dispatch,
  product,
}: {
  dispatch: Dispatch<SazoAction>;
  product: BrandProduct;
}) {
  const [saved, setSaved] = useState(product.isSaved);

  return (
    <article className="jplanet-brand-product-card">
      <button
        aria-label={`${product.name}の商品詳細を開く`}
        className="jplanet-brand-product-open"
        onClick={() => dispatch({ type: "open-product", productId: product.id })}
        type="button"
      >
        <span className="jplanet-brand-product-image">
          {product.category === "limited" ? <i>限定</i> : null}
          <img alt={product.name} decoding="async" loading="lazy" src={product.image} />
        </span>
        <small>{product.source}</small>
        <strong>{product.name}</strong>
        {product.condition === undefined ? null : (
          <em>{product.condition === "new" ? "新品" : product.condition === "unused" ? "未使用" : "中古"}</em>
        )}
        <b>{formatBrl(product.priceBrl)}</b>
      </button>
      <ProductSaveButton saved={saved} setSaved={() => setSaved((current) => !current)} />
    </article>
  );
}

function MoreProductsTile({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <button aria-label={`${title}をもっと見る`} className="jplanet-brand-more-products" onClick={onClick} type="button">
      <span>もっと見る</span>
      <ChevronRight aria-hidden size={22} />
    </button>
  );
}

function BrandSectionRail({
  dispatch,
  onMore,
  section,
}: {
  dispatch: Dispatch<SazoAction>;
  onMore: () => void;
  section: (typeof nikeBrandSections)[number];
}) {
  return (
    <section className="jplanet-brand-product-section">
      <header>
        <h2>
          {section.title}
          {section.category === "limited" || section.category === "flea" ? (
            <CircleHelp aria-label="商品情報" size={18} strokeWidth={1.8} />
          ) : null}
        </h2>
        <button onClick={onMore} type="button">
          もっと見る <ChevronRight aria-hidden size={18} />
        </button>
      </header>
      {section.products.length === 0 ? (
        <div className="jplanet-brand-section-empty">現在表示できる商品はありません</div>
      ) : (
        <div className="jplanet-brand-product-rail">
          {section.products.slice(0, 3).map((product) => (
            <BrandProductCard dispatch={dispatch} key={product.id} product={product} />
          ))}
          <MoreProductsTile onClick={onMore} title={section.title} />
        </div>
      )}
    </section>
  );
}

function BrandDetailLoading() {
  return (
    <div aria-label="ブランド商品を読み込んでいます" className="jplanet-brand-loading" role="status">
      <img alt="" aria-hidden src="/sazo-commerce/jplanet-sakura-mark.png" />
      <div>
        <span />
        <span />
      </div>
    </div>
  );
}

export function JplanetBrandDetailView({
  dispatch,
  state,
}: {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}) {
  const [activeTab, setActiveTab] = useState<BrandDetailTab>("all");
  const [presentation, setPresentation] = useState<ProductPresentation>("grid");

  useEffect(() => {
    if (!state.brandLoading) {
      return undefined;
    }

    const timer = window.setTimeout(() => dispatch({ type: "brand-loaded" }), 180);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.brandLoading]);

  const selectTab = (tab: BrandDetailTab) => {
    setActiveTab(tab);
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const activeProducts =
    activeTab === "all"
      ? nikeBrandProducts
      : nikeBrandProducts.filter((product) => product.category === activeTab);
  const orderedProducts =
    activeTab === "general" ? [...activeProducts].sort((left, right) => left.priceBrl - right.priceBrl) : activeProducts;

  return (
    <section className="jplanet-brand-page jplanet-brand-detail" data-view-content="brand-detail">
      <BrandCommerceHeader
        cartCount={state.cartItems.length}
        dispatch={dispatch}
        onBack={() => dispatch({ type: "navigate", view: "brands" })}
        searchValue="NIKE"
      />
      {state.brandLoading ? (
        <BrandDetailLoading />
      ) : (
        <>
          <nav aria-label="NIKE商品カテゴリ" className="jplanet-brand-detail-tabs" role="tablist">
            {detailTabs.map((tab) => (
              <button
                aria-selected={activeTab === tab.id}
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <main className="jplanet-brand-detail-content">
            {activeTab === "all" ? (
              <>
                <p className="jplanet-brand-product-count">全体{nikeBrandProducts.length}件</p>
                {nikeBrandSections.map((section) => (
                  <BrandSectionRail
                    dispatch={dispatch}
                    key={section.id}
                    onMore={() => selectTab(section.category)}
                    section={section}
                  />
                ))}
              </>
            ) : activeProducts.length === 0 ? (
              <div className="jplanet-brand-empty jplanet-brand-product-empty" role="status">
                <p>現在表示できる商品はありません</p>
                <button onClick={() => selectTab("all")} type="button">
                  ほかのカテゴリを見る
                </button>
              </div>
            ) : (
              <>
                {activeTab === "flea" ? (
                  <section className="jplanet-brand-flea-note">
                    <strong>日本のフリマ・中古商品</strong>
                    <p>商品の状態と販売元を確認して表示しています。</p>
                  </section>
                ) : null}
                <div className="jplanet-brand-grid-toolbar">
                  <p>{detailTabs.find((tab) => tab.id === activeTab)?.label} {orderedProducts.length}件</p>
                  {activeTab === "general" ? (
                    <div aria-label="商品表示形式" role="group">
                      <button
                        aria-label="グリッド表示"
                        aria-pressed={presentation === "grid"}
                        onClick={() => setPresentation("grid")}
                        type="button"
                      >
                        <Grid2X2 aria-hidden size={19} />
                      </button>
                      <button
                        aria-label="リスト表示"
                        aria-pressed={presentation === "list"}
                        onClick={() => setPresentation("list")}
                        type="button"
                      >
                        <List aria-hidden size={20} />
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="jplanet-brand-product-grid" data-presentation={presentation}>
                  {orderedProducts.map((product) => (
                    <BrandProductCard dispatch={dispatch} key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </main>
        </>
      )}
    </section>
  );
}
