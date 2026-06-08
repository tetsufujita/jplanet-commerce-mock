import Link from "next/link";
import { useTranslations } from "next-intl";

import { buttonClassName } from "@/components/ui/Button";

import { Section, Kicker, SectionTitle, type SectionProps } from "./_kit";

type Benefit = {
  titleKey: "b1Title" | "b2Title" | "b3Title";
  bodyKey: "b1Body" | "b2Body" | "b3Body";
  icon: "complexity" | "channel" | "shield";
  delay: string;
};

const benefits: Benefit[] = [
  { titleKey: "b1Title", bodyKey: "b1Body", icon: "complexity", delay: "0.18s" },
  { titleKey: "b2Title", bodyKey: "b2Body", icon: "channel", delay: "0.26s" },
  { titleKey: "b3Title", bodyKey: "b3Body", icon: "shield", delay: "0.34s" },
];

function BenefitIcon({ name }: { name: Benefit["icon"] }) {
  const stroke = "rgba(15,27,61,.55)";
  return (
    <svg
      aria-hidden
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "complexity" && (
        <>
          {/* many tangled inputs collapsing into one clean output */}
          <path d="M4 7h7M4 14h5M4 21h7" stroke={stroke} />
          <path d="M11 7c5 0 3 7 7 7M9 14h9M11 21c5 0 3-7 7-7" stroke={stroke} />
          <circle cx="22" cy="14" r="3" stroke={stroke} fill="none" />
          <circle cx="22" cy="14" r="1.2" fill="var(--color-andes-crimson)" stroke="none" />
        </>
      )}
      {name === "channel" && (
        <>
          {/* node distributing to local reach */}
          <circle cx="7" cy="14" r="3" stroke={stroke} fill="none" />
          <path d="M10 14h5M15 14l5-6M15 14l5 6M15 14h6" stroke={stroke} />
          <circle cx="22" cy="8" r="1.6" stroke={stroke} fill="none" />
          <circle cx="21" cy="14" r="1.6" stroke={stroke} fill="none" />
          <circle cx="22" cy="20" r="1.6" stroke={stroke} fill="none" />
        </>
      )}
      {name === "shield" && (
        <>
          {/* compliant clearance shield with verified mark */}
          <path d="M14 4l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V7l8-3z" stroke={stroke} fill="none" />
          <path d="M10.5 13.6l2.4 2.4 4.6-5" stroke="var(--color-andes-crimson)" />
        </>
      )}
    </svg>
  );
}

export function Seller({ locale }: SectionProps) {
  const t = useTranslations("home.seller");

  return (
    <Section id="seller">
        <div className="opacity-0 motion-safe:animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <Kicker>{t("kicker")}</Kicker>
        </div>
        <SectionTitle className="opacity-0 motion-safe:animate-fade-up [animation-delay:0.12s]">
          {t("title")}
        </SectionTitle>

        {/* seller -> Andes -> consumer : abstract flow, no storefront */}
        <svg
          aria-hidden
          className="mt-12 w-full max-w-3xl opacity-0 motion-safe:animate-fade-up"
          style={{ animationDelay: "0.16s" }}
          viewBox="0 0 720 96"
          fill="none"
          strokeLinecap="round"
        >
          {/* seller node */}
          <rect x="14" y="30" width="150" height="36" rx="10" fill="none" stroke="rgba(15,27,61,.25)" strokeWidth="1.5" />
          {/* Andes platform node */}
          <rect x="285" y="22" width="150" height="52" rx="12" fill="none" stroke="rgba(15,27,61,.45)" strokeWidth="1.5" />
          {/* consumer node */}
          <rect x="556" y="30" width="150" height="36" rx="10" fill="none" stroke="rgba(15,27,61,.25)" strokeWidth="1.5" />

          {/* flow lines */}
          <path d="M164 48h121" stroke="rgba(15,27,61,.3)" strokeWidth="1.5" strokeDasharray="5 7" className="net-flow" />
          <path d="M435 48h121" stroke="rgba(15,27,61,.3)" strokeWidth="1.5" strokeDasharray="5 7" className="net-flow" />

          {/* endpoint emphasis dot (single, crimson) at delivery */}
          <circle cx="556" cy="48" r="3" fill="var(--color-andes-crimson)" />
          <circle cx="556" cy="48" r="7" fill="none" stroke="var(--color-andes-crimson)" strokeWidth="1" opacity="0.35" className="net-pulse" />
        </svg>

        {/* benefit cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.titleKey}
              className="rounded-xl border border-gray-100 bg-andes-paper p-6 opacity-0 transition duration-300 ease-andes hover:-translate-y-1 hover:border-andes-navy/20 motion-safe:animate-fade-up"
              style={{ animationDelay: b.delay }}
            >
              <BenefitIcon name={b.icon} />
              <h3 className="mt-5 font-semibold tracking-[-0.01em] [font-size:clamp(1.05rem,1.4vw,1.2rem)]">
                {t(b.titleKey)}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-500">{t(b.bodyKey)}</p>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div
          className="mt-12 flex flex-wrap items-center gap-3 opacity-0 motion-safe:animate-fade-up"
          style={{ animationDelay: "0.42s" }}
        >
          <Link
            href={`/${locale}/contact`}
            className={buttonClassName("crimson", "min-h-12 px-6")}
          >
            {t("ctaPrimary")} <span aria-hidden className="ml-2">→</span>
          </Link>
          <Link href={`/${locale}/contact`} className={buttonClassName("secondary", "min-h-12 px-6")}>
            {t("ctaSecondary")}
          </Link>
        </div>
    </Section>
  );
}
