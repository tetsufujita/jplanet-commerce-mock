import { useEffect } from "react";
import "./shopify.css";
import { SpHeader } from "./sections/SpHeader";
import { SpHero } from "./sections/SpHero";
import { SpMerchantShowcase } from "./sections/SpMerchantShowcase";
import { SpChatSection } from "./sections/SpChatSection";
import { SpSellMore } from "./sections/SpSellMore";
import { SpGlobal } from "./sections/SpGlobal";
import { SpScale } from "./sections/SpScale";
import { SpSidekick } from "./sections/SpSidekick";
import { SpApps } from "./sections/SpApps";
import { SpDevs } from "./sections/SpDevs";
import { SpBuildEnv } from "./sections/SpBuildEnv";
import { SpCheckout } from "./sections/SpCheckout";
import { SpSpeed } from "./sections/SpSpeed";
import { SpFinalCta } from "./sections/SpFinalCta";
import { SpFooter } from "./sections/SpFooter";
import { SpPipVideo } from "./sections/SpPipVideo";

export function ShopifyJpPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Shopify JP — study reproduction";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="sp-root min-h-screen">
      <SpHeader />
      <main>
        <SpHero />
        <SpMerchantShowcase />
        <SpChatSection />
        <SpSellMore />
        <SpGlobal />
        <SpScale />
        <SpSidekick />
        <SpApps />
        <SpDevs />
        <SpBuildEnv />
        <SpCheckout />
        <SpSpeed />
        <SpFinalCta />
        <SpFooter />
      </main>
      <SpPipVideo />
    </div>
  );
}
