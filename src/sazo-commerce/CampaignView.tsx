import type { Dispatch } from "react";
import { Clock3, Search } from "lucide-react";
import { products } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";

const campaignThumbnails = [
  "/sazo-commerce/campaign/thumb-01.png",
  "/sazo-commerce/campaign/thumb-02.png",
  "/sazo-commerce/campaign/thumb-03.png",
  "/sazo-commerce/campaign/thumb-04.png",
  "/sazo-commerce/campaign/thumb-05-top-partial.png",
] as const;

const campaignReturnThumbnails = [
  "/sazo-commerce/campaign/thumb-05-partial.png",
  "/sazo-commerce/campaign/thumb-04.png",
  "/sazo-commerce/campaign/thumb-03.png",
  "/sazo-commerce/campaign/thumb-02.png",
  "/sazo-commerce/campaign/thumb-01.png",
] as const;

interface CampaignViewProps {
  dispatch: Dispatch<SazoAction>;
  loaded: boolean;
}

function CampaignWordmark({ dispatch }: Pick<CampaignViewProps, "dispatch">) {
  return (
    <button
      aria-label="J-Planetホーム"
      className="sazo-campaign-wordmark"
      onClick={() => {
        dispatch({ type: "navigate", view: "home" });
      }}
      type="button"
    >
      <JplanetLogo />
    </button>
  );
}

function CampaignRail({
  loaded,
  reverse = false,
}: Pick<CampaignViewProps, "loaded"> & { reverse?: boolean }) {
  const thumbnails = reverse ? campaignReturnThumbnails : campaignThumbnails;

  return (
    <div className="sazo-campaign-rail" data-loading={!loaded} data-reverse={reverse}>
      {(loaded ? thumbnails : products.slice(0, 6).map(({ image }) => image)).map(
        (image, index) => (
          <div className="sazo-campaign-thumbnail" key={`${image}-${String(index)}`}>
            {loaded ? <img alt="" aria-hidden src={image} /> : null}
          </div>
        ),
      )}
    </div>
  );
}

export function CampaignView({ dispatch, loaded }: CampaignViewProps) {
  return (
    <article
      className="sazo-campaign-view"
      data-campaign-loaded={loaded}
      data-view-content="campaign"
    >
      <header className="sazo-campaign-header">
        <CampaignWordmark dispatch={dispatch} />
      </header>

      {loaded ? (
        <img
          alt="8月31日まで、初回限定のお得な3つのクーポン"
          className="sazo-campaign-banner"
          src="/sazo-commerce/campaign/coupon-banner.png"
        />
      ) : (
        <div className="sazo-campaign-banner sazo-campaign-banner-loading">
          <strong>8.31（月）</strong>
          <div>
            <span>
              <Clock3 aria-hidden size={18} strokeWidth={2.4} />
              終了まであと…
            </span>
            <span>24日 15時間 27分 39秒</span>
          </div>
        </div>
      )}

      <CampaignRail loaded={loaded} />

      <section className="sazo-campaign-message">
        <span>購入代行の面倒さゼロ！</span>
        <h1>
          <strong>超お得な</strong>
          <br />
          <small>日本の商品がたくさん！</small>
        </h1>
      </section>

      <CampaignRail loaded={loaded} reverse />

      <div className="sazo-campaign-url" role="search">
        <Search aria-hidden size={22} strokeWidth={2.1} />
        <span>日本のショップURLを入力してね</span>
      </div>
    </article>
  );
}
