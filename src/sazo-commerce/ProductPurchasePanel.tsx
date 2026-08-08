import type { Dispatch } from "react";
import { useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { calculateProductTotal, formatYen } from "@/sazo-commerce/fixtures";
import type { ProductDetail } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";

export interface ProductPurchasePanelProps {
  detail: ProductDetail;
  dispatch: Dispatch<SazoAction>;
  reduceMotion: boolean;
}

type PurchaseIntent = "cart" | "buy";

interface PurchaseFeedback {
  kind: "error" | "success";
  message: string;
}

export function ProductPurchasePanel({
  detail,
  dispatch,
  reduceMotion,
}: ProductPurchasePanelProps) {
  const { t } = useTranslation();
  const { product } = detail;
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [requestText, setRequestText] = useState("");
  const [imageCheck, setImageCheck] = useState(false);
  const [feedback, setFeedback] = useState<PurchaseFeedback | null>(null);
  const [requestGuideOpen, setRequestGuideOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const totalAmount =
    selectedOption === ""
      ? 0
      : calculateProductTotal(
          detail.unitPriceAmount,
          quantity,
          detail.localDistributionFeeAmount,
        );
  const productAmount = detail.unitPriceAmount * quantity;
  const formattedTotal = totalAmount === 0 ? String(totalAmount) : formatYen(totalAmount);

  const handlePurchase = (intent: PurchaseIntent) => {
    if (selectedOption === "") {
      setFeedback({
        kind: "error",
        message: t("sazo.views.productDetail.feedback.optionRequired"),
      });
      selectRef.current?.focus();
      return;
    }

    if (intent === "cart") {
      setFeedback({
        kind: "success",
        message: t("sazo.views.productDetail.feedback.cartAdded"),
      });
      return;
    }

    setFeedback({
      kind: "success",
      message: t("sazo.views.productDetail.feedback.proceeding"),
    });
    dispatch({ type: "open-login" });
  };

  const removeSelection = () => {
    setSelectedOption("");
    setQuantity(1);
    setFeedback(null);
    selectRef.current?.focus();
  };

  return (
    <>
      <form
        aria-labelledby="sazo-product-purchase-heading"
        className="sazo-product-detail-purchase-form"
        data-product-purchase-form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <h2 id="sazo-product-purchase-heading">
          {t("sazo.views.productDetail.purchase.title")}
        </h2>
        <label htmlFor="sazo-product-option">
          {detail.optionLabel}
          <span aria-hidden className="sazo-product-detail-required">
            {t("sazo.views.productDetail.purchase.required")}
          </span>
        </label>
        <select
          aria-label={detail.optionLabel}
          id="sazo-product-option"
          onChange={(event) => {
            setSelectedOption(event.target.value);
            setFeedback(null);
            if (event.target.value === "") {
              setQuantity(1);
            }
          }}
          ref={selectRef}
          required
          value={selectedOption}
        >
          <option value="">
            {t("sazo.views.productDetail.purchase.selectPlaceholder")}
          </option>
          {detail.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {selectedOption === "" ? null : (
          <div className="sazo-product-detail-selected-product">
            <div className="sazo-product-detail-selected-product-copy">
              <span>{t("sazo.views.productDetail.purchase.selectedProduct")}</span>
              <strong>{product.name}</strong>
              <small>{selectedOption}</small>
              <b>{product.price}</b>
            </div>
            <div
              aria-label={t("sazo.views.productDetail.purchase.quantity.label")}
              className="sazo-product-detail-quantity"
              role="group"
            >
              <button
                aria-label={t("sazo.views.productDetail.purchase.quantity.decrease")}
                onClick={() => {
                  setQuantity((current) => Math.max(1, current - 1));
                  setFeedback(null);
                }}
                type="button"
              >
                <Minus aria-hidden size={17} strokeWidth={2} />
              </button>
              <span data-testid="product-quantity">{quantity}</span>
              <button
                aria-label={t("sazo.views.productDetail.purchase.quantity.increase")}
                onClick={() => {
                  setQuantity((current) => current + 1);
                  setFeedback(null);
                }}
                type="button"
              >
                <Plus aria-hidden size={17} strokeWidth={2} />
              </button>
            </div>
            <button
              aria-label={t("sazo.views.productDetail.purchase.removeSelection")}
              className="sazo-product-detail-remove-selection"
              onClick={removeSelection}
              type="button"
            >
              <X aria-hidden size={18} strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="sazo-product-detail-request-heading">
          <label htmlFor="sazo-product-request">
            {t("sazo.views.productDetail.purchase.requestLabel")}
          </label>
          <button
            aria-controls="sazo-product-request-guide"
            aria-expanded={requestGuideOpen}
            className="sazo-product-detail-request-guide-button"
            onClick={() => {
              setRequestGuideOpen((current) => !current);
            }}
            type="button"
          >
            {t("sazo.views.productDetail.purchase.requestGuide")}
          </button>
        </div>
        {requestGuideOpen ? (
          <p
            className="sazo-product-detail-request-guide"
            id="sazo-product-request-guide"
          >
            {t("sazo.views.productDetail.purchase.requestGuideBody")}
          </p>
        ) : null}
        <textarea
          aria-describedby={requestGuideOpen ? "sazo-product-request-guide" : undefined}
          id="sazo-product-request"
          onChange={(event) => {
            setRequestText(event.target.value);
          }}
          placeholder={t("sazo.views.productDetail.purchase.requestPlaceholder")}
          rows={3}
          value={requestText}
        />

        <label className="sazo-product-detail-check" htmlFor="sazo-product-image-check">
          <input
            checked={imageCheck}
            id="sazo-product-image-check"
            onChange={(event) => {
              setImageCheck(event.target.checked);
            }}
            type="checkbox"
          />
          <span>{t("sazo.views.productDetail.purchase.imageCheck")}</span>
        </label>

        <details className="sazo-product-detail-total" data-testid="product-total" open>
          <summary>{t("sazo.views.productDetail.purchase.totalOrderAmount")}</summary>
          <dl>
            <div>
              <dt>{t("sazo.views.productDetail.purchase.productPrice")}</dt>
              <dd data-testid="product-unit-price">{formatYen(productAmount)}</dd>
            </div>
            <div>
              <dt>{t("sazo.views.productDetail.purchase.localDistributionFee")}</dt>
              <dd>{formatYen(detail.localDistributionFeeAmount)}</dd>
            </div>
            <div className="sazo-product-detail-total-final">
              <dt>{t("sazo.views.productDetail.purchase.total")}</dt>
              <dd data-testid="product-total-value">{formattedTotal}</dd>
            </div>
          </dl>
          <p className="sazo-product-detail-purchase-note">{detail.purchaseNote}</p>
        </details>

        <div className="sazo-product-detail-purchase-actions">
          <button
            className="sazo-product-detail-cart-button"
            onClick={() => {
              handlePurchase("cart");
            }}
            type="button"
          >
            {t("sazo.views.productDetail.purchase.addToCart")}
          </button>
          <button
            className="sazo-product-detail-buy-button"
            onClick={() => {
              handlePurchase("buy");
            }}
            type="button"
          >
            {t("sazo.views.productDetail.purchase.buyNow")}
          </button>
        </div>

        {feedback === null ? null : (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="sazo-product-detail-feedback"
            data-kind={feedback.kind}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            key={`${feedback.kind}-${feedback.message}`}
            role={feedback.kind === "error" ? "alert" : "status"}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {feedback.message}
          </motion.p>
        )}
      </form>

      <div
        aria-label={t("sazo.views.productDetail.purchase.actionsLabel")}
        className="sazo-product-mobile-purchase"
        role="group"
      >
        <div>
          <span>{t("sazo.views.productDetail.purchase.totalOrderAmount")}</span>
          <strong>{formattedTotal}</strong>
        </div>
        <button
          className="sazo-product-detail-cart-button"
          onClick={() => {
            handlePurchase("cart");
          }}
          type="button"
        >
          {t("sazo.views.productDetail.purchase.addToCart")}
        </button>
        <button
          className="sazo-product-detail-buy-button"
          onClick={() => {
            handlePurchase("buy");
          }}
          type="button"
        >
          {t("sazo.views.productDetail.purchase.buyNow")}
        </button>
      </div>
    </>
  );
}
