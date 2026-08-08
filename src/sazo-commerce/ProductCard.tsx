import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/sazo-commerce/fixtures";

export interface ProductCardProps {
  mediaHidden?: boolean;
  onOpen: (productId: string) => void;
  product: Product;
  variant?: "compact" | "standard";
}

export function ProductCard({
  mediaHidden = false,
  onOpen,
  product,
  variant = "standard",
}: ProductCardProps) {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(false);
  const recordedMedia = product.image.startsWith("/sazo-commerce/search-products/");

  return (
    <article className="sazo-product-card" data-variant={variant}>
      <button
        aria-label={t("sazo.views.common.openProductDetail", {
          product: product.name,
        })}
        className="sazo-product-open"
        onClick={() => {
          onOpen(product.id);
        }}
        type="button"
      >
        <div className="sazo-product-card-media">
          {mediaHidden ? null : (
            <img
              alt={product.name}
              className={recordedMedia ? "sazo-recorded-product-media" : undefined}
              decoding="async"
              height={640}
              src={product.image}
              width={640}
            />
          )}
        </div>
        <div className="sazo-product-copy">
          <span className="sazo-product-brand">{product.brand}</span>
          <h3>{product.name}</h3>
          <p className="sazo-product-price">
            {product.badge === undefined ? null : (
              <span className="sazo-product-badge">{product.badge}</span>
            )}
            {product.price}
          </p>
        </div>
      </button>
      <button
        aria-label={
          favorite
            ? t("sazo.views.common.favoriteProductRemove", { product: product.name })
            : t("sazo.home.favoriteProduct", { product: product.name })
        }
        aria-pressed={favorite}
        className="sazo-product-favorite"
        onClick={() => {
          setFavorite((current) => !current);
        }}
        type="button"
      >
        <Bookmark
          aria-hidden
          fill={favorite ? "currentColor" : "none"}
          size={20}
          strokeWidth={1.7}
        />
      </button>
    </article>
  );
}
