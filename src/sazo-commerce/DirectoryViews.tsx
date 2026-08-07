import { useState, type Dispatch } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Home,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  brands,
  catalogTabs,
  categoryDirectory,
  type Brand,
} from "@/sazo-commerce/fixtures";
import type { SazoAction, SazoState } from "@/sazo-commerce/model";

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
        <span aria-hidden className="sazo-brand-logo">
          {brand.name.slice(0, 1)}
        </span>
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

export function BrandsView({ dispatch }: ViewDispatchProps) {
  const { t } = useTranslation();
  const filters = [
    "all",
    "apparel",
    "accessories",
    "bags",
    "shoes",
    "gadgets",
    "beauty",
  ] as const;

  return (
    <div className="sazo-directory-view" data-view-content="brands">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.brands.title")} />
      <div className="sazo-directory-content">
        <div aria-label={t("sazo.views.brands.title")} className="sazo-filter-rail">
          {filters.map((filter, index) => (
            <button aria-pressed={index === 0} key={filter} type="button">
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
          {brands.map((brand) => (
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
    categoryDirectory.find(({ id }) => id === state.selectedCategory) ??
    categoryDirectory[0];

  if (selected === undefined) {
    throw new Error("Missing SAZO category directory fixture");
  }

  return (
    <div className="sazo-directory-view" data-view-content="categories">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.categories.title")} />
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
      <div className="sazo-category-layout">
        <nav
          aria-label={t("sazo.views.categories.title")}
          className="sazo-category-parent-list"
        >
          {categoryDirectory.map((category) => (
            <button
              aria-current={selected.id === category.id ? "page" : undefined}
              key={category.id}
              onClick={() => {
                dispatch({ type: "select-category", category: category.id });
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
            {selected.children.map((child, index) => (
              <button
                key={child}
                onClick={() => {
                  dispatch({
                    type: "select-tab",
                    tab: catalogTabs[index]?.id ?? catalogTabs[0]?.id ?? "skincare",
                  });
                  dispatch({ type: "navigate", view: "catalog" });
                }}
                type="button"
              >
                <span>{child}</span>
                <ChevronRight aria-hidden size={20} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
