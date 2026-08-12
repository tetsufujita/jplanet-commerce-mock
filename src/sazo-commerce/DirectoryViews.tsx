import { useState, type Dispatch } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Heart,
  Home,
  Plane,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  brands,
  catalogInventory,
  categoryDirectory,
  homeCategoryItems,
  type Brand,
} from "@/sazo-commerce/fixtures";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import type { BrandFilterId, SazoAction, SazoState } from "@/sazo-commerce/model";

export interface ViewDispatchProps {
  dispatch: Dispatch<SazoAction>;
}

export interface StatefulViewProps extends ViewDispatchProps {
  state: SazoState;
}

interface ViewHeaderProps extends ViewDispatchProps {
  title: string;
}

export function ViewHeader({ dispatch, title }: ViewHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sazo-view-header">
      <button
        aria-label={t("sazo.views.common.back")}
        className="sazo-view-back"
        data-view-back
        onClick={() => {
          dispatch({ type: "navigate", view: "home" });
        }}
        type="button"
      >
        <ArrowLeft aria-hidden size={24} strokeWidth={2} />
      </button>
      <h1>{title}</h1>
      <div className="sazo-view-header-search" role="search">
        <Search aria-hidden size={19} strokeWidth={2} />
        <span>{t("sazo.search.placeholder")}</span>
      </div>
      <button
        aria-label={t("sazo.views.common.home")}
        className="sazo-view-header-action"
        onClick={() => {
          dispatch({ type: "navigate", view: "home" });
        }}
        type="button"
      >
        <Home aria-hidden size={23} strokeWidth={2} />
      </button>
      <button
        aria-label={t("sazo.views.common.cart")}
        className="sazo-view-header-action"
        onClick={() => {
          dispatch({ type: "navigate", view: "cart" });
        }}
        type="button"
      >
        <ShoppingCart aria-hidden size={23} strokeWidth={2} />
      </button>
    </header>
  );
}

function BrandPreview({ brand }: { brand: Brand }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article className="sazo-brand-row">
      <div className="sazo-brand-row-heading">
        <img
          alt=""
          aria-hidden
          className="sazo-brand-logo"
          height={44}
          src={brand.logo}
          width={44}
        />
        <div>
          <h2>{brand.name}</h2>
          <p>{brand.japaneseName}</p>
        </div>
        <button
          aria-label={
            saved
              ? t("sazo.views.common.savedBrand", { brand: brand.name })
              : t("sazo.views.common.saveBrand", { brand: brand.name })
          }
          aria-pressed={saved}
          className="sazo-brand-save"
          onClick={() => {
            setSaved((current) => !current);
          }}
          type="button"
        >
          <Bookmark aria-hidden fill={saved ? "currentColor" : "none"} size={21} />
        </button>
      </div>
      <div className="sazo-brand-preview" data-fallback={failed}>
        {failed ? (
          Array.from({ length: 4 }, (_, index) => (
            <span aria-hidden className="sazo-brand-skeleton" key={index} />
          ))
        ) : (
          <img
            alt=""
            aria-hidden
            decoding="async"
            height={150}
            loading="lazy"
            onError={() => {
              setFailed(true);
            }}
            src={brand.image}
            width={630}
          />
        )}
      </div>
    </article>
  );
}

interface BrandsViewProps extends ViewDispatchProps {
  state?: SazoState;
}

export function BrandsView({ dispatch, state }: BrandsViewProps) {
  const { t } = useTranslation();
  const filters = [
    "all",
    "apparel",
    "accessories",
    "bags",
    "shoes",
    "gadgets",
    "beauty",
  ] as const satisfies readonly BrandFilterId[];
  const activeFilter = state?.brandFilter ?? "all";
  const visibleBrands =
    activeFilter === "all"
      ? brands
      : brands.filter(({ filters: brandFilters }) =>
          brandFilters.some((filter) => filter === activeFilter),
        );

  return (
    <div className="sazo-directory-view" data-view-content="brands">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.brands.title")} />
      <div className="sazo-directory-content">
        <div aria-label={t("sazo.views.brands.title")} className="sazo-filter-rail">
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              key={filter}
              onClick={() => {
                dispatch({ type: "select-brand-filter", filter });
              }}
              type="button"
            >
              {t(`sazo.views.brands.${filter}`)}
            </button>
          ))}
        </div>
        <div className="sazo-brand-search" role="search">
          <Search aria-hidden size={20} />
          <span>{t("sazo.views.brands.search")}</span>
        </div>
        <p className="sazo-directory-count">{t("sazo.views.brands.total")}</p>
        <div className="sazo-brand-grid">
          {visibleBrands.map((brand) => (
            <BrandPreview brand={brand} key={brand.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoriesView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const selected =
    categoryDirectory.find(({ id }) => id === state.directoryCategory) ??
    categoryDirectory[0];

  if (selected === undefined) {
    throw new Error("Missing SAZO category directory fixture");
  }

  const parentArtwork = homeCategoryItems.find(({ id }) => id === selected.id)?.image;

  return (
    <div className="sazo-directory-view" data-view-content="categories">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.categories.title")} />
      <section
        className="sazo-directory-agent sazo-category-agent"
        data-apple-surface="true"
        data-testid="category-agent-entry"
      >
        <MobileAgentComposer
          entryIntent={null}
          onEntryIntentConsumed={() => undefined}
          seedRequest={null}
        />
      </section>
      {state.loadingSurface === "directory" ? (
        <div
          aria-label="カテゴリーを読み込んでいます"
          className="sazo-directory-loading"
          role="status"
        >
          <span aria-hidden>
            <Plane size={44} strokeWidth={2.8} />
            <Heart fill="currentColor" size={16} strokeWidth={2.8} />
          </span>
        </div>
      ) : (
        <>
          <div className="sazo-category-tabs" role="tablist">
            <button
              aria-selected="false"
              onClick={() => {
                dispatch({ type: "navigate", view: "brands" });
              }}
              role="tab"
              type="button"
            >
              {t("sazo.views.categories.brandsTab")}
            </button>
            <button aria-selected="true" role="tab" type="button">
              {t("sazo.views.categories.categoriesTab")}
            </button>
          </div>
          <div className="sazo-category-layout" data-apple-layout="category">
            <nav
              aria-label={t("sazo.views.categories.title")}
              className="sazo-category-parent-list"
            >
              {categoryDirectory.map((category) => (
                <button
                  aria-current={selected.id === category.id ? "page" : undefined}
                  key={category.id}
                  onClick={() => {
                    dispatch({
                      type: "select-directory-category",
                      category: category.id,
                    });
                  }}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </nav>
            <section className="sazo-category-children">
              <div className="sazo-category-children-heading">
                <h2>{selected.name}</h2>
                <button type="button">{t("sazo.views.categories.more")}</button>
              </div>
              <div className="sazo-category-child-list">
                {selected.children.map((child) => (
                  <button
                    aria-label={child.label}
                    className="sazo-category-child-card"
                    key={child.id}
                    onClick={() => {
                      dispatch({
                        type: "select-directory-category",
                        category: selected.id,
                      });
                      dispatch({ type: "navigate", view: "beauty" });
                    }}
                    type="button"
                  >
                    <span className="sazo-category-child-image">
                      <img
                        alt=""
                        aria-hidden
                        decoding="async"
                        src={
                          catalogInventory.find(({ tabIds }) =>
                            tabIds.some((tabId) => tabId === child.targetCatalogId),
                          )?.product.image ??
                          parentArtwork ??
                          "/sazo-commerce/jplanet-sakura-mark.png"
                        }
                      />
                    </span>
                    <span className="sazo-category-child-copy">
                      <span>{child.label}</span>
                      <ChevronRight aria-hidden size={18} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
