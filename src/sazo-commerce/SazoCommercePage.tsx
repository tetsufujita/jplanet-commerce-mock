import { useEffect, useReducer } from "react";
import { CatalogView } from "@/sazo-commerce/CatalogView";
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
    <SazoShell dispatch={dispatch} state={state}>
      {state.view === "home" ? <HomeView dispatch={dispatch} state={state} /> : null}
      {state.view === "service" ? <ServiceView dispatch={dispatch} /> : null}
      {state.view === "brands" ? <BrandsView dispatch={dispatch} /> : null}
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
    </SazoShell>
  );
}
