import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./SjHero.css";

/* ------------------------------------------------------------------ */
/* GDP ticker（実測 02-interactions.json .ticker: 初期値 1.66204602%、  */
/* tick ≈ 1250ms 間隔で +1、桁はスロット式縦ロール）                    */
/* ------------------------------------------------------------------ */

const GDP_INITIAL = 166204602; // = 1.66204602%
const TICK_MS = 1250;
const TYPE_IN_DELAY_S = 0.7; // 見出しより遅れて数値 type-in（motion spec §1）
const ROLL_DURATION_S = 0.45;
const ROLL_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

function formatGdpChars(value: number): string[] {
  const digits = String(value);
  return [digits.charAt(0), ".", ...digits.slice(1).split(""), "%"];
}

interface TickerSlotProps {
  char: string;
  enterDelay: number;
}

function TickerSlot({ char, enterDelay }: TickerSlotProps) {
  if (!/^\d$/.test(char)) {
    return <span className="sj-ticker-char">{char}</span>;
  }
  return (
    <span className="sj-ticker-slot">
      <AnimatePresence>
        <motion.span
          key={char}
          className="sj-ticker-digit"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{
            duration: ROLL_DURATION_S,
            ease: ROLL_EASE,
            delay: enterDelay,
          }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function GdpTicker() {
  const reducedMotion = useReducedMotion() ?? false;
  const [value, setValue] = useState(GDP_INITIAL);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }
    // type-in 完了後（~1.6s）に odometer の永続 tick を開始
    const bootTimer = window.setTimeout(() => { setBooted(true); }, 1700);
    let intervalId: number | undefined;
    const startTimer = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setValue((v) => v + 1);
      }, TICK_MS);
    }, 1900);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearTimeout(startTimer);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [reducedMotion]);

  const chars = useMemo(() => formatGdpChars(value), [value]);

  return (
    <div className="sj-hero-eyebrow" aria-hidden="true">
      <span className="sj-hero-eyebrow-label">
        Stripe 上の決済額が全世界の GDP に占める割合:
      </span>
      <span className="sj-hero-eyebrow-value">
        {reducedMotion ? (
          <span>{chars.join("")}</span>
        ) : (
          chars.map((char, i) => (
            <TickerSlot
              // key は桁位置で固定（値の変化は TickerSlot 内の key={char} が拾う）
              key={`slot-${String(i)}`}
              char={char}
              enterDelay={booted ? 0 : TYPE_IN_DELAY_S + i * 0.045}
            />
          ))
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* h1 二枚重ね（背景 = navy 実色 / 前景 = gradient clip text）          */
/* ------------------------------------------------------------------ */

const TITLE_MAIN = "事業成長を支える金融インフラ。";
const TITLE_COPY =
  "決済から組込み型金融、エージェンティックコマースまで、企業の収益最大化を支援。";

function HeroTitle() {
  return (
    <div className="sj-hero-title-stack">
      <h1 className="sj-h1 sj-hero-title sj-hero-title--background">
        <em>{TITLE_MAIN}</em> <span className="sj-hero-title-copy">{TITLE_COPY}</span>
      </h1>
      <h1 className="sj-h1 sj-hero-title sj-hero-title--foreground" aria-hidden="true">
        <em>{TITLE_MAIN}</em> <span className="sj-hero-title-copy">{TITLE_COPY}</span>
      </h1>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CTA（hover arrow = 軸線 fade-in + くの字右シフト）                   */
/* ------------------------------------------------------------------ */

function HoverArrow() {
  return (
    <svg
      className="sj-arrow"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path className="sj-arrow-line" d="M0.5 5.5h7" />
      <path className="sj-arrow-head" d="M1.5 1.5l4 4-4 4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      fill="none"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path
        fill="#4285f4"
        d="M11.8846 4.91113H6.11987v2.31403h3.30546c-.06676.36934-.20976.72135-.42019 1.03438s-.48385.58047-.80343.78585V10.551h1.96699c.6038-.57079 1.0787-1.2598 1.394-2.02239.4722-1.14225.5273-2.4075.3219-3.61748"
      />
      <path
        fill="#34a853"
        d="M6.11985 12c1.64722 0 3.04228-.5278 4.04885-1.449L8.20168 9.0454c-.61936.39256-1.34496.59231-2.08183.5731-.76295-.00928-1.50387-.25249-2.11917-.69564-.61531-.44314-1.07424-1.06406-1.31264-1.77595H.652344v1.53908C1.16135 9.68188 1.9422 10.5192 2.90769 11.1044c.9655.5852 2.07762.8953 3.21216.8956"
      />
      <path
        fill="#fbbc04"
        d="M2.68809 7.14693c-.25717-.74696-.25717-1.55625 0-2.30321v-1.5499H.652386c-.427544.83671-.65018873 1.75993-.65018873 2.6961S.224842 7.84931.652386 8.68602z"
      />
      <path
        fill="#ea4335"
        d="M6.11985 2.37211c.87133-.0146 1.71351.30816 2.34449.89853l1.75046-1.71879C9.51693.932184 8.68295.478902 7.77771.227229 6.87246-.0244442 5.92032-.0677314 4.99527.100731c-.92505.168462-1.79809.544137-2.5513 1.097839-.75321.55369-1.3663 1.2705-1.791626 2.09473L2.68804 4.84371c.2384-.71189.69733-1.33281 1.31264-1.77595.6153-.44315 1.35622-.68636 2.11917-.69565"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* logo marquee（実測 30.03px/s 左流れ・全幅 6192px = 18 logo × 2 set） */
/* ------------------------------------------------------------------ */

interface MarqueeLogo {
  file: string;
  label: string;
}

const MARQUEE_LOGOS: MarqueeLogo[] = [
  { file: "openai", label: "OpenAI" },
  { file: "eccube", label: "EC-CUBE" },
  { file: "amazon", label: "Amazon" },
  { file: "adastria", label: "ADASTRIA" },
  { file: "nvidia", label: "NVIDIA" },
  { file: "orix", label: "ORIX" },
  { file: "marriott", label: "Marriott" },
  { file: "toyota", label: "TOYOTA" },
  { file: "figma", label: "Figma" },
  { file: "nikkei", label: "日本経済新聞" },
  { file: "google", label: "Google" },
  { file: "sansan", label: "Sansan" },
  { file: "shopify", label: "Shopify" },
  { file: "dena", label: "DeNA" },
  { file: "uber", label: "Uber" },
  { file: "kurashinomarket", label: "くらしのマーケット" },
  { file: "anthropic", label: "Anthropic" },
  { file: "tential", label: "TENTIAL" },
];

function LogoMarquee() {
  return (
    <div className="sj-marquee-viewport">
      <ul className="sj-marquee">
        {MARQUEE_LOGOS.map((logo) => (
          <li key={logo.file} className="sj-marquee-item">
            <img
              src={`/stripe-jp/logos/${logo.file}.svg`}
              alt={logo.label}
              width={142}
              height={34}
              loading="lazy"
              draggable={false}
            />
          </li>
        ))}
        {/* シームレスループ用の複製 set */}
        {MARQUEE_LOGOS.map((logo) => (
          <li key={`${logo.file}-dup`} className="sj-marquee-item" aria-hidden="true">
            <img
              src={`/stripe-jp/logos/${logo.file}.svg`}
              alt=""
              width={142}
              height={34}
              loading="lazy"
              draggable={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero section                                                        */
/* ------------------------------------------------------------------ */

export function SjHero() {
  return (
    <section className="sj-hero">
      <span className="sj-hero-line sj-hero-line--top" aria-hidden="true" />
      <div className="sj-hero-bg" aria-hidden="true">
        <img
          className="sj-hero-wave"
          src="/stripe-jp/hero-wave-desktop.webp"
          alt=""
          width={1392}
          height={975}
          decoding="async"
        />
      </div>
      <div className="sj-container sj-hero-layout">
        <GdpTicker />
        <HeroTitle />
        <div className="sj-hero-actions">
          <a
            className="sj-btn sj-btn--primary"
            href="https://dashboard.stripe.com/register"
          >
            始める
            <HoverArrow />
          </a>
          <a
            className="sj-btn sj-btn--google"
            href="https://dashboard.stripe.com/login/oauth/google/init"
          >
            <GoogleIcon />
            Google で登録
          </a>
        </div>
      </div>
      <div className="sj-container sj-hero-logos">
        <LogoMarquee />
      </div>
      <span className="sj-hero-line sj-hero-line--bottom" aria-hidden="true" />
    </section>
  );
}
