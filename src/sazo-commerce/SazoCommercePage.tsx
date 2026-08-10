import { useEffect, useReducer, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  CardsView,
  FavoritesView,
  MyPageView,
  ProfileView,
} from "@/sazo-commerce/AccountViews";
import { AuthFlow } from "@/sazo-commerce/AuthFlow";
import { AgentComposerSheet } from "@/sazo-commerce/AgentComposerSheet";
import { CatalogView } from "@/sazo-commerce/CatalogView";
import { CampaignView } from "@/sazo-commerce/CampaignView";
import { ChatPanel } from "@/sazo-commerce/ChatPanel";
import { BrandsView, CategoriesView } from "@/sazo-commerce/DirectoryViews";
import { RankingView, ReviewsView } from "@/sazo-commerce/EditorialViews";
import { HomeView } from "@/sazo-commerce/HomeView";
import { MobileAgentHubView } from "@/sazo-commerce/MobileAgentHubView";
import { GramCatalogView, GramDetailView } from "@/sazo-commerce/GramView";
import { ProductDetailView } from "@/sazo-commerce/ProductDetailView";
import { SazoShell } from "@/sazo-commerce/SazoShell";
import { ServiceView } from "@/sazo-commerce/ServiceView";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";
import "@/sazo-commerce/sazo.css";

export function SazoCommercePage() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, () =>
    createInitialSazoState(window.location.search),
  );
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const authPageActive = state.authStep !== "provider" && state.view === "home";

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [state.selectedProductId, state.view]);

  useEffect(() => {
    if (state.view !== "campaign" || state.campaignLoaded) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      dispatch({ type: "campaign-loaded" });
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.campaignLoaded, state.view]);

  useEffect(() => {
    if (state.view !== "gram" || !state.gramLoading) {
      return undefined;
    }

    const capturedToken = state.gramLoadToken;
    const timeout = window.setTimeout(() => {
      dispatch({ type: "gram-loaded", token: capturedToken });
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.gramCategory, state.gramLoading, state.gramLoadToken, state.view]);

  useEffect(() => {
    const updateHeader = () => {
      setHeaderCollapsed(window.scrollY >= 38);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  return (
    <div
      className="sazo-root"
      data-auth-step={state.authStep}
      data-header-collapsed={headerCollapsed}
      data-hero-feed={state.heroFeed}
      data-loading-surface={state.loadingSurface}
      data-overlay={state.overlay}
      data-review-feed={state.reviewFeed}
      data-view={state.view}
    >
      {authPageActive ? (
        <AuthFlow authStep={state.authStep} dispatch={dispatch} />
      ) : (
        <SazoShell dispatch={dispatch} state={state}>
          {state.view === "home" ? <HomeView dispatch={dispatch} state={state} /> : null}
          {state.view === "agent-hub" ? (
            <MobileAgentHubView dispatch={dispatch} />
          ) : null}
          {state.view === "campaign" ? (
            <CampaignView dispatch={dispatch} loaded={state.campaignLoaded} />
          ) : null}
          {state.view === "service" ? <ServiceView dispatch={dispatch} /> : null}
          {state.view === "brands" ? (
            <BrandsView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "categories" ? (
            <CategoriesView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "catalog" ? (
            <CatalogView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "gram" ? (
            <GramCatalogView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "gram-detail" ? (
            <GramDetailView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "ranking" ? (
            <RankingView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "reviews" ? (
            <ReviewsView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "product" ? (
            <ProductDetailView
              dispatch={dispatch}
              key={state.selectedProductId ?? "default-product"}
              productId={state.selectedProductId}
            />
          ) : null}
          {state.view === "mypage" ? <MyPageView dispatch={dispatch} /> : null}
          {state.view === "favorites" ? <FavoritesView dispatch={dispatch} /> : null}
          {state.view === "profile" ? <ProfileView dispatch={dispatch} /> : null}
          {state.view === "cards" ? <CardsView dispatch={dispatch} /> : null}
        </SazoShell>
      )}

      <AnimatePresence>
        {state.overlay === "login" && state.authStep === "provider" ? (
          <AuthFlow authStep={state.authStep} dispatch={dispatch} key="sazo-login" />
        ) : null}
        {state.overlay === "chat" ? (
          <ChatPanel dispatch={dispatch} key="sazo-chat" />
        ) : null}
        {state.overlay === "agent" ? (
          <AgentComposerSheet dispatch={dispatch} key="sazo-agent" />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
