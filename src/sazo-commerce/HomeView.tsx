import type { CSSProperties, Dispatch } from "react";
import { useCallback } from "react";
import {
  BadgePercent,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Music2,
  Pause,
  Play,
  Search,
  Sparkles,
  Star,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  gramEntries,
  heroSlides,
  products,
  rankingKeywords,
  reviews,
  shortcuts,
} from "@/sazo-commerce/fixtures";
import type { SazoAction, SazoState } from "@/sazo-commerce/model";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import { useSazoHero } from "@/sazo-commerce/useSazoHero";

const shortcutIcons: Record<string, LucideIcon> = {
  cosmetics: Sparkles,
  feature: Sparkles,
  "flea-market": Tags,
  "k-pop": Music2,
  limited: BadgePercent,
};

interface HeroSlideStyle extends CSSProperties {
  "--sazo-slide-left": string;
  "--sazo-slide-left-mobile": string;
}

export interface HomeViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

interface SectionHeadingProps {
  title: string;
}

function SectionHeading({ title }: SectionHeadingProps) {
  const { t } = useTranslation();

  return (
    <div className="sazo-section-heading">
      <h2>{title}</h2>
      <button className="sazo-more-link" type="button">
        {t("sazo.home.more")}
      </button>
    </div>
  );
}

function HeroCarousel({ dispatch, state }: HomeViewProps) {
  const { t } = useTranslation();
  const goNext = useCallback(() => {
    dispatch({ type: "hero-next" });
  }, [dispatch]);
  const goPrevious = useCallback(() => {
    for (let index = 1; index < heroSlides.length; index += 1) {
      dispatch({ type: "hero-next" });
    }
  }, [dispatch]);

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
    >
      <div className="sazo-hero-viewport">
        {heroSlides.map((slide, index) => {
          const offset = index - state.heroIndex;
          const style: HeroSlideStyle = {
            "--sazo-slide-left": `${String(50 + offset * 68)}%`,
            "--sazo-slide-left-mobile": `${String(50 + offset * 100)}%`,
          };

          return (
            <article
              aria-hidden={index !== state.heroIndex}
              className="sazo-hero-slide"
              data-active={index === state.heroIndex}
              key={slide.id}
              style={style}
            >
              <img
                alt=""
                aria-hidden
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                height={490}
                loading={index === 0 ? "eager" : "lazy"}
                src={slide.image}
                width={1200}
              />
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
            {state.heroIndex + 1}/{heroSlides.length}
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

      <div className="sazo-hero-search" role="search">
        <Search aria-hidden size={25} strokeWidth={2.1} />
        <span>{t("sazo.home.mobileSearchPlaceholder")}</span>
      </div>
    </section>
  );
}

function ShortcutRow() {
  const { t } = useTranslation();

  return (
    <div
      aria-label={t("sazo.home.shortcutLabel")}
      className="sazo-shortcuts"
      role="group"
    >
      {shortcuts.map((shortcut) => {
        const Icon = shortcutIcons[shortcut.id] ?? CircleDollarSign;

        return (
          <button className="sazo-shortcut" key={shortcut.id} type="button">
            <span className="sazo-shortcut-icon">
              {shortcut.id === "feature" ? (
                <img
                  alt=""
                  aria-hidden
                  height={44}
                  src="/sazo-commerce/logo-mark.svg"
                  width={44}
                />
              ) : (
                <Icon aria-hidden size={32} strokeWidth={1.8} />
              )}
            </span>
            <span>{shortcut.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewStrip() {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section sazo-review-section">
      <SectionHeading title={t("sazo.home.reviewsTitle")} />
      <div className="sazo-horizontal-strip sazo-review-strip">
        {reviews.slice(0, 6).map((review) => (
          <article className="sazo-review-card" key={review.id}>
            <div className="sazo-review-media">
              <img
                alt={review.productName}
                decoding="async"
                height={500}
                src={review.image}
                width={390}
              />
              <span>{review.author}</span>
            </div>
            <p>{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GramStrip() {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section">
      <SectionHeading title={t("sazo.home.gramTitle")} />
      <div className="sazo-horizontal-strip sazo-gram-strip">
        {gramEntries.map((entry) => (
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
            <h3>{entry.caption}</h3>
            <p>{entry.author}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecommendedReviews() {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section sazo-recommended-reviews">
      <h2>{t("sazo.home.reviewRecommendations")}</h2>
      <div className="sazo-recommendation-track">
        {reviews.slice(6, 8).map((review) => {
          const product = products.find(({ id }) => id === review.id.replace("r", "p"));

          if (product === undefined) {
            return null;
          }

          return (
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
              <ProductCard product={product} variant="compact" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductGrid({ end, start = 0 }: { end: number; start?: number }) {
  return (
    <div className="sazo-product-grid">
      {products.slice(start, end).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductDiscovery() {
  const { t } = useTranslation();

  return (
    <>
      <section className="sazo-home-section">
        <SectionHeading title={t("sazo.home.picksTitle")} />
        <ProductGrid end={10} start={6} />
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
          <div className="sazo-keyword-products">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      <section className="sazo-home-section sazo-ranking-section">
        <SectionHeading title={t("sazo.home.rankingTitle")} />
        <div className="sazo-ranking-controls">
          <button aria-pressed="true" type="button">
            {t("sazo.home.purchaseCount")}
          </button>
          <button aria-pressed="false" type="button">
            {t("sazo.home.viewCount")}
          </button>
          <span>{t("sazo.home.week")}</span>
        </div>
        <ProductGrid end={12} start={9} />
      </section>
    </>
  );
}

function SearchDiscovery() {
  const { t } = useTranslation();

  return (
    <section className="sazo-home-section sazo-search-discovery">
      <div className="sazo-search-callout">
        <h2>{t("sazo.home.searchTitle")}</h2>
        <div className="sazo-large-search" role="search">
          <Search aria-hidden size={24} strokeWidth={2} />
          <span>{t("sazo.home.searchPlaceholder")}</span>
          <button type="button">{t("sazo.home.searchButton")}</button>
        </div>
        <p>{t("sazo.home.searchHint")}</p>
      </div>
      <SectionHeading title={t("sazo.home.searchedTitle")} />
      <ProductGrid end={9} start={5} />
    </section>
  );
}

export function HomeView({ dispatch, state }: HomeViewProps) {
  const { t } = useTranslation();

  return (
    <div className="sazo-home" data-home-view>
      <HeroCarousel dispatch={dispatch} state={state} />
      <ShortcutRow />

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

      <ReviewStrip />
      <GramStrip />
      <RecommendedReviews />
      <ProductDiscovery />
      <SearchDiscovery />
    </div>
  );
}
