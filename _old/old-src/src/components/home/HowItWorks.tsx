import { useTranslations } from "next-intl";

import { Section, Kicker, SectionTitle, type SectionProps } from "./_kit";

const STEP_KEYS = ["step1", "step2", "step3", "step4"] as const;

export function HowItWorks(_props: SectionProps) {
  const t = useTranslations("home.how");

  return (
    <Section id="how">
      <Kicker>{t("kicker")}</Kicker>
      <SectionTitle className="opacity-0 motion-safe:animate-fade-up [animation-delay:0.1s]">
        {t("title")}
      </SectionTitle>

      {/* dark "system" panel inside the light section */}
      <div
        className="mt-12 rounded-2xl bg-andes-navy p-8 text-andes-paper opacity-0 motion-safe:animate-fade-up sm:p-10 lg:p-12"
        style={{ animationDelay: "0.2s" }}
      >
        {/* (a) left -> right step flow: 4 abstract agent/platform nodes */}
        <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* connecting animated dashed flow line — desktop only, behind nodes */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-7 hidden h-px w-full lg:block"
            viewBox="0 0 1000 2"
            preserveAspectRatio="none"
            fill="none"
          >
            <line
              x1="0"
              y1="1"
              x2="1000"
              y2="1"
              stroke="rgba(250,250,247,0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 10"
              className="motion-safe:net-flow"
            />
          </svg>

          {STEP_KEYS.map((key, i) => {
            const isLast = i === STEP_KEYS.length - 1;
            return (
              <li key={key} className="relative z-10 flex flex-col items-center text-center">
                <StepNode index={i + 1} isLast={isLast} />
                <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-andes-paper/75">
                  {t(key)}
                </p>
              </li>
            );
          })}
        </ol>

        {/* (b) 2-layer band: thin branding layer over a dominant platform layer */}
        <div className="mt-12 overflow-hidden rounded-xl border border-andes-paper/15">
          {/* Layer 1 — thin branding band */}
          <div className="flex flex-col gap-1 border-b border-andes-paper/15 bg-andes-paper/[0.04] px-6 py-5 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-andes-paper/70 sm:w-56 sm:shrink-0">
              {t("layer1Title")}
            </span>
            <span className="text-sm text-andes-paper/65">{t("layer1Body")}</span>
          </div>

          {/* Layer 2 — thick platform band (visually dominant, the real value) */}
          <div className="flex flex-col gap-3 bg-andes-paper/[0.07] px-6 py-10 sm:flex-row sm:items-center sm:gap-6 sm:py-12">
            <div className="sm:w-56 sm:shrink-0">
              <span className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-andes-paper">
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-andes-crimson net-pulse" />
                {t("layer2Title")}
              </span>
            </div>
            <p className="max-w-2xl text-[15px] leading-relaxed text-andes-paper/85">
              {t("layer2Body")}
            </p>
          </div>
        </div>

        {/* (c) closing one-liner */}
        <p className="mt-8 text-center text-sm text-andes-paper/60 sm:text-[15px]">
          {t("note")}
        </p>
      </div>
    </Section>
  );
}

function StepNode({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-andes-paper/30 bg-andes-navy">
      <svg aria-hidden viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        {isLast ? (
          // delivery endpoint — single crimson accent dot
          <>
            <circle
              cx="20"
              cy="20"
              r="11"
              stroke="rgba(250,250,247,0.55)"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="20" r="3.5" fill="var(--color-andes-crimson)" />
          </>
        ) : (
          // abstract agent / platform node: circuit cluster, no chat / product UI
          <>
            <circle cx="20" cy="20" r="11" stroke="rgba(250,250,247,0.4)" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="3" stroke="rgba(250,250,247,0.7)" strokeWidth="1.5" />
            <path
              d="M20 9v5M20 26v5M9 20h5M26 20h5"
              stroke="rgba(250,250,247,0.55)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="6.5" r="1.4" fill="rgba(250,250,247,0.7)" />
            <circle cx="20" cy="33.5" r="1.4" fill="rgba(250,250,247,0.7)" />
            <circle cx="6.5" cy="20" r="1.4" fill="rgba(250,250,247,0.7)" />
            <circle cx="33.5" cy="20" r="1.4" fill="rgba(250,250,247,0.7)" />
          </>
        )}
      </svg>
      <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-andes-paper/10 font-display text-[11px] font-semibold tabular-nums text-andes-paper/70">
        {index}
      </span>
    </span>
  );
}
