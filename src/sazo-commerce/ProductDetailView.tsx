import type { Dispatch, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  Heart,
  Home,
  MessageSquareText,
  PackageCheck,
  Search,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "@/sazo-commerce/ProductCard";
import {
  catalogInventory,
  getProductDetail,
  products,
  reviewRecommendations,
  searchDiscoveryProducts,
} from "@/sazo-commerce/fixtures";
import type { Product } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";

export interface ProductDetailViewProps {
  dispatch: Dispatch<SazoAction>;
  productId: string | null;
}

type ProductDetailTab = "information" | "cautions";
type PurchaseIntent = "cart" | "buy";

interface PurchaseFeedback {
  kind: "error" | "success";
  message: string;
}

const productDetailTabs = [
  { id: "information", label: "商品情報" },
  { id: "cautions", label: "注意事項" },
] as const satisfies readonly { id: ProductDetailTab; label: string }[];

const orderStages = [
  { icon: Check, label: "注文受付" },
  { icon: Store, label: "日本で購入" },
  { icon: PackageCheck, label: "日本倉庫で検品" },
  { icon: Truck, label: "国際配送・通関" },
  { icon: Home, label: "ブラジルへお届け" },
] as const;

const cautionCards = [
  {
    title: "販売元の在庫について",
    copy: "販売元の在庫状況により、購入できない場合があります。購入可否は注文受付後に確認します。",
  },
  {
    title: "ブラジルの輸入制限",
    copy: "商品によってはブラジルへ輸入できない場合があります。購入前に対象品目をご確認ください。",
  },
  {
    title: "返品・返金サポート",
    copy: "商品違い・破損などは、状況を確認したうえで返品・返金手続きをサポートします。",
  },
] as const;

const benefitCards = [
  {
    icon: CircleDollarSign,
    title: "料金がわかりやすい",
    copy: "商品価格と手続きに必要な費用を、購入前にひとつの画面で確認できます。",
  },
  {
    icon: Search,
    title: "日本の商品をまとめて検索",
    copy: "複数の販売サイトを行き来せず、気になる日本の商品をまとめて探せます。",
  },
  {
    icon: MessageSquareText,
    title: "利用者レビューで選べる",
    copy: "実際に購入した利用者のレビューを、商品選びの参考にできます。",
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
  const detail = getProductDetail(productId);
  const { product } = detail;
  const gallery = detail.gallery.length > 0 ? detail.gallery : [product.image];
  const recommendations = detail.recommendationIds
    .map((recommendationId) => recommendationById.get(recommendationId))
    .filter(isProduct);
  const reduceMotion = useReducedMotion() ?? false;
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [requestText, setRequestText] = useState("");
  const [imageCheck, setImageCheck] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("information");
  const [feedback, setFeedback] = useState<PurchaseFeedback | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const purchaseFormRef = useRef<HTMLFormElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentGalleryIndex = Math.min(activeGalleryIndex, gallery.length - 1);
  const currentImage = gallery[currentGalleryIndex] ?? product.image;

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

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
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

  const handlePurchase = (intent: PurchaseIntent) => {
    if (selectedOption === "") {
      setFeedback({
        kind: "error",
        message: "商品オプションを選択してください。",
      });
      selectRef.current?.focus();
      return;
    }

    if (intent === "cart") {
      setFeedback({ kind: "success", message: "カートに追加しました。" });
      return;
    }

    setFeedback({ kind: "success", message: "購入手続きへ進みます。" });
    dispatch({ type: "open-login" });
  };

  const handleShare = () => {
    if (typeof navigator.share === "function") {
      void navigator
        .share({ title: product.name, url: window.location.href })
        .then(() => {
          setFeedback({ kind: "success", message: "商品情報を共有しました。" });
        })
        .catch(() => {
          setFeedback({ kind: "success", message: "共有をキャンセルしました。" });
        });
      return;
    }

    setFeedback({ kind: "success", message: "商品ページのURLを共有できます。" });
  };

  const moveToPurchaseForm = () => {
    purchaseFormRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    selectRef.current?.focus();
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
        <button
          className="sazo-product-detail-back"
          onClick={() => {
            dispatch({ type: "close-product" });
          }}
          type="button"
        >
          <ArrowLeft aria-hidden size={22} strokeWidth={2} />
          戻る
        </button>
        <span className="sazo-product-detail-header-title">{product.name}</span>
        <button
          aria-label="ホームへ戻る"
          className="sazo-product-detail-header-control"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <Home aria-hidden size={21} strokeWidth={2} />
        </button>
        <button
          aria-label="カート"
          className="sazo-product-detail-header-control"
          onClick={moveToPurchaseForm}
          type="button"
        >
          <ShoppingCart aria-hidden size={21} strokeWidth={2} />
        </button>
      </header>

      <div className="sazo-product-detail-hero">
        <section aria-label="商品画像" className="sazo-product-detail-gallery">
          <div aria-label="商品画像一覧" className="sazo-product-detail-thumbnails">
            {gallery.map((image, index) => (
              <button
                aria-current={index === currentGalleryIndex ? "true" : undefined}
                aria-label={`画像${String(index + 1)}を表示`}
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
                <img alt="" decoding="async" height={112} src={image} width={112} />
              </button>
            ))}
          </div>

          <div className="sazo-product-detail-primary-media">
            <motion.img
              alt={product.name}
              animate={{ opacity: 1, scale: 1 }}
              className="sazo-product-detail-image"
              decoding="async"
              height={760}
              initial={reduceMotion ? false : { opacity: 0.25, scale: 0.99 }}
              key={`${product.id}-${String(currentGalleryIndex)}`}
              src={currentImage}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              width={760}
            />
            {gallery.length > 1 ? (
              <>
                <button
                  aria-label="前の画像"
                  className="sazo-product-detail-gallery-arrow sazo-product-detail-gallery-arrow-previous"
                  onClick={() => {
                    setGalleryIndex(currentGalleryIndex - 1);
                  }}
                  type="button"
                >
                  <ChevronLeft aria-hidden size={22} strokeWidth={2.2} />
                </button>
                <button
                  aria-label="次の画像"
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
          <div className="sazo-product-detail-source-row">
            <div>
              <span className="sazo-product-detail-eyebrow">
                日本の販売サイト · {product.brand}
              </span>
              <span className="sazo-product-detail-category">{detail.categoryLabel}</span>
            </div>
            <div className="sazo-product-detail-quick-actions">
              {detail.originalUrl === undefined ? null : (
                <a
                  aria-label="販売元の商品ページを開く"
                  href={detail.originalUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden size={19} strokeWidth={1.9} />
                </a>
              )}
              <button aria-label="商品情報を共有" onClick={handleShare} type="button">
                <Share2 aria-hidden size={19} strokeWidth={1.9} />
              </button>
              <button
                aria-label={favorite ? "お気に入りから削除" : "お気に入りに追加"}
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
            日本の販売サイトから直接購入
          </p>

          <form
            aria-labelledby="sazo-product-purchase-heading"
            className="sazo-product-detail-purchase-form"
            onSubmit={(event) => {
              event.preventDefault();
            }}
            ref={purchaseFormRef}
          >
            <h2 id="sazo-product-purchase-heading">購入内容</h2>
            <label htmlFor="sazo-product-option">
              {detail.optionLabel}
              <span aria-hidden className="sazo-product-detail-required">
                必須
              </span>
            </label>
            <select
              aria-label={detail.optionLabel}
              id="sazo-product-option"
              onChange={(event) => {
                setSelectedOption(event.target.value);
                setFeedback(null);
              }}
              ref={selectRef}
              required
              value={selectedOption}
            >
              <option value="">選択してください</option>
              {detail.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label htmlFor="sazo-product-request">ご要望</label>
            <textarea
              id="sazo-product-request"
              onChange={(event) => {
                setRequestText(event.target.value);
              }}
              placeholder="色・仕様などのご希望があれば入力してください"
              rows={3}
              value={requestText}
            />

            <label className="sazo-product-detail-check" htmlFor="sazo-product-image-check">
              <input
                checked={imageCheck}
                id="sazo-product-image-check"
                onChange={(event) => {
                  setImageCheck(event.target.checked);
                }}
                type="checkbox"
              />
              <span>画像にチェック</span>
            </label>

            <details className="sazo-product-detail-total" data-testid="product-total">
              <summary>合計の内訳</summary>
              <dl>
                <div>
                  <dt>商品価格</dt>
                  <dd>{product.price}</dd>
                </div>
                <div className="sazo-product-detail-total-final">
                  <dt>合計</dt>
                  <dd>{product.price}</dd>
                </div>
              </dl>
            </details>

            <p className="sazo-product-detail-purchase-note">{detail.purchaseNote}</p>

            <div className="sazo-product-detail-purchase-actions">
              <button
                className="sazo-product-detail-cart-button"
                onClick={() => {
                  handlePurchase("cart");
                }}
                type="button"
              >
                カートに入れる
              </button>
              <button
                className="sazo-product-detail-buy-button"
                onClick={() => {
                  handlePurchase("buy");
                }}
                type="button"
              >
                今すぐ買う
              </button>
            </div>

            {feedback === null ? null : (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="sazo-product-detail-feedback"
                data-kind={feedback.kind}
                initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                key={`${feedback.kind}-${feedback.message}`}
                role={feedback.kind === "error" ? "alert" : "status"}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              >
                {feedback.message}
              </motion.p>
            )}
          </form>
        </aside>
      </div>

      <section className="sazo-product-detail-section sazo-product-detail-recommendations">
        <div className="sazo-product-detail-section-heading">
          <div>
            <span>RECOMMEND</span>
            <h2>この商品はいかがですか？</h2>
          </div>
        </div>
        <div className="sazo-product-detail-recommendation-track">
          {recommendations.map((recommendation) => (
            <ProductCard
              key={recommendation.id}
              onOpen={(recommendationId) => {
                dispatch({ type: "open-product", productId: recommendationId });
              }}
              product={recommendation}
              variant="compact"
            />
          ))}
        </div>
      </section>

      <section className="sazo-product-detail-section sazo-product-detail-order">
        <div className="sazo-product-detail-section-heading">
          <div>
            <span>ORDER FLOW</span>
            <h2>ご注文からお届けまで</h2>
          </div>
        </div>
        <div className="sazo-product-detail-timeline-scroll">
          <ol aria-label="注文からお届けまで" className="sazo-product-detail-timeline">
            {orderStages.map(({ icon: Icon, label }, index) => (
              <li data-stage={index + 1} key={label}>
                <span className="sazo-product-detail-stage-icon">
                  <Icon aria-hidden size={23} strokeWidth={1.9} />
                </span>
                <span className="sazo-product-detail-stage-number">STEP {index + 1}</span>
                <strong>{label}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sazo-product-detail-section sazo-product-detail-information">
        <div aria-label="商品詳細" className="sazo-product-detail-tabs" role="tablist">
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
              {tab.label}
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
              <h2>J-Planetが日本で購入・検品し、ブラジルへお届けします</h2>
              <p>{detail.information}</p>
            </>
          ) : (
            <>
              <h2>購入前にご確認ください</h2>
              <p>
                在庫や輸入可否は商品ごとに異なります。下記の注意事項をご確認のうえ、
                ご注文ください。
              </p>
            </>
          )}
        </div>
      </section>

      <section className="sazo-product-detail-section sazo-product-detail-review">
        <div className="sazo-product-detail-section-heading">
          <div>
            <span>REVIEW</span>
            <h2>商品レビュー</h2>
          </div>
        </div>
        <div className="sazo-product-detail-review-empty">
          <MessageSquareText aria-hidden size={28} strokeWidth={1.7} />
          <p>レビューがありません。</p>
          <span>購入後の感想が、次のお客様の商品選びに役立ちます。</span>
        </div>
      </section>

      <section className="sazo-product-detail-section sazo-product-detail-cautions">
        <div className="sazo-product-detail-section-heading">
          <div>
            <span>CAUTIONS</span>
            <h2>ご購入前の注意事項</h2>
          </div>
        </div>
        <div className="sazo-product-detail-card-grid">
          {cautionCards.map(({ copy, title }) => (
            <article className="sazo-product-detail-caution-card" key={title}>
              <ShieldCheck aria-hidden size={23} strokeWidth={1.8} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sazo-product-detail-section sazo-product-detail-benefits">
        <div className="sazo-product-detail-section-heading">
          <div>
            <span>J-PLANET BENEFITS</span>
            <h2>なぜJ-Planetなのか？</h2>
          </div>
        </div>
        <div className="sazo-product-detail-card-grid">
          {benefitCards.map(({ copy, icon: Icon, title }) => (
            <article className="sazo-product-detail-benefit-card" key={title}>
              <span className="sazo-product-detail-benefit-icon">
                <Icon aria-hidden size={25} strokeWidth={1.9} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <div aria-label="購入操作" className="sazo-product-mobile-purchase" role="group">
        <div>
          <span>商品価格</span>
          <strong>{product.price}</strong>
        </div>
        <button
          className="sazo-product-detail-cart-button"
          onClick={() => {
            handlePurchase("cart");
          }}
          type="button"
        >
          カートに入れる
        </button>
        <button
          className="sazo-product-detail-buy-button"
          onClick={() => {
            handlePurchase("buy");
          }}
          type="button"
        >
          今すぐ買う
        </button>
      </div>
    </motion.article>
  );
}
