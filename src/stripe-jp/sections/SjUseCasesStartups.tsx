import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { SjHoverArrow, SjSubsectionHeader } from "./SjUseCasesShared";

/** 5b スタートアップ — drag carousel（hover scale 1.036 実測値）+ Startups / Atlas プロモカード */

interface CaseStudy {
  id: string;
  href: string;
  image: string;
  logoText: string;
  title: string;
  linkLabel: string;
}

const CASE_STUDIES: readonly CaseStudy[] = [
  {
    id: "minnano-market",
    href: "https://stripe.com/jp/customers/kurashino-market",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/1p78AOKe3NSBYbf7ZhqiM2/dcac30fe8a383dbb574d643dd5b825d4/Minna_No_Market.png?w=432&fm=webp&q=90",
    logoText: "くらしのマーケット",
    title:
      "みんなのマーケット、Stripe と提携してオンラインマーケットプレイスでカード決済を導入。",
    linkLabel: "みんなのマーケットの事例を表示",
  },
  {
    id: "runway",
    href: "https://stripe.com/jp/customers/runway",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/6fpvaTP1TZWXKWVMewABjV/4412b9ca2940d89d3834ac65c1fc329d/Runway.png?w=432&fm=webp&q=90",
    logoText: "runway",
    title: "Runway、Stripe のノーコードソリューションの活用により開発者の時間を節約。",
    linkLabel: "Runwayの事例を表示",
  },
  {
    id: "lovable",
    href: "https://stripe.com/jp/customers/lovable",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/1CBkJePR5Cwf2QNIVCia1I/c0a702cec7a3814c69f21f86b89ed718/lovable.png?w=432&fm=webp&q=90",
    logoText: "Lovable",
    title: "Lovable、Stripe を活用しバイブコーディングの分野で圧倒的な存在へと成長。",
    linkLabel: "Lovableの事例を表示",
  },
  {
    id: "supabase",
    href: "https://stripe.com/jp/customers/supabase",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/7fM8bvEbivprOMM1zyow9N/3cad3cc826f96e4038b4ea88d81ebe3b/Supabase.png?w=432&fm=webp&q=90",
    logoText: "supabase",
    title: "Supabase、Stripe 活用により 150 カ国でバックエンドサービスを提供。",
    linkLabel: "Supabaseの事例を表示",
  },
  {
    id: "linear",
    href: "https://stripe.com/jp/customers/linear",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/4b8Ubw7N2kYwb7QZl3Ogri/422cc19f725aa68e647d90ce2833c8d0/linear.png?w=432&fm=webp&q=90",
    logoText: "Linear",
    title: "Linear、請求と決済業務の管理において Stripe と提携。",
    linkLabel: "Linearの事例を表示",
  },
  {
    id: "elevenlabs",
    href: "https://stripe.com/jp/customers/elevenlabs",
    image:
      "https://images.stripeassets.com/fzn2n1nzq965/JK7aZoMzWA3uUbLb35kxx/dea1444a0aee29751c0c7098ffb33534/Eleven_Labs.png?w=432&fm=webp&q=90",
    logoText: "ElevenLabs",
    title: "ElevenLabs、Stripe と共に $30億 規模の AI オーディオ分野のリーダーへと成長。",
    linkLabel: "動画を見る",
  },
];

/** カード幅 332px + gap 16px（DOM 実測 --case-study-carousel-card-max-width:332px / fullpage 実測 gap 16px） */
const CARD_STEP = 348;

export function SjUseCasesStartups() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [offset, setOffset] = useState(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const trackWidth = CASE_STUDIES.length * CARD_STEP - 16;
    setMaxDrag(Math.max(0, trackWidth - viewport.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); };
  }, [measure]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), maxDrag);
      setOffset(clamped);
      animate(x, -clamped, { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] });
    },
    [maxDrag, x],
  );

  const atStart = offset <= 1;
  const atEnd = offset >= maxDrag - 1;

  return (
    <section className="sj-uc-sub">
      <SjSubsectionHeader
        title="強固なビジネス基盤で、スタートアップの成長を加速"
        ctaLabel="スタートアップ向けソリューション"
        ctaHref="https://stripe.com/jp/startups"
        description="ステーブルコインの先駆的企業から Forbes AI 50 選出企業の 78% まで、Stripe は導入しやすい金融基盤で、スタートアップの次世代の価値創出を支えています。"
      />

      <div className="sj-uc-carousel" aria-label="導入事例">
        <div className="sj-uc-carousel__nav" role="group">
          <button
            type="button"
            className="sj-uc-carousel__nav-btn"
            aria-label="前の顧客事例"
            disabled={atStart}
            onClick={() => { goTo(offset - CARD_STEP * 2); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M10.53 3.47a.75.75 0 0 1 0 1.06L7.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 0 1 1.06 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="sj-uc-carousel__nav-btn"
            aria-label="次の顧客事例"
            disabled={atEnd}
            onClick={() => { goTo(offset + CARD_STEP * 2); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M5.47 3.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06L8.94 8 5.47 4.53a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>

        <div className="sj-uc-carousel__viewport" ref={viewportRef}>
          <motion.ul
            role="list"
            className="sj-uc-carousel__scroller"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -maxDrag, right: 0 }}
            dragElastic={0.08}
            onDragEnd={() => {
              setOffset(Math.min(Math.max(-x.get(), 0), maxDrag));
            }}
          >
            {CASE_STUDIES.map((study) => (
              <li className="sj-uc-carousel__item" key={study.id}>
                <motion.div
                  className="sj-uc-carousel__inner"
                  whileHover={{ scale: 1.036 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <a
                    className="sj-uc-case-card sj-uc-hoverlink"
                    href={study.href}
                    draggable={false}
                  >
                    <div className="sj-uc-case-card__media">
                      <img
                        loading="lazy"
                        src={study.image}
                        alt=""
                        width={864}
                        height={960}
                        draggable={false}
                      />
                      <span className="sj-uc-case-card__logo">{study.logoText}</span>
                    </div>
                    <h4 className="sj-uc-case-card__title">{study.title}</h4>
                    <div className="sj-uc-case-card__link">
                      {study.linkLabel}
                      <span>&nbsp;</span>
                      <SjHoverArrow />
                    </div>
                  </a>
                </motion.div>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      <div className="sj-uc-promos">
        <a
          className="sj-uc-promo sj-uc-hoverlink"
          href="https://stripe.com/jp/startups/program"
        >
          <div className="sj-uc-promo__content">
            <div className="sj-uc-promo__text">
              <h4>Stripe Startups プログラム。</h4>
              <p>各種特典、専用コミュニティ、エキスパートによるリソースをご活用ください。</p>
            </div>
            <div className="sj-uc-link">
              詳細を表示
              <span>&nbsp;</span>
              <SjHoverArrow />
            </div>
          </div>
          <div className="sj-uc-promo__graphic">
            <img
              loading="lazy"
              src="https://images.stripeassets.com/fzn2n1nzq965/1DZkp4Ce0kiwj2F2Z0kJ16/fcb4904fd728f49521385059618245b9/card_startups.png?w=585&fm=webp&q=90"
              alt=""
              width={1169}
              height={472}
            />
          </div>
        </a>
        <a className="sj-uc-promo sj-uc-hoverlink" href="https://stripe.com/jp/atlas">
          <div className="sj-uc-promo__content">
            <div className="sj-uc-promo__text">
              <h4>Stripe Atlas。</h4>
              <p>
                2 営業日以内に、資金調達、銀行口座の開設、決済の受け付けに必要なすべての環境が整います。
              </p>
            </div>
            <div className="sj-uc-link">
              詳細を表示
              <span>&nbsp;</span>
              <SjHoverArrow />
            </div>
          </div>
          <div
            className="sj-uc-promo__graphic sj-uc-promo__graphic--atlas"
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  );
}
