import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { X } from "lucide-react";

/**
 * 右下固定の mini PiP 動画カード（録画 rec-2 実測: x≈78-95% / y≈78-95% に fixed、
 * 全 scroll を通じて常駐 + muted autoplay）。動画は自前生成アセットを使用。
 */
export function SpPipVideo() {
  const reduced = useReducedMotion();
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="fixed right-6 bottom-6 z-40 hidden w-[260px] overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-sm md:block">
      <div className="relative aspect-video">
        {reduced ? (
          <img src="/shopify-jp/hero-bg.jpg" alt="" className="size-full object-cover" />
        ) : (
          <video
            src="/shopify-jp/hero-bg.mp4"
            poster="/shopify-jp/hero-bg.jpg"
            autoPlay
            loop
            muted
            playsInline
            className="size-full object-cover"
          />
        )}
        <button
          type="button"
          aria-label="ミニプレイヤーを閉じる"
          onClick={() => {
            setClosed(true);
          }}
          className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white/80 transition-colors hover:bg-black/80 hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <p className="px-3 py-2 text-[12px] font-medium text-white/85">Shopifyが開発されるまで</p>
    </div>
  );
}
