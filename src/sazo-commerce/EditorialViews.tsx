import { CircleUserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type StatefulViewProps } from "@/sazo-commerce/DirectoryViews";
import {
  purchaseExperienceReviews,
  purchaseExperienceReviewFeed,
  purchaseReviewFilters,
  rankingInventories,
} from "@/sazo-commerce/fixtures";
import { ProductCard } from "@/sazo-commerce/ProductCard";

export function RankingView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const rankingProducts = rankingInventories[state.rankingMetric];

  return (
    <div className="sazo-editorial-view" data-view-content="ranking">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.ranking.title")} />
      <section className="sazo-ranking-view-content">
        <div className="sazo-editorial-heading">
          <h1>{t("sazo.views.ranking.title")}</h1>
          <div className="sazo-ranking-view-controls">
            <button
              aria-pressed={state.rankingMetric === "purchases"}
              onClick={() => {
                dispatch({ type: "select-ranking-metric", metric: "purchases" });
              }}
              type="button"
            >
              {t("sazo.views.ranking.purchaseCount")}
            </button>
            <button
              aria-pressed={state.rankingMetric === "views"}
              onClick={() => {
                dispatch({ type: "select-ranking-metric", metric: "views" });
              }}
              type="button"
            >
              {t("sazo.views.ranking.viewCount")}
            </button>
            <span>{t("sazo.views.ranking.week")}</span>
          </div>
        </div>
        <div className="sazo-ranking-product-grid">
          {rankingProducts.map((product, index) => (
            <div className="sazo-ranked-product" key={product.id}>
              <strong aria-hidden>{index + 1}</strong>
              <ProductCard
                onOpen={(productId) => {
                  dispatch({ type: "open-product", productId });
                }}
                product={product}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReviewsView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const selectedFilter =
    purchaseReviewFilters.find((filter) => filter.id === state.reviewCategory) ??
    purchaseReviewFilters.find((filter) => filter.id === "all");

  if (selectedFilter === undefined) {
    return null;
  }
  const activeDecisionAxis = selectedFilter.id === "all" ? null : selectedFilter.id;
  const visibleReviews =
    activeDecisionAxis === null
      ? purchaseExperienceReviewFeed
      : purchaseExperienceReviewFeed.filter((review) =>
          review.decisionAxes.includes(activeDecisionAxis),
        );

  return (
    <div className="sazo-editorial-view" data-view-content="reviews">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.reviews.title")} />
      <section className="sazo-reviews-view-content">
        <section className="sazo-review-intro">
          <h1>{t("sazo.views.reviews.title")}</h1>
          <p>{t("sazo.views.reviews.subtitle")}</p>
        </section>
        <section
          aria-label={t("sazo.views.reviews.featuredLabel")}
          className="sazo-review-feature-rail"
          data-review-feature-carousel="true"
        >
          {purchaseExperienceReviews.slice(0, 3).map((review) => (
            <article className="sazo-review-feature-card" key={review.id}>
              <img
                alt={t(review.imageAltKey, { author: review.author })}
                decoding="async"
                loading="eager"
                src={review.image}
              />
              <div className="sazo-review-feature-copy">
                <p className="sazo-review-feature-author">
                  <CircleUserRound aria-hidden size={17} />
                  {review.author} · {review.city}
                </p>
                <strong>{t(review.bodyKey)}</strong>
                <div className="sazo-review-feature-chips">
                  {review.chipKeys.map((chipKey) => (
                    <span key={chipKey}>{t(chipKey)}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="sazo-review-feed" id="review-feed">
          <div className="sazo-review-category-rail" data-review-category-filter="true">
            {purchaseReviewFilters.map((filter) => (
              <button
                aria-pressed={selectedFilter.id === filter.id}
                key={filter.id}
                onClick={() => {
                  dispatch({ type: "select-review-category", category: filter.id });
                }}
                type="button"
              >
                {t(filter.labelKey)}
              </button>
            ))}
          </div>
          <div className="sazo-review-feed-heading">
            <h2>{t("sazo.views.reviews.communityHeading")}</h2>
          </div>
          <div className="sazo-review-masonry" data-review-columns="2">
            {visibleReviews.map((review) => (
              <article
                className="sazo-review-tile"
                data-review-id={review.id}
                key={review.id}
              >
                <div className="sazo-review-tile-media">
                  <img
                    alt={t(review.imageAltKey, { author: review.author })}
                    decoding="async"
                    height={260}
                    loading="lazy"
                    src={review.image}
                    width={260}
                  />
                </div>
                <div className="sazo-review-tile-copy">
                  <p className="sazo-review-tile-author">
                    <CircleUserRound aria-hidden size={14} />
                    {review.author} · {review.city}
                  </p>
                  <p>{t(review.bodyKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
