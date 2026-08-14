import { useEffect, useRef } from "react";
import { MessageCircle, Plus, Sparkles, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type StatefulViewProps } from "@/sazo-commerce/DirectoryViews";
import {
  editorialReviews,
  rankingInventories,
  reviewCategories,
  reviewRecommendations,
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
        <section className="sazo-review-hero" data-review-hero="true">
          <p className="sazo-review-hero-eyebrow">
            7,335件超のリアルなユーザーの声 <span aria-label="5つ星">★★★★★</span>
          </p>
          <h1>
            おトクに、
            <br />
            スピーディーに、
            <br />
            そして安全に。
          </h1>
          <p className="sazo-review-hero-copy">
            実際のユーザー体験を読んで、さっそく試してみませんか？
            <br />
            5人に1人が3万円で再び選ぶSAZOで、あなたも楽々ショッピングを。
          </p>
          <a className="sazo-review-hero-link" href="#review-feed">
            サービス紹介を見る
          </a>
          <div className="sazo-review-agent-entry" data-review-agent-entry="true">
            <div className="sazo-review-agent-entry-heading">
              <img alt="" aria-hidden="true" src="/sazo-commerce/jplanet-sakura-mark.png" />
              <strong>{t("sazo.agentHub.composer.title")}</strong>
            </div>
            <div className="sazo-review-agent-composer" role="search">
              <Plus aria-hidden size={21} />
              <input
                aria-label={t("sazo.agentHub.composer.draftLabel")}
                onFocus={() => {
                  dispatch({ type: "open-agent-hub", intent: "compose" });
                }}
                placeholder={t("sazo.agentHub.composer.inputPlaceholder")}
                type="text"
              />
              <button
                aria-label={t("sazo.agentHub.composer.send")}
                onClick={() => {
                  dispatch({ type: "open-agent-hub", intent: "compose" });
                }}
                type="button"
              >
                <Sparkles aria-hidden size={20} />
              </button>
            </div>
          </div>
          <div aria-label="注目レビュー" className="sazo-review-feature-rail">
            {visibleReviews.slice(0, 4).map((review) => (
              <article className="sazo-review-feature-card" key={review.id}>
                <div className="sazo-review-feature-media">
                  {review.image ? (
                    <img alt="" decoding="async" loading="lazy" src={review.image} />
                  ) : (
                    <span aria-hidden />
                  )}
                </div>
                <strong>{review.author}</strong>
                <p>{review.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="sazo-review-feed" id="review-feed">
          <div className="sazo-review-feed-heading">
            <h2>{t("sazo.views.reviews.title")}</h2>
            <span>実際に利用した方の声</span>
          </div>
          <div className="sazo-review-category-rail" data-review-category-filter="true">
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
        <div className="sazo-review-masonry" data-review-columns="2" ref={masonryRef}>
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
        <section
          aria-label={t("sazo.home.reviewRecommendations")}
          className="sazo-review-product-recommendations"
        >
          <h2>{t("sazo.home.reviewRecommendations")}</h2>
          <div className="sazo-ranking-product-grid">
            {reviewRecommendations.map(({ product }) => (
              <ProductCard
                key={product.id}
                onOpen={(productId) => {
                  dispatch({ type: "open-product", productId });
                }}
                product={product}
              />
            ))}
          </div>
        </section>
        </section>
      </section>
    </div>
  );
}
