import Link from "next/link";
import { useTranslations } from "next-intl";

import { buttonClassName } from "@/components/ui/Button";

import { Container, type SectionProps } from "./_kit";

const contacts = [
  { key: "contactInvestor", email: "ir@andes.global" },
  { key: "contactCareers", email: "careers@andes.global" },
  { key: "contactPress", email: "press@andes.global" },
  { key: "contactPartner", email: "partners@andes.global" },
] as const;

export function FooterCta({ locale }: SectionProps) {
  const t = useTranslations("home.footerCta");

  return (
    <footer className="relative isolate overflow-hidden bg-andes-navy text-andes-paper">
      {/* dot grid (matches Hero texture) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(rgba(250,250,247,0.06) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <Container className="relative z-10 py-24 sm:py-28">
        {/* CTA band */}
        <div className="flex flex-col items-center text-center">
          <h2
            className="max-w-3xl text-balance font-semibold leading-[1.08] tracking-[-0.02em] opacity-0 [font-size:clamp(1.9rem,4vw,3.1rem)] motion-safe:animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            {t("title")}
          </h2>

          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-3 opacity-0 motion-safe:animate-fade-up"
            style={{ animationDelay: "0.18s" }}
          >
            <Link
              href={`/${locale}/contact`}
              className={buttonClassName("crimson", "min-h-12 px-6 text-[15px]")}
            >
              {t("ctaPrimary")} <span aria-hidden className="ml-2">→</span>
            </Link>
            <Link
              href={`/${locale}/careers`}
              className={buttonClassName("paper", "min-h-12 px-6 text-[15px]")}
            >
              {t("ctaSecondary")} <span aria-hidden className="ml-2">→</span>
            </Link>
          </div>

          {/* 4 contact mailto windows */}
          <ul
            className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm opacity-0 motion-safe:animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            {contacts.map((c, i) => (
              <li key={c.key} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden className="mr-2 text-andes-paper/25">
                    /
                  </span>
                )}
                <a
                  href={`mailto:${c.email}`}
                  className="rounded-sm text-andes-paper/70 underline-offset-4 transition-colors duration-300 hover:text-andes-paper hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-paper"
                >
                  {t(c.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* divider */}
        <hr className="my-14 border-andes-paper/10" />

        {/* legal entities */}
        <p className="font-display text-xs uppercase tracking-[0.18em] text-andes-paper/55">
          {t("legalEntities")}
        </p>

        {/* nav row */}
        <nav
          aria-label={t("colCompany")}
          className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm"
        >
          <Link
            href={`/${locale}/businesses`}
            className="rounded-sm text-andes-paper/70 transition-colors duration-300 hover:text-andes-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-paper"
          >
            {t("colBusinesses")}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="rounded-sm text-andes-paper/70 transition-colors duration-300 hover:text-andes-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-paper"
          >
            {t("colCompany")}
          </Link>
          <Link
            href={`/${locale}/careers`}
            className="rounded-sm text-andes-paper/70 transition-colors duration-300 hover:text-andes-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-paper"
          >
            {t("colCareers")}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="rounded-sm text-andes-paper/70 transition-colors duration-300 hover:text-andes-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-paper"
          >
            {t("colLegal")}
          </Link>
        </nav>

        {/* copyright + location */}
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-andes-paper/45">
          <span>{t("copyright")}</span>
          <span aria-hidden className="text-andes-paper/25">
            |
          </span>
          <span>{t("location")}</span>
        </div>
      </Container>
    </footer>
  );
}
