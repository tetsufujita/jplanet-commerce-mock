import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { BentoCard } from "./SjPlatformBento";
import { usePrefersReducedMotion } from "./SjPlatformHooks";

/* 棒グラフ初期値は DOM の --bar-target-scale 31 本の実値 */
const INITIAL_BARS: readonly number[] = [
  0.047, 0.081, 0.154, 0.221, 0.315, 0.45, 0.248, 0.289, 0.128, 0.081, 0.336, 0.289, 0.409, 0.523,
  0.423, 0.758, 1, 0.53, 0.403, 0.268, 0.336, 0.369, 0.322, 0.477, 0.591, 0.637, 0.745, 0.57, 0.45,
  0.409, 0.523,
];

const INITIAL_TOKENS = 2_010_569_010;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** 桁別 縦 slot roll の odometer（ランダム目標値へ ~1s ease-out で roll） */
function Odometer({ value }: { value: number }) {
  const text = value.toLocaleString("en-US");
  return (
    <span className="sj-odo" aria-label={text}>
      {text.split("").map((ch, i) =>
        ch >= "0" && ch <= "9" ? (
          <span key={i} className="sj-odo__digit">
            <span
              className="sj-odo__reel"
              style={{ transform: `translateY(-${String(Number(ch) * 10)}%)` }}
            >
              {DIGITS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} className="sj-odo__sep">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

function PlanIcon() {
  return (
    <svg width="19" height="22" viewBox="0 0 19 22" fill="none" aria-hidden="true">
      <circle cx="9.5" cy="9.04" r="2.11" fill="currentColor" />
      <path
        d="m5.24 14.83 8.11 5.21m2.18-7.12a7.18 7.18 0 1 1-12.07-7.75 7.18 7.18 0 0 1 12.07 7.75Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1.22a4.78 4.78 0 0 0-4.06 7.3h8.12A4.78 4.78 0 0 0 6 1.22Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="m7.9 4.5-2.3 2.47" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function SjPlatformBilling() {
  const reduced = usePrefersReducedMotion();
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [bars, setBars] = useState<readonly number[]>(INITIAL_BARS);

  /* 単調増加でないランダム目標値（実測: 1.71B〜2.01B 帯を上下） + bar 同期伸縮 */
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      /* 原本 burst 実測: 動き量は小（上位桁が安定）→ ±15M random walk に抑える */
      setTokens((prev) =>
        clamp(prev + Math.floor((Math.random() - 0.5) * 30_000_000), 1_710_000_000, 2_010_000_000),
      );
      setBars((prev) => prev.map((v) => clamp(v + (Math.random() - 0.5) * 0.15, 0.04, 1)));
    }, 3600);
    return () => { window.clearInterval(id); };
  }, [reduced]);

  return (
    <BentoCard
      id="billing"
      title="あらゆるサブスク・課金モデルに対応"
      className="sj-bento--billing"
      shift={{ x: -3.55, y: -6 }}
    >
      <div className="sj-billing__bg" aria-hidden="true" />
      <div
        className="sj-billing__panels"
        role="img"
        aria-label="Pro プラン向けの従量課金パネル。トークン料金と使用量メーター、および過去 30 日間のトークン使用量を示す棒グラフを表示しています。"
      >
        <div className="sj-billing__panel" aria-hidden="true">
          <div className="sj-billing__plan-head">
            <span className="sj-billing__plan-icon">
              <PlanIcon />
            </span>
            <div>
              <div className="sj-billing__plan-name">Pro プラン</div>
              <div className="sj-billing__plan-cadence">月次請求</div>
            </div>
          </div>
          <div className="sj-billing__item">
            <div className="sj-billing__item-title">トークン</div>
            <div className="sj-billing__item-details">
              <span className="sj-tnum">1,000</span>ユニットごとに <span className="sj-tnum">￥2</span>
            </div>
          </div>
          <div className="sj-billing__usage">
            <span className="sj-billing__usage-label">
              <UsageIcon />
              使用量
            </span>
            <span className="sj-billing__usage-bar">
              <span className="sj-billing__usage-fill" />
            </span>
          </div>
        </div>
        <div className="sj-billing__panel" aria-hidden="true">
          <div className="sj-billing__chart-period">
            過去 <span className="sj-tnum">30</span> 日間に使用されたトークン
          </div>
          <div className="sj-billing__chart-total">
            <Odometer value={tokens} />
          </div>
          <div className="sj-billing__chart">
            {bars.map((scale, i) => (
              <span
                key={i}
                className="sj-billing__bar"
                style={{ "--bar-scale": scale } as CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
