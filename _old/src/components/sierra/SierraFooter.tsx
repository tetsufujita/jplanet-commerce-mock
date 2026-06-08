"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

type FooterLink = {
  readonly label: string;
  readonly href: string;
};

type FooterColumn = {
  readonly heading: string;
  readonly links: readonly FooterLink[];
};

const COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Platform", href: "#" },
      { label: "Agent SDK", href: "#" },
      { label: "Voice", href: "#" },
      { label: "Analytics", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { label: "Retail", href: "#" },
      { label: "Financial Services", href: "#" },
      { label: "Telecom", href: "#" },
      { label: "Healthcare", href: "#" },
      { label: "Travel", href: "#" },
    ],
  },
  {
    heading: "Customers",
    links: [
      { label: "Case Studies", href: "#" },
      { label: "Northwind Mutual", href: "#" },
      { label: "Harborline Telecom", href: "#" },
      { label: "Verdant Retail", href: "#" },
      { label: "Becoming a Customer", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Newsroom", href: "#" },
      { label: "Research", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const LEGAL_LINKS: readonly FooterLink[] = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
];

const LANGUAGES: readonly string[] = ["EN", "es", "日本語"];

const EASE = [0.22, 1, 0.36, 1] as const;

function AtomMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <circle cx="14" cy="14" r="2.4" fill={SIERRA.forest} />
      <ellipse
        cx="14"
        cy="14"
        rx="12"
        ry="5"
        stroke={SIERRA.forest}
        strokeWidth="1.4"
        fill="none"
      />
      <ellipse
        cx="14"
        cy="14"
        rx="12"
        ry="5"
        stroke={SIERRA.forest}
        strokeWidth="1.4"
        fill="none"
        transform="rotate(60 14 14)"
      />
      <ellipse
        cx="14"
        cy="14"
        rx="12"
        ry="5"
        stroke={SIERRA.forest}
        strokeWidth="1.4"
        fill="none"
        transform="rotate(120 14 14)"
      />
    </svg>
  );
}

type IconProps = {
  readonly title: string;
};

function LinkedInIcon({ title }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C21.4 8.75 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.03 0-2.34 1.58-2.34 3.21V21h-3.99V9Z" />
    </svg>
  );
}

function XIcon({ title }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function YouTubeIcon({ title }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.5v-7l6.2 3.5-6.2 3.5Z" />
    </svg>
  );
}

export function SierraFooter() {
  const reduceMotion = useReducedMotion();

  const reveal = reduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease: EASE },
      };

  return (
    <footer
      className="font-display w-full"
      style={{ backgroundColor: SIERRA.offwhite, color: SIERRA.ink }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-20">
        <motion.div {...reveal}>
          {/* Top: mark + wordmark, then four link columns */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_3fr] lg:gap-16">
            <div className="flex items-center gap-3">
              <AtomMark />
              <span className="text-xl tracking-[-0.03em] font-medium">
                Sierra
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
              {COLUMNS.map((column) => (
                <div key={column.heading}>
                  <h3 className="text-sm font-medium tracking-[-0.01em]">
                    {column.heading}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-[#7C7A78] transition-colors duration-200 hover:text-[#302E2D]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: hairline-separated meta row */}
          <div
            className="mt-16 flex flex-col gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between"
            style={{ borderColor: "rgba(48,46,45,0.12)" }}
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#7C7A78]">
              <div
                className="flex items-center gap-2"
                role="group"
                aria-label="Language selector"
              >
                {LANGUAGES.map((lang, index) => (
                  <span key={lang} className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`transition-colors duration-200 hover:text-[#302E2D] ${
                        index === 0 ? "text-[#302E2D]" : ""
                      }`}
                    >
                      {lang}
                    </button>
                    {index < LANGUAGES.length - 1 ? (
                      <span aria-hidden="true" className="text-[#C9C7C4]">
                        /
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>

              <span className="hidden lg:inline text-[#C9C7C4]" aria-hidden="true">
                ·
              </span>

              <span>© 2026 Sierra (study reproduction)</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <nav
                aria-label="Legal"
                className="flex items-center gap-4 text-sm text-[#7C7A78]"
              >
                {LEGAL_LINKS.map((link, index) => (
                  <span key={link.label} className="flex items-center gap-4">
                    <a
                      href={link.href}
                      className="transition-colors duration-200 hover:text-[#302E2D]"
                    >
                      {link.label}
                    </a>
                    {index < LEGAL_LINKS.length - 1 ? (
                      <span aria-hidden="true" className="text-[#C9C7C4]">
                        ·
                      </span>
                    ) : null}
                  </span>
                ))}
              </nav>

              <div className="flex items-center gap-4 text-[#7C7A78]">
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="transition-colors duration-200 hover:text-[#302E2D]"
                >
                  <LinkedInIcon title="LinkedIn" />
                </a>
                <a
                  href="#"
                  aria-label="X"
                  className="transition-colors duration-200 hover:text-[#302E2D]"
                >
                  <XIcon title="X" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="transition-colors duration-200 hover:text-[#302E2D]"
                >
                  <YouTubeIcon title="YouTube" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
