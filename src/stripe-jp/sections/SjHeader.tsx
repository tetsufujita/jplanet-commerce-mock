import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import "./SjHeader.css";

/* ============================================================
 * §0 Header + megamenu — stripe.com/jp 忠実再現（学習用）
 * 実測（specs/02-interactions.json / 01-motion-spec.md）:
 * - panel: x89 / y71 / w1262 @1440、白背景・角丸・shadow
 * - open: hover 後 ~180ms 出現、高さ展開 400ms cubic-bezier(0.4,0,0.2,1)
 * - trigger 間切替: panel は閉じず内容 swap（横 slide + crossfade）+ 高さ morph 250–300ms
 * - close: mouse leave 後 ≤336ms fade out（panel unmount）
 * - siblings 退色: rgb(6,27,49) → rgb(100,116,141)、≤333ms
 * - header は sticky でない・背景透過（open 中も headerBg = transparent、白さは veil + panel）
 * ============================================================ */

type MenuId = "products" | "solutions" | "developers" | "resources";
type NavKey = MenuId | "pricing";

const MENU_ORDER: readonly MenuId[] = [
  "products",
  "solutions",
  "developers",
  "resources",
];

const NAV_TRIGGERS: readonly { id: MenuId; label: string }[] = [
  { id: "products", label: "サービス" },
  { id: "solutions", label: "ソリューション" },
  { id: "developers", label: "開発者" },
  { id: "resources", label: "リソース" },
];

interface PanelItem {
  label: string;
  desc?: string;
}

interface PanelColumn {
  heading: string;
  items: PanelItem[];
}

/* ---- panel 内容（recordings/f-hover 022 / 026 / 030 / 036 から転記） ---- */

const PRODUCTS_COLUMNS: PanelColumn[] = [
  {
    heading: "Payments",
    items: [
      { label: "Payments", desc: "オンライン決済" },
      { label: "Managed Payments", desc: "マーチャントオブレコードソリューション" },
      { label: "決済用リンク", desc: "ノーコード決済" },
      { label: "Checkout", desc: "構築済み決済 UI" },
      { label: "Elements", desc: "柔軟な UI コンポーネント" },
      { label: "決済手段", desc: "100 以上に対応" },
      { label: "Terminal", desc: "対面決済" },
      { label: "Radar", desc: "不正利用防止" },
      { label: "Authorization Boost", desc: "決済承認率の最適化" },
      { label: "Link", desc: "決済の迅速化" },
    ],
  },
  {
    heading: "収益",
    items: [
      { label: "Billing", desc: "経常収益" },
      { label: "従量課金", desc: "従量課金制" },
      { label: "サブスクリプション", desc: "サブスクリプション管理" },
      { label: "Invoicing", desc: "1 回限りまたは継続請求" },
      { label: "Tax", desc: "消費税と VAT の自動計算" },
      { label: "Revenue Recognition", desc: "会計の自動化" },
      { label: "Stripe Sigma", desc: "カスタムレポート" },
      { label: "Data Pipeline", desc: "データの同期" },
    ],
  },
  {
    heading: "資金管理",
    items: [{ label: "Global Payouts", desc: "第三者への送金" }],
  },
  {
    heading: "プラットフォームとマーケットプレイス",
    items: [{ label: "Connect", desc: "プラットフォーム向けの決済" }],
  },
];

const PRODUCTS_ASIDE: PanelColumn = {
  heading: "さらに表示",
  items: [
    { label: "製品ロードマップ", desc: "今後の予定を確認" },
    { label: "Atlas", desc: "スタートアップの法人設立" },
    { label: "Climate", desc: "炭素削減" },
    { label: "Identity", desc: "オンライン本人確認" },
  ],
};

const GENERIC_PANELS: Record<Exclude<MenuId, "products">, PanelColumn[]> = {
  solutions: [
    {
      heading: "成長段階別",
      items: [{ label: "大企業" }, { label: "スタートアップ" }],
    },
    {
      heading: "ユースケース別",
      items: [
        { label: "エージェンティックコマース" },
        { label: "E コマース" },
        { label: "組込み型金融" },
        { label: "財務の自動化" },
        { label: "グローバルビジネス" },
        { label: "アプリ内決済" },
        { label: "マーケットプレイス" },
        { label: "プラットフォーム" },
        { label: "SaaS" },
      ],
    },
    {
      heading: "業種別",
      items: [
        { label: "AI 企業" },
        { label: "クリエイターエコノミー" },
        { label: "接客・旅行・レジャー" },
        { label: "保険" },
        { label: "メディア・エンターテインメント" },
        { label: "非営利団体" },
        { label: "パブリックセクター" },
        { label: "小売業" },
      ],
    },
    {
      heading: "エコシステム",
      items: [{ label: "パートナー" }, { label: "Stripe App Marketplace" }],
    },
  ],
  developers: [
    {
      heading: "ドキュメント",
      items: [
        { label: "Stripe ドキュメント" },
        { label: "Stripe の API はこちら" },
        { label: "ライブラリーと SDK" },
        { label: "Stripe Apps" },
      ],
    },
    {
      heading: "ガイド",
      items: [
        { label: "オンライン決済を受け付け" },
        { label: "構築済みの決済を実装" },
        { label: "プラットフォームやマーケットプレイスを構築" },
        { label: "サブスクリプションを管理" },
        { label: "従量課金請求を提供" },
        { label: "ステーブルコイン担保型のカードを発行" },
      ],
    },
    {
      heading: "リソース",
      items: [
        { label: "アプリ統合" },
        { label: "コードサンプル" },
        { label: "開発者ブログ" },
        { label: "API ステータス" },
      ],
    },
  ],
  resources: [
    {
      heading: "学ぶ",
      items: [{ label: "ブログ" }, { label: "導入事例" }, { label: "ガイド" }],
    },
    {
      heading: "サポート",
      items: [
        { label: "サポートにお問い合わせ" },
        { label: "管理対象サポートプラン" },
        { label: "プロフェッショナルサービス" },
      ],
    },
    {
      heading: "会社情報",
      items: [
        { label: "製品ロードマップ" },
        { label: "Sessions 年次カンファレンス" },
        { label: "採用情報" },
        { label: "ニュースルーム" },
        { label: "Stripe Press" },
      ],
    },
    {
      heading: "お問い合わせ",
      items: [{ label: "営業にお問い合わせ" }, { label: "パートナーになる" }],
    },
  ],
};

/* ---- 小物 component ---- */

function StripeLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="25"
      viewBox="0 0 60 25"
      aria-label="Stripe ロゴ"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M59.6444 14.2813h-8.062c.1843 1.9296 1.5983 2.5476 3.2032 2.5476 1.6352 0 2.9534-.3656 4.0453-.9506v3.3179c-1.1186.7115-2.5964 1.1068-4.5645 1.1068-4.011 0-6.8218-2.5122-6.8218-7.4783 0-4.19441 2.3837-7.52509 6.3017-7.52509 3.912 0 5.9537 3.28038 5.9537 7.49819 0 .3982-.0372 1.261-.0556 1.4835Zm-5.9241-5.62407c-1.0294 0-2.1739.72812-2.1739 2.58387h4.2573c0-1.85362-1.0721-2.58387-2.0834-2.58387ZM40.9547 20.303c-1.4411 0-2.322-.6087-2.9133-1.0417l-.0088 4.6271-4.1181.8755-.0014-19.19053h3.7543l.0864 1.01784c.6035-.52914 1.6114-1.29157 3.2256-1.29162 2.8925 0 5.6162 2.6052 5.6162 7.39971 0 5.2327-2.6948 7.6037-5.6409 7.6037Zm-.959-11.35573c-.9453 0-1.5376.34559-1.9669.81586l.0245 6.11967c.3997.433.9763.7813 1.9424.7813 1.5231 0 2.5437-1.6575 2.5437-3.8745 0-2.1544-1.037-3.84233-2.5437-3.84233Zm-11.7602-3.3739h4.1341V20.0088h-4.1341V5.57337Zm0-4.694699L32.3696 0v3.35821l-4.1341.87868V.878671ZM23.9198 10.2223v9.7861h-4.1156V5.57296h3.6867l.1317 1.21751c1.0035-1.7722 3.0722-1.41321 3.6209-1.21594v3.78524c-.5242-.16908-2.2894-.42779-3.3237.86253Zm-8.5525 4.7221c0 2.4275 2.5988 1.6719 3.1263 1.4609v3.3522c-.5492.3013-1.5437.5458-2.8901.5458-2.4441 0-4.2773-1.7999-4.2773-4.2379l.0173-13.17658 4.0206-.85464.0032 3.5395h3.1278V9.0857h-3.1278v5.8588-.0001Zm-4.9069.7026c0 2.9645-2.31051 4.6562-5.73464 4.6562-1.41958 0-2.92289-.2761-4.453935-.9347v-3.9319c1.382085.7516 3.093705 1.315 4.457755 1.315.91864 0 1.53106-.2459 1.53106-1.0069C6.26064 13.7786 0 14.5192 0 9.95995 0 7.04457 2.27622 5.2998 5.61655 5.2998c1.36404 0 2.72806.20934 4.09208.75351V9.9317c-1.25265-.67618-2.84332-1.05979-4.09588-1.05979-.86296 0-1.44753.24965-1.44753.8924.0001 1.85329 6.29518.97249 6.29518 5.88279v-.0001Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="sj-nav-item__chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4.67065 6L9.3 10.6" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12.6707 6L8.67065 10" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

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
      <path className="sj-arrow__bar" d="M0.5 5.5h7" />
      <path className="sj-arrow__tip" d="M1.5 1.5l4 4-4 4" />
    </svg>
  );
}

/* 本家と同じ SVG mask 方式: 白 pill から文字をくり抜き、背景（hero gradient / veil）を透かす */
function SignInPill() {
  return (
    <a
      className="sj-signin"
      href="https://dashboard.stripe.com/login"
      aria-label="サインイン"
    >
      <svg className="sj-signin__mask" aria-hidden="true">
        <defs>
          <mask id="sj-signin-cutout">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fill="black"
            >
              サインイン
            </text>
          </mask>
        </defs>
        <rect
          className="sj-signin__tint"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#061b31"
        />
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#ffffff"
          mask="url(#sj-signin-cutout)"
        />
      </svg>
      <span className="sj-signin__measure">サインイン</span>
    </a>
  );
}

function PanelList({ items }: { items: PanelItem[] }) {
  return (
    <ul className="sj-plist">
      {items.map((item) => (
        <li key={item.label}>
          <a className="sj-plink" href="#">
            {item.label}
          </a>
          {item.desc !== undefined ? (
            <p className="sj-pdesc">{item.desc}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/* panel 本体。mount 時に自身の高さを親へ通知（高さ morph 用） */
function PanelBody({
  id,
  onMeasure,
}: {
  id: MenuId;
  onMeasure: (h: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      onMeasure(ref.current.offsetHeight);
    }
  }, [id, onMeasure]);

  if (id === "products") {
    return (
      <div ref={ref} className="sj-panel sj-panel--products">
        <div className="sj-panel__main">
          {PRODUCTS_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="sj-pheading sj-pheading--rule">{col.heading}</h3>
              <PanelList items={col.items} />
            </div>
          ))}
        </div>
        <aside className="sj-panel__aside">
          <h3 className="sj-pheading">{PRODUCTS_ASIDE.heading}</h3>
          <PanelList items={PRODUCTS_ASIDE.items} />
          <div className="sj-sessions-card">
            <img
              className="sj-sessions-card__thumb"
              src="/stripe-jp/sessions-thumb.png"
              alt=""
              width={184}
              height={112}
              loading="lazy"
              aria-hidden="true"
            />
            <p className="sj-sessions-card__title">Stripe Sessions 2026</p>
            <p className="sj-sessions-card__desc">
              Stripe が AI の経済インフラをどのように構築しているかをご覧ください。
            </p>
            <a className="sj-sessions-card__link" href="#">
              こちらからご覧ください <span aria-hidden="true">›</span>
            </a>
          </div>
        </aside>
      </div>
    );
  }

  const columns = GENERIC_PANELS[id];
  return (
    <div
      ref={ref}
      className="sj-panel sj-panel--cols"
      style={{ gridTemplateColumns: `repeat(${String(columns.length)}, 1fr)` }}
    >
      {columns.map((col, i) => {
        const classes = [
          "sj-gcol",
          i > 0 ? "sj-gcol--sep" : "",
          i === columns.length - 1 ? "sj-gcol--tint" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={col.heading} className={classes}>
            <h3 className="sj-pheading">{col.heading}</h3>
            <PanelList items={col.items} />
          </div>
        );
      })}
    </div>
  );
}

/* trigger 間切替の内容 slide（実測: incoming は移動方向側から大きめに入る） */
const contentVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 110 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -44 * dir }),
};

const OPEN_DELAY_MS = 130; // 実測: 原本 177ms、delay 130ms → 出現 ~177ms
const CLOSE_DELAY_MS = 136; // close 合計 ~336ms（delay 136 + fade 200）

export function SjHeader() {
  const [open, setOpen] = useState<MenuId | null>(null);
  const [hovered, setHovered] = useState<NavKey | null>(null);
  const [dir, setDir] = useState(1);
  const [openMode, setOpenMode] = useState<"open" | "switch">("open");
  const [panelH, setPanelH] = useState(0);

  const openRef = useRef<MenuId | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearOpenTimer = () => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (id: MenuId) => {
    const prev = openRef.current;
    if (prev === id) return;
    if (prev === null) {
      setOpenMode("open");
    } else {
      // panel は閉じずに内容 swap + 高さ morph（250–300ms）
      setOpenMode("switch");
      setDir(MENU_ORDER.indexOf(id) > MENU_ORDER.indexOf(prev) ? 1 : -1);
    }
    openRef.current = id;
    setOpen(id);
  };

  const closeMenu = () => {
    openRef.current = null;
    setOpen(null);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      closeMenu();
    }, CLOSE_DELAY_MS);
  };

  const onTriggerEnter = (id: MenuId) => {
    setHovered(id);
    clearCloseTimer();
    clearOpenTimer();
    if (openRef.current !== null) {
      openMenu(id); // 既に open → 即 swap
    } else {
      openTimer.current = window.setTimeout(() => {
        openTimer.current = null;
        openMenu(id);
      }, OPEN_DELAY_MS);
    }
  };

  const onPricingEnter = () => {
    setHovered("pricing");
    clearOpenTimer();
    if (openRef.current !== null) {
      scheduleClose(); // megamenu 無し項目 → panel close
    }
  };

  const onHeaderEnter = () => {
    clearCloseTimer();
  };

  const onHeaderLeave = () => {
    setHovered(null);
    clearOpenTimer();
    scheduleClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openTimer.current !== null) {
          window.clearTimeout(openTimer.current);
          openTimer.current = null;
        }
        if (closeTimer.current !== null) {
          window.clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }
        openRef.current = null;
        setOpen(null);
        setHovered(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(
    () => () => {
      if (openTimer.current !== null) window.clearTimeout(openTimer.current);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  // siblings 退色: hover 中 or open 中、非 active 項目を退色
  const activeKey: NavKey | null = hovered ?? open;
  const fadeClass = (key: NavKey) =>
    activeKey !== null && activeKey !== key ? " is-faded" : "";

  // open = 400ms cubic-bezier(0.4,0,0.2,1) / 切替 morph = 300ms ease-in-out
  const heightTransition: Transition =
    openMode === "switch"
      ? { duration: 0.3, ease: "easeInOut" }
      : { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

  return (
    <header
      className={`sj-header${open !== null ? " sj-header--open" : ""}`}
      onMouseEnter={onHeaderEnter}
      onMouseLeave={onHeaderLeave}
    >
      <div className="sj-header__container">
        <a
          className="sj-header__logo"
          href="https://stripe.com/jp"
          aria-label="Stripe ホームページ"
        >
          <StripeLogo />
        </a>

        <nav aria-label="グローバルナビゲーション">
          <ul className="sj-nav-list" onMouseLeave={() => { setHovered(null); }}>
            {NAV_TRIGGERS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`sj-nav-item${fadeClass(t.id)}`}
                  aria-expanded={open === t.id}
                  aria-haspopup="true"
                  onMouseEnter={() => { onTriggerEnter(t.id); }}
                  onClick={() => {
                    if (openRef.current === t.id) {
                      closeMenu();
                    } else {
                      openMenu(t.id);
                    }
                  }}
                >
                  {t.label}
                  <ChevronIcon />
                </button>
              </li>
            ))}
            <li>
              <a
                className={`sj-nav-item${fadeClass("pricing")}`}
                href="https://stripe.com/jp/pricing"
                onMouseEnter={onPricingEnter}
              >
                料金体系
              </a>
            </li>
          </ul>
        </nav>

        <ul className="sj-header__buttons">
          <li>
            <SignInPill />
          </li>
          <li>
            <a
              className="sj-btn-primary"
              href="https://stripe.com/jp/contact/sales"
            >
              営業にお問い合わせ
              <HoverArrow />
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="sj-hamburger"
          aria-label="ナビゲーションメニューを切り替え"
          aria-expanded={false}
        >
          <svg width="40" height="40" viewBox="0 0 100 100" aria-hidden="true">
            <rect width="40" height="5" x="30" y="38" />
            <rect width="40" height="5" x="30" y="48" />
            <rect width="40" height="5" x="30" y="58" />
          </svg>
        </button>
      </div>

      {/* 背後の白 veil（最終 opacity 0.85、page より前・panel より後） */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            key="veil"
            className="sj-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* megamenu panel */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            key="megamenu"
            className="sj-megamenu-pos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="sj-megamenu-panel"
              initial={{ height: 0 }}
              animate={{ height: panelH }}
              transition={heightTransition}
            >
              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.div
                  key={open}
                  className="sj-megamenu-content"
                  custom={dir}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <PanelBody id={open} onMeasure={setPanelH} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
