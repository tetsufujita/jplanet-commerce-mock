"use client";

import { useReducedMotion } from "@/components/cinematic/MotionGate";
import { AgenticChatPlayer } from "@/components/v2/AgenticChatPlayer";
import { SplitChar } from "@/components/v2/SplitChar";
import { SectionWrapper } from "@/components/v2/SectionWrapper";
import { fadeUpStyle, useReveal } from "@/components/v2/useReveal";

type AgentBadge = {
  /** Short uppercase label rendered inside the circle (e.g., GPT, CL, GO). */
  short: string;
  label: string;
};

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  agents: AgentBadge[];
};

/**
 * "Brand shows up inside the chat" section — dark teal panel with logo row +
 * copy on the left and a live Remotion-powered 7-phase animation on the right
 * (floating phones, chat bubbles, product card, order confirmations).
 */
export function AgenticChatV2({ agents, body, eyebrow, title }: Props) {
  const reducedMotion = useReducedMotion();
  const [copyRef, copyVisible] = useReveal<HTMLDivElement>();
  const [playerRef, playerVisible] = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <SectionWrapper label={title} rhythm="large">
      <div
        className="relative overflow-hidden rounded-[32px] border border-white/8 px-7 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, rgba(34,80,68,0.95) 0%, rgba(10,28,28,0.95) 60%, rgba(8,20,20,0.95) 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 80% 10%, rgba(122,224,181,0.18) 0%, rgba(10,28,28,0) 70%)," +
              "radial-gradient(40% 30% at 10% 90%, rgba(240,232,192,0.10) 0%, rgba(10,28,28,0) 70%)",
          }}
        />
        <div className="relative grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
          <div
            className="flex flex-col gap-7 lg:gap-9"
            ref={copyRef}
            style={fadeUpStyle(copyVisible, 0, reducedMotion)}
          >
            <ul className="flex items-center gap-3">
              {agents.map((agent) => (
                <li
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#0A1428] sm:h-14 sm:w-14"
                  key={agent.short}
                  title={agent.label}
                >
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.04em] sm:text-[12px]">
                    {agent.short}
                  </span>
                </li>
              ))}
            </ul>
            <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-[#7AE0B5] sm:text-[13px]">
              {eyebrow}
            </span>
            <h2 className="max-w-[18ch] font-jp text-[clamp(2.2rem,4.8vw,4.2rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white">
              <SplitChar delay={0} text={title} />
            </h2>
            <p className="max-w-[44ch] font-jp text-[clamp(0.95rem,1.2vw,1.15rem)] font-light leading-[1.75] text-white/78">
              {body}
            </p>
          </div>

          <div
            className="relative"
            ref={playerRef}
            style={fadeUpStyle(playerVisible, 0.12, reducedMotion)}
          >
            <AgenticChatPlayer />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
