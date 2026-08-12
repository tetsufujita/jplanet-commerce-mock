import type {
  CSSProperties,
  ChangeEvent,
  Dispatch,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  SyntheticEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  ImagePlus,
  MessageCircle,
  Newspaper,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Store,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getHeroSlidesForFeed,
  homeShortcutItems,
  homeCategoryItems,
  homeGramEntries,
  homeReviews,
  interestedProducts,
  products,
  rankingKeywords,
  reviewRecommendations,
  recordedDesktopRankingReviews,
  recordedMobileProfileReviews,
  searchDiscoveryProducts,
  shortcuts,
  type HomeShortcutIconId,
  type Product,
  type ShortcutIconId,
} from "@/sazo-commerce/fixtures";
import type { SazoAction, SazoState } from "@/sazo-commerce/model";
import { JplanetShortcutIcon } from "@/sazo-commerce/JplanetShortcutIcon";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import { InterestedItemsRail } from "@/sazo-commerce/InterestedItemsRail";
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
const mobileAgentCompactThreshold = 168;

const mobileCategoryPages = Array.from(
  { length: Math.ceil(homeCategoryItems.length / 8) },
  (_, pageIndex) => homeCategoryItems.slice(pageIndex * 8, pageIndex * 8 + 8),
);

export interface HomeViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

interface SectionHeadingProps {
  onMore?: () => void;
  title: string;
}

function requiredProduct(list: readonly Product[], index: number) {
  const product = list[index];

  if (product === undefined) {
    throw new Error(`Missing mobile home product at index ${String(index)}`);
  }

  return product;
}

const mobileGiftFairSections = [
  {
    products: [
      requiredProduct(interestedProducts, 2),
      requiredProduct(interestedProducts, 3),
    ],
    title: "MY GIFT FAIR - 日本のおしゃれブランド",
  },
  {
    products: [requiredProduct(interestedProducts, 1), requiredProduct(products, 8)],
    title: "MY GIFT FAIR - プレミアムスニーカー",
  },
  {
    products: [requiredProduct(products, 7), requiredProduct(products, 6)],
    title: "MY GIFT FAIR - 日本のセンスあるインテリア雑貨",
  },
  {
    products: [requiredProduct(products, 9), requiredProduct(products, 10)],
    title: "MY GIFT FAIR - 置くだけで垢抜ける日本雑貨",
  },
] as const;

const mobilePickCopy = [
  ["NAVER", "[五行 厄除け] お守り 塩キーホルダー", "¥2,392", "21%"],
  ["ABLY", "[オヌレジブ単独] トゥデイ・スイッチ・カバー", "¥4,397", "10%"],
  ["Alo Yoga", "Iconic Shopper Tote Bag Grey Tiedye", "¥6,285"],
  ["Oofos", "OOriginal Black", "¥6,997"],
  ["KREAM", "Nike Mind 001 Black Chrome", "¥16,839"],
  ["KREAM", "Nike ReactX Rejuven8 Slide Black", "¥5,100"],
  ["KREAM", "AMOU Trouble Half T-Shirts Gray", "¥2,591", "54%"],
  ["KREAM", "Adidas Originals Capri Shorts Black White", "¥9,013"],
  ["29CM", "Deus Ex Machina Seoul T-shirt", "¥4,930"],
  ["29CM", "Daisy Graphic T-shirt Black", "¥4,594"],
  ["KREAM", "Peaceminusone x Toy Story The First Fan Plush", "¥3,914"],
  ["KREAM", "New Balance 530 Raincloud Silver Metallic", "¥17,788"],
  ["NAVER", "スノーイヤホン / Cタイプ", "¥2,185"],
  ["29CM", "cat cushion mirror2", "¥6,333"],
  ["29CM", "Vintage Cupid Angel スマホケース", "¥1,601"],
  ["29CM", "furry tissue cover (2colors)", "¥2,954", "5%"],
  ["NAVER", "Twinkle cushion keyring - wing", "¥1,727"],
  ["29CM", "マートルハンドクリーム 13ml", "¥1,601", "14%"],
  ["KREAM", "Starbucks Siren Mini Cold Cup 300ml", "¥2,372"],
  ["29CM", "UVカット ケノフィ サンシャインファームハウス3段日傘", "¥4,836", "20%"],
  ["29CM", "シルバー925 ボール＆スネークレイヤードブレスレット", "¥6,010", "6%"],
  ["29CM", "Leo Eco Bag_Mint", "¥4,109", "18%"],
  ["29CM", "【当日配送】Poco summer knit bag", "¥5,181", "46%"],
  ["29CM", "CLASSIC UMBRELLA SHORT - 6 colors", "¥4,675", "18%"],
  ["29CM", "OORIGINAL STARDUST", "¥6,753", "15%"],
  ["NAVER", "デコミニチュアパーツアクセサリー - アザラシ", "¥145"],
  ["NAVER", "Lucky Turtle + 3M Double-Sided Tape", "¥383", "13%"],
  ["11ST", "夜光フルーツカメフィギュア", "¥448"],
  ["11ST", "ホームスタイリングカメミニチュア4種", "¥713", "12%"],
  ["11ST", "ホームスタイリングミニチュアダスト装飾妖精", "¥307", "12%"],
  ["KAKAO", "モンチッチストリングポーチ - チムタン", "¥2,073"],
] as const;

const mobilePickProducts: readonly Product[] = mobilePickCopy.map(
  ([brand, name, price, badge], index) => ({
    badge,
    brand,
    id: `mobile-pick-${String(index + 1)}`,
    image: `/sazo-commerce/mobile-picks/${String(index + 1).padStart(2, "0")}.png`,
    name,
    price,
  }),
);

function useMobileHome() {
  const query = "(max-width: 767px)";
  const getMatches = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(query).matches;
  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;

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
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!event.isPrimary) return;

      suppressNextClick.current = false;
      pointerStart.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    },
    [],
  );
  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerStart.current?.pointerId === event.pointerId) {
        pointerStart.current = null;
      }
    },
    [],
  );
  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = pointerStart.current;
      pointerStart.current = null;

      if (!event.isPrimary || start?.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      if (
        Math.abs(deltaX) < heroSwipeThreshold ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      suppressNextClick.current = true;
      if (deltaX < 0) goNext();
      else goPrevious();
    },
    [goNext, goPrevious],
  );
  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!suppressNextClick.current || event.detail === 0) return;

      suppressNextClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

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
                  height={490}
                  loading={index === 0 ? "eager" : "lazy"}
                  src={slide.image}
                  width={1200}
                />
              </picture>
              <span className="sazo-visually-hidden">
                {slide.title} {slide.subtitle}
              </span>
              {slide.id === "new-benefits" ? (
                <button
                  aria-label="クーポンキャンペーンを見る"
                  className="sazo-hero-campaign-link"
                  onClick={() => {
                    dispatch({ type: "open-campaign" });
                  }}
                  type="button"
                />
              ) : null}
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

function isLegacyShortcutIcon(icon: HomeShortcutIconId): icon is LegacyHomeShortcutIconId {
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
      data-layout="five-column-two-row"
      data-page-size="10"
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

function DesktopShortcutRow({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <div
      aria-label={t("sazo.home.shortcutLabel")}
      className="sazo-shortcuts"
      role="group"
    >
      {shortcuts.map((shortcut) => (
        <button
          aria-label={shortcut.label}
          className="sazo-shortcut"
          key={shortcut.id}
          onClick={
            shortcut.id === "cosmetics"
              ? () => {
                  dispatch({ type: "navigate", view: "beauty" });
                }
              : undefined
          }
          type="button"
        >
          <span className="sazo-shortcut-icon" data-icon={shortcut.id}>
            <JplanetShortcutIcon id={shortcut.id} />
            {shortcut.badge ? (
              <span aria-hidden className="sazo-shortcut-badge">
                {shortcut.badge}
              </span>
            ) : null}
          </span>
          <span>{shortcut.label}</span>
        </button>
      ))}
    </div>
  );
}

function ReviewStrip({
  dispatch,
  state,
  title,
}: HomeViewProps & { title?: string }) {
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

function MobileAgentSearch({ compact }: { compact: boolean }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file?.type.startsWith("image/") === true) {
      setStatus(t("sazo.agentHub.composer.selectedImageAlt", { name: file.name }));
      setMenuOpen(false);
    }

    event.target.value = "";
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draft.trim().length > 0) {
      setStatus(t("sazo.agentHub.composer.submitted"));
      setDraft("");
    }
  };

  return (
    <div
      className="sazo-mobile-search-overlap"
      data-compact={compact ? "true" : undefined}
      data-mobile-home
    >
      <div
        aria-label={t("sazo.home.agentEntryGroup")}
        className="sazo-mobile-agent-entry sazo-home-agent-card"
        data-home-agent-entry
        data-compact={compact ? "true" : undefined}
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
            <strong>{t("sazo.agentHub.composer.title")}</strong>
          </div>
        </header>
        <form className="sazo-home-agent-form" onSubmit={submit}>
          <input
            accept="image/*"
            aria-hidden="true"
            className="sazo-mobile-agent-image-entry"
            data-mobile-agent-image-entry
            hidden
            onChange={choosePhoto}
            ref={fileInputRef}
            type="file"
          />
          <input
            accept="image/*"
            aria-hidden="true"
            capture="environment"
            hidden
            onChange={choosePhoto}
            ref={cameraInputRef}
            type="file"
          />
          <div className="sazo-home-agent-input-shell">
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={t("sazo.agentHub.composer.menuLabel")}
              className="sazo-home-agent-plus"
              onClick={() => {
                setMenuOpen((open) => !open);
              }}
              type="button"
            >
              <Plus aria-hidden size={20} />
            </button>
            <textarea
              aria-label={t("sazo.agentHub.composer.draftLabel")}
              className="sazo-mobile-agent-entry-main"
              data-mobile-agent-search
              onChange={(event) => {
                setDraft(event.target.value);
                setStatus(null);
              }}
              placeholder={t("sazo.agentHub.composer.inputPlaceholder")}
              ref={textInputRef}
              rows={1}
              value={draft}
            />
            <button
              aria-label={t("sazo.agentHub.composer.send")}
              className="sazo-home-agent-submit"
              disabled={draft.trim().length === 0}
              type="submit"
            >
              <Sparkles aria-hidden size={18} />
            </button>
          </div>
          {menuOpen ? (
            <div
              aria-label={t("sazo.agentHub.composer.menuLabel")}
              className="sazo-home-agent-menu"
              role="menu"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  cameraInputRef.current?.click();
                }}
                role="menuitem"
                type="button"
              >
                <Camera aria-hidden size={17} />
                {t("sazo.agentHub.composer.takePhoto")}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                role="menuitem"
                type="button"
              >
                <ImagePlus aria-hidden size={17} />
                {t("sazo.agentHub.composer.selectPhoto")}
              </button>
            </div>
          ) : null}
          {status === null ? null : (
            <p className="sazo-home-agent-status" role="status">
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function MobileCouponBanner({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { i18n, t } = useTranslation();
  const artworkByLocale = {
    en: "/sazo-commerce/campaign/jplanet-coupon-banner-en.svg",
    ja: "/sazo-commerce/campaign/jplanet-coupon-banner.svg",
    "pt-BR": "/sazo-commerce/campaign/jplanet-coupon-banner-pt-BR.svg",
  } as const;
  const locale = i18n.resolvedLanguage;
  const artwork =
    locale === "en" || locale === "pt-BR"
      ? artworkByLocale[locale]
      : artworkByLocale.ja;

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
          src={artwork}
        />
        <span>{t("sazo.home.couponBannerCta")}</span>
        <ChevronRight aria-hidden size={18} />
      </button>
    </section>
  );
}

function MobileCategoryArtwork({ image }: { image: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <img
      alt=""
      aria-hidden
      data-category-image-fallback={imageFailed ? "true" : undefined}
      decoding="sync"
      onError={() => {
        setImageFailed(true);
      }}
      src={
        imageFailed ? "/sazo-commerce/jplanet-sakura-mark.png" : image
      }
    />
  );
}

function MobileGiftFair({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  return (
    <div className="sazo-mobile-gift-fairs">
      {mobileGiftFairSections.map((section) => (
        <section
          className="sazo-mobile-editorial-section"
          data-mobile-gift-fair
          key={section.title}
        >
          <SectionHeading title={section.title} />
          <div className="sazo-mobile-editorial-grid">
            {section.products.map((product) => (
              <ProductCard
                key={`${section.title}-${product.id}`}
                onOpen={(productId) => {
                  dispatch({ type: "open-product", productId });
                }}
                product={product}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
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

function MobileCategoryRail({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  const { t } = useTranslation();

  return (
    <section
      aria-label={t("sazo.home.categoryRailLabel")}
      className="sazo-mobile-category-section"
      data-mobile-category-rail
      data-testid="mobile-category-rail"
    >
      <div className="sazo-section-heading">
        <h2>{t("sazo.home.categoryRailTitle")}</h2>
        <button
          aria-label="カテゴリーをもっと見る"
          className="sazo-more-link sazo-mobile-category-more"
          onClick={() => {
            dispatch({ type: "navigate", view: "categories" });
          }}
          type="button"
        >
          {t("sazo.home.more")}
          <ChevronRight aria-hidden size={16} />
        </button>
      </div>
      <div
        aria-label={t("sazo.home.categoryRailLabel")}
        className="sazo-mobile-category-rail"
        data-mobile-category-grid
        data-layout="four-column-page"
        data-page-size="8"
        role="group"
      >
        {mobileCategoryPages.map((page, pageIndex) => (
          <div
            className="sazo-mobile-category-page"
            data-mobile-category-page
            key={`category-page-${String(pageIndex)}`}
          >
            {page.map((category) => {
              const label = t(`sazo.home.categories.${category.labelKey}`);

              return (
                <button
                  aria-label={label}
                  className="sazo-mobile-category-tile"
                  key={category.id}
                  onClick={() => {
                    dispatch({
                      type: "select-directory-category",
                      category: category.id,
                    });
                    dispatch({ type: "navigate", view: "beauty" });
                  }}
                  type="button"
                >
                  <span className="sazo-mobile-category-image">
                    <MobileCategoryArtwork image={category.image} />
                  </span>
                  <span className="sazo-mobile-category-label">{label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function MobilePicksGrid({ dispatch }: Pick<HomeViewProps, "dispatch">) {
  return (
    <section className="sazo-mobile-picks-section">
      <SectionHeading title="J-Planet's PICK" />
      <div className="sazo-mobile-picks-grid" data-mobile-picks-grid>
        {mobilePickProducts.map((product, index) => (
          <div className="sazo-mobile-ranked-product" key={product.id}>
            <span aria-hidden className="sazo-mobile-rank-badge">
              {index + 1}
            </span>
            <ProductCard
              onOpen={(productId) => {
                dispatch({ type: "open-product", productId });
              }}
              product={product}
            />
          </div>
        ))}
      </div>
    </section>
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
  const [compactMobileAgent, setCompactMobileAgent] = useState(false);

  useEffect(() => {
    if (!mobileHome) {
      return undefined;
    }

    const updateCompactState = () => {
      setCompactMobileAgent(window.scrollY >= mobileAgentCompactThreshold);
    };

    updateCompactState();
    window.addEventListener("scroll", updateCompactState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateCompactState);
    };
  }, [mobileHome]);

  return (
    <div className="sazo-home" data-home-view>
      {mobileHome ? (
        <>
          <HeroCarousel dispatch={dispatch} state={{ ...state, heroFeed: "large-first" }} />
          <MobileAgentSearch compact={compactMobileAgent} />
          <MobileShortcutRow dispatch={dispatch} />
          <MobileCouponBanner dispatch={dispatch} />
          <InterestedItemsRail dispatch={dispatch} />
          <ReviewStrip dispatch={dispatch} state={state} title="利用者レビュー" />
          <MobileGiftFair dispatch={dispatch} />
          <MobileGramGrid dispatch={dispatch} />
          <MobileCategoryRail dispatch={dispatch} />
          <MobilePicksGrid dispatch={dispatch} />
          <MobileSupportFooter />
        </>
      ) : (
        <>
          <HeroCarousel dispatch={dispatch} state={state} />
          <DesktopShortcutRow dispatch={dispatch} />
          <HomeIntro />
          <InterestedItemsRail dispatch={dispatch} />
          <ReviewStrip dispatch={dispatch} state={state} />
          <GramStrip dispatch={dispatch} />
          <RecommendedReviews dispatch={dispatch} />
          <ProductDiscovery dispatch={dispatch} state={state} />
          <SearchDiscovery dispatch={dispatch} state={state} />
        </>
      )}
    </div>
  );
}
