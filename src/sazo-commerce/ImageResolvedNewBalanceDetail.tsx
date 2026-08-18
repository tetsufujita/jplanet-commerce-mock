import { useRef, useState, type Dispatch } from "react";
import {
  Box,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Heart,
  Info,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  ThumbsUp,
  Truck,
  X,
} from "lucide-react";
import type {
  ProductContentBlock,
  ProductSpecification,
  SazoImagePath,
} from "@/sazo-commerce/fixtures";
import {
  ProductDescriptionBlocks,
  ProductMediaHeader,
  ProductRatingStars,
  ProductSpecificationSheet,
  ReferenceNintendoFooter,
  ReferenceNintendoHeader,
} from "@/sazo-commerce/ProductDetailView";
import {
  imageSearchNewBalanceDetail,
  imageSearchResolvedNewBalanceProductId,
} from "@/sazo-commerce/imageProductResolutionFixtures";
import type { CartItem, SazoAction } from "@/sazo-commerce/model";

interface ImageResolvedNewBalanceDetailProps {
  dispatch: Dispatch<SazoAction>;
}

type NewBalanceMobileScreen = "product" | "delivery" | "reviews";
type PurchaseIntent = "cart" | "purchase";
type ReviewFilter = "all" | "media" | "five-star";

const detail = imageSearchNewBalanceDetail;
const productName = detail.name;
const productImage = detail.gallery[0];

const gallery = detail.gallery.map((image, index) => ({
  id: `new-balance-gallery-${index + 1}`,
  image,
})) as readonly { id: string; image: SazoImagePath }[];

const specifications = [
  { label: "商品カテゴリ", value: "ライフスタイルスニーカー" },
  { label: "モデル", value: "New Balance 9060" },
  { label: "アッパー", value: "メッシュ / スエード" },
  { label: "カラー", value: "ホワイト／グリーン" },
  { label: "サイズ展開", value: "25.0cm〜26.5cm" },
  { label: "ソール", value: "ラバーソール" },
  { label: "重量", value: "約390g（片足）" },
  { label: "留め具", value: "シューレース" },
  { label: "メーカー", value: "New Balance" },
  { label: "商品状態", value: "新品" },
] as const satisfies readonly ProductSpecification[];

const descriptionBlocks = [
  {
    id: "new-balance-description-title",
    type: "heading",
    level: 2,
    text: "ボリューム感と履き心地を楽しむ。",
  },
  {
    id: "new-balance-description-copy",
    type: "paragraph",
    text: "メッシュとスエードの立体感、クッション性のあるソールが魅力のNew Balance 9060。日常のスタイリングに合わせやすく、長時間歩いても快適です。",
  },
  {
    id: "new-balance-description-image",
    type: "image",
    src: productImage,
    alt: "New Balance 9060 ホワイト／グリーンの正面",
    caption: "ホワイト／グリーン",
    aspectRatio: 1,
  },
  {
    id: "new-balance-description-features",
    type: "bulletList",
    items: [
      "メッシュとスエードを組み合わせたアッパー",
      "安定感のあるボリュームソール",
      "ホワイト／グリーンのカラーリング",
      "普段使いに合わせやすいライフスタイルモデル",
    ],
  },
  { id: "new-balance-description-divider", type: "divider" },
  {
    id: "new-balance-description-spec-title",
    type: "heading",
    level: 3,
    text: "主な仕様",
  },
  {
    id: "new-balance-description-specs",
    type: "specTable",
    rows: specifications.slice(1, 6),
  },
  {
    id: "new-balance-description-gallery",
    type: "imageGallery",
    images: [
      { src: productImage, alt: "New Balance 9060 正面" },
      {
        src: "/sazo-commerce/review-media/mika-sneakers-arrival-v1.png",
        alt: "New Balance 9060 到着時の写真",
      },
    ],
  },
] as const satisfies readonly ProductContentBlock[];

const reviews = [
  {
    id: "camila",
    reviewer: "Camila R.",
    rating: 5,
    variant: "ホワイト／グリーン・26.0cm",
    date: "2026.08.09",
    helpful: 24,
    text: "写真のイメージに近く、履き心地も良かったです。ブラジルへの配送も予定どおりで、梱包もきれいでした。",
    tags: ["予定どおり到着", "梱包が丁寧"],
    image: "/sazo-commerce/review-media/mika-sneakers-arrival-v1.png",
  },
  {
    id: "bruno",
    reviewer: "Bruno S.",
    rating: 5,
    variant: "グレー・25.5cm",
    date: "2026.08.03",
    helpful: 18,
    text: "サイズを選んでから購入できたので安心でした。クッション性があり、長く歩いても疲れにくいです。",
    tags: ["サイズが選びやすい", "履き心地が良い"],
    image: "/sazo-commerce/reference/new-balance-9060.png",
  },
  {
    id: "marina",
    reviewer: "Marina T.",
    rating: 4,
    variant: "ベージュ・25.0cm",
    date: "2026.07.27",
    helpful: 11,
    text: "ボリュームのある形がかわいく、普段の服にも合わせやすいです。到着日を追跡できたのも安心でした。",
    tags: ["合わせやすい", "追跡できて安心"],
    image: "/sazo-commerce/review-media/mika-sneakers-arrival-v1.png",
  },
] as const;

const relatedProducts = [
  { id: "nb-530", image: productImage, name: "New Balance\n530", price: "R$ 612" },
  { id: "nb-2002r", image: productImage, name: "New Balance\n2002R", price: "R$ 829" },
  { id: "nb-1906r", image: productImage, name: "New Balance\n1906R", price: "R$ 798" },
  { id: "nb-990v6", image: productImage, name: "New Balance\n990v6", price: "R$ 1,280" },
  {
    id: "air-jordan-1",
    image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
    name: "Air Jordan 1\nRetro High OG",
    price: "R$ 934",
  },
  { id: "nb-574", image: productImage, name: "New Balance\n574", price: "R$ 548" },
  { id: "nb-327", image: productImage, name: "New Balance\n327", price: "R$ 579" },
  { id: "nb-725", image: productImage, name: "New Balance\n725", price: "R$ 641" },
] as const;

function NewBalanceRelatedProducts() {
  return (
    <section className="sazo-reference-nintendo-related">
      <h2>一緒に検討されている商品</h2>
      <p>同じカテゴリーから選んだ日本の商品 10件</p>
      <div data-testid="jplanet-related-product-list">
        {relatedProducts.map((item) => (
          <button
            aria-label={`${item.name.replace("\n", " ")}の商品詳細を見る`}
            key={item.id}
            onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
            type="button"
          >
            <img alt="" aria-hidden src={item.image} />
            <b>
              {item.name.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </b>
            <small>New Balance Japan</small>
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

export function ImageResolvedNewBalanceDetail({
  dispatch,
}: ImageResolvedNewBalanceDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [mobileScreen, setMobileScreen] = useState<NewBalanceMobileScreen>("product");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [specificationOpen, setSpecificationOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const [purchaseIntent, setPurchaseIntent] = useState<PurchaseIntent | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(detail.colors[0].label);
  const [selectedSize, setSelectedSize] = useState<string>(detail.sizes[2]);
  const [quantity, setQuantity] = useState(1);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [reviewSearch, setReviewSearch] = useState("");
  const productInformationRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLElement>(null);
  const currentImage = gallery[activeImage] ?? gallery[0]!;
  const visibleReviews = reviews.filter((review) => {
    if (reviewFilter === "media" && review.image.length === 0) return false;
    if (reviewFilter === "five-star" && review.rating !== 5) return false;
    const query = reviewSearch.trim().toLocaleLowerCase("ja-JP");
    if (query.length === 0) return true;
    return [review.reviewer, review.variant, review.text, ...review.tags]
      .join(" ")
      .toLocaleLowerCase("ja-JP")
      .includes(query);
  });

  const returnToProduct = () => {
    setMobileScreen("product");
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ behavior: "instant", top: 0 });
    }
  };

  const openMobileScreen = (screen: Exclude<NewBalanceMobileScreen, "product">) => {
    setMobileScreen(screen);
    if (!navigator.userAgent.includes("jsdom")) {
      window.scrollTo({ behavior: "instant", top: 0 });
    }
  };

  const cartItem: CartItem = {
    option: `${selectedColor} / ${selectedSize}cm`,
    productId: imageSearchResolvedNewBalanceProductId,
    quantity,
  };

  const proceed = () => {
    if (purchaseIntent === "purchase") {
      dispatch({ type: "begin-checkout", items: [cartItem] });
      return;
    }
    dispatch({ type: "add-to-cart", item: cartItem });
    dispatch({ type: "navigate", view: "cart" });
  };

  const openPurchaseSheet = (intent: PurchaseIntent) => setPurchaseIntent(intent);
  const footer = (
    <ReferenceNintendoFooter
      onCart={() => openPurchaseSheet("cart")}
      onPurchase={() => openPurchaseSheet("purchase")}
    />
  );
  const purchaseSheet =
    purchaseIntent === null ? null : (
      <>
        <button
          aria-label="バリアント選択を閉じる"
          className="sazo-image-search-new-balance-sheet-scrim"
          onClick={() => setPurchaseIntent(null)}
          type="button"
        />
        <section
          aria-label={
            purchaseIntent === "cart"
              ? "New Balance 9060をカートに入れる"
              : "New Balance 9060の購入手続き"
          }
          aria-modal="true"
          className="sazo-image-search-new-balance-sheet"
          role="dialog"
        >
          <span aria-hidden className="sazo-image-search-new-balance-sheet-handle" />
          <header>
            <h2>カラー・サイズを選ぶ</h2>
            <button aria-label="バリアント選択を閉じる" onClick={() => setPurchaseIntent(null)} type="button">
              <X aria-hidden size={21} strokeWidth={2} />
            </button>
          </header>
          <div className="sazo-image-search-new-balance-sheet-product">
            <img alt={productName} src={productImage} />
            <div><strong>{productName}</strong><span>{detail.priceEstimate}</span></div>
          </div>
          <section>
            <h3>カラー</h3>
            <div className="sazo-image-search-new-balance-sheet-options">
              {detail.colors.map((color) => (
                <button aria-pressed={selectedColor === color.label} key={color.id} onClick={() => setSelectedColor(color.label)} type="button">
                  {color.label}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3>サイズを選ぶ</h3>
            <div className="sazo-image-search-new-balance-sheet-options">
              {detail.sizes.map((size) => (
                <button aria-pressed={selectedSize === size} key={size} onClick={() => setSelectedSize(size)} type="button">
                  {size}cm
                </button>
              ))}
            </div>
          </section>
          <section className="sazo-image-search-new-balance-sheet-quantity">
            <h3>数量</h3>
            <div>
              <button aria-label="数量を減らす" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button"><Minus aria-hidden size={18} /></button>
              <span>{quantity}</span>
              <button aria-label="数量を増やす" onClick={() => setQuantity((value) => value + 1)} type="button"><Plus aria-hidden size={18} /></button>
            </div>
          </section>
          <button className="sazo-image-search-new-balance-sheet-confirm" onClick={proceed} type="button">
            {purchaseIntent === "cart" ? "カートに入れる" : "購入手続きへ"}
          </button>
        </section>
      </>
    );

  if (mobileScreen === "delivery") {
    return (
      <article className="sazo-reference-nintendo-subpage sazo-image-search-new-balance-detail" data-image-search-product-detail data-testid="jplanet-new-balance-delivery-detail">
        <ReferenceNintendoHeader dispatch={dispatch} onBack={returnToProduct} />
        <main>
          <h1>配送・通関の詳細</h1>
          <div className="sazo-reference-nintendo-product-summary">
            <img alt={productName} src={productImage} />
            <div><strong>{productName}</strong><span>購入可能</span></div>
          </div>
          <section className="sazo-reference-nintendo-detail-card">
            <h2>到着予定</h2>
            <div className="sazo-reference-nintendo-timeline">
              <span><Box aria-hidden size={22} /></span>
              <p>日本での手配 <b>注文確定後 1〜2日</b></p>
              <span><Truck aria-hidden size={22} /></span>
              <p>ブラジル到着予定 <b>7〜10日</b></p>
            </div>
            <small>到着日は配送状況により前後する場合があります。</small>
          </section>
          <section className="sazo-reference-nintendo-detail-card sazo-reference-nintendo-confirmed-card">
            <h2>確認した内容</h2>
            <button type="button"><Store aria-hidden size={23} /><b>販売元</b><span>New Balance Japan 候補を確認</span><ChevronRight aria-hidden size={20} /></button>
            <button type="button"><ShoppingCart aria-hidden size={23} /><b>購入可否</b><span>ブラジルへの購入条件を確認</span><ChevronRight aria-hidden size={20} /></button>
            <button type="button"><ShieldCheck aria-hidden size={23} /><b>通関</b><span>輸入に必要な確認を実施</span><ChevronRight aria-hidden size={20} /></button>
          </section>
          <p className="sazo-reference-nintendo-info"><Info aria-hidden size={23} />カラー・サイズにより、総額と到着予定が変わる場合があります。</p>
        </main>
        {footer}
        {purchaseSheet}
      </article>
    );
  }

  if (mobileScreen === "reviews") {
    return (
      <article className="sazo-reference-nintendo-subpage sazo-reference-nintendo-reviews sazo-image-search-new-balance-detail" data-image-search-product-detail data-testid="jplanet-new-balance-product-reviews">
        <ReferenceNintendoHeader dispatch={dispatch} onBack={returnToProduct} />
        <main>
          <header className="sazo-reference-nintendo-reviews-title"><h1>商品レビュー</h1><p>{productName}</p></header>
          <section aria-label="レビューの平均評価" className="sazo-reference-nintendo-reviews-overview">
            <strong>4.8</strong>
            <div><ProductRatingStars rating={5} size={20} /><b>128件のレビュー</b><span>J-Planetで購入を確認したお客様の声</span></div>
          </section>
          <div aria-label="レビューの絞り込み" className="sazo-reference-nintendo-review-filters">
            {[["all", "すべて 128"], ["media", "写真付き 36"], ["five-star", "5つ星"]].map(([filter, label]) => (
              <button aria-pressed={reviewFilter === filter} key={filter} onClick={() => setReviewFilter(filter as ReviewFilter)} type="button">{label}</button>
            ))}
          </div>
          <label className="sazo-reference-nintendo-review-search">
            <Search aria-hidden size={19} />
            <input aria-label="レビューを検索" onChange={(event) => setReviewSearch(event.target.value)} placeholder="レビューを検索" type="search" value={reviewSearch} />
          </label>
          <section aria-label="レビュー一覧" className="sazo-reference-nintendo-review-list">
            {visibleReviews.map((review) => (
              <article key={review.id}>
                <div className="sazo-reference-nintendo-review-card-head">
                  <span aria-hidden>{review.reviewer.slice(0, 1)}</span><b>{review.reviewer}</b>
                  <button type="button"><ThumbsUp aria-hidden size={17} /> 役に立った（{review.helpful}）</button>
                </div>
                <ProductRatingStars rating={review.rating} size={19} />
                <p>バリアント：{review.variant}</p><strong>{review.text}</strong>
                <div className="sazo-reference-nintendo-review-media"><img alt={`${review.reviewer}のレビュー写真`} src={review.image} /></div>
                <small>{review.date}</small>
              </article>
            ))}
          </section>
        </main>
        {footer}
        {purchaseSheet}
      </article>
    );
  }

  return (
    <article className="sazo-reference-nintendo-controller sazo-image-search-new-balance-detail" data-image-search-product-detail data-product-detail data-testid="jplanet-image-search-new-balance-detail">
      <ProductMediaHeader dispatch={dispatch} onBack={() => dispatch({ type: "close-product" })} productInfoRef={productInformationRef} productName={productName} />
      <main>
        <section aria-label={`${productName}の商品画像`} className="sazo-reference-nintendo-controller-media">
          <img alt={`${productName} ${selectedColor}`} className="sazo-reference-nintendo-controller-hero" src={currentImage.image} />
          <output aria-label={`画像 ${activeImage + 1} / ${gallery.length}`} className="sazo-reference-nintendo-controller-media-count">{activeImage + 1}/{gallery.length}</output>
        </section>
        <section aria-label="商品画像" className="sazo-reference-nintendo-controller-variant-rail" data-testid="jplanet-new-balance-variant-rail">
          <div className="sazo-reference-nintendo-controller-variant-rail-heading"><p>商品画像</p><span>{gallery.length}枚の商品画像</span></div>
          <div className="sazo-reference-nintendo-controller-thumbnails">
            {gallery.map((item, index) => (
              <button aria-current={activeImage === index ? "true" : undefined} aria-label={`画像${index + 1}を表示`} key={item.id} onClick={() => setActiveImage(index)} type="button"><img alt="" src={item.image} /></button>
            ))}
          </div>
        </section>
        <section className="sazo-reference-nintendo-controller-purchase-column">
          <div className="sazo-reference-nintendo-controller-heading" data-testid="jplanet-product-information" ref={productInformationRef}>
            <div className="sazo-reference-nintendo-controller-title"><h1>{productName}</h1></div>
            <div className="sazo-reference-nintendo-controller-source">
              <span>New Balance</span><b>{detail.sellerLabel}</b>
              <a href={detail.originalUrl} rel="noreferrer" target="_blank"><ExternalLink aria-hidden size={15} />元ページを開く</a>
            </div>
          </div>
          <section aria-label="価格情報" className="sazo-reference-nintendo-controller-price">
            <div className="sazo-reference-nintendo-controller-price-main"><strong>{detail.priceEstimate}</strong><del>R$ 848</del><em>-12%</em></div>
            <div className="sazo-reference-nintendo-controller-price-meta">
              <span>{detail.soldLabel}</span>
              <button aria-label={favorite ? "お気に入りから削除" : "お気に入りに追加"} aria-pressed={favorite} onClick={() => setFavorite((saved) => !saved)} type="button"><Heart aria-hidden fill={favorite ? "currentColor" : "none"} size={24} strokeWidth={1.9} /></button>
            </div>
          </section>
          <section aria-label="通常日本商品" className="sazo-reference-nintendo-variant-info"><strong>通常日本商品</strong><span>日本の素敵な商品をすぐにお届けします。</span></section>
          <section aria-label="通関配送情報" className="sazo-reference-nintendo-estimate">
            <div className="sazo-reference-nintendo-estimate-header">
              <p><b>通関配送情報</b><span>ご注文確定後に配送状況を更新します <Info aria-hidden size={14} /></span></p>
              <button aria-label="配送・通関の詳細を開く" onClick={() => openMobileScreen("delivery")} type="button">詳細 <ChevronRight aria-hidden size={16} /></button>
            </div>
            <dl><div><dt>国内配送</dt><dd>{detail.domesticArrivalEstimate}</dd></div><div><dt>国際配送</dt><dd>{detail.internationalArrivalEstimate}</dd></div></dl>
          </section>
          <button className="sazo-reference-nintendo-review-line" onClick={() => openMobileScreen("reviews")} type="button"><b>元ページの商品レビュー</b><span>{detail.reviewSummary}</span><ChevronRight aria-hidden size={21} /></button>
          <section aria-label="商品仕様" className="sazo-reference-nintendo-product-specification">
            <button aria-haspopup="dialog" aria-label="商品仕様を開く" onClick={() => setSpecificationOpen(true)} type="button"><b>商品仕様</b><span>{detail.specificationSummary}</span><ChevronRight aria-hidden size={20} /></button>
          </section>
          <section aria-labelledby="jplanet-new-balance-description-title" className="sazo-reference-nintendo-product-description" ref={descriptionRef}>
            <h2 id="jplanet-new-balance-description-title">商品説明</h2>
            <div className="sazo-reference-nintendo-product-description-content" data-expanded={descriptionOpen} id="jplanet-new-balance-product-description">
              <ProductDescriptionBlocks blocks={descriptionBlocks} onOpenImage={setExpandedImage} />
            </div>
            <button aria-controls="jplanet-new-balance-product-description" aria-expanded={descriptionOpen} aria-label={descriptionOpen ? "商品説明を閉じる" : "商品説明をもっと見る"} className="sazo-reference-nintendo-product-description-toggle" onClick={() => {
              if (descriptionOpen) {
                setDescriptionOpen(false);
                if (!navigator.userAgent.includes("jsdom")) window.requestAnimationFrame(() => descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
              } else setDescriptionOpen(true);
            }} type="button">
              {descriptionOpen ? "閉じる" : "もっと見る"}{descriptionOpen ? <ChevronUp aria-hidden size={18} /> : <ChevronDown aria-hidden size={18} />}
            </button>
          </section>
        </section>
        <section aria-label="購入後の参考情報" className="sazo-reference-nintendo-scroll-section sazo-reference-nintendo-scroll-followup" data-testid="jplanet-inline-followup">
          <section aria-labelledby="jplanet-new-balance-review-preview-title" className="sazo-reference-nintendo-review-preview" data-testid="jplanet-product-review-preview">
            <div className="sazo-reference-nintendo-review-preview-heading">
              <div><h2 id="jplanet-new-balance-review-preview-title">購入者レビュー</h2><button aria-label="すべてのレビューを見る" onClick={() => openMobileScreen("reviews")} type="button">もっと見る <ChevronRight aria-hidden size={19} /></button></div>
              <button aria-label="すべてのレビューを見る" className="sazo-reference-nintendo-review-summary" onClick={() => openMobileScreen("reviews")} type="button"><strong>4.8</strong><ProductRatingStars rating={5} size={16} /><span>128件のレビュー</span><ChevronRight aria-hidden size={19} /></button>
            </div>
            <div className="sazo-reference-nintendo-review-preview-list">
              {reviews.map((review) => (
                <article key={review.id}>
                  <div className="sazo-reference-nintendo-review-card-head"><span aria-hidden>{review.reviewer.slice(0, 1)}</span><b>{review.reviewer}</b><small>{review.date}</small></div>
                  <ProductRatingStars rating={review.rating} size={15} /><p>バリアント：{review.variant}</p>
                  <div><span>{review.text}</span><img alt={`${review.reviewer}のレビュー写真`} src={review.image} /></div>
                  <footer>{review.tags.map((tag) => <span key={tag}>{tag}</span>)}</footer>
                </article>
              ))}
            </div>
            <button className="sazo-reference-nintendo-review-preview-more" onClick={() => openMobileScreen("reviews")} type="button">もっと見る（128件） <ChevronRight aria-hidden size={19} /></button>
          </section>
          <NewBalanceRelatedProducts />
        </section>
      </main>
      <footer className="sazo-reference-nintendo-footer sazo-reference-nintendo-controller-footer">
        <button onClick={() => openPurchaseSheet("cart")} type="button"><ShoppingCart aria-hidden size={22} strokeWidth={2} />カートに入れる</button>
        <button onClick={() => openPurchaseSheet("purchase")} type="button">購入に進む</button>
        <small>カラー・サイズを選択して次へ</small>
      </footer>
      {specificationOpen ? <ProductSpecificationSheet onClose={() => setSpecificationOpen(false)} specifications={specifications} /> : null}
      {expandedImage !== null ? (
        <><div aria-hidden="true" className="sazo-reference-nintendo-description-lightbox-scrim" onClick={() => setExpandedImage(null)} /><section aria-label={`${expandedImage.alt}の拡大表示`} aria-modal="true" className="sazo-reference-nintendo-description-lightbox" role="dialog"><button aria-label="拡大画像を閉じる" onClick={() => setExpandedImage(null)} type="button"><X aria-hidden size={22} /></button><img alt={expandedImage.alt} src={expandedImage.src} /></section></>
      ) : null}
      {purchaseSheet}
    </article>
  );
}
