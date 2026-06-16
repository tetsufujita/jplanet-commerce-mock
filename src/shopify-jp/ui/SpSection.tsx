import type { ReactNode } from "react";

const BG = {
  dark: "bg-sp-dark",
  navy: "bg-sp-navy",
  pine: "bg-sp-pine",
  black: "bg-black",
  transparent: "bg-transparent",
} as const;

export type SpSectionBg = keyof typeof BG;

/** 共通 section 骨格: bg token + 縦 padding + data-section（verify ループで参照） */
export function SpSection({
  id,
  bg = "dark",
  className = "",
  children,
}: {
  id: string;
  bg?: SpSectionBg;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section data-section={id} className={`relative ${BG[bg]} ${className}`}>
      {children}
    </section>
  );
}
