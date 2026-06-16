import { useState } from "react";
import {
  SjFeatureColumn,
  SjHoverArrow,
  SjSubsectionHeader,
} from "./SjUseCasesShared";

/** 5a 大企業 — 導入事例アコーディオン（Hertz / URBN / Instacart / Le Monde）+ 専任エキスパート 3 カラム */

interface CustomerStory {
  id: string;
  href: string;
  summary: string;
  image: string;
  imageAlt: string;
  stats: readonly { strong: string; rest: string; reverse?: boolean }[];
  logoBg: string;
  logoColor: string;
  logoText: string;
}

const STORIES: readonly CustomerStory[] = [
  {
    id: "Hertz",
    href: "https://stripe.com/jp/customers/hertz",
    summary: "Hertz、コマース体験の統合を実現",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/24BNV3GGtvCprFLrYovyaa/b2eac20a1d5ec75e4bff3888b998d163/enterprise-accordion-hertz.png?w=1232&fm=webp&q=90",
    imageAlt:
      "横断歩道が斜めの平行四辺形を形成する交差点の空撮写真。ストライプのロゴを模倣しています。",
    stats: [
      { strong: "160", rest: " カ国以上" },
      { strong: "1.1万", rest: " を超える世界各地の拠点" },
      {
        strong: " を導入済み",
        rest: "Payments、Terminal、Connect、Radar、Stripe Sigma",
        reverse: true,
      },
    ],
    logoBg: "#FFD100",
    logoColor: "#000",
    logoText: "H",
  },
  {
    id: "URBN",
    href: "https://stripe.com/jp/customers/urbn",
    summary: "URBN、50 億米ドルのオンライン・店舗売上を Stripe へ",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/37wKFanVluouT2iEZUbD0H/f75e77141e1330ad81ea18c6aea65f0c/enterprise-accordion-urbn.png?w=1232&fm=webp&q=90",
    imageAlt: "URBN の店舗イメージ",
    stats: [
      { strong: "5 以上の", rest: " 小売業者ポートフォリオにおける消費者向けブランド" },
      { strong: "700", rest: " を超える店舗" },
      {
        strong: " を導入済み",
        rest: "Payments、Terminal、Connect、Stripe Sigma、Radar、Link",
        reverse: true,
      },
    ],
    logoBg: "#000",
    logoColor: "#FAFBFD",
    logoText: "U",
  },
  {
    id: "Instacart",
    href: "https://stripe.com/jp/customers/instacart",
    summary: "Instacart、Stripe を活用してオンライン食料品配送サービスを運営。",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/1v5hJ2NWvKpQfVbMqOzCpE/c900b9ed4c288f7cf0a0dced5f4983f2/enterprise-accordion-instacart.png?w=1232&fm=webp&q=90",
    imageAlt: "Instacart の配送イメージ",
    stats: [
      { strong: "60万", rest: " を超える顧客" },
      { strong: "1800", rest: " 件の小売業パートナーが約 10万 店舗を展開" },
      {
        strong: " を導入済み",
        rest: "Payments、Connect、Data Pipeline、Issuing",
        reverse: true,
      },
    ],
    logoBg: "#FAF1E5",
    logoColor: "#FF7009",
    logoText: "🥕",
  },
  {
    id: "LeMonde",
    href: "https://stripe.com/jp/customers/le-monde",
    summary: "Le Monde、デジタル版と紙面版の国内外の決済を改善",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/5AQ9A87KzwpPy4CD3uPz5C/4afd1a1e9d6e1d698c4c7c74a4868822/enterprise-accordion-lemonde.png?w=1232&fm=webp&q=90",
    imageAlt: "Le Monde の紙面イメージ",
    stats: [
      { strong: "100%", rest: " Stripe 上のデジタル版と紙版の決済割合" },
      { strong: "3 カ月未満", rest: " 実装と本番環境への移行まで", reverse: true },
      {
        strong: " を導入済み",
        rest: "Payments、Stripe Sigma、Radar",
        reverse: true,
      },
    ],
    logoBg: "#FFFFFF",
    logoColor: "#1A171B",
    logoText: "M",
  },
];

/** 開閉式「事例を表示」ボタン: open=143px(テキスト) / closed=40px(+アイコン)、width + opacity 入替 */
function CustomerStoryButton({
  open,
  href,
  label,
  onExpand,
}: {
  open: boolean;
  href: string;
  label: string;
  onExpand: () => void;
}) {
  const width = open ? 143 : 40;
  return (
    <a
      className={`sj-uc-story-btn sj-uc-hoverlink${open ? " sj-uc-story-btn--open" : ""}`}
      href={href}
      style={{ width }}
      tabIndex={open ? 0 : -1}
      aria-label={label}
      onClick={(event) => {
        if (!open) {
          event.preventDefault();
          onExpand();
        }
      }}
    >
      <span className="sj-uc-story-btn__container" style={{ width }}>
        <span
          className="sj-uc-story-btn__text"
          style={{ opacity: open ? 1 : 0 }}
        >
          <span>事例を表示</span>
          <SjHoverArrow />
        </span>
        <span
          className="sj-uc-story-btn__icon"
          style={{ opacity: open ? 0 : 1 }}
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              fill="currentColor"
              d="M6.88 0.25v4.88h4.87v1.75H6.88v4.87H5.13V6.88H0.25V5.13h4.88V0.25h1.75z"
            />
          </svg>
        </span>
      </span>
    </a>
  );
}

export function SjUseCasesEnterprise() {
  const [openId, setOpenId] = useState<string>("Hertz");

  return (
    <section className="sj-uc-sub">
      <SjSubsectionHeader
        title="機動力のある金融インフラで、大企業の基盤を刷新"
        ctaLabel="大企業向けソリューション"
        ctaHref="https://stripe.com/jp/enterprise"
        description="Fortune 100 企業のうち 50% が、グローバル展開や顧客体験の再構築など、ビジネスの成長を支える基盤として Stripe を採用しています。"
      />

      <div className="sj-uc-stories">
        {STORIES.map((story) => {
          const open = story.id === openId;
          return (
            <div className="sj-uc-stories__customer" key={story.id}>
              <div
                className={`sj-uc-stories__summary${open ? " sj-uc-stories__summary--open" : ""}`}
              >
                <span
                  className="sj-uc-stories__logo"
                  style={{ background: story.logoBg, color: story.logoColor }}
                  aria-hidden="true"
                >
                  {story.logoText}
                </span>
                <button
                  type="button"
                  className="sj-uc-stories__summary-button"
                  aria-expanded={open}
                  aria-controls={`sj-uc-detail-${story.id}`}
                  onClick={() => { setOpenId(story.id); }}
                >
                  <h3 className="sj-uc-stories__summary-title">{story.summary}</h3>
                </button>
                <div className="sj-uc-stories__summary-action">
                  <CustomerStoryButton
                    open={open}
                    href={story.href}
                    label={`${story.id} の事例を読む`}
                    onExpand={() => { setOpenId(story.id); }}
                  />
                </div>
              </div>
              <div
                role="region"
                id={`sj-uc-detail-${story.id}`}
                className="sj-uc-stories__content"
                style={{ maxHeight: open ? 700 : 0 }}
                aria-hidden={!open}
              >
                <div className="sj-uc-stories__image">
                  <img
                    loading="lazy"
                    src={story.image}
                    alt={story.imageAlt}
                    width={2460}
                    height={1060}
                  />
                </div>
                <div className="sj-uc-stories__data">
                  {story.stats.map((stat) => (
                    <div className="sj-uc-stories__stat" key={stat.rest}>
                      {stat.reverse ? (
                        <>
                          {stat.rest}
                          <strong>{stat.strong}</strong>
                        </>
                      ) : (
                        <>
                          <strong>{stat.strong}</strong>
                          {stat.rest}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sj-uc-experts">
        <span className="sj-uc-experts__title">
          専任エキスパートとの協業で、価値創出をスピーディに
        </span>
        <div className="sj-uc-columns">
          <SjFeatureColumn
            icon="blocks"
            title="プロフェッショナルサービス。"
            description="導入・複雑な実装・大規模な移行まで、Stripe のエキスパートが支援します。"
            linkLabel="サービスを表示"
            linkHref="https://stripe.com/jp/professional-services"
          />
          <SjFeatureColumn
            icon="people"
            title="Stripe 認定エキスパート。"
            description="Stripe ソリューションの導入から展開までを代行する、コンサルティングパートナーを活用いただけます。"
            linkLabel="パートナーを表示"
            linkHref="https://stripe.com/jp/partners"
          />
          <SjFeatureColumn
            icon="lifebuoy"
            title="サポートプラン。"
            description="ニーズに応じた段階別プランで、技術的な質問から日々の運用まで継続的に支援します。"
            linkLabel="プランを表示"
            linkHref="https://stripe.com/jp/support-plans"
          />
        </div>
      </div>
    </section>
  );
}
