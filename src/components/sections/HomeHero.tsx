import {
  BrainCircuit,
  CreditCard,
  Menu,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslation } from "react-i18next";

type FeatureId = "aiAgents" | "payments" | "logistics" | "compliance";

interface Feature {
  id: FeatureId;
  Icon: LucideIcon;
}

const features = [
  {
    id: "aiAgents",
    Icon: BrainCircuit,
  },
  {
    id: "payments",
    Icon: CreditCard,
  },
  {
    id: "logistics",
    Icon: Truck,
  },
  {
    id: "compliance",
    Icon: ShieldCheck,
  },
] as const satisfies readonly Feature[];

const andesEase = [0.16, 1, 0.3, 1] as const;

const titleVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const titleLineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: andesEase,
    },
  },
};

const featureBandVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.28,
      duration: 0.5,
      ease: andesEase,
    },
  },
};

function FeatureItem({ feature, index }: { feature: Feature; index: number }) {
  const { t } = useTranslation();
  const { Icon } = feature;
  const dividerClasses =
    index === 0
      ? ""
      : "border-t border-text/15 pt-4 sm:pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0";

  return (
    <article className={`relative min-w-0 ${dividerClasses}`}>
      {index > 0 ? (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 hidden size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson lg:block"
        />
      ) : null}
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="grid size-10 shrink-0 place-items-center text-text sm:size-12" aria-hidden="true">
          <Icon strokeWidth={1.7} className="size-8 sm:size-9" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold leading-tight text-text sm:text-lg">
            {t(`home.hero.features.${feature.id}.label`)}
          </h2>
          <p className="mt-1 max-w-[24ch] text-xs leading-relaxed text-muted sm:text-sm">
            {t(`home.hero.features.${feature.id}.description`)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function HomeHero() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const initialState = shouldReduceMotion ? false : "hidden";
  const titleLines = [
    {
      key: "line1",
      className: "text-text",
    },
    {
      key: "line2",
      className: "text-text",
    },
    {
      key: "line3",
      className: "text-crimson",
    },
  ] as const;

  return (
    <section
      aria-label={t("home.hero.label")}
      className="relative isolate flex min-h-svh overflow-hidden text-text"
    >
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-gradient-to-r from-bg/62 via-bg/28 to-bg/0" />
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-gradient-to-b from-bg/34 via-bg/0 to-bg/28" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-0 h-1/3 bg-gradient-to-t from-bg/70 via-bg/32 to-bg/0" />

      <div className="relative z-10 flex min-h-svh w-full flex-col">
        <header className="flex items-center justify-between px-5 py-6 sm:px-8 lg:px-14">
          <a href="/" aria-label={t("brand.markLabel")} className="inline-flex items-center gap-3 text-text">
            <span
              aria-hidden="true"
              className="size-0 border-x-[9px] border-b-[16px] border-x-transparent border-b-crimson"
            />
            <span className="font-display text-lg font-semibold leading-none sm:text-xl">{t("brand.name")}</span>
          </a>
          <button
            type="button"
            aria-label={t("navigation.menuLabel")}
            aria-expanded="false"
            className="grid size-11 place-items-center text-text transition-opacity duration-300 ease-andes hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson"
          >
            <Menu strokeWidth={1.5} className="size-8" aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 items-center px-5 pb-6 pt-8 sm:px-8 sm:pb-8 lg:px-14">
          <motion.div
            initial={initialState}
            animate="visible"
            variants={shouldReduceMotion ? undefined : titleVariants}
            className="max-w-[72rem]"
          >
            <motion.h1
              variants={shouldReduceMotion ? undefined : titleVariants}
              className="font-display text-[2.3rem] font-semibold leading-[0.98] tracking-normal text-text max-[360px]:text-[2rem] sm:text-[3.8rem] md:text-[5rem] lg:text-[5.6rem] xl:text-[6rem] 2xl:text-[7rem]"
            >
              {titleLines.map((line) => (
                <motion.span
                  key={line.key}
                  variants={shouldReduceMotion ? undefined : titleLineVariants}
                  className={`block min-w-0 overflow-wrap-anywhere ${line.className}`}
                >
                  {t(`home.hero.title.${line.key}`)}
                </motion.span>
              ))}
            </motion.h1>
            <motion.div
              variants={shouldReduceMotion ? undefined : titleLineVariants}
              className="mt-5 h-0.5 w-10 bg-crimson sm:mt-6"
            />
            <motion.div
              variants={shouldReduceMotion ? undefined : titleLineVariants}
              className="mt-5 max-w-[34ch] text-text"
            >
              <p className="text-lg font-semibold leading-relaxed sm:text-xl">{t("home.hero.sub.lead")}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-muted sm:text-base sm:leading-8">
                {t("home.hero.sub.body")}
              </p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={initialState}
          animate="visible"
          variants={shouldReduceMotion ? undefined : featureBandVariants}
          className="border-t border-text/10 bg-bg/68 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5 lg:px-14 lg:py-3"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {features.map((feature, index) => (
              <FeatureItem key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
