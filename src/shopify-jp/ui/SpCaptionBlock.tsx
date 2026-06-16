import type { ReactNode } from "react";

/** h4 + 説明 + 任意の文中リンク（caption 型の小見出しブロック） */
export function SpCaptionBlock({
  title,
  children,
  className = "",
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex max-w-[36em] flex-col gap-2 ${className}`}>
      <h4 className="text-[18px] leading-[1.5] font-[550] text-white">{title}</h4>
      <p className="text-[14px] leading-[1.8] text-sp-gray">{children}</p>
    </div>
  );
}
