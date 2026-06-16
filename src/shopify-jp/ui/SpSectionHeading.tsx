import type { ReactNode } from "react";

/** H2 55px/64px w330（実測）+ 任意の右カラム説明（w-3/5 + w-2/5 型） */
export function SpSectionHeading({
  title,
  aside,
  className = "",
}: {
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between ${className}`}>
      <h2 className="max-w-[18em] text-[clamp(34px,3.8vw,55px)] leading-[1.16] font-[330] text-white">
        {title}
      </h2>
      {aside ? (
        <div className="max-w-[34em] text-[16px] leading-[1.8] text-sp-gray lg:w-2/5">{aside}</div>
      ) : null}
    </div>
  );
}
