"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SIERRA } from "@/components/sierra/tokens";

type Testimonial = {
  brand: string;
  quote: string;
  name: string;
  title: string;
  company: string;
};

const TESTIMONIALS: readonly Testimonial[] = [
  {
    brand: "BRIGHTLINE",
    quote:
      "Resolution rates climbed past anything our team had managed before, and the experience still feels like us. Customers can't tell the difference.",
    name: "Priya Menon",
    title: "VP Customer Experience",
    company: "Brightline",
  },
  {
    brand: "HARBOR BANK",
    quote:
      "We went live in weeks, not quarters. The agent handles the complex cases our policies actually care about, and escalates the rest cleanly.",
    name: "Tomás Rivera",
    title: "COO",
    company: "Harbor Bank",
  },
  {
    brand: "MERIDIAN HEALTH",
    quote:
      "Every conversation is on-brand, compliant, and resolved end to end. Our agents now spend their time on the work that needs a human.",
    name: "Naomi Adeyemi",
    title: "Head of Member Services",
    company: "Meridian Health",
  },
  {
    brand: "NORTHWIND LOGISTICS",
    quote:
      "Support that used to wait until morning now resolves at two in the morning. Our CSAT moved up and the cost per contact dropped.",
    name: "Daniel Sørensen",
    title: "Director of Operations",
    company: "Northwind Logistics",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function SierraTestimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="font-display py-24 sm:py-32"
      style={{ backgroundColor: SIERRA.paper }}
    >
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <motion.h2
          className="mx-auto max-w-[18ch] text-center text-3xl leading-[1.08] tracking-[-0.03em] sm:text-4xl md:text-5xl"
          style={{ color: SIERRA.ink }}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          The results speak for themselves.
        </motion.h2>

        <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((item, index) => (
            <motion.li
              key={item.company}
              className="flex flex-col rounded-2xl p-7"
              style={{
                backgroundColor: SIERRA.paper,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: reduceMotion ? 0 : index * 0.08,
              }}
            >
              <span
                className="text-xs font-medium tracking-[0.14em]"
                style={{ color: "rgba(48,46,45,0.45)" }}
              >
                {item.brand}
              </span>

              <blockquote
                className="mt-6 flex-1 text-[15px] leading-[1.55] tracking-[-0.01em]"
                style={{ color: SIERRA.ink }}
              >
                {item.quote}
              </blockquote>

              <figcaption className="mt-8 border-t pt-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <span className="block text-sm font-medium" style={{ color: SIERRA.ink }}>
                  {item.name}
                </span>
                <span
                  className="mt-1 block text-[13px] leading-snug"
                  style={{ color: "rgba(48,46,45,0.58)" }}
                >
                  {item.title} · {item.company}
                </span>
              </figcaption>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
