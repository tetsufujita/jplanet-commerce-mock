import type {
  CSSProperties,
  Dispatch,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Box,
  Camera,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Gamepad2,
  MessageCircle,
  Newspaper,
  Pause,
  Play,
  Plus,
  PackageCheck,
  ScanFace,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getHeroSlidesForFeed,
  desktopHomeCategoryItems,
  desktopHomeShortcutItems,
  homeShortcutItems,
  homeGramEntries,
  homeReviews,
  products,
  rankingKeywords,
  reviewRecommendations,
  recordedDesktopRankingReviews,
  recordedMobileProfileReviews,
  searchDiscoveryProducts,
  type HomeShortcutIconId,
  type Product,
  type ShortcutIconId,
} from "@/sazo-commerce/fixtures";
import {
  JPLANET_PRODUCT_DETAIL_ID,
  type SazoAction,
  type SazoState,
} from "@/sazo-commerce/model";
import { JplanetShortcutIcon } from "@/sazo-commerce/JplanetShortcutIcon";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import { useSazoHero } from "@/sazo-commerce/useSazoHero";

interface HeroSlideStyle extends CSSProperties {
  "--sazo-slide-left": string;
  "--sazo-slide-left-mobile": string;
}

interface HeroPointerStart {
  pointerId: number;
  x: number;
  y: number;
}

const heroSwipeThreshold = 40;

export interface HomeViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

interface SectionHeadingProps {
  onMore?: () => void;
  title: string;
}

interface HomeDenseProduct {
  discount: string;
  id: string;
  image: string;
  label: string;
  mediaAspect: "portrait" | "square" | "wide";
  name: string;
  originalPrice: string;
  price: string;
  salesCount: string;
}

const homeDenseProducts: readonly HomeDenseProduct[] = [
  {
    discount: "14% OFF",
    id: "pro-controller",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    label: "日本公式",
    mediaAspect: "wide",
    name: "Nintendo Switch Proコントローラー",
    originalPrice: "R$ 498",
    price: "R$ 429",
    salesCount: "9,450件販売",
  },
  {
    discount: "13% OFF",
    id: "switch-oled",
    image: "/sazo-commerce/reference/nintendo-switch-oled.png",
    label: "日本公式",
    mediaAspect: "wide",
    name: "Nintendo Switch OLED ホワイトセット",
    originalPrice: "R$ 2,520",
    price: "R$ 2,184",
    salesCount: "3,240件販売",
  },
  {
    discount: "11% OFF",
    id: "sony-a7c",
    image: "/sazo-commerce/reference/mirrorless-camera.png",
    label: "人気",
    mediaAspect: "square",
    name: "Sony α7C II ボディ",
    originalPrice: "R$ 2,998",
    price: "R$ 2,680",
    salesCount: "2,470件販売",
  },
  {
    discount: "14% OFF",
    id: "new-balance",
    image: "/sazo-commerce/reference/new-balance-9060.png",
    label: "限定ハイブラ",
    mediaAspect: "wide",
    name: "New Balance 9060",
    originalPrice: "R$ 868",
    price: "R$ 748",
    salesCount: "8,600件販売",
  },
  {
    discount: "8% OFF",
    id: "air-jordan",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    label: "人気",
    mediaAspect: "wide",
    name: "Air Jordan 1 Retro High OG",
    originalPrice: "R$ 858",
    price: "R$ 789",
    salesCount: "12,000件販売",
  },
  {
    discount: "16% OFF",
    id: "figure",
    image: "/sazo-commerce/reference/figure.png",
    label: "限定",
    mediaAspect: "portrait",
    name: "日本限定 キャラクターフィギュア",
    originalPrice: "R$ 378",
    price: "R$ 318",
    salesCount: "3,240件販売",
  },
  {
    discount: "12% OFF",
    id: "joy-con",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
    label: "日本公式",
    mediaAspect: "portrait",
    name: "Nintendo Joy-Con (L)/(R)",
    originalPrice: "R$ 582",
    price: "R$ 512",
    salesCount: "9,450件販売",
  },
  {
    discount: "15% OFF",
    id: "switch-case",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
    label: "日本公式",
    mediaAspect: "wide",
    name: "Nintendo Switch キャリングケース",
    originalPrice: "R$ 222",
    price: "R$ 188",
    salesCount: "6,870件販売",
  },
  {
    discount: "13% OFF",
    id: "game-controller",
    image: "/sazo-commerce/reference/game-controller.png",
    label: "人気",
    mediaAspect: "square",
    name: "ワイヤレスゲームコントローラー",
    originalPrice: "R$ 366",
    price: "R$ 318",
    salesCount: "5,700件販売",
  },
  {
    discount: "12% OFF",
    id: "handbag",
    image: "/sazo-commerce/reference/handbag.png",
    label: "限定ハイブラ",
    mediaAspect: "portrait",
    name: "日本製 レザーハンドバッグ",
    originalPrice: "R$ 1,052",
    price: "R$ 926",
    salesCount: "1,920件販売",
  },
  {
    discount: "12% OFF",
    id: "lipstick",
    image: "/sazo-commerce/reference/lipstick.png",
    label: "日本公式",
    mediaAspect: "portrait",
    name: "リップスティック コレクション",
    originalPrice: "R$ 186",
    price: "R$ 164",
    salesCount: "7,800件販売",
  },
  {
    discount: "10% OFF",
    id: "shopper-tote",
    image: "/sazo-commerce/products/08.webp",
    label: "人気",
    mediaAspect: "portrait",
    name: "Iconic Shopper Tote Bag",
    originalPrice: "R$ 760",
    price: "R$ 684",
    salesCount: "2,800件販売",
  },
  {
    discount: "13% OFF",
    id: "black-sandal",
    image: "/sazo-commerce/products/09.webp",
    label: "限定ハイブラ",
    mediaAspect: "wide",
    name: "OOriginal Black サンダル",
    originalPrice: "R$ 600",
    price: "R$ 522",
    salesCount: "4,350件販売",
  },
  {
    discount: "11% OFF",
    id: "gift-accessory",
    image: "/sazo-commerce/products/10.webp",
    label: "日本セレクト",
    mediaAspect: "square",
    name: "プチプチ ギフトアクセサリー",
    originalPrice: "R$ 108",
    price: "R$ 96",
    salesCount: "1,280件販売",
  },
  {
    discount: "10% OFF",
    id: "mask-pack",
    image: "/sazo-commerce/products/11.webp",
    label: "日本公式",
    mediaAspect: "portrait",
    name: "高濃縮アンプルマスクパック 30枚",
    originalPrice: "R$ 164",
    price: "R$ 148",
    salesCount: "10,200件販売",
  },
  {
    discount: "12% OFF",
    id: "collection",
    image: "/sazo-commerce/mobile-picks/29.png",
    label: "限定",
    mediaAspect: "square",
    name: "日本デザイン コレクション",
    originalPrice: "R$ 248",
    price: "R$ 218",
    salesCount: "2,160件販売",
  },
];

const homeDenseProductFeedMultiplier = 3;
const homeDenseProductFeed = Array.from(
  { length: homeDenseProductFeedMultiplier },
  (_, batchIndex) =>
    homeDenseProducts.map((product) => ({
      ...product,
      id: `${product.id}-home-batch-${String(batchIndex + 1)}`,
    })),
).flat();

const homeDenseColumnBreakpoints = [
  { columns: 5, query: "(min-width: 1440px)" },
  { columns: 4, query: "(min-width: 1024px)" },
  { columns: 3, query: "(min-width: 768px)" },
] as const;

function getHomeDenseColumnCount() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return 2;
  }

  return (
    homeDenseColumnBreakpoints.find(({ query }) => window.matchMedia(query).matches)
      ?.columns ?? 2
  );
}

function useHomeDenseColumnCount() {
  const [columnCount, setColumnCount] = useState(getHomeDenseColumnCount);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;

    const mediaQueries = homeDenseColumnBreakpoints.map(({ query }) =>
      window.matchMedia(query),
    );
    const update = () => setColumnCount(getHomeDenseColumnCount());

    mediaQueries.forEach((mediaQuery) => mediaQuery.addEventListener("change", update));
    update();

    return () => {
      mediaQueries.forEach((mediaQuery) =>
        mediaQuery.removeEventListener("change", update),
      );
    };
  }, []);

  return columnCount;
}

function splitHomeDenseProducts(
  productsToSplit: readonly HomeDenseProduct[],
  columnCount: number,
) {
  const columns = Array.from({ length: columnCount }, () => [] as HomeDenseProduct[]);

  productsToSplit.forEach((product, index) => {
    columns[index % columnCount]?.push(product);
  });

  return columns;
}

function useMobileHome() {
  const query = "(max-width: 767px)";
  const getMatches = () => {
    // Keep component tests on the established mobile composition when JSDOM
    // has no viewport media-query implementation. Real browsers always use
    // the viewport result, so the 768px desktop split remains CSS/viewport-led.
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }

    return window.matchMedia(query).matches;
  };
  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia(query);
    const update = () => {
      setMatches(media.matches);
    };

    media.addEventListener("change", update);
    update();

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return matches;
}

function getCircularHeroOffset(index: number, activeIndex: number, total: number) {
  const forwardOffset = (index - activeIndex + total) % total;

  return forwardOffset > total / 2 ? forwardOffset - total : forwardOffset;
}

function SectionHeading({ onMore, title }: SectionHeadingProps) {
  const { t } = useTranslation();

  return (
    <div className="sazo-section-heading">
      <h2>{title}</h2>
      <button className="sazo-more-link" onClick={onMore} type="button">
        {t("sazo.home.more")}
      </button>
    </div>
  );
}

function HeroCarousel({ dispatch, state }: HomeViewProps) {
  const { t } = useTranslation();
  const visibleHeroSlides = getHeroSlidesForFeed(state.heroFeed);
  const goNext = useCallback(() => {
    dispatch({ type: "hero-next" });
  }, [dispatch]);
  const goPrevious = useCallback(() => {
    for (let index = 1; index < visibleHeroSlides.length; index += 1) {
      dispatch({ type: "hero-next" });
    }
  }, [dispatch, visibleHeroSlides.length]);
  const pointerStart = useRef<HeroPointerStart | null>(null);
  const suppressNextClick = useRef(false);
  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;

    suppressNextClick.current = false;
    pointerStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }, []);
  const handlePointerCancel = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStart.current?.pointerId === event.pointerId) {
      pointerStart.current = null;
    }
  }, []);
  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = pointerStart.current;
      pointerStart.current = null;

      if (!event.isPrimary || start?.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      if (Math.abs(deltaX) < heroSwipeThreshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return;
      }

      suppressNextClick.current = true;
      if (deltaX < 0) goNext();
      else goPrevious();
    },
    [goNext, goPrevious],
  );
  const handleClickCapture = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressNextClick.current || event.detail === 0) return;

    suppressNextClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useSazoHero({
    intervalMs: 5_000,
    onNext: goNext,
    paused: state.heroPaused,
  });

  return (
    <section
      aria-label={t("sazo.home.heroLabel")}
      className="sazo-hero"
      data-hero-index={state.heroIndex}
      data-testid="sazo-hero"
    >
      <div
        className="sazo-hero-viewport"
        onClickCapture={handleClickCapture}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {visibleHeroSlides.map((slide, index) => {
          const offset = getCircularHeroOffset(
            index,
            state.heroIndex,
            visibleHeroSlides.length,
          );
          const style: HeroSlideStyle = {
            "--sazo-slide-left": `${String(50 + offset * 68)}%`,
            "--sazo-slide-left-mobile": `${String(50 + offset * 100)}%`,
          };

          return (
            <article
              aria-hidden={index !== state.heroIndex}
              className="sazo-hero-slide"
              data-active={index === state.heroIndex}
              data-hero-offset={offset}
              data-hero-slide={slide.id}
              key={slide.id}
              style={style}
            >
              <picture>
                <source
                  height={slide.mobileHeight}
                  media="(max-width: 767px)"
                  srcSet={slide.mobileImage}
                  width={slide.mobileWidth}
                />
                <img
                  alt=""
                  aria-hidden
                  className="sazo-hero-artwork"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  height={slide.mobileHeight}
                  loading={index === 0 ? "eager" : "lazy"}
                  src={slide.image}
                  width={slide.mobileWidth}
                />
              </picture>
              <span className="sazo-visually-hidden">
                {slide.title} {slide.subtitle}
              </span>
            </article>
          );
        })}

        <button
          aria-label={t("sazo.home.previousBanner")}
          className="sazo-hero-arrow sazo-hero-arrow-previous"
          onClick={goPrevious}
          type="button"
        >
          <ChevronLeft aria-hidden size={28} strokeWidth={2.2} />
        </button>
        <button
          aria-label={t("sazo.home.nextBanner")}
          className="sazo-hero-arrow sazo-hero-arrow-next"
          onClick={goNext}
          type="button"
        >
          <ChevronRight aria-hidden size={28} strokeWidth={2.2} />
        </button>

        <div className="sazo-hero-status">
          <span data-testid="sazo-hero-counter">
            {state.heroIndex + 1}/{visibleHeroSlides.length}
          </span>
          <button
            aria-label={
              state.heroPaused ? t("sazo.home.playBanner") : t("sazo.home.pauseBanner")
            }
            onClick={() => {
              dispatch({ type: "toggle-hero-pause" });
            }}
            type="button"
          >
            {state.heroPaused ? (
              <Play aria-hidden fill="currentColor" size={17} />
            ) : (
              <Pause aria-hidden fill="currentColor" size={17} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

type LegacyHomeShortcutIconId = Extract<HomeShortcutIconId, ShortcutIconId>;

function isLegacyShortcutIcon(
  icon: HomeShortcutIconId,
): icon is LegacyHomeShortcutIconId {
  return icon === "feature" || icon === "limited" || icon === "flea-market";
}

const navigationShortcutIcons: Record<
  Exclude<HomeShortcutIconId, ShortcutIconId>,
  LucideIcon
> = {
  brands: Tags,
  categories: Grid2X2,
  help: CircleHelp,
  news: Newspaper,
  reviews: Star,
  service: Store,
};

function ShortcutArtwork({ icon }: { icon?: HomeShortcutIconId }) {
  if (icon === undefined) {
    return null;
  }

  if (isLegacyShortcutIcon(icon)) {
    return <JplanetShortcutIcon id={icon} />;
  }

  const Icon = navigationShortcutIcons[icon];

  return <Icon aria-hidden />;
}

function MobileShortcutRow({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <div
      aria-label={t("sazo.home.shortcutLabel")}
      className="sazo-shortcuts"
      data-mobile-shortcut-grid
      data-layout="horizontal-menu"
      data-page-size="9"
      role="group"
    >
      {homeShortcutItems.map((shortcut) => {
        const view = shortcut.view;

        return (
          <button
            aria-label={t(`sazo.home.shortcuts.${shortcut.labelKey}`)}
            className="sazo-shortcut"
            key={shortcut.id}
            onClick={
              view === undefined
                ? undefined
                : () => {
                    dispatch({ type: "navigate", view });
                  }
            }
            type="button"
          >
            <span className="sazo-shortcut-icon" data-icon={shortcut.icon}>
              <ShortcutArtwork icon={shortcut.icon} />
            </span>
            <span>{t(`sazo.home.shortcuts.${shortcut.labelKey}`)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewStrip({ dispatch, state, title }: HomeViewProps & { title?: string }) {
  const { t } = useTranslation();
  const displayedReviews =
    state.reviewFeed === "desktop-ranking"
      ? recordedDesktopRankingReviews
      : state.reviewFeed === "mobile-profile"
        ? recordedMobileProfileReviews
        : homeReviews;

  return (
    <section className="sazo-home-section sazo-review-section">
      <SectionHeading
        onMore={() => {
          dispatch({ type: "navigate", view: "reviews" });
        }}
        title={title ?? t("sazo.home.reviewsTitle")}
      />
      <div className="sazo-horizontal-strip sazo-review-strip">
        {displayedReviews.map((review) => (
          <article
            className="sazo-review-card"
            data-review-id={review.id}
            key={review.id}
          >
            <div className="sazo-review-media">
              <img
                alt={review.productName}
                decoding="async"
                height={500}
                src={review.image}
                width={390}
              />
              <span data-review-author-layer="dom">{review.author}</span>
            </div>
            <p>{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeIntro() {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-intro">
      <div>
        <span className="sazo-intro-rule" />
        <h1>{t("sazo.home.introTitle")}</h1>
        <p>{t("sazo.home.introBody")}</p>
      </div>
      <button type="button">
        <Sparkles aria-hidden size={22} strokeWidth={1.8} />
        {t("sazo.home.firstGuide")}
        <ChevronRight aria-hidden size={22} />
      </button>
    </section>
  );
}

function MobileAgentSearch({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();
  const openAgent = () => {
    dispatch({ type: "open-agent-hub", intent: "compose" });
  };

  return (
    <div className="sazo-mobile-search-overlap" data-mobile-home>
      <div
        aria-label={t("sazo.home.agentEntryGroup")}
        className="sazo-mobile-agent-entry sazo-home-agent-card"
        data-home-agent-entry
        data-apple-surface="true"
        role="group"
      >
        <header className="sazo-home-agent-card-header">
          <img
            alt=""
            aria-hidden="true"
            data-jplanet-sakura-mark
            height={28}
            src="/sazo-commerce/jplanet-sakura-mark.png"
            width={28}
          />
          <div>
            <strong>購入エージェント</strong>
            <span>商品を送るだけで、購入判断まで。</span>
          </div>
        </header>
        <button
          aria-label={t("sazo.agentHub.composer.draftLabel")}
          className="sazo-home-agent-launcher"
          data-mobile-agent-search
          onClick={openAgent}
          type="button"
        >
          <span>URL・画像・商品名を送る</span>
          <Camera
            aria-hidden
            className="sazo-home-agent-camera"
            size={21}
            strokeWidth={2.1}
          />
          <ArrowRight
            aria-hidden
            className="sazo-home-agent-send"
            size={18}
            strokeWidth={2.8}
          />
        </button>
        <div
          aria-label={t("sazo.home.agentAssurance")}
          className="sazo-home-agent-assurances"
        >
          <span>
            <ShieldCheck aria-hidden size={22} strokeWidth={2.15} />
            {t("sazo.home.agentAssurance")}
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileCouponBanner({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("sazo.home.couponBannerLabel")}
      className="sazo-mobile-coupon-banner"
      data-mobile-coupon-banner
      data-testid="mobile-coupon-banner"
    >
      <button
        aria-label={t("sazo.home.couponBannerCta")}
        onClick={() => {
          dispatch({ type: "navigate", view: "coupons" });
        }}
        type="button"
      >
        <img
          alt={t("sazo.home.couponBannerArtwork")}
          decoding="async"
          src="/sazo-commerce/campaign/jplanet-pix-day-sale.png"
        />
        <span className="sazo-visually-hidden">{t("sazo.home.couponBannerCta")}</span>
      </button>
    </section>
  );
}

function MobileGramGrid({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  return (
    <section className="sazo-mobile-gram-section" data-testid="mobile-gram-section">
      <SectionHeading
        onMore={() => {
          dispatch({ type: "navigate", view: "gram" });
        }}
        title="J-Planet GRAM"
      />
      <div className="sazo-mobile-gram-grid">
        {homeGramEntries.slice(0, 2).map((entry) => (
          <article className="sazo-mobile-gram-card" key={entry.id}>
            <div className="sazo-mobile-gram-media">
              <img alt={entry.caption} decoding="async" src={entry.image} />
              <span>{entry.caption}</span>
            </div>
            <div className="sazo-mobile-gram-product">
              <img alt="" aria-hidden decoding="async" src={entry.product.image} />
              <div>
                <h3>{entry.product.name}</h3>
                <p>
                  {entry.product.discount ? <b>{entry.product.discount}</b> : null}
                  <strong>{entry.product.price}</strong>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

interface JplanetRecommendationGridProps extends Pick<HomeViewProps, "dispatch"> {
  heading?: string;
  layout?: "grid" | "rail";
  products?: readonly HomeDenseProduct[];
  productLimit?: number;
  sectionClassName?: string;
  testId?: string;
}

export function JplanetRecommendationGrid({
  dispatch,
  heading = "おすすめ商品",
  layout = "grid",
  products: productFeed = homeDenseProducts,
  productLimit,
  sectionClassName = "sazo-home-dense-picks",
  testId,
}: JplanetRecommendationGridProps) {
  const columnCount = useHomeDenseColumnCount();
  const visibleProducts =
    productLimit === undefined ? productFeed : productFeed.slice(0, productLimit);
  const columns =
    layout === "rail"
      ? [visibleProducts]
      : splitHomeDenseProducts(visibleProducts, columnCount);
  const openProduct = () => {
    dispatch({ type: "open-product", productId: JPLANET_PRODUCT_DETAIL_ID });
  };

  return (
    <section
      className={sectionClassName}
      data-layout={layout}
      data-mobile-picks-grid={
        sectionClassName === "sazo-home-dense-picks" ? true : undefined
      }
      data-testid={testId}
    >
      <div className="sazo-home-dense-picks-heading">
        <h2>{heading}</h2>
      </div>
      <div
        className="sazo-home-dense-product-grid"
        data-column-count={columnCount}
        data-home-dense-product-grid
        data-layout={layout}
      >
        {columns.map((column, columnIndex) => (
          <div className="sazo-home-dense-product-column" key={columnIndex}>
            {column.map((product) => (
              <article
                className="sazo-home-dense-product"
                data-media-aspect={product.mediaAspect}
                data-product-target={JPLANET_PRODUCT_DETAIL_ID}
                data-testid="home-dense-product-card"
                key={product.id}
              >
                <span className="sazo-home-dense-product-media">
                  <button
                    aria-label={`${product.name}の商品詳細を見る`}
                    className="sazo-home-dense-product-media-open"
                    onClick={openProduct}
                    type="button"
                  >
                    <img
                      alt={product.name}
                      decoding="async"
                      height={640}
                      src={product.image}
                      width={640}
                    />
                    <em>{product.label}</em>
                  </button>
                  <button
                    aria-label={`${product.name}の購入オプションを選ぶ`}
                    className="sazo-home-dense-product-add"
                    onClick={openProduct}
                    type="button"
                  >
                    <ShoppingCart aria-hidden size={19} strokeWidth={2} />
                    <Plus
                      aria-hidden
                      className="sazo-home-dense-product-add-plus"
                      size={11}
                      strokeWidth={2.6}
                    />
                  </button>
                </span>
                <button
                  aria-label={`${product.name}の商品詳細を見る`}
                  className="sazo-home-dense-product-copy"
                  onClick={openProduct}
                  type="button"
                >
                  <strong>{product.name}</strong>
                  <span className="sazo-home-dense-product-price-before">
                    <em>{product.discount}</em>
                    <s>{product.originalPrice}</s>
                  </span>
                  <span className="sazo-home-dense-product-price-row">
                    <b>{product.price}</b>
                    <span className="sazo-home-dense-product-sales">
                      {product.salesCount}
                    </span>
                  </span>
                  <span className="sazo-home-dense-product-direct">日本から直送</span>
                </button>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const desktopShortcutIcons: Record<
  (typeof desktopHomeShortcutItems)[number]["id"],
  LucideIcon
> = {
  brands: Store,
  camera: Camera,
  categories: Grid2X2,
  feature: Sparkles,
  figure: ScanFace,
  game: Gamepad2,
  limited: PackageCheck,
  skincare: Box,
};

function DesktopHomeShortcutRow({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("sazo.desktopHome.shortcutLabel")}
      className="sazo-desktop-home-shortcuts"
    >
      {desktopHomeShortcutItems.map((shortcut) => {
        const Icon = desktopShortcutIcons[shortcut.id];

        return (
          <button
            key={shortcut.id}
            onClick={() => {
              dispatch({ type: "navigate", view: shortcut.view });
            }}
            type="button"
          >
            <span>
              <Icon aria-hidden size={24} strokeWidth={1.9} />
            </span>
            {t(`sazo.desktopHome.shortcuts.${shortcut.labelKey}`)}
          </button>
        );
      })}
    </section>
  );
}

function DesktopHomeCategoryGrid({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("sazo.desktopHome.categoriesLabel")}
      className="sazo-desktop-home-categories"
      data-testid="desktop-home-category-grid"
    >
      <div className="sazo-desktop-home-categories-heading">
        <h2>{t("sazo.desktopHome.categoriesTitle")}</h2>
      </div>
      <div className="sazo-desktop-home-categories-grid">
        {desktopHomeCategoryItems.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              dispatch({ type: "navigate", view: category.view });
            }}
            type="button"
          >
            <span className="sazo-desktop-home-category-image">
              <img alt="" aria-hidden decoding="async" src={category.image} />
            </span>
            <span>{t(`sazo.desktopHome.categories.${category.labelKey}`)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DesktopHomeCommunity({ dispatch, state }: HomeViewProps) {
  const { t } = useTranslation();
  const displayedReviews =
    state.reviewFeed === "desktop-ranking"
      ? recordedDesktopRankingReviews
      : state.reviewFeed === "mobile-profile"
        ? recordedMobileProfileReviews
        : homeReviews;

  return (
    <section
      aria-label={t("sazo.home.gramTitle")}
      className="sazo-desktop-home-community"
      data-testid="desktop-home-community"
    >
      <section
        aria-label={t("sazo.navigation.reviews")}
        className="sazo-desktop-home-community-panel"
        data-testid="desktop-home-reviews"
      >
        <div className="sazo-desktop-home-community-heading">
          <h2>{t("sazo.navigation.reviews")}</h2>
          <button
            onClick={() => {
              dispatch({ type: "navigate", view: "reviews" });
            }}
            type="button"
          >
            {t("sazo.home.more")}
            <ChevronRight aria-hidden size={18} strokeWidth={2.2} />
          </button>
        </div>
        <div className="sazo-desktop-home-review-list">
          {displayedReviews.slice(0, 2).map((review) => (
            <button
              aria-label={t("sazo.navigation.reviews")}
              className="sazo-desktop-home-review-card"
              key={review.id}
              onClick={() => {
                dispatch({ type: "navigate", view: "reviews" });
              }}
              type="button"
            >
              <img alt="" aria-hidden decoding="async" src={review.image} />
              <span>
                <strong>{review.author}</strong>
                <small>{review.comment}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        aria-label={t("sazo.home.gramTitle")}
        className="sazo-desktop-home-community-panel"
        data-testid="desktop-home-gram"
      >
        <div className="sazo-desktop-home-community-heading">
          <h2>{t("sazo.home.gramTitle")}</h2>
          <button
            onClick={() => {
              dispatch({ type: "navigate", view: "gram" });
            }}
            type="button"
          >
            {t("sazo.home.more")}
            <ChevronRight aria-hidden size={18} strokeWidth={2.2} />
          </button>
        </div>
        <div className="sazo-desktop-home-gram-list">
          {homeGramEntries.slice(0, 2).map((entry) => (
            <button
              aria-label={t("sazo.gram.openPost", { caption: entry.caption })}
              className="sazo-desktop-home-gram-card"
              key={entry.id}
              onClick={() => {
                dispatch({ type: "navigate", view: "gram" });
              }}
              type="button"
            >
              <img alt="" aria-hidden decoding="async" src={entry.image} />
              <span>
                <strong>{entry.caption}</strong>
                <small>{entry.product.name}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function DesktopHomeView({ dispatch, state }: HomeViewProps) {
  const { t } = useTranslation();
  const heroSlides = getHeroSlidesForFeed(state.heroFeed);
  const activeSlide = heroSlides[state.heroIndex] ?? heroSlides[0];
  const activeImage =
    state.heroIndex === 0
      ? "/sazo-commerce/reference/japan-brazil-hero.png"
      : activeSlide?.image;
  const heroCount = heroSlides.length;

  const goPrevious = () => {
    for (let index = 1; index < heroCount; index += 1) {
      dispatch({ type: "hero-next" });
    }
  };

  return (
    <div className="sazo-desktop-home" data-desktop-home-view>
      <section
        aria-label={t("sazo.desktopHome.heroLabel")}
        className="sazo-desktop-home-stage"
      >
        <aside
          aria-hidden
          className="sazo-desktop-home-neighbor sazo-desktop-home-neighbor--left"
        >
          <span>{t("sazo.desktopHome.sideBanner")}</span>
          <b>{t("sazo.desktopHome.sideBannerEmphasis")}</b>
        </aside>

        <article
          className="sazo-desktop-home-hero"
          data-active-hero={activeSlide?.id}
          data-primary-hero={state.heroIndex === 0}
        >
          {activeImage === undefined ? null : (
            <img alt="" aria-hidden decoding="async" src={activeImage} />
          )}
          <div className="sazo-desktop-home-hero-copy">
            <span>{t("sazo.desktopHome.heroEyebrow")}</span>
            <h1>{t("sazo.desktopHome.heroTitle")}</h1>
            <p>{t("sazo.desktopHome.heroBody")}</p>
          </div>
          <button
            aria-label={t("sazo.home.previousBanner")}
            className="sazo-desktop-home-hero-arrow sazo-desktop-home-hero-arrow--previous"
            onClick={goPrevious}
            type="button"
          >
            <ChevronLeft aria-hidden size={24} strokeWidth={2.3} />
          </button>
          <button
            aria-label={t("sazo.home.nextBanner")}
            className="sazo-desktop-home-hero-arrow sazo-desktop-home-hero-arrow--next"
            onClick={() => {
              dispatch({ type: "hero-next" });
            }}
            type="button"
          >
            <ChevronRight aria-hidden size={24} strokeWidth={2.3} />
          </button>
          <div
            aria-label={t("sazo.desktopHome.carouselStatus")}
            className="sazo-desktop-home-hero-dots"
          >
            {heroSlides.map((slide, index) => (
              <span aria-current={index === state.heroIndex} key={slide.id} />
            ))}
          </div>
        </article>

        <aside className="sazo-desktop-home-evidence">
          <button
            aria-label={t("sazo.desktopHome.couponBannerCta")}
            className="sazo-desktop-home-coupon-banner"
            data-testid="desktop-home-coupon-banner"
            onClick={() => {
              dispatch({ type: "navigate", view: "coupons" });
            }}
            type="button"
          >
            <img
              alt=""
              aria-hidden
              decoding="async"
              src="/sazo-commerce/campaign/jplanet-coupon-banner.svg"
            />
          </button>
          <button
            aria-label={t("sazo.desktopHome.agentCta")}
            className="sazo-desktop-home-agent-cta"
            data-testid="desktop-home-agent-cta"
            onClick={() => {
              dispatch({ type: "open-agent-hub", intent: "compose" });
            }}
            type="button"
          >
            <Sparkles aria-hidden size={30} strokeWidth={1.8} />
            <span>
              <strong>{t("sazo.desktopHome.agentCta")}</strong>
              <small>{t("sazo.desktopHome.agentCtaBody")}</small>
            </span>
            <ChevronRight aria-hidden size={21} strokeWidth={2} />
          </button>
        </aside>

        <aside
          aria-hidden
          className="sazo-desktop-home-neighbor sazo-desktop-home-neighbor--right"
        >
          <span>{t("sazo.desktopHome.sideBannerGuide")}</span>
          <b>{t("sazo.desktopHome.sideBannerGuideEmphasis")}</b>
          <ChevronRight aria-hidden size={18} strokeWidth={2.1} />
        </aside>
      </section>

      <DesktopHomeShortcutRow dispatch={dispatch} />

      <section className="sazo-desktop-home-products">
        <div className="sazo-desktop-home-products-heading">
          <h2>{t("sazo.desktopHome.productsTitle")}</h2>
          <button
            onClick={() => {
              dispatch({ type: "navigate", view: "ranking" });
            }}
            type="button"
          >
            {t("sazo.home.more")}
            <ChevronRight aria-hidden size={18} strokeWidth={2.2} />
          </button>
        </div>
        <JplanetRecommendationGrid
          dispatch={dispatch}
          heading={t("sazo.desktopHome.productsTitle")}
          layout="rail"
          productLimit={6}
          sectionClassName="sazo-desktop-home-product-rail"
          testId="desktop-home-product-rail"
        />
      </section>

      <DesktopHomeCommunity dispatch={dispatch} state={state} />

      <DesktopHomeCategoryGrid dispatch={dispatch} />
    </div>
  );
}

function MobileSupportFooter() {
  return (
    <section className="sazo-mobile-support-footer">
      <JplanetLogo />
      <div aria-label="J-Planet公式SNS" className="sazo-mobile-socials" role="group">
        <button aria-label="X" type="button">
          <span aria-hidden>𝕏</span>
        </button>
        <button aria-label="Instagram" type="button">
          <svg aria-hidden viewBox="0 0 24 24">
            <rect height="17" rx="5" width="17" x="3.5" y="3.5" />
            <circle cx="12" cy="12" r="4" />
            <circle className="sazo-mobile-social-dot" cx="17.5" cy="6.5" r="1" />
          </svg>
        </button>
        <button aria-label="WhatsApp" type="button">
          <MessageCircle aria-hidden size={25} strokeWidth={2} />
        </button>
      </div>
      <h2>カスタマーサポート</h2>
      <strong>平日：10:00～18:00</strong>
      <strong>土日・祝日：15:00～18:00</strong>
      <p>チャットよりお問い合わせください。24時間以内に担当者が回答いたします</p>
      <button className="sazo-mobile-contact" type="button">
        <MessageCircle aria-hidden size={24} strokeWidth={2} />
        <span>今すぐお問い合わせを開始</span>
        <ChevronRight aria-hidden size={24} strokeWidth={2} />
      </button>
      <div className="sazo-mobile-footer-links">
        <button type="button">会社概要</button>
        <button type="button">採用情報</button>
        <button type="button">プレスリリース</button>
        <button type="button">利用規約</button>
        <button type="button">プライバシーポリシー</button>
        <button type="button">特定商取引法に基づく表記</button>
      </div>
    </section>
  );
}

function GramStrip({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section">
      <SectionHeading
        onMore={() => {
          dispatch({ type: "navigate", view: "gram" });
        }}
        title={t("sazo.home.gramTitle")}
      />
      <div className="sazo-horizontal-strip sazo-gram-strip">
        {homeGramEntries.map((entry) => (
          <article className="sazo-gram-card" key={entry.id}>
            <div className="sazo-gram-media">
              <img
                alt={entry.caption}
                decoding="async"
                height={500}
                src={entry.image}
                width={390}
              />
              <Camera aria-hidden size={22} strokeWidth={2.2} />
            </div>
            <div className="sazo-home-gram-product">
              <img
                alt=""
                aria-hidden
                decoding="async"
                height={40}
                src={entry.product.image}
                width={40}
              />
              <div>
                <h3>{entry.product.name}</h3>
                <p>
                  {entry.product.discount ? <b>{entry.product.discount}</b> : null}
                  <strong>{entry.product.price}</strong>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecommendedReviews({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section sazo-recommended-reviews">
      <h2>{t("sazo.home.reviewRecommendations")}</h2>
      <div className="sazo-recommendation-track">
        {reviewRecommendations.map((review) => (
          <article className="sazo-recommendation" key={review.id}>
            <div
              aria-label={t("sazo.home.rating", { rating: review.rating })}
              className="sazo-rating"
            >
              {Array.from({ length: review.rating }, (_, starIndex) => (
                <Star
                  aria-hidden
                  fill="currentColor"
                  key={`${review.id}-${String(starIndex)}`}
                  size={20}
                  strokeWidth={1.8}
                />
              ))}
            </div>
            <blockquote>{review.comment}</blockquote>
            <p className="sazo-review-author">{review.author}</p>
            <ProductCard
              onOpen={(productId) => {
                dispatch({ type: "open-product", productId });
              }}
              product={review.product}
              variant="compact"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductGrid({
  dispatch,
  end,
  start = 0,
}: Pick<HomeViewProps, "dispatch"> & { end: number; start?: number }) {
  return (
    <div className="sazo-product-grid">
      {products.slice(start, end).map((product) => (
        <ProductCard
          key={product.id}
          onOpen={(productId) => {
            dispatch({ type: "open-product", productId });
          }}
          product={product}
        />
      ))}
    </div>
  );
}

function ProductDiscovery({ dispatch, state }: HomeViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <section className="sazo-home-section">
        <SectionHeading title={t("sazo.home.picksTitle")} />
        <ProductGrid dispatch={dispatch} end={10} start={6} />
      </section>

      <section className="sazo-home-section sazo-keyword-section">
        <h2>{t("sazo.home.popularKeywords")}</h2>
        <div className="sazo-keyword-layout">
          <ol className="sazo-keyword-list">
            {rankingKeywords.map((keyword) => (
              <li key={keyword.rank}>
                <span>{keyword.rank}</span>
                {keyword.label}
              </li>
            ))}
          </ol>
          <div
            className="sazo-keyword-products"
            data-loading={state.loadingSurface === "keyword-products"}
          >
            {state.loadingSurface === "keyword-products"
              ? Array.from({ length: 5 }, (_, index) => (
                  <span aria-hidden className="sazo-keyword-skeleton" key={index} />
                ))
              : products.slice(0, 5).map((product) => (
                  <ProductCard
                    key={product.id}
                    onOpen={(productId) => {
                      dispatch({ type: "open-product", productId });
                    }}
                    product={product}
                    variant="compact"
                  />
                ))}
          </div>
        </div>
      </section>

      <section className="sazo-home-section sazo-ranking-section">
        <SectionHeading
          onMore={() => {
            dispatch({ type: "navigate", view: "ranking" });
          }}
          title={t("sazo.home.rankingTitle")}
        />
        <div className="sazo-ranking-controls">
          <button aria-pressed="true" type="button">
            {t("sazo.home.purchaseCount")}
          </button>
          <button aria-pressed="false" type="button">
            {t("sazo.home.viewCount")}
          </button>
          <span>{t("sazo.home.week")}</span>
        </div>
        <ProductGrid dispatch={dispatch} end={12} start={9} />
      </section>
    </>
  );
}

function SearchDiscovery({ dispatch, state }: Pick<HomeViewProps, "dispatch" | "state">) {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section sazo-search-discovery">
      <div className="sazo-search-callout" data-guidance-arrow="true">
        <h2>{t("sazo.home.searchTitle")}</h2>
        <div className="sazo-large-search" role="search">
          <Search aria-hidden size={24} strokeWidth={2} />
          <span>{t("sazo.home.searchPlaceholder")}</span>
          <button type="button">
            <span>{t("sazo.home.searchButton")}</span>
            <ArrowRight
              aria-hidden
              data-search-submit-arrow
              size={22}
              strokeWidth={2.2}
            />
          </button>
        </div>
        <svg
          aria-hidden="true"
          className="sazo-search-guidance-arrow"
          data-search-guidance-arrow
          focusable="false"
          viewBox="0 0 140 92"
        >
          <path
            d="M114 84 C86 72 74 92 50 87 C17 82 8 61 15 39 C18 29 33 30 36 20"
            data-search-guidance-curve
          />
          <path d="M21 25 L36 20 L38 36" data-search-guidance-head />
        </svg>
        <p>{t("sazo.home.searchHint")}</p>
      </div>
      <SectionHeading title={t("sazo.home.searchedTitle")} />
      <div className="sazo-product-grid">
        {searchDiscoveryProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            mediaHidden={state.loadingSurface === "search-first" && index === 0}
            onOpen={(productId) => {
              dispatch({ type: "open-product", productId });
            }}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

export function HomeView({ dispatch, state }: HomeViewProps) {
  const mobileHome = useMobileHome();

  return (
    <div className="sazo-home" data-home-view>
      {mobileHome ? (
        <>
          <HeroCarousel
            dispatch={dispatch}
            state={{ ...state, heroFeed: "large-first" }}
          />
          <MobileAgentSearch dispatch={dispatch} />
          <MobileShortcutRow dispatch={dispatch} />
          <MobileCouponBanner dispatch={dispatch} />
          <ReviewStrip dispatch={dispatch} state={state} title="利用者レビュー" />
          <MobileGramGrid dispatch={dispatch} />
          <JplanetRecommendationGrid
            dispatch={dispatch}
            products={homeDenseProductFeed}
          />
          <MobileSupportFooter />
        </>
      ) : (
        <DesktopHomeView dispatch={dispatch} state={state} />
      )}
    </div>
  );
}
