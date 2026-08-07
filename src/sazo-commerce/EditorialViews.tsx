import { useEffect, useRef } from "react";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type StatefulViewProps } from "@/sazo-commerce/DirectoryViews";
import {
  editorialReviews,
  rankingInventories,
  reviewCategories,
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
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReviewsView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const masonryRef = useRef<HTMLDivElement>(null);
  const visibleReviews =
    state.reviewCategory === "all"
      ? editorialReviews
      : editorialReviews.filter(({ categoryIds }) =>
          categoryIds.some((categoryId) => categoryId === state.reviewCategory),
        );

  useEffect(() => {
    const masonry = masonryRef.current;

    if (masonry === null) {
      return;
    }

    const tiles = Array.from(masonry.querySelectorAll<HTMLElement>(".sazo-review-tile"));
    const resizeTiles = () => {
      const rowHeight = Number.parseFloat(getComputedStyle(masonry).gridAutoRows);

      if (!Number.isFinite(rowHeight) || rowHeight <= 0) {
        return;
      }

      for (const tile of tiles) {
        tile.style.gridRowEnd = `span ${String(
          Math.ceil(tile.getBoundingClientRect().height / rowHeight),
        )}`;
      }
    };

    resizeTiles();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(resizeTiles);

    for (const tile of tiles) {
      observer.observe(tile);
    }

    return () => {
      observer.disconnect();
    };
  }, [visibleReviews]);

  return (
    <div className="sazo-editorial-view" data-view-content="reviews">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.reviews.title")} />
      <section className="sazo-reviews-view-content">
        <h1>{t("sazo.views.reviews.title")}</h1>
        <div className="sazo-review-category-rail">
          {reviewCategories.map((category) => (
            <button
              aria-pressed={state.reviewCategory === category.id}
              key={category.id}
              onClick={() => {
                dispatch({ type: "select-review-category", category: category.id });
              }}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="sazo-review-masonry" ref={masonryRef}>
          {visibleReviews.map((review) => (
            <article
              className="sazo-review-tile"
              data-review-id={review.id}
              key={review.id}
            >
              <div className="sazo-review-tile-media">
                {review.image ? (
                  <img
                    alt={review.body}
                    decoding="async"
                    height={500}
                    loading="lazy"
                    src={review.image}
                    width={390}
                  />
                ) : (
                  <div
                    aria-hidden
                    className="sazo-review-tile-placeholder"
                    data-recorded-height="190"
                  />
                )}
                <span>{review.author}</span>
              </div>
              <p>{review.body}</p>
              <div className="sazo-review-tile-actions">
                <span aria-label={t("sazo.views.reviews.likes", { count: review.likes })}>
                  <ThumbsUp aria-hidden size={19} />
                  {review.likes}
                </span>
                <span
                  aria-label={t("sazo.views.reviews.comments", {
                    count: review.comments,
                  })}
                >
                  <MessageCircle aria-hidden size={19} />
                  {review.comments}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
