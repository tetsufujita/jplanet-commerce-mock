"use client";

import { useEffect, useState } from "react";

import { SIERRA } from "./tokens";

const LINKS = ["Product", "Industries", "Customers", "Company"];

export function SierraNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fg = scrolled ? SIERRA.ink : "#FFFFFF";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="flex items-center gap-2">
          <AtomMark color={scrolled ? SIERRA.forest : "#FFFFFF"} />
          <span className="font-display text-[18px] font-semibold tracking-[-0.03em]" style={{ color: fg }}>
            Sierra
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#top"
              className="font-display text-[14px] font-medium transition-opacity duration-200 hover:opacity-70"
              style={{ color: scrolled ? SIERRA.ink : "rgba(255,255,255,0.9)" }}
            >
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#top"
            className="hidden font-display text-[14px] font-medium transition-opacity duration-200 hover:opacity-70 sm:inline"
            style={{ color: fg }}
          >
            Sign in
          </a>
          <a
            href="#top"
            className="rounded-full px-4 py-2 font-display text-[13px] font-semibold transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background: scrolled ? SIERRA.forest : "#FFFFFF",
              color: scrolled ? "#FFFFFF" : SIERRA.ink,
            }}
          >
            Learn more
          </a>
        </div>
      </nav>
    </header>
  );
}

function AtomMark({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color }}>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.4" transform="rotate(120 12 12)" />
    </svg>
  );
}
