"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cx } from "@/lib/classnames";

type GalleryFilterId = "all" | "live" | "gsap" | "webgl" | "media" | "guard";

type AnimationPattern = {
  fit: string;
  id: string;
  name: string;
  source: string;
  status: string;
  use: string;
};

type AnimationVaultGalleryProps = {
  copy: {
    anatomyLabel: string;
    categoryLabel: string;
    closeLabel: string;
    fitLabel: string;
    implementationLabel: string;
    implementationPrototype: string;
    implementationReady: string;
    implementationReview: string;
    motionStage1: string;
    motionStage2: string;
    motionStage3: string;
    openLabel: string;
    previewLabel: string;
    productionFitLabel: string;
    reducedMotionLabel: string;
    reducedMotionPause: string;
    reducedMotionStatic: string;
    reviewLead: string;
    reviewTitle: string;
    sourceLabel: string;
    statusLabel: string;
    timingLabel: string;
    timingLoop: string;
    timingOneShot: string;
    timingScroll: string;
    useLabel: string;
  };
  filters: Array<{
    id: GalleryFilterId;
    label: string;
  }>;
  patterns: AnimationPattern[];
};

const liveIds = new Set([
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
]);

const gsapIds = new Set([
  "gsapSplit",
  "gsapScrollTrigger",
  "gsapOfficialSkills",
  "gsapTimeline",
  "gsapFlip",
  "gsapMotionPath",
  "gsapSvgMorph",
  "gsapPerformance",
]);

const webglIds = new Set([
  "dreiFluidFallback",
  "threeFluidFx",
  "webglMountainScene",
  "glslFogDepth",
  "lenisCameraScroll",
  "webglDepthOfField",
  "scrollFogDensity",
  "twoColorWebglScene",
]);

const mediaIds = new Set([
  "scrollMorph",
  "remotionStory",
  "sierraStage",
  "cinematicCanvas",
  "logoMarquee",
  "videoLoop",
  "splineHeroObject",
  "splineScrollDrive",
]);

const guardIds = new Set(["frontendDesignSkill", "hallmarkAestheticGuard", "aiMotionTasteRubric"]);

export function AnimationVaultGallery({ copy, filters, patterns }: AnimationVaultGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<GalleryFilterId>("all");
  const [selectedPattern, setSelectedPattern] = useState<AnimationPattern | null>(null);
  const visiblePatterns = useMemo(
    () =>
      activeFilter === "all"
        ? patterns
        : patterns.filter((pattern) => getPatternFilters(pattern.id).includes(activeFilter)),
    [activeFilter, patterns],
  );

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className={cx(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeFilter === filter.id
                ? "border-andes-navy bg-andes-navy text-andes-paper"
                : "border-andes-navy/12 bg-white text-andes-subtle hover:border-andes-crimson/40 hover:text-andes-navy",
            )}
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visiblePatterns.map((pattern) => (
          <article
            className="group grid min-h-[520px] grid-rows-[220px_auto] overflow-hidden rounded-lg border border-andes-navy/10 bg-white shadow-[0_1px_2px_rgba(15,27,61,0.04)]"
            key={pattern.id}
          >
            <PatternPreview id={pattern.id} label={`${copy.previewLabel}: ${pattern.name}`} />
            <div className="flex flex-col p-5">
              <div className="inline-flex w-fit rounded-full border border-andes-crimson/30 px-3 py-1 text-xs font-semibold text-andes-crimson">
                {pattern.status}
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-andes-navy">{pattern.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-andes-subtle">{pattern.fit}</p>
              <div className="mt-5 border-t border-andes-navy/10 pt-4">
                <div className="text-sm font-semibold text-andes-navy">{pattern.use}</div>
                <code className="mt-3 block rounded-lg bg-andes-navy px-3 py-3 text-xs leading-5 text-andes-paper [overflow-wrap:anywhere]">
                  {pattern.source}
                </code>
              </div>
              <button
                className="mt-5 min-h-11 rounded-lg border border-andes-navy/14 px-4 py-2 text-sm font-semibold text-andes-navy transition hover:border-andes-crimson/40 hover:text-andes-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-crimson"
                onClick={() => setSelectedPattern(pattern)}
                type="button"
              >
                {copy.openLabel}
              </button>
            </div>
          </article>
        ))}
      </div>

      <PatternReviewDialog
        copy={copy}
        filters={filters}
        onClose={() => setSelectedPattern(null)}
        pattern={selectedPattern}
      />
      <GalleryAnimationStyles />
    </div>
  );
}

function PatternReviewDialog({
  copy,
  filters,
  onClose,
  pattern,
}: {
  copy: AnimationVaultGalleryProps["copy"];
  filters: AnimationVaultGalleryProps["filters"];
  onClose: () => void;
  pattern: AnimationPattern | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const categoryLabels = pattern ? getPatternFilterLabels(pattern.id, filters) : [];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pattern && !dialog.open) {
      dialog.showModal();
    }

    if (!pattern && dialog.open) {
      dialog.close();
    }
  }, [pattern]);

  if (!pattern) return null;

  return (
    <dialog
      aria-labelledby="animation-vault-review-title"
      className="w-[min(1120px,calc(100vw-28px))] rounded-lg border border-andes-navy/12 bg-andes-paper p-0 text-andes-ink shadow-[0_26px_90px_rgba(6,11,31,0.28)] backdrop:bg-andes-deep/62 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <div className="grid max-h-[min(88vh,920px)] overflow-y-auto lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="bg-andes-deep p-4 text-andes-paper sm:p-6">
          <PatternPreview
            id={pattern.id}
            label={`${copy.previewLabel}: ${pattern.name}`}
            size="detail"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ReviewMetric label={copy.statusLabel} value={pattern.status} />
            <ReviewMetric label={copy.categoryLabel} value={categoryLabels.join(" / ")} />
            <ReviewMetric label={copy.timingLabel} value={getTimingValue(pattern.id, copy)} />
          </div>
        </section>

        <section className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-display text-sm font-semibold text-andes-crimson">{copy.reviewTitle}</p>
              <h3 className="mt-2 font-display text-4xl font-semibold leading-none text-andes-navy" id="animation-vault-review-title">
                {pattern.name}
              </h3>
              <p className="mt-4 leading-7 text-andes-subtle">{copy.reviewLead}</p>
            </div>
            <button
              className="grid size-11 shrink-0 place-items-center rounded-full border border-andes-navy/12 text-xl leading-none text-andes-navy transition hover:border-andes-crimson/40 hover:text-andes-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-andes-crimson"
              onClick={onClose}
              type="button"
            >
              <span className="sr-only">{copy.closeLabel}</span>
              x
            </button>
          </div>

          <div className="mt-7 grid gap-4">
            <ReviewBlock label={copy.productionFitLabel}>{pattern.fit}</ReviewBlock>
            <ReviewBlock label={copy.useLabel}>{pattern.use}</ReviewBlock>
            <ReviewBlock label={copy.sourceLabel}>
              <code className="block rounded-lg bg-andes-navy px-3 py-3 text-xs leading-5 text-andes-paper [overflow-wrap:anywhere]">
                {pattern.source}
              </code>
            </ReviewBlock>
          </div>

          <div className="mt-7 rounded-lg border border-andes-navy/10 bg-white p-5">
            <h4 className="font-display text-xl font-semibold text-andes-navy">{copy.anatomyLabel}</h4>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MotionStage index="01" label={copy.motionStage1} />
              <MotionStage index="02" label={copy.motionStage2} />
              <MotionStage index="03" label={copy.motionStage3} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ReviewBlock label={copy.implementationLabel}>{getImplementationValue(pattern.id, copy)}</ReviewBlock>
            <ReviewBlock label={copy.reducedMotionLabel}>{getReducedMotionValue(pattern.id, copy)}</ReviewBlock>
          </div>
        </section>
      </div>
    </dialog>
  );
}

function getPatternFilters(id: string): GalleryFilterId[] {
  const filters: GalleryFilterId[] = [];
  if (liveIds.has(id)) filters.push("live");
  if (gsapIds.has(id)) filters.push("gsap");
  if (webglIds.has(id)) filters.push("webgl");
  if (mediaIds.has(id)) filters.push("media");
  if (guardIds.has(id)) filters.push("guard");
  return filters;
}

function getPatternFilterLabels(id: string, filters: AnimationVaultGalleryProps["filters"]) {
  const ids = getPatternFilters(id);
  return filters.filter((filter) => ids.includes(filter.id)).map((filter) => filter.label);
}

function getTimingValue(id: string, copy: AnimationVaultGalleryProps["copy"]) {
  if (id === "smoothScroll" || id === "gsapScrollTrigger" || id === "lenisCameraScroll" || id === "scrollFogDensity" || id === "splineScrollDrive") {
    return copy.timingScroll;
  }

  if (id === "ticker" || id === "countUp" || id === "reveal" || id === "cssFadeUp" || id === "maskedHeroType" || id === "gsapSplit") {
    return copy.timingOneShot;
  }

  return copy.timingLoop;
}

function getImplementationValue(id: string, copy: AnimationVaultGalleryProps["copy"]) {
  if (liveIds.has(id)) return copy.implementationReady;
  if (guardIds.has(id)) return copy.implementationReview;
  return copy.implementationPrototype;
}

function getReducedMotionValue(id: string, copy: AnimationVaultGalleryProps["copy"]) {
  if (webglIds.has(id) || id === "particles" || id === "threeFluidFx" || id === "cinematicCanvas") {
    return copy.reducedMotionPause;
  }

  return copy.reducedMotionStatic;
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-andes-paper/12 bg-andes-paper/[0.055] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-andes-paper/48">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-5 text-andes-paper">{value}</div>
    </div>
  );
}

function ReviewBlock({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <section className="rounded-lg border border-andes-navy/10 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-andes-crimson">{label}</h4>
      <div className="mt-3 leading-7 text-andes-subtle">{children}</div>
    </section>
  );
}

function MotionStage({ index, label }: { index: string; label: string }) {
  return (
    <div className="rounded-lg border border-andes-navy/10 bg-andes-paper p-4">
      <div className="font-display text-2xl font-semibold text-andes-crimson">{index}</div>
      <div className="mt-3 text-sm font-semibold leading-5 text-andes-navy">{label}</div>
    </div>
  );
}

function PatternPreview({
  id,
  label,
  size = "card",
}: {
  id: string;
  label: string;
  size?: "card" | "detail";
}) {
  return (
    <div
      aria-label={label}
      className={cx(
        "vault-preview relative isolate overflow-hidden bg-andes-paper",
        size === "card" ? "border-b border-andes-navy/10" : "min-h-[360px] rounded-lg border border-andes-paper/12",
        getPreviewTone(id),
      )}
      role="img"
    >
      <PreviewFigure id={id} />
    </div>
  );
}

function PreviewFigure({ id }: { id: string }) {
  const variant = getPreviewVariant(id);

  if (variant === "beam") return <BeamFigure />;
  if (variant === "numbers") return <NumbersFigure />;
  if (variant === "particles") return <ParticlesFigure />;
  if (variant === "reveal") return <RevealFigure />;
  if (variant === "scroll") return <ScrollFigure />;
  if (variant === "type") return <TypeFigure />;
  if (variant === "arc") return <ArcFigure />;
  if (variant === "hint") return <ScrollHintFigure />;
  if (variant === "flow") return <FlowFigure />;
  if (variant === "cards") return <CardsFigure />;
  if (variant === "progress") return <ProgressFigure />;
  if (variant === "gauge") return <GaugeFigure />;
  if (variant === "morph") return <MorphFigure />;
  if (variant === "timeline") return <TimelineFigure />;
  if (variant === "trigger") return <TriggerFigure />;
  if (variant === "path") return <PathFigure />;
  if (variant === "svg") return <SvgMorphFigure />;
  if (variant === "fluid") return <FluidFigure />;
  if (variant === "terrain") return <TerrainFigure />;
  if (variant === "fog") return <FogFigure />;
  if (variant === "camera") return <CameraFigure />;
  if (variant === "depth") return <DepthFigure />;
  if (variant === "film") return <FilmFigure />;
  if (variant === "marquee") return <MarqueeFigure />;
  if (variant === "object") return <ObjectFigure />;
  if (variant === "guard") return <GuardFigure />;
  return <ProgressFigure />;
}

function getPreviewVariant(id: string) {
  if (id === "beam") return "beam";
  if (id === "ticker" || id === "countUp") return "numbers";
  if (id === "particles") return "particles";
  if (id === "reveal" || id === "cssFadeUp") return "reveal";
  if (id === "smoothScroll") return "scroll";
  if (id === "maskedHeroType" || id === "gsapSplit") return "type";
  if (id === "heroArc" || id === "lineArcDraw") return "arc";
  if (id === "scrollHint") return "hint";
  if (id === "networkFlow") return "flow";
  if (id === "productScene" || id === "gsapFlip" || id === "sierraStage") return "cards";
  if (id === "progressFill" || id === "gsapPerformance") return "progress";
  if (id === "gaugeRing") return "gauge";
  if (id === "scrollMorph" || id === "gsapSvgMorph") return "morph";
  if (id === "gsapOfficialSkills" || id === "gsapTimeline") return "timeline";
  if (id === "gsapScrollTrigger" || id === "splineScrollDrive") return "trigger";
  if (id === "gsapMotionPath") return "path";
  if (id === "dreiFluidFallback" || id === "threeFluidFx") return "fluid";
  if (id === "webglMountainScene" || id === "twoColorWebglScene") return "terrain";
  if (id === "glslFogDepth" || id === "scrollFogDensity") return "fog";
  if (id === "lenisCameraScroll") return "camera";
  if (id === "webglDepthOfField") return "depth";
  if (id === "remotionStory" || id === "cinematicCanvas" || id === "videoLoop") return "film";
  if (id === "logoMarquee") return "marquee";
  if (id === "splineHeroObject") return "object";
  if (id === "frontendDesignSkill" || id === "hallmarkAestheticGuard" || id === "aiMotionTasteRubric") return "guard";
  return "svg";
}

function getPreviewTone(id: string) {
  if (webglIds.has(id) || id === "particles" || id === "beam") return "vault-preview-dark";
  if (gsapIds.has(id)) return "vault-preview-gsap";
  if (guardIds.has(id)) return "vault-preview-guard";
  return "vault-preview-light";
}

function BeamFigure() {
  return (
    <>
      <svg aria-hidden className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 320 220">
        <path className="vault-path-soft" d="M58 62 C 120 34, 172 92, 160 112 C 148 136, 92 166, 58 156" />
        <path className="vault-path-soft" d="M160 112 C 214 72, 256 64, 282 82" />
        <path className="vault-path-soft" d="M160 112 C 218 142, 248 160, 282 150" />
      </svg>
      <span className="vault-node left-[12%] top-[22%]" />
      <span className="vault-node left-[12%] top-[68%]" />
      <span className="vault-node-core left-1/2 top-1/2" />
      <span className="vault-node right-[11%] top-[31%]" />
      <span className="vault-node right-[11%] top-[65%]" />
      <span className="vault-orb vault-orb-a" />
      <span className="vault-orb vault-orb-b" />
    </>
  );
}

function NumbersFigure() {
  return (
    <div className="absolute inset-6 grid grid-cols-3 items-end gap-3">
      <span className="vault-number-bar h-24" />
      <span className="vault-number-bar h-32 [animation-delay:0.16s]" />
      <span className="vault-number-bar h-16 [animation-delay:0.32s]" />
      <span className="vault-number-scan col-span-3" />
    </div>
  );
}

function ParticlesFigure() {
  return (
    <>
      {Array.from({ length: 24 }, (_, index) => (
        <span className={`vault-particle vault-particle-${index % 6}`} key={index} />
      ))}
    </>
  );
}

function RevealFigure() {
  return (
    <div className="absolute inset-6 grid content-end gap-3">
      <span className="vault-line-reveal w-8/12" />
      <span className="vault-card-reveal h-16 [animation-delay:0.08s]" />
      <span className="vault-card-reveal h-12 [animation-delay:0.18s]" />
    </div>
  );
}

function ScrollFigure() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="h-36 w-px rounded-full bg-andes-navy/14" />
      <span className="vault-scroll-window absolute h-14 w-28 rounded-lg border border-andes-navy/12 bg-white/80" />
      <span className="vault-scroll-thumb absolute h-4 w-1 rounded-full bg-andes-crimson" />
    </div>
  );
}

function TypeFigure() {
  return (
    <div className="absolute inset-6 grid content-center gap-3">
      <span className="vault-type-mask w-10/12" />
      <span className="vault-type-mask w-7/12 [animation-delay:0.14s]" />
      <span className="vault-type-mask w-9/12 [animation-delay:0.28s]" />
    </div>
  );
}

function ArcFigure() {
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 320 220">
      <path className="vault-arc-draw" d="M44 152 C 98 52, 210 44, 276 128" />
      <circle cx="44" cy="152" fill="var(--color-andes-crimson)" r="5" />
      <circle cx="276" cy="128" fill="var(--color-andes-crimson)" r="5" />
    </svg>
  );
}

function ScrollHintFigure() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="vault-scroll-hint" />
    </div>
  );
}

function FlowFigure() {
  return (
    <div className="absolute inset-6 flex items-center gap-4">
      <span className="vault-flow-node" />
      <span className="vault-flow-line" />
      <span className="vault-flow-node vault-flow-node-hot" />
    </div>
  );
}

function CardsFigure() {
  return (
    <div className="absolute inset-6">
      <span className="vault-card-swap vault-card-swap-a" />
      <span className="vault-card-swap vault-card-swap-b" />
      <span className="vault-card-swap vault-card-swap-c" />
    </div>
  );
}

function ProgressFigure() {
  return (
    <div className="absolute inset-6 grid content-center gap-5">
      <span className="vault-progress-track"><span /></span>
      <span className="vault-progress-track [animation-delay:0.18s]"><span /></span>
      <span className="vault-progress-track [animation-delay:0.36s]"><span /></span>
    </div>
  );
}

function GaugeFigure() {
  return (
    <svg aria-hidden className="absolute inset-0 m-auto size-36" fill="none" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="42" stroke="rgba(15,27,61,0.1)" strokeWidth="10" />
      <circle className="vault-gauge-ring" cx="60" cy="60" r="42" stroke="var(--color-andes-crimson)" strokeLinecap="round" strokeWidth="10" />
      <circle cx="60" cy="60" fill="rgba(15,27,61,0.08)" r="18" />
    </svg>
  );
}

function MorphFigure() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="vault-morph-blob" />
      <span className="vault-morph-card" />
    </div>
  );
}

function TimelineFigure() {
  return (
    <div className="absolute inset-6 flex items-center">
      <span className="vault-timeline-line" />
      <span className="vault-timeline-dot left-[12%]" />
      <span className="vault-timeline-dot left-[38%]" />
      <span className="vault-timeline-dot left-[64%]" />
      <span className="vault-timeline-dot left-[88%]" />
      <span className="vault-timeline-playhead" />
    </div>
  );
}

function TriggerFigure() {
  return (
    <div className="absolute inset-6 grid grid-cols-[0.18fr_1fr] gap-4">
      <span className="vault-trigger-rail" />
      <span className="vault-trigger-stage">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function PathFigure() {
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 320 220">
      <path className="vault-path-dash" d="M36 146 C 88 104, 122 172, 174 116 S 238 54, 286 90" />
      <circle className="vault-path-dot" cx="0" cy="0" fill="var(--color-andes-crimson)" r="6" />
    </svg>
  );
}

function SvgMorphFigure() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="vault-svg-draw" />
      <span className="vault-svg-node" />
    </div>
  );
}

function FluidFigure() {
  return (
    <>
      <span className="vault-fluid-blob vault-fluid-blob-a" />
      <span className="vault-fluid-blob vault-fluid-blob-b" />
      <span className="vault-fluid-blob vault-fluid-blob-c" />
      <span className="vault-fluid-cursor" />
    </>
  );
}

function TerrainFigure() {
  return (
    <>
      <span className="vault-terrain-layer vault-terrain-back" />
      <span className="vault-terrain-layer vault-terrain-mid" />
      <span className="vault-terrain-layer vault-terrain-front" />
      <span className="vault-terrain-sun" />
    </>
  );
}

function FogFigure() {
  return (
    <>
      <span className="vault-fog-band vault-fog-band-a" />
      <span className="vault-fog-band vault-fog-band-b" />
      <span className="vault-fog-band vault-fog-band-c" />
      <span className="vault-depth-peak" />
    </>
  );
}

function CameraFigure() {
  return (
    <div className="absolute inset-0 perspective-dramatic">
      <span className="vault-camera-road" />
      <span className="vault-camera-frame vault-camera-frame-a" />
      <span className="vault-camera-frame vault-camera-frame-b" />
      <span className="vault-camera-frame vault-camera-frame-c" />
    </div>
  );
}

function DepthFigure() {
  return (
    <>
      <span className="vault-depth-card vault-depth-card-back" />
      <span className="vault-depth-card vault-depth-card-mid" />
      <span className="vault-depth-card vault-depth-card-front" />
    </>
  );
}

function FilmFigure() {
  return (
    <div className="absolute inset-6 overflow-hidden rounded-lg border border-andes-navy/10 bg-white/70">
      <span className="vault-film-strip">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="vault-film-progress" />
    </div>
  );
}

function MarqueeFigure() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <span className="vault-marquee-row">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function ObjectFigure() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="vault-orbit-ring" />
      <span className="vault-object-cube" />
      <span className="vault-object-cursor" />
    </div>
  );
}

function GuardFigure() {
  return (
    <div className="absolute inset-6 grid content-center gap-3">
      <span className="vault-guard-panel">
        <span className="vault-guard-scan" />
      </span>
      <span className="vault-guard-chip w-7/12" />
      <span className="vault-guard-chip w-10/12 [animation-delay:0.18s]" />
    </div>
  );
}

function GalleryAnimationStyles() {
  return (
    <style>{`
      .vault-preview::before {
        background:
          radial-gradient(circle at 20% 18%, color-mix(in oklab, var(--color-andes-crimson) 16%, transparent), transparent 28%),
          linear-gradient(135deg, rgba(15, 27, 61, 0.04), transparent 54%);
        content: "";
        inset: 0;
        pointer-events: none;
        position: absolute;
      }

      .vault-preview-dark {
        background: var(--color-andes-deep);
      }

      .vault-preview-gsap {
        background: linear-gradient(135deg, var(--color-andes-paper), rgba(232, 62, 92, 0.08));
      }

      .vault-preview-guard {
        background: linear-gradient(135deg, #fff, var(--color-andes-paper));
      }

      .vault-path-soft {
        stroke: rgba(250, 250, 247, 0.24);
        stroke-width: 1.4;
      }

      .vault-node,
      .vault-node-core {
        border: 1px solid rgba(250, 250, 247, 0.18);
        border-radius: 12px;
        height: 34px;
        position: absolute;
        width: 50px;
      }

      .vault-node {
        background: rgba(250, 250, 247, 0.07);
      }

      .vault-node-core {
        background: var(--color-andes-crimson);
        border-color: rgba(250, 250, 247, 0.2);
        height: 44px;
        transform: translate(-50%, -50%);
        width: 62px;
      }

      .vault-orb {
        background: var(--color-andes-paper);
        border-radius: 999px;
        box-shadow: 0 0 18px rgba(250, 250, 247, 0.72);
        height: 6px;
        position: absolute;
        width: 6px;
      }

      .vault-orb-a {
        animation: vault-orb-a 2.8s var(--ease-andes) infinite;
      }

      .vault-orb-b {
        animation: vault-orb-b 3.1s var(--ease-andes) 0.45s infinite;
      }

      @keyframes vault-orb-a {
        0% { opacity: 0; transform: translate(58px, 62px); }
        25% { opacity: 1; }
        55% { opacity: 1; transform: translate(160px, 112px); }
        100% { opacity: 0; transform: translate(282px, 82px); }
      }

      @keyframes vault-orb-b {
        0% { opacity: 0; transform: translate(58px, 156px); }
        25% { opacity: 1; }
        55% { opacity: 1; transform: translate(160px, 112px); }
        100% { opacity: 0; transform: translate(282px, 150px); }
      }

      .vault-number-bar {
        animation: vault-rise 2.2s var(--ease-andes) infinite;
        background: linear-gradient(180deg, var(--color-andes-crimson), rgba(15, 27, 61, 0.85));
        border-radius: 12px 12px 4px 4px;
        transform-origin: bottom;
      }

      .vault-number-scan {
        animation: vault-slide-x 2.6s var(--ease-andes) infinite;
        background: var(--color-andes-crimson);
        border-radius: 999px;
        height: 5px;
        width: 46%;
      }

      @keyframes vault-rise {
        0%, 100% { opacity: 0.45; transform: scaleY(0.38); }
        45%, 70% { opacity: 1; transform: scaleY(1); }
      }

      @keyframes vault-slide-x {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(108%); }
      }

      .vault-particle {
        animation: vault-float 5s ease-in-out infinite;
        background: rgba(250, 250, 247, 0.64);
        border-radius: 999px;
        height: 3px;
        position: absolute;
        width: 3px;
      }

      .vault-particle-0 { left: 12%; top: 26%; }
      .vault-particle-1 { animation-delay: 0.2s; left: 28%; top: 68%; }
      .vault-particle-2 { animation-delay: 0.4s; left: 42%; top: 38%; }
      .vault-particle-3 { animation-delay: 0.6s; left: 64%; top: 74%; }
      .vault-particle-4 { animation-delay: 0.8s; left: 78%; top: 24%; }
      .vault-particle-5 { animation-delay: 1s; left: 88%; top: 56%; }

      @keyframes vault-float {
        0%, 100% { opacity: 0.24; transform: translate3d(0, 0, 0); }
        50% { opacity: 0.9; transform: translate3d(12px, -18px, 0); }
      }

      .vault-line-reveal,
      .vault-card-reveal,
      .vault-type-mask {
        animation: vault-reveal 2.5s var(--ease-andes) infinite;
        background: var(--color-andes-navy);
        border-radius: 10px;
        transform-origin: bottom;
      }

      .vault-line-reveal {
        height: 10px;
      }

      .vault-card-reveal {
        background: rgba(15, 27, 61, 0.12);
      }

      .vault-type-mask {
        height: 22px;
      }

      @keyframes vault-reveal {
        0%, 100% { opacity: 0; transform: translateY(18px); }
        35%, 78% { opacity: 1; transform: translateY(0); }
      }

      .vault-scroll-window {
        animation: vault-scroll-window 3.2s var(--ease-andes) infinite;
      }

      .vault-scroll-thumb {
        animation: vault-scroll-thumb 3.2s var(--ease-andes) infinite;
      }

      @keyframes vault-scroll-window {
        0%, 100% { transform: translateY(-34px); }
        50% { transform: translateY(34px); }
      }

      @keyframes vault-scroll-thumb {
        0%, 100% { transform: translate(54px, -58px); }
        50% { transform: translate(54px, 58px); }
      }

      .vault-arc-draw {
        animation: vault-draw 2.7s var(--ease-andes) infinite;
        stroke: rgba(15, 27, 61, 0.62);
        stroke-dasharray: 360;
        stroke-dashoffset: 360;
        stroke-linecap: round;
        stroke-width: 2;
      }

      @keyframes vault-draw {
        0% { stroke-dashoffset: 360; }
        55%, 100% { stroke-dashoffset: 0; }
      }

      .vault-scroll-hint {
        animation: vault-hint 2.2s var(--ease-andes) infinite;
        background: var(--color-andes-crimson);
        border-radius: 999px;
        height: 108px;
        transform-origin: top;
        width: 2px;
      }

      @keyframes vault-hint {
        0%, 100% { opacity: 0.3; transform: scaleY(0.32); }
        50% { opacity: 1; transform: scaleY(1); }
      }

      .vault-flow-node {
        background: rgba(15, 27, 61, 0.08);
        border: 1px solid rgba(15, 27, 61, 0.12);
        border-radius: 12px;
        height: 48px;
        width: 48px;
      }

      .vault-flow-node-hot {
        animation: vault-pulse 2.2s var(--ease-andes) infinite;
        background: color-mix(in oklab, var(--color-andes-crimson) 18%, transparent);
      }

      .vault-flow-line {
        animation: vault-dash 2.4s linear infinite;
        background: repeating-linear-gradient(90deg, rgba(15, 27, 61, 0.48) 0 7px, transparent 7px 17px);
        height: 1px;
        min-width: 0;
        flex: 1;
      }

      @keyframes vault-dash {
        to { background-position: 34px 0; }
      }

      @keyframes vault-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }

      .vault-card-swap {
        animation: vault-card-swap 4s var(--ease-andes) infinite;
        background: rgba(15, 27, 61, 0.1);
        border: 1px solid rgba(15, 27, 61, 0.12);
        border-radius: 14px;
        height: 76px;
        position: absolute;
        width: 118px;
      }

      .vault-card-swap-a { left: 6%; top: 14%; }
      .vault-card-swap-b { animation-delay: 0.18s; right: 7%; top: 28%; }
      .vault-card-swap-c { animation-delay: 0.36s; left: 33%; bottom: 12%; }

      @keyframes vault-card-swap {
        0%, 100% { opacity: 0.48; transform: translate3d(0, 14px, 0) scale(0.96); }
        45%, 70% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }

      .vault-progress-track {
        background: rgba(15, 27, 61, 0.1);
        border-radius: 999px;
        height: 10px;
        overflow: hidden;
      }

      .vault-progress-track span {
        animation: vault-progress 2.8s var(--ease-andes) infinite;
        background: var(--color-andes-crimson);
        border-radius: inherit;
        display: block;
        height: 100%;
        transform-origin: left;
      }

      @keyframes vault-progress {
        0%, 100% { transform: scaleX(0.18); }
        58%, 78% { transform: scaleX(0.94); }
      }

      .vault-gauge-ring {
        animation: vault-gauge 3s var(--ease-andes) infinite;
        stroke-dasharray: 264;
        stroke-dashoffset: 180;
        transform: rotate(-90deg);
        transform-origin: center;
      }

      @keyframes vault-gauge {
        0%, 100% { stroke-dashoffset: 214; }
        55%, 78% { stroke-dashoffset: 72; }
      }

      .vault-morph-blob,
      .vault-svg-draw {
        animation: vault-morph 3.4s var(--ease-andes) infinite;
        background: color-mix(in oklab, var(--color-andes-crimson) 76%, var(--color-andes-navy));
        height: 92px;
        position: absolute;
        width: 132px;
      }

      .vault-morph-card {
        animation: vault-card-outline 3.4s var(--ease-andes) infinite;
        border: 1px solid rgba(15, 27, 61, 0.16);
        border-radius: 16px;
        height: 118px;
        position: absolute;
        width: 178px;
      }

      @keyframes vault-morph {
        0%, 100% { border-radius: 22px 54px 34px 44px; transform: rotate(-6deg) scale(0.88); }
        50% { border-radius: 64px 28px 58px 24px; transform: rotate(7deg) scale(1); }
      }

      @keyframes vault-card-outline {
        0%, 100% { transform: scale(0.92); }
        50% { transform: scale(1); }
      }

      .vault-timeline-line {
        background: rgba(15, 27, 61, 0.12);
        height: 2px;
        position: absolute;
        width: 100%;
      }

      .vault-timeline-dot,
      .vault-timeline-playhead {
        border-radius: 999px;
        position: absolute;
        top: 50%;
      }

      .vault-timeline-dot {
        background: rgba(15, 27, 61, 0.22);
        height: 14px;
        transform: translate(-50%, -50%);
        width: 14px;
      }

      .vault-timeline-playhead {
        animation: vault-playhead 3.2s var(--ease-andes) infinite;
        background: var(--color-andes-crimson);
        height: 18px;
        transform: translate(-50%, -50%);
        width: 18px;
      }

      @keyframes vault-playhead {
        0%, 100% { left: 12%; }
        34% { left: 38%; }
        62% { left: 64%; }
        86% { left: 88%; }
      }

      .vault-trigger-rail {
        background: linear-gradient(180deg, rgba(15, 27, 61, 0.1), var(--color-andes-crimson), rgba(15, 27, 61, 0.1));
        border-radius: 999px;
        width: 4px;
      }

      .vault-trigger-stage {
        animation: vault-trigger-stage 3.4s var(--ease-andes) infinite;
        align-self: center;
        display: grid;
        gap: 12px;
      }

      .vault-trigger-stage span {
        background: rgba(15, 27, 61, 0.1);
        border-radius: 12px;
        display: block;
        height: 32px;
      }

      @keyframes vault-trigger-stage {
        0%, 100% { transform: translateY(22px); }
        50% { transform: translateY(-22px); }
      }

      .vault-path-dash {
        animation: vault-draw 3.2s var(--ease-andes) infinite;
        stroke: rgba(15, 27, 61, 0.42);
        stroke-dasharray: 380;
        stroke-dashoffset: 380;
        stroke-linecap: round;
        stroke-width: 2;
      }

      .vault-path-dot {
        animation: vault-path-dot 3.2s var(--ease-andes) infinite;
      }

      @keyframes vault-path-dot {
        0% { opacity: 0; transform: translate(36px, 146px); }
        20% { opacity: 1; }
        52% { transform: translate(174px, 116px); }
        100% { opacity: 0; transform: translate(286px, 90px); }
      }

      .vault-svg-node {
        animation: vault-pulse 2.4s var(--ease-andes) infinite;
        background: var(--color-andes-paper);
        border: 8px solid var(--color-andes-crimson);
        border-radius: 999px;
        height: 48px;
        position: absolute;
        width: 48px;
      }

      .vault-fluid-blob {
        animation: vault-fluid 5.4s ease-in-out infinite;
        border-radius: 999px;
        filter: blur(22px);
        opacity: 0.74;
        position: absolute;
      }

      .vault-fluid-blob-a {
        background: rgba(250, 250, 247, 0.62);
        height: 150px;
        left: 12%;
        top: 18%;
        width: 150px;
      }

      .vault-fluid-blob-b {
        animation-delay: 0.6s;
        background: rgba(200, 16, 46, 0.42);
        height: 120px;
        right: 18%;
        top: 28%;
        width: 120px;
      }

      .vault-fluid-blob-c {
        animation-delay: 1s;
        background: rgba(255, 138, 60, 0.22);
        bottom: 12%;
        height: 130px;
        left: 36%;
        width: 130px;
      }

      .vault-fluid-cursor {
        animation: vault-orbit-small 4s var(--ease-andes) infinite;
        background: var(--color-andes-paper);
        border-radius: 999px;
        height: 8px;
        left: 50%;
        position: absolute;
        top: 50%;
        width: 8px;
      }

      @keyframes vault-fluid {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(22px, -18px, 0) scale(1.12); }
      }

      @keyframes vault-orbit-small {
        0%, 100% { transform: translate(-70px, -34px); }
        50% { transform: translate(62px, 36px); }
      }

      .vault-terrain-layer {
        bottom: 0;
        clip-path: polygon(0 100%, 0 54%, 18% 38%, 34% 58%, 52% 28%, 72% 62%, 100% 34%, 100% 100%);
        position: absolute;
        width: 112%;
      }

      .vault-terrain-back {
        animation: vault-terrain 6s ease-in-out infinite;
        background: rgba(250, 250, 247, 0.18);
        height: 58%;
        left: -4%;
      }

      .vault-terrain-mid {
        animation: vault-terrain 5s ease-in-out 0.4s infinite;
        background: rgba(250, 250, 247, 0.28);
        height: 45%;
        left: -8%;
      }

      .vault-terrain-front {
        animation: vault-terrain 4.6s ease-in-out 0.8s infinite;
        background: rgba(15, 27, 61, 0.62);
        height: 34%;
        left: -2%;
      }

      .vault-terrain-sun {
        background: var(--color-andes-crimson);
        border-radius: 999px;
        height: 16px;
        position: absolute;
        right: 16%;
        top: 22%;
        width: 16px;
      }

      @keyframes vault-terrain {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-12px); }
      }

      .vault-fog-band {
        animation: vault-fog 5s ease-in-out infinite;
        background: rgba(250, 250, 247, 0.2);
        border-radius: 999px;
        filter: blur(10px);
        height: 28px;
        left: -10%;
        position: absolute;
        width: 120%;
      }

      .vault-fog-band-a { top: 26%; }
      .vault-fog-band-b { animation-delay: 0.6s; top: 48%; }
      .vault-fog-band-c { animation-delay: 1s; top: 66%; }
      .vault-depth-peak {
        background: rgba(250, 250, 247, 0.16);
        bottom: 0;
        clip-path: polygon(0 100%, 28% 28%, 50% 100%);
        height: 82%;
        left: 22%;
        position: absolute;
        width: 72%;
      }

      @keyframes vault-fog {
        0%, 100% { opacity: 0.28; transform: translateX(-24px); }
        50% { opacity: 0.64; transform: translateX(24px); }
      }

      .perspective-dramatic {
        perspective: 520px;
      }

      .vault-camera-road {
        background: linear-gradient(180deg, rgba(15, 27, 61, 0.08), rgba(15, 27, 61, 0.22));
        clip-path: polygon(46% 0, 54% 0, 82% 100%, 18% 100%);
        inset: 22px 0 0;
        position: absolute;
      }

      .vault-camera-frame {
        animation: vault-camera 3.6s var(--ease-andes) infinite;
        border: 1px solid rgba(15, 27, 61, 0.16);
        border-radius: 12px;
        height: 42px;
        left: 50%;
        position: absolute;
        top: 20%;
        transform: translateX(-50%);
        width: 76px;
      }

      .vault-camera-frame-b { animation-delay: 0.45s; top: 42%; }
      .vault-camera-frame-c { animation-delay: 0.9s; top: 64%; }

      @keyframes vault-camera {
        0%, 100% { opacity: 0.3; transform: translateX(-50%) translateZ(-40px) scale(0.72); }
        50% { opacity: 1; transform: translateX(-50%) translateZ(40px) scale(1.08); }
      }

      .vault-depth-card {
        border-radius: 16px;
        position: absolute;
      }

      .vault-depth-card-back {
        animation: vault-depth 4s var(--ease-andes) infinite;
        background: rgba(15, 27, 61, 0.08);
        filter: blur(6px);
        height: 68px;
        left: 18%;
        top: 24%;
        width: 124px;
      }

      .vault-depth-card-mid {
        animation: vault-depth 4s var(--ease-andes) 0.3s infinite;
        background: rgba(15, 27, 61, 0.12);
        filter: blur(2px);
        height: 82px;
        right: 14%;
        top: 34%;
        width: 136px;
      }

      .vault-depth-card-front {
        animation: vault-depth 4s var(--ease-andes) 0.6s infinite;
        background: var(--color-andes-crimson);
        bottom: 20%;
        height: 56px;
        left: 34%;
        width: 102px;
      }

      @keyframes vault-depth {
        0%, 100% { transform: translateY(12px) scale(0.96); }
        50% { transform: translateY(0) scale(1); }
      }

      .vault-film-strip {
        animation: vault-film 4.2s linear infinite;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(4, 116px);
        inset: 18px auto auto 14px;
        position: absolute;
      }

      .vault-film-strip span {
        background: rgba(15, 27, 61, 0.1);
        border-radius: 12px;
        height: 98px;
      }

      .vault-film-progress {
        animation: vault-progress 4.2s linear infinite;
        background: var(--color-andes-crimson);
        bottom: 18px;
        height: 4px;
        left: 14px;
        position: absolute;
        transform-origin: left;
        width: calc(100% - 28px);
      }

      @keyframes vault-film {
        to { transform: translateX(-126px); }
      }

      .vault-marquee-row {
        animation: vault-marquee 5.5s linear infinite;
        display: flex;
        gap: 12px;
        width: max-content;
      }

      .vault-marquee-row span {
        background: rgba(15, 27, 61, 0.1);
        border: 1px solid rgba(15, 27, 61, 0.12);
        border-radius: 999px;
        height: 42px;
        width: 108px;
      }

      @keyframes vault-marquee {
        to { transform: translateX(-120px); }
      }

      .vault-orbit-ring {
        animation: vault-orbit-ring 3.8s linear infinite;
        border: 1px solid rgba(15, 27, 61, 0.18);
        border-radius: 999px;
        height: 132px;
        transform: rotateX(62deg);
        width: 132px;
      }

      .vault-object-cube {
        animation: vault-cube 3.8s var(--ease-andes) infinite;
        background: linear-gradient(135deg, var(--color-andes-crimson), rgba(15, 27, 61, 0.86));
        border-radius: 18px;
        height: 68px;
        position: absolute;
        width: 68px;
      }

      .vault-object-cursor {
        animation: vault-orbit-small 3.8s var(--ease-andes) infinite;
        background: var(--color-andes-navy);
        border-radius: 999px;
        height: 8px;
        position: absolute;
        width: 8px;
      }

      @keyframes vault-orbit-ring {
        to { transform: rotateX(62deg) rotateZ(360deg); }
      }

      @keyframes vault-cube {
        0%, 100% { transform: rotate(-8deg) scale(0.92); }
        50% { transform: rotate(9deg) scale(1.05); }
      }

      .vault-guard-panel {
        background: rgba(15, 27, 61, 0.08);
        border: 1px solid rgba(15, 27, 61, 0.12);
        border-radius: 16px;
        height: 86px;
        overflow: hidden;
        position: relative;
      }

      .vault-guard-scan {
        animation: vault-scan 2.7s var(--ease-andes) infinite;
        background: linear-gradient(90deg, transparent, rgba(200, 16, 46, 0.48), transparent);
        height: 100%;
        left: -40%;
        position: absolute;
        top: 0;
        width: 40%;
      }

      .vault-guard-chip {
        animation: vault-reveal 2.8s var(--ease-andes) infinite;
        background: rgba(15, 27, 61, 0.14);
        border-radius: 999px;
        height: 10px;
      }

      @keyframes vault-scan {
        to { left: 108%; }
      }

      @media (prefers-reduced-motion: reduce) {
        .vault-preview *,
        .vault-preview *::before,
        .vault-preview *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `}</style>
  );
}
