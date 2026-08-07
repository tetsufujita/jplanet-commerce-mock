import { useState } from "react";
import {
  AtSign,
  Camera,
  ChevronDown,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type ViewDispatchProps } from "@/sazo-commerce/DirectoryViews";
import { serviceSteps } from "@/sazo-commerce/fixtures";

const faqIds = ["01", "02", "03", "04"] as const;
const trustItems = [
  { icon: ReceiptText, key: "trust01" },
  { icon: PackageCheck, key: "trust02" },
  { icon: Truck, key: "trust03" },
] as const;
const footerLinks = [
  "company",
  "careers",
  "press",
  "terms",
  "privacy",
  "commerce",
] as const;

export function ServiceView({ dispatch }: ViewDispatchProps) {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<(typeof faqIds)[number] | null>("01");

  return (
    <div className="sazo-service-view" data-view-content="service">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.service.title")} />
      <section className="sazo-service-hero">
        <div className="sazo-service-title">
          <p>{t("sazo.views.service.eyebrow")}</p>
          <h1>{t("sazo.views.service.title")}</h1>
        </div>
        <div className="sazo-service-url-card">
          <p>{t("sazo.views.service.urlHint")}</p>
          <div className="sazo-service-url-entry" role="search">
            <label className="sazo-visually-hidden" htmlFor="sazo-service-url">
              {t("sazo.views.service.urlLabel")}
            </label>
            <input
              id="sazo-service-url"
              placeholder={t("sazo.views.service.urlPlaceholder")}
              type="url"
            />
            <button type="button">
              <Search aria-hidden size={24} />
              {t("sazo.views.service.search")}
            </button>
          </div>
        </div>
      </section>

      <section className="sazo-service-steps">
        <h2>{t("sazo.views.service.stepsTitle")}</h2>
        <div className="sazo-service-step-list">
          {serviceSteps.map((step) => (
            <article className="sazo-service-step" data-step={step.id} key={step.id}>
              <div className="sazo-service-step-image">
                <img
                  alt=""
                  aria-hidden
                  decoding="async"
                  height={530}
                  loading="lazy"
                  src={step.image}
                  width={720}
                />
              </div>
              <div className="sazo-service-step-copy">
                <span>{t("sazo.views.service.stepLabel", { step: step.id })}</span>
                <h3>{t(`sazo.views.service.step${step.id}Title`)}</h3>
                <strong>{t(`sazo.views.service.step${step.id}Summary`)}</strong>
                <p>{t(`sazo.views.service.step${step.id}Body`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sazo-service-trust">
        <div className="sazo-service-trust-heading">
          <ShieldCheck aria-hidden size={34} />
          <h2>{t("sazo.views.service.trustTitle")}</h2>
        </div>
        <div className="sazo-service-trust-grid">
          {trustItems.map(({ icon: Icon, key }) => (
            <article key={key}>
              <Icon aria-hidden size={38} strokeWidth={1.7} />
              <h3>{t(`sazo.views.service.${key}`)}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="sazo-service-faq">
        <h2>{t("sazo.views.service.faqTitle")}</h2>
        <div className="sazo-faq-list">
          {faqIds.map((faqId) => {
            const expanded = faqId === openFaq;
            const answerId = `sazo-service-faq-${faqId}`;

            return (
              <article className="sazo-faq-item" key={faqId}>
                <h3>
                  <button
                    aria-controls={answerId}
                    aria-expanded={expanded}
                    onClick={() => {
                      setOpenFaq(expanded ? null : faqId);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && expanded) {
                        setOpenFaq(null);
                        event.currentTarget.focus();
                      }
                    }}
                    type="button"
                  >
                    <span>{t(`sazo.views.service.faq${faqId}Question`)}</span>
                    <ChevronDown aria-hidden size={22} />
                  </button>
                </h3>
                <div
                  aria-hidden={!expanded}
                  className="sazo-faq-answer"
                  data-expanded={expanded}
                  id={answerId}
                >
                  <p>{t(`sazo.views.service.faq${faqId}Answer`)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sazo-service-support">
        <img
          alt=""
          aria-hidden
          height={34}
          src="/sazo-commerce/logo-mark.svg"
          width={34}
        />
        <div className="sazo-support-socials">
          <button aria-label={t("sazo.views.service.supportX")} type="button">
            <AtSign aria-hidden size={22} />
          </button>
          <button aria-label={t("sazo.views.service.supportInstagram")} type="button">
            <Camera aria-hidden size={22} />
          </button>
          <button aria-label={t("sazo.views.service.supportLine")} type="button">
            <MessageCircle aria-hidden size={22} />
          </button>
        </div>
        <h2>{t("sazo.views.service.supportTitle")}</h2>
        <strong>{t("sazo.views.service.supportHours")}</strong>
        <p>{t("sazo.views.service.supportBody")}</p>
        <nav className="sazo-service-footer-links">
          {footerLinks.map((link) => (
            <button key={link} type="button">
              {t(`sazo.views.service.${link}`)}
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
}
