/** 背景の radial glow 楕円。親に relative / overflow-hidden を要求。 */
export function SpGlowEllipse({
  color = "rgba(54,244,164,0.18)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-[50%] blur-3xl ${className}`}
      style={{ background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, transparent 100%)` }}
    />
  );
}
