import { useTranslation } from "react-i18next";

export function ProductCampaignBanner() {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("sazo.views.productDetail.campaign.label")}
      className="sazo-product-campaign"
    >
      <div className="sazo-product-campaign-copy">
        <img
          alt=""
          aria-hidden
          height={72}
          src="/sazo-commerce/jplanet-sakura-mark.png"
          width={72}
        />
        <div>
          <p>{t("sazo.views.productDetail.campaign.eyebrow")}</p>
          <h2>{t("sazo.views.productDetail.campaign.title")}</h2>
          <span>{t("sazo.views.productDetail.campaign.body")}</span>
        </div>
      </div>
      <div aria-hidden className="sazo-product-campaign-route">
        <strong>{t("sazo.views.productDetail.campaign.origin")}</strong>
        <span>→</span>
        <strong>{t("sazo.views.productDetail.campaign.destination")}</strong>
      </div>
    </section>
  );
}
