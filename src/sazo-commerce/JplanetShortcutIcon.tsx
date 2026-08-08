import type { ReactNode } from "react";
import type { ShortcutIconId } from "@/sazo-commerce/fixtures";

interface JplanetShortcutIconProps {
  id: ShortcutIconId;
}

interface ShortcutSvgProps extends JplanetShortcutIconProps {
  children: ReactNode;
}

function ShortcutSvg({ children, id }: ShortcutSvgProps) {
  return (
    <svg
      aria-hidden
      data-jplanet-shortcut-icon={id}
      focusable="false"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function JplanetShortcutIcon({ id }: JplanetShortcutIconProps) {
  if (id === "feature") {
    return (
      <img
        alt=""
        aria-hidden
        data-jplanet-sakura-mark
        draggable={false}
        src="/sazo-commerce/jplanet-sakura-mark.png"
      />
    );
  }

  if (id === "limited") {
    return (
      <ShortcutSvg id={id}>
        <path
          d="M11 17.5A7.5 7.5 0 0 1 18.5 10h27A7.5 7.5 0 0 1 53 17.5v7.2a7.8 7.8 0 0 0 0 14.6v7.2a7.5 7.5 0 0 1-7.5 7.5h-27a7.5 7.5 0 0 1-7.5-7.5v-7.2a7.8 7.8 0 0 0 0-14.6Z"
          fill="var(--jplanet-sakura)"
        />
        <circle cx="32" cy="32" fill="var(--jplanet-navy)" r="13" />
        <path
          d="m32 21.8 2.9 6 6.6 1-4.8 4.6 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.6 6.6-1Z"
          fill="#fff"
        />
        <circle cx="18" cy="18" fill="#fff" opacity=".9" r="2.5" />
        <circle cx="46" cy="46" fill="#fff" opacity=".9" r="2.5" />
      </ShortcutSvg>
    );
  }

  if (id === "flea-market") {
    return (
      <ShortcutSvg id={id}>
        <path
          d="M8.5 20.5A8.5 8.5 0 0 1 17 12h18.2a8 8 0 0 1 5.7 2.4l12.7 12.7a7 7 0 0 1 0 9.9L37 53.6a7 7 0 0 1-9.9 0L10.9 37.4a8 8 0 0 1-2.4-5.7Z"
          fill="var(--jplanet-sakura)"
        />
        <circle cx="21" cy="24" fill="#fff" r="5" />
        <circle cx="21" cy="24" fill="var(--jplanet-navy)" r="2.2" />
        <path
          d="m35.5 25.2 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8Z"
          fill="var(--jplanet-navy)"
        />
      </ShortcutSvg>
    );
  }

  if (id === "cosmetics") {
    return (
      <ShortcutSvg id={id}>
        <rect
          fill="var(--jplanet-navy)"
          height="27"
          rx="6"
          width="17"
          x="12"
          y="27"
        />
        <path d="M15 24h11v8H15z" fill="#fff" />
        <path
          d="M17 11.5c0-2 1.6-3.5 3.5-3.5S24 9.6 24 11.5V24h-7Z"
          fill="var(--jplanet-sakura)"
        />
        <path
          d="M38 13c0-3.3 2.7-6 6-6h4v12h-4a6 6 0 0 1-6-6Z"
          fill="var(--jplanet-sakura)"
        />
        <path
          d="m40.3 19.2 7.5-1.5 7.1 35.5a4 4 0 0 1-7.8 1.6Z"
          fill="var(--jplanet-navy)"
        />
        <circle cx="20.5" cy="43.5" fill="var(--jplanet-sakura)" r="4" />
      </ShortcutSvg>
    );
  }

  return (
    <ShortcutSvg id={id}>
      <rect
        fill="var(--jplanet-navy)"
        height="46"
        rx="13"
        width="50"
        x="7"
        y="9"
      />
      <circle cx="24" cy="32" fill="var(--jplanet-sakura)" r="13" />
      <circle cx="24" cy="32" fill="#fff" opacity=".95" r="5" />
      <path
        d="M40 19v20.3a6.3 6.3 0 1 1-3.5-5.7V23.2l13-2.8v15.9a6.3 6.3 0 1 1-3.5-5.7V17Z"
        fill="#fff"
      />
      <circle cx="13" cy="17" fill="var(--jplanet-sakura)" r="2.5" />
    </ShortcutSvg>
  );
}
