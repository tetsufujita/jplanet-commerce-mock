import { useEffect, useState, type Dispatch } from "react";
import { Pause, Play, VolumeX } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  getGramPost,
  getGramPosts,
  gramCategories,
  type GramProduct,
  type GramPost,
} from "@/sazo-commerce/gramFixtures";
import type { SazoAction, SazoState } from "@/sazo-commerce/model";

export interface GramViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

type MatchMediaOptionalWindow = Omit<Window, "matchMedia"> & {
  matchMedia?: Window["matchMedia"];
};

function getReducedMotionMediaQuery() {
  return (window as MatchMediaOptionalWindow).matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  );
}

function useSystemReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => getReducedMotionMediaQuery()?.matches ?? false,
  );

  useEffect(() => {
    const mediaQuery = getReducedMotionMediaQuery();
    if (mediaQuery === undefined) {
      return undefined;
    }
    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
    };
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return reducedMotion;
}

function GramPostGrid({
  dispatch,
  posts,
}: Pick<GramViewProps, "dispatch"> & {
  posts: readonly GramPost[];
}) {
  const { t } = useTranslation();

  return (
    <div className="sazo-gram-catalog-grid">
      {posts.map((post) => {
        const primaryProduct = post.products[0];

        return (
          <button
            aria-label={t("sazo.gram.openPost", { caption: post.caption })}
            className="sazo-gram-catalog-card"
            key={post.id}
            onClick={() => {
              dispatch({ type: "open-gram-post", postId: post.id });
            }}
            type="button"
          >
            <span className="sazo-gram-catalog-media">
              <img
                alt=""
                decoding="async"
                height={500}
                loading="lazy"
                src={post.image}
                width={390}
              />
            </span>
            <span className="sazo-gram-catalog-copy">
              {primaryProduct === undefined ? null : (
                <span className="sazo-gram-catalog-product">
                  <img
                    alt=""
                    decoding="async"
                    height={44}
                    loading="lazy"
                    src={primaryProduct.image}
                    width={44}
                  />
                  <span className="sazo-gram-catalog-product-copy">
                    <strong>{primaryProduct.name}</strong>
                    <span className="sazo-gram-catalog-product-meta">
                      {primaryProduct.discount === undefined ? null : (
                        <em className="sazo-gram-catalog-discount">
                          {primaryProduct.discount}
                        </em>
                      )}
                      <b>{primaryProduct.price}</b>
                    </span>
                  </span>
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GramSkeletonGrid() {
  const { t } = useTranslation();

  return (
    <div className="sazo-gram-skeleton-grid">
      <div
        aria-label={t("sazo.gram.loading")}
        className="sazo-gram-loading-spinner"
        role="status"
      >
        <span aria-hidden />
      </div>
      <div aria-hidden className="sazo-gram-catalog-grid">
        {Array.from({ length: 10 }, (_, index) => (
          <div aria-hidden className="sazo-gram-skeleton-card" key={index}>
            <span className="sazo-gram-catalog-media" />
            <span className="sazo-gram-catalog-copy">
              <span />
              <span />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GramCatalogView({ dispatch, state }: GramViewProps) {
  const { t } = useTranslation();
  const posts = getGramPosts(state.gramCategory);

  return (
    <main className="sazo-gram-view" data-view-content="gram">
      <h1>{t("sazo.gram.title")}</h1>
      <div
        aria-label={t("sazo.gram.categoriesLabel")}
        className="sazo-gram-filter"
        role="group"
      >
        {gramCategories.map((category) => (
          <button
            aria-label={t("sazo.gram.categoryLabel", { category: category.label })}
            aria-pressed={state.gramCategory === category.id}
            key={category.id}
            onClick={() => {
              dispatch({ type: "select-gram-category", category: category.id });
            }}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>
      {state.gramLoading ? (
        <GramSkeletonGrid />
      ) : (
        <GramPostGrid dispatch={dispatch} posts={posts} />
      )}
    </main>
  );
}

function GramMediaPlayer({
  onToggle,
  playing,
  post,
  progress,
}: {
  onToggle: () => void;
  playing: boolean;
  post: GramPost;
  progress: number;
}) {
  const { t } = useTranslation();

  return (
    <section aria-label={t("sazo.gram.mediaRegion")} className="sazo-gram-player">
      <img alt="" className="sazo-gram-player-poster" decoding="async" src={post.image} />
      <div className="sazo-gram-player-controls">
        <button
          aria-label={playing ? t("sazo.gram.pause") : t("sazo.gram.play")}
          className="sazo-gram-player-toggle"
          onClick={onToggle}
          type="button"
        >
          {playing ? <Pause aria-hidden size={20} /> : <Play aria-hidden size={20} />}
        </button>
        <span aria-label={t("sazo.gram.mute")} className="sazo-gram-player-muted">
          <VolumeX aria-hidden size={18} />
        </span>
        <div
          aria-label={t("sazo.gram.progress")}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="sazo-gram-player-progress"
          role="progressbar"
        >
          <span style={{ width: `${String(progress)}%` }} />
        </div>
      </div>
    </section>
  );
}

function GramProductList({
  dispatch,
  products,
}: Pick<GramViewProps, "dispatch"> & { products: readonly GramProduct[] }) {
  const { t } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <section className="sazo-gram-products">
      <h2>{t("sazo.gram.productList")}</h2>
      <div className="sazo-gram-product-grid">
        {products.map((product) => {
          const linked = product.productId !== undefined;
          const selected = selectedProductId === product.id;
          const label = linked
            ? `${t("sazo.gram.viewProduct", { name: product.name })}（${t("sazo.gram.linked")}）`
            : t("sazo.gram.viewProduct", { name: product.name });

          return (
            <button
              aria-label={label}
              aria-pressed={linked ? undefined : selected}
              className="sazo-gram-product-card"
              key={product.id}
              onClick={() => {
                if (product.productId !== undefined) {
                  dispatch({ type: "open-product", productId: product.productId });
                  return;
                }

                setSelectedProductId((current) =>
                  current === product.id ? null : product.id,
                );
              }}
              type="button"
            >
              <img alt="" decoding="async" loading="lazy" src={product.image} />
              <span className="sazo-gram-product-copy">
                <strong>{product.name}</strong>
                <span>{product.price}</span>
                {selected ? <em>{t("sazo.gram.selected")}</em> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function GramDetailView({ dispatch, state }: GramViewProps) {
  const post = getGramPost(state.selectedGramPostId);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const motionReducedMotion = useReducedMotion() ?? false;
  const systemReducedMotion = useSystemReducedMotion();
  const reducedMotion = motionReducedMotion || systemReducedMotion;

  useEffect(() => {
    if (!playing || reducedMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setProgress((value) => (value + 1) % 101);
    }, 100);

    return () => {
      window.clearInterval(timer);
    };
  }, [playing, reducedMotion]);

  return (
    <main
      className="sazo-gram-detail"
      data-playing={playing}
      data-view-content="gram-detail"
    >
      <h1 className="sazo-visually-hidden">{post.caption}</h1>
      <GramMediaPlayer
        onToggle={() => {
          setPlaying((value) => !value);
        }}
        playing={playing}
        post={post}
        progress={progress}
      />
      <GramProductList dispatch={dispatch} products={post.products} />
    </main>
  );
}
