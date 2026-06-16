import type { ReactNode } from "react";

/** deep-green カード: rounded + hairline top border + shadow */
export function SpDarkCard({
  radius = "xl",
  className = "",
  children,
}: {
  radius?: "xl" | "2xl";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden border-t border-white/10 bg-sp-green shadow-[0_24px_48px_rgba(0,0,0,0.45)] ${
        radius === "2xl" ? "rounded-2xl" : "rounded-xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
