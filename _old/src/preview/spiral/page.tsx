import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { IridescentCentrepiece } from "@/components/cinematic/IridescentCentrepiece";
import { SpiralGallery3D, type SpiralPanel } from "@/components/cinematic/SpiralGallery3D";
import { VideoScrubLayer } from "@/components/cinematic/VideoScrubLayer";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  description: "Internal preview — spiral panel gallery (Active Theory style).",
  robots: { follow: false, index: false },
  title: "Spiral (Claude preview) — Andes",
};

export default async function SpiralPreviewPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  setRequestLocale(locale);

  const hero = await getTranslations({ locale, namespace: "home.hero" });
  const cinematic = await getTranslations({ locale, namespace: "home.cinematic" });
  const portfolio = await getTranslations({ locale, namespace: "home.portfolio" });
  const about = await getTranslations({ locale, namespace: "about" });
  const careers = await getTranslations({ locale, namespace: "careers" });
  const press = await getTranslations({ locale, namespace: "press" });
  const footerCta = await getTranslations({ locale, namespace: "home.footer_cta" });

  const panels: SpiralPanel[] = [
    {
      accent: "#FFB37A",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{hero("line1")}</p>
          <p>{hero("line2")}</p>
          <p className="text-andes-paper/65">{hero("line3")}</p>
        </div>
      ),
      id: "hero",
      preview: hero("line3"),
      tag: "Overture",
      title: hero("line1"),
    },
    {
      accent: "#E4B870",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{cinematic("whyNow.subtitle")}</p>
          <ol className="mt-2 flex flex-col gap-5 border-l border-andes-paper/15 pl-6">
            <li>
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/55">01</span>
              <p className="mt-1">{cinematic("whyNow.points.one")}</p>
            </li>
            <li>
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/55">02</span>
              <p className="mt-1">{cinematic("whyNow.points.two")}</p>
            </li>
            <li>
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/55">03</span>
              <p className="mt-1">{cinematic("whyNow.points.three")}</p>
            </li>
          </ol>
        </div>
      ),
      id: "why",
      preview: cinematic("whyNow.subtitle"),
      tag: "Why now",
      title: cinematic("whyNow.title"),
    },
    {
      accent: "#5EEAA6",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{about("two_layer.lead")}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-5">
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/65">
                {about("two_layer.layer1.tag")}
              </span>
              <h3 className="mt-2 font-jp text-[18px] font-semibold text-andes-paper">
                {about("two_layer.layer1.title")}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-andes-paper/72">
                {about("two_layer.layer1.body")}
              </p>
            </article>
            <article className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-5">
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--color-andes-teal)]">
                {about("two_layer.layer2.tag")}
              </span>
              <h3 className="mt-2 font-jp text-[18px] font-semibold text-andes-paper">
                {about("two_layer.layer2.title")}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-andes-paper/72">
                {about("two_layer.layer2.body")}
              </p>
            </article>
          </div>
        </div>
      ),
      id: "company",
      preview: about("two_layer.lead"),
      tag: "Company",
      title: about("two_layer.title"),
    },
    {
      accent: "#FF6B6B",
      content: (
        <div className="flex flex-col gap-5 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{portfolio("lead")}</p>
          {(["jplanet", "jvita", "protocol"] as const).map((key) => (
            <article className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-5" key={key}>
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/65">
                {portfolio(`${key}.tag`)}
              </span>
              <h3 className="mt-2 font-jp text-[18px] font-semibold text-andes-paper">
                {portfolio(`${key}.title`)}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-andes-paper/72">
                {portfolio(`${key}.desc`)}
              </p>
            </article>
          ))}
        </div>
      ),
      id: "services",
      preview: portfolio("lead"),
      tag: "Services",
      title: portfolio("title"),
    },
    {
      accent: "#B57BE0",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{about("phase.lead")}</p>
          <ol className="grid gap-4 lg:grid-cols-5">
            {(["p1", "p2", "p3", "p4", "endgame"] as const).map((key, index) => (
              <li className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-4" key={key}>
                <span className="font-display text-[10px] uppercase tracking-[0.2em] text-andes-paper/55">
                  Phase {index + 1}
                </span>
                <p className="mt-2 font-display text-[20px] font-light text-andes-paper">
                  {about(`phase.${key}.year`)}
                </p>
                <p className="mt-2 text-[13px] leading-[1.5] text-andes-paper/70">
                  {about(`phase.${key}.title`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ),
      id: "roadmap",
      preview: about("phase.lead"),
      tag: "Roadmap",
      title: about("phase.title"),
    },
    {
      accent: "#14F195",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{cinematic("protocol.subtitle")}</p>
          <p className="font-display text-[18px] italic text-[var(--color-andes-teal)]">
            {cinematic("protocol.vision")}
          </p>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(["one", "two", "three", "andes"] as const).map((key) => (
              <li
                className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 px-4 py-3 text-center font-display text-[12px] uppercase tracking-[0.18em] text-andes-paper/85"
                key={key}
              >
                {cinematic(`protocol.nodes.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      ),
      id: "endgame",
      preview: cinematic("protocol.subtitle"),
      tag: "Endgame",
      title: cinematic("protocol.title"),
    },
    {
      accent: "#FF8A3C",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{careers("who.body")}</p>
          <article className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-5">
            <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/65">
              {careers("open.engineer.lead")}
            </span>
            <h3 className="mt-2 font-jp text-[18px] font-semibold text-andes-paper">
              {careers("open.engineer.title")}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-andes-paper/72">
              {careers("open.engineer.body")}
            </p>
          </article>
          <a
            className="inline-flex w-fit items-center gap-2 rounded-full border border-andes-paper/30 px-5 py-3 font-display text-[12px] uppercase tracking-[0.18em] text-andes-paper transition hover:border-andes-paper hover:bg-andes-paper/10"
            href={`mailto:${careers("contact.email")}`}
          >
            {careers("contact.cta")} <span aria-hidden>→</span>
          </a>
        </div>
      ),
      id: "careers",
      preview: careers("who.body"),
      tag: "Careers",
      title: careers("hero.title"),
    },
    {
      accent: "#A7C7FF",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <article className="rounded-2xl border border-andes-paper/15 bg-andes-paper/5 p-5">
            <span className="font-display text-[11px] uppercase tracking-[0.2em] text-andes-paper/65">
              {press("upcoming.title")}
            </span>
            <h3 className="mt-2 font-jp text-[18px] font-semibold text-andes-paper">
              {press("upcoming.ivs.title")}
            </h3>
            <p className="mt-2 text-[14px] text-andes-paper/72">{press("upcoming.ivs.date")}</p>
            <p className="text-[14px] text-andes-paper/72">{press("upcoming.ivs.venue")}</p>
            <p className="mt-2 text-[14px] text-andes-paper/85">{press("upcoming.ivs.theme")}</p>
            <p className="text-[14px] text-andes-paper/85">{press("upcoming.ivs.speaker")}</p>
          </article>
          <a
            className="inline-flex w-fit items-center gap-2 rounded-full border border-andes-paper/30 px-5 py-3 font-display text-[12px] uppercase tracking-[0.18em] text-andes-paper transition hover:border-andes-paper hover:bg-andes-paper/10"
            href={`mailto:${press("kit.contact")}`}
          >
            {press("kit.cta")} <span aria-hidden>→</span>
          </a>
        </div>
      ),
      id: "press",
      preview: press("hero.lead"),
      tag: "Press",
      title: press("hero.title"),
    },
    {
      accent: "#FAFAF7",
      content: (
        <div className="flex flex-col gap-6 font-jp text-[15px] leading-[1.7] text-andes-paper/85 sm:text-[17px]">
          <p>{footerCta("desc")}</p>
          <a
            className="inline-flex w-fit items-center gap-2 rounded-full bg-andes-paper px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-andes-deep transition hover:bg-andes-paper/90"
            href={`/${locale}/contact`}
          >
            {footerCta("button")} <span aria-hidden>→</span>
          </a>
        </div>
      ),
      id: "contact",
      preview: footerCta("desc"),
      tag: "Contact",
      title: footerCta("title"),
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-andes-paper">
      <VideoScrubLayer opacity={0.65} src="/video/brazil-hero.mp4" veil={0.55} />
      <IridescentCentrepiece />
      <div className="relative z-10">
        <SpiralGallery3D panels={panels} />
      </div>
    </main>
  );
}
