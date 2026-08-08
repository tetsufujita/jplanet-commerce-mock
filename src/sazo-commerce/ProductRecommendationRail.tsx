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
}

export function ProductRecommendationRail({
  dispatch,
  products,
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

  return (
    <section
      aria-label={t("sazo.views.productDetail.recommendations.title")}
      className="sazo-product-detail-section sazo-product-detail-recommendations"
      role="region"
    >
      <div className="sazo-product-detail-section-heading">
        <div>
          <span>{t("sazo.views.productDetail.recommendations.eyebrow")}</span>
          <h2>{t("sazo.views.productDetail.recommendations.title")}</h2>
        </div>
        <button
          aria-label={t("sazo.views.productDetail.recommendations.next")}
          className="sazo-product-detail-recommendation-next"
          onClick={showNextProducts}
          type="button"
        >
          <ChevronRight aria-hidden size={22} strokeWidth={2} />
        </button>
      </div>
      <div className="sazo-product-detail-recommendation-track" ref={trackRef}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            onOpen={(productId) => {
              dispatch({ type: "open-product", productId });
            }}
            product={product}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
}
