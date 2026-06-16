import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";
import {
  SjFeatureColumn,
  SjHoverArrow,
  SjSubsectionHeader,
} from "./SjUseCasesShared";

/**
 * 5c SaaS プラットフォーム
 * - Zenflow ダッシュボード mock: scroll 到達で widget が stagger 出現（storyboard-scroll-028 #14）
 * - testimonial carousel: active ロゴ下の progress 下線が linear で伸びる auto-rotate（同 #17）
 */

/* ---------- Zenflow widget build-in ---------- */

const zenContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } },
};

const zenItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

interface PaymentRow {
  amount: string;
  status: "succeeded" | "disputed" | "refunded";
  statusLabel: string;
  method: string;
  description: string;
}

const PAYMENT_ROWS: readonly PaymentRow[] = [
  { amount: "￥2,400", status: "succeeded", statusLabel: "成功", method: "Mastercard ••••1234", description: "シングルクラス" },
  { amount: "￥2,400", status: "disputed", statusLabel: "不審請求の申し立て中", method: "Visa ••••4010", description: "シングルクラス" },
  { amount: "￥150,000", status: "succeeded", statusLabel: "成功", method: "Klarna", description: "年間サブスクリプション" },
  { amount: "￥18,000", status: "succeeded", statusLabel: "成功", method: "AMEX ••••0608", description: "月次サブスクリプション" },
  { amount: "￥2,400", status: "succeeded", statusLabel: "成功", method: "Apple Pay ••••5678", description: "シングルクラス" },
  { amount: "￥2,400", status: "refunded", statusLabel: "返金済み", method: "Google Pay ••••1224", description: "シングルクラス" },
];

interface FloatingCard {
  id: string;
  title: string;
  description: string;
  snippetArg: string;
}

const FLOATING_CARDS: readonly FloatingCard[] = [
  {
    id: "notification",
    title: "通知バナー",
    description: "リスクとアカウント登録に必要なアクションをリストしたバナーを表示します。",
    snippetArg: "'notification-banner'",
  },
  {
    id: "payouts",
    title: "支払い",
    description: "残高の合計を表示し、連結アカウントによる入金の実行を可能にします。",
    snippetArg: "'payouts'",
  },
  {
    id: "payments",
    title: "Payments",
    description: "エクスポート、返金、不審請求の申し立ての機能を備えた支払いリストを表示します。",
    snippetArg: "'payments'",
  },
  {
    id: "capital",
    title: "Capital のプロモーション",
    description: "連結アカウントの資金調達のオファーを表示し、申し込みを可能にします。",
    snippetArg: "'capital-financing-promotion'",
  },
];

function ZenflowGraphic() {
  return (
    <motion.div
      className="sj-uc-zen"
      variants={zenContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div className="sj-uc-zen__browser">
        <div className="sj-uc-zen__topbar">
          <span className="sj-uc-zen__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="sj-uc-zen__url">
            <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor" aria-hidden="true">
              <path d="M4.5 0A2.75 2.75 0 0 0 1.75 2.75V4H1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-.75V2.75A2.75 2.75 0 0 0 4.5 0zm1.25 4h-2.5V2.75a1.25 1.25 0 0 1 2.5 0V4z" />
            </svg>
            dashboard.zenflow.com
          </span>
        </div>
        <div className="sj-uc-zen__body">
          <div className="sj-uc-zen__sidebar">
            <div className="sj-uc-zen__brand">
              <span className="sj-uc-zen__brand-logo" aria-hidden="true" />
              Zenflow
            </div>
            <nav className="sj-uc-zen__nav">
              <span>ホーム</span>
              <span className="sj-uc-zen__nav-item--active">Payments</span>
              <span>レポート作成</span>
              <span>設定</span>
            </nav>
          </div>
          <div className="sj-uc-zen__content">
            <div className="sj-uc-zen__greeting">こんにちは、Daybreak Yoga 様</div>
            <motion.div className="sj-uc-zen__card sj-uc-zen__card--notification" variants={zenItem}>
              <div className="sj-uc-zen__notification-text">
                <span className="sj-uc-zen__label">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor" aria-hidden="true">
                    <path d="M5.5 0a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2.5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 5.5 2.5zm0 5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                  </svg>
                  必要な対応
                </span>
                <p>Stripe での導入審査を進めるため、追加情報の提供をお願いいたします。</p>
              </div>
              <span className="sj-uc-zen__button">情報を追加</span>
            </motion.div>
            <div className="sj-uc-zen__card-row">
              <motion.div className="sj-uc-zen__card sj-uc-zen__card--payouts" variants={zenItem}>
                <span className="sj-uc-zen__label">残高合計</span>
                <div className="sj-uc-zen__balance">￥123,084</div>
                <div className="sj-uc-zen__available">
                  <span>支払い可能</span>
                  <span className="sj-uc-zen__available-amount">￥51,270</span>
                </div>
                <span className="sj-uc-zen__button">支払い</span>
              </motion.div>
              <motion.div className="sj-uc-zen__card sj-uc-zen__card--capital" variants={zenItem}>
                <span className="sj-uc-zen__label">有効期限: 01/12</span>
                <div className="sj-uc-zen__capital-title">
                  最大 ￥5,550,000 の資金調達をご利用いただけます。
                </div>
                <p className="sj-uc-zen__capital-desc">
                  承認された場合、最短 1 〜 2 営業日で資金を受け取れます。
                </p>
                <span className="sj-uc-zen__button">申し込む</span>
              </motion.div>
            </div>
            <motion.div className="sj-uc-zen__card sj-uc-zen__card--payments" variants={zenItem}>
              <div className="sj-uc-zen__payments-header">Payments</div>
              <table className="sj-uc-zen__table">
                <thead>
                  <tr>
                    <th>金額</th>
                    <th>ステータス</th>
                    <th>決済手段</th>
                    <th>説明</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYMENT_ROWS.map((row) => (
                    <tr key={`${row.amount}-${row.method}`}>
                      <td className="sj-uc-zen__amount">{row.amount}</td>
                      <td>
                        <span className={`sj-uc-zen__status sj-uc-zen__status--${row.status}`}>
                          {row.statusLabel}
                        </span>
                      </td>
                      <td>{row.method}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </div>

      {FLOATING_CARDS.map((card) => (
        <motion.div
          key={card.id}
          className={`sj-uc-zen-float sj-uc-zen-float--${card.id}`}
          variants={zenItem}
        >
          <div className="sj-uc-zen-float__title">{card.title}</div>
          <p className="sj-uc-zen-float__description">{card.description}</p>
          <code className="sj-uc-zen-float__code">
            <span className="sj-uc-zen-float__code-base">stripeConnectInstance.create(</span>
            <span className="sj-uc-zen-float__code-arg">{card.snippetArg}</span>
            <span className="sj-uc-zen-float__code-base">);</span>
          </code>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ---------- testimonial carousel ---------- */

interface Testimonial {
  id: string;
  logoText: string;
  logoClass: string;
  accent: string;
  quote: string;
  author: string;
  role: string;
  href: string;
}

const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "mindbody",
    logoText: "mindbody",
    logoClass: "sj-uc-tst-logo--mindbody",
    accent: "#8a7340",
    quote:
      "Stripe というグローバルなテクノロジーパートナーとともに、カナダのヨガスタジオからイギリスのボクシング教室まで、ウェルネス分野の事業者の成長と進化を支援しています。",
    author: "カーティス・モイヤー 氏",
    role: "Mindbody 決済部門リードプロダクトマネージャー",
    href: "https://stripe.com/jp/customers/mindbody",
  },
  {
    id: "jobber",
    logoText: "JOBBER",
    logoClass: "sj-uc-tst-logo--jobber",
    accent: "#012939",
    quote:
      "Stripe を利用しなければ、このようなリソースを顧客に提供するのに相当な時間とエンジニアリング作業が必要だったでしょう。Stripe の金融インフラストラクチャは Jobber にとって非常に有益なものであり、今後の展開にも期待しています。",
    author: "ローラ・コリンズン 氏",
    role: "Jobber フィンテック担当ディレクター",
    href: "https://stripe.com/jp/customers/jobber",
  },
  {
    id: "substack",
    logoText: "substack",
    logoClass: "sj-uc-tst-logo--substack",
    accent: "#ff671a",
    quote:
      "Stripe の導入により、サブスクリプションや決済のプロセスが関係者全員にとって極めて容易になります。これにより、ライターやクリエイターは Substack で本来の創作活動に専念し、その対価を円滑に受け取ることが可能になります。",
    author: "セス・マクミラン 氏",
    role: "Substack エンジニアリングマネージャー",
    href: "https://stripe.com/jp/customers/substack",
  },
  {
    id: "adastria",
    logoText: "ADASTRIA",
    logoClass: "sj-uc-tst-logo--adastria",
    accent: "#0a2540",
    quote:
      "導入から運用までのサポートが手厚く、安心して開発、運用できています。新しいサービスに挑戦するときは、またサポートをお願いできればと思います。",
    author: "天野 悠史 氏",
    role: "株式会社アダストリア ソリューション開発部アシスタントマネージャー",
    href: "https://stripe.com/jp/customers/adastria",
  },
];

/** auto-rotate 周期（storyboard では「数秒」のみ確定 → 暫定 6s、要実測 P11） */
const ROTATE_MS = 6000;

function testimonialAt(index: number): Testimonial {
  const testimonial = TESTIMONIALS[index % TESTIMONIALS.length];
  if (!testimonial) {
    throw new Error("SjUseCases: testimonial index out of range");
  }
  return testimonial;
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = testimonialAt(active);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActive((index) => (index + 1) % TESTIMONIALS.length);
    }, ROTATE_MS);
    return () => { window.clearTimeout(timer); };
  }, [active, paused]);

  return (
    <div
      className="sj-uc-tst"
      onMouseEnter={() => { setPaused(true); }}
      onMouseLeave={() => { setPaused(false); }}
    >
      <div className="sj-uc-tst__card-area" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.figure
            key={current.id}
            className="sj-uc-tst__card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <span className={`sj-uc-tst-logo ${current.logoClass}`}>
              {current.logoText}
            </span>
            <blockquote className="sj-uc-tst__quote">
              「{current.quote}」
            </blockquote>
            <figcaption className="sj-uc-tst__author">
              {current.author}、
              <span className="sj-uc-tst__role">{current.role}</span>
            </figcaption>
            <a className="sj-uc-link sj-uc-hoverlink" href={current.href}>
              事例を表示
              <span>&nbsp;</span>
              <SjHoverArrow />
            </a>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="sj-uc-tst__navigation">
        <div className="sj-uc-tst__divider" aria-hidden="true" />
        <div
          className="sj-uc-tst__selection"
          style={{
            transform: `translateX(${String(active * 100)}%)`,
            width: `${String(100 / TESTIMONIALS.length)}%`,
          }}
          aria-hidden="true"
        >
          <span
            key={`${current.id}-${paused ? "paused" : "running"}`}
            className="sj-uc-tst__selection-fill"
            style={{
              background: current.accent,
              animationDuration: `${String(ROTATE_MS)}ms`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </div>
        <div className="sj-uc-tst__customers">
          {TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              className={`sj-uc-tst__customer-btn${
                index === active ? " sj-uc-tst__customer-btn--active" : ""
              }`}
              aria-label={`${testimonial.id} の事例を表示`}
              onClick={() => { setActive(index); }}
            >
              <span className={`sj-uc-tst-logo ${testimonial.logoClass}`}>
                {testimonial.logoText}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 5c 全体 ---------- */

export function SjUseCasesPlatform() {
  return (
    <section className="sj-uc-sub">
      <SjSubsectionHeader
        title="SaaS プラットフォームを「金融オペレーティングシステム」へ"
        ctaLabel="プラットフォーム向けソリューション"
        ctaHref="https://stripe.com/jp/use-cases/platforms"
        description="Fortune 100 から Forbes Cloud 100 まで、多くの垂直型 SaaS が Stripe を活用し、組込み型決済・金融サービスを備えたプロダクトを展開しています。"
      />

      <ZenflowGraphic />

      <div className="sj-uc-columns">
        <SjFeatureColumn
          icon="rocket"
          title="市場投入を加速。"
          description="埋め込みコンポーネントやノーコードツールを活用し、運用負荷を抑えながら、決済プロダクトの市場投入と拡大を加速します。"
          linkLabel="ガイドを読む"
          linkHref="https://stripe.com/jp/guides/embedded-finance"
        />
        <SjFeatureColumn
          icon="trend"
          title="金融を起点に、新たな収益源を拡大："
          description="決済、カードインターチェンジ、融資手数料などを通じて、プラットフォーム上の取引を収益化します。"
          linkLabel="ガイドを読む"
          linkHref="https://stripe.com/jp/guides/introduction-to-monetizing-payments"
        />
        <SjFeatureColumn
          icon="shield"
          title="プラットフォームのリスクを管理。"
          description="コンプライアンスから不正利用防止、アカウントのセキュリティまで、グローバルな規制に対応します。"
          linkLabel="ガイドを読む"
          linkHref="https://stripe.com/jp/guides/introduction-to-risk-management"
        />
      </div>

      <TestimonialCarousel />
    </section>
  );
}
