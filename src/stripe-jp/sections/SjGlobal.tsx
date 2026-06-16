import { useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SjGlobalDataviz } from "./SjGlobalDataviz";

/* ------------------------------------------------------------------ */
/* §4 数値帯（stats）— .stats-section.stats-section--time-sunrise の再現 */
/* DOM: stripe-jp-dom.html offset 357,073–375,933                      */
/* motion: 01-motion-spec.md §1(§4)                                    */
/*   - section entrance なし / count-up なし（P7: 未検出 → 静的表示）    */
/*   - stats-menu: --active-stat-index の indicator 移動（クリック切替）  */
/*   - 時間帯テーマ: gradient 背景クロスフェード（combobox 切替）         */
/* ------------------------------------------------------------------ */

const ASSETS = "https://images.stripeassets.com/fzn2n1nzq965";

interface Stat {
  id: string;
  value: string;
  description: ReactNode;
  /* data-viz__static の stat 別 fallback 画像 */
  img: string;
}

const STATS: Stat[] = [
  {
    id: "payment-methods",
    value: "135 +",
    description: "対応通貨と決済手段",
    img: `${ASSETS}/7iwVhEHuNr5enwnkdi5vF0/221ef0ed4b2645423151dc17202ce4e4/dataviz-fallback_2x.png`,
  },
  {
    id: "payments-volume",
    value: "$1.9兆",
    description: "2025 年の決済処理総額。",
    img: `${ASSETS}/64K1iZhe99ADmiTzeY5TeI/47cfb0a595bbe98513df60c751aad398/volume-fallback_2x.png`,
  },
  {
    id: "historical-uptime",
    value: "99.999%",
    description: (
      <>
        Stripe サービスの
        <a
          className="underline decoration-[rgba(10,37,64,0.3)] underline-offset-2 transition-colors hover:text-[#0a2540]"
          href="https://status.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          稼働率
        </a>
      </>
    ),
    img: `${ASSETS}/3SSo3PvsWE5lIEvc8xdMxs/df73b1b2269139f7466517ee14967847/uptime-fallback_2x.png`,
  },
  {
    id: "active-subscriptions",
    value: "2億 +",
    description: "Stripe Billing 上のサブスクリプション数",
    img: `${ASSETS}/6qa6IWCkNVnR0GhesY6Vzx/350d2ff12acb6b9677def4bf98b8251c/subscriptions-fallback_2x.png`,
  },
];

/* mobile 用静的 Dataviz（stats-section__globe） */
const GLOBE_STATIC = `${ASSETS}/63zO5Z4CABvFl3pLLhnu3l/a9c12c883f820dc29d29fa0b9dcb0814/DatavizStatic3x.png`;

/* ------------------------- time-of-day themes ---------------------- */
/* 本家 = stats-animation-gradient__gradient--{pre-dawn..night} の      */
/* opacity クロスフェード。gradient 値は f-scroll/031–033 からの目視近似 */

interface TimeTheme {
  id: string;
  label: string;
  gradient: string;
  icon: string;
  indicator: string;
  night?: boolean;
}

const SUNRISE: TimeTheme = {
  id: "sunrise",
  label: "日の出",
  gradient:
    "radial-gradient(100% 80% at 50% 95%, #ffb152 0%, #ffd9a3 35%, #ffeed9 62%, #ffffff 88%)",
  icon: "#e0526e",
  indicator: "linear-gradient(90deg, #ffd66e 0%, #ff8a5c 45%, #f471b5 100%)",
};

const THEMES: TimeTheme[] = [
  {
    id: "pre-dawn",
    label: "日の出前",
    gradient:
      "radial-gradient(110% 80% at 50% 95%, #aebdf2 0%, #d9e0f7 40%, #f4f6fd 70%, #ffffff 90%)",
    icon: "#6f7cf3",
    indicator: "linear-gradient(90deg, #8fa6f7, #b08df0, #d9a9f5)",
  },
  SUNRISE,
  {
    id: "daytime",
    label: "日中",
    gradient:
      "radial-gradient(110% 80% at 50% 95%, #8ed1ff 0%, #c8e9ff 40%, #ecf7ff 70%, #ffffff 90%)",
    icon: "#0073e6",
    indicator: "linear-gradient(90deg, #4fc3ff, #3a8dff, #7ab8ff)",
  },
  {
    id: "dusk",
    label: "日暮れ",
    gradient:
      "radial-gradient(110% 80% at 50% 95%, #ff9d7e 0%, #ffc9b3 38%, #ffe9e0 66%, #ffffff 90%)",
    icon: "#d6553f",
    indicator: "linear-gradient(90deg, #ffb27d, #ff7e5f, #e85d9e)",
  },
  {
    id: "sunset",
    label: "日没",
    gradient:
      "radial-gradient(110% 80% at 50% 95%, #c86dd7 0%, #f0a3c0 40%, #ffe3ea 70%, #ffffff 92%)",
    icon: "#a64ca6",
    indicator: "linear-gradient(90deg, #f7a8c4, #d36bd6, #8e5be8)",
  },
  {
    id: "night",
    label: "夜",
    gradient:
      "radial-gradient(110% 80% at 50% 95%, #1b2a5e 0%, #45518f 40%, #c3c9e8 75%, #ffffff 95%)",
    icon: "#3c4a8f",
    indicator: "linear-gradient(90deg, #3d4f9e, #5a6acf, #8a96e8)",
    night: true,
  },
];

/* ----------------------------- parts ------------------------------- */

/* 本家 time-of-day-select-icon（sun 中心円 + 光線 8 本 / 夜は moon path）
   本家は theme ごとに pathLength dash で arc を部分描画するが、ここでは
   sun ⇄ moon の opacity 切替に簡略化 */
function TimeOfDayIcon({ night }: { night: boolean }) {
  const rays: string[] = [
    "M16.5 10H19",
    "M14.5962 14.5962L16.364 16.364",
    "M10 16.5V19",
    "M5.404 14.596L3.63623 16.3638",
    "M3.5 10H1",
    "M5.404 5.404L3.63623 3.63623",
    "M10 3.5V1",
    "M16.364 3.63604L14.5962 5.40381",
  ];
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        className="transition-opacity duration-300"
        style={{ opacity: night ? 0 : 1 }}
      >
        <circle
          cx="10"
          cy="10"
          r="4.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {rays.map((d) => (
          <path key={d} d={d} stroke="currentColor" strokeWidth="1.5" />
        ))}
      </g>
      <path
        className="transition-opacity duration-300"
        style={{ opacity: night ? 1 : 0 }}
        d="M8.84473 4.19678C8.41483 5.57119 8.02147 8.0825 9.96973 10.0308C11.9176 11.9782 14.4272 11.5836 15.8018 11.1538C15.2653 13.8687 12.8724 15.9163 10 15.9165C6.73242 15.9165 4.08318 13.268 4.08301 10.0005C4.08301 7.12833 6.13028 4.73366 8.84473 4.19678Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* --------------------------- component ----------------------------- */

export function SjGlobal() {
  const reduceMotion = useReducedMotion();
  const [activeStat, setActiveStat] = useState(0);
  /* 初期値 = sunrise（DOM: stats-section--time-sunrise） */
  const [themeIndex, setThemeIndex] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  const theme: TimeTheme = THEMES[themeIndex] ?? SUNRISE;

  return (
    <section className="relative overflow-hidden bg-white pt-[88px]">
      {/* 時間帯 gradient 背景（6 layer の opacity クロスフェード） */}
      <div className="absolute inset-0" aria-hidden="true">
        {THEMES.map((t) => (
          <div
            key={t.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              background: t.gradient,
              opacity: t.id === theme.id ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* 本家 stats-section__container は sj-container より広い（実測 content 1266px） */}
      <div className="relative mx-auto max-w-[1264px] px-4">
        {/* hds-heading--xxl。原文 &nbsp; で「を 支える基盤」が行頭にまとまり 2 行折り */}
        <h2 className="mx-auto mb-[76px] max-w-[540px] text-center text-[34px] font-semibold leading-[1.25] text-[#0a2540] md:text-[52px] md:leading-[1.2]">
          グローバルなコマースを&nbsp;支える基盤
        </h2>

        {/* stats-menu: 上下 hairline + active indicator（gradient 線が移動） */}
        <div className="grid grid-cols-2 gap-x-4 border-y border-[rgba(10,37,64,0.12)] md:grid-cols-4">
          {STATS.map((stat, i) => {
            const isActive = activeStat === i;
            return (
              <div key={stat.id} className="relative px-2 py-[42px] text-center md:px-4">
                {isActive && (
                  <motion.span
                    layoutId="sj-stat-indicator"
                    className="pointer-events-none absolute inset-0"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.35, ease: "easeOut" }
                    }
                    aria-hidden="true"
                  >
                    <span
                      className="absolute -top-px left-0 right-0 h-[2px]"
                      style={{ background: theme.indicator }}
                    />
                    <span
                      className="absolute -bottom-px left-0 right-0 h-[2px]"
                      style={{ background: theme.indicator }}
                    />
                  </motion.span>
                )}
                <button
                  type="button"
                  className="block w-full text-center"
                  aria-labelledby={`sj-stat-${stat.id}-value`}
                  aria-describedby={`sj-stat-${stat.id}-description`}
                  aria-pressed={isActive}
                  onClick={() => { setActiveStat(i); }}
                >
                  <p
                    id={`sj-stat-${stat.id}-value`}
                    className={`text-[40px] leading-[1.2] tracking-[-0.4px] transition-colors duration-300 ${
                      isActive ? "text-[#0a2540]" : "text-[#727f96] hover:text-[#42546b]"
                    }`}
                  >
                    {stat.value}
                  </p>
                </button>
                <span
                  id={`sj-stat-${stat.id}-description`}
                  className="mx-auto mt-1 block max-w-[220px] text-[15px] leading-[1.5] text-[#596171] [text-wrap:balance]"
                >
                  {stat.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* 時間帯セレクタ（本家 = combobox + listbox。録画 rec-fluid f048:
            白パネル・6 項目・icon + label・active 太字） */}
        <div className="relative z-10 flex justify-end pr-5 pt-5">
          <div className="relative">
            <button
              type="button"
              className={`rounded-full p-1.5 transition-colors duration-200 hover:bg-[rgba(10,37,64,0.06)] ${
                pickerOpen ? "bg-[rgba(10,37,64,0.06)]" : ""
              }`}
              style={{ color: theme.icon }}
              role="combobox"
              aria-expanded={pickerOpen}
              aria-haspopup="listbox"
              aria-controls="sj-time-of-day-listbox"
              aria-label={`${theme.label}。時間帯を選ぶ`}
              data-value={theme.id}
              onClick={() => { setPickerOpen((open) => !open); }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setPickerOpen(false);
              }}
            >
              <TimeOfDayIcon night={theme.night === true} />
            </button>
            {pickerOpen && (
              <div
                className="fixed inset-0 z-10 cursor-default"
                aria-hidden="true"
                onClick={() => { setPickerOpen(false); }}
              />
            )}
            {pickerOpen && (
              <motion.ul
                id="sj-time-of-day-listbox"
                role="listbox"
                aria-label="時間帯"
                className="absolute right-0 top-full z-20 mt-1.5 min-w-[136px] rounded-lg bg-white py-2 shadow-[0_6px_24px_rgba(10,37,64,0.18),0_0_0_1px_rgba(10,37,64,0.06)]"
                initial={reduceMotion === true ? false : { opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {THEMES.map((t, i) => {
                  const selected = i === themeIndex;
                  return (
                    <li key={t.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`flex w-full items-center gap-2 px-3.5 py-[5px] text-left text-[13px] leading-[1.6] transition-colors hover:bg-[#f6f9fc] ${
                          selected ? "font-semibold text-[#0a2540]" : "text-[#596171]"
                        }`}
                        onClick={() => {
                          setThemeIndex(i);
                          setPickerOpen(false);
                        }}
                      >
                        <span style={{ color: t.icon }} className="scale-75">
                          <TimeOfDayIcon night={t.night === true} />
                        </span>
                        {t.label}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </div>
        </div>

        {/* Dataviz（desktop）: 通常 = canvas 粒子システム（流動 4 formation +
            stat 切替モーフ + theme 色追従）。reduced-motion = 本家同様
            stat 別 fallback 静止画のクロスフェード */}
        <div
          id="sj-time-of-day"
          className="relative -mt-[61px] hidden aspect-[2468/1038] w-full md:block"
        >
          {reduceMotion === true ? (
            <div
              className="absolute inset-0"
              role="img"
              aria-label={`${theme.label}のデータビジュアライゼーション`}
            >
              {STATS.map((stat, i) => (
                <img
                  key={stat.id}
                  loading="lazy"
                  alt=""
                  src={`${stat.img}?w=1232&fm=webp&q=90`}
                  srcSet={`${stat.img}?w=1232&fm=webp&q=90 1x, ${stat.img}?w=2468&fm=webp&q=90 2x`}
                  className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out"
                  style={{ opacity: activeStat === i ? 1 : 0 }}
                  aria-hidden={activeStat !== i}
                />
              ))}
            </div>
          ) : (
            <SjGlobalDataviz
              formation={activeStat}
              themeId={theme.id}
              ariaLabel={`${theme.label}のデータビジュアライゼーション`}
            />
          )}
        </div>

        {/* mobile: 静的 globe 画像（stats-section__globe） */}
        <div className="relative pt-6 md:hidden">
          <img
            loading="lazy"
            alt=""
            src={`${GLOBE_STATIC}?w=768&fm=webp&q=90`}
            srcSet={`${GLOBE_STATIC}?w=768&fm=webp&q=90 1x, ${GLOBE_STATIC}?w=1536&fm=webp&q=90 2x`}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
