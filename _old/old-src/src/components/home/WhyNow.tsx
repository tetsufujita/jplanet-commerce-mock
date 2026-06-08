import { useTranslations } from "next-intl";

import { Section, Kicker, SectionTitle, type SectionProps } from "./_kit";

const navyStroke = "rgba(15,27,61,0.7)";
const faintStroke = "rgba(15,27,61,0.25)";

function FrictionIcon() {
  // 物理/法/税の摩擦: 多段の障壁にぶつかる経路
  return (
    <svg aria-hidden viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <path
        d="M4 36 L14 36 L20 14 L28 36 L38 14 L44 36"
        stroke={navyStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="14" y1="36" x2="14" y2="8" stroke={faintStroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="36" x2="28" y2="8" stroke={faintStroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38" y1="36" x2="38" y2="8" stroke={faintStroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MergeIcon() {
  // 購入と運用を一体で: 二本が一本に合流
  return (
    <svg aria-hidden viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <path
        d="M6 10 C 20 10, 22 24, 38 24"
        stroke={navyStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 38 C 20 38, 22 24, 38 24"
        stroke={navyStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="40" cy="24" r="3.5" fill="var(--color-andes-crimson)" />
    </svg>
  );
}

function RippleIcon() {
  // 現場が規範になる: 中心から外へ広がる波紋
  return (
    <svg aria-hidden viewBox="0 0 48 48" fill="none" className="h-9 w-9">
      <circle cx="24" cy="24" r="3" fill="var(--color-andes-crimson)" />
      <circle cx="24" cy="24" r="9" stroke={navyStroke} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="15" stroke={faintStroke} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="21" stroke={faintStroke} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function WhyNow(_props: SectionProps) {
  const t = useTranslations("home.whynow");

  const points = [
    { title: t("p1Title"), body: t("p1Body"), Icon: FrictionIcon },
    { title: t("p2Title"), body: t("p2Body"), Icon: MergeIcon },
    { title: t("p3Title"), body: t("p3Body"), Icon: RippleIcon },
  ];

  return (
    <Section>
      <Kicker>
        <span className="opacity-0 motion-safe:animate-fade-up" style={{ animationDelay: "0.05s" }}>
          {t("kicker")}
        </span>
      </Kicker>

      <SectionTitle className="opacity-0 motion-safe:animate-fade-up [animation-delay:0.15s]">
        {t("lead")}
      </SectionTitle>

      <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {points.map(({ title, body, Icon }, i) => (
          <div
            key={title}
            className="opacity-0 motion-safe:animate-fade-up"
            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
          >
            <Icon />
            <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-andes-ink">{title}</h3>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-gray-500">{body}</p>
          </div>
        ))}
      </div>

      {/* before / after 純概念図: 多段摩擦 ▶ 一本の Andes line */}
      <div
        className="mt-20 rounded-2xl border border-gray-100 bg-white/50 px-6 py-8 opacity-0 motion-safe:animate-fade-up sm:px-10"
        style={{ animationDelay: "0.6s" }}
      >
        <svg
          aria-hidden
          viewBox="0 0 720 160"
          fill="none"
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* before: 多段摩擦の折れ線 */}
          <text x="0" y="20" fill={faintStroke} fontSize="12" letterSpacing="2" className="font-display">
            BEFORE
          </text>
          <path
            d="M0 56 L60 56 L96 32 L132 80 L168 36 L204 78 L240 40 L276 74 L312 56 L330 56"
            stroke={faintStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[60, 132, 204, 276].map((cx) => (
            <circle key={cx} cx={cx} cy="56" r="3" fill="none" stroke={faintStroke} strokeWidth="1.5" />
          ))}

          {/* divider arrow ▶ */}
          <path
            d="M352 56 L388 56"
            stroke="rgba(15,27,61,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M384 51 L392 56 L384 61 Z" fill="rgba(15,27,61,0.4)" />

          {/* after: 一本化された Andes line */}
          <text x="414" y="20" fill={navyStroke} fontSize="12" letterSpacing="2" className="font-display">
            ANDES
          </text>
          <path
            d="M414 56 L700 56"
            stroke={navyStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="6 8"
            className="net-flow"
          />
          <circle cx="414" cy="56" r="4" fill="none" stroke={navyStroke} strokeWidth="1.5" />
          <circle cx="700" cy="56" r="4" fill="var(--color-andes-crimson)" />
          <circle
            cx="700"
            cy="56"
            r="9"
            fill="none"
            stroke="var(--color-andes-crimson)"
            strokeWidth="1"
            opacity="0.4"
            className="net-pulse"
          />
        </svg>
      </div>
    </Section>
  );
}
