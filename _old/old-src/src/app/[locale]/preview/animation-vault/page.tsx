import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AnimationVaultDemos } from "@/components/animation-vault/AnimationVaultDemos";
import { AnimationVaultGallery } from "@/components/animation-vault/AnimationVaultGallery";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const patternIds = [
  "beam",
  "ticker",
  "particles",
  "reveal",
  "countUp",
  "smoothScroll",
  "maskedHeroType",
  "heroArc",
  "scrollHint",
  "networkFlow",
  "productScene",
  "progressFill",
  "gaugeRing",
  "cssFadeUp",
  "lineArcDraw",
  "scrollMorph",
  "gsapSplit",
  "gsapScrollTrigger",
  "gsapOfficialSkills",
  "gsapTimeline",
  "gsapFlip",
  "gsapMotionPath",
  "gsapSvgMorph",
  "gsapPerformance",
  "dreiFluidFallback",
  "threeFluidFx",
  "webglMountainScene",
  "glslFogDepth",
  "lenisCameraScroll",
  "webglDepthOfField",
  "scrollFogDensity",
  "twoColorWebglScene",
  "remotionStory",
  "sierraStage",
  "cinematicCanvas",
  "logoMarquee",
  "videoLoop",
  "splineHeroObject",
  "splineScrollDrive",
  "frontendDesignSkill",
  "hallmarkAestheticGuard",
  "aiMotionTasteRubric",
] as const;
const frontierIds = ["gsapOfficial", "webglGlsl", "splineReference", "designTaste"] as const;
const galleryFilterIds = ["all", "live", "gsap", "webgl", "media", "guard"] as const;
const ruleIds = ["restrain", "tokens", "reducedMotion"] as const;
const statIds = ["materials", "dependencies", "route"] as const;

type PatternId = (typeof patternIds)[number];
type FrontierId = (typeof frontierIds)[number];
type GalleryFilterId = (typeof galleryFilterIds)[number];
type RuleId = (typeof ruleIds)[number];
type StatId = (typeof statIds)[number];
type TranslationFn = (key: string) => string;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: "preview.animationVault.meta" });

  return {
    robots: { follow: false, index: false },
    title: t("title"),
  };
}

export default async function AnimationVaultPreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "preview.animationVault" });
  const patterns = patternIds.map((id) => getPattern(t, id));
  const frontierItems = frontierIds.map((id) => getFrontierItem(t, id));
  const galleryFilters = galleryFilterIds.map((id) => getGalleryFilter(t, id));
  const rules = ruleIds.map((id) => getRule(t, id));
  const stats = statIds.map((id) => getStat(t, id));

  return (
    <main className="min-h-screen bg-andes-paper text-andes-ink" id="main">
      <section className="relative overflow-hidden border-b border-andes-navy/10 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-16">
          <div>
            <p className="font-display text-sm font-semibold text-andes-crimson">{t("hero.eyebrow")}</p>
            <h1 className="mt-5 max-w-4xl text-balance font-display text-5xl font-semibold leading-none text-andes-navy sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
          </div>
          <div className="flex flex-col justify-between gap-10">
            <p className="max-w-2xl text-lg leading-8 text-andes-subtle sm:text-xl">{t("hero.lead")}</p>
            <div className="grid gap-px overflow-hidden rounded-lg border border-andes-navy/12 bg-andes-navy/12 sm:grid-cols-3">
              {stats.map((stat) => (
                <div className="bg-andes-paper p-5" key={stat.id}>
                  <div className="font-display text-2xl font-semibold text-andes-navy">{stat.value}</div>
                  <div className="mt-2 text-sm leading-5 text-andes-subtle">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimationVaultDemos
        copy={{
          beam: {
            andes: t("demos.beam.andes"),
            brand: t("demos.beam.brand"),
            consumer: t("demos.beam.consumer"),
            customs: t("demos.beam.customs"),
            description: t("demos.beam.description"),
            title: t("demos.beam.title"),
            worldAi: t("demos.beam.worldAi"),
          },
          particles: {
            corridor: t("demos.particles.corridor"),
            description: t("demos.particles.description"),
            saoPaulo: t("demos.particles.saoPaulo"),
            title: t("demos.particles.title"),
            tokyo: t("demos.particles.tokyo"),
          },
          native: {
            arcTitle: t("demos.native.arcTitle"),
            description: t("demos.native.description"),
            flowTitle: t("demos.native.flowTitle"),
            productBadge: t("demos.native.productBadge"),
            productTitle: t("demos.native.productTitle"),
            title: t("demos.native.title"),
            typeLine1: t("demos.native.typeLine1"),
            typeLine2: t("demos.native.typeLine2"),
            typeLine3: t("demos.native.typeLine3"),
            typeTitle: t("demos.native.typeTitle"),
          },
          fluid: {
            cursor: t("demos.fluid.cursor"),
            description: t("demos.fluid.description"),
            fallback: t("demos.fluid.fallback"),
            note: t("demos.fluid.note"),
            status: t("demos.fluid.status"),
            title: t("demos.fluid.title"),
          },
          ticker: {
            description: t("demos.ticker.description"),
            flowLabel: t("demos.ticker.flowLabel"),
            launchLabel: t("demos.ticker.launchLabel"),
            marketLabel: t("demos.ticker.marketLabel"),
            marketSuffix: t("demos.ticker.marketSuffix"),
            title: t("demos.ticker.title"),
          },
        }}
        locale={locale}
      />

      <section className="border-b border-andes-navy/10 bg-white px-5 py-18 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(220px,0.32fr)_minmax(0,1fr)]">
            <aside>
              <p className="font-display text-sm font-semibold text-andes-crimson">{t("frontier.eyebrow")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-andes-navy sm:text-4xl">
                {t("frontier.title")}
              </h2>
              <p className="mt-4 leading-7 text-andes-subtle">{t("frontier.lead")}</p>
            </aside>

            <div className="grid gap-3 md:grid-cols-2">
              {frontierItems.map((item) => (
                <FrontierCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-18 sm:px-8 lg:px-12" id="inventory">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(220px,0.26fr)_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-10 lg:h-fit">
              <p className="font-display text-sm font-semibold text-andes-crimson">{t("inventory.eyebrow")}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-andes-navy sm:text-4xl">
                {t("inventory.title")}
              </h2>
              <p className="mt-4 leading-7 text-andes-subtle">{t("inventory.lead")}</p>
            </aside>

            <AnimationVaultGallery
              copy={{
                anatomyLabel: t("gallery.anatomyLabel"),
                categoryLabel: t("gallery.categoryLabel"),
                closeLabel: t("gallery.closeLabel"),
                fitLabel: t("gallery.fitLabel"),
                implementationLabel: t("gallery.implementationLabel"),
                implementationPrototype: t("gallery.implementationPrototype"),
                implementationReady: t("gallery.implementationReady"),
                implementationReview: t("gallery.implementationReview"),
                motionStage1: t("gallery.motionStage1"),
                motionStage2: t("gallery.motionStage2"),
                motionStage3: t("gallery.motionStage3"),
                openLabel: t("gallery.openLabel"),
                previewLabel: t("gallery.previewLabel"),
                productionFitLabel: t("gallery.productionFitLabel"),
                reducedMotionLabel: t("gallery.reducedMotionLabel"),
                reducedMotionPause: t("gallery.reducedMotionPause"),
                reducedMotionStatic: t("gallery.reducedMotionStatic"),
                reviewLead: t("gallery.reviewLead"),
                reviewTitle: t("gallery.reviewTitle"),
                sourceLabel: t("gallery.sourceLabel"),
                statusLabel: t("gallery.statusLabel"),
                timingLabel: t("gallery.timingLabel"),
                timingLoop: t("gallery.timingLoop"),
                timingOneShot: t("gallery.timingOneShot"),
                timingScroll: t("gallery.timingScroll"),
                useLabel: t("gallery.useLabel"),
              }}
              filters={galleryFilters}
              patterns={patterns}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-andes-navy/10 bg-white px-5 py-18 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="font-display text-sm font-semibold text-andes-crimson">{t("rules.eyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-andes-navy sm:text-4xl">
              {t("rules.title")}
            </h2>
          </div>
          <div className="grid gap-3">
            {rules.map((rule) => (
              <div className="rounded-lg border border-andes-navy/10 bg-andes-paper p-5" key={rule.id}>
                <h3 className="font-display text-lg font-semibold text-andes-navy">{rule.title}</h3>
                <p className="mt-2 leading-7 text-andes-subtle">{rule.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function getPattern(t: TranslationFn, id: PatternId) {
  return {
    fit: t(`patterns.${id}.fit`),
    id,
    name: t(`patterns.${id}.name`),
    source: t(`patterns.${id}.source`),
    status: t(`patterns.${id}.status`),
    use: t(`patterns.${id}.use`),
  };
}

function getFrontierItem(t: TranslationFn, id: FrontierId) {
  return {
    body: t(`frontier.items.${id}.body`),
    id,
    label: t(`frontier.items.${id}.label`),
    source: t(`frontier.items.${id}.source`),
    title: t(`frontier.items.${id}.title`),
  };
}

function getGalleryFilter(t: TranslationFn, id: GalleryFilterId) {
  return {
    id,
    label: t(`gallery.filters.${id}`),
  };
}

function getRule(t: TranslationFn, id: RuleId) {
  return {
    body: t(`rules.items.${id}.body`),
    id,
    title: t(`rules.items.${id}.title`),
  };
}

function getStat(t: TranslationFn, id: StatId) {
  return {
    id,
    label: t(`hero.stats.${id}.label`),
    value: t(`hero.stats.${id}.value`),
  };
}

function FrontierCard({
  item,
}: {
  item: ReturnType<typeof getFrontierItem>;
}) {
  return (
    <article className="rounded-lg border border-andes-navy/10 bg-andes-paper p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-andes-crimson">{item.label}</div>
      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-andes-navy">{item.title}</h3>
      <p className="mt-3 leading-7 text-andes-subtle">{item.body}</p>
      <code className="mt-5 block rounded-lg bg-white px-3 py-3 text-xs leading-5 text-andes-subtle [overflow-wrap:anywhere]">
        {item.source}
      </code>
    </article>
  );
}
