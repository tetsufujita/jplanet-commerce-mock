import type { Dispatch } from "react";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { interestedProducts } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";
import { ProductCard } from "@/sazo-commerce/ProductCard";

interface InterestedItemsRailProps {
  dispatch: Dispatch<SazoAction>;
}

export function InterestedItemsRail({ dispatch }: InterestedItemsRailProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);

  const showNext = () => {
    const track = trackRef.current;

    if (track === null) {
      return;
    }

    const firstCard = track.querySelector<HTMLElement>(".sazo-product-card");
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
    const computedGap = Number.parseFloat(getComputedStyle(track).columnGap);
    const gap = Number.isFinite(computedGap) ? computedGap : 14;
    const maximumLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const atEnd = maximumLeft - track.scrollLeft <= 1;
    const nextLeft = atEnd
      ? 0
      : Math.min(track.scrollLeft + cardWidth + gap, maximumLeft);
    const reducedMotion =
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.scrollTo({
      behavior: reducedMotion ? "auto" : "smooth",
      left: nextLeft,
    });
  };

  return (
    <section
      aria-labelledby="sazo-interested-items-heading"
      className="sazo-home-section sazo-interested-items"
    >
      <h2 id="sazo-interested-items-heading">{t("sazo.home.interestedItems")}</h2>
      <div className="sazo-interested-items-viewport">
        <div
          className="sazo-interested-items-track"
          data-testid="interested-items-track"
          ref={trackRef}
        >
          {interestedProducts.map((product) => (
            <ProductCard
              key={product.id}
              onOpen={(productId) => {
                dispatch({ type: "open-product", productId });
              }}
              product={product}
              variant="interest"
            />
          ))}
        </div>
        <button
          aria-label={t("sazo.home.nextInterestedItems")}
          className="sazo-interested-items-next"
          onClick={showNext}
          type="button"
        >
          <ChevronRight aria-hidden size={24} strokeWidth={1.8} />
        </button>
      </div>
    </section>
  );
}
