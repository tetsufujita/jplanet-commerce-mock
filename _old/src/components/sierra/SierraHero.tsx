/* Hallmark · studied-DNA reproduction · source: sierra.ai
 * macrostructure: Photographic hero · liquid-glass live-chat overlay
 * theme: studied-DNA · paper #FFFFFF · accent forest #006838 · display: Geist (GT America substitute)
 * studied: yes · DNA-source: url (public reference for user's brand study)
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { SIERRA, SIERRA_GLASS } from "./tokens";

const SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00"];
const DATES = ["May 13", "May 14"];

const EASE = [0.22, 1, 0.36, 1] as const;

export function SierraHero() {
  const [slot, setSlot] = useState("09:00");
  const [dateIdx, setDateIdx] = useState(0);

  return (
    <section id="top" className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: 640 }}>
      {/* warm photographic background — subtle Ken-Burns breathing */}
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/user-woman-cafe.mp4"
        initial={{ scale: 1.02 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
      {/* warm clay wash + left gutter, darken bottom-right for chat legibility */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(58,34,24,0.62) 0%, rgba(58,34,24,0.20) 38%, rgba(40,28,22,0.10) 60%, rgba(30,22,18,0.45) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(30,22,18,0.25) 0%, rgba(30,22,18,0) 30%, rgba(30,22,18,0.45) 100%)" }}
      />

      <div className="relative mx-auto flex h-full max-w-[1240px] flex-col justify-center px-6 lg:px-10">
        <motion.h1
          className="max-w-[14ch] font-display font-semibold leading-[1.02] tracking-[-0.035em] text-white"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 5rem)", textShadow: "0 2px 30px rgba(0,0,0,0.35)" }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          Better customer experiences. Built on Sierra.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
          className="mt-8"
        >
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display text-[14px] font-semibold transition-transform duration-200 hover:-translate-y-0.5"
            style={{ color: SIERRA.ink }}
          >
            Learn more
            <span aria-hidden>→</span>
          </a>
        </motion.div>

        {/* self-playing liquid-glass conversation, bottom-right */}
        <div className="pointer-events-none absolute bottom-10 right-6 flex w-[min(384px,86vw)] flex-col items-end gap-3 lg:right-10">
          <motion.p
            className="text-right font-display text-[15px] leading-[1.4] text-white"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
          >
            Can we see our doctor first thing this morning?
          </motion.p>

          <motion.div
            className="pointer-events-auto w-full rounded-[18px] px-4 py-3.5"
            style={SIERRA_GLASS}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 1.5 }}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <AtomGlyph />
              <span className="font-display text-[12px] font-semibold text-white/95">Sierra Agent</span>
            </div>
            <p className="font-display text-[13.5px] leading-[1.45] text-white">
              Yes, we have a few openings this morning.
            </p>
          </motion.div>

          <motion.div
            className="pointer-events-auto w-full rounded-[18px] p-4"
            style={SIERRA_GLASS}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 2.3 }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => setDateIdx((i) => (i + DATES.length - 1) % DATES.length)}
                className="grid h-6 w-6 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15"
              >
                ‹
              </button>
              <span className="font-display text-[13px] font-semibold text-white">{DATES[dateIdx]}</span>
              <button
                type="button"
                aria-label="Next day"
                onClick={() => setDateIdx((i) => (i + 1) % DATES.length)}
                className="grid h-6 w-6 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15"
              >
                ›
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {SLOTS.map((s) => {
                const active = s === slot;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className="rounded-full px-3 py-1.5 font-display text-[12px] font-medium transition-colors duration-200"
                    style={{
                      background: active ? "#FFFFFF" : "rgba(255,255,255,0.12)",
                      color: active ? SIERRA.ink : "rgba(255,255,255,0.9)",
                      border: active ? "1px solid #FFFFFF" : "1px solid rgba(255,255,255,0.22)",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-3.5 w-full rounded-full bg-white py-2.5 font-display text-[13px] font-semibold transition-transform duration-200 hover:-translate-y-0.5"
              style={{ color: SIERRA.ink }}
            >
              Confirm
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AtomGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-white">
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" stroke="currentColor" strokeWidth="1.4" transform="rotate(120 12 12)" />
    </svg>
  );
}
