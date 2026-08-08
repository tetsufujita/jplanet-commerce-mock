import { Check, Home, PackageCheck, Store, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ProductOrderFlowProps {
  compact?: boolean;
}

const orderStages = [
  { icon: Check, labelKey: "received" },
  { icon: Store, labelKey: "purchased" },
  { icon: PackageCheck, labelKey: "inspected" },
  { icon: Truck, labelKey: "shipping" },
  { icon: Home, labelKey: "delivered" },
] as const;

export function ProductOrderFlow({ compact = false }: ProductOrderFlowProps) {
  const { t } = useTranslation();

  return (
    <section className="sazo-product-order-flow" data-compact={compact || undefined}>
      <div className="sazo-product-order-flow-heading">
        <div>
          <span>{t("sazo.views.productDetail.order.eyebrow")}</span>
          <h3>{t("sazo.views.productDetail.order.title")}</h3>
        </div>
        <a href="#sazo-product-detail-order-details">
          {t("sazo.views.productDetail.order.detailsLink")}
        </a>
      </div>
      <div className="sazo-product-detail-timeline-scroll">
        <ol
          aria-label={t("sazo.views.productDetail.order.listLabel")}
          className="sazo-product-detail-timeline"
        >
          {orderStages.map(({ icon: Icon, labelKey }, index) => (
            <li data-stage={index + 1} key={labelKey}>
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
