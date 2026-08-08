import type { Dispatch } from "react";
import { useTranslation } from "react-i18next";
import {
  getGramPosts,
  gramCategories,
  type GramPost,
} from "@/sazo-commerce/gramFixtures";
import type { SazoAction, SazoState } from "@/sazo-commerce/model";

export interface GramViewProps {
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
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
              <strong>{post.caption}</strong>
              <span>{primaryProduct?.price}</span>
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
    <>
      <div
        aria-label={t("sazo.gram.loading")}
        className="sazo-gram-loading"
        role="status"
      />
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
    </>
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
