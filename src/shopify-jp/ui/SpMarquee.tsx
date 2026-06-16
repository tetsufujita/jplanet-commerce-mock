import type { ReactNode } from "react";

/**
 * 無限スクロール帯。children を 2 連結して -50% translate ループ（keyframes は shopify.css）。
 * reduced-motion 時は静的 wrap にフォールバック。
 */
export function SpMarquee({
  children,
  duration = 60,
  gap = 32,
  reverse = false,
  pauseOnHover = false,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  gap?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={`group overflow-hidden ${className}`}>
      <div
        className={`flex w-max motion-reduce:flex-wrap ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{
          gap,
          paddingRight: gap,
          animation: `sp-marquee ${String(duration)}s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
