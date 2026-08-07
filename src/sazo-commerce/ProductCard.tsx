import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/sazo-commerce/fixtures";

export interface ProductCardProps {
  product: Product;
  variant?: "compact" | "standard";
}

export function ProductCard({ product, variant = "standard" }: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <article className="sazo-product-card" data-variant={variant}>
      <div className="sazo-product-card-media">
        <img
          alt={product.name}
          decoding="async"
          height={640}
          src={product.image}
          width={640}
        />
        <button
          aria-label={t("sazo.home.favoriteProduct", { product: product.name })}
          className="sazo-product-favorite"
          type="button"
        >
          <Bookmark aria-hidden size={20} strokeWidth={1.7} />
        </button>
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
    </article>
  );
}
