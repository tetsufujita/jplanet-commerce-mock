import { MessageCircle, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type StatefulViewProps } from "@/sazo-commerce/DirectoryViews";
import { products, reviewCategories, reviews } from "@/sazo-commerce/fixtures";
import { ProductCard } from "@/sazo-commerce/ProductCard";

export function RankingView({ dispatch, state }: StatefulViewProps) {
  const { t } = useTranslation();
  const selectedMetric = state.selectedTab === "views" ? "views" : "purchases";

  return (
    <div className="sazo-editorial-view" data-view-content="ranking">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.ranking.title")} />
      <section className="sazo-ranking-view-content">
        <div className="sazo-editorial-heading">
          <h1>{t("sazo.views.ranking.title")}</h1>
          <div className="sazo-ranking-view-controls">
            <button
              aria-pressed={selectedMetric === "purchases"}
              onClick={() => {
                dispatch({ type: "select-tab", tab: "purchases" });
              }}
              type="button"
            >
              {t("sazo.views.ranking.purchaseCount")}
            </button>
            <button
              aria-pressed={selectedMetric === "views"}
              onClick={() => {
                dispatch({ type: "select-tab", tab: "views" });
              }}
              type="button"
            >
              {t("sazo.views.ranking.viewCount")}
            </button>
            <span>{t("sazo.views.ranking.week")}</span>
          </div>
        </div>
        <div className="sazo-ranking-product-grid">
          {products.map((product, index) => (
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
  const selectedCategory =
    reviewCategories.find((category) => category === state.selectedCategory) ??
    reviewCategories[0];

  return (
    <div className="sazo-editorial-view" data-view-content="reviews">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.reviews.title")} />
      <section className="sazo-reviews-view-content">
        <h1>{t("sazo.views.reviews.title")}</h1>
        <div className="sazo-review-category-rail">
          {reviewCategories.map((category) => (
            <button
              aria-pressed={selectedCategory === category}
              key={category}
              onClick={() => {
                dispatch({ type: "select-category", category });
              }}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
        <div className="sazo-review-masonry">
          {reviews.map((review) => (
            <article className="sazo-review-tile" key={review.id}>
              <div className="sazo-review-tile-media">
                <img
                  alt={review.productName}
                  decoding="async"
                  height={500}
                  loading="lazy"
                  src={review.image}
                  width={390}
                />
                <span>{review.author}</span>
              </div>
              <h2>{review.productName}</h2>
              <p>{review.comment}</p>
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
