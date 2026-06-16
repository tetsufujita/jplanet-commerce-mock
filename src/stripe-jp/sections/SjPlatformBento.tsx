import type { CSSProperties, ReactNode } from "react";

/**
 * 位置移動なしの opacity crossfade slot。
 * 本家 DOM は translateY slot 式だが、録画実測（motion-spec §1）は
 * 「位置移動なしの crossfade」のためこちらを採用。
 */
export function XFade({
  items,
  index,
  delay = 0,
  className,
}: {
  items: readonly ReactNode[];
  index: number;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className ? `sj-xfade ${className}` : "sj-xfade"}>
      {items.map((item, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={i === index ? "sj-xfade__item sj-xfade__item--active" : "sj-xfade__item"}
          style={{ "--xfade-delay": `${String(delay)}ms` } as CSSProperties}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

/** ⤢ expand グリフ（DOM の path をそのまま使用、fill は currentColor） */
function ExpandGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" />
      <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" />
    </svg>
  );
}

/**
 * bento カード共通シェル。
 * - <button aria-haspopup="dialog">（本家同様。dialog 本体は再現対象外）
 * - --card-shift-x/y --card-grow-x/y は DOM inline style の実測値
 * - hover: カード微小 shift + ⤢ グリフ点灯（card 全域 hover で発火）
 */
export function BentoCard({
  id,
  title,
  className,
  shift,
  glow = false,
  children,
  onHoverChange,
}: {
  id: string;
  title: string;
  className: string;
  shift: { x: number; y: number };
  glow?: boolean;
  children: ReactNode;
  /** hover 駆動アニメ（connect の merchant 巡回等）用 */
  onHoverChange?: (hovering: boolean) => void;
}) {
  const style = {
    "--card-shift-x": `${String(shift.x)}px`,
    "--card-shift-y": `${String(shift.y)}px`,
    "--card-grow-x": `${String(-shift.x)}px`,
    "--card-grow-y": `${String(-shift.y)}px`,
  } as CSSProperties;
  return (
    <button
      type="button"
      className={`sj-bento ${className}`}
      style={style}
      aria-labelledby={`sj-bento-title-${id}`}
      aria-haspopup="dialog"
      aria-expanded={false}
      onMouseEnter={onHoverChange ? () => { onHoverChange(true); } : undefined}
      onMouseLeave={onHoverChange ? () => { onHoverChange(false); } : undefined}
    >
      <h3 className="sj-bento__title" id={`sj-bento-title-${id}`}>
        {title}
      </h3>
      <span className="sj-bento__expand" aria-hidden="true">
        <ExpandGlyph />
      </span>
      {children}
      {glow ? <span className="sj-bento__glow" aria-hidden="true" /> : null}
    </button>
  );
}
