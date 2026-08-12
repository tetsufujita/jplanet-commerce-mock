import { useRef, useState, type Dispatch } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  agentHubPopularTopics,
  agentHubRecentConsultations,
  agentHubRecentProducts,
} from "@/sazo-commerce/agentHubFixtures";
import {
  MobileAgentComposer,
  type AgentComposerSeedRequest,
} from "@/sazo-commerce/MobileAgentComposer";
import type { AgentEntryIntent, SazoAction } from "@/sazo-commerce/model";

export interface MobileAgentHubViewProps {
  dispatch: Dispatch<SazoAction>;
  entryIntent: AgentEntryIntent | null;
}

export function MobileAgentHubView({ dispatch, entryIntent }: MobileAgentHubViewProps) {
  const { t } = useTranslation();
  const composerRef = useRef<HTMLDivElement>(null);
  const [seedRequest, setSeedRequest] = useState<AgentComposerSeedRequest | null>(null);
  const [showConsultations, setShowConsultations] = useState(true);
  const [showProducts, setShowProducts] = useState(true);

  const focusComposer = () => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    composerRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const navigateHome = () => {
    dispatch({ type: "navigate", view: "home" });
  };

  return (
    <div className="sazo-agent-hub" data-apple-layout="agent" data-mobile-agent-hub>
      <header className="sazo-agent-hub-header">
        <button onClick={navigateHome} type="button">
          <ArrowLeft aria-hidden size={20} />
          <span>{t("sazo.agentHub.backHome")}</span>
        </button>
        <button
          aria-label={t("sazo.agentHub.launcherLabel")}
          className="sazo-agent-hub-launcher"
          onClick={() => {
            focusComposer();
          }}
          type="button"
        >
          <Sparkles aria-hidden size={20} />
          <span>{t("sazo.agentHub.launcher")}</span>
        </button>
        <button
          aria-label={t("sazo.brand.homeLabel")}
          onClick={navigateHome}
          type="button"
        >
          {t("sazo.brand.wordmark")}
        </button>
        <button aria-label={t("sazo.actions.cart")} type="button">
          <ShoppingCart aria-hidden size={20} />
        </button>
      </header>

      <section data-apple-surface="true" data-section="composer" data-testid="agent-hub-section">
        <MobileAgentComposer
          entryIntent={entryIntent}
          onEntryIntentConsumed={() => {
            dispatch({ type: "consume-agent-entry-intent" });
          }}
          ref={composerRef}
          seedRequest={seedRequest}
        />
      </section>

      <section data-section="consultations" data-testid="agent-hub-section">
        <header>
          <h2>{t("sazo.agentHub.recentConsultations")}</h2>
          <button
            aria-label={t("sazo.agentHub.clearConsultations")}
            onClick={() => {
              setShowConsultations(false);
            }}
            type="button"
          >
            <X aria-hidden size={18} />
          </button>
        </header>
        {showConsultations ? (
          <ol>
            {agentHubRecentConsultations.map((consultation) => (
              <li className="sazo-agent-hub-consultation-row" key={consultation.id}>
                {consultation.label}
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section data-section="recent-products" data-testid="agent-hub-section">
        <header>
          <h2>{t("sazo.agentHub.recentProducts")}</h2>
          <button
            aria-label={t("sazo.agentHub.clearProducts")}
            onClick={() => {
              setShowProducts(false);
            }}
            type="button"
          >
            <X aria-hidden size={18} />
          </button>
        </header>
        {showProducts ? (
          <ol className="sazo-agent-hub-product-rail">
            {agentHubRecentProducts.map((product) => (
              <li className="sazo-agent-hub-product-card" key={product.id}>
                <button
                  aria-label={t("sazo.agentHub.productDetails", { name: product.name })}
                  onClick={() => {
                    dispatch({ type: "open-product", productId: product.id });
                  }}
                  type="button"
                >
                  <img alt="" src={product.image} />
                  <span>{product.brand}</span>
                  <span>{product.name}</span>
                  <span>{product.price}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section data-section="popular-topics" data-testid="agent-hub-section">
        <p>{t("sazo.agentHub.brand")}</p>
        <h2>{t("sazo.agentHub.popularTitle")}</h2>
        <ol className="sazo-agent-hub-ranked-list">
          {agentHubPopularTopics.map(({ id, labelKey, rank }) => {
            const topic = t(labelKey);
            const rankedTopic = t("sazo.agentHub.rankedTopic", { rank, topic });

            return (
              <li
                aria-label={rankedTopic}
                className="sazo-agent-hub-ranked-row"
                key={id}
              >
                <button
                  aria-label={rankedTopic}
                  onClick={() => {
                    setSeedRequest((currentRequest) => ({
                      revision: (currentRequest?.revision ?? 0) + 1,
                      value: topic,
                    }));
                    requestAnimationFrame(focusComposer);
                  }}
                  type="button"
                >
                  <span>{rank}</span>
                  <span>{topic}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <footer
        className="sazo-agent-hub-footer"
        data-section="footer"
        data-testid="agent-hub-section"
      >
        <nav aria-label={t("sazo.auth.page.companyLinksLabel")}>
          <a href="#sazo-company">{t("sazo.auth.page.company")}</a>
          <a href="#sazo-careers">{t("sazo.auth.page.careers")}</a>
          <a href="#sazo-press">{t("sazo.auth.page.press")}</a>
        </nav>
        <div>
          <p>{t("sazo.auth.page.brazilCopyright")}</p>
          <p>{t("sazo.auth.page.brazilAddress")}</p>
          <p>{t("sazo.auth.page.japanCopyright")}</p>
          <p>{t("sazo.auth.page.japanAddress")}</p>
        </div>
        <nav aria-label={t("sazo.auth.page.termsLinksLabel")}>
          <a href="#sazo-terms">{t("sazo.auth.page.terms")}</a>
          <a href="#sazo-privacy">{t("sazo.auth.page.privacy")}</a>
          <a href="#sazo-commerce-disclosure">{t("sazo.auth.page.commerce")}</a>
        </nav>
      </footer>
    </div>
  );
}
