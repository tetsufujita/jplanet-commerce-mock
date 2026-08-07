import { useEffect, useReducer } from "react";
import { AnimatePresence } from "motion/react";
import {
  CardsView,
  FavoritesView,
  MyPageView,
  ProfileView,
} from "@/sazo-commerce/AccountViews";
import { AuthFlow } from "@/sazo-commerce/AuthFlow";
import { CatalogView } from "@/sazo-commerce/CatalogView";
import { ChatPanel } from "@/sazo-commerce/ChatPanel";
import { BrandsView, CategoriesView } from "@/sazo-commerce/DirectoryViews";
import { RankingView, ReviewsView } from "@/sazo-commerce/EditorialViews";
import { HomeView } from "@/sazo-commerce/HomeView";
import { SazoShell } from "@/sazo-commerce/SazoShell";
import { ServiceView } from "@/sazo-commerce/ServiceView";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";
import "@/sazo-commerce/sazo.css";

export function SazoCommercePage() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, createInitialSazoState);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [state.view]);

  return (
    <div className="sazo-page">
      <SazoShell dispatch={dispatch} state={state}>
        {state.view === "home" ? <HomeView dispatch={dispatch} state={state} /> : null}
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
        {state.view === "ranking" ? (
          <RankingView dispatch={dispatch} state={state} />
        ) : null}
        {state.view === "reviews" ? (
          <ReviewsView dispatch={dispatch} state={state} />
        ) : null}
        {state.view === "mypage" ? <MyPageView dispatch={dispatch} /> : null}
        {state.view === "favorites" ? <FavoritesView dispatch={dispatch} /> : null}
        {state.view === "profile" ? <ProfileView dispatch={dispatch} /> : null}
        {state.view === "cards" ? <CardsView dispatch={dispatch} /> : null}
      </SazoShell>

      <AnimatePresence>
        {state.overlay === "login" ? (
          <AuthFlow authStep={state.authStep} dispatch={dispatch} key="sazo-login" />
        ) : null}
        {state.overlay === "chat" ? (
          <ChatPanel dispatch={dispatch} key="sazo-chat" />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
