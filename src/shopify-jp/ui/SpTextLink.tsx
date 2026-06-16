import type { ReactNode } from "react";

/** 下線リンク共通: gray → white hover、下線は hover で消える */
export function SpTextLink({
  href = "#",
  className = "",
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`text-sp-gray underline underline-offset-4 transition-colors hover:text-white hover:no-underline ${className}`}
    >
      {children}
    </a>
  );
}
