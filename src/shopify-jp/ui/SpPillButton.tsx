import type { ReactNode } from "react";

const VARIANTS = {
  "primary-white": "bg-white text-black hover:bg-white/85",
  "outline-white": "border-2 border-white/40 text-white hover:border-white hover:bg-white/10",
  ghost: "text-white hover:bg-white/10",
} as const;

export type SpPillVariant = keyof typeof VARIANTS;

/** 実測: radius 9999px / 18px / w550 / padding 12×24（small: 16px / 8×20） */
export function SpPillButton({
  variant = "primary-white",
  size = "md",
  icon,
  children,
  className = "",
}: {
  variant?: SpPillVariant;
  size?: "sm" | "md";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const sizeCls =
    size === "sm" ? "px-5 py-2 text-[16px]" : icon ? "py-3 pr-[26px] pl-4 text-[18px]" : "px-6 py-3 text-[18px]";
  return (
    <button
      type="button"
      className={`flex items-center gap-3 rounded-full font-[550] transition-all duration-200 ${VARIANTS[variant]} ${sizeCls} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
