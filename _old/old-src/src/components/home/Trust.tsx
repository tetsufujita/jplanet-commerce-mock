import { useTranslations } from "next-intl";

import { Section, Kicker, SectionTitle, type SectionProps } from "./_kit";

export function Trust(_props: SectionProps) {
  const t = useTranslations("home.trust");

  const pillars = [
    { title: t("p1Title"), body: t("p1Body") },
    { title: t("p2Title"), body: t("p2Body") },
    { title: t("p3Title"), body: t("p3Body") },
    { title: t("p4Title"), body: t("p4Body") },
  ];

  return (
    <Section>
      <div
        className="opacity-0 motion-safe:animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <Kicker>{t("kicker")}</Kicker>
      </div>

      <div
        className="opacity-0 motion-safe:animate-fade-up"
        style={{ animationDelay: "0.12s" }}
      >
        <SectionTitle>{t("title")}</SectionTitle>
      </div>

      <p
        className="mt-6 max-w-2xl text-pretty text-gray-500 opacity-0 [font-size:clamp(1rem,1.4vw,1.18rem)] motion-safe:animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        {t("lead")}
      </p>

      {/* credential tiles — first (通関 / PRC) is the marquee */}
      <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar, i) => {
          const marquee = i === 0;
          return (
            <li
              key={pillar.title}
              className={[
                "relative flex flex-col rounded-2xl border bg-andes-paper p-6 opacity-0 motion-safe:animate-fade-up",
                marquee ? "border-andes-navy/25" : "border-gray-100",
              ].join(" ")}
              style={{ animationDelay: `${0.28 + i * 0.07}s` }}
            >
              <span
                aria-hidden
                className={[
                  "mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-100",
                ].join(" ")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3 L20 6.2 V11 C20 16.2 16.6 19.6 12 21 C7.4 19.6 4 16.2 4 11 V6.2 Z"
                    stroke={
                      marquee
                        ? "var(--color-andes-crimson)"
                        : "rgba(15,27,61,0.45)"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.6 12 L11 14.4 L15.4 9.6"
                    stroke={
                      marquee
                        ? "var(--color-andes-crimson)"
                        : "rgba(15,27,61,0.45)"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="text-base font-semibold tracking-[-0.01em] text-andes-ink">
                {pillar.title}
              </h3>
              <p className="mt-1.5 font-display text-sm tracking-wide text-gray-500">
                {pillar.body}
              </p>
            </li>
          );
        })}
      </ul>

      {/* step-collapse diagram: many short stacked lines collapse into one bold line */}
      <div
        className="mt-16 flex flex-col items-center gap-6 opacity-0 motion-safe:animate-fade-up sm:flex-row sm:items-center sm:justify-center sm:gap-10"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            {t("collapseFrom")}
          </span>
          <svg
            aria-hidden
            width="200"
            height="84"
            viewBox="0 0 200 84"
            fill="none"
          >
            {[10, 24, 38, 52, 66].map((y, idx) => (
              <line
                key={y}
                x1="2"
                y1={y}
                x2={150 - idx * 8}
                y2={y}
                stroke="rgba(15,27,61,0.28)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        {/* collapse connector */}
        <svg
          aria-hidden
          width="120"
          height="84"
          viewBox="0 0 120 84"
          fill="none"
          className="rotate-90 sm:rotate-0"
        >
          {[10, 24, 38, 52, 66].map((y) => (
            <path
              key={y}
              d={`M4 ${y} C 52 ${y}, 60 38, 110 38`}
              stroke="rgba(15,27,61,0.22)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="3 5"
              className="net-flow"
            />
          ))}
          <circle
            cx="111"
            cy="38"
            r="4"
            fill="var(--color-andes-crimson)"
          />
        </svg>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-andes-ink">
            {t("collapseTo")}
          </span>
          <svg
            aria-hidden
            width="180"
            height="84"
            viewBox="0 0 180 84"
            fill="none"
          >
            <line
              x1="4"
              y1="38"
              x2="176"
              y2="38"
              stroke="var(--color-andes-navy)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </Section>
  );
}
