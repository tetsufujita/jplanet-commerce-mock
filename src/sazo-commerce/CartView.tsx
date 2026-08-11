import { useMemo, useState, type Dispatch } from "react";
import {
  ArrowLeft,
  ChevronDown,
  House,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  formatYen,
  getProductDetail,
  parseYenPrice,
  products,
} from "@/sazo-commerce/fixtures";
import type { CartItem, SazoAction } from "@/sazo-commerce/model";
import { ProductRecommendationRail } from "@/sazo-commerce/ProductRecommendationRail";

interface CartViewProps {
  dispatch: Dispatch<SazoAction>;
  items: readonly CartItem[];
}

function itemKey(item: CartItem): string {
  return `${item.productId}:${item.option}`;
}

export function CartView({ dispatch, items }: CartViewProps) {
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<readonly string[]>([]);

  const cartProducts = useMemo(
    () =>
      items.map((item) => ({
        item,
        product: getProductDetail(item.productId).product,
      })),
    [items],
  );
  const selectedSet = useMemo(() => new Set(selectedItems), [selectedItems]);
  const selectedTotal = cartProducts.reduce((total, { item, product }) => {
    return selectedSet.has(itemKey(item))
      ? total + parseYenPrice(product.price) * item.quantity
      : total;
  }, 0);
  const recommendations = products
    .filter((product) => !items.some((item) => item.productId === product.id))
    .slice(0, 10);

  const toggleSelected = (key: string) => {
    setSelectedItems((current) =>
      current.includes(key) ? current.filter((value) => value !== key) : [...current, key],
    );
  };

  return (
    <section className="sazo-cart-view" data-view-content="cart">
      <header className="sazo-cart-header">
        <button
          aria-label={t("sazo.cart.back")}
          className="sazo-cart-header-button"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <ArrowLeft aria-hidden size={24} strokeWidth={2} />
        </button>
        <h1>{t("sazo.cart.title")}</h1>
        <div className="sazo-cart-header-actions">
          <button
            aria-label={t("sazo.views.common.home")}
            className="sazo-cart-header-button"
            onClick={() => {
              dispatch({ type: "navigate", view: "home" });
            }}
            type="button"
          >
            <House aria-hidden size={23} strokeWidth={1.9} />
          </button>
          <span aria-hidden className="sazo-cart-header-icon">
            <ShoppingCart size={23} strokeWidth={1.9} />
          </span>
        </div>
      </header>

      <div className="sazo-cart-body">
        <section aria-label={t("sazo.cart.itemsLabel")} className="sazo-cart-items">
          {cartProducts.length === 0 ? (
            <p className="sazo-cart-empty">{t("sazo.cart.empty")}</p>
          ) : (
            cartProducts.map(({ item, product }) => {
              const key = itemKey(item);
              const selected = selectedSet.has(key);

              return (
                <article className="sazo-cart-item" data-testid="cart-item" key={key}>
                  <label className="sazo-cart-item-selection">
                    <input
                      aria-label={t("sazo.cart.selectItem", { product: product.name })}
                      checked={selected}
                      onChange={() => {
                        toggleSelected(key);
                      }}
                      type="checkbox"
                    />
                  </label>
                  <img alt={product.name} className="sazo-cart-item-image" src={product.image} />
                  <div className="sazo-cart-item-copy">
                    <span className="sazo-cart-item-brand">{product.brand}</span>
                    <h2>{product.name}</h2>
                    <button className="sazo-cart-item-option" type="button">
                      {t("sazo.cart.option", { option: item.option })}
                      <ChevronDown aria-hidden size={17} strokeWidth={1.8} />
                    </button>
                    <strong>{product.price}</strong>
                    <div className="sazo-cart-quantity" aria-label={t("sazo.cart.quantity")}>
                      <button
                        aria-label={t("sazo.cart.decrease")}
                        onClick={() => {
                          dispatch({
                            type: "set-cart-item-quantity",
                            productId: item.productId,
                            option: item.option,
                            quantity: item.quantity - 1,
                          });
                        }}
                        type="button"
                      >
                        <Minus aria-hidden size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={t("sazo.cart.increase")}
                        onClick={() => {
                          dispatch({
                            type: "set-cart-item-quantity",
                            productId: item.productId,
                            option: item.option,
                            quantity: item.quantity + 1,
                          });
                        }}
                        type="button"
                      >
                        <Plus aria-hidden size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label={t("sazo.cart.remove", { product: product.name })}
                    className="sazo-cart-item-remove"
                    onClick={() => {
                      setSelectedItems((current) => current.filter((value) => value !== key));
                      dispatch({
                        type: "set-cart-item-quantity",
                        productId: item.productId,
                        option: item.option,
                        quantity: 0,
                      });
                    }}
                    type="button"
                  >
                    <Trash2 aria-hidden size={18} strokeWidth={1.8} />
                  </button>
                </article>
              );
            })
          )}
        </section>

        <ProductRecommendationRail
          className="sazo-cart-recommendations"
          dispatch={dispatch}
          eyebrowKey="sazo.cart.recommendationsEyebrow"
          layout="grid"
          products={recommendations}
          testId="cart-recommendations"
          titleKey="sazo.cart.recommendationsTitle"
        />
      </div>

      <footer className="sazo-cart-summary">
        <div>
          <span>{t("sazo.cart.selectedCount", { count: selectedItems.length })}</span>
          <strong>{formatYen(selectedTotal)}</strong>
        </div>
        <button disabled={selectedItems.length === 0} type="button">
          {t("sazo.cart.continue")}
        </button>
      </footer>
    </section>
  );
}
