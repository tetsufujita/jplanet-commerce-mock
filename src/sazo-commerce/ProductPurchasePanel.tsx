import { useRef } from "react";
import { Minus, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { formatYen } from "@/sazo-commerce/fixtures";
import type { ProductDetail } from "@/sazo-commerce/fixtures";
import type {
  ProductPurchaseController,
  PurchaseIntent,
} from "@/sazo-commerce/useProductPurchaseController";

export interface ProductPurchasePanelProps {
  announceFeedback?: boolean;
  controller: ProductPurchaseController;
  detail: ProductDetail;
  idPrefix: string;
  onPurchaseIntent?: (intent: PurchaseIntent) => void;
  reduceMotion: boolean;
  sheetIntent?: PurchaseIntent;
  showMobileActions?: boolean;
}

export function ProductPurchasePanel({
  announceFeedback = false,
  controller,
  detail,
  idPrefix,
  onPurchaseIntent,
  reduceMotion,
  sheetIntent,
  showMobileActions = false,
}: ProductPurchasePanelProps) {
  const { t } = useTranslation();
  const { product } = detail;
  const selectRef = useRef<HTMLSelectElement>(null);
  const headingId = `sazo-product-purchase-heading-${idPrefix}`;
  const optionId = `sazo-product-option-${idPrefix}`;
  const requestId = `sazo-product-request-${idPrefix}`;
  const requestGuideId = `sazo-product-request-guide-${idPrefix}`;
  const imageCheckId = `sazo-product-image-check-${idPrefix}`;
  const focusSelect = () => {
    selectRef.current?.focus();
  };
  const submitIntent = (intent: PurchaseIntent) => {
    if (onPurchaseIntent !== undefined && controller.selectedOption !== "") {
      onPurchaseIntent(intent);
      return;
    }

    controller.purchase(intent, focusSelect);
  };

  return (
    <>
      <form
        aria-labelledby={headingId}
        className="sazo-product-detail-purchase-form"
        data-product-purchase-form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <h2 id={headingId}>{t("sazo.views.productDetail.purchase.title")}</h2>
        <label htmlFor={optionId}>
          {detail.optionLabel}
          <span aria-hidden className="sazo-product-detail-required">
            {t("sazo.views.productDetail.purchase.required")}
          </span>
        </label>
        <select
          aria-label={detail.optionLabel}
          id={optionId}
          onChange={(event) => {
            controller.selectOption(event.target.value);
          }}
          ref={selectRef}
          required
          value={controller.selectedOption}
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

        {controller.selectedOption === "" ? null : (
          <div className="sazo-product-detail-selected-product">
            <div className="sazo-product-detail-selected-product-copy">
              <span>{t("sazo.views.productDetail.purchase.selectedProduct")}</span>
              <strong>{product.name}</strong>
              <small>{controller.selectedOption}</small>
              <b>{product.price}</b>
            </div>
            <div
              aria-label={t("sazo.views.productDetail.purchase.quantity.label")}
              className="sazo-product-detail-quantity"
              role="group"
            >
              <button
                aria-label={t("sazo.views.productDetail.purchase.quantity.decrease")}
                onClick={controller.decrementQuantity}
                type="button"
              >
                <Minus aria-hidden size={17} strokeWidth={2} />
              </button>
              <span data-testid="product-quantity">{controller.quantity}</span>
              <button
                aria-label={t("sazo.views.productDetail.purchase.quantity.increase")}
                onClick={controller.incrementQuantity}
                type="button"
              >
                <Plus aria-hidden size={17} strokeWidth={2} />
              </button>
            </div>
            <button
              aria-label={t("sazo.views.productDetail.purchase.removeSelection")}
              className="sazo-product-detail-remove-selection"
              onClick={() => {
                controller.removeSelection();
                focusSelect();
              }}
              type="button"
            >
              <X aria-hidden size={18} strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="sazo-product-detail-request-heading">
          <label htmlFor={requestId}>
            {t("sazo.views.productDetail.purchase.requestLabel")}
          </label>
          <button
            aria-controls={requestGuideId}
            aria-expanded={controller.requestGuideOpen}
            className="sazo-product-detail-request-guide-button"
            onClick={controller.toggleRequestGuide}
            type="button"
          >
            {t("sazo.views.productDetail.purchase.requestGuide")}
          </button>
        </div>
        {controller.requestGuideOpen ? (
          <p className="sazo-product-detail-request-guide" id={requestGuideId}>
            {t("sazo.views.productDetail.purchase.requestGuideBody")}
          </p>
        ) : null}
        <textarea
          aria-describedby={controller.requestGuideOpen ? requestGuideId : undefined}
          id={requestId}
          onChange={(event) => {
            controller.setRequestText(event.target.value);
          }}
          placeholder={t("sazo.views.productDetail.purchase.requestPlaceholder")}
          rows={3}
          value={controller.requestText}
        />

        <label className="sazo-product-detail-check" htmlFor={imageCheckId}>
          <input
            checked={controller.imageCheck}
            id={imageCheckId}
            onChange={(event) => {
              controller.setImageCheck(event.target.checked);
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
              <dd data-testid="product-unit-price">
                {formatYen(controller.productAmount)}
              </dd>
            </div>
            <div>
              <dt>{t("sazo.views.productDetail.purchase.localDistributionFee")}</dt>
              <dd>{formatYen(detail.localDistributionFeeAmount)}</dd>
            </div>
            <div className="sazo-product-detail-total-final">
              <dt>{t("sazo.views.productDetail.purchase.total")}</dt>
              <dd data-testid="product-total-value">{controller.formattedTotal}</dd>
            </div>
          </dl>
          <p className="sazo-product-detail-purchase-note">{detail.purchaseNote}</p>
        </details>

        <div className="sazo-product-detail-purchase-actions" data-purchase-intent={sheetIntent}>
          {sheetIntent !== "buy" ? (
            <button
              className="sazo-product-detail-cart-button"
              onClick={() => {
                submitIntent("cart");
              }}
              type="button"
            >
              {t("sazo.views.productDetail.purchase.addToCart")}
            </button>
          ) : null}
          {sheetIntent !== "cart" ? (
            <button
              className="sazo-product-detail-buy-button"
              onClick={() => {
                submitIntent("buy");
              }}
              type="button"
            >
              {t("sazo.views.productDetail.purchase.buyNow")}
            </button>
          ) : null}
        </div>

        {controller.feedback === null ? null : (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="sazo-product-detail-feedback"
            data-kind={controller.feedback.kind}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            key={`${controller.feedback.kind}-${controller.feedback.message}`}
            role={
              announceFeedback
                ? controller.feedback.kind === "error"
                  ? "alert"
                  : "status"
                : undefined
            }
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {controller.feedback.message}
          </motion.p>
        )}
      </form>

      {showMobileActions ? (
        <div
          aria-label={t("sazo.views.productDetail.purchase.actionsLabel")}
          className="sazo-product-mobile-purchase"
          role="group"
        >
          <button
            className="sazo-product-detail-cart-button"
            onClick={() => {
              submitIntent("cart");
            }}
            type="button"
          >
            {t("sazo.views.productDetail.purchase.addToCart")}
          </button>
          <button
            className="sazo-product-detail-buy-button"
            onClick={() => {
              submitIntent("buy");
            }}
            type="button"
          >
            {t("sazo.views.productDetail.purchase.buyNow")}
          </button>
        </div>
      ) : null}
    </>
  );
}
