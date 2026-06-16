import { useState } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { BentoCard } from "./SjPlatformBento";
import { useCycle, usePrefersReducedMotion } from "./SjPlatformHooks";

const CDN = "https://images.stripeassets.com/fzn2n1nzq965";
const PARTICLES_IMG = `${CDN}/78eaknFXeySTtfpQUh4lD2/e2a97240d78e6e239bcfe045d5b21239/particles.png?w=1028&fm=webp&q=90`;
const SHIRT_IMG = `${CDN}/2rL4pJabxq9Yo0haXwK2HO/83c05122b463c882c8c89111154d77ec/shirt-blue.png?w=320&fm=webp&q=90`;
const HOODIE_IMG = `${CDN}/6KmB7XGsUbTefNew25WF4T/6a949fbf5567dcd145339f5fcf207fae/hoodie-navy.png?w=320&fm=webp&q=90`;
const GLOBE_IMG = `${CDN}/7dwxc06fkzWOmlwBs9GezW/667c1af2d03a023fc61ea4cec995204d/money-movement-fallback_2x.png?w=894&fm=webp&q=90`;

/* ============ agentic commerce: chat 吹き出し fade-in（scroll-into-view, stagger） ============ */

const chatContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.28, delayChildren: 0.1 } },
};

const chatItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function SjPlatformAgentic() {
  return (
    <BentoCard
      id="agentic-commerce"
      title="エージェンティックコマースを導入"
      className="sj-bento--agentic"
      shift={{ x: -3.55, y: -6 }}
    >
      <div className="sj-agentic__bg" aria-hidden="true">
        <img src={PARTICLES_IMG} alt="" loading="lazy" />
      </div>
      <motion.div
        className="sj-agentic__chat"
        role="img"
        aria-label="特定のアイテムの購入リクエストを示す AI チャットボットインターフェイス。選択したアイテムを「今すぐ購入」できるオプションがあります。"
        variants={chatContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <motion.div
          className="sj-agentic__bubble sj-agentic__bubble--user"
          variants={chatItem}
          aria-hidden="true"
        >
          ワードローブを一新しようと思っています。サイズ M
          で、着心地がよくてリラックスできるベーシックアイテムをおすすめしてもらえますか？
        </motion.div>
        <motion.div
          className="sj-agentic__bubble sj-agentic__bubble--agent"
          variants={chatItem}
          aria-hidden="true"
        >
          承知いたしました。組み合わせやすく、揃えておきたい快適な定番アイテムをご紹介します。
        </motion.div>
        <motion.div className="sj-agentic__products" variants={chatItem} aria-hidden="true">
          <div className="sj-agentic__products-grid">
            <div>
              <div className="sj-agentic__product-image">
                <img src={SHIRT_IMG} width={160} height={114} alt="" loading="lazy" />
              </div>
              <div className="sj-agentic__product-name">デラックスシャツ</div>
              <div className="sj-agentic__product-variant">ブルー M サイズ</div>
              <div className="sj-agentic__product-price sj-tnum">￥3,900</div>
              <div className="sj-agentic__product-brand">Cartsy</div>
            </div>
            <div>
              <div className="sj-agentic__product-image">
                <img src={HOODIE_IMG} width={160} height={114} alt="" loading="lazy" />
              </div>
              <div className="sj-agentic__product-name">エッセンシャルフーディ</div>
              <div className="sj-agentic__product-variant">ネイビー M サイズ</div>
              <div className="sj-agentic__product-price sj-tnum">￥7,200</div>
              <div className="sj-agentic__product-brand">Cartsy</div>
            </div>
          </div>
          <div className="sj-agentic__cta">今すぐ購入</div>
        </motion.div>
      </motion.div>
    </BentoCard>
  );
}

/* ============ issuing: カード柄 crossfade サイクル（紫 VISA ⇄ 白、周期 ~3s） ============ */

function CardChip() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" aria-hidden="true">
      <rect x="1" y="1" width="28" height="22" rx="4" fill="#e9edf1" stroke="#cfd7df" />
      <path d="M1 9h10M1 15h10M19 9h10M19 15h10M11 1v22M19 1v22" stroke="#cfd7df" strokeWidth="1" />
    </svg>
  );
}

function Contactless({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 6a7 7 0 0 1 0 6M7.5 4.5a10 10 0 0 1 0 9M11 3a13 13 0 0 1 0 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SjPlatformIssuing() {
  const reduced = usePrefersReducedMotion();
  /* 原本 20s 監視実測（2026-06-11、y1400 帯）: idle 完全静止
     → カード柄 flip は hover 中のみ 3.1s 周期（storyboard の柄サイクルは hover 録画由来） */
  const [hovering, setHovering] = useState(false);
  const face = useCycle(2, 3100, !reduced && hovering);

  return (
    <BentoCard
      id="issuing"
      title="カード発行プログラムを自在に展開"
      className="sj-bento--issuing"
      shift={{ x: -3.55, y: -6 }}
      onHoverChange={setHovering}
    >
      <div className="sj-issuing__scene" aria-hidden="true">
        <div className="sj-issuing__card">
          <div
            className={
              face === 0 ? "sj-issuing__face sj-issuing__face--purple sj-issuing__face--active" : "sj-issuing__face sj-issuing__face--purple"
            }
          >
            <div className="sj-issuing__chip-row">
              <CardChip />
              <Contactless color="#ffffff" />
            </div>
            <span className="sj-issuing__visa">VISA</span>
          </div>
          <div
            className={
              face === 1 ? "sj-issuing__face sj-issuing__face--white sj-issuing__face--active" : "sj-issuing__face sj-issuing__face--white"
            }
          >
            <div className="sj-issuing__chip-row">
              <CardChip />
              <Contactless color="#b5bec9" />
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

/* ============ crypto: 送金弧 draw-in + 金額 badge pop（viewport 進入時 1 回） ============ */

export function SjPlatformCrypto() {
  return (
    <BentoCard
      id="crypto"
      title="ステーブルコインと暗号資産で越境決済に対応"
      className="sj-bento--crypto"
      shift={{ x: -3.55, y: -6 }}
    >
      <div className="sj-crypto__bg" aria-hidden="true">
        <img src={GLOBE_IMG} alt="" loading="lazy" />
      </div>
      <div className="sj-crypto__overlay" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 349 660" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sj-crypto-arc" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff5996" />
              <stop offset="100%" stopColor="#7a73ff" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 64 478 Q 96 300 198 240"
            fill="none"
            stroke="url(#sj-crypto-arc)"
            strokeWidth="1.6"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          <motion.circle
            cx="64"
            cy="478"
            r="4"
            fill="#ff5996"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </svg>
        <motion.div
          className="sj-crypto__badge"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.55 }}
        >
          <span className="sj-crypto__badge-icon">$</span>
          <span className="sj-tnum">$102.23 USDC</span>
        </motion.div>
      </div>
    </BentoCard>
  );
}
