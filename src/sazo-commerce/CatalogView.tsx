import { LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type StatefulViewProps } from "@/sazo-commerce/DirectoryViews";
import { catalogTabs, products } from "@/sazo-commerce/fixtures";
import { ProductCard } from "@/sazo-commerce/ProductCard";

export function CatalogView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const activeTab =
    catalogTabs.find(({ id }) => id === state.selectedTab) ?? catalogTabs[0];

  if (activeTab === undefined) {
    throw new Error("Missing SAZO catalog tab fixture");
  }

  return (
    <div className="sazo-catalog-view" data-view-content="catalog">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.catalog.title")} />
      <div className="sazo-catalog-sticky-controls">
        <div className="sazo-catalog-tabs" role="tablist">
          {catalogTabs.map((tab) => (
            <button
              aria-selected={activeTab.id === tab.id}
              key={tab.id}
              onClick={() => {
                dispatch({ type: "select-tab", tab: tab.id });
              }}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="sazo-catalog-chips">
          {activeTab.chips.map((chip) => (
            <button key={chip} type="button">
              {chip}
            </button>
          ))}
        </div>
      </div>
      <div className="sazo-catalog-toolbar">
        <strong>{t("sazo.views.catalog.allCount")}</strong>
        <div className="sazo-catalog-modes">
          <button
            aria-label={t("sazo.views.catalog.listMode")}
            aria-pressed={state.catalogMode === "list"}
            onClick={() => {
              dispatch({ type: "set-catalog-mode", mode: "list" });
            }}
            type="button"
          >
            <List aria-hidden size={24} />
          </button>
          <button
            aria-label={t("sazo.views.catalog.gridMode")}
            aria-pressed={state.catalogMode === "grid"}
            onClick={() => {
              dispatch({ type: "set-catalog-mode", mode: "grid" });
            }}
            type="button"
          >
            <LayoutGrid aria-hidden size={23} />
          </button>
        </div>
      </div>
      <div className="sazo-catalog-products" data-catalog-mode={state.catalogMode}>
        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
