import { useState, type Dispatch } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MessageCircle,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  agentCommonSearchKeywords,
  agentHowItWorksSteps,
  agentRecentSearches,
  agentRecentViewedProducts,
} from "@/sazo-commerce/agentHubFixtures";
import { JplanetRecommendationGrid } from "@/sazo-commerce/HomeView";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";
import type {
  AgentEntryIntent,
  AgentHubScenario,
  SazoAction,
} from "@/sazo-commerce/model";

export interface MobileAgentHubViewProps {
  dispatch: Dispatch<SazoAction>;
  entryIntent: AgentEntryIntent | null;
  scenario?: AgentHubScenario;
}

export function MobileAgentHubView({
  dispatch,
  entryIntent,
  scenario = "normal",
}: MobileAgentHubViewProps) {
  const { t } = useTranslation();
  const noSavedAgentActivity = scenario === "empty";
  const [recentSearches, setRecentSearches] = useState(() =>
    noSavedAgentActivity ? [] : agentRecentSearches,
  );
  const [recentProductsExpanded, setRecentProductsExpanded] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(noSavedAgentActivity);
  const recentProducts = noSavedAgentActivity ? [] : agentRecentViewedProducts;
  const visibleRecentProducts = recentProductsExpanded
    ? recentProducts
    : recentProducts.slice(0, 2);
  const resolveProduct = (productId: string) => {
    dispatch({ type: "open-product", productId });
  };

  return (
    <div
      className="sazo-agent-hub sazo-agent-hub--search"
      data-apple-layout="agent"
      data-mobile-agent-hub
      data-scenario={scenario}
    >
      <header className="sazo-agent-hub-header">
        <button
          aria-label={t("sazo.brand.homeLabel")}
          className="sazo-agent-hub-home"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <JplanetLogo />
        </button>
        <h1>エージェント</h1>
        <button
          aria-label={t("sazo.actions.cart")}
          className="sazo-agent-hub-cart"
          onClick={() => {
            dispatch({ type: "navigate", view: "cart" });
          }}
          type="button"
        >
          <ShoppingCart aria-hidden size={22} strokeWidth={1.9} />
        </button>
        <button
          aria-label={t("sazo.agentHub.chat")}
          className="sazo-agent-hub-chat"
          onClick={() => {
            dispatch({ type: "open-chat" });
          }}
          type="button"
        >
          <MessageCircle aria-hidden size={24} strokeWidth={1.8} />
        </button>
      </header>

      <section data-section="agent-search" data-testid="agent-hub-section">
        <div className="sazo-agent-hub-search-intro">
          <img
            alt=""
            aria-hidden="true"
            data-jplanet-sakura-mark
            height={42}
            src="/sazo-commerce/jplanet-sakura-mark.png"
            width={42}
          />
          <div>
            <h2>購入エージェント</h2>
            <p>商品を送るだけで、購入判断まで。</p>
          </div>
        </div>
        <MobileAgentComposer
          entryIntent={entryIntent}
          onEntryIntentConsumed={() => {
            dispatch({ type: "consume-agent-entry-intent" });
          }}
          onSubmitted={() => {
            const product = agentRecentViewedProducts.at(0);

            if (product !== undefined) {
              resolveProduct(product.id);
            }
          }}
          presentation="agent-hub"
          seedRequest={null}
          showHeader={false}
        />
        <p className="sazo-agent-hub-search-note">URLは商品ページを直接開きます</p>
      </section>

      <section data-section="recent-searches" data-testid="agent-hub-section">
        <header>
          <h2>最近の検索</h2>
          <button
            aria-label="検索履歴を全消去"
            disabled={recentSearches.length === 0}
            onClick={() => {
              setRecentSearches([]);
            }}
            type="button"
          >
            <Trash2 aria-hidden size={18} strokeWidth={1.9} />
          </button>
        </header>
        <ul aria-label="最近の検索" className="sazo-agent-hub-search-chips">
          {recentSearches.map((search) => (
            <li key={search.id}>
              <span>{search.label}</span>
              <button
                aria-label={`${search.label}を削除`}
                onClick={() => {
                  setRecentSearches((searches) =>
                    searches.filter((item) => item.id !== search.id),
                  );
                }}
                type="button"
              >
                <X aria-hidden size={13} strokeWidth={2.1} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section data-section="recent-products" data-testid="agent-hub-section">
        <header>
          <h2>最近確認した商品</h2>
          {recentProducts.length > 2 ? (
            <button
              aria-expanded={recentProductsExpanded}
              className="sazo-agent-hub-recent-products-toggle"
              onClick={() => {
                setRecentProductsExpanded((expanded) => !expanded);
              }}
              type="button"
            >
              {recentProductsExpanded ? "閉じる" : `すべて見る（${recentProducts.length}件）`}
            </button>
          ) : null}
        </header>
        {visibleRecentProducts.length === 0 ? (
          <p className="sazo-agent-hub-recent-products-empty">
            まだ確認した商品はありません
          </p>
        ) : (
          <ol className="sazo-agent-hub-recent-product-list">
            {visibleRecentProducts.map((product) => (
              <li key={product.id}>
                <img alt="" src={product.image} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </div>
                <button
                  aria-label={`${product.name}の商品を見る`}
                  onClick={() => {
                    resolveProduct(product.id);
                  }}
                  type="button"
                >
                  商品を見る
                  <ChevronRight aria-hidden size={17} strokeWidth={2.1} />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section data-section="common-searches" data-testid="agent-hub-section">
        <header>
          <h2>よく検索されるキーワード</h2>
        </header>
        <ul aria-label="よく検索されるキーワード" className="sazo-agent-hub-common-search-chips">
          {agentCommonSearchKeywords.map((keyword) => (
            <li key={keyword.id}>
              <button
                onClick={() => {
                  resolveProduct(keyword.productId);
                }}
                type="button"
              >
                {keyword.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section data-section="how-it-works" data-testid="agent-hub-section">
        <button
          aria-expanded={howItWorksOpen}
          className="sazo-agent-hub-how-it-works-toggle"
          onClick={() => {
            setHowItWorksOpen((open) => !open);
          }}
          type="button"
        >
          <span>このエージェントの使い方</span>
          {howItWorksOpen ? (
            <ChevronUp aria-hidden size={18} strokeWidth={2.2} />
          ) : (
            <ChevronDown aria-hidden size={18} strokeWidth={2.2} />
          )}
        </button>
        {howItWorksOpen ? (
          <ol className="sazo-agent-hub-how-it-works-list">
            {agentHowItWorksSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
      </section>

      <JplanetRecommendationGrid
        dispatch={dispatch}
        heading="いま人気の商品"
        productLimit={4}
        sectionClassName="sazo-agent-hub-popular-products"
        testId="agent-popular-products"
      />
    </div>
  );
}
