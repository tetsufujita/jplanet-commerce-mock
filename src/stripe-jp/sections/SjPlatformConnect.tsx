import { useEffect, useState } from "react";
import { BentoCard, XFade } from "./SjPlatformBento";
import { usePrefersReducedMotion } from "./SjPlatformHooks";

const CDN = "https://images.stripeassets.com/fzn2n1nzq965";
const BG_IMG = `${CDN}/1j4wM9h2bBsyRFvTv6Wsn0/07f4b9b1e1e17fdc509d9087454dd8bc/ConnectBentoBackground.jpg?w=1242&q=90`;

/* 連結アカウント table（DOM 実抽出 10 行） */
const ROWS: readonly (readonly [string, string, string, string])[] = [
  ["Vital Flow", "カナダ", "￥1,252,200", "￥10,734,447"],
  ["Daybreak Yoga", "アメリカ", "￥225,300", "￥1,331,850.00"],
  ["Sacred Space", "イギリス", "￥187,050", "￥3,685,364"],
  ["Jackson Hot Yoga", "オーストラリア", "￥549,000", "￥1,896,495"],
  ["Harmony Flow", "アメリカ", "￥4,639,500", "￥44,200,448"],
  ["Balance at Brunch", "カナダ", "￥50,250", "￥547,554"],
  ["Breathline Studio", "アメリカ", "￥336,750", "￥1,291,200"],
  ["Quiet Fire Yoga", "イギリス", "￥58,200", "￥235,330"],
  ["Zenith Zen", "オーストラリア", "￥99,000", "￥246,495"],
  ["M.E. Yoga", "カナダ", "￥663,600", "￥1,006,440"],
];

const ROW_COLORS: readonly string[] = [
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ff6118",
  "#ec4899",
  "#0ea5e9",
  "#8b5cf6",
  "#1f2937",
  "#14b8a6",
  "#f43f5e",
];

interface Merchant {
  key: string;
  name: string;
  logoBg: string;
  rowIndex: number;
  subLabel?: string;
  orderRows: readonly (readonly [string, string, string?])[];
  total: readonly [string, string];
  methods: readonly string[];
  payButton: string;
  thanksDetail: string;
  pill: string;
}

/* merchant 3 種（DOM 実抽出: jackson-hot-yoga / quiet-fire-yoga / daybreak-yoga） */
const MERCHANTS: readonly Merchant[] = [
  {
    key: "jackson-hot-yoga",
    name: "Jackson Hot Yoga",
    logoBg: "#ff6118",
    rowIndex: 3,
    orderRows: [
      ["5 クラスパス", "A$80.00"],
      ["プロモーション", "A$8.00", "10% を節約"],
    ],
    total: ["合計", "A$72.00"],
    methods: ["カード", "Affirm"],
    payButton: "A$72.00 を支払う",
    thanksDetail: "お支払いが成功しました。",
    pill: "A$72.00",
  },
  {
    key: "quiet-fire-yoga",
    name: "Quiet Fire Yoga",
    logoBg: "#1f2937",
    rowIndex: 7,
    orderRows: [
      ["シングルクラス", "£20.00"],
      ["マットレンタル", "£2.00"],
    ],
    total: ["合計", "£22.00"],
    methods: ["HSBC •••• 4242"],
    payButton: "£22.00 を支払う",
    thanksDetail: "お支払いが成功しました。",
    pill: "£22.00",
  },
  {
    key: "daybreak-yoga",
    name: "Daybreak Yoga",
    logoBg: "#f59e0b",
    rowIndex: 1,
    subLabel: "無制限のヨガサブスクリプション",
    orderRows: [["年次", "$999.00 / 年", "2 か月分が無料"]],
    total: ["合計", "$999.00"],
    methods: ["カード", "Klarna"],
    payButton: "$999.00 を支払う",
    thanksDetail: "無制限でご利用になれるヨガのサブスクリプションが有効になりました。",
    pill: "$999.00",
  },
];

/* dashboard 行の座標（接続線 / pill の配置に使用） */
const BROWSER_LEFT = 420;
const BROWSER_TOP = 36;
const TABLE_TOP_OFFSET = 30 + 14 + 18 + 12 + 17; /* bar + padding + title + margin + thead */
const ROW_HEIGHT = 25.5;
const PAYCARD_RIGHT = 150 + 268;

function rowCenterY(rowIndex: number): number {
  return BROWSER_TOP + TABLE_TOP_OFFSET + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
}

function OrderScreen({ m }: { m: Merchant }) {
  return (
    <div className="sj-connect__screen">
      <div className="sj-connect__screen-label">注文概要</div>
      {m.subLabel ? <div className="sj-connect__screen-sub">{m.subLabel}</div> : null}
      <div className="sj-connect__order-rows">
        {m.orderRows.map(([label, amount, note]) => (
          <div key={label} className="sj-connect__order-row">
            <span>
              {label}
              {note ? <span className="sj-connect__order-note">{note}</span> : null}
            </span>
            <span className="sj-tnum">{amount}</span>
          </div>
        ))}
        <div className="sj-connect__order-row sj-connect__order-row--total">
          <span>{m.total[0]}</span>
          <span className="sj-tnum">{m.total[1]}</span>
        </div>
      </div>
      <div className="sj-connect__pm-list">
        {m.methods.map((label, i) => (
          <div
            key={label}
            className={i === 0 ? "sj-connect__pm sj-connect__pm--active" : "sj-connect__pm"}
          >
            <i />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="sj-connect__pay-btn">{m.payButton}</div>
    </div>
  );
}

function ThanksScreen({ m }: { m: Merchant }) {
  return (
    <div className="sj-connect__screen">
      <div className="sj-connect__screen-label">ありがとうございます。</div>
      <div className="sj-connect__screen-sub">{m.thanksDetail}</div>
      <div className="sj-connect__thanks-rows">
        <div className="sj-connect__thanks-row">
          <span>注文番号</span>
          <strong className="sj-tnum">#194756</strong>
        </div>
        <div className="sj-connect__thanks-row">
          <span>日付</span>
          <strong className="sj-tnum">2/20</strong>
        </div>
        <div className="sj-connect__thanks-row">
          <span>決済手段</span>
          <span className="sj-connect__link-pill">link</span>
        </div>
        <div className="sj-connect__thanks-row">
          <span>ご購入</span>
          <strong className="sj-tnum">{m.total[1]}</strong>
        </div>
        <div className="sj-connect__thanks-row">
          <span>合計</span>
          <strong className="sj-tnum">{m.total[1]}</strong>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ activeRow }: { activeRow: number | null }) {
  return (
    <div className="sj-connect__browser" aria-hidden="true">
      <div className="sj-browser__bar">
        <div className="sj-browser__dots">
          <span />
          <span />
          <span />
        </div>
        <div className="sj-browser__url">dashboard.zenflow.com</div>
      </div>
      <div className="sj-connect__page">
        <div className="sj-connect__sidebar">
          <div className="sj-connect__sidebar-logo">
            <i />
            Zenflow
          </div>
          <div className="sj-connect__sidebar-nav">
            <span style={{ width: "76%" }} />
            <span style={{ width: "58%" }} />
            <span style={{ width: "84%" }} />
            <span style={{ width: "64%" }} />
            <span style={{ width: "48%" }} />
          </div>
        </div>
        <div className="sj-connect__main">
          <div className="sj-connect__dash-title">連結アカウント</div>
          <div className="sj-connect__table-head">
            <div>アカウント</div>
            <div>アカウントがある国</div>
            <div className="sj-connect__amount">残高 (JPY)</div>
            <div className="sj-connect__amount">取引量 (USD)</div>
          </div>
          {ROWS.map(([name, country, balance, volume], i) => (
            <div
              key={name}
              className={
                i === activeRow ? "sj-connect__row sj-connect__row--active" : "sj-connect__row"
              }
            >
              <div className="sj-connect__account">
                <i style={{ background: ROW_COLORS[i] }} />
                {name}
              </div>
              <div>{country}</div>
              <div className="sj-connect__amount sj-tnum">{balance}</div>
              <div className="sj-connect__amount sj-tnum">{volume}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SjPlatformConnect() {
  const reduced = usePrefersReducedMotion();
  /* merchant 3 種 × 2 phase（注文 → 支払い完了）の巡回。
     原本 20s 監視実測（2026-06-11、y2200 帯）: 変化は ~11s 周期で 3-4 連発のクラスタ
     → 均等 interval でなく「注文 2s → 支払い完了 9.2s 保持」の不均等チェーン
     （merchant 1 巡 11.2s、切替時に変化が固まる = 原本のクラスタ波形） */
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const paid = tick % 2 === 1;
    const id = window.setTimeout(() => {
      setTick((prev) => (prev + 1) % (MERCHANTS.length * 2));
    }, paid ? 9200 : 2000);
    return () => { window.clearTimeout(id); };
  }, [reduced, tick]);

  const merchantIndex = Math.floor(tick / 2) % MERCHANTS.length;
  const paid = tick % 2 === 1;
  /* merchantIndex は常に length 内（noUncheckedIndexedAccess 対策の明示 fallback） */
  const merchant: Merchant = MERCHANTS[merchantIndex] ?? MERCHANTS[0] ?? {
    key: "",
    name: "",
    logoBg: "#000",
    rowIndex: 0,
    orderRows: [],
    total: ["", ""],
    methods: [],
    payButton: "",
    thanksDetail: "",
    pill: "",
  };
  const rowY = rowCenterY(merchant.rowIndex);

  return (
    <BentoCard
      id="connect"
      title="プラットフォームに決済機能を統合"
      className="sj-bento--connect"
      shift={{ x: -5.48, y: -2 }}
      glow
    >
      <div className="sj-connect__bg" aria-hidden="true">
        <img src={BG_IMG} alt="" loading="lazy" />
      </div>
      <Dashboard activeRow={paid ? merchant.rowIndex : null} />
      <div
        className="sj-connect__paycard"
        role="img"
        aria-label="国、支払い残高、決済額などの詳細を示す連結アカウントの管理画面。割引や最終価格を表示する注文概要が、その上に重ねて表示されています。"
      >
        <XFade
          index={merchantIndex}
          items={MERCHANTS.map((m) => (
            <div className="sj-connect__merchant">
              <span className="sj-connect__merchant-logo" style={{ background: m.logoBg }}>
                {m.name.charAt(0)}
              </span>
              {m.name}
            </div>
          ))}
        />
        <XFade
          index={merchantIndex * 2 + (paid ? 1 : 0)}
          delay={120}
          items={MERCHANTS.flatMap((m) => [
            <OrderScreen key={`${m.key}-order`} m={m} />,
            <ThanksScreen key={`${m.key}-thanks`} m={m} />,
          ])}
        />
      </div>
      {/* 支払い完了時: 点線の接続パス + 金額 pill + dashboard 行 highlight */}
      <div
        className={paid ? "sj-connect__flow sj-connect__flow--active" : "sj-connect__flow"}
        aria-hidden="true"
      >
        <svg width="100%" height="100%">
          <defs>
            <linearGradient id="sj-connect-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff5996" />
              <stop offset="100%" stopColor="#7a73ff" />
            </linearGradient>
          </defs>
          <path
            d={[
              `M ${String(PAYCARD_RIGHT - 8)} 215`,
              `C ${String(PAYCARD_RIGHT + 52)} 215,`,
              `${String(BROWSER_LEFT + 40)} ${String(rowY)},`,
              `${String(BROWSER_LEFT + 124)} ${String(rowY)}`,
            ].join(" ")}
            fill="none"
            stroke="url(#sj-connect-line)"
            strokeWidth="1.4"
            strokeDasharray="3 4"
          />
        </svg>
        <div className="sj-connect__pill" style={{ left: BROWSER_LEFT + 132, top: rowY - 11 }}>
          {merchant.pill}
        </div>
      </div>
    </BentoCard>
  );
}
