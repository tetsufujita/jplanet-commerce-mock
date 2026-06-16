import type { ReactNode } from "react";

/** 実測仮: コンテンツ幅 1260px @1440（要実測 A2 で確定） */
export function SpContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1260px] px-6 lg:px-0 ${className}`}>{children}</div>
  );
}
