import { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Camera,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ViewHeader, type ViewDispatchProps } from "@/sazo-commerce/DirectoryViews";
import { serviceSteps } from "@/sazo-commerce/fixtures";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import { MobileAgentComposer } from "@/sazo-commerce/MobileAgentComposer";

const problemItems = [
  {
    body: "日本の通販サイトで会員登録や購入手続きが難しい。",
    image: "/sazo-commerce/service-lp/problem-1.svg",
    title: "日本のショップで購入できない",
  },
  {
    body: "日本国内向けの決済方法にしか対応していない。",
    image: "/sazo-commerce/service-lp/problem-2.svg",
    title: "ブラジルから決済できない",
  },
  {
    body: "海外配送に未対応の場合が多く、ブラジルで受け取れない。",
    image: "/sazo-commerce/service-lp/problem-3.svg",
    title: "ブラジルまで発送できない",
  },
] as const;

const heroReviews = [
  {
    author: "チャンユカ",
    body: "日本の新作を早く欲しくてJ-Planetで購入しました！",
    image: "/sazo-commerce/service-lp/review-00.jpg",
  },
  {
    author: "Yu",
    body: "日本の商品をブラジルから安心して購入できました。",
    image: "/sazo-commerce/service-lp/review-01.jpg",
  },
  {
    author: "りの",
    body: "日本での購入からブラジルに届くまで安心できました。",
    image: "/sazo-commerce/service-lp/review-02.jpg",
  },
  {
    author: "Allen Ng",
    body: "日本のショップでも不安なく購入できました！",
    image: "/sazo-commerce/service-lp/review-03.jpg",
  },
  {
    author: "Yu",
    body: "日本限定の商品を購入できて大満足です。",
    image: "/sazo-commerce/service-lp/review-04.jpg",
  },
  {
    author: "ノンダム",
    body: "欲しかった日本の商品を購入できました！",
    image: "/sazo-commerce/service-lp/review-05.jpg",
  },
  {
    author: "Rinka",
    body: "日本の商品を買ってみたら大正解でした！",
    image: "/sazo-commerce/service-lp/review-06.jpg",
  },
  {
    author: "Nn",
    body: "検品後の状態も良くてすごくいい買い物でした!!",
    image: "/sazo-commerce/service-lp/review-07.jpg",
  },
  {
    author: "ゆのん",
    body: "日本の通販商品も簡単に買えて良かったです！",
    image: "/sazo-commerce/service-lp/review-08.jpg",
  },
  {
    author: "dx ux",
    body: "日本からブラジルまで無事に届きました。",
    image: "/sazo-commerce/service-lp/review-09.jpg",
  },
] as const;

const shippingSteps = [
  "受付",
  "日本国内購入",
  "日本倉庫で検品",
  "国際配送・通関",
  "ブラジルへお届け",
] as const;

const partnerCategories = [
  "公式通販",
  "百貨店",
  "フリマ",
  "家電",
  "ホビー",
  "コスメ",
  "書籍",
  "クラファン",
] as const;

const partnerLogoPaths = [
  "/sazo-commerce/service-lp/logo-gmarket.png",
  "/sazo-commerce/service-lp/logo-coupang.png",
  "/sazo-commerce/service-lp/logo-bungae.png",
  "/sazo-commerce/service-lp/logo-aliexpress.png",
  "/sazo-commerce/service-lp/logo-smile24.png",
  "/sazo-commerce/service-lp/logo-webtoonfriends.png",
  "/sazo-commerce/service-lp/logo-toyland.png",
  "/sazo-commerce/service-lp/logo-tumblbug.png",
] as const;

const trustItems = [
  {
    body: "日本での購入内容を確認後、費用をわかりやすくご案内します。",
    finePrint:
      "※商品価格、重量やサイズ、通関に必要な費用により金額が変動する場合がございます。",
    image: "/sazo-commerce/service-lp/trust-1.png",
    title: "確定後の追加請求なし",
  },
  {
    body: "日本での購入から国際配送、ブラジルでのお届けまで状況を追跡できます。",
    image: "/sazo-commerce/service-lp/trust-2.png",
    title: "細かく追跡可能",
  },
  {
    body: "日本で購入・検品した商品を、ブラジルまで国際配送します。",
    image: "/sazo-commerce/service-lp/trust-3.png",
    title: "日本からブラジルへ配送",
  },
  {
    body: "輸出に適した安全な梱包で、国際配送に備えます。",
    image: "/sazo-commerce/service-lp/trust-4.png",
    title: "しっかり梱包",
  },
  {
    body: "J-Planetが日本で購入するため、日本のECサイトにお客様情報を登録する必要がありません。",
    image: "/sazo-commerce/service-lp/trust-5.png",
    title: "海外への情報流出なし",
  },
] as const;

const faqItems = [
  {
    answer:
      "日本の商品について確認したい場合は、カスタマーサポートへご相談ください。J-Planetが販売者への確認を代行します。",
    id: "01",
    question: "日本の販売者に問い合わせることはできますか？",
  },
  {
    answer:
      "日本からブラジルへの送料は、商品の重量とサイズに応じて計算されます。カートと決済画面でご確認いただけます。",
    id: "02",
    question: "送料はいくらですか？",
  },
  {
    answer:
      "ブラジルでの配送日の指定は承っておりません。発送後は追跡情報から配送状況をご確認いただけます。",
    id: "03",
    question: "配送日の指定は可能ですか",
  },
  {
    answer:
      "商品や申告額によりブラジルで関税が発生する場合があります。必要な費用は注文時の合計金額でご確認いただけます。",
    id: "04",
    question: "関税は発生しますか？",
  },
] as const;

const footerLinks = [
  "company",
  "careers",
  "press",
  "terms",
  "privacy",
  "commerce",
] as const;
const serviceStepTones = ["yellow", "green", "blue"] as const;

const serviceVideoTopThumbnails = [
  "/sazo-commerce/campaign/thumb-01.png",
  "/sazo-commerce/campaign/thumb-02.png",
  "/sazo-commerce/campaign/thumb-03.png",
  "/sazo-commerce/campaign/thumb-04.png",
  "/sazo-commerce/campaign/thumb-05-top-partial.png",
] as const;

const serviceVideoBottomThumbnails = [
  "/sazo-commerce/campaign/thumb-05-partial.png",
  "/sazo-commerce/campaign/thumb-04.png",
  "/sazo-commerce/campaign/thumb-03.png",
  "/sazo-commerce/campaign/thumb-02.png",
  "/sazo-commerce/campaign/thumb-01.png",
] as const;

function ServiceUrlSearch({ id }: { id: string }) {
  return (
    <div className="sazo-service-url-search" data-url-demo="typing">
      <p>ここに欲しい商品のURLを入力してショッピングをしましょう！</p>
      <div className="sazo-service-url-entry" data-demo-input role="search">
        <label className="sazo-visually-hidden" htmlFor={id}>
          日本のショップURL
        </label>
        <input id={id} placeholder="日本のショップURL" type="url" />
        <button type="button">
          <Search aria-hidden size={30} strokeWidth={2.1} />
          <span>検索</span>
        </button>
      </div>
    </div>
  );
}

function ServiceVideoRail({
  images,
  reverse = false,
}: {
  images: readonly string[];
  reverse?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="sazo-service-video-rail"
      data-direction={reverse ? "reverse" : "forward"}
      data-service-video-rail
    >
      {[...images, ...images].map((image, index) => (
        <span className="sazo-service-video-thumb" key={`${image}-${String(index)}`}>
          <img alt="" src={image} />
        </span>
      ))}
    </div>
  );
}

function ServiceAgentEntry({ dispatch }: ViewDispatchProps) {
  return (
    <div className="sazo-service-video-agent-entry" data-service-agent-entry>
      <MobileAgentComposer
        entryIntent={null}
        onEntryIntentConsumed={() => undefined}
        onSubmitted={(request) => {
          dispatch({ type: "start-agent-search", request });
        }}
        seedRequest={null}
      />
    </div>
  );
}

function ServiceVideoIntro({ dispatch }: ViewDispatchProps) {
  return (
    <section className="sazo-service-video-intro" data-service-video-intro>
      <header className="sazo-service-video-header">
        <button
          aria-label="J-Planetホーム"
          className="sazo-service-video-wordmark"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <JplanetLogo />
        </button>
        <div aria-label="サービスメニュー" className="sazo-service-video-actions" role="group">
          <button aria-label="言語設定" type="button">
            🇯🇵
          </button>
          <button aria-label="検索" type="button">
            <Search aria-hidden size={21} />
          </button>
          <button aria-label="カート" type="button">
            <ShoppingCart aria-hidden size={23} />
          </button>
        </div>
      </header>

      <div className="sazo-service-video-banner">
        <img
          alt="日本の商品をブラジルへ届ける初回限定クーポン"
          src="/sazo-commerce/campaign/coupon-banner.png"
        />
      </div>

      <ServiceVideoRail images={serviceVideoTopThumbnails} />

      <section className="sazo-service-video-message">
        <span>購入代行の面倒さゼロ！</span>
        <h1>
          <strong>超お得な</strong>
          <br />
          <small>日本の商品がたくさん！</small>
        </h1>
      </section>

      <ServiceVideoRail images={serviceVideoBottomThumbnails} reverse />

      <ServiceAgentEntry dispatch={dispatch} />
    </section>
  );
}

function ServiceVideoHowToUse() {
  const howToImages = [
    "/sazo-commerce/service-lp/jplanet-how-to-use-1.svg",
    "/sazo-commerce/service-lp/jplanet-how-to-use-2.svg",
    "/sazo-commerce/service-lp/jplanet-how-to-use-3.svg",
  ] as const;

  return (
    <section className="sazo-service-video-howto" data-service-video-howto>
      <span>HOW TO USE</span>
      <h2>URL入力のやり方</h2>
      <div className="sazo-service-video-howto-card">
        {howToImages.map((image, index) => (
          <img
            alt="日本の商品URLを入力する手順"
            data-frame={String(index + 1)}
            key={image}
            src={image}
          />
        ))}
      </div>
      <p>
        日本の商品URLを貼るだけで、商品情報を読み取り、J-Planetで購入できます。
      </p>
    </section>
  );
}

export function ServiceView({ dispatch }: ViewDispatchProps) {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="sazo-service-view" data-view-content="service">
      <ViewHeader dispatch={dispatch} title={t("sazo.views.service.title")} />
      <ServiceVideoIntro dispatch={dispatch} />
      <ServiceVideoHowToUse />

      <section className="sazo-service-hero sazo-service-legacy-hero">
        <div className="sazo-service-hero-grid">
          <img
            alt="プレゼントを持つ女性"
            className="sazo-service-hero-image"
            height={621}
            src="/sazo-commerce/service-lp/main-image.png"
            width={720}
          />
          <div className="sazo-service-hero-copy">
            <span aria-hidden className="sazo-service-hero-outline">
              FROM
              <br />
              JAPAN
              <br />
              TO BRAZIL
            </span>
            <h1>日本代行</h1>
            <div className="sazo-service-zero">
              <span>手数料</span>
              <strong>0</strong>
              <b>
                円<sup>*</sup>
              </b>
            </div>
            <h2>日本の商品をブラジルへ直送</h2>
            <small>*代行手数料に限って0円</small>
          </div>
          <ServiceUrlSearch id="sazo-service-hero-url" />
        </div>
      </section>

      <section aria-label="利用レビュー" className="sazo-service-review-rail">
        <div className="sazo-service-review-track">
          <div className="sazo-service-review-set" data-service-review-set>
            {heroReviews.map((review, index) => (
              <article
                className="sazo-service-review-card"
                key={`${review.author}-${String(index)}`}
              >
                <img alt="" aria-hidden height={340} src={review.image} width={320} />
                <strong>● {review.author}</strong>
                <p>{review.body}</p>
              </article>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="sazo-service-review-set"
            data-service-review-set
          >
            {heroReviews.map((review, index) => (
              <article
                className="sazo-service-review-card"
                key={`${review.author}-${String(index)}`}
              >
                <img alt="" aria-hidden height={340} src={review.image} width={320} />
                <strong>● {review.author}</strong>
                <p>{review.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sazo-service-problem">
        <div className="sazo-service-problem-inner">
          <header>
            <img
              alt=""
              aria-hidden
              height={250}
              src="/sazo-commerce/service-lp/struggling.png"
              width={240}
            />
            <div>
              <span>PROBLEM</span>
              <p>🇯🇵 日本の通販で</p>
              <h2>欲しいものがあっても…</h2>
            </div>
          </header>
          <div className="sazo-service-problem-grid">
            {problemItems.map((item) => (
              <article className="sazo-service-problem-card" key={item.title}>
                <img alt="" aria-hidden height={160} src={item.image} width={160} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <img
            alt=""
            aria-hidden
            className="sazo-service-red-polygon"
            height={96}
            src="/sazo-commerce/service-lp/red-polygon.svg"
            width={164}
          />
          <div className="sazo-service-solution-copy">
            <p>
              URL入力だけで <strong>J-Planet</strong> が
            </p>
            <h2>
              <em>J-Planetが日本で購入、ブラジルまで発送</em>
            </h2>
          </div>
          <div className="sazo-service-benefits">
            <span>さらに!</span>
            <article>
              <h3>代行手数料</h3>
              <p>
                <strong>0</strong>円
              </p>
            </article>
            <article>
              <h3>会員登録で</h3>
              <p>
                <strong>送料無料</strong>
                <br />
                クーポンGET
              </p>
              <small>*2000円まで</small>
            </article>
            <img
              alt=""
              aria-hidden
              height={280}
              src="/sazo-commerce/service-lp/car.png"
              width={270}
            />
          </div>
        </div>
      </section>

      <section className="sazo-service-steps">
        <div className="sazo-service-title" data-paste-outline="true">
          <span>HOW TO USE</span>
          <p>{t("sazo.views.service.eyebrow")}</p>
          <h2>{t("sazo.views.service.title")}</h2>
        </div>
        <div className="sazo-service-step-list">
          {serviceSteps.map((step, index) => (
            <article
              className="sazo-service-step"
              data-panel-tone={serviceStepTones[index]}
              data-step={step.id}
              key={step.id}
            >
              <div className="sazo-service-step-image">
                <img alt="" aria-hidden height={1000} src={step.image} width={1100} />
              </div>
              <div className="sazo-service-step-copy">
                <span aria-label={t("sazo.views.service.stepLabel", { step: step.id })}>
                  <small>STEP</small>
                  <strong>{step.id}</strong>
                </span>
                <h3>{t(`sazo.views.service.step${step.id}Title`)}</h3>
                <strong>{t(`sazo.views.service.step${step.id}Summary`)}</strong>
                <p>{t(`sazo.views.service.step${step.id}Body`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sazo-service-shipping">
        <div className="sazo-service-section-title">
          <span>SHIPPING</span>
          <p>迅速な対応で安心できる！</p>
          <h2>購入後の流れ</h2>
        </div>
        <div className="sazo-service-shipping-panel">
          <img
            alt="日本からブラジルへ商品を直送"
            className="sazo-service-shipping-map"
            src="/sazo-commerce/service-lp/shipping-japan-brazil.svg"
          />
          <div className="sazo-service-shipping-steps">
            {shippingSteps.map((label, index) => (
              <article className="sazo-service-shipping-step" key={label}>
                <img
                  alt=""
                  aria-hidden
                  height={112}
                  src={`/sazo-commerce/service-lp/shipping-step-${String(index + 1)}.svg`}
                  width={112}
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sazo-service-try">
        <div className="sazo-service-try-inner">
          <h2>まずはコピペしてみよう！</h2>
          <ServiceUrlSearch id="sazo-service-try-url" />
        </div>
      </section>

      <section className="sazo-service-partners">
        <h2>
          <small>フリマ・クラファンなど</small>日本の<span>どの通販</span>でも！
        </h2>
        <div
          aria-label="日本の通販サイトのロゴ"
          className="sazo-service-partner-grid"
          role="region"
        >
          <div
            className="sazo-service-partner-marquee-track"
            data-direction="forward"
          >
            {[...partnerCategories, ...partnerCategories].map((category, index) => {
              const logoPath = partnerLogoPaths[index % partnerCategories.length];
              return (
                <article
                  aria-hidden={index >= partnerCategories.length}
                  className="sazo-service-partner-card"
                  key={`${category}-${String(index)}`}
                >
                  <img alt="" aria-hidden height={115} src={logoPath} width={260} />
                  <span>{category}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sazo-service-trust">
        <div className="sazo-service-trust-heading">
          <span>TRUST POINT</span>
          <h2>J-Planetの安心ポイント</h2>
        </div>
        <div className="sazo-service-trust-grid">
          {trustItems.map((item) => (
            <article className="sazo-service-trust-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {"finePrint" in item ? <small>{item.finePrint}</small> : null}
              <img alt="" aria-hidden height={190} src={item.image} width={190} />
            </article>
          ))}
        </div>
        <div className="sazo-service-coupon">
          <h2>
            今登録すると<span>送料無料クーポン</span>GET!
          </h2>
          <button type="button">
            今すぐアプリをダウンロード <ArrowRight aria-hidden size={20} />
          </button>
        </div>
      </section>

      <section className="sazo-service-faq">
        <header>
          <span>FAQ</span>
          <h2>よくある質問</h2>
        </header>
        <div className="sazo-faq-list">
          {faqItems.map((item) => {
            const expanded = item.id === openFaq;
            const answerId = `sazo-service-faq-${item.id}`;
            return (
              <article className="sazo-faq-item" key={item.id}>
                <h3>
                  <button
                    aria-controls={answerId}
                    aria-expanded={expanded}
                    onClick={() => {
                      setOpenFaq(expanded ? null : item.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && expanded) {
                        setOpenFaq(null);
                        event.currentTarget.focus();
                      }
                    }}
                    type="button"
                  >
                    <b>Q</b>
                    <span>{item.question}</span>
                    {expanded ? (
                      <Minus aria-hidden size={22} />
                    ) : (
                      <Plus aria-hidden size={22} />
                    )}
                  </button>
                </h3>
                <div
                  aria-hidden={!expanded}
                  className="sazo-faq-answer"
                  data-expanded={expanded}
                  id={answerId}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <button
        aria-label="ページ上部へ戻る"
        className="sazo-service-scroll-top"
        onClick={() => {
          window.scrollTo({ behavior: "smooth", top: 0 });
        }}
        type="button"
      >
        <ArrowUp aria-hidden size={32} />
      </button>

      <section className="sazo-service-support">
        <div className="sazo-service-support-brand">
          <div className="sazo-service-footer-logo">
            <JplanetLogo />
          </div>
          <div className="sazo-support-socials">
            <button aria-label="X" type="button">
              X
            </button>
            <button aria-label="Instagram" type="button">
              <Camera aria-hidden size={21} />
            </button>
            <button aria-label="LINE" type="button">
              <MessageCircle aria-hidden size={21} />
            </button>
          </div>
        </div>
        <div className="sazo-service-support-copy">
          <h2>カスタマーサポート</h2>
          <strong>
            平日：10:00〜18:00
            <br />
            土日祝：15:00〜18:00
          </strong>
          <p>
            チャットよりお問い合わせください
            <br />
            24時間以内に担当者が回答いたします
          </p>
        </div>
        <nav className="sazo-service-footer-links">
          {footerLinks.map((link) => (
            <button key={link} type="button">
              {t(`sazo.views.service.${link}`)}
            </button>
          ))}
        </nav>
        <small>
          © 2024-2026 J-Planet 1-2-32 Tsurumai, Showa-ku, Nagoya-shi, Aichi, Japan
        </small>
      </section>
    </div>
  );
}
