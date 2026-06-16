import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import "./SjPlatform.css";
import { SjPlatformPayments } from "./SjPlatformPayments";
import { SjPlatformBilling } from "./SjPlatformBilling";
import { SjPlatformAgentic, SjPlatformCrypto, SjPlatformIssuing } from "./SjPlatformCards";
import { SjPlatformConnect } from "./SjPlatformConnect";

/**
 * §2 プロダクト bento（modular-solutions-section）
 * - 見出し + subdued 説明（説明は scroll 連動の文字色 reveal）
 * - bento 6 カード: payments / billing / agentic-commerce / issuing / crypto / connect
 * - entrance アニメは原則なし（motion-spec §0、確定仕様）
 */
export function SjPlatform() {
  const headRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: headRef,
    offset: ["start 0.9", "start 0.45"],
  });
  const revealPct = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const descBackground = useMotionTemplate`linear-gradient(90deg, #0a2540 ${revealPct}%, rgba(10, 37, 64, 0.38) ${revealPct}%)`;

  return (
    <section className="sj-platform">
      <div className="sj-container">
        <div className="sj-platform__head" ref={headRef}>
          <h2 className="sj-platform__title">
            ビジネスの形態を問わない、柔軟なプラットフォーム。
          </h2>{" "}
          <motion.p className="sj-platform__desc" style={{ backgroundImage: descBackground }}>
            決済から金融サービスまで、必要なツールを自由に組み合わせて使える包括的なソリューションが、ビジネスの成長を支え続けます。
          </motion.p>
        </div>
        <div className="sj-bento-grid">
          <SjPlatformPayments />
          <SjPlatformBilling />
          <SjPlatformAgentic />
          <SjPlatformIssuing />
          <SjPlatformCrypto />
          <SjPlatformConnect />
        </div>
      </div>
    </section>
  );
}
