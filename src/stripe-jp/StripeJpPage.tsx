import { useEffect } from "react";
import "./stripe.css";
import { SjHeader } from "./sections/SjHeader";
import { SjHero } from "./sections/SjHero";
import { SjPlatform } from "./sections/SjPlatform";
import { SjSupport } from "./sections/SjSupport";
import { SjGlobal } from "./sections/SjGlobal";
import { SjUseCases } from "./sections/SjUseCases";
import { SjDevelopers } from "./sections/SjDevelopers";
import { SjNews } from "./sections/SjNews";
import { SjFinalCta } from "./sections/SjFinalCta";
import { SjFooter } from "./sections/SjFooter";

export function StripeJpPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Stripe JP — study reproduction";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="sj-root min-h-screen">
      <SjHeader />
      <main>
        <SjHero />
        <SjPlatform />
        <SjSupport />
        <SjGlobal />
        <SjUseCases />
        <SjDevelopers />
        <SjNews />
        <SjFinalCta />
      </main>
      <SjFooter />
    </div>
  );
}
