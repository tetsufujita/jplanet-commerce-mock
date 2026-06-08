import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentShowcaseSticky } from "@/components/v2/AgentShowcaseSticky";
import { BigTaglineV2 } from "@/components/v2/BigTaglineV2";
import { BusinessFeatureV2 } from "@/components/v2/BusinessFeatureV2";
import { CareersV2 } from "@/components/v2/CareersV2";
import { CompanyV2 } from "@/components/v2/CompanyV2";
import { ContactCtaV2 } from "@/components/v2/ContactCtaV2";
import { FooterV2 } from "@/components/v2/FooterV2";
import { HeroV3 } from "@/components/v2/HeroV3";
import { NavV2 } from "@/components/v2/NavV2";
import { NewsV2 } from "@/components/v2/NewsV2";
import { SolutionsV2 } from "@/components/v2/SolutionsV2";
import { isLocale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  description: "Internal preview — v3 build (Revolut-style hero + sticky agent showcase).",
  robots: { follow: false, index: false },
  title: "Andes v3 (preview)",
};

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;

export default async function V3PreviewPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  setRequestLocale(locale);

  const nav = await getTranslations({ locale, namespace: "nav" });
  const hero = await getTranslations({ locale, namespace: "home.hero" });
  const portfolio = await getTranslations({ locale, namespace: "home.portfolio" });
  const about = await getTranslations({ locale, namespace: "about" });
  const businesses = await getTranslations({ locale, namespace: "businesses" });
  const careers = await getTranslations({ locale, namespace: "careers" });
  const press = await getTranslations({ locale, namespace: "press" });
  const footerCta = await getTranslations({ locale, namespace: "home.footer_cta" });
  const common = await getTranslations({ locale, namespace: "common" });
  const footer = await getTranslations({ locale, namespace: "footer" });

  return (
    <div className="relative min-h-screen w-full bg-[#0A1428] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, rgba(255,200,160,0.08) 0%, rgba(10,20,40,0) 70%)," +
            "radial-gradient(50% 40% at 90% 30%, rgba(215,42,42,0.06) 0%, rgba(10,20,40,0) 70%)," +
            "radial-gradient(70% 60% at 50% 100%, rgba(180,200,255,0.05) 0%, rgba(10,20,40,0) 80%)",
        }}
      />

      <NavV2
        brand={common("company")}
        ctaHref="/contact"
        ctaLabel={nav("contact")}
        items={[
          { href: "/businesses", label: nav("businesses") },
          { href: "/about", label: nav("about") },
          { href: "/careers", label: nav("careers") },
          { href: "/press", label: nav("press") },
        ]}
        locale={locale}
      />

      <main className="relative z-10" id="main">
        <HeroV3 locale={locale} />

        <BigTaglineV2
          clauses={[
            "WhatsApp で。",
            "AI が選ぶ。",
            "現地価格で届ける。",
          ]}
          lead="日本の選択肢を、ブラジル 5 億人へ。"
        />

        <SolutionsV2
          body={portfolio("lead")}
          eyebrow="Solutions"
          items={[
            {
              accent: "#F0E8C0",
              body: portfolio("jplanet.desc"),
              cta: portfolio("jplanet.cta"),
              href: "/businesses",
              tag: portfolio("jplanet.tag"),
              title: portfolio("jplanet.title"),
            },
            {
              accent: "#7AE0B5",
              body: portfolio("protocol.desc"),
              cta: portfolio("protocol.cta"),
              href: "/about",
              tag: portfolio("protocol.tag"),
              title: portfolio("protocol.title"),
            },
          ]}
          locale={locale}
          title={portfolio("title")}
        />

        <BusinessFeatureV2
          accent="#F0E8C0"
          body={businesses("jplanet.body")}
          bullets={[
            { body: "5 億人の生活基盤に直接届ける", number: "01", title: "WhatsApp エージェント" },
            { body: "日本商品の catalog 全件、Phase 1 から", number: "02", title: "日韓品質" },
          ]}
          ctaPrimary={{ href: "/contact", label: "Seller として参加" }}
          ctaSecondary={{ href: "/businesses", label: businesses("jplanet.cta") }}
          eyebrow={businesses("jplanet.tag")}
          image={{
            alt: "São Paulo skyline at dusk",
            src: UNSPLASH("photo-1543059080-f9b1272213d5"),
          }}
          imageSide="left"
          locale={locale}
          title={businesses("jplanet.title")}
        />

        <AgentShowcaseSticky locale={locale} />

        <CompanyV2
          body={about("vision.body")}
          cityImages={[
            {
              alt: "Tokyo skyline at night",
              caption: "Tokyo · Andes Inc.",
              src: UNSPLASH("photo-1540959733332-eab4deabeeaf"),
            },
            {
              alt: "São Paulo cityscape",
              caption: "São Paulo · Andes BR / J-Planet",
              src: UNSPLASH("photo-1543059080-f9b1272213d5"),
            },
          ]}
          entities={[
            {
              body: "IP と資金を統括する日本親会社。Series A 進行中。",
              location: "Tokyo",
              name: "Andes Inc. (JP)",
              role: "Parent",
            },
            {
              body: "現地子会社 + 事業会社。PRC 申請中、Phase 1 launch 2026-06。",
              location: "São Paulo",
              name: "Andes BR / J-Planet",
              role: "Operations",
            },
          ]}
          eyebrow="About Andes"
          stats={[
            { label: "Founded", value: "2024" },
            { label: "Languages", value: "ja / en / pt-BR" },
            { label: "Offices", value: "Tokyo · São Paulo" },
          ]}
          title="東京とサンパウロ、二拠点で建てる"
        />

        <CareersV2
          accentImage={{
            alt: "Engineers collaborating in a modern workspace",
            src: UNSPLASH("photo-1522071820081-009f0129c71c"),
          }}
          body={careers("who.body")}
          contactCta={{ href: "/careers", label: careers("contact.cta") }}
          eyebrow="Careers"
          locale={locale}
          openings={[
            {
              body: careers("open.engineer.body"),
              cta: careers("open.engineer.cta"),
              count: careers("open.engineer.lead"),
              href: "/careers",
              role: careers("open.engineer.title"),
            },
          ]}
          title={careers("hero.title")}
        />

        <NewsV2
          eyebrow="Press & news"
          items={[
            {
              body: `${press("upcoming.ivs.venue")}。${press("upcoming.ivs.speaker")} 登壇。`,
              category: press("upcoming.title"),
              date: press("upcoming.ivs.date"),
              image: {
                alt: "Conference audience at a startup summit",
                src: UNSPLASH("photo-1540575467063-178a50c2df87"),
              },
              title: press("upcoming.ivs.title"),
            },
            {
              body: press("kit.contact"),
              category: press("kit.title"),
              date: "2026",
              image: {
                alt: "Microphone on a press conference desk",
                src: UNSPLASH("photo-1505373877841-8d25f7d46678"),
              },
              title: press("kit.profile"),
            },
            {
              body: press("coverage.empty"),
              category: press("coverage.title"),
              date: "—",
              image: {
                alt: "Newspapers stacked on a table",
                src: UNSPLASH("photo-1486325212027-8081e485255e"),
              },
              title: press("hero.lead"),
            },
          ]}
          title={press("hero.title")}
        />

        <ContactCtaV2
          backdropImage={{
            alt: "Rio de Janeiro coastline at sunset",
            src: UNSPLASH("photo-1483729558449-99ef09a8c325"),
          }}
          body={footerCta("desc")}
          ctaPrimary={{ href: "/contact", label: footerCta("button") }}
          ctaSecondary={{ href: "/about", label: hero("cta_secondary") }}
          eyebrow="Get in touch"
          locale={locale}
          title={footerCta("title")}
        />
      </main>

      <div className="relative z-10">
        <FooterV2
          columns={[
            {
              heading: footer("businesses_label"),
              links: [
                { href: "/businesses", label: footer("businesses_jplanet") },
                { href: "/businesses", label: footer("businesses_jvita") },
              ],
            },
            {
              heading: footer("company_label"),
              links: [
                { href: "/about", label: footer("company_about") },
                { href: "/careers", label: footer("company_careers") },
                { href: "/press", label: footer("company_press") },
                { href: "/contact", label: footer("company_contact") },
              ],
            },
            {
              heading: footer("legal_label"),
              links: [
                { href: "/privacy", label: footer("legal_privacy") },
                { href: "/terms", label: footer("legal_terms") },
                { href: "/cookies", label: footer("legal_cookies") },
              ],
            },
            {
              heading: footer("group_label"),
              links: [{ href: "/about", label: footer("group_companies") }],
            },
          ]}
          copyright={footer("copyright")}
          legal={[
            { href: "/privacy", label: footer("legal_privacy") },
            { href: "/terms", label: footer("legal_terms") },
          ]}
          locale={locale}
          location={footer("location")}
        />
      </div>
    </div>
  );
}
