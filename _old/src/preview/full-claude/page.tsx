import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Chapter1Overture } from "@/components/chapters/Chapter1Overture";
import { Chapter2WhyNowClaude } from "@/components/chapters/Chapter2WhyNowClaude";
import { Chapter3TwoLayerClaude } from "@/components/chapters/Chapter3TwoLayerClaude";
import { Chapter4BusinessesClaude } from "@/components/chapters/Chapter4BusinessesClaude";
import { Chapter5RoadmapClaude } from "@/components/chapters/Chapter5RoadmapClaude";
import { Chapter6ProtocolClaude } from "@/components/chapters/Chapter6ProtocolClaude";
import { Chapter7GroupCtaClaude } from "@/components/chapters/Chapter7GroupCtaClaude";
import { IridescentCentrepiece } from "@/components/cinematic/IridescentCentrepiece";
import { VideoScrubLayer } from "@/components/cinematic/VideoScrubLayer";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  description: "Internal preview route — Full cinematic story Claude version.",
  robots: { follow: false, index: false },
  title: "Full story (Claude preview) — Andes",
};

export default async function FullClaudePreviewPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  setRequestLocale(locale);
  const hero = await getTranslations({ locale, namespace: "home.hero" });
  const cinematic = await getTranslations({ locale, namespace: "home.cinematic" });
  const portfolio = await getTranslations({ locale, namespace: "home.portfolio" });
  const about = await getTranslations({ locale, namespace: "about" });
  const footerCta = await getTranslations({ locale, namespace: "home.footer_cta" });

  return (
    <main id="main" className="relative bg-black">
      <VideoScrubLayer opacity={1} src="/video/brazil-hero.mp4" veil={0.45} />
      <IridescentCentrepiece />
      <div className="relative z-10">
      <Chapter1Overture
        copy={{
          ctaPrimary: hero("cta_primary"),
          ctaSecondary: hero("cta_secondary"),
          line1: hero("line1"),
          line2: hero("line2"),
          line3: hero("line3"),
        }}
        locale={locale}
      />
      <Chapter2WhyNowClaude
        copy={{
          eyebrow: cinematic("whyNow.title"),
          points: [
            cinematic("whyNow.points.one"),
            cinematic("whyNow.points.two"),
            cinematic("whyNow.points.three"),
          ],
          subtitle: cinematic("whyNow.subtitle"),
        }}
      />
      <Chapter3TwoLayerClaude
        copy={{
          layer1Body: about("two_layer.layer1.body"),
          layer1Tag: about("two_layer.layer1.tag"),
          layer1Title: about("two_layer.layer1.title"),
          layer2Body: about("two_layer.layer2.body"),
          layer2Tag: about("two_layer.layer2.tag"),
          layer2Title: about("two_layer.layer2.title"),
          subtitle: about("two_layer.lead"),
          title: about("two_layer.title"),
        }}
      />
      <Chapter4BusinessesClaude
        copy={{
          items: [
            {
              accent: "red",
              body: portfolio("jplanet.desc"),
              cta: portfolio("jplanet.cta"),
              href: "/businesses",
              tag: portfolio("jplanet.tag"),
              title: portfolio("jplanet.title"),
              visual: "whatsapp",
            },
            {
              accent: "coral",
              body: portfolio("jvita.desc"),
              cta: portfolio("jvita.cta"),
              href: "/businesses",
              tag: portfolio("jvita.tag"),
              title: portfolio("jvita.title"),
              visual: "bottle",
            },
            {
              accent: "navy",
              body: portfolio("protocol.desc"),
              cta: portfolio("protocol.cta"),
              href: "/about",
              tag: portfolio("protocol.tag"),
              title: portfolio("protocol.title"),
              visual: "network",
            },
          ],
          lead: portfolio("lead"),
          title: portfolio("title"),
        }}
        locale={locale}
      />
      <Chapter5RoadmapClaude
        copy={{
          lead: about("phase.lead"),
          phases: [
            {
              body: cinematic("roadmap.p1.body"),
              title: about("phase.p1.title"),
              year: about("phase.p1.year"),
            },
            {
              body: cinematic("roadmap.p2.body"),
              title: about("phase.p2.title"),
              year: about("phase.p2.year"),
            },
            {
              body: cinematic("roadmap.p3.body"),
              title: about("phase.p3.title"),
              year: about("phase.p3.year"),
            },
            {
              body: cinematic("roadmap.p4.body"),
              title: about("phase.p4.title"),
              year: about("phase.p4.year"),
            },
            {
              body: cinematic("roadmap.endgame.body"),
              title: about("phase.endgame.title"),
              year: about("phase.endgame.year"),
            },
          ],
          title: about("phase.title"),
        }}
      />
      <Chapter6ProtocolClaude
        copy={{
          nodes: [
            cinematic("protocol.nodes.one"),
            cinematic("protocol.nodes.two"),
            cinematic("protocol.nodes.three"),
            cinematic("protocol.nodes.andes"),
          ],
          subtitle: cinematic("protocol.subtitle"),
          title: cinematic("protocol.title"),
          vision: cinematic("protocol.vision"),
        }}
      />
      <Chapter7GroupCtaClaude
        copy={{
          contactDesc: footerCta("desc"),
          contactTitle: footerCta("title"),
          cta: footerCta("button"),
          groupDesc: cinematic("group.desc"),
          groupTitle: cinematic("group.title"),
          nodes: [
            cinematic("group.nodes.one"),
            cinematic("group.nodes.two"),
            cinematic("group.nodes.three"),
            cinematic("group.nodes.four"),
          ],
          windows: [
            cinematic("contact.windows.investors"),
            cinematic("contact.windows.careers"),
            cinematic("contact.windows.press"),
            cinematic("contact.windows.partners"),
          ],
        }}
        locale={locale}
      />
      </div>
    </main>
  );
}
