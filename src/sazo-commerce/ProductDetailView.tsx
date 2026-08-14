import type { Dispatch, KeyboardEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  CircleCheck,
  ClipboardCheck,
  ExternalLink,
  Heart,
  Home,
  ImageOff,
  Info,
  MessageCircle,
  MessageSquareText,
  Minus,
  MoreVertical,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  ThumbsUp,
  Truck,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ProductOrderFlow } from "@/sazo-commerce/ProductOrderFlow";
import { ProductPurchasePanel } from "@/sazo-commerce/ProductPurchasePanel";
import { ProductRecommendationRail } from "@/sazo-commerce/ProductRecommendationRail";
import { ProductSourceLink } from "@/sazo-commerce/ProductSourceLink";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import {
  catalogInventory,
  getProductDetail,
  formatYen,
  products,
  referenceProducts,
  reviews,
  reviewRecommendations,
  searchDiscoveryProducts,
} from "@/sazo-commerce/fixtures";
import type {
  Product,
  ProductContentBlock,
  ProductSpecification,
} from "@/sazo-commerce/fixtures";
import {
  JPLANET_PRODUCT_DETAIL_ID,
  type SazoAction,
} from "@/sazo-commerce/model";
import { useProductPurchaseController } from "@/sazo-commerce/useProductPurchaseController";
import type { PurchaseIntent } from "@/sazo-commerce/useProductPurchaseController";

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
  ...referenceProducts,
  ...searchDiscoveryProducts,
  ...catalogInventory.map(({ product }) => product),
  ...reviewRecommendations.map(({ product }) => product),
];

const recommendationById = new Map(
  recommendationPool.map((product) => [product.id, product] as const),
);

type ReferenceNintendoMobileScreen =
  | "product"
  | "delivery"
  | "track"
  | "reviews"
  | "controller";

type ControllerReviewFilter = "all" | "media" | "five-star";

const controllerGalleryVariants = [
  {
    color: "ブラック",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
  },
  {
    color: "ホワイト",
    image: "/sazo-commerce/reference/nintendo-pro-controller-white-v1.png",
  },
  {
    color: "スプラトゥーン",
    image: "/sazo-commerce/reference/nintendo-pro-controller-splatoon-v1.png",
  },
] as const;

const controllerPurchaseVariants = [
  {
    color: "ブラック",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    stockLabel: "在庫あり",
    available: true,
  },
  {
    color: "ホワイト",
    image: "/sazo-commerce/reference/nintendo-pro-controller-white-v1.png",
    stockLabel: "在庫あり",
    available: true,
  },
  {
    color: "スプラトゥーン",
    image: "/sazo-commerce/reference/nintendo-pro-controller-splatoon-v1.png",
    stockLabel: "売り切れ",
    available: false,
  },
] as const;

const controllerProductReviews = [
  {
    id: "camila",
    reviewer: "Camila R.",
    rating: 5,
    variant: "ブラック",
    date: "2026.08.09",
    helpful: 24,
    text: "操作感がとても良く、長時間遊んでも疲れにくいです。ブラジルへの配送も予定どおりで、梱包もきれいでした。",
    tags: ["予定どおり到着", "梱包が丁寧"],
    image: "/sazo-commerce/reference/nintendo-pro-review-1-v1.png",
  },
  {
    id: "bruno",
    reviewer: "Bruno S.",
    rating: 5,
    variant: "ホワイト",
    date: "2026.08.03",
    helpful: 18,
    text: "本体との接続もすぐにできました。正規品らしいしっかりした質感で、子どもと一緒に使っています。",
    tags: ["接続が簡単", "品質が良い"],
    image: "/sazo-commerce/reference/nintendo-pro-review-2-v1.png",
  },
  {
    id: "marina",
    reviewer: "Marina T.",
    rating: 4,
    variant: "スプラトゥーン",
    date: "2026.07.27",
    helpful: 11,
    text: "グリップが安定していて、アクションゲームでも使いやすいです。到着日を追跡できたのも安心でした。",
    tags: ["使いやすい", "追跡できて安心"],
    image: "/sazo-commerce/reference/nintendo-pro-review-3-v1.png",
  },
] as const;

function ProductRatingStars({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <span aria-label={`${rating} / 5`} className="sazo-reference-nintendo-rating-stars">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          aria-hidden
          fill={index < rating ? "currentColor" : "none"}
          key={index}
          size={size}
          strokeWidth={1.9}
        />
      ))}
    </span>
  );
}

function descriptionBlocksFor(
  product: Product,
  fallbackInformation: string,
): readonly ProductContentBlock[] {
  return product.descriptionBlocks ?? [
    {
      id: "legacy-description",
      type: "paragraph",
      text: fallbackInformation,
    },
  ];
}

function ProductDescriptionBlocks({
  blocks,
  onOpenImage,
}: {
  blocks: readonly ProductContentBlock[];
  onOpenImage: (image: { src: string; alt: string }) => void;
}) {
  return (
    <div className="sazo-reference-nintendo-description-blocks">
      {blocks.map((block) => {
        if (block.type === "heading") {
          const Heading = block.level === 2 ? "h3" : "h4";
          return <Heading key={block.id}>{block.text}</Heading>;
        }

        if (block.type === "paragraph") {
          return <p key={block.id}>{block.text}</p>;
        }

        if (block.type === "bulletList") {
          return (
            <ul key={block.id}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "specTable") {
          return (
            <dl className="sazo-reference-nintendo-description-spec-table" key={block.id}>
              {block.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          );
        }

        if (block.type === "image") {
          return (
            <figure
              className="sazo-reference-nintendo-description-image"
              key={block.id}
              style={{ aspectRatio: block.aspectRatio }}
            >
              <button
                aria-label={`${block.alt}を拡大`}
                onClick={() => onOpenImage(block)}
                type="button"
              >
                <img alt={block.alt} loading="lazy" src={block.src} />
              </button>
              {block.caption !== undefined ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === "imageGallery") {
          return (
            <div
              aria-label="商品説明の画像"
              className="sazo-reference-nintendo-description-gallery"
              key={block.id}
            >
              {block.images.map((image) => (
                <figure key={image.src}>
                  <button
                    aria-label={`${image.alt}を拡大`}
                    onClick={() => onOpenImage(image)}
                    type="button"
                  >
                    <img alt={image.alt} loading="lazy" src={image.src} />
                  </button>
                  {image.caption !== undefined ? <figcaption>{image.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          );
        }

        return <hr key={block.id} />;
      })}
    </div>
  );
}

function ProductSpecificationSheet({
  onClose,
  specifications,
}: {
  onClose: () => void;
  specifications: readonly ProductSpecification[];
}) {
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        className="sazo-reference-nintendo-specification-scrim"
        onClick={onClose}
      />
      <section
        aria-labelledby="jplanet-product-specification-sheet-title"
        aria-modal="true"
        className="sazo-reference-nintendo-specification-sheet"
        onTouchEnd={(event) => {
          const startY = touchStartY.current;
          touchStartY.current = null;
          if (startY !== null && event.changedTouches[0] !== undefined) {
            if (event.changedTouches[0].clientY - startY > 72) onClose();
          }
        }}
        onTouchStart={(event) => {
          touchStartY.current = event.touches[0]?.clientY ?? null;
        }}
        role="dialog"
      >
        <span aria-hidden className="sazo-reference-nintendo-specification-handle" />
        <header>
          <h2 id="jplanet-product-specification-sheet-title">商品仕様</h2>
          <button aria-label="商品仕様を閉じる" onClick={onClose} type="button">
            <X aria-hidden size={21} />
          </button>
        </header>
        <div className="sazo-reference-nintendo-specification-sheet-body">
          <dl>
            {specifications.map((specification) => (
              <div key={specification.label}>
                <dt>{specification.label}</dt>
                <dd>{specification.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

const relatedNintendoProducts = [
  {
    id: "pro-controller",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    name: "Nintendo Switch\nProコントローラー",
    price: "R$ 429",
    seller: "Nintendo 公式",
    target: "controller",
  },
  {
    id: "carrying-case",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
    name: "Nintendo Switch\nキャリングケース",
    price: "R$ 188",
    seller: "Rakuten Japan",
    target: "controller",
  },
  {
    id: "joy-con",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
    name: "Joy-Con (L)/(R)",
    price: "R$ 512",
    seller: "Nintendo 公式",
    target: "controller",
  },
  {
    id: "switch-oled",
    image: "/sazo-commerce/reference/nintendo-switch-oled.png",
    name: "Nintendo Switch OLED",
    price: "R$ 2,184",
    seller: "Rakuten Japan",
    target: "switch",
  },
  {
    id: "wireless-controller",
    image: "/sazo-commerce/reference/game-controller.png",
    name: "ワイヤレス\nゲームコントローラー",
    price: "R$ 318",
    seller: "Nintendo 公式",
    target: "controller",
  },
  {
    id: "controller-case",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
    name: "Proコントローラー\n収納ケース",
    price: "R$ 164",
    seller: "Rakuten Japan",
    target: "controller",
  },
  {
    id: "joy-con-pair",
    image: "/sazo-commerce/reference/nintendo-joycon-v1.png",
    name: "Joy-Con ネオン\nブルー／レッド",
    price: "R$ 512",
    seller: "Nintendo 公式",
    target: "controller",
  },
  {
    id: "switch-console",
    image: "/sazo-commerce/reference/nintendo-switch-oled.png",
    name: "Nintendo Switch\n本体セット",
    price: "R$ 2,184",
    seller: "Rakuten Japan",
    target: "switch",
  },
  {
    id: "controller-black",
    image: "/sazo-commerce/reference/nintendo-pro-controller-v1.png",
    name: "Nintendo Switch\nProコントローラー ブラック",
    price: "R$ 429",
    seller: "Nintendo 公式",
    target: "controller",
  },
  {
    id: "travel-case",
    image: "/sazo-commerce/reference/nintendo-switch-case-v1.png",
    name: "Nintendo Switch\nトラベルケース",
    price: "R$ 218",
    seller: "Rakuten Japan",
    target: "controller",
  },
] as const;

function NintendoRelatedProducts({
  onOpenController,
  onOpenSwitch,
}: {
  onOpenController: () => void;
  onOpenSwitch: () => void;
}) {
  return (
    <section className="sazo-reference-nintendo-related">
      <h2>一緒に検討されている商品</h2>
      <p>同じカテゴリーから選んだ日本の商品 10件</p>
      <div data-testid="jplanet-related-product-list">
        {relatedNintendoProducts.map((item) => (
          <button
            aria-label={`${item.name.replace("\n", " ")}の商品詳細を見る`}
            key={item.id}
            onClick={() => {
              if (item.target === "switch") {
                onOpenSwitch();
                return;
              }

              onOpenController();
            }}
            type="button"
          >
            <img alt="" aria-hidden src={item.image} />
            <b>
              {item.name.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </b>
            <small>{item.seller}</small>
            <strong>{item.price}</strong>
            <em>
              購入可否を確認 <ChevronRight aria-hidden size={16} />
            </em>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReferenceNintendoHeader({
  dispatch,
  onBack,
  title,
}: {
  dispatch: Dispatch<SazoAction>;
  onBack: () => void;
  title?: string;
}) {
  return (
    <header
      className="sazo-reference-nintendo-header"
      data-has-title={title === undefined ? "false" : "true"}
    >
      {title === undefined ? (
        <>
          <button aria-label="戻る" onClick={onBack} type="button">
            <ArrowLeft aria-hidden size={27} strokeWidth={2.15} />
          </button>
          <button
            aria-label="J-Planet ホーム"
            onClick={() => dispatch({ type: "navigate", view: "home" })}
            type="button"
          >
            <JplanetLogo />
          </button>
        </>
      ) : (
        <>
          <button
            aria-label="J-Planet ホーム"
            onClick={() => dispatch({ type: "navigate", view: "home" })}
            type="button"
          >
            <JplanetLogo />
          </button>
          <strong>{title}</strong>
        </>
      )}
      <button
        aria-label="カート"
        onClick={() => dispatch({ type: "navigate", view: "cart" })}
        type="button"
      >
        <ShoppingCart aria-hidden size={30} strokeWidth={2.05} />
        <span>3</span>
      </button>
      <button
        aria-label="チャット"
        onClick={() => dispatch({ type: "open-chat" })}
        type="button"
      >
        <MessageSquareText aria-hidden size={30} strokeWidth={1.95} />
      </button>
    </header>
  );
}

/**
 * The product media header intentionally does not reuse the global J-Planet
 * header. It sits over the product image and keeps the purchase journey in
 * context while offering a quick route back to the purchasing agent.
 */
function ProductMediaHeader({
  dispatch,
  onBack,
  productInfoRef,
  productName,
}: {
  dispatch: Dispatch<SazoAction>;
  onBack: () => void;
  productInfoRef: RefObject<HTMLElement | null>;
  productName: string;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const [surface, setSurface] = useState<"transparent" | "solid">("transparent");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  useEffect(() => {
    let frame: number | null = null;
    let active = true;
    let currentSurface: "transparent" | "solid" = "transparent";

    const updateSurface = () => {
      frame = null;
      if (!active) return;

      const header = headerRef.current;
      const productInformation = productInfoRef.current;
      if (header === null || productInformation === null) return;

      const headerRect = header.getBoundingClientRect();
      const productInformationRect = productInformation.getBoundingClientRect();
      // JSDOM does not calculate layout boxes. Keep the intended initial state
      // there while real layouts are always judged from the two live elements.
      const canMeasureLayout = headerRect.height > 0 || productInformationRect.top !== 0;
      const nextSurface =
        canMeasureLayout && productInformationRect.top <= headerRect.height
          ? "solid"
          : "transparent";
      if (nextSurface !== currentSurface) {
        currentSurface = nextSurface;
        setSurface(nextSurface);
      }
    };

    const scheduleSurfaceUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateSurface);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(scheduleSurfaceUpdate);

    resizeObserver?.observe(headerRef.current!);
    if (productInfoRef.current !== null) {
      resizeObserver?.observe(productInfoRef.current);
    }

    scheduleSurfaceUpdate();
    window.addEventListener("scroll", scheduleSurfaceUpdate, { passive: true });
    window.addEventListener("resize", scheduleSurfaceUpdate);

    return () => {
      active = false;
      window.removeEventListener("scroll", scheduleSurfaceUpdate);
      window.removeEventListener("resize", scheduleSurfaceUpdate);
      resizeObserver?.disconnect();
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [productInfoRef]);

  const productUrl = typeof window === "undefined" ? "" : window.location.href;
  const shareText = `${productName} ${productUrl}`.trim();

  const shareWithWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareProduct = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: productName, text: productName, url: productUrl });
        return;
      } catch {
        // A cancelled native sheet is intentionally quiet.
        return;
      }
    }

    try {
      await navigator.clipboard?.writeText(productUrl);
      setShareFeedback("商品URLをコピーしました");
    } catch {
      setShareFeedback("商品URLをコピーできませんでした");
    }
  };

  return (
    <header
      className="sazo-product-media-header"
      data-header-surface={surface}
      data-testid="jplanet-product-media-header"
      ref={headerRef}
    >
      <button aria-label="戻る" onClick={onBack} type="button">
        <ArrowLeft aria-hidden size={23} strokeWidth={2.2} />
      </button>
      <div className="sazo-product-media-agent-search" role="search">
        <button
          aria-label="AI検索を開く"
          onClick={() => dispatch({ type: "navigate", view: "agent-hub" })}
          type="button"
        >
          <Search aria-hidden size={19} strokeWidth={2} />
          <span>AI検索</span>
        </button>
      </div>
      <button aria-label="WhatsAppで共有" onClick={shareWithWhatsApp} type="button">
        <MessageCircle aria-hidden size={22} strokeWidth={2} />
      </button>
      <button aria-label="商品を共有" onClick={() => void shareProduct()} type="button">
        <Share2 aria-hidden size={22} strokeWidth={2} />
      </button>
      <button
        aria-label="カート"
        className="sazo-product-media-cart"
        onClick={() => dispatch({ type: "navigate", view: "cart" })}
        type="button"
      >
        <ShoppingCart aria-hidden size={24} strokeWidth={2.1} />
        <span>3</span>
      </button>
      <button
        aria-controls="jplanet-product-menu"
        aria-expanded={isMenuOpen}
        aria-label="商品メニュー"
        onClick={() => setIsMenuOpen((open) => !open)}
        type="button"
      >
        <MoreVertical aria-hidden size={23} strokeWidth={2} />
      </button>
      {isMenuOpen ? (
        <div className="sazo-product-media-menu" id="jplanet-product-menu" role="menu">
          <button
            onClick={() => {
              void shareProduct();
              setIsMenuOpen(false);
            }}
            role="menuitem"
            type="button"
          >
            商品URLをコピー
          </button>
          <button
            onClick={() => {
              setShareFeedback("商品を保存しました");
              setIsMenuOpen(false);
            }}
            role="menuitem"
            type="button"
          >
            商品を保存
          </button>
        </div>
      ) : null}
      {shareFeedback.length > 0 ? <span className="sazo-visually-hidden" role="status">{shareFeedback}</span> : null}
    </header>
  );
}

function ReferenceNintendoFooter({
  onCart,
  onPurchase,
}: {
  onCart: () => void;
  onPurchase: () => void;
}) {
  return (
    <footer className="sazo-reference-nintendo-footer">
      <button onClick={onCart} type="button">
        <ShoppingCart aria-hidden size={22} strokeWidth={2} />
        カートに入れる
      </button>
      <button onClick={onPurchase} type="button">
        購入に進む
      </button>
      <small>バリアントを選択して次へ</small>
    </footer>
  );
}

function MobileReferenceProductDetail({
  detail,
  dispatch,
}: {
  detail: ReturnType<typeof getProductDetail>;
  dispatch: Dispatch<SazoAction>;
}) {
  const { product } = detail;
  const [variantSheetOpen, setVariantSheetOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedModel, setSelectedModel] = useState("OLED");
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [mobileScreen, setMobileScreen] =
    useState<ReferenceNintendoMobileScreen>("controller");
  const [controllerThumbnail, setControllerThumbnail] = useState(0);
  const [controllerColor, setControllerColor] = useState("ブラック");
  const [controllerQuantity, setControllerQuantity] = useState(1);
  const [isControllerSaved, setIsControllerSaved] = useState(false);
  const [isControllerSpecificationSheetOpen, setIsControllerSpecificationSheetOpen] =
    useState(false);
  const [isControllerDescriptionOpen, setIsControllerDescriptionOpen] = useState(false);
  const [expandedDescriptionImage, setExpandedDescriptionImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [controllerSheetIntent, setControllerSheetIntent] = useState<
    "cart" | "purchase" | null
  >(null);
  const [reviewFilter, setReviewFilter] = useState<ControllerReviewFilter>("all");
  const [reviewSearch, setReviewSearch] = useState("");
  const productInformationRef = useRef<HTMLElement>(null);
  const controllerDescriptionRef = useRef<HTMLElement>(null);
  const controllerSpecifications = product.specifications ?? [
    { label: "対応機種", value: "Nintendo Switch / Nintendo Switch OLED" },
    { label: "接続方式", value: "Bluetooth / USB Type-C" },
  ];
  const controllerDescriptionBlocks = descriptionBlocksFor(product, detail.information);
  const controllerDescriptionCanCollapse =
    controllerDescriptionBlocks.length > 1 ||
    controllerDescriptionBlocks.some(
      (block) => block.type === "paragraph" && block.text.length > 220,
    );
  const controllerSpecificationSummary =
    controllerSpecifications.find((specification) => specification.label === "接続方式")?.value ??
    controllerSpecifications[0]?.value;
  const activeControllerGalleryVariant =
    controllerGalleryVariants[controllerThumbnail] ?? controllerGalleryVariants[0]!;
  const visibleControllerReviews = controllerProductReviews.filter((review) => {
    if (reviewFilter === "media" && review.image === undefined) return false;
    if (reviewFilter === "five-star" && review.rating !== 5) return false;

    const query = reviewSearch.trim().toLocaleLowerCase("ja-JP");
    if (query.length === 0) return true;

    return [review.reviewer, review.variant, review.text, ...review.tags]
      .join(" ")
      .toLocaleLowerCase("ja-JP")
      .includes(query);
  });
  const openMobileScreen = (screen: ReferenceNintendoMobileScreen) => {
    setMobileScreen(screen);
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ behavior: "instant", top: 0 });
    }
  };

  const openVariantSheet = () => {
    setVariantSheetOpen(true);
  };

  const openControllerSheet = (intent: "cart" | "purchase") => {
    setControllerSheetIntent(intent);
  };

  const closeControllerSheet = () => {
    setControllerSheetIntent(null);
  };

  const closeControllerDescription = () => {
    setIsControllerDescriptionOpen(false);
    if (!navigator.userAgent.includes("jsdom")) {
      window.requestAnimationFrame(() => {
        controllerDescriptionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const completeControllerIntent = () => {
    dispatch({
      type: "add-to-cart",
      item: {
        option: `Proコントローラー / ${controllerColor}`,
        productId: "jplanet-nintendo-pro-controller",
        quantity: controllerQuantity,
      },
    });
    closeControllerSheet();
    dispatch({ type: "navigate", view: "cart" });
  };

  const returnToProduct = () => {
    setMobileScreen("controller");
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ behavior: "instant", top: 0 });
    }
  };

  const scrollToController = () => {
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  };

  const renderInlineFollowup = () => (
    <section
      aria-label="購入後の参考情報"
      className="sazo-reference-nintendo-scroll-section sazo-reference-nintendo-scroll-followup"
      data-testid="jplanet-inline-followup"
    >
      <section
        aria-labelledby="jplanet-review-preview-title"
        className="sazo-reference-nintendo-review-preview"
        data-testid="jplanet-product-review-preview"
      >
        <div className="sazo-reference-nintendo-review-preview-heading">
          <div>
            <h2 id="jplanet-review-preview-title">購入者レビュー</h2>
            <button
              aria-label="すべてのレビューを見る"
              onClick={() => openMobileScreen("reviews")}
              type="button"
            >
              もっと見る <ChevronRight aria-hidden size={19} />
            </button>
          </div>
          <button
            aria-label="すべてのレビューを見る"
            className="sazo-reference-nintendo-review-summary"
            onClick={() => openMobileScreen("reviews")}
            type="button"
          >
            <strong>4.8</strong>
            <ProductRatingStars rating={5} size={16} />
            <span>128件のレビュー</span>
            <ChevronRight aria-hidden size={19} />
          </button>
        </div>
        <div className="sazo-reference-nintendo-review-preview-list">
          {controllerProductReviews.map((review) => (
            <article key={review.id}>
              <div className="sazo-reference-nintendo-review-card-head">
                <span aria-hidden>{review.reviewer.slice(0, 1)}</span>
                <b>{review.reviewer}</b>
                <small>{review.date}</small>
              </div>
              <ProductRatingStars rating={review.rating} size={15} />
              <p>バリアント：{review.variant}</p>
              <div>
                <span>{review.text}</span>
                <img alt={`${review.reviewer}のレビュー写真`} src={review.image} />
              </div>
              <footer>
                {review.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </footer>
            </article>
          ))}
        </div>
        <button
          className="sazo-reference-nintendo-review-preview-more"
          onClick={() => openMobileScreen("reviews")}
          type="button"
        >
          もっと見る（128件） <ChevronRight aria-hidden size={19} />
        </button>
      </section>
      <NintendoRelatedProducts
        onOpenController={scrollToController}
        onOpenSwitch={() => openMobileScreen("delivery")}
      />
    </section>
  );

  const renderProductReviews = () => (
    <article
      className="sazo-reference-nintendo-subpage sazo-reference-nintendo-reviews"
      data-testid="jplanet-product-reviews"
    >
      <ReferenceNintendoHeader dispatch={dispatch} onBack={returnToProduct} />
      <main>
        <header className="sazo-reference-nintendo-reviews-title">
          <h1>商品レビュー</h1>
          <p>Nintendo Switch Proコントローラー</p>
        </header>
        <section aria-label="レビューの平均評価" className="sazo-reference-nintendo-reviews-overview">
          <strong>4.8</strong>
          <div>
            <ProductRatingStars rating={5} size={20} />
            <b>128件のレビュー</b>
            <span>J-Planetで購入を確認したお客様の声</span>
          </div>
        </section>
        <div aria-label="レビューの絞り込み" className="sazo-reference-nintendo-review-filters">
          {[
            ["all", "すべて 128"],
            ["media", "写真付き 36"],
            ["five-star", "5つ星"],
          ].map(([filter, label]) => (
            <button
              aria-pressed={reviewFilter === filter}
              key={filter}
              onClick={() => setReviewFilter(filter as ControllerReviewFilter)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <label className="sazo-reference-nintendo-review-search">
          <Search aria-hidden size={19} />
          <input
            aria-label="レビューを検索"
            onChange={(event) => setReviewSearch(event.target.value)}
            placeholder="レビューを検索"
            type="search"
            value={reviewSearch}
          />
        </label>
        <section aria-label="レビュー一覧" className="sazo-reference-nintendo-review-list">
          {visibleControllerReviews.length > 0 ? (
            visibleControllerReviews.map((review) => (
              <article key={review.id}>
                <div className="sazo-reference-nintendo-review-card-head">
                  <span aria-hidden>{review.reviewer.slice(0, 1)}</span>
                  <b>{review.reviewer}</b>
                  <button type="button">
                    <ThumbsUp aria-hidden size={17} /> 役に立った（{review.helpful}）
                  </button>
                </div>
                <ProductRatingStars rating={review.rating} size={19} />
                <p>バリアント：{review.variant}</p>
                <strong>{review.text}</strong>
                <div className="sazo-reference-nintendo-review-media">
                  <img alt={`${review.reviewer}のレビュー写真`} src={review.image} />
                </div>
                <small>{review.date}</small>
              </article>
            ))
          ) : (
            <p className="sazo-reference-nintendo-reviews-empty">該当するレビューがありません。</p>
          )}
        </section>
      </main>
      <ReferenceNintendoFooter
        onCart={() => openControllerSheet("cart")}
        onPurchase={() => openControllerSheet("purchase")}
      />
    </article>
  );

  const renderDeliveryDetail = () => (
    <article
      className="sazo-reference-nintendo-subpage"
      data-testid="jplanet-delivery-detail"
    >
      <ReferenceNintendoHeader dispatch={dispatch} onBack={returnToProduct} />
      <main>
        <h1>配送・通関の詳細</h1>
        <div className="sazo-reference-nintendo-product-summary">
          <img alt="Nintendo Switch OLED" src={product.image} />
          <div>
            <strong>Nintendo Switch OLED</strong>
            <span>購入可能</span>
          </div>
        </div>
        <section className="sazo-reference-nintendo-detail-card">
          <h2>到着予定</h2>
          <div className="sazo-reference-nintendo-timeline">
            <span>
              <Box aria-hidden size={22} />
            </span>
            <p>
              日本での手配 <b>注文確定後 1〜2日</b>
            </p>
            <span>
              <Truck aria-hidden size={22} />
            </span>
            <p>
              ブラジル到着予定 <b>8〜12日</b>
            </p>
          </div>
          <small>到着日は配送状況により前後する場合があります。</small>
        </section>
        <section className="sazo-reference-nintendo-detail-card sazo-reference-nintendo-confirmed-card">
          <h2>確認した内容</h2>
          <button type="button">
            <Store aria-hidden size={23} />
            <b>販売元</b>
            <span>Rakuten Japan 公式ストアを確認</span>
            <ChevronRight aria-hidden size={20} />
          </button>
          <button type="button">
            <ShoppingCart aria-hidden size={23} />
            <b>購入可否</b>
            <span>ブラジルへの購入条件を確認</span>
            <ChevronRight aria-hidden size={20} />
          </button>
          <button type="button">
            <ShieldCheck aria-hidden size={23} />
            <b>通関</b>
            <span>輸入に必要な確認を実施</span>
            <ChevronRight aria-hidden size={20} />
          </button>
        </section>
        <p className="sazo-reference-nintendo-info">
          <Info aria-hidden size={23} />
          バリアントにより、総額と到着予定が変わる場合があります。
        </p>
      </main>
      <ReferenceNintendoFooter onCart={openVariantSheet} onPurchase={openVariantSheet} />
    </article>
  );

  const renderTrackRecord = () => (
    <article
      className="sazo-reference-nintendo-subpage sazo-reference-nintendo-track"
      data-testid="jplanet-delivery-record"
    >
      <ReferenceNintendoHeader
        dispatch={dispatch}
        onBack={returnToProduct}
        title="Nintendo Switch OLED"
      />
      <main>
        <div className="sazo-reference-nintendo-track-title">
          <div>
            <h1>J-Planetの到着実績</h1>
            <p>この商品をブラジルへ届けた記録</p>
          </div>
          <span>
            <BadgeCheck aria-hidden size={21} />
            確認済みの購入のみ
          </span>
        </div>
        <section className="sazo-reference-nintendo-record-stats">
          <div>
            <strong>
              12<small>件</small>
            </strong>
            <span>到着済み</span>
          </div>
          <div>
            <b>平均</b>
            <strong>
              +0.8<small>日</small>
            </strong>
          </div>
          <div>
            <b>状態報告</b>
            <strong>
              12<small>/12</small>
            </strong>
          </div>
        </section>
        <button
          className="sazo-reference-nintendo-delivery-link"
          onClick={() => openMobileScreen("delivery")}
          type="button"
        >
          配送・通関の詳細を見る <ChevronRight aria-hidden size={23} />
        </button>
        <hr />
        <section className="sazo-reference-nintendo-customer-voice">
          <h2>
            到着したお客様の声{" "}
            <button type="button">
              すべて見る <ChevronRight aria-hidden size={20} />
            </button>
          </h2>
          <div>
            <img alt="Nintendo Switch OLED" src={product.image} />
            <p>
              <b>J-Planetで購入・São Paulo</b>
              <span>予定どおり到着</span>
              <span>梱包に問題なし</span>
              <small>到着予定の範囲内で、商品もきれいな状態でした。</small>
            </p>
          </div>
        </section>
        <NintendoRelatedProducts
          onOpenController={() => openMobileScreen("controller")}
          onOpenSwitch={() => openMobileScreen("product")}
        />
      </main>
      <ReferenceNintendoFooter onCart={openVariantSheet} onPurchase={openVariantSheet} />
    </article>
  );

  const renderController = () => (
    <article
      className="sazo-reference-nintendo-controller"
      data-product-detail
      data-testid="jplanet-controller-result"
    >
      <ProductMediaHeader
        dispatch={dispatch}
        onBack={() => dispatch({ type: "close-product" })}
        productInfoRef={productInformationRef}
        productName="Nintendo Switch Proコントローラー"
      />
      <main>
        <section
          aria-label="Nintendo Switch Proコントローラーの商品画像"
          className="sazo-reference-nintendo-controller-media"
        >
          <img
            alt={`Nintendo Switch Proコントローラー ${activeControllerGalleryVariant.color}`}
            className="sazo-reference-nintendo-controller-hero"
            src={activeControllerGalleryVariant.image}
          />
          <span aria-hidden className="sazo-reference-nintendo-controller-media-count">
            {controllerThumbnail + 1}/{controllerGalleryVariants.length}
          </span>
        </section>
        <section
          aria-label="カラーを選択"
          className="sazo-reference-nintendo-controller-variant-rail"
          data-testid="jplanet-controller-variant-rail"
        >
          <div className="sazo-reference-nintendo-controller-variant-rail-heading">
            <p>カラーを選ぶ</p>
            <span>{controllerGalleryVariants.length}色のバリエーション</span>
          </div>
          <div className="sazo-reference-nintendo-controller-thumbnails">
            {controllerGalleryVariants.map((variant, index) => (
              <button
                aria-current={controllerThumbnail === index ? "true" : undefined}
                aria-label={`${variant.color}を表示`}
                key={variant.color}
                onClick={() => setControllerThumbnail(index)}
                type="button"
              >
                <img alt="" src={variant.image} />
                <span>{variant.color}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="sazo-reference-nintendo-controller-purchase-column">
          <div
            className="sazo-reference-nintendo-controller-heading"
            data-testid="jplanet-product-information"
            ref={(element) => {
              productInformationRef.current = element;
            }}
          >
            <div className="sazo-reference-nintendo-controller-title">
              <h1>Nintendo Switch Proコントローラー</h1>
            </div>
            <div className="sazo-reference-nintendo-controller-source">
              <span>Nintendo</span>
              <b>Nintendo 公式</b>
              <a href={detail.originalUrl} rel="noreferrer" target="_blank">
                <ExternalLink aria-hidden size={15} />
                元ページを開く
              </a>
            </div>
          </div>
          <section aria-label="価格情報" className="sazo-reference-nintendo-controller-price">
            <div className="sazo-reference-nintendo-controller-price-main">
              <strong>R$ 429〜</strong>
              <del>R$ 498</del>
              <em>-14%</em>
            </div>
            <div className="sazo-reference-nintendo-controller-price-meta">
              <span>30mil+ 購入済み</span>
              <button
                aria-label={isControllerSaved ? "お気に入りから削除" : "お気に入りに追加"}
                aria-pressed={isControllerSaved}
                onClick={() => setIsControllerSaved((saved) => !saved)}
                type="button"
              >
                <Heart
                  aria-hidden
                  fill={isControllerSaved ? "currentColor" : "none"}
                  size={24}
                  strokeWidth={1.9}
                />
              </button>
            </div>
          </section>
          <section
            aria-label="通常日本商品"
            className="sazo-reference-nintendo-variant-info"
          >
            <strong>通常日本商品</strong>
            <span>日本の素敵な商品をすぐにお届けします。</span>
          </section>
          <section aria-label="通関配送情報" className="sazo-reference-nintendo-estimate">
            <div className="sazo-reference-nintendo-estimate-header">
              <p>
                <b>通関配送情報</b>
                <span>
                  ご注文確定後に配送状況を更新します <Info aria-hidden size={14} />
                </span>
              </p>
              <button
                aria-label="配送・通関の詳細を開く"
                onClick={() => openMobileScreen("delivery")}
                type="button"
              >
                詳細 <ChevronRight aria-hidden size={16} />
              </button>
            </div>
            <dl>
              <div>
                <dt>国内配送</dt>
                <dd>日本国内：1〜2日</dd>
              </div>
              <div>
                <dt>国際配送</dt>
                <dd>日本→ブラジル：7〜10日</dd>
              </div>
            </dl>
          </section>
          <button
            className="sazo-reference-nintendo-review-line"
            onClick={() => openMobileScreen("reviews")}
            type="button"
          >
            <b>元ページの商品レビュー</b>
            <span>4.8 ★ (864件)・Nintendo 公式</span>
            <ChevronRight aria-hidden size={21} />
          </button>
          <section
            aria-label="商品仕様"
            className="sazo-reference-nintendo-product-specification"
          >
            <button
              aria-haspopup="dialog"
              aria-label="商品仕様を開く"
              onClick={() => setIsControllerSpecificationSheetOpen(true)}
              type="button"
            >
              <b>商品仕様</b>
              <span>{controllerSpecificationSummary}</span>
              <ChevronRight aria-hidden size={20} />
            </button>
          </section>
          <section
            aria-labelledby="jplanet-controller-description-title"
            className="sazo-reference-nintendo-product-description"
            ref={controllerDescriptionRef}
          >
            <h2 id="jplanet-controller-description-title">商品説明</h2>
            <div
              className="sazo-reference-nintendo-product-description-content"
              data-expanded={isControllerDescriptionOpen}
              id="jplanet-controller-product-description"
            >
              <ProductDescriptionBlocks
                blocks={controllerDescriptionBlocks}
                onOpenImage={setExpandedDescriptionImage}
              />
            </div>
            {controllerDescriptionCanCollapse ? (
              <button
                aria-controls="jplanet-controller-product-description"
                aria-expanded={isControllerDescriptionOpen}
                aria-label={
                  isControllerDescriptionOpen ? "商品説明を閉じる" : "商品説明をもっと見る"
                }
                className="sazo-reference-nintendo-product-description-toggle"
                onClick={() => {
                  if (isControllerDescriptionOpen) {
                    closeControllerDescription();
                  } else {
                    setIsControllerDescriptionOpen(true);
                  }
                }}
                type="button"
              >
                {isControllerDescriptionOpen ? "閉じる" : "もっと見る"}
                {isControllerDescriptionOpen ? (
                  <ChevronUp aria-hidden size={18} />
                ) : (
                  <ChevronDown aria-hidden size={18} />
                )}
              </button>
            ) : null}
          </section>
        </section>
        {renderInlineFollowup()}
      </main>
      <footer className="sazo-reference-nintendo-footer sazo-reference-nintendo-controller-footer">
        <button onClick={() => openControllerSheet("cart")} type="button">
          <ShoppingCart aria-hidden size={22} strokeWidth={2} />
          カートに入れる
        </button>
        <button onClick={() => openControllerSheet("purchase")} type="button">
          購入に進む
        </button>
        <small>バリアントを選択して次へ</small>
      </footer>
      {isControllerSpecificationSheetOpen ? (
        <ProductSpecificationSheet
          onClose={() => setIsControllerSpecificationSheetOpen(false)}
          specifications={controllerSpecifications}
        />
      ) : null}
      {expandedDescriptionImage !== null ? (
        <>
          <div
            aria-hidden="true"
            className="sazo-reference-nintendo-description-lightbox-scrim"
            onClick={() => setExpandedDescriptionImage(null)}
          />
          <section
            aria-label={`${expandedDescriptionImage.alt}の拡大表示`}
            aria-modal="true"
            className="sazo-reference-nintendo-description-lightbox"
            role="dialog"
          >
            <button
              aria-label="拡大画像を閉じる"
              onClick={() => setExpandedDescriptionImage(null)}
              type="button"
            >
              <X aria-hidden size={22} />
            </button>
            <img alt={expandedDescriptionImage.alt} src={expandedDescriptionImage.src} />
          </section>
        </>
      ) : null}
      {controllerSheetIntent !== null ? (
        <>
          <div
            aria-hidden="true"
            className="sazo-reference-controller-sheet-scrim"
            onClick={closeControllerSheet}
          />
          <section
            aria-label={
              controllerSheetIntent === "cart"
                ? "Proコントローラーをカートに入れる"
                : "Proコントローラーの購入手続き"
            }
            aria-modal="true"
            className="sazo-reference-controller-purchase-sheet"
            role="dialog"
          >
            <span aria-hidden className="sazo-reference-controller-sheet-handle" />
            <div className="sazo-reference-controller-sheet-product">
              <img
                alt="Nintendo Switch Proコントローラー"
                src="/sazo-commerce/reference/nintendo-pro-controller-v1.png"
              />
              <div>
                <strong>Nintendo Switch Proコントローラー</strong>
                <b>Nintendo 公式</b>
                <em>購入可能</em>
                <span>R$ 429</span>
                <small>
                  税金・国際送料を含む見込み <Info aria-hidden size={16} />
                </small>
              </div>
            </div>
            <section className="sazo-reference-controller-sheet-colors">
              <h2>カラーを選ぶ</h2>
              <div>
                {controllerPurchaseVariants.map((variant) => {
                  const selected = controllerColor === variant.color;

                  return (
                    <button
                      aria-disabled={!variant.available}
                      aria-pressed={selected}
                      className={variant.available ? undefined : "is-sold-out"}
                      disabled={!variant.available}
                      key={variant.color}
                      onClick={() => setControllerColor(variant.color)}
                      type="button"
                    >
                      <img alt="" aria-hidden src={variant.image} />
                      <span>
                        <b>{variant.color}</b>
                        <small>{variant.stockLabel}</small>
                      </span>
                      {selected ? <CircleCheck aria-hidden size={20} /> : null}
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="sazo-reference-controller-sheet-quantity">
              <h2>数量</h2>
              <div aria-label="数量">
                <button
                  aria-label="数量を減らす"
                  disabled={controllerQuantity === 1}
                  onClick={() =>
                    setControllerQuantity((current) => Math.max(1, current - 1))
                  }
                  type="button"
                >
                  <Minus aria-hidden size={20} />
                </button>
                <span>{controllerQuantity}</span>
                <button
                  aria-label="数量を増やす"
                  onClick={() => setControllerQuantity((current) => current + 1)}
                  type="button"
                >
                  <Plus aria-hidden size={20} />
                </button>
              </div>
            </section>
            <p className="sazo-reference-controller-sheet-info">
              <Info aria-hidden size={26} />
              {controllerSheetIntent === "cart"
                ? "選択後、この商品をカートに追加します"
                : "選択後、この商品を購入手続きへ進めます"}
            </p>
            <p className="sazo-reference-controller-sheet-checked">
              <ClipboardCheck aria-hidden size={23} />
              販売元・通関・配送条件を確認済み
            </p>
            <button
              className="sazo-reference-controller-sheet-confirm"
              onClick={completeControllerIntent}
              type="button"
            >
              {controllerSheetIntent === "cart" ? "カートに入れる" : "購入手続きへ"}
            </button>
            <small className="sazo-reference-controller-sheet-note">
              {controllerSheetIntent === "cart"
                ? "あとから他の商品も追加できます"
                : "配送先と支払い方法を選択して次へ"}
            </small>
          </section>
        </>
      ) : null}
    </article>
  );

  if (mobileScreen === "delivery") return renderDeliveryDetail();
  if (mobileScreen === "track") return renderTrackRecord();
  if (mobileScreen === "reviews") return renderProductReviews();
  if (mobileScreen === "controller") return renderController();

  const productThumbnails = [
    { label: "本体セット", position: "center" },
    { label: "ドック", position: "34% center" },
    { label: "Joy-Con", position: "72% center" },
    { label: "携帯モード", position: "88% center" },
  ] as const;

  const addReferenceCart = () => {
    dispatch({
      type: "add-to-cart",
      item: {
        option: `${selectedColor} / ${selectedModel}`,
        productId: product.id,
        quantity: 1,
      },
    });
    dispatch({
      type: "add-to-cart",
      item: { option: "27.0cm", productId: "jplanet-new-balance-9060", quantity: 1 },
    });
    dispatch({
      type: "add-to-cart",
      item: { option: "Black / 本体のみ", productId: "jplanet-sony-a7c-ii", quantity: 1 },
    });
    setVariantSheetOpen(false);
    dispatch({ type: "navigate", view: "cart" });
  };

  return (
    <article
      className="sazo-mobile-reference-product sazo-mobile-retrieved-product"
      data-product-detail
      data-testid="jplanet-fetched-product"
    >
      <ProductMediaHeader
        dispatch={dispatch}
        onBack={() => dispatch({ type: "close-product" })}
        productInfoRef={productInformationRef}
        productName={product.name}
      />
      <section
        className="sazo-retrieved-product-gallery"
        aria-label="Nintendo Switch OLEDの商品画像"
      >
        <img
          alt={product.name}
          className="sazo-mobile-reference-product-image"
          src={product.image}
        />
        <div
          className="sazo-retrieved-product-thumbnails"
          aria-label="商品バリエーション画像"
        >
          {productThumbnails.map(({ label, position }, index) => (
            <button
              aria-current={activeThumbnail === index ? "true" : undefined}
              aria-label={`${label}を表示`}
              key={label}
              onClick={() => setActiveThumbnail(index)}
              type="button"
            >
              <img alt="" src={product.image} style={{ objectPosition: position }} />
            </button>
          ))}
        </div>
      </section>
      <main
        data-testid="jplanet-product-information"
        ref={(element) => {
          productInformationRef.current = element;
        }}
      >
        <div className="sazo-retrieved-product-title-row">
          <h1>{product.name}</h1>
        </div>
        <div className="sazo-retrieved-product-source-row">
          <p>
            <span>Nintendo</span>
            <b>Nintendo</b>
            <i aria-hidden />
            Rakuten Japan 公式ストア
          </p>
          <a href={detail.originalUrl} rel="noreferrer" target="_blank">
            <ExternalLink aria-hidden size={14} strokeWidth={2.1} />
            元ページを開く
          </a>
        </div>
        <section className="sazo-retrieved-product-total" aria-label="ブラジル到着総額">
          <span>ブラジル到着総額</span>
          <strong>R$ 2,184</strong>
          <div>
            <small>
              税金・国際送料を含む見込み <Info aria-hidden size={13} />
            </small>
            <button
              aria-expanded={isBreakdownOpen}
              onClick={() => setIsBreakdownOpen((current) => !current)}
              type="button"
            >
              {isBreakdownOpen ? "内訳を閉じる" : "内訳を見る"}
              <ChevronRight aria-hidden size={17} />
            </button>
          </div>
          {isBreakdownOpen ? (
            <p className="sazo-retrieved-product-breakdown" role="status">
              商品価格・国際送料・税金を含む到着見込み額です。
            </p>
          ) : null}
        </section>
        <section
          className="sazo-retrieved-product-checks"
          aria-labelledby="jplanet-retrieved-points"
        >
          <h2 id="jplanet-retrieved-points">限定ハイプラ商品詳細ポイント</h2>
          <div>
            <span>
              <CircleCheck aria-hidden size={35} />
              <b>購入可能</b>
            </span>
            <span>
              <Store aria-hidden size={34} />
              <b>販売元を確認</b>
            </span>
            <span>
              <ClipboardCheck aria-hidden size={34} />
              <b>通関を確認</b>
            </span>
          </div>
          <button onClick={() => openMobileScreen("delivery")} type="button">
            <Truck aria-hidden size={22} /> <b>配送期間</b>
            <span>8〜12日で到着予定</span>
          </button>
        </section>
        <section
          className="sazo-retrieved-product-reasons"
          aria-labelledby="jplanet-retrieved-reasons"
        >
          <h2 id="jplanet-retrieved-reasons">この商品を選んだ理由</h2>
          <p>
            <CircleCheck aria-hidden size={17} /> 日本公式ストアを確認
          </p>
          <p>
            <CircleCheck aria-hidden size={17} /> ブラジル到着総額を算出
          </p>
        </section>
        <button
          className="sazo-retrieved-product-review"
          onClick={() => openMobileScreen("track")}
          type="button"
        >
          <b>口コミを要約</b>
          <span>4.7（2,480）</span>
          <ChevronRight aria-hidden size={20} />
        </button>
      </main>
      <ReferenceNintendoFooter onCart={openVariantSheet} onPurchase={openVariantSheet} />
      {variantSheetOpen ? (
        <>
          <button
            aria-label="バリアント選択を閉じる"
            className="sazo-reference-variant-scrim"
            onClick={() => setVariantSheetOpen(false)}
            type="button"
          />
          <section
            aria-labelledby="sazo-reference-variant-title"
            aria-modal="true"
            className="sazo-reference-variant-sheet"
            role="dialog"
          >
            <span aria-hidden className="sazo-reference-variant-handle" />
            <div className="sazo-reference-variant-heading">
              <h2 id="sazo-reference-variant-title">バリアントを選択</h2>
              <button
                aria-label="バリアント選択を閉じる"
                onClick={() => setVariantSheetOpen(false)}
                type="button"
              >
                <X aria-hidden size={29} strokeWidth={1.8} />
              </button>
            </div>
            <div className="sazo-reference-variant-product">
              <img alt="Nintendo Switch OLED" src={product.image} />
              <div>
                <strong>Nintendo Switch OLED</strong>
                <span>
                  Rakuten Japan・公式ストア{" "}
                  <CircleCheck aria-hidden size={16} fill="currentColor" />
                </span>
                <small>ブラジル到着総額は選択後に更新</small>
              </div>
            </div>
            <div className="sazo-reference-variant-divider" />
            <fieldset className="sazo-reference-variant-options">
              <legend>カラー</legend>
              <div>
                {["White", "Red"].map((color) => {
                  const selected = selectedColor === color;
                  return (
                    <button
                      aria-pressed={selected}
                      className={selected ? "is-selected" : undefined}
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      type="button"
                    >
                      {color}
                      {selected ? (
                        <CircleCheck aria-hidden size={29} strokeWidth={1.6} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="sazo-reference-variant-options">
              <legend>モデル</legend>
              <div>
                {["Standard", "OLED"].map((model) => {
                  const selected = selectedModel === model;
                  return (
                    <button
                      aria-pressed={selected}
                      className={selected ? "is-selected" : undefined}
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      type="button"
                    >
                      {model}
                      {selected ? (
                        <CircleCheck aria-hidden size={29} strokeWidth={1.6} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="sazo-reference-variant-divider" />
            <p className="sazo-reference-variant-stock">
              <span aria-hidden />
              選択中のバリアントは在庫あり
            </p>
            <div className="sazo-reference-variant-note">
              <img alt="" aria-hidden src="/sazo-commerce/jplanet-sakura-mark.png" />
              <span>選択後に総額・配送日数を更新します</span>
            </div>
            <div className="sazo-reference-variant-actions">
              <button onClick={addReferenceCart} type="button">
                カートに入れる
              </button>
              <button onClick={addReferenceCart} type="button">
                購入に進む
              </button>
            </div>
          </section>
        </>
      ) : null}
    </article>
  );
}

function isProduct(product: Product | undefined): product is Product {
  return product !== undefined;
}

export function ProductDetailView({ dispatch, productId }: ProductDetailViewProps) {
  const { t } = useTranslation();
  const detail = getProductDetail(productId);
  const { product } = detail;
  const displayPrice =
    product.id === JPLANET_PRODUCT_DETAIL_ID ? "R$ 429〜" : product.price;
  const isReferenceNintendo = product.id === JPLANET_PRODUCT_DETAIL_ID;
  const gallery = detail.gallery.length > 0 ? detail.gallery : [product.image];
  const recommendations = detail.recommendationIds
    .map((recommendationId) => recommendationById.get(recommendationId))
    .filter(isProduct);
  const selectedRecommendationPool = recommendationPool
    .filter((candidate) => candidate.id !== product.id)
    .filter(
      (candidate, index, all) =>
        all.findIndex((item) => item.id === candidate.id) === index,
    )
    .slice(0, 10);
  const reduceMotion = useReducedMotion() ?? false;
  const purchaseController = useProductPurchaseController({ detail, dispatch });
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [failedImageSources, setFailedImageSources] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [favorite, setFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("information");
  const [openBenefitDetails, setOpenBenefitDetails] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [shippingGuideOpen, setShippingGuideOpen] = useState(false);
  const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false);
  const [purchaseSheetIntent, setPurchaseSheetIntent] = useState<PurchaseIntent | null>(
    null,
  );
  const [showAllSelectedRecommendations, setShowAllSelectedRecommendations] =
    useState(false);
  const galleryPointerStart = useRef<number | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentGalleryIndex = Math.min(activeGalleryIndex, gallery.length - 1);
  const currentImage = gallery[currentGalleryIndex] ?? product.image;
  const discountPercent = product.badge?.match(/(\d+)%/)?.[1];
  const discountAmount = discountPercent === undefined ? 0 : Number(discountPercent);
  const originalPriceAmount =
    discountAmount > 0
      ? Math.ceil(detail.unitPriceAmount / (1 - discountAmount / 100))
      : 0;
  const pointsAmount = Math.floor(detail.unitPriceAmount * 0.01);
  const demoReviews = reviews.slice(0, 5);
  const allBenefitsOpen = openBenefitDetails.size === benefitCards.length;

  const openPurchaseSheet = (intent: PurchaseIntent) => {
    setPurchaseSheetIntent(intent);
    setPurchaseSheetOpen(true);
  };

  const closePurchaseSheet = () => {
    setPurchaseSheetOpen(false);
    setPurchaseSheetIntent(null);
  };

  const toggleAllBenefits = () => {
    setOpenBenefitDetails(
      allBenefitsOpen ? new Set() : new Set(benefitCards.map(({ titleKey }) => titleKey)),
    );
  };

  const toggleBenefitDetails = (titleKey: string, open: boolean) => {
    setOpenBenefitDetails((current) => {
      const next = new Set(current);
      if (open) {
        next.add(titleKey);
      } else {
        next.delete(titleKey);
      }
      return next;
    });
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsResolving(false);
    }, 680);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [product.id]);

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

  // The J-Planet controller detail is the canonical product experience at
  // every breakpoint.  Desktop changes only its layout via CSS; it must not
  // fall back to the older SAZO-oriented product renderer (and its yen copy).
  if (isReferenceNintendo) {
    return <MobileReferenceProductDetail detail={detail} dispatch={dispatch} />;
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="sazo-product-detail"
      data-product-detail
      data-product-resolving={isResolving || undefined}
      data-view-content="product"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
    >
      {isResolving ? (
        <div
          aria-hidden="true"
          className="sazo-product-resolving"
          data-testid="product-resolving"
        >
          <div className="sazo-product-resolving-header">
            <button
              aria-label={t("sazo.views.productDetail.header.back")}
              onClick={handleBack}
              type="button"
            >
              <ArrowLeft aria-hidden size={20} strokeWidth={2} />
            </button>
            <span>{product.name}</span>
            <div>
              <Home aria-hidden size={19} strokeWidth={2} />
              <ShoppingCart aria-hidden size={19} strokeWidth={2} />
            </div>
          </div>
          <div className="sazo-product-resolving-body">
            <div className="sazo-product-resolving-image">
              <img alt="" src={product.image} />
              <span>J-Planet</span>
            </div>
            <p>少々お待ちください…</p>
            <strong>
              あなたのために
              <br />
              商品情報を取得しています！
            </strong>
            <small>
              <Info aria-hidden size={14} strokeWidth={2} />
              TIP / ご注文の際、特別なリクエストを入力していただけます。
            </small>
          </div>
        </div>
      ) : null}
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
          onClick={() => {
            dispatch({ type: "navigate", view: "cart" });
          }}
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

          <div
            className="sazo-product-detail-primary-media"
            onPointerDown={(event) => {
              galleryPointerStart.current = event.clientX;
            }}
            onPointerUp={(event) => {
              const start = galleryPointerStart.current;
              galleryPointerStart.current = null;
              if (start === null || gallery.length < 2) {
                return;
              }

              const delta = event.clientX - start;
              if (Math.abs(delta) < 44) {
                return;
              }
              setGalleryIndex(currentGalleryIndex + (delta < 0 ? 1 : -1));
            }}
          >
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
                <span className="sazo-product-detail-action-label">共有する</span>
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
                <span className="sazo-product-detail-action-label">お気に入り追加</span>
              </button>
            </div>
          </div>

          <h1>{product.name}</h1>
          <p className="sazo-product-detail-original-name">{detail.originalName}</p>
          {discountAmount > 0 ? (
            <div className="sazo-product-detail-discount">
              <span>↓ {discountAmount}% OFF</span>
              <del>{formatYen(originalPriceAmount)}</del>
              <strong>{displayPrice}</strong>
            </div>
          ) : (
            <p className="sazo-product-detail-price">{displayPrice}</p>
          )}
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
            <button
              className="sazo-product-detail-metadata-row sazo-product-detail-points-row"
              type="button"
            >
              <div>
                <span>ポイント</span>
                <strong>{pointsAmount}P (1%)</strong>
              </div>
              <ChevronRight aria-hidden size={19} strokeWidth={2} />
            </button>
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
            onPurchaseIntent={openPurchaseSheet}
            reduceMotion={reduceMotion}
            showMobileActions
          />
        </aside>
      </div>

      <ProductRecommendationRail dispatch={dispatch} products={recommendations} />

      <div className="sazo-product-detail-commerce-grid">
        <aside
          aria-label="ご注文"
          className="sazo-product-detail-checkout-rail"
          data-open={purchaseSheetOpen || undefined}
        >
          <div className="sazo-product-purchase-sheet-header">
            <strong>ご注文</strong>
            <button
              aria-label="注文シートを閉じる"
              onClick={closePurchaseSheet}
              type="button"
            >
              <X aria-hidden size={19} strokeWidth={2} />
            </button>
          </div>
          <ProductPurchasePanel
            controller={purchaseController}
            detail={detail}
            idPrefix="sticky"
            onPurchaseIntent={purchaseSheetOpen ? undefined : openPurchaseSheet}
            reduceMotion={reduceMotion}
            sheetIntent={
              purchaseSheetOpen ? (purchaseSheetIntent ?? undefined) : undefined
            }
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
                  <ProductOrderFlow
                    compact
                    onOpenDetails={() => {
                      setShippingGuideOpen(true);
                    }}
                  />
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

          <section className="sazo-product-detail-section sazo-product-detail-review">
            <div className="sazo-product-detail-section-heading">
              <div>
                <span>{t("sazo.views.productDetail.review.eyebrow")}</span>
                <h2>{t("sazo.views.productDetail.review.title")}</h2>
              </div>
            </div>
            <details className="sazo-product-detail-review-disclosure" open>
              <summary>{t("sazo.views.productDetail.review.viewAll")}</summary>
              <div
                className="sazo-product-detail-review-list"
                data-testid="product-review-list"
              >
                {demoReviews.map((review) => (
                  <article className="sazo-product-detail-review-card" key={review.id}>
                    <div className="sazo-product-detail-review-card-header">
                      <span aria-hidden className="sazo-product-detail-review-avatar">
                        {review.author.slice(0, 1)}
                      </span>
                      <div>
                        <strong>{review.author}</strong>
                        <span
                          aria-label={`${String(review.rating)}つ星`}
                          className="sazo-product-detail-review-stars"
                        >
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                    </div>
                    <p>{review.comment}</p>
                    <img alt={`${review.author}さんのレビュー写真`} src={review.image} />
                    <small>{review.productName}</small>
                  </article>
                ))}
              </div>
            </details>
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
              <button
                aria-expanded={allBenefitsOpen}
                className="sazo-product-detail-section-action"
                onClick={toggleAllBenefits}
                type="button"
              >
                {t(
                  allBenefitsOpen
                    ? "sazo.views.productDetail.benefits.collapse"
                    : "sazo.views.productDetail.benefits.viewAll",
                )}
              </button>
            </div>
            <div className="sazo-product-detail-card-grid">
              {benefitCards.map(({ copyKey, icon: Icon, titleKey }) => {
                const benefitId = titleKey.split(".").at(-2) ?? "";

                return (
                  <article className="sazo-product-detail-benefit-card" key={titleKey}>
                    <span className="sazo-product-detail-benefit-icon">
                      <Icon aria-hidden size={25} strokeWidth={1.9} />
                    </span>
                    <h3>{t(`sazo.views.productDetail.${titleKey}`)}</h3>
                    <p>{t(`sazo.views.productDetail.${copyKey}`)}</p>
                    <details
                      onToggle={(event) => {
                        toggleBenefitDetails(titleKey, event.currentTarget.open);
                      }}
                      open={openBenefitDetails.has(titleKey)}
                    >
                      <summary>{t("sazo.views.productDetail.benefits.details")}</summary>
                      <p>
                        {t(
                          `sazo.views.productDetail.benefits.cards.${benefitId}.details`,
                        )}
                      </p>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>

          <ProductRecommendationRail
            className="sazo-product-detail-selected-recommendations"
            dispatch={dispatch}
            eyebrowKey="sazo.views.productDetail.recommendations.selectedEyebrow"
            layout="grid"
            onShowMore={
              showAllSelectedRecommendations
                ? undefined
                : () => {
                    setShowAllSelectedRecommendations(true);
                  }
            }
            products={
              showAllSelectedRecommendations
                ? selectedRecommendationPool
                : selectedRecommendationPool.slice(0, 6)
            }
            testId="product-selected-recommendations"
            titleKey="sazo.views.productDetail.recommendations.selectedTitle"
          />
        </div>
      </div>

      {shippingGuideOpen ? (
        <div className="sazo-product-guide-backdrop" role="presentation">
          <section
            aria-labelledby="sazo-product-shipping-guide-title"
            aria-modal="true"
            className="sazo-product-shipping-guide"
            role="dialog"
          >
            <header>
              <div>
                <span>J-Planet</span>
                <h2 id="sazo-product-shipping-guide-title">国際配送に関するご案内</h2>
              </div>
              <button
                aria-label="配送案内を閉じる"
                onClick={() => {
                  setShippingGuideOpen(false);
                }}
                type="button"
              >
                <X aria-hidden size={20} strokeWidth={2} />
              </button>
            </header>
            <p>日本の販売サイトから購入し、検品後にブラジルまでお届けします。</p>
            <ol>
              {[
                ["手配開始", "日本の販売サイトで在庫と価格を確認します。"],
                ["手配完了", "商品を購入し、日本の倉庫へ移送します。"],
                ["検品完了", "到着した商品を確認し、配送準備を進めます。"],
                ["国際配送", "通関手続きを経てブラジルへ発送します。"],
                ["お届け", "ご指定の住所までお届けします。"],
              ].map(([title, copy], index) => (
                <li data-current={index === 1 || undefined} key={title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button
              className="sazo-product-shipping-guide-close"
              onClick={() => {
                setShippingGuideOpen(false);
              }}
              type="button"
            >
              閉じる
            </button>
          </section>
        </div>
      ) : null}
    </motion.article>
  );
}
