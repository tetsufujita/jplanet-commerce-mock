import Link from "next/link";
import { useTranslations } from "next-intl";

import { Kicker, Section, SectionTitle, type SectionProps } from "./_kit";

export function Portfolio({ locale }: SectionProps) {
  const t = useTranslations("home.portfolio");

  const steps: { key: "phoneStep1" | "phoneStep2" | "phoneStep3"; done: boolean }[] = [
    { key: "phoneStep1", done: true },
    { key: "phoneStep2", done: true },
    { key: "phoneStep3", done: false },
  ];

  return (
    <Section>
      <div className="opacity-0 motion-safe:animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <Kicker>{t("kicker")}</Kicker>
        <SectionTitle>{t("title")}</SectionTitle>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        {/* J-Planet — main proof card */}
        <div
          className="rounded-2xl border border-gray-100 bg-white p-7 opacity-0 shadow-[0_1px_2px_rgba(15,27,61,0.04)] motion-safe:animate-fade-up sm:p-10 lg:col-span-8"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center rounded-full border border-andes-navy/15 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                {t("jpTag")}
              </span>

              <h3 className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl font-semibold tracking-[-0.01em] text-andes-ink sm:text-3xl">
                  {t("jpName")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-andes-crimson" />
                  {t("jpStatus")}
                </span>
              </h3>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-andes-ink/80">
                {t("jpDesc")}
              </p>

              <p className="mt-6 text-[13px] leading-relaxed text-gray-500 sm:hidden">{t("jpCaption")}</p>
            </div>

            {/* Drawn phone mock — order-status thread (placeholder, NOT a catalog) */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="w-[220px] shrink-0 rounded-[2rem] border-[6px] border-andes-navy bg-andes-paper p-3 shadow-[0_18px_40px_-22px_rgba(15,27,61,0.5)]">
                {/* notch */}
                <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-andes-navy/30" aria-hidden />

                <div className="rounded-2xl border border-andes-navy/10 bg-white p-4">
                  <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {t("phoneOrderTitle")}
                  </p>

                  {/* vertical stepper */}
                  <ol className="mt-4 space-y-0">
                    {steps.map((step, i) => (
                      <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
                        {/* connector line */}
                        {i < steps.length - 1 ? (
                          <span
                            aria-hidden
                            className="absolute left-[7px] top-4 h-full w-px bg-andes-navy/15"
                          />
                        ) : null}

                        {/* check dot */}
                        <span
                          aria-hidden
                          className={
                            step.done
                              ? "relative z-10 mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-andes-crimson"
                              : "relative z-10 mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-andes-navy/30 bg-white"
                          }
                        >
                          {step.done ? (
                            <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" aria-hidden>
                              <path
                                d="M2.5 6.2 L4.8 8.5 L9.3 3.5"
                                stroke="var(--color-andes-paper)"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>

                        <span
                          className={
                            step.done
                              ? "text-[13px] font-medium text-andes-ink"
                              : "text-[13px] text-gray-500"
                          }
                        >
                          {t(step.key)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* mandatory caption (desktop placement, mirrors mobile copy above) */}
              <p className="mt-4 hidden max-w-[220px] text-center text-[12px] leading-relaxed text-gray-500 sm:block">
                {t("jpCaption")}
              </p>
            </div>
          </div>
        </div>

        {/* Long-term destination — ascending card */}
        <div
          className="flex flex-col rounded-2xl border border-andes-navy/10 bg-andes-navy p-7 text-andes-paper opacity-0 motion-safe:animate-fade-up sm:p-8 lg:col-span-4"
          style={{ animationDelay: "0.32s" }}
        >
          {/* ascending modules mark */}
          <svg
            aria-hidden
            viewBox="0 0 64 40"
            className="h-9 w-16"
            fill="none"
          >
            <rect x="2" y="26" width="14" height="12" rx="2.5" stroke="rgba(250,250,247,0.4)" strokeWidth="1.5" />
            <rect x="20" y="16" width="14" height="22" rx="2.5" stroke="rgba(250,250,247,0.55)" strokeWidth="1.5" />
            <rect x="38" y="4" width="14" height="34" rx="2.5" stroke="var(--color-andes-crimson)" strokeWidth="1.5" />
            <path
              d="M56 14 L60 8 L60 14"
              stroke="var(--color-andes-crimson)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-andes-paper/55">
            {t("destLabel")}
          </p>

          <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.01em] text-balance">
            {t("destTitle")}
          </h3>

          <p className="mt-4 text-[14px] leading-relaxed text-andes-paper/70">{t("destBody")}</p>

          <Link
            href={`/${locale}/about`}
            className="group mt-auto inline-flex items-center pt-8 text-[14px] font-semibold text-andes-paper transition-colors duration-300 ease-andes hover:text-andes-glow"
          >
            {t("destCta")}
            <span aria-hidden className="ml-2 transition-transform duration-300 ease-andes group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
