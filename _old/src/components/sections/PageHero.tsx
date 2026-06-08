import type { ReactNode } from "react";

import { cx } from "@/lib/classnames";

export function PageHero({
  children,
  dark = false,
  eyebrow,
  lead,
  title,
}: {
  children?: ReactNode;
  dark?: boolean;
  eyebrow?: string;
  lead: string;
  title: string;
}) {
  return (
    <main className={cx("min-h-screen", dark ? "bg-andes-navy text-andes-paper" : "bg-andes-paper text-andes-ink")}>
      <section className="mx-auto flex min-h-[82vh] w-full max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8 lg:pt-40">
        {eyebrow ? (
          <p className={cx("font-mono text-sm uppercase", dark ? "text-andes-paper/60" : "text-gray-500")}>
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cx(
            "mt-8 max-w-5xl break-words font-display text-4xl font-semibold leading-tight tracking-normal [overflow-wrap:anywhere] sm:text-6xl sm:leading-[1.04] lg:text-7xl",
            dark ? "text-andes-paper" : "text-andes-navy",
          )}
        >
          {title}
        </h1>
        <p className={cx("mt-8 max-w-3xl text-lg leading-8 sm:text-xl", dark ? "text-andes-paper/72" : "text-gray-700")}>
          {lead}
        </p>
        {children ? <div className="mt-12">{children}</div> : null}
      </section>
    </main>
  );
}
