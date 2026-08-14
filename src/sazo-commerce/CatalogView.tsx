import { LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type StatefulViewProps } from "@/sazo-commerce/DirectoryViews";
import { catalogInventory, catalogTabs } from "@/sazo-commerce/fixtures";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import { ProductCard } from "@/sazo-commerce/ProductCard";

export function CatalogView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const activeTab =
    catalogTabs.find(({ id }) => id === state.catalogTab) ?? catalogTabs[0];

  if (activeTab === undefined) {
    throw new Error("Missing SAZO catalog tab fixture");
  }

  const visibleEntries = catalogInventory.filter(
    ({ chipIds, tabIds }) =>
      tabIds.some((tabId) => tabId === activeTab.id) &&
      (state.catalogChip === null ||
        chipIds.some((chipId) => chipId === state.catalogChip)),
  );

  return (
    <div className="sazo-catalog-view" data-apple-layout="category" data-view-content="catalog">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.catalog.title")} />
      <section
        className="sazo-directory-agent sazo-category-agent"
        data-apple-surface="true"
        data-testid="catalog-agent-entry"
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
      <div className="sazo-catalog-sticky-controls">
        <div className="sazo-catalog-tabs" role="tablist">
          {catalogTabs.map((tab) => (
            <button
              aria-selected={activeTab.id === tab.id}
              key={tab.id}
              onClick={() => {
                dispatch({ type: "select-catalog-tab", tab: tab.id });
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
            <button
              aria-pressed={state.catalogChip === chip.id}
              key={chip.id}
              onClick={() => {
                dispatch({
                  type: "select-catalog-chip",
                  chip: state.catalogChip === chip.id ? null : chip.id,
                });
              }}
              type="button"
            >
              {chip.label}
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
      {state.loadingSurface === "catalog" ? (
        <div
          aria-label="商品を検索しています"
          className="sazo-catalog-loading"
          role="status"
        >
          <span aria-hidden />
          <strong>商品を検索しています</strong>
        </div>
      ) : (
        <div className="sazo-catalog-products" data-catalog-mode={state.catalogMode}>
          {visibleEntries.map(({ product }) => (
            <ProductCard
              key={product.id}
              onOpen={(productId) => {
                dispatch({ type: "open-product", productId });
              }}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}
