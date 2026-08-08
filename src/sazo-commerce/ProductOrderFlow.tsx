import { Check, Home, Package, PackageCheck, Plane, Store } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ProductOrderFlowProps {
  compact?: boolean;
}

const orderStages = [
  { icon: Check, labelKey: "received", state: "complete" },
  { icon: Store, labelKey: "purchased", state: "complete" },
  { icon: Package, labelKey: "warehouseArrived", state: "current" },
  { icon: PackageCheck, labelKey: "inspected", state: "pending" },
  { icon: Plane, labelKey: "shipping", state: "pending" },
  { icon: Home, labelKey: "delivered", state: "pending" },
] as const;

export function ProductOrderFlow({ compact = false }: ProductOrderFlowProps) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="sazo-product-order-flow-heading"
      className="sazo-product-order-flow"
      data-compact={compact || undefined}
    >
      <div className="sazo-product-order-flow-heading">
        <h3 id="sazo-product-order-flow-heading">
          <span>{t("sazo.views.productDetail.order.title")}</span>
          <strong>{t("sazo.views.productDetail.order.subtitle")}</strong>
        </h3>
        <a href="#sazo-product-detail-order-details">
          {t("sazo.views.productDetail.order.detailsLink")}
        </a>
      </div>
      <div className="sazo-product-detail-timeline-scroll">
        <ol
          aria-label={t("sazo.views.productDetail.order.listLabel")}
          className="sazo-product-detail-timeline"
        >
          {orderStages.map(({ icon: Icon, labelKey, state }, index) => (
            <li
              aria-current={state === "current" ? "step" : undefined}
              data-stage={index + 1}
              data-state={state}
              key={labelKey}
            >
              <span className="sazo-visually-hidden">
                {t(`sazo.views.productDetail.order.status.${state}`)}
              </span>
              <span className="sazo-product-detail-stage-icon">
                <Icon aria-hidden size={23} strokeWidth={1.9} />
              </span>
              <span className="sazo-product-detail-stage-number">
                {t("sazo.views.productDetail.order.step", { step: index + 1 })}
              </span>
              <strong>{t(`sazo.views.productDetail.order.stages.${labelKey}`)}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
