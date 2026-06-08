import { Bot, CheckCircle2, PackageCheck, Shirt } from "lucide-react";
import { useTranslation } from "react-i18next";

const marketItems = ["population", "commerce", "pix"] as const;
const detailTags = ["payment", "logistics", "compliance"] as const;

export function ProductSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-bg2/74 px-5 py-20 text-text sm:px-8 sm:py-24 lg:px-14 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-16">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] text-crimson">{t("home.product.label")}</p>
          <h2 className="mt-5 max-w-[12ch] font-display text-4xl font-semibold leading-[1.04] tracking-normal text-text sm:text-5xl lg:text-6xl">
            {t("home.product.title")}
          </h2>
          <p className="mt-6 max-w-[42rem] text-base leading-8 text-muted sm:text-lg sm:leading-9">
            {t("home.product.lead")}
          </p>

          <div className="mt-10 rounded-lg border border-text/10 bg-bg/72 p-5 sm:p-6">
            <div className="flex flex-col gap-2 border-b border-text/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="font-display text-2xl font-semibold text-text">{t("home.product.market.title")}</h3>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {t("home.product.market.sourceLabel")}
              </p>
            </div>
            <div className="divide-y divide-text/10">
              {marketItems.map((item) => (
                <article key={item} className="grid min-w-0 gap-x-4 gap-y-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <p className="font-mono text-3xl font-semibold leading-none text-text sm:text-4xl">
                    {t(`home.product.market.items.${item}.value`)}
                  </p>
                  <p className="text-xs font-medium leading-5 text-muted sm:text-right">
                    {t(`home.product.market.items.${item}.source`)}
                  </p>
                  <p className="text-sm font-semibold leading-6 text-text sm:col-span-2">{t(`home.product.market.items.${item}.label`)}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <div className="rounded-lg border border-text/10 bg-bg/88 p-4 shadow-2xl shadow-bg/30 sm:p-5">
            <div className="flex items-center gap-3 border-b border-text/10 pb-4">
              <span className="grid size-10 place-items-center rounded-full bg-crimson text-paper" aria-hidden="true">
                <Bot className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-text">{t("home.product.assistant.title")}</h3>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{t("brand.name")}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="max-w-[88%] rounded-lg bg-paper px-4 py-3 text-bg">
                <p className="text-sm font-medium leading-6">{t("home.product.assistant.request")}</p>
              </div>
              <div className="ml-auto max-w-[88%] rounded-lg border border-text/10 bg-bg2 px-4 py-3 text-text">
                <p className="text-sm font-medium leading-6">{t("home.product.assistant.suggestion")}</p>
              </div>

              {/* Placeholder commerce data for the mock assistant, not live product data. */}
              <div className="ml-auto flex max-w-[88%] gap-3 rounded-lg border border-text/10 bg-bg2 p-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-md bg-paper text-bg" aria-hidden="true">
                  <Shirt className="size-8" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-text">{t("home.product.assistant.product.name")}</p>
                  <p className="mt-1 font-mono text-sm text-muted">{t("home.product.assistant.product.price")}</p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {t("home.product.assistant.product.destination")} · {t("home.product.assistant.product.eta")}
                  </p>
                </div>
              </div>

              <div className="max-w-max rounded-lg bg-paper px-4 py-3 text-bg">
                <p className="text-sm font-semibold">{t("home.product.assistant.buy")}</p>
              </div>

              <div className="ml-auto max-w-[88%] rounded-lg border border-crimson/35 bg-bg2 px-4 py-3 text-text">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-crimson" strokeWidth={1.8} aria-hidden="true" />
                  <div>
                    <p className="font-display text-base font-semibold">{t("home.product.assistant.confirmed")}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{t("home.product.assistant.confirmedDetail")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-text/10 bg-bg/70 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-text/10 text-text" aria-hidden="true">
                <PackageCheck className="size-5" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold text-text">{t("home.product.detail.title")}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{t("home.product.detail.body")}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {detailTags.map((tag) => (
                <span key={tag} className="rounded-full border border-text/10 px-3 py-1 text-xs font-semibold text-muted">
                  {t(`home.product.detail.tags.${tag}`)}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
