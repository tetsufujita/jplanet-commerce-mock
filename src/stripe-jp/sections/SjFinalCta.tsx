import type { ReactNode } from "react";

/**
 * §8 — Footer CTA「今すぐ始める」（学習用再現）
 * 元 DOM: design/reproductions/stripe-jp/stripe-jp-dom.html offset 669,867–675,898
 *         （.footer-cta-section__grid / feature card は DOM 上 2 枚）
 * 視覚:   recordings/f-scroll/058 / storyboard-scroll-054.md モーション #4
 * motion: entrance なし（即表示）が確定仕様（01-motion-spec.md §0-1）。
 *         動きは CTA hover（arrow shift + bg darken ~200ms ease-out）のみ。
 */

/**
 * 全 CTA 共通の hover arrow（hds-icon-hover-arrow 再現）。
 * 軸線「—」が fade-in して「›」→「→」化 + くの字 1px 右シフト（motion-spec §2b）。
 * 親要素に `group` class 必須。
 */
function HoverArrow() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className="ml-1.5 shrink-0"
    >
      <path
        d="M0.5 5.5h7"
        className="opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
      />
      <path
        d="M1.5 1.5l4 4-4 4"
        className="transition-transform duration-200 ease-out group-hover:translate-x-px"
      />
    </svg>
  );
}

/*
 * charm icon の gradient（--icon-gradient-start/middle/end）は外部 CSS 由来で
 * snapshot に値が無い → 近似色。TODO(measure): 本家 computed style で実値取得。
 */
const ICON_GRADIENT_STOPS = (
  <>
    <stop stopColor="#00d4ff" />
    <stop offset="0.5" stopColor="#635bff" />
    <stop offset="1" stopColor="#9a66ff" />
  </>
);

/** card 1 charm: 値札 tag アイコン（SVG mask + linearGradient、DOM 原寸 24×24） */
function TagCharm() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask
        id="sj-cta-tag-mask"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <path d="M7.97868 10.0982C8.56431 10.6838 9.51382 10.6838 10.0995 10.0982C10.6851 9.51252 10.6851 8.56302 10.0995 7.97738C9.51382 7.39174 8.56431 7.39174 7.97868 7.97738C7.39304 8.56302 7.39304 9.51252 7.97868 10.0982Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12.4801 5.05473C11.9426 4.51724 11.2066 4.22619 10.4469 4.2507L5.83281 4.39954C5.64236 4.40568 5.46139 4.48408 5.32666 4.61882L4.61955 5.32593C4.48482 5.46066 4.40642 5.64163 4.40027 5.83208L4.25143 10.4461C4.22692 11.2059 4.51797 11.9419 5.05546 12.4793L11.6906 19.1145C12.7646 20.1884 14.5058 20.1884 15.5797 19.1145L19.1152 15.579C20.1892 14.505 20.1892 12.7638 19.1152 11.6899L12.4801 5.05473ZM10.4952 5.74992C10.8406 5.73878 11.1751 5.87107 11.4194 6.11539L18.0546 12.7505C18.5427 13.2387 18.5427 14.0302 18.0546 14.5183L14.519 18.0538C14.0309 18.542 13.2394 18.542 12.7513 18.0538L6.11612 11.4187C5.8718 11.1744 5.73951 10.8398 5.75065 10.4945L5.88993 6.17687L6.1776 5.8892L10.4952 5.74992Z" fill="white" />
      </mask>
      <g mask="url(#sj-cta-tag-mask)">
        <rect width="24" height="24" fill="url(#sj-cta-tag-gradient)" />
      </g>
      <defs>
        <linearGradient
          id="sj-cta-tag-gradient"
          x1="15.3494"
          y1="0"
          x2="7.07976"
          y2="22.5225"
          gradientUnits="userSpaceOnUse"
        >
          {ICON_GRADIENT_STOPS}
        </linearGradient>
      </defs>
    </svg>
  );
}

/** card 2 charm: code「</>」アイコン（DOM 原寸 16×16） */
function CodeCharm() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8.36538 1.63859c.0892-.46089.53514-.762197.99603-.672994.46089.089204.76219.535144.67299.996034L7.63445 14.3616c-.0892.4609-.53514.7622-.99603.673s-.7622-.5352-.67299-.9961z" fill="url(#sj-cta-code-gradient)" />
      <path d="M5.20094 3.39886c.33195.33194.33195.87013.00001 1.20208L1.80208 7.99986l2.79899 2.79894c.33194.332.33194.8702 0 1.2021-.33195.332-.87014.332-1.20209 0L.395406 8.99734C.142232 8.74417 0 8.40079 0 8.04275v-.08579c0-.35804.14223-.70141.395399-.95458L3.99886 3.39887c.33194-.33195.87013-.33196 1.20208-.00001" fill="url(#sj-cta-code-gradient)" />
      <path d="M11.399 3.99922c.3319-.33196.8701-.33197 1.2021-.00003l3.0034 3.00336c.2532.25318.3955.59656.3955.95461v.08578c0 .35804-.1423.70142-.3955.9546L12.0011 12.601c-.332.332-.8701.332-1.2021 0-.3319-.3319-.3319-.8701 0-1.2021l3.3989-3.39884L11.399 5.2013c-.332-.33194-.332-.87013 0-1.20208" fill="url(#sj-cta-code-gradient)" />
      <defs>
        <linearGradient
          id="sj-cta-code-gradient"
          x1="10.2329"
          y1="0"
          x2="4.71984"
          y2="15.015"
          gradientUnits="userSpaceOnUse"
        >
          {ICON_GRADIENT_STOPS}
        </linearGradient>
      </defs>
    </svg>
  );
}

interface FeatureCard {
  readonly icon: ReactNode;
  readonly title: string;
  readonly desc: string;
  readonly linkLabel: string;
  readonly href: string;
}

const FEATURE_CARDS: readonly FeatureCard[] = [
  {
    icon: <TagCharm />,
    title: "お支払い額をご確認ください",
    desc: "手数料によるわかりやすくシンプルな料金。初期費用や月額費用の固定費はありません。",
    linkLabel: "料金の詳細",
    href: "/jp/pricing",
  },
  {
    icon: <CodeCharm />,
    title: "構築を開始する",
    desc: "わずか 10 分程度で Stripe に登録し、利用開始できます。",
    linkLabel: "実装オプション",
    href: "https://docs.stripe.com/get-started",
  },
];

export function SjFinalCta() {
  return (
    <section className="bg-[#f6f9fc]">
      {/* events 系と同じ wide container（f-scroll/058 実測: 左 margin ≈100px @1440 → 1232px） */}
      <div className="mx-auto max-w-[1232px] px-4 py-16 lg:py-[104px]">
        <div className="grid gap-x-20 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* 左: 見出し + 説明 + CTA（DOM: __content-text + hds-button-group） */}
          <div>
            {/* 本家は span（hds-heading--lg）。見出しタグではない点も踏襲 */}
            <span className="block text-[28px] font-semibold tracking-[-0.4px] text-[#0a2540]">
              今すぐ始める
            </span>
            <p className="mt-4 max-w-[26em] text-[18px] leading-[1.6] text-[#425466]">
              今すぐアカウントを作成するか、貴社のビジネスに最適なカスタムパッケージについてはお問い合わせください。
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {/* primary: hover で arrow shift + bg darken（実測 RGB(83,68,203)、motion-spec §2b） */}
              <a
                className="group inline-flex items-center rounded-full bg-[#635bff] py-1.5 pr-3.5 pl-4 text-[15px] font-medium text-white transition-colors duration-200 ease-out hover:bg-[#5344cb]"
                href="https://dashboard.stripe.com/register"
              >
                今すぐ始める
                <HoverArrow />
              </a>
              {/* secondary: hover は border 色のみ gray → 薄紫 #CAC4EA（motion-spec §2b） */}
              <a
                className="inline-flex items-center rounded-full border border-[#d8dee4] bg-white px-4 py-1.5 text-[15px] font-medium text-[#0a2540] transition-colors duration-200 ease-out hover:border-[#cac4ea]"
                href="/jp/contact/sales"
              >
                営業にお問い合わせ
              </a>
            </div>
          </div>

          {/* 右: feature card ×2（charm icon + 見出し + 本文 + callout link） */}
          <div className="grid gap-10 sm:grid-cols-2">
            {FEATURE_CARDS.map((card) => (
              <div key={card.title} className="flex flex-col items-start">
                <div className="flex h-6 items-center">{card.icon}</div>
                <h4 className="mt-4 text-[15px] font-semibold text-[#0a2540]">{card.title}</h4>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#425466]">{card.desc}</p>
                {/* hds-link--callout: hover で navy 化 + arrow shift */}
                <a
                  className="group mt-3 inline-flex items-center text-[15px] font-semibold text-[#635bff] transition-colors duration-200 ease-out hover:text-[#0a2540]"
                  href={card.href}
                >
                  {card.linkLabel}
                  <HoverArrow />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
