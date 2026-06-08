import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const stepIds = ["discover", "suggest", "purchase", "process", "deliver"] as const;

export function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-bg/82 px-5 py-20 text-text sm:px-8 sm:py-24 lg:px-14 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 border-b border-text/10 pb-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.18em] text-crimson">{t("home.howItWorks.label")}</p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-normal text-text sm:text-5xl lg:text-6xl">
              {t("home.howItWorks.title")}
            </h2>
          </div>
          <p className="max-w-[46rem] text-base leading-8 text-muted sm:text-lg sm:leading-9">{t("home.howItWorks.lead")}</p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-5 lg:gap-0">
          {stepIds.map((stepId, index) => (
            <article key={stepId} className="relative min-w-0 rounded-lg border border-text/10 bg-bg2/70 p-5 lg:rounded-none lg:border-l-0 lg:first:rounded-l-lg lg:first:border-l lg:last:rounded-r-lg">
              {index < stepIds.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-5 hidden text-crimson lg:block"
                >
                  <ArrowRight className="size-5" strokeWidth={1.6} />
                </span>
              ) : null}
              <p className="font-mono text-sm font-semibold text-crimson">{t(`home.howItWorks.steps.${stepId}.number`)}</p>
              <h3 className="mt-4 font-display text-2xl font-semibold text-text">{t(`home.howItWorks.steps.${stepId}.title`)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{t(`home.howItWorks.steps.${stepId}.description`)}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-crimson/35 bg-bg2 px-6 py-7 sm:px-8 lg:flex lg:items-end lg:justify-between">
          <p className="max-w-[44rem] font-display text-3xl font-semibold leading-tight text-text sm:text-4xl">
            {t("home.howItWorks.summary.body")}
          </p>
          <p className="mt-4 font-display text-3xl font-semibold leading-tight text-crimson sm:text-4xl lg:mt-0">
            {t("home.howItWorks.summary.emphasis")}
          </p>
        </div>
      </div>
    </section>
  );
}
