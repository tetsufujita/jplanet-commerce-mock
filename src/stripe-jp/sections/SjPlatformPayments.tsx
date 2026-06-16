import { useState } from "react";
import { BentoCard, XFade } from "./SjPlatformBento";
import { useCycle, usePrefersReducedMotion } from "./SjPlatformHooks";

const CDN = "https://images.stripeassets.com/fzn2n1nzq965";
const TERMINAL_IMG = `${CDN}/1Vf8oT9Fm6dEwpnEx5PgK1/055956f38d7fd8b0cc7419692ef29778/bento-terminal.png?w=616&fm=webp&q=90`;
const BG_IMG = `${CDN}/vYmk6v8n7oDAwbDpwhjV6/846f9b3e214549b8f14e2b8c8cfe9343/payment-bento-background.jpg?w=1720&fm=webp&q=80`;
const KETTLE_IMG = `${CDN}/6BTjJGdjfGVA8brPwj7p3M/fcf084ff85142366e118fe85ee78b632/payments-electric-kettle.jpg?w=160&fm=webp&q=90`;
const HOODIE_IMG = `${CDN}/5Dr3Oc550drIrxyzzXgFbq/f6e4fb0b8b4b40d73e94fdf7c9bc7028/payments-hoodie.jpg?w=160&fm=webp&q=90`;
const STREAMING_IMG = `${CDN}/1UE1lPgwbfQRH586XfTWKM/f90bfc79f87b3e60a4189cc0f5a03228/showflix-streaming.jpg?w=160&fm=webp&q=90`;

interface PaymentMethod {
  label: string;
  active?: boolean;
  detail?: string;
}

interface LocaleScene {
  key: string;
  brand: string;
  brandColor: string;
  url: string;
  payLabel: string;
  amount: string;
  message: string;
  lines: readonly (readonly [string, string])[];
  button: string;
  buttonBg: string;
  buttonFg: string;
  emailLabel: string;
  email: string;
  separator: string;
  methodsLabel: string;
  methods: readonly PaymentMethod[];
  summaryTitle: string;
  productImg: string;
  productLabel: string;
  productPrice: string;
  totals: readonly (readonly [string, string])[];
}

/* 文言は DOM 実抽出（roastery / cartsy / showflix の 3 locale） */
const SCENES: readonly LocaleScene[] = [
  {
    key: "roastery",
    brand: "ROASTERY.",
    brandColor: "#0a2540",
    url: "roastery.com/checkout",
    payLabel: "Roastery に支払う",
    amount: "$5.46",
    message: "カードをどうぞ",
    lines: [
      ["Mocha latte", "$5.50"],
      ["ロイヤルティ (10% オフ)", "-$0.55"],
      ["Tax", "$0.51"],
      ["合計", "$5.46"],
    ],
    button: "続ける",
    buttonBg: "#ffe0d1",
    buttonFg: "#ff6118",
    emailLabel: "メール",
    email: "jane.diaz@stripe.com",
    separator: "または",
    methodsLabel: "決済手段",
    methods: [
      { label: "カード" },
      {
        label: "Affirm",
        active: true,
        detail: "今すぐ支払う、または金利手数料なしで各回 $40.73 の 4 回分割払いで支払う。",
      },
      { label: "Cash App" },
      { label: "暗号資産" },
      { label: "アメリカの銀行口座" },
    ],
    summaryTitle: "注文概要",
    productImg: KETTLE_IMG,
    productLabel: "温度調節機能付き電気ケトル",
    productPrice: "$150.00",
    totals: [
      ["小計", "$150.00"],
      ["Tax", "$15.38"],
      ["配送", "無料"],
      ["合計", "$165.38"],
    ],
  },
  {
    key: "cartsy",
    brand: "CARTSY",
    brandColor: "#ff6118",
    url: "cartsy.com/checkout",
    payLabel: "Cartsy bezahlen",
    amount: "€26.89",
    message: "Zum Bezahlen Karte auflegen, einführen oder durchziehen",
    lines: [
      ["Deluxe-Hemd", "€22.60"],
      ["VAT", "€4.29"],
      ["Summe", "€26.89"],
    ],
    button: "Weiter",
    buttonBg: "#ffe0d1",
    buttonFg: "#ff6118",
    emailLabel: "E-Mail",
    email: "damian.michelfelder@example.com",
    separator: "oder",
    methodsLabel: "Zahlungsmethode",
    methods: [{ label: "Karte" }, { label: "Klarna", active: true }, { label: "Rechnung" }],
    summaryTitle: "Zusammenfassung der Bestellung",
    productImg: HOODIE_IMG,
    productLabel: "Unverzichtbarer Hoodie",
    productPrice: "€41.70",
    totals: [
      ["Zwischensumme", "€41.70"],
      ["VAT", "€7.92"],
      ["Versand", "Kostenlos"],
      ["Summe", "€49.62"],
    ],
  },
  {
    key: "showflix",
    brand: "SHOWFLIX",
    brandColor: "#675dff",
    url: "showflixapp.com/checkout",
    payLabel: "Showflix に支払う",
    amount: "￥5,000",
    message: "タップ、挿入、またはスワイプして支払う",
    lines: [
      ["ギフトカード", "￥5,000"],
      ["合計", "￥5,000"],
    ],
    button: "続行",
    buttonBg: "#675dff",
    buttonFg: "#ffffff",
    emailLabel: "メールアドレス",
    email: "taro.yamada@example.com",
    separator: "または",
    methodsLabel: "支払い方法",
    methods: [{ label: "カード" }, { label: "PayPay", active: true }, { label: "ファミリーマート" }],
    summaryTitle: "注文概要",
    productImg: STREAMING_IMG,
    productLabel: "ストリーミング月次サブスクリプション",
    productPrice: "￥1,886",
    totals: [
      ["小計", "￥1,886"],
      ["消費税", "￥189.00"],
      ["合計", "￥2,075.00"],
    ],
  },
];

/* stagger: phone → browser header → form → summary（全体 ~1.0–1.5s / ease-out） */
const DELAY_PHONE = 0;
const DELAY_HEADER = 180;
const DELAY_FORM = 340;
const DELAY_SUMMARY = 500;

function TapIcon() {
  return (
    <svg
      className="sj-payments__tap-icon"
      width="34"
      height="22"
      viewBox="0 0 34 22"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="13" cy="11" r="3" fill="currentColor" />
      <path
        d="M19 5a8.5 8.5 0 0 1 0 12M23 2a13 13 0 0 1 0 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 5a8.5 8.5 0 0 0 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="7" height="8" viewBox="0 0 7 8" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.06 2v1H.56a.5.5 0 0 0-.5.5v3A1.5 1.5 0 0 0 1.56 8h3.5a1.5 1.5 0 0 0 1.5-1.5v-3a.5.5 0 0 0-.5-.5h-.5V2a2 2 0 0 0-2-2h-.5a2 2 0 0 0-2 2Zm3.75 1V2A1.25 1.25 0 0 0 3.56.75h-.5A1.25 1.25 0 0 0 1.81 2v1h3Z"
        fill="#667691"
      />
    </svg>
  );
}

/** 決済端末（phone）。frame は CDN 画像、画面は DOM overlay + crossfade */
function Terminal({ scene }: { scene: number }) {
  return (
    <div className="sj-payments__terminal">
      <img
        className="sj-payments__terminal-frame"
        src={TERMINAL_IMG}
        width={280}
        height={496}
        alt=""
        loading="lazy"
      />
      <div className="sj-payments__terminal-screen" aria-hidden="true">
        <TapIcon />
        <XFade
          index={scene}
          delay={DELAY_PHONE}
          items={SCENES.map((s) => (
            <div className="sj-payments__pay-label">{s.payLabel}</div>
          ))}
        />
        <XFade
          index={scene}
          delay={DELAY_PHONE}
          items={SCENES.map((s) => (
            <div className="sj-payments__amount sj-tnum">{s.amount}</div>
          ))}
        />
        <XFade
          index={scene}
          delay={DELAY_PHONE}
          items={SCENES.map((s) => (
            <div className="sj-payments__message">{s.message}</div>
          ))}
        />
        <XFade
          index={scene}
          delay={DELAY_PHONE}
          items={SCENES.map((s) => (
            <div className="sj-payments__details">
              {s.lines.map(([label, value], i) => (
                <div
                  key={label}
                  className={
                    i === s.lines.length - 1
                      ? "sj-payments__detail-row sj-payments__detail-row--total"
                      : "sj-payments__detail-row"
                  }
                >
                  <span>{label}</span>
                  <span className="sj-tnum">{value}</span>
                </div>
              ))}
            </div>
          ))}
        />
        <XFade
          index={scene}
          delay={DELAY_PHONE}
          items={SCENES.map((s) => (
            <div
              className="sj-payments__terminal-btn"
              style={{ background: s.buttonBg, color: s.buttonFg }}
            >
              {s.button}
            </div>
          ))}
        />
      </div>
    </div>
  );
}

/** browser checkout（カード右端で clip）。URL / brand / form / summary を stagger crossfade */
function CheckoutBrowser({ scene }: { scene: number }) {
  return (
    <div className="sj-payments__browser" aria-hidden="true">
      <div className="sj-browser__bar">
        <div className="sj-browser__dots">
          <span />
          <span />
          <span />
        </div>
        <div className="sj-browser__url">
          <LockIcon />
          <XFade
            index={scene}
            delay={DELAY_HEADER}
            items={SCENES.map((s) => (
              <span>{s.url}</span>
            ))}
          />
        </div>
      </div>
      <XFade
        index={scene}
        delay={DELAY_HEADER}
        items={SCENES.map((s) => (
          <div className="sj-payments__brand" style={{ color: s.brandColor }}>
            {s.brand}
          </div>
        ))}
      />
      <div className="sj-payments__body">
        <XFade
          index={scene}
          delay={DELAY_FORM}
          items={SCENES.map((s) => (
            <div className="sj-payments__form">
              <div className="sj-payments__input-label">{s.emailLabel}</div>
              <div className="sj-payments__input">{s.email}</div>
              <div className="sj-payments__instant">
                <div className="sj-payments__instant-btn sj-payments__instant-btn--link">link</div>
                <div className="sj-payments__instant-btn sj-payments__instant-btn--apple">
                   Pay
                </div>
              </div>
              <div className="sj-payments__separator">{s.separator}</div>
              <div className="sj-payments__input-label">{s.methodsLabel}</div>
              <div className="sj-payments__methods">
                {s.methods.map((m) => (
                  <div
                    key={m.label}
                    className={
                      m.active
                        ? "sj-payments__method sj-payments__method--active"
                        : "sj-payments__method"
                    }
                  >
                    <div className="sj-payments__method-main">
                      <span className="sj-payments__radio" />
                      <span>{m.label}</span>
                    </div>
                    {m.detail ? <div className="sj-payments__method-detail">{m.detail}</div> : null}
                  </div>
                ))}
              </div>
              <div
                className="sj-payments__pay-btn"
                style={{ background: s.buttonBg, color: s.buttonFg }}
              >
                {s.button}
              </div>
            </div>
          ))}
        />
        <XFade
          index={scene}
          delay={DELAY_SUMMARY}
          items={SCENES.map((s) => (
            <div className="sj-payments__summary">
              <div className="sj-payments__summary-title">{s.summaryTitle}</div>
              <div className="sj-payments__product">
                <img src={s.productImg} width={80} height={86} alt="" loading="lazy" />
                <div>
                  <div className="sj-payments__product-label">{s.productLabel}</div>
                  <div className="sj-payments__product-price sj-tnum">{s.productPrice}</div>
                </div>
              </div>
              <div className="sj-payments__totals">
                {s.totals.map(([label, value], i) => (
                  <div
                    key={label}
                    className={
                      i === s.totals.length - 1
                        ? "sj-payments__total-row sj-payments__total-row--grand"
                        : "sj-payments__total-row"
                    }
                  >
                    <span>{label}</span>
                    <span className="sj-tnum">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        />
      </div>
    </div>
  );
}

export function SjPlatformPayments() {
  const reduced = usePrefersReducedMotion();
  /* locale デモ rotation: 原本 20s 監視実測（2026-06-11）で idle 静止を確認
     → hover 中のみ 4.8s 周期で回す（storyboard の「時間駆動」は hover 録画の誤読） */
  const [hovering, setHovering] = useState(false);
  const scene = useCycle(SCENES.length, 4800, !reduced && hovering);

  return (
    <BentoCard
      id="payments"
      title="オンライン決済・対面決済をグローバルに展開"
      className="sj-bento--payments"
      shift={{ x: -4.83, y: -4 }}
      glow
      onHoverChange={setHovering}
    >
      <div className="sj-payments__stage">
        <img className="sj-payments__bg" src={BG_IMG} alt="" loading="lazy" />
        <Terminal scene={scene} />
        <CheckoutBrowser scene={scene} />
      </div>
    </BentoCard>
  );
}
