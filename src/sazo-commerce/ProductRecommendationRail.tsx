import type { Dispatch } from "react";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import type { Product } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";

export interface ProductRecommendationRailProps {
  dispatch: Dispatch<SazoAction>;
  products: readonly Product[];
  className?: string;
  eyebrowKey?: string;
  layout?: "grid" | "rail";
  moreLabelKey?: string;
  onShowMore?: () => void;
  testId?: string;
  titleKey?: string;
}

export function ProductRecommendationRail({
  className,
  dispatch,
  eyebrowKey = "sazo.views.productDetail.recommendations.eyebrow",
  layout = "rail",
  moreLabelKey = "sazo.views.productDetail.recommendations.more",
  onShowMore,
  products,
  testId,
  titleKey = "sazo.views.productDetail.recommendations.title",
}: ProductRecommendationRailProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);

  const showNextProducts = () => {
    const track = trackRef.current;

    if (track === null) {
      return;
    }

    track.scrollBy({
      behavior: reduceMotion ? "auto" : "smooth",
      left: track.clientWidth * 0.82,
    });
  };

  const sectionClassName = [
    "sazo-product-detail-section",
    "sazo-product-detail-recommendations",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const title = t(titleKey);
  const isGrid = layout === "grid";

  return (
    <section
      aria-label={title}
      className={sectionClassName}
      data-testid={testId}
      role="region"
    >
      <div className="sazo-product-detail-section-heading">
        <div>
          <span>{t(eyebrowKey)}</span>
          <h2>{title}</h2>
        </div>
        {isGrid ? null : (
          <button
            aria-label={t("sazo.views.productDetail.recommendations.next")}
            className="sazo-product-detail-recommendation-next"
            onClick={showNextProducts}
            type="button"
          >
            <ChevronRight aria-hidden size={22} strokeWidth={2} />
          </button>
        )}
      </div>
      <div
        className="sazo-product-detail-recommendation-track"
        data-layout={layout}
        data-scroll-axis={isGrid ? "vertical" : "horizontal"}
        ref={trackRef}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            onOpen={(productId) => {
              dispatch({ type: "open-product", productId });
            }}
            product={product}
            showBadge={!isGrid}
            variant="compact"
          />
        ))}
      </div>
      {onShowMore === undefined ? null : (
        <button
          className="sazo-product-detail-recommendation-more"
          onClick={onShowMore}
          type="button"
        >
          {t(moreLabelKey)}
        </button>
      )}
    </section>
  );
}
