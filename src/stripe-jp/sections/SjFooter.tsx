import "./SjFooter.css";

/* stripe.com/jp §9 Footer 忠実再現（DOM offset 675,898–691,346 を全文抽出）
   - リンク文言・カラム構成は DOM そのまま（href は学習用に "#"）
   - 完全静的 section（motion spec §1 #9: entrance なし）。動きは hover transition のみ */

interface SjFooterBlock {
  title: string;
  links: string[];
}

/** 4 カラム × 各 1–2 block（DOM の footer-links-section__content 単位） */
const FOOTER_COLUMNS: SjFooterBlock[][] = [
  [
    {
      title: "プロダクト・料金体系",
      links: [
        "料金体系",
        "Atlas",
        "Authorization Boost",
        "Billing",
        "Capital",
        "Capital for platforms",
        "Checkout",
        "Climate",
        "Connect",
        "Crypto",
        "Crypto Onramp",
        "Data Pipeline",
        "Elements",
        "Financial Connections",
        "Global Payouts",
        "Identity",
        "Invoicing",
        "Issuing",
        "Link",
        "Managed Payments",
        "Payment links",
        "決済手段",
        "Payments",
        "Radar",
        "Revenue Recognition",
        "Stripe Sigma",
        "サブスクリプション",
        "Tax",
        "Terminal",
        "Treasury",
        "Treasury for platforms",
        "従量課金",
      ],
    },
  ],
  [
    {
      title: "ソリューション",
      links: [
        "大企業",
        "スタートアップ",
        "エージェンティックコマース",
        "E コマース",
        "組込み型金融",
        "財務の自動化",
        "グローバルビジネス",
        "アプリ内決済",
        "マーケットプレイス",
        "プラットフォーム",
        "SaaS",
        "AI 企業",
        "クリエイターエコノミー",
        "接客・旅行・レジャー",
        "保険",
        "メディア・エンターテインメント",
        "非営利団体",
        "パブリックセクター",
        "小売業",
      ],
    },
    {
      title: "開発者",
      links: [
        "ドキュメント",
        "Stripe の API はこちら",
        "API ステータス",
        "API の変更ログ",
        "ライブラリーと SDK",
        "開発者ブログ",
      ],
    },
  ],
  [
    {
      title: "統合とカスタムソリューション",
      links: [
        "Stripe App Marketplace",
        "Stripe パートナーエコシステム",
        "プロフェッショナルサービス",
      ],
    },
    {
      title: "リソース",
      links: [
        "製品ロードマップ",
        "ガイド",
        "導入事例",
        "ブログ",
        "Sessions 年次カンファレンス",
        "プライバシー・利用規約",
        "禁止業種・制限付き業種",
        "ライセンス",
        "サイトマップ",
        "クッキー設定",
        "その他リソース",
      ],
    },
  ],
  [
    {
      title: "会社情報",
      links: ["採用情報", "ニュースルーム", "Stripe Press", "営業にお問い合わせ"],
    },
    {
      title: "サポート",
      links: ["サポートにお問い合わせ", "管理対象サポートプラン"],
    },
  ],
];

/** 全 CTA 共通の hover-arrow（軸線 + くの字。hover で軸線 fade-in + tip 右 shift） */
function SjHoverArrow() {
  return (
    <svg
      className="sjf-arrow"
      width="10"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path className="sjf-arrow-line" d="M0.5 5.5h7" />
      <path className="sjf-arrow-tip" d="M1.5 1.5l4 4-4 4" />
    </svg>
  );
}

/** locale switcher の地球儀 icon（DOM の path をそのまま移植） */
function SjGlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 8c0 4.4183-3.5817 8-8 8-4.41828 0-8-3.5817-8-8 0-4.41828 3.58172-8 8-8 4.4183 0 8 3.58172 8 8Zm-7.30411 6.4632c-.22863.0243-.4608.0368-.69589.0368-.2351 0-.46728-.0125-.69592-.0368-.12459-.3594-.27565-.8297-.42689-1.3842-.15473-.5674-.30871-1.2196-.43487-1.929h3.11533c-.12616.7094-.28013 1.3616-.43487 1.929-.15124.5545-.3023 1.0248-.42689 1.3842Zm1.47641-.335c1.5026-.5327 2.7511-1.6023 3.5148-2.9782h-2.8103c-.1411.8451-.3209 1.6151-.4998 2.2711-.069.2527-.1379.4891-.2047.7071Zm4.0607-4.27822C14.4067 9.26364 14.5 8.64271 14.5 8c0-.64273-.0933-1.26367-.2671-1.85002h-3.1804c.0612.59626.0974 1.21659.0974 1.85006 0 .63342-.0362 1.25371-.0973 1.84994h3.1804Zm-.5459-5c-.7637-1.37588-2.0123-2.4455-3.5149-2.97814.0669.21796.1358.45441.2048.70717.1789.65594.3587 1.42587.4998 2.27097h2.8103ZM8.69587 1.53681c.12459.35943.27566.82968.42691 1.38425.15473.56735.3087 1.21954.43485 1.92892H6.44235c.12614-.70938.28011-1.36157.43484-1.92892.15125-.55456.30232-1.02482.42691-1.38425C7.53274 1.51248 7.76491 1.5 8 1.5c.23508 0 .46725.01248.69587.03681Zm-2.86815.33504c-1.50258.53265-2.75108 1.60226-3.51479 2.97813h2.81025c.14112-.8451.32093-1.61503.49982-2.27097.06894-.25276.1379-.4892.20472-.70716ZM1.76706 6.14998C1.59329 6.73633 1.5 7.35727 1.5 8c0 .64271.09328 1.26364.26704 1.84998h3.18038c-.06116-.59623-.09732-1.21652-.09732-1.84994 0-.63347.03616-1.2538.09733-1.85006H1.76706ZM2.3129 11.15c.7637 1.3759 2.01221 2.4455 3.51479 2.9781-.0668-.2179-.13576-.4543-.20469-.707-.1789-.656-.35872-1.426-.49984-2.2711H2.3129Zm7.53697-3.14996c0 .63275-.03911 1.25373-.10461 1.84994H6.25472c-.06551-.59621-.10462-1.21719-.10462-1.84994 0-.6328.03911-1.25382.10463-1.85006h3.49051c.06552.59624.10463 1.21726.10463 1.85006Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SjFooter() {
  return (
    <footer className="sjf">
      <div className="sjf-container">
        <div className="sjf-grid">
          {FOOTER_COLUMNS.map((blocks, colIndex) => (
            <div className="sjf-col" key={blocks[0]?.title ?? colIndex}>
              {blocks.map((block) => (
                <div className="sjf-block" key={block.title}>
                  <span className="sjf-block-title">{block.title}</span>
                  {block.links.map((label) => (
                    <a className="sjf-item" href="#" key={label}>
                      {label}
                    </a>
                  ))}
                </div>
              ))}
              {colIndex === FOOTER_COLUMNS.length - 1 && (
                <div className="sjf-block">
                  <a className="sjf-callout" href="#">
                    サインイン
                    <span className="sjf-nbsp">
                      {"\u00A0"}
                      <SjHoverArrow />
                    </span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sjf-bottom">
          <div>
            <button
              type="button"
              className="sjf-locale"
              role="combobox"
              aria-label="日本。国を選択"
              aria-haspopup="listbox"
              aria-expanded={false}
            >
              <SjGlobeIcon />
              <span>
                <span className="sjf-region">日本</span>(
                <span className="sjf-language">日本語</span>)
              </span>
            </button>
            <p className="sjf-copyright">© 2026 Stripe, LLC.</p>
          </div>
          <div className="sjf-logo" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" fill="none">
              <path
                fill="#061B31"
                fillRule="evenodd"
                d="m0 43 43-9.119V0L0 9.226V43Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
