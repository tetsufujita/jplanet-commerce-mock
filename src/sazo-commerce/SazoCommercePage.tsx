import { useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  AddressView,
  CardsView,
  CouponsView,
  DeliveryView,
  FavoritesView,
  MyPageView,
  NotificationsView,
  OrderDetailView,
  OrdersView,
  PointsView,
  ProfileView,
  ReviewCreateView,
  ReviewHistoryView,
  SupportView,
} from "@/sazo-commerce/AccountViews";
import { AuthFlow } from "@/sazo-commerce/AuthFlow";
import { AgentComposerSheet } from "@/sazo-commerce/AgentComposerSheet";
import { AgentDesignCandidatesView } from "@/sazo-commerce/AgentDesignCandidatesView";
import { AgentFirstPrototypeView } from "@/sazo-commerce/AgentFirstPrototypeView";
import { CatalogView } from "@/sazo-commerce/CatalogView";
import { CartView } from "@/sazo-commerce/CartView";
import { CheckoutView } from "@/sazo-commerce/CheckoutView";
import { CampaignView } from "@/sazo-commerce/CampaignView";
import { ChatPanel } from "@/sazo-commerce/ChatPanel";
import { CategoriesView } from "@/sazo-commerce/DirectoryViews";
import { ReviewsView } from "@/sazo-commerce/EditorialViews";
import { HomeView } from "@/sazo-commerce/HomeView";
import { SkincareCatalogView } from "@/sazo-commerce/SkincareCatalogView";
import { MobileAgentHubView } from "@/sazo-commerce/MobileAgentHubView";
import { AgentSearchLoadingView } from "@/sazo-commerce/AgentSearchLoadingView";
import { AgentImageResolutionView } from "@/sazo-commerce/AgentImageResolutionView";
import { AiSearchView } from "@/sazo-commerce/AiSearchView";
import { GramCatalogView, GramDetailView } from "@/sazo-commerce/GramView";
import { ImageResolvedNewBalanceDetail } from "@/sazo-commerce/ImageResolvedNewBalanceDetail";
import { ProductDetailView } from "@/sazo-commerce/ProductDetailView";
import { imageSearchResolvedNewBalanceProductId } from "@/sazo-commerce/imageProductResolutionFixtures";
import { JplanetBrandDetailView, JplanetBrandsView } from "@/sazo-commerce/JplanetBrandViews";
import { SazoShell } from "@/sazo-commerce/SazoShell";
import { ServiceView } from "@/sazo-commerce/ServiceView";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";
import "@/sazo-commerce/coupons.css";
import "@/sazo-commerce/sazo.css";
import "@/sazo-commerce/section-flow.css";
import "@/sazo-commerce/responsive.css";

function useMobileViewport() {
  const readMatch = () => {
    if (typeof window === "undefined") return false;
    // JSDOM does not expose matchMedia; tests exercise the mobile-only route.
    if (typeof window.matchMedia !== "function") return true;
    return window.matchMedia("(max-width: 767px)").matches;
  };
  const [isMobileViewport, setIsMobileViewport] = useState(readMatch);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobileViewport(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobileViewport;
}

export function SazoCommercePage() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, () =>
    createInitialSazoState(window.location.search),
  );
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const homeProductScrollTopRef = useRef<number | null>(null);
  const brandDetailScrollTopRef = useRef<number | null>(null);
  const previousViewRef = useRef(state.view);
  const authPageActive = state.authStep !== "provider" && state.view === "home";
  const isMobileViewport = useMobileViewport();
  const renderedView =
    isMobileViewport && state.view === "agent-hub" ? "ai-search" : state.view;

  useEffect(() => {
    if (!isMobileViewport && state.view === "ai-search") {
      dispatch({ type: "navigate", view: "home" });
    }
  }, [isMobileViewport, state.view]);

  useEffect(() => {
    const previousView = previousViewRef.current;
    const currentScrollTop = Math.max(
      window.scrollY,
      document.documentElement.scrollTop,
      document.body.scrollTop,
    );
    const isOpeningHomeProduct = previousView === "home" && state.view === "product";
    const isReturningToHome = previousView === "product" && state.view === "home";
    const isOpeningBrandDetail = previousView === "brands" && state.view === "brand-detail";
    const isReturningToBrands = previousView === "brand-detail" && state.view === "brands";
    const restoreScrollTop = isReturningToHome
      ? homeProductScrollTopRef.current
      : isReturningToBrands
        ? brandDetailScrollTopRef.current
        : null;

    if (isOpeningHomeProduct) {
      homeProductScrollTopRef.current = currentScrollTop;
    }
    if (isOpeningBrandDetail) {
      brandDetailScrollTopRef.current = currentScrollTop;
    }

    const targetScrollTop = restoreScrollTop ?? 0;
    const applyScrollPosition = () => {
      if (!navigator.userAgent.includes("jsdom")) {
        window.scrollTo({ behavior: "instant", top: targetScrollTop });
      }
      document.documentElement.scrollTop = targetScrollTop;
      document.body.scrollTop = targetScrollTop;
    };

    applyScrollPosition();
    const restoreFrame =
      restoreScrollTop === null
        ? null
        : window.requestAnimationFrame(() => {
            applyScrollPosition();
          });
    if (isReturningToHome) {
      homeProductScrollTopRef.current = null;
    }
    if (isReturningToBrands) {
      brandDetailScrollTopRef.current = null;
    }
    previousViewRef.current = state.view;

    return () => {
      if (restoreFrame !== null) {
        window.cancelAnimationFrame(restoreFrame);
      }
    };
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
      // The home header is part of the hero while the visitor is at the
      // starting position. Once they begin reading, it becomes the familiar
      // solid navigation surface instead of competing with the banner.
      setHeaderCollapsed(Math.max(0, window.scrollY) > 12);
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
      data-apple-design="true"
      data-auth-step={state.authStep}
      data-header-collapsed={headerCollapsed}
      data-hero-feed={state.heroFeed}
      data-loading-surface={state.loadingSurface}
      data-overlay={state.overlay}
      data-review-feed={state.reviewFeed}
      data-view={renderedView}
    >
      {authPageActive ? (
        <AuthFlow authStep={state.authStep} dispatch={dispatch} />
      ) : (
        <SazoShell
          dispatch={dispatch}
          isMobileViewport={isMobileViewport}
          state={state}
        >
          {state.view === "home" ? <HomeView dispatch={dispatch} state={state} /> : null}
          {state.view === "agent-hub" ? (
            isMobileViewport ? (
              <AiSearchView dispatch={dispatch} state={state} />
            ) : (
              <MobileAgentHubView
                dispatch={dispatch}
                entryIntent={state.agentEntryIntent}
                scenario={state.agentHubScenario}
              />
            )
          ) : null}
          {state.view === "ai-search" && isMobileViewport ? (
            <AiSearchView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "agent-searching" && state.agentSearchRequest !== null ? (
            <AgentSearchLoadingView dispatch={dispatch} request={state.agentSearchRequest} />
          ) : null}
          {state.view === "agent-image-resolution" && state.agentSearchRequest !== null ? (
            isMobileViewport ? (
              <AgentImageResolutionView dispatch={dispatch} request={state.agentSearchRequest} />
            ) : (
              <AgentSearchLoadingView dispatch={dispatch} request={state.agentSearchRequest} />
            )
          ) : null}
          {state.view === "agent-designs" ? <AgentDesignCandidatesView /> : null}
          {state.view === "agent-first" ? <AgentFirstPrototypeView /> : null}
          {state.view === "campaign" ? (
            <CampaignView dispatch={dispatch} loaded={state.campaignLoaded} />
          ) : null}
          {state.view === "service" ? <ServiceView dispatch={dispatch} /> : null}
          {state.view === "brands" ? (
            <JplanetBrandsView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "brand-detail" ? (
            <JplanetBrandDetailView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "categories" ? (
            <CategoriesView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "skincare-catalog" ? (
            <SkincareCatalogView dispatch={dispatch} />
          ) : null}
          {state.view === "catalog" ? (
            <CatalogView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "cart" ? (
            <CartView
              dispatch={dispatch}
              items={state.cartItems}
              selectedCouponId={state.couponSelectedId}
            />
          ) : null}
          {state.view === "checkout" ? (
            <CheckoutView dispatch={dispatch} items={state.checkoutItems} />
          ) : null}
          {state.view === "gram" ? (
            <GramCatalogView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "gram-detail" ? (
            <GramDetailView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "reviews" ? (
            <ReviewsView dispatch={dispatch} state={state} />
          ) : null}
          {state.view === "product" ? (
            state.selectedProductId === imageSearchResolvedNewBalanceProductId &&
            isMobileViewport ? (
              <ImageResolvedNewBalanceDetail dispatch={dispatch} />
            ) : (
              <ProductDetailView
                dispatch={dispatch}
                key={state.selectedProductId ?? "default-product"}
                productId={state.selectedProductId}
              />
            )
          ) : null}
          {state.view === "mypage" ? (
            <MyPageView couponCount={state.couponOwnedIds.length} dispatch={dispatch} />
          ) : null}
          {state.view === "favorites" ? (
            <FavoritesView dispatch={dispatch} initialTab={state.favoriteTab} state={state} />
          ) : null}
          {state.view === "profile" ? <ProfileView dispatch={dispatch} /> : null}
          {state.view === "cards" ? <CardsView dispatch={dispatch} /> : null}
          {state.view === "orders" ? <OrdersView dispatch={dispatch} /> : null}
          {state.view === "order-detail" ? <OrderDetailView dispatch={dispatch} /> : null}
          {state.view === "coupons" ? <CouponsView dispatch={dispatch} state={state} /> : null}
          {state.view === "points" ? <PointsView dispatch={dispatch} /> : null}
          {state.view === "review-create" ? (
            <ReviewCreateView dispatch={dispatch} />
          ) : null}
          {state.view === "review-history" ? (
            <ReviewHistoryView dispatch={dispatch} />
          ) : null}
          {state.view === "delivery" ? <DeliveryView dispatch={dispatch} /> : null}
          {state.view === "address" ? <AddressView dispatch={dispatch} /> : null}
          {state.view === "notifications" ? (
            <NotificationsView dispatch={dispatch} />
          ) : null}
          {state.view === "support" ? <SupportView /> : null}
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
