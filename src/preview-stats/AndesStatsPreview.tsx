import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AndesDataviz } from "./AndesDataviz";

/* ================================================================
 * /preview/stats — Andes §2「数字 proof」試作（sir 感覚ジャッジ用）
 *
 * docs/07 §2: 4 マクロ数字 [verified] + 出典。docs/04: paper/ink/Navy、
 * Crimson #C8102E は indicator のみ（pin-point）。出典は monospace。
 *
 * ⚠ 試作のための ja ハードコード。採用時は docs 更新 → i18n 3 locale 化
 *   （見出し kicker は [hypothesis]、sir 確定後に正式 copy へ）
 * ================================================================ */

interface Stat {
  id: string;
  value: string;
  description: string;
  source: string;
  /** AndesDataviz formation: 0 burst / 1 globe / 2 wave / 3 strands */
  formation: number;
}

const STATS: Stat[] = [
  {
    id: "latam-population",
    value: "6.6億人",
    description: "中南米の人口",
    source: "World Bank",
    formation: 1, // globe = 人口/地理の広がり
  },
  {
    id: "latam-ec",
    value: "US$7,690億",
    description: "中南米 EC 市場規模",
    source: "PCMI",
    formation: 0, // burst = 市場の拡大
  },
  {
    id: "brazil-population",
    value: "2.1億人",
    description: "ブラジルの人口",
    source: "IBGE",
    formation: 3, // strands = 日本⇄ブラジルの接続・収束
  },
  {
    id: "pix-users",
    value: "1.7億人",
    description: "PIX 利用者",
    source: "Banco Central do Brasil",
    formation: 2, // wave = 決済フロー
  },
];

const CRIMSON = "#C8102E";
const INK = "#0F1B3D";

export function AndesStatsPreview() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = STATS[active] ?? STATS[0];

  useEffect(() => {
    const prev = document.title;
    document.title = "Andes §2 stats — preview";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbfbfa] py-24 font-sans text-[#0F1B3D]">
      <section className="mx-auto max-w-[1264px] px-4">
        {/* kicker [hypothesis]（正式 copy は sir 確定後） */}
        <p className="mb-14 font-mono text-[12px] uppercase tracking-[0.18em] text-[#5a6478]">
          中南米 — 数字で
        </p>

        {/* stats menu（上下 hairline + Crimson indicator = pin-point） */}
        <div className="grid grid-cols-2 gap-x-4 border-y border-[rgba(15,27,61,0.12)] md:grid-cols-4">
          {STATS.map((stat, i) => {
            const isActive = active === i;
            return (
              <div key={stat.id} className="relative px-2 py-10 text-center md:px-4">
                {isActive && (
                  <motion.span
                    layoutId="andes-stat-indicator"
                    className="pointer-events-none absolute inset-0"
                    transition={
                      reduceMotion === true
                        ? { duration: 0 }
                        : { duration: 0.35, ease: "easeOut" }
                    }
                    aria-hidden="true"
                  >
                    <span
                      className="absolute -top-px left-0 right-0 h-[2px]"
                      style={{ background: CRIMSON }}
                    />
                    <span
                      className="absolute -bottom-px left-0 right-0 h-[2px]"
                      style={{ background: CRIMSON }}
                    />
                  </motion.span>
                )}
                <button
                  type="button"
                  className="block w-full text-center"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActive(i);
                  }}
                >
                  <p
                    className={`text-[34px] leading-[1.2] tracking-[-0.02em] transition-colors duration-300 md:text-[40px] ${
                      isActive ? "" : "opacity-45 hover:opacity-70"
                    }`}
                    style={{ color: INK }}
                  >
                    {stat.value}
                  </p>
                </button>
                <span className="mx-auto mt-1 block max-w-[220px] text-[15px] leading-[1.5] text-[#5a6478]">
                  {stat.description}
                </span>
                <span className="mt-1 block font-mono text-[11px] tracking-[0.04em] text-[#8a93a6]">
                  {stat.source}
                </span>
              </div>
            );
          })}
        </div>

        {/* dataviz（Stripe 再現由来の粒子システム・Andes 翻案） */}
        <div className="relative mt-6 aspect-[2468/1038] w-full overflow-hidden rounded-md">
          <AndesDataviz
            formation={current?.formation ?? 1}
            ariaLabel={`${current?.description ?? ""}のデータビジュアライゼーション`}
          />
        </div>
      </section>
    </main>
  );
}
