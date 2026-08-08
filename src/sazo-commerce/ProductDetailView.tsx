import type { Dispatch, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Heart,
  Home,
  ImageOff,
  MessageSquareText,
  Search,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ProductCampaignBanner } from "@/sazo-commerce/ProductCampaignBanner";
import { ProductOrderFlow } from "@/sazo-commerce/ProductOrderFlow";
import { ProductPurchasePanel } from "@/sazo-commerce/ProductPurchasePanel";
import { ProductRecommendationRail } from "@/sazo-commerce/ProductRecommendationRail";
import { ProductSourceLink } from "@/sazo-commerce/ProductSourceLink";
import {
  catalogInventory,
  getProductDetail,
  products,
  reviewRecommendations,
  searchDiscoveryProducts,
} from "@/sazo-commerce/fixtures";
import type { Product } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";
import { useProductPurchaseController } from "@/sazo-commerce/useProductPurchaseController";

export interface ProductDetailViewProps {
  dispatch: Dispatch<SazoAction>;
  productId: string | null;
}

type ProductDetailTab = "information" | "cautions";
const productDetailTabs = [
  { id: "information", labelKey: "tabs.information" },
  { id: "cautions", labelKey: "tabs.cautions" },
] as const satisfies readonly { id: ProductDetailTab; labelKey: string }[];

const cautionCards = [
  {
    copyKey: "cautions.cards.inventory.copy",
    titleKey: "cautions.cards.inventory.title",
  },
  {
    copyKey: "cautions.cards.imports.copy",
    titleKey: "cautions.cards.imports.title",
  },
  {
    copyKey: "cautions.cards.refunds.copy",
    titleKey: "cautions.cards.refunds.title",
  },
] as const;

const benefitCards = [
  {
    copyKey: "benefits.cards.fees.copy",
    icon: CircleDollarSign,
    titleKey: "benefits.cards.fees.title",
  },
  {
    copyKey: "benefits.cards.search.copy",
    icon: Search,
    titleKey: "benefits.cards.search.title",
  },
  {
    copyKey: "benefits.cards.reviews.copy",
    icon: MessageSquareText,
    titleKey: "benefits.cards.reviews.title",
  },
] as const;

const recommendationPool: readonly Product[] = [
  ...products,
  ...searchDiscoveryProducts,
  ...catalogInventory.map(({ product }) => product),
  ...reviewRecommendations.map(({ product }) => product),
];

const recommendationById = new Map(
  recommendationPool.map((product) => [product.id, product] as const),
);

function isProduct(product: Product | undefined): product is Product {
  return product !== undefined;
}

export function ProductDetailView({ dispatch, productId }: ProductDetailViewProps) {
  const { t } = useTranslation();
  const detail = getProductDetail(productId);
  const { product } = detail;
  const gallery = detail.gallery.length > 0 ? detail.gallery : [product.image];
  const recommendations = detail.recommendationIds
    .map((recommendationId) => recommendationById.get(recommendationId))
    .filter(isProduct);
  const reduceMotion = useReducedMotion() ?? false;
  const purchaseController = useProductPurchaseController({ detail, dispatch });
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [failedImageSources, setFailedImageSources] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [favorite, setFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("information");
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentGalleryIndex = Math.min(activeGalleryIndex, gallery.length - 1);
  const currentImage = gallery[currentGalleryIndex] ?? product.image;

  const markImageSourceFailed = (source: string) => {
    setFailedImageSources((current) => {
      if (current.has(source)) {
        return current;
      }

      const next = new Set(current);
      next.add(source);
      return next;
    });
  };

  const handleBack = () => {
    dispatch({ type: "close-product" });
  };

  const setGalleryIndex = (nextIndex: number) => {
    const wrappedIndex = (nextIndex + gallery.length) % gallery.length;
    setActiveGalleryIndex(wrappedIndex);
  };

  const handleThumbnailKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % gallery.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + gallery.length) % gallery.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = gallery.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    setGalleryIndex(nextIndex);
    thumbnailRefs.current[nextIndex]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % productDetailTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + productDetailTabs.length) % productDetailTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = productDetailTabs.length - 1;
    }

    const nextTab = nextIndex === null ? undefined : productDetailTabs[nextIndex];

    if (nextTab === undefined || nextIndex === null) {
      return;
    }

    event.preventDefault();
    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleShare = () => {
    if (typeof navigator.share === "function") {
      void navigator
        .share({ title: product.name, url: window.location.href })
        .then(() => {
          setShareFeedback(t("sazo.views.productDetail.feedback.shared"));
        })
        .catch(() => {
          setShareFeedback(t("sazo.views.productDetail.feedback.shareCanceled"));
        });
      return;
    }

    setShareFeedback(t("sazo.views.productDetail.feedback.shareAvailable"));
  };

  const moveToPurchaseForm = () => {
    const purchaseForm = document.querySelector<HTMLFormElement>(
      "form[data-product-purchase-form]",
    );
    purchaseForm?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    purchaseForm?.querySelector<HTMLSelectElement>("select")?.focus();
  };

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="sazo-product-detail"
      data-product-detail
      data-view-content="product"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
    >
      <header className="sazo-product-detail-header">
        <button className="sazo-product-detail-back" onClick={handleBack} type="button">
          <ArrowLeft aria-hidden size={22} strokeWidth={2} />
          {t("sazo.views.productDetail.header.back")}
        </button>
        <span className="sazo-product-detail-header-title">{product.name}</span>
        <button
          aria-label={t("sazo.views.productDetail.header.home")}
          className="sazo-product-detail-header-control"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <Home aria-hidden size={21} strokeWidth={2} />
        </button>
        <button
          aria-label={t("sazo.views.productDetail.header.cart")}
          className="sazo-product-detail-header-control"
          onClick={moveToPurchaseForm}
          type="button"
        >
          <ShoppingCart aria-hidden size={21} strokeWidth={2} />
        </button>
      </header>

      <nav
        aria-label={t("sazo.views.productDetail.header.navigation")}
        className="sazo-product-detail-desktop-navigation"
      >
        <button
          className="sazo-product-detail-back sazo-product-detail-desktop-back"
          onClick={handleBack}
          type="button"
        >
          <ArrowLeft aria-hidden size={22} strokeWidth={2} />
          {t("sazo.views.productDetail.header.back")}
        </button>
      </nav>

      <div className="sazo-product-detail-hero">
        <section
          aria-label={t("sazo.views.productDetail.gallery.label")}
          className="sazo-product-detail-gallery"
        >
          <div
            aria-label={t("sazo.views.productDetail.gallery.listLabel")}
            className="sazo-product-detail-thumbnails"
          >
            {gallery.map((image, index) => (
              <button
                aria-current={index === currentGalleryIndex ? "true" : undefined}
                aria-label={t("sazo.views.productDetail.gallery.showImage", {
                  index: index + 1,
                })}
                className="sazo-product-detail-thumbnail"
                key={image}
                onClick={() => {
                  setGalleryIndex(index);
                }}
                onKeyDown={(event) => {
                  handleThumbnailKeyDown(event, index);
                }}
                ref={(node) => {
                  thumbnailRefs.current[index] = node;
                }}
                type="button"
              >
                {failedImageSources.has(image) ? (
                  <span
                    aria-hidden
                    className="sazo-product-detail-thumbnail-placeholder"
                    data-testid="product-thumbnail-image-placeholder"
                  >
                    <ImageOff aria-hidden size={18} strokeWidth={1.8} />
                  </span>
                ) : (
                  <img
                    alt=""
                    decoding="async"
                    height={112}
                    onError={() => {
                      markImageSourceFailed(image);
                    }}
                    src={image}
                    width={112}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="sazo-product-detail-primary-media">
            {failedImageSources.has(currentImage) ? (
              <div
                aria-label={t("sazo.views.productDetail.gallery.imageUnavailable", {
                  product: product.name,
                })}
                className="sazo-product-detail-image-placeholder"
                data-testid="product-main-image-placeholder"
                role="img"
              >
                <ImageOff aria-hidden size={52} strokeWidth={1.45} />
                <span>{t("sazo.views.productDetail.gallery.unavailable")}</span>
              </div>
            ) : (
              <motion.img
                alt={product.name}
                animate={{ opacity: 1, scale: 1 }}
                className="sazo-product-detail-image"
                decoding="async"
                height={760}
                initial={reduceMotion ? false : { opacity: 0.25, scale: 0.99 }}
                key={`${product.id}-${String(currentGalleryIndex)}`}
                onError={() => {
                  markImageSourceFailed(currentImage);
                }}
                src={currentImage}
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                width={760}
              />
            )}
            {gallery.length > 1 ? (
              <>
                <button
                  aria-label={t("sazo.views.productDetail.gallery.previous")}
                  className="sazo-product-detail-gallery-arrow sazo-product-detail-gallery-arrow-previous"
                  onClick={() => {
                    setGalleryIndex(currentGalleryIndex - 1);
                  }}
                  type="button"
                >
                  <ChevronLeft aria-hidden size={22} strokeWidth={2.2} />
                </button>
                <button
                  aria-label={t("sazo.views.productDetail.gallery.next")}
                  className="sazo-product-detail-gallery-arrow sazo-product-detail-gallery-arrow-next"
                  onClick={() => {
                    setGalleryIndex(currentGalleryIndex + 1);
                  }}
                  type="button"
                >
                  <ChevronRight aria-hidden size={22} strokeWidth={2.2} />
                </button>
              </>
            ) : null}
          </div>
        </section>

        <aside className="sazo-product-detail-purchase-panel">
          <ProductSourceLink
            brand={product.brand}
            href={detail.originalUrl}
            label={t("sazo.views.productDetail.source.openOriginal")}
          />
          <div className="sazo-product-detail-source-row">
            <div>
              <span className="sazo-product-detail-eyebrow">
                {t("sazo.views.productDetail.source.label", {
                  brand: product.brand,
                })}
              </span>
              <span className="sazo-product-detail-category">{detail.categoryLabel}</span>
            </div>
            <div className="sazo-product-detail-quick-actions">
              <button
                aria-label={t("sazo.views.productDetail.actions.share")}
                onClick={handleShare}
                type="button"
              >
                <Share2 aria-hidden size={19} strokeWidth={1.9} />
              </button>
              <button
                aria-label={
                  favorite
                    ? t("sazo.views.productDetail.actions.favoriteRemove")
                    : t("sazo.views.productDetail.actions.favoriteAdd")
                }
                aria-pressed={favorite}
                onClick={() => {
                  setFavorite((current) => !current);
                }}
                type="button"
              >
                <Heart
                  aria-hidden
                  fill={favorite ? "currentColor" : "none"}
                  size={20}
                  strokeWidth={1.9}
                />
              </button>
            </div>
          </div>

          <h1>{product.name}</h1>
          <p className="sazo-product-detail-original-name">{detail.originalName}</p>
          <p className="sazo-product-detail-price">{product.price}</p>
          <p className="sazo-product-detail-direct-copy">
            <Sparkles aria-hidden size={18} strokeWidth={1.9} />
            {t("sazo.views.productDetail.directPurchase")}
          </p>

          <div className="sazo-product-detail-metadata">
            <div className="sazo-product-detail-metadata-row">
              <Store aria-hidden size={19} strokeWidth={1.9} />
              <div>
                <span>{t("sazo.views.productDetail.metadata.purchaseType")}</span>
                <strong>
                  {t(
                    `sazo.views.productDetail.metadata.purchaseTypes.${detail.purchaseTypeId}`,
                  )}
                </strong>
              </div>
            </div>
            <div className="sazo-product-detail-metadata-row">
              <Truck aria-hidden size={19} strokeWidth={1.9} />
              <div>
                <span>{t("sazo.views.productDetail.metadata.deliveryEstimate")}</span>
                <strong>
                  {t("sazo.views.productDetail.metadata.deliveryEstimateValue", {
                    days: detail.deliveryEstimateDays,
                  })}
                </strong>
              </div>
            </div>
            <div className="sazo-product-detail-metadata-row">
              <ShieldCheck aria-hidden size={19} strokeWidth={1.9} />
              <div>
                <span>{t("sazo.views.productDetail.metadata.support")}</span>
                <strong>{t("sazo.views.productDetail.metadata.details")}</strong>
              </div>
            </div>
          </div>

          {shareFeedback === null ? null : (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="sazo-product-detail-feedback"
              data-kind="success"
              initial={reduceMotion ? false : { opacity: 0, y: 5 }}
              role="status"
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              {shareFeedback}
            </motion.p>
          )}

          <ProductPurchasePanel
            announceFeedback
            controller={purchaseController}
            detail={detail}
            idPrefix="hero"
            reduceMotion={reduceMotion}
            showMobileActions
          />
        </aside>
      </div>

      <ProductRecommendationRail dispatch={dispatch} products={recommendations} />

      <div className="sazo-product-detail-commerce-grid">
        <aside className="sazo-product-detail-checkout-rail">
          <ProductPurchasePanel
            controller={purchaseController}
            detail={detail}
            idPrefix="sticky"
            reduceMotion={reduceMotion}
          />
        </aside>

        <div className="sazo-product-detail-left-flow">
          <section className="sazo-product-detail-section sazo-product-detail-information">
            <div
              aria-label={t("sazo.views.productDetail.tabs.label")}
              className="sazo-product-detail-tabs"
              role="tablist"
            >
              {productDetailTabs.map((tab, index) => (
                <button
                  aria-controls="sazo-product-detail-tabpanel"
                  aria-selected={activeTab === tab.id}
                  id={`sazo-product-${tab.id}-tab`}
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  onKeyDown={(event) => {
                    handleTabKeyDown(event, index);
                  }}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  role="tab"
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  type="button"
                >
                  {t(`sazo.views.productDetail.${tab.labelKey}`)}
                </button>
              ))}
            </div>
            <div
              aria-labelledby={`sazo-product-${activeTab}-tab`}
              className="sazo-product-detail-tabpanel"
              id="sazo-product-detail-tabpanel"
              role="tabpanel"
            >
              {activeTab === "information" ? (
                <>
                  <ProductOrderFlow compact />
                  <div id="sazo-product-detail-order-details">
                    <h2>{t("sazo.views.productDetail.tabs.informationTitle")}</h2>
                    <p>{detail.information}</p>
                  </div>
                </>
              ) : (
                <>
                  <h2>{t("sazo.views.productDetail.tabs.cautionsTitle")}</h2>
                  <p>{t("sazo.views.productDetail.tabs.cautionsBody")}</p>
                </>
              )}
            </div>
          </section>

          <ProductCampaignBanner />

          <section className="sazo-product-detail-section sazo-product-detail-review">
            <div className="sazo-product-detail-section-heading">
              <div>
                <span>{t("sazo.views.productDetail.review.eyebrow")}</span>
                <h2>{t("sazo.views.productDetail.review.title")}</h2>
              </div>
            </div>
            <div className="sazo-product-detail-review-empty">
              <MessageSquareText aria-hidden size={28} strokeWidth={1.7} />
              <p>{t("sazo.views.productDetail.review.empty")}</p>
              <span>{t("sazo.views.productDetail.review.emptyBody")}</span>
            </div>
          </section>

          <section
            className="sazo-product-detail-section sazo-product-detail-cautions"
            id="sazo-product-detail-cautions"
          >
            <div className="sazo-product-detail-section-heading">
              <div>
                <span>{t("sazo.views.productDetail.cautions.eyebrow")}</span>
                <h2>{t("sazo.views.productDetail.cautions.title")}</h2>
              </div>
            </div>
            <div className="sazo-product-detail-card-grid">
              {cautionCards.map(({ copyKey, titleKey }) => (
                <article className="sazo-product-detail-caution-card" key={titleKey}>
                  <ShieldCheck aria-hidden size={23} strokeWidth={1.8} />
                  <h3>{t(`sazo.views.productDetail.${titleKey}`)}</h3>
                  <p>{t(`sazo.views.productDetail.${copyKey}`)}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="sazo-product-detail-section sazo-product-detail-benefits">
            <div className="sazo-product-detail-section-heading">
              <div>
                <span>{t("sazo.views.productDetail.benefits.eyebrow")}</span>
                <h2>{t("sazo.views.productDetail.benefits.title")}</h2>
              </div>
            </div>
            <div className="sazo-product-detail-card-grid">
              {benefitCards.map(({ copyKey, icon: Icon, titleKey }) => (
                <article className="sazo-product-detail-benefit-card" key={titleKey}>
                  <span className="sazo-product-detail-benefit-icon">
                    <Icon aria-hidden size={25} strokeWidth={1.9} />
                  </span>
                  <h3>{t(`sazo.views.productDetail.${titleKey}`)}</h3>
                  <p>{t(`sazo.views.productDetail.${copyKey}`)}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.article>
  );
}
