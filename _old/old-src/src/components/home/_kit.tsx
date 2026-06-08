import type { ReactNode } from "react";

import { cx } from "@/lib/classnames";

export type SectionProps = { locale: string };

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("mx-auto w-full max-w-6xl px-6 sm:px-8", className)}>{children}</div>;
}

export function Section({
  id,
  dark,
  className,
  children,
}: {
  id?: string;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cx(
        "py-24 sm:py-32",
        dark ? "bg-andes-navy text-andes-paper" : "bg-andes-paper text-andes-ink",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Kicker({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={cx(
        "font-display text-xs font-semibold uppercase tracking-[0.28em]",
        dark ? "text-andes-paper/50" : "text-gray-500",
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cx(
        "mt-4 max-w-3xl text-balance font-semibold tracking-[-0.02em] [font-size:clamp(1.7rem,3.4vw,2.6rem)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}
