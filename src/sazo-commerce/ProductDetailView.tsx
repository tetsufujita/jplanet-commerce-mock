import type { Dispatch } from "react";
import { ArrowLeft } from "lucide-react";
import { getProductDetail } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";

export interface ProductDetailViewProps {
  dispatch: Dispatch<SazoAction>;
  productId: string | null;
}

export function ProductDetailView({ dispatch, productId }: ProductDetailViewProps) {
  const { product } = getProductDetail(productId);

  return (
    <article
      className="sazo-product-detail"
      data-product-detail
      data-view-content="product"
    >
      <div className="sazo-product-detail-basic">
        <button
          className="sazo-product-detail-back"
          onClick={() => {
            dispatch({ type: "close-product" });
          }}
          type="button"
        >
          <ArrowLeft aria-hidden size={22} strokeWidth={2} />
          戻る
        </button>
        <img
          alt={product.name}
          className="sazo-product-detail-image"
          decoding="async"
          height={640}
          src={product.image}
          width={640}
        />
        <div className="sazo-product-detail-copy">
          <span>{product.brand}</span>
          <h1>{product.name}</h1>
          <p>{product.price}</p>
        </div>
      </div>
    </article>
  );
}
