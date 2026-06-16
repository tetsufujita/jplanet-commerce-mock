import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { SpSection } from "@/shopify-jp/ui/SpSection";

/**
 * 14-footer — Shopify JP footer 学習用再現
 * spec: design/reproductions/shopify-jp/specs/14-footer.md
 * bg #000 / text #A1A1AA / border #121C1E / py-20 px-24 / 5 col grid / 全体 ≈ 564px @1440
 */

interface FooterLink { label: string; href: string }
interface FooterColumn { title: string; links: FooterLink[] }

const LINK_COLUMNS: FooterColumn[] = [
  {
    title: "Konoha",
    links: [
      { label: "Konoha とは", href: "#" },
      { label: "Konoha Editions", href: "#" },
      { label: "投資家の皆様へ", href: "#" },
    ],
  },
  {
    title: "エコシステム",
    links: [
      { label: "開発者ドキュメント", href: "#" },
      { label: "テーマストア", href: "#" },
      { label: "App Store", href: "#" },
      { label: "パートナー", href: "#" },
      { label: "アフィリエイト", href: "#" },
    ],
  },
  {
    title: "リソース",
    links: [
      { label: "ブログ", href: "#" },
      { label: "Konoha との比較", href: "#" },
      { label: "コース", href: "#" },
      { label: "無料ツール", href: "#" },
      { label: "変更ログ", href: "#" },
    ],
  },
  {
    title: "サポート",
    links: [
      { label: "Konoha ヘルプセンター", href: "#" },
      { label: "コミュニティフォーラム", href: "#" },
      { label: "パートナーを採用する", href: "#" },
      { label: "サービスステータス", href: "#" },
    ],
  },
];

interface LegalLink { label: string; href: string; ccpaIcon?: boolean }

const LEGAL_LINKS: LegalLink[] = [
  { label: "利用規約", href: "#" },
  { label: "法的事項", href: "#" },
  { label: "プライバシーポリシー", href: "#" },
  { label: "サイトマップ", href: "#" },
  { label: "プライバシーに関する選択", href: "#", ccpaIcon: true },
];

interface SnsItem { label: string; href: string; glyph: ReactNode }

/** 白丸 32×32 + 黒グリフ（本家 sprite は複製せず簡易自作） */
const SNS_ITEMS: SnsItem[] = [
  {
    label: "Facebook",
    href: "#",
    glyph: <span className="text-[18px] font-bold leading-none">f</span>,
  },
  {
    label: "X",
    href: "#",
    glyph: <span className="text-[15px] font-bold leading-none">X</span>,
  },
  {
    label: "YouTube",
    href: "#",
    glyph: (
      <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden="true">
        <path d="M3 2.2v7.6L10 6 3 2.2Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    glyph: (
      <svg
        viewBox="0 0 14 14"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="12" height="12" rx="3.5" />
        <circle cx="7" cy="7" r="3" />
        <circle cx="10.6" cy="3.4" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    glyph: <span className="text-[16px] leading-none">♪</span>,
  },
  {
    label: "LinkedIn",
    href: "#",
    glyph: <span className="text-[13px] font-bold leading-none">in</span>,
  },
  {
    label: "Pinterest",
    href: "#",
    glyph: <span className="text-[16px] font-bold leading-none">P</span>,
  },
];

interface Region {
  country: string;
  current?: boolean;
  languages: FooterLink[];
}

/** 本家は数十地域 × columns-4。学習再現はダミー 6 件で構造のみ踏襲 */
const REGIONS: Region[] = [
  { country: "日本", current: true, languages: [{ label: "日本語", href: "#" }] },
  { country: "オーストラリア", languages: [{ label: "English", href: "#" }] },
  { country: "ブラジル", languages: [{ label: "Português", href: "#" }] },
  {
    country: "カナダ",
    languages: [
      { label: "English", href: "#" },
      { label: "Français", href: "#" },
    ],
  },
  { country: "シンガポール", languages: [{ label: "English", href: "#" }] },
  {
    country: "香港",
    languages: [
      { label: "English", href: "#" },
      { label: "繁體中文", href: "#" },
    ],
  },
];

/** 架空「Konoha」葉ロゴ（44×50・白ワンカラー）。本家バッグ形状はトレースしない */
function KonohaMark() {
  return (
    <svg viewBox="0 0 44 50" className="h-[50px] w-11" aria-hidden="true">
      <path
        d="M22 2C12.2 9.8 5 20 5 31c0 9.4 7.6 17 17 17s17-7.6 17-17C39 20 31.8 9.8 22 2Z"
        fill="#FFFFFF"
      />
      <path
        d="M22 10v32M22 21l-6.5-4.5M22 21l6.5-4.5M22 31l-7.5-5.5M22 31l7.5-5.5"
        stroke="#000000"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** CCPA opt-out アイコン簡易モック（30×14、青ピル + 白チェック + ✕）。本家 CDN svg は使わない */
function CcpaIcon() {
  return (
    <svg viewBox="0 0 30 14" className="h-3.5 w-[30px] shrink-0" aria-hidden="true">
      <rect x="0.5" y="0.5" width="29" height="13" rx="6.5" fill="#FFFFFF" stroke="#0674D9" />
      <path d="M15 .5H7.5a6.5 6.5 0 0 0 0 13H15V.5Z" fill="#0674D9" />
      <path
        d="m5.5 7 2 2 3.5-4.5"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="m19.5 4.5 5 5m0-5-5 5"
        stroke="#0674D9"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function FooterLinkColumn({ column }: { column: FooterColumn }) {
  return (
    <li>
      <h3 className="mb-6 text-xl font-medium leading-5 text-white">{column.title}</h3>
      <ul className="flex flex-col gap-y-4">
        {column.links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-[16px] leading-6 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

function RegionSelector() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="sp-footer-region-panel"
        aria-label="地域メニュー. 現在: 日本"
        onClick={() => { setOpen((v) => !v); }}
        className="inline-flex items-center gap-x-1 text-[16px] text-[#E0E0E0] transition-colors duration-200 hover:text-white"
      >
        <Globe className="size-4 text-white" aria-hidden="true" />
        <span>日本 | 日本語</span>
        {/* TODO(measure): 開時 rotate-180 は推定（開状態未キャプチャ） */}
        <ChevronDown
          className={`size-4 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* TODO(measure): sm 未満の黒幕 overlay（bg-black opacity fade）は未実装（開状態未実測） */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="sp-footer-region-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            // TODO(measure): 本家は display 切替 + bottom-[calc(100%+5em)]。fade/slide と offset は仮
            className="absolute bottom-[calc(100%+1.25rem)] left-0 z-50 w-[min(66rem,86vw)] rounded-lg bg-zinc-900 text-white shadow-2xl"
          >
            <div className="columns-1 gap-7 px-14 py-10 sm:columns-2 md:columns-3 lg:columns-4">
              {REGIONS.map((region) => (
                <div key={region.country} className="mb-6 break-inside-avoid">
                  <div className="flex items-center gap-1 text-[16px] text-white">
                    <span>{region.country}</span>
                    {region.current ? (
                      <span className="inline-flex size-[30px] items-center justify-center">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[14px] text-zinc-400">
                    {region.languages.map((lang, i) => (
                      <span key={lang.label}>
                        {i > 0 ? <span className="opacity-40"> | </span> : null}
                        <a href={lang.href} className="hover:underline">
                          {lang.label}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SpFooter() {
  return (
    <SpSection id="14-footer" bg="black">
      <footer className="relative grid grid-cols-1 gap-x-8 gap-y-14 px-8 py-20 text-[#A1A1AA] sm:grid-cols-3 md:grid-cols-5 md:px-24">
        {/* col 1: back-to-top ロゴ（44×50） */}
        <div>
          <a href="#main" aria-label="トップに戻る" className="inline-block">
            <KonohaMark />
          </a>
        </div>

        {/* col 2-5: リンク列 */}
        <ul className="grid gap-y-14 sm:col-span-2 sm:grid-cols-2 sm:gap-x-8 md:col-span-4 md:grid-cols-4">
          {LINK_COLUMNS.map((column) => (
            <FooterLinkColumn key={column.title} column={column} />
          ))}
        </ul>

        {/* ボトムバー: 言語切替 / 法的リンク / SNS */}
        <div className="flex w-full flex-col gap-y-7 border-t border-[#121C1E] pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 md:col-span-5 lg:flex-nowrap">
          <RegionSelector />

          {/* lg では本家同様 1 行固定 → 各 li が縮んでラベルが 2 行に折り返す */}
          <ul className="flex flex-wrap gap-x-10 gap-y-2 md:me-auto lg:flex-nowrap">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`text-[16px] leading-6 transition-colors duration-200 hover:text-white ${
                    link.ccpaIcon ? "inline-flex items-center gap-1.5" : ""
                  }`}
                >
                  {link.label}
                  {link.ccpaIcon ? <CcpaIcon /> : null}
                </a>
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-4">
            {SNS_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-opacity duration-200 hover:opacity-70"
                >
                  {item.glyph}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </SpSection>
  );
}
