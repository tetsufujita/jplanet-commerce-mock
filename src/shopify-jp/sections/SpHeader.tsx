import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Rocket, ArrowRightLeft, Sparkles } from "lucide-react";

/**
 * header — sticky 72px / 透明→scroll で dark 化 / hover megamenu。
 * menu 構造は保存 DOM（design/reproductions/shopify-jp/shopify-jp-dom.html）から実測。
 * 短い機能ラベルは原文、説明文は paraphrase。
 * TODO(measure): 本家 panel の bg/radius/開閉アニメ timing（hover 自動化が aria 未付与で不可 → 仮値 200ms）
 */

interface MenuGroup {
  heading: string;
  items: string[];
}

const PRODUCT_GROUPS: readonly MenuGroup[] = [
  {
    heading: "独自ウェブサイトの構築",
    items: ["ウェブサイトビルダー", "テーマ", "ドメイン", "お客様アカウント"],
  },
  {
    heading: "どこでも販売する",
    items: [
      "オンライン",
      "AIチャット",
      "POS",
      "Shopアプリ",
      "SNSとモール型EC",
      "グローバル",
      "B2B",
      "複数マーケットへの展開",
    ],
  },
  {
    heading: "マーケティングと分析",
    items: ["広告とキャンペーン", "メールとカスタマーチャット", "ディスカウント", "ストア分析"],
  },
  {
    heading: "ビジネスを運営する",
    items: ["注文管理と在庫管理", "配送", "ワークフローのオートメーション"],
  },
  {
    heading: "支払いを受ける",
    items: ["チェックアウト", "決済方法"],
  },
];

/* 右カラム（開発者向け）。説明は paraphrase */
const PRODUCT_DEV: readonly { title: string; desc: string }[] = [
  { title: "エージェント向けコマース", desc: "エージェント連携のための開発ツール群。" },
  { title: "Shopify App Store", desc: "拡張アプリが集まるエコシステム。" },
  { title: "Shopify.dev", desc: "開発者向けドキュメントと CLI。" },
];

/* 「Shopifyを選ぶ理由」promo 3 枚。説明は paraphrase */
const WHY_PROMOS: readonly { icon: typeof Rocket; title: string; desc: string }[] = [
  { icon: Rocket, title: "短期間で開業", desc: "すぐに販売を始められる立ち上げ環境。" },
  { icon: ArrowRightLeft, title: "Shopifyへ移行する", desc: "集客と売上の成長を移行で加速。" },
  { icon: Sparkles, title: "Sidekick", desc: "コマースに特化した AI アシスタント。" },
];

type OpenMenu = "why" | "product" | null;

const NAV_ITEMS: readonly { label: string; menu: OpenMenu }[] = [
  { label: "Shopifyを選ぶ理由", menu: "why" },
  { label: "製品", menu: "product" },
  { label: "価格設定", menu: null },
  { label: "Enterprise", menu: null },
];

function MenuPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
      className="absolute top-[64px] left-1/2 w-max max-w-[1100px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0B1213] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.55)]"
    >
      {children}
    </motion.div>
  );
}

export function SpHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<OpenMenu>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-[72px] transition-colors duration-300 ${
        scrolled || open ? "bg-sp-dark/90 backdrop-blur-md" : "bg-transparent"
      }`}
      onMouseLeave={() => {
        setOpen(null);
      }}
    >
      <div className="relative mx-auto flex h-full max-w-[1520px] items-center justify-between px-8 lg:px-[90px]">
        <div className="flex items-center gap-10">
          {/* placeholder wordmark（本家ロゴ SVG は複製しない） */}
          <a href="#top" className="text-[22px] font-bold tracking-tight text-white">
            Shopify
          </a>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-expanded={item.menu ? open === item.menu : undefined}
                onMouseEnter={() => {
                  setOpen(item.menu);
                }}
                onFocus={() => {
                  setOpen(item.menu);
                }}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                  item.menu && open === item.menu
                    ? "bg-white/10 text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
                {item.menu ? <ChevronDown className="size-3.5 opacity-70" /> : null}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-full px-4 py-2 text-[15px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white md:block"
          >
            資料請求
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[15px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            ログイン
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2 text-[16px] font-[550] text-black transition-transform duration-200 hover:scale-[1.03]"
          >
            無料で始める
          </button>
        </div>

        <AnimatePresence>
          {open === "why" ? (
            <MenuPanel key="why">
              <div className="grid w-[720px] grid-cols-3 gap-4">
                {WHY_PROMOS.map(({ icon: Icon, title, desc }) => (
                  <a
                    key={title}
                    href="#"
                    className="rounded-xl bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.09]"
                  >
                    <Icon className="mb-4 size-6 text-sp-avocado" strokeWidth={1.75} />
                    <p className="text-[16px] font-[550] text-white">{title}</p>
                    <p className="mt-1 text-[13px] leading-[1.6] text-sp-gray">{desc}</p>
                  </a>
                ))}
              </div>
            </MenuPanel>
          ) : null}

          {open === "product" ? (
            <MenuPanel key="product">
              <div className="flex gap-10">
                <div className="grid w-[640px] grid-cols-3 gap-x-8 gap-y-7">
                  {PRODUCT_GROUPS.map((g) => (
                    <div key={g.heading} className={g.items.length > 4 ? "row-span-2" : ""}>
                      <p className="mb-3 text-[12px] font-[550] tracking-wide text-white/45">
                        {g.heading}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {g.items.map((it) => (
                          <li key={it}>
                            <a
                              href="#"
                              className="text-[14px] text-white/85 transition-colors hover:text-white"
                            >
                              {it}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex w-[260px] flex-col gap-3 border-l border-white/10 pl-8">
                  <p className="text-[12px] font-[550] tracking-wide text-white/45">開発者向け</p>
                  {PRODUCT_DEV.map((d) => (
                    <a
                      key={d.title}
                      href="#"
                      className="rounded-lg p-3 transition-colors hover:bg-white/[0.06]"
                    >
                      <p className="text-[14px] font-[550] text-white">{d.title}</p>
                      <p className="mt-0.5 text-[12px] leading-[1.6] text-sp-gray">{d.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            </MenuPanel>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
