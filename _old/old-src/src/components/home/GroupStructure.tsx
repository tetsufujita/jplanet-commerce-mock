import { useTranslations } from "next-intl";

import { Section, Kicker, SectionTitle, type SectionProps } from "./_kit";

type Entity = {
  name: string;
  role: string;
  /** the single pin-point crimson dot marks the JP parent as the apex */
  apex?: boolean;
};

function EntityBox({ name, role, apex, delay }: Entity & { delay: string }) {
  return (
    <div
      className="relative w-full max-w-md rounded-xl border border-gray-200 bg-andes-paper px-6 py-5 opacity-0 motion-safe:animate-fade-up"
      style={{ animationDelay: delay }}
    >
      {apex ? (
        <span
          aria-hidden
          className="absolute right-5 top-6 inline-block h-2 w-2 rounded-full bg-andes-crimson"
        />
      ) : null}
      <p className="font-display text-base font-semibold tracking-[-0.01em] text-andes-ink sm:text-lg">
        {name}
      </p>
      <p className="mt-1 text-sm text-gray-500">{role}</p>
    </div>
  );
}

function Connector({ percent, delay }: { percent: string; delay: string }) {
  return (
    <div
      className="flex items-center gap-3 py-3 opacity-0 motion-safe:animate-fade-up"
      style={{ animationDelay: delay }}
    >
      <svg aria-hidden width="2" height="44" viewBox="0 0 2 44" fill="none">
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="44"
          stroke="rgba(15,27,61,0.25)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 tabular-nums">
        {percent}
      </span>
    </div>
  );
}

export function GroupStructure(_: SectionProps) {
  const t = useTranslations("home.group");

  return (
    <Section id="group">
      <Kicker>{t("kicker")}</Kicker>
      <SectionTitle className="opacity-0 motion-safe:animate-fade-up">
        {t("title")}
      </SectionTitle>
      <p
        className="mt-5 max-w-2xl text-balance text-gray-600 opacity-0 [font-size:clamp(1rem,1.3vw,1.12rem)] motion-safe:animate-fade-up"
        style={{ animationDelay: "0.12s" }}
      >
        {t("lead")}
      </p>

      <div className="mt-12 flex flex-col items-center text-center sm:items-start sm:text-left">
        <EntityBox name={t("e1Name")} role={t("e1Role")} apex delay="0.18s" />
        <Connector percent="100%" delay="0.24s" />
        <EntityBox name={t("e2Name")} role={t("e2Role")} delay="0.3s" />
        <Connector percent="99%" delay="0.36s" />
        <EntityBox name={t("e3Name")} role={t("e3Role")} delay="0.42s" />
      </div>
    </Section>
  );
}
