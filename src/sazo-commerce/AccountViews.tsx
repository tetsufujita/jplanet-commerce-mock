import { useState, type Dispatch, type ReactNode, type SyntheticEvent } from "react";
import {
  ArrowLeft,
  Bell,
  CircleAlert,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDollarSign,
  Circle,
  CircleCheck,
  ClipboardList,
  CreditCard,
  Heart,
  FilePenLine,
  FileText,
  Headphones,
  History,
  House,
  ImagePlus,
  LogOut,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Package,
  Plane,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Ticket,
  Truck,
  UserRoundPen,
  MessageCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  jplanetBrandDirectory,
  referenceProducts,
  sazoAccountFixture,
} from "@/sazo-commerce/fixtures";
import {
  couponHistory,
  discoverableCouponIds,
  getJplanetCoupon,
  initialJplanetCouponIds,
  type JplanetCoupon,
  type JplanetCouponCategory,
} from "@/sazo-commerce/couponFixtures";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";
import type {
  SazoAccountView,
  SazoAction,
  SazoFavoriteTab,
  SazoState,
  SazoView,
} from "@/sazo-commerce/model";
import "@/sazo-commerce/coupons.css";

interface AccountViewProps {
  dispatch: Dispatch<SazoAction>;
}

interface CouponStateProps extends AccountViewProps {
  state?: Pick<SazoState, "couponOwnedIds" | "couponSelectedId">;
}

interface AccountHeaderProps extends AccountViewProps {
  backView: SazoView;
  title: string;
}

function AccountHeader({ backView, dispatch, title }: AccountHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sazo-account-header">
      <button
        aria-label={t("sazo.account.back")}
        onClick={() => {
          dispatch({ type: "navigate", view: backView });
        }}
        type="button"
      >
        <ArrowLeft aria-hidden size={26} strokeWidth={2} />
      </button>
      <h1>{title}</h1>
      <div className="sazo-account-header-actions">
        <button
          aria-label={t("sazo.views.common.home")}
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <House aria-hidden size={25} strokeWidth={2} />
        </button>
        <button
          aria-label={t("sazo.views.common.cart")}
          onClick={() => {
            dispatch({ type: "navigate", view: "cart" });
          }}
          type="button"
        >
          <ShoppingCart aria-hidden size={25} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

interface AccountViewFrameProps extends AccountHeaderProps {
  children: ReactNode;
  view: SazoAccountView;
}

function AccountLegalFooter() {
  const { t } = useTranslation();

  return (
    <footer className="sazo-account-legal-footer">
      <nav aria-label={t("sazo.account.footer.companyLinksLabel")}>
        <a href="#company">{t("sazo.account.footer.company")}</a>
        <a href="#recruit">{t("sazo.account.footer.recruit")}</a>
        <a href="#press">{t("sazo.account.footer.press")}</a>
      </nav>
      <p>{t("sazo.account.footer.companyCopy")}</p>
      <p>{t("sazo.account.footer.address")}</p>
      <nav aria-label={t("sazo.account.footer.policyLinksLabel")}>
        <a href="#terms">{t("sazo.account.footer.terms")}</a>
        <a href="#privacy">{t("sazo.account.footer.privacy")}</a>
        <a href="#commerce">{t("sazo.account.footer.commercial")}</a>
      </nav>
    </footer>
  );
}

function AccountViewFrame({
  backView,
  children,
  dispatch,
  title,
  view,
}: AccountViewFrameProps) {
  return (
    <section className="sazo-account-view" data-view-content={view}>
      <AccountHeader backView={backView} dispatch={dispatch} title={title} />
      {children}
      <AccountLegalFooter />
    </section>
  );
}

interface AccountLinkProps {
  dispatch: Dispatch<SazoAction>;
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  view?: SazoView;
}

function AccountLink({ dispatch, icon: Icon, label, onPress, view }: AccountLinkProps) {
  return (
    <button
      className="sazo-account-link"
      onClick={
        onPress !== undefined
          ? onPress
          : view === undefined
          ? undefined
          : () => {
              dispatch({ type: "navigate", view });
            }
      }
      type="button"
    >
      <Icon aria-hidden size={23} strokeWidth={1.8} />
      <span>{label}</span>
      <ChevronRight aria-hidden className="sazo-account-chevron" size={22} />
    </button>
  );
}

interface PostPurchaseHeaderProps extends AccountViewProps {
  backView?: SazoView;
  title: string;
}

function PostPurchaseHeader({ backView, dispatch, title }: PostPurchaseHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sazo-postpurchase-header">
      <div className="sazo-postpurchase-header-start">
        {backView === undefined ? null : (
          <button
            aria-label={t("sazo.account.back")}
            onClick={() => {
              dispatch({ type: "navigate", view: backView });
            }}
            type="button"
          >
            <ArrowLeft aria-hidden size={25} strokeWidth={2} />
          </button>
        )}
        <JplanetLogo className="sazo-postpurchase-wordmark" />
      </div>
      <h1>{title}</h1>
      <div className="sazo-postpurchase-header-actions">
        <button
          aria-label={t("sazo.views.common.cart")}
          onClick={() => {
            dispatch({ type: "navigate", view: "cart" });
          }}
          type="button"
        >
          <ShoppingCart aria-hidden size={25} strokeWidth={1.8} />
        </button>
        <button
          aria-label={t("sazo.actions.chat")}
          onClick={() => {
            dispatch({ type: "open-chat" });
          }}
          type="button"
        >
          <MessageCircle aria-hidden size={25} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

interface PostPurchaseFrameProps extends PostPurchaseHeaderProps {
  children: ReactNode;
  view: SazoAccountView;
}

function PostPurchaseFrame({ backView, children, dispatch, title, view }: PostPurchaseFrameProps) {
  return (
    <section className="sazo-postpurchase-view" data-view-content={view}>
      <PostPurchaseHeader backView={backView} dispatch={dispatch} title={title} />
      {children}
    </section>
  );
}

export function MyPageView({
  couponCount = sazoAccountFixture.coupons,
  dispatch,
}: AccountViewProps & { couponCount?: number }) {
  return (
    <PostPurchaseFrame dispatch={dispatch} title="マイページ" view="mypage">
      <main className="sazo-mypage-reference-content">
        <button
          className="sazo-mypage-user-row"
          onClick={() => {
            dispatch({ type: "navigate", view: "profile" });
          }}
          type="button"
        >
          <span aria-hidden className="sazo-mypage-avatar">T</span>
          <strong>Tetsu Fujita <small>さん</small></strong>
          <ChevronRight aria-hidden size={22} />
        </button>

        <div className="sazo-mypage-balances" aria-label="ポイントとクーポン">
          <button
            onClick={() => {
              dispatch({ type: "navigate", view: "points" });
            }}
            type="button"
          >
            <CircleDollarSign aria-hidden size={27} strokeWidth={1.7} />
            <span><b>{sazoAccountFixture.points}</b><small>ポイント</small></span>
          </button>
          <span aria-hidden className="sazo-mypage-balance-line" />
          <button
            onClick={() => {
              dispatch({ type: "navigate", view: "coupons" });
            }}
            type="button"
          >
            <Ticket aria-hidden size={27} strokeWidth={1.7} />
            <span><b>{couponCount}</b><small>クーポン</small></span>
          </button>
        </div>

        <section className="sazo-mypage-reference-group">
          <h2>ショッピング</h2>
          <button
            className="sazo-mypage-reference-row sazo-mypage-reference-row--order"
            onClick={() => {
              dispatch({ type: "navigate", view: "orders" });
            }}
            type="button"
          >
            <Truck aria-hidden size={25} strokeWidth={1.75} />
            <span><b>注文・配送</b><small>対応が必要な手続き 1件</small></span>
            <i aria-label="未対応 1件" />
            <ChevronRight aria-hidden size={21} />
          </button>
          <AccountLink
            dispatch={dispatch}
            icon={Heart}
            label="お気に入り"
            onPress={() => {
              dispatch({ type: "open-favorites", tab: "product" });
            }}
          />
        </section>

        <section className="sazo-mypage-reference-group">
          <h2>アカウント</h2>
          <AccountLink dispatch={dispatch} icon={Truck} label="配送先" view="delivery" />
          <AccountLink dispatch={dispatch} icon={CreditCard} label="支払い方法" view="cards" />
          <AccountLink dispatch={dispatch} icon={Bell} label="通知設定" view="notifications" />
          <AccountLink dispatch={dispatch} icon={UserRoundPen} label="会員情報" view="profile" />
        </section>

        <button
          className="sazo-mypage-support-row"
          onClick={() => {
            dispatch({ type: "navigate", view: "support" });
          }}
          type="button"
        >
          <Headphones aria-hidden size={24} strokeWidth={1.75} />
          <span>サポート</span>
          <ChevronRight aria-hidden size={21} />
        </button>
      </main>
    </PostPurchaseFrame>
  );
}

const favoriteTabs = [
  "product",
  "brand",
  "review",
] as const satisfies readonly SazoFavoriteTab[];

const favoriteProductItems = [
  {
    arrival: "関税込み ・ 7〜10日",
    arrivalTotal: "R$ 748",
    id: "jplanet-new-balance-9060",
    name: "New Balance 9060",
    seller: "日本公式サイト",
    status: "購入可能",
  },
  {
    arrival: "関税込み ・ 8〜12日",
    arrivalTotal: "R$ 2,680",
    id: "jplanet-sony-a7c-ii",
    name: "Sony α7C II",
    seller: "ビックカメラ",
    status: "購入可能",
  },
] as const;

type FavoriteSort = "latest" | "price";

export function FavoritesView({
  dispatch,
  initialTab = "product",
  state,
}: AccountViewProps & {
  initialTab?: SazoFavoriteTab;
  state?: Pick<SazoState, "savedBrandIds">;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SazoFavoriteTab>(initialTab);
  const [sort, setSort] = useState<FavoriteSort>("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const [savedProductIds, setSavedProductIds] = useState(() =>
    referenceProducts.map((product) => product.id),
  );
  const referenceProductsById = new Map(
    referenceProducts.map((product) => [product.id, product]),
  );
  const savedProductCount = savedProductIds.length;
  const savedEligibleItems = favoriteProductItems.filter((item) =>
    savedProductIds.includes(item.id),
  );
  const orderedEligibleItems =
    sort === "latest"
      ? savedEligibleItems
      : [...savedEligibleItems].sort(
          (left, right) =>
            Number.parseInt(left.arrivalTotal.replace(/[^0-9]/g, ""), 10) -
            Number.parseInt(right.arrivalTotal.replace(/[^0-9]/g, ""), 10),
        );
  const pendingProduct = referenceProductsById.get("jplanet-nintendo-switch-oled");
  const favoriteBrandItems = jplanetBrandDirectory.filter((brand) =>
    (state?.savedBrandIds ?? jplanetBrandDirectory.filter((item) => item.isSaved).map((item) => item.id)).includes(
      brand.id,
    ),
  );

  const removeSavedProduct = (productId: string) => {
    setSavedProductIds((current) => current.filter((id) => id !== productId));
  };

  const openProduct = (productId: string) => {
    dispatch({ type: "open-product", productId });
  };

  return (
    <section className="sazo-favorites-view" data-view-content="favorites">
      <header className="sazo-favorites-reference-header">
        <button
          aria-label={t("sazo.brand.homeLabel")}
          className="sazo-favorites-home"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <JplanetLogo />
        </button>
        <button
          aria-label={t("sazo.actions.cart")}
          className="sazo-favorites-cart"
          onClick={() => {
            dispatch({ type: "navigate", view: "cart" });
          }}
          type="button"
        >
          <ShoppingCart aria-hidden size={25} strokeWidth={1.8} />
        </button>
      </header>

      <main className="sazo-favorites-reference-content">
        <div className="sazo-favorites-title-row">
          <h1>{t("sazo.favorites.title")}</h1>
          <div className="sazo-favorites-sort">
            <button
              aria-expanded={sortOpen}
              aria-haspopup="menu"
              onClick={() => {
                setSortOpen((current) => !current);
              }}
              type="button"
            >
              {t(`sazo.favorites.reference.sort.${sort}`)}
              <ChevronDown aria-hidden size={15} strokeWidth={1.8} />
            </button>
            {sortOpen ? (
              <div aria-label={t("sazo.favorites.reference.sort.label")} role="menu">
                {(["latest", "price"] as const).map((option) => (
                  <button
                    aria-checked={sort === option}
                    key={option}
                    onClick={() => {
                      setSort(option);
                      setSortOpen(false);
                    }}
                    role="menuitemradio"
                    type="button"
                  >
                    {t(`sazo.favorites.reference.sort.${option}`)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          aria-label={t("sazo.favorites.tabsLabel")}
          className="sazo-favorites-reference-tabs"
          role="tablist"
        >
          {favoriteTabs.map((favoriteTab) => (
            <button
              aria-selected={tab === favoriteTab}
              key={favoriteTab}
              onClick={() => {
                setTab(favoriteTab);
              }}
              role="tab"
              type="button"
            >
              {t(`sazo.favorites.tabs.${favoriteTab}`)}
              <span>
                {favoriteTab === "product"
                  ? savedProductCount
                  : favoriteTab === "brand"
                    ? favoriteBrandItems.length
                    : 1}
              </span>
            </button>
          ))}
        </div>

        {tab === "product" ? (
          <>
            <section
              aria-labelledby="sazo-favorites-approved-heading"
              className="sazo-favorites-reference-section"
            >
              <h2 id="sazo-favorites-approved-heading">
                {t("sazo.favorites.reference.approvedTitle")}
              </h2>
              {orderedEligibleItems.map((item) => {
                const product = referenceProductsById.get(item.id);

                if (product === undefined) {
                  return null;
                }

                return (
                  <article className="sazo-favorites-product-row" key={item.id}>
                    <button
                      aria-label={t("sazo.favorites.reference.openProduct", {
                        name: item.name,
                      })}
                      className="sazo-favorites-product-main"
                      onClick={() => {
                        openProduct(item.id);
                      }}
                      type="button"
                    >
                      <img alt="" src={product.image} />
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.seller}</small>
                        <b>
                          <i aria-hidden />
                          {item.status}・{item.arrivalTotal}
                        </b>
                        <em>{item.arrival}</em>
                      </span>
                      <ChevronRight aria-hidden size={22} strokeWidth={1.6} />
                    </button>
                    <button
                      aria-label={t("sazo.favorites.reference.removeProduct", {
                        name: item.name,
                      })}
                      aria-pressed="true"
                      className="sazo-favorites-product-heart"
                      onClick={() => {
                        removeSavedProduct(item.id);
                      }}
                      type="button"
                    >
                      <Heart aria-hidden size={22} strokeWidth={1.65} />
                    </button>
                  </article>
                );
              })}
              {orderedEligibleItems.length === 0 ? (
                <p className="sazo-favorites-reference-empty">
                  {t("sazo.favorites.reference.noApprovedProducts")}
                </p>
              ) : null}
            </section>

            {pendingProduct !== undefined &&
            savedProductIds.includes(pendingProduct.id) ? (
              <section
                aria-labelledby="sazo-favorites-pending-heading"
                className="sazo-favorites-reference-section sazo-favorites-reference-section--pending"
              >
                <h2 id="sazo-favorites-pending-heading">
                  {t("sazo.favorites.reference.pendingTitle")}
                </h2>
                <article className="sazo-favorites-pending-row">
                  <img alt="" src={pendingProduct.image} />
                  <div>
                    <strong>{pendingProduct.name}</strong>
                    <span>
                      <b>{t("sazo.favorites.reference.pendingSeller")}</b>
                      <b>{t("sazo.favorites.reference.pendingPrice")}</b>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      openProduct(pendingProduct.id);
                    }}
                    type="button"
                  >
                    {t("sazo.favorites.reference.startCheck")}
                    <ChevronRight aria-hidden size={20} strokeWidth={1.7} />
                  </button>
                </article>
                <p>{t("sazo.favorites.reference.pendingNote")}</p>
              </section>
            ) : null}
          </>
        ) : null}

        {tab === "brand" ? (
          <section className="sazo-favorites-secondary-panel">
            <h2>{t("sazo.favorites.reference.savedBrandsTitle")}</h2>
            {favoriteBrandItems.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  dispatch({ type: "open-brand-detail" });
                }}
                type="button"
              >
                <span>{brand.name}</span>
                <ChevronRight aria-hidden size={20} strokeWidth={1.7} />
              </button>
            ))}
            {favoriteBrandItems.length === 0 ? (
              <p className="sazo-favorites-reference-empty">保存したブランドはありません</p>
            ) : null}
          </section>
        ) : null}

        {tab === "review" ? (
          <section className="sazo-favorites-secondary-panel">
            <h2>{t("sazo.favorites.reference.savedReviewsTitle")}</h2>
            <button
              onClick={() => {
                dispatch({ type: "navigate", view: "reviews" });
              }}
              type="button"
            >
              <span>{t("sazo.favorites.reference.savedReviewItem")}</span>
              <ChevronRight aria-hidden size={20} strokeWidth={1.7} />
            </button>
          </section>
        ) : null}
      </main>
    </section>
  );
}

export function ProfileView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();
  const [phoneAuthenticationRequested, setPhoneAuthenticationRequested] = useState(false);
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    dispatch({ type: "navigate", view: "mypage" });
  };

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.profile.title")}
      view="profile"
    >
      <form className="sazo-profile-form" onSubmit={handleSubmit}>
        <label htmlFor="sazo-profile-nickname">{t("sazo.profile.nickname")}</label>
        <input
          defaultValue={sazoAccountFixture.displayName}
          id="sazo-profile-nickname"
          type="text"
        />
        <label htmlFor="sazo-profile-email">{t("sazo.profile.email")}</label>
        <input
          defaultValue={sazoAccountFixture.email}
          id="sazo-profile-email"
          readOnly
          type="email"
        />
        <p className="sazo-profile-notice">{t("sazo.profile.orderNotice")}</p>

        <fieldset>
          <legend>{t("sazo.profile.nameKanji")}</legend>
          <input aria-label={t("sazo.profile.familyName")} type="text" />
          <input aria-label={t("sazo.profile.givenName")} type="text" />
        </fieldset>
        <fieldset>
          <legend>{t("sazo.profile.nameKana")}</legend>
          <input aria-label={t("sazo.profile.familyNameKana")} type="text" />
          <input aria-label={t("sazo.profile.givenNameKana")} type="text" />
        </fieldset>

        <label htmlFor="sazo-profile-birthday">{t("sazo.auth.birthday.label")}</label>
        <input
          defaultValue={sazoAccountFixture.birthday}
          id="sazo-profile-birthday"
          placeholder={t("sazo.auth.birthday.placeholder")}
          type="text"
        />
        <div className="sazo-profile-phone-heading">
          <span id="sazo-profile-phone-label">{t("sazo.profile.phone.label")}</span>
          <button
            aria-pressed={phoneAuthenticationRequested}
            onClick={() => {
              setPhoneAuthenticationRequested(true);
            }}
            type="button"
          >
            {t("sazo.profile.phone.authenticate")}
          </button>
        </div>
        <div
          aria-labelledby="sazo-profile-phone-label"
          className="sazo-profile-phone"
          role="group"
        >
          <span className="sazo-profile-phone-country">
            JP
            <ChevronDown aria-hidden size={17} strokeWidth={1.8} />
          </span>
          <input
            aria-label={t("sazo.profile.phone.inputLabel")}
            defaultValue={sazoAccountFixture.phone}
            readOnly
            type="tel"
          />
        </div>
        <small className="sazo-profile-phone-help">{t("sazo.profile.phone.help")}</small>

        <section className="sazo-profile-image">
          <h2>{t("sazo.profile.image")}</h2>
          <div>
            <ImagePlus aria-hidden size={36} />
            <strong>{t("sazo.profile.upload")}</strong>
            <span>{t("sazo.profile.uploadHelp")}</span>
          </div>
        </section>
        <button className="sazo-profile-withdraw" type="button">
          {t("sazo.profile.withdraw")}
        </button>
        <button className="sazo-profile-save" type="submit">
          {t("sazo.profile.save")}
        </button>
      </form>
    </AccountViewFrame>
  );
}

export function OrdersView({ dispatch }: AccountViewProps) {
  const [trackingExpanded, setTrackingExpanded] = useState(false);

  return (
    <PostPurchaseFrame backView="mypage" dispatch={dispatch} title="注文・配送" view="orders">
      <main className="sazo-orders-reference-content">
        <div className="sazo-orders-intro"><h2>注文・配送</h2><p>購入後の手続きを確認できます</p></div>

        <section className="sazo-orders-section" aria-labelledby="orders-action-heading">
          <h2 id="orders-action-heading">対応が必要</h2>
          <button
            aria-label="CPF情報を提出する"
            className="sazo-order-action-row"
            onClick={() => {
              dispatch({ type: "navigate", view: "order-detail" });
            }}
            type="button"
          >
            <img alt="Air Jordan 1 Retro High OG" src="/sazo-commerce/reference/air-jordan-1-retro-high-og.png" />
            <span><b>CPF情報の確認が必要です</b><small>Air Jordan 1 Retro High OG · 輸入手続きに必要です</small></span>
            <em>提出する</em><ChevronRight aria-hidden size={19} />
          </button>
        </section>

        <section className="sazo-orders-section" aria-labelledby="orders-shipping-heading">
          <h2 id="orders-shipping-heading">配送中</h2>
          <button
            aria-expanded={trackingExpanded}
            aria-label="Nintendo Switch OLEDを追跡する"
            className="sazo-order-shipping-row"
            onClick={() => { setTrackingExpanded((current) => !current); }}
            type="button"
          >
            <img alt="Nintendo Switch OLED" src="/sazo-commerce/reference/nintendo-switch-oled.png" />
            <span><b>Nintendo Switch OLED</b><small>国際配送中 · 8月20日 到着予定</small></span>
            <em>追跡する</em><ChevronRight aria-hidden size={19} />
          </button>
          <div className="sazo-order-steps" aria-label="Nintendo Switch OLEDの配送状況">
            {[
              ["日本で購入", "complete"], ["倉庫で確認", "complete"], ["国際配送中", "current"], ["輸入手続き", "future"], ["配達予定", "future"],
            ].map(([label, state]) => (
              <span className={`sazo-order-step sazo-order-step--${state}`} key={label}>
                {state === "complete" ? <CircleCheck aria-hidden size={16} /> : <Circle aria-hidden size={16} />}
                <small>{label}</small>
              </span>
            ))}
          </div>
          {trackingExpanded ? (
            <div className="sazo-order-tracking-expanded" role="status">
              <Plane aria-hidden size={17} /> 現在、国際配送の準備状況を確認しています。到着予定は8月20日です。
            </div>
          ) : null}
        </section>

        <section className="sazo-orders-section sazo-orders-history" aria-labelledby="orders-history-heading">
          <h2 id="orders-history-heading">注文履歴</h2>
          <button type="button"><img alt="Air Jordan 4 Retro Bred Reimagined" src="/sazo-commerce/reference/air-jordan-1-retro-high-og.png" /><span><b>Air Jordan 4 Retro "Bred Reimagined"</b><small>配送完了<br />2024年7月12日</small></span><ChevronRight aria-hidden size={21} /></button>
          <button type="button"><img alt="MG 1/100 RX-78-2 ガンダム Ver.3.0" src="/sazo-commerce/reference/game-controller.png" /><span><b>MG 1/100 RX-78-2 ガンダム Ver.3.0</b><small>配送完了<br />2024年6月3日</small></span><ChevronRight aria-hidden size={21} /></button>
        </section>
      </main>
    </PostPurchaseFrame>
  );
}

export function OrderDetailView({ dispatch }: AccountViewProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <PostPurchaseFrame backView="orders" dispatch={dispatch} title="注文詳細" view="order-detail">
      <main className="sazo-order-detail-content">
        <section className="sazo-order-detail-product">
          <img alt="Air Jordan 1 Retro High OG" src="/sazo-commerce/reference/air-jordan-1-retro-high-og.png" />
          <span><b>Air Jordan 1 Retro High OG</b><small>注文番号 JP-240810</small></span>
          <ChevronRight aria-hidden size={22} />
        </section>

        <section className="sazo-cpf-request" aria-labelledby="cpf-request-heading">
          <h2 id="cpf-request-heading">提出が必要な書類</h2>
          <h3>CPF情報を確認してください</h3>
          <p>ブラジルでの輸入手続きに使用します。</p>
          <p>登録済みの情報を確認・更新できます。</p>
          <button
            onClick={() => { setSubmitted(true); }}
            type="button"
          >CPF情報を提出する</button>
          {submitted ? <p className="sazo-cpf-success" role="status"><CircleCheck aria-hidden size={17} /> CPF情報を送信しました</p> : null}
        </section>

        <section className="sazo-order-status" aria-labelledby="order-status-heading">
          <h2 id="order-status-heading">現在の配送状況</h2>
          <ol>
            <li className="is-complete"><CircleCheck aria-hidden size={28} /><span><b>日本の販売元で購入</b></span><time>8月12日</time></li>
            <li className="is-complete"><CircleCheck aria-hidden size={28} /><span><b>日本倉庫で確認</b></span><time>8月13日</time></li>
            <li className="is-current"><Circle aria-hidden size={28} /><span><b>輸入情報の確認</b><small>書類の提出後に次へ進みます</small></span></li>
            <li><Circle aria-hidden size={28} /><span><b>国際配送</b></span></li>
            <li><Circle aria-hidden size={28} /><span><b>配達予定</b></span></li>
          </ol>
        </section>

        <button
          className="sazo-order-consult"
          onClick={() => { dispatch({ type: "open-chat" }); }}
          type="button"
        ><MessageCircle aria-hidden size={26} /><span>書類について相談する</span><ChevronRight aria-hidden size={22} /></button>
      </main>
    </PostPurchaseFrame>
  );
}

type CouponScreen = "wallet" | "discover" | "history";
type CouponHistoryTab = "used" | "expired";
type CouponFilter = "all" | JplanetCouponCategory;

const couponCategoryCopy: Record<JplanetCouponCategory, string> = {
  brand: "ブランド",
  product: "商品",
  shipping: "配送",
};

function CouponHeader({
  dispatch,
  onBack,
  onHistory,
  title,
}: AccountViewProps & { onBack: () => void; onHistory?: () => void; title: string }) {
  return (
    <header className="sazo-coupon-center-header">
      <button aria-label="戻る" onClick={onBack} type="button">
        <ArrowLeft aria-hidden size={24} strokeWidth={2} />
      </button>
      <h1>{title}</h1>
      {onHistory === undefined ? <span aria-hidden /> : (
        <button className="sazo-coupon-history-link" onClick={onHistory} type="button">
          利用履歴
        </button>
      )}
    </header>
  );
}

function CouponTicket({
  coupon,
  onConditions,
  onUse,
  selected,
}: {
  coupon: JplanetCoupon;
  onConditions: () => void;
  onUse: () => void;
  selected: boolean;
}) {
  const category = coupon.displayCategory ?? coupon.category;
  const CategoryIcon = category === "shipping" ? Truck : category === "brand" ? Store : ShoppingBag;
  const buttonCopy = coupon.actionMode === "later" ? "あとで使う" : selected ? "選択中" : "使う";

  return (
    <article className="sazo-coupon-ticket" data-category={category} data-testid="jplanet-coupon-ticket">
      <div className="sazo-coupon-ticket-body">
        <span className="sazo-coupon-ticket-icon"><CategoryIcon aria-hidden size={24} strokeWidth={1.8} /></span>
        <div className="sazo-coupon-ticket-main">
          <span className="sazo-coupon-kind">{couponCategoryCopy[category]}</span>
          <h2>{coupon.name}</h2>
          <strong>{coupon.discount}</strong>
          <p>{coupon.minimumSpend}</p>
          {coupon.maximumDiscount === undefined ? null : <p>{coupon.maximumDiscount}</p>}
        </div>
        {coupon.quantity === undefined ? null : <span className="sazo-coupon-ticket-quantity">残り{coupon.quantity}枚</span>}
      </div>
      <footer className="sazo-coupon-ticket-footer">
        <span className={coupon.expiresSoon ? "is-urgent" : undefined}>
          {coupon.expiresSoon ? <CircleAlert aria-hidden size={15} /> : null}
          {coupon.expiresAt}
        </span>
        <button className="sazo-coupon-conditions-link" onClick={onConditions} type="button">利用条件</button>
        <button aria-pressed={selected} className={selected ? "is-selected" : undefined} onClick={onUse} type="button">
          {buttonCopy}
        </button>
      </footer>
    </article>
  );
}

export function CouponsView({ dispatch, state }: CouponStateProps) {
  const [screen, setScreen] = useState<CouponScreen>("wallet");
  const [filter, setFilter] = useState<CouponFilter>("all");
  const [historyTab, setHistoryTab] = useState<CouponHistoryTab>("used");
  const [codeInputOpen, setCodeInputOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "success" | "used" | "invalid">("idle");
  const [conditionCoupon, setConditionCoupon] = useState<JplanetCoupon | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [localClaimedIds, setLocalClaimedIds] = useState<readonly string[]>([]);

  const ownedIds = state === undefined
    ? [...initialJplanetCouponIds, ...localClaimedIds]
    : state.couponOwnedIds;
  const ownedCoupons = ownedIds.map(getJplanetCoupon);
  const visibleCoupons = filter === "all"
    ? ownedCoupons
    : ownedCoupons.filter((coupon) => coupon.category === filter);
  const selectedCouponId = state?.couponSelectedId ?? null;
  const couponTabs: readonly { id: CouponFilter; label: string }[] = [
    { id: "all", label: `すべて (${ownedCoupons.length})` },
    { id: "product", label: `商品 (${ownedCoupons.filter((coupon) => coupon.category === "product").length})` },
    { id: "shipping", label: `配送 (${ownedCoupons.filter((coupon) => coupon.category === "shipping").length})` },
    { id: "brand", label: `ブランド (${ownedCoupons.filter((coupon) => coupon.category === "brand").length})` },
  ];

  const claimCoupon = (couponId: string) => {
    if (!ownedIds.includes(couponId)) {
      setLocalClaimedIds((current) => [...current, couponId]);
      dispatch({ type: "claim-coupon", couponId });
    }
  };

  const submitCode = () => {
    const normalized = code.trim().toUpperCase();
    if (normalized === "JPLANET20") {
      claimCoupon("welcome-code-r20");
      setCodeStatus("success");
      return;
    }
    setCodeStatus(normalized === "USED2026" ? "used" : "invalid");
  };

  const useCoupon = (coupon: JplanetCoupon) => {
    if (coupon.actionMode === "later") {
      setNotice("初回購入の条件を確認後に利用できます。");
      return;
    }
    dispatch({ type: "select-coupon", couponId: coupon.id });
    if (coupon.category === "brand") {
      dispatch({ type: "navigate", view: "brands" });
      return;
    }
    dispatch({ type: "navigate", view: "cart" });
  };

  const closeCodeInput = () => {
    setCodeInputOpen(false);
    setCodeStatus("idle");
    setCode("");
  };

  return (
    <section className="sazo-coupon-center" data-testid="jplanet-coupons" data-view-content="coupons">
      <CouponHeader
        dispatch={dispatch}
        onBack={() => screen === "wallet" ? dispatch({ type: "navigate", view: "mypage" }) : setScreen("wallet")}
        onHistory={screen === "wallet" ? () => setScreen("history") : undefined}
        title={screen === "discover" ? "クーポンを探す" : screen === "history" ? "利用履歴" : "クーポン"}
      />

      {screen === "wallet" ? (
        <main className="sazo-coupon-center-main">
          <div aria-label="クーポンカテゴリー" className="sazo-coupon-tabs" role="tablist">
            {couponTabs.map((tab) => (
              <button
                aria-selected={filter === tab.id}
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="sazo-coupon-actions" role="group" aria-label="クーポン操作">
            <button onClick={() => setCodeInputOpen(true)} type="button"><Ticket aria-hidden size={19} />コードを入力</button>
            <button onClick={() => setScreen("discover")} type="button"><Search aria-hidden size={19} />クーポンを探す</button>
          </div>

          {notice === null ? null : <p className="sazo-coupon-inline-notice" role="status">{notice}</p>}
          {visibleCoupons.length === 0 ? (
            <section className="sazo-coupon-empty" data-testid="jplanet-coupon-empty">
              <p>該当するクーポンはありません</p>
              <button onClick={() => setScreen("discover")} type="button">新しいクーポンを探す</button>
            </section>
          ) : (
            <div className="sazo-coupon-ticket-list">
              {visibleCoupons.map((coupon) => (
                <CouponTicket
                  coupon={coupon}
                  key={coupon.id}
                  onConditions={() => setConditionCoupon(coupon)}
                  onUse={() => useCoupon(coupon)}
                  selected={selectedCouponId === coupon.id}
                />
              ))}
            </div>
          )}
        </main>
      ) : null}

      {screen === "discover" ? (
        <main className="sazo-coupon-discover">
          <p>取得できるクーポン</p>
          <div>
            {discoverableCouponIds.map((couponId) => {
              const coupon = getJplanetCoupon(couponId);
              const closed = coupon.id === "closed-brand-15";
              const claimed = ownedIds.includes(coupon.id);
              return (
                <article key={coupon.id}>
                  <span>{couponCategoryCopy[coupon.category]}</span>
                  <h2>{coupon.discount}</h2>
                  <p>{coupon.minimumSpend}</p>
                  <button onClick={() => setConditionCoupon(coupon)} type="button">利用条件</button>
                  <button
                    disabled={closed || claimed}
                    onClick={() => claimCoupon(coupon.id)}
                    type="button"
                  >
                    {closed ? "配布終了" : claimed ? "取得済み" : "取得する"}
                  </button>
                </article>
              );
            })}
          </div>
        </main>
      ) : null}

      {screen === "history" ? (
        <main className="sazo-coupon-history">
          <div role="tablist" aria-label="クーポン利用履歴">
            <button aria-selected={historyTab === "used"} onClick={() => setHistoryTab("used")} role="tab" type="button">使用済み</button>
            <button aria-selected={historyTab === "expired"} onClick={() => setHistoryTab("expired")} role="tab" type="button">期限切れ</button>
          </div>
          {couponHistory[historyTab].map((entry) => (
            <article key={entry.id}>
              <Ticket aria-hidden size={22} />
              <div><h2>{entry.name}</h2><p>{entry.discount} · {historyTab === "used" ? "使用日" : "期限切れ日"} {entry.date}</p><small>注文番号 {entry.order}</small></div>
              <button onClick={() => dispatch({ type: "navigate", view: "orders" })} type="button">注文を見る</button>
            </article>
          ))}
        </main>
      ) : null}

      {codeInputOpen ? (
        <div className="sazo-coupon-code-layer" role="presentation">
          <button aria-label="コード入力を閉じる" onClick={closeCodeInput} type="button" />
          <form aria-label="クーポンコードを入力" onSubmit={(event) => { event.preventDefault(); submitCode(); }}>
            <div><h2>コードを入力</h2><button aria-label="閉じる" onClick={closeCodeInput} type="button"><X aria-hidden size={21} /></button></div>
            <input aria-label="クーポンコードを入力" autoFocus onChange={(event) => { setCode(event.target.value); setCodeStatus("idle"); }} placeholder="クーポンコードを入力" value={code} />
            {codeStatus === "idle" ? null : <p role="status">{codeStatus === "success" ? "クーポンを追加しました" : codeStatus === "used" ? "このコードは使用済みです" : "有効なクーポンコードではありません"}</p>}
            <button disabled={code.trim().length === 0} type="submit">適用</button>
          </form>
        </div>
      ) : null}

      {conditionCoupon === null ? null : (
        <div className="sazo-coupon-conditions-layer" role="presentation">
          <button aria-label="利用条件を閉じる" onClick={() => setConditionCoupon(null)} type="button" />
          <section aria-label={`${conditionCoupon.name}の利用条件`} role="dialog">
            <header><h2>利用条件</h2><button aria-label="閉じる" onClick={() => setConditionCoupon(null)} type="button"><X aria-hidden size={21} /></button></header>
            <dl>
              <div><dt>対象</dt><dd>{conditionCoupon.target}</dd></div>
              <div><dt>最低購入金額</dt><dd>{conditionCoupon.minimumSpend}</dd></div>
              <div><dt>割引</dt><dd>{conditionCoupon.discount}</dd></div>
              {conditionCoupon.maximumDiscount === undefined ? null : <div><dt>割引上限</dt><dd>{conditionCoupon.maximumDiscount}</dd></div>}
              <div><dt>有効期限</dt><dd>{conditionCoupon.expiresAt}</dd></div>
              <div><dt>併用</dt><dd>{conditionCoupon.combinable ? "他の対象クーポンと併用できます" : "他のクーポンとは併用できません"}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </section>
  );
}

export function PointsView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"all" | "earned" | "used">("all");

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.points.title")}
      view="points"
    >
      <div className="sazo-account-screen-content sazo-points-content">
        <section className="sazo-points-summary">
          <CircleDollarSign aria-hidden size={30} />
          <span>{t("sazo.account.points.available")}</span>
          <strong>{sazoAccountFixture.points}P</strong>
          <dl>
            <div>
              <dt>{t("sazo.account.points.pending")}</dt>
              <dd>{sazoAccountFixture.pendingPoints}P</dd>
            </div>
            <div>
              <dt>{t("sazo.account.points.expiring")}</dt>
              <dd>{sazoAccountFixture.expiringPoints} ポイント</dd>
            </div>
          </dl>
        </section>
        <div
          aria-label={t("sazo.account.points.tabsLabel")}
          className="sazo-account-tabs"
          role="tablist"
        >
          {(["all", "earned", "used"] as const).map((pointTab) => (
            <button
              aria-selected={tab === pointTab}
              key={pointTab}
              onClick={() => {
                setTab(pointTab);
              }}
              role="tab"
              type="button"
            >
              {t(`sazo.account.points.tabs.${pointTab}`)}
            </button>
          ))}
        </div>
        <article className="sazo-points-history">
          <time dateTime="2026-08-06">08.06</time>
          <div>
            <strong>{t("sazo.account.points.granted")}</strong>
            <small>{t("sazo.account.points.grantedExpiry")}</small>
          </div>
          <strong>+500 ポイント</strong>
        </article>
      </div>
    </AccountViewFrame>
  );
}

export function ReviewCreateView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.reviewCreate.title")}
      view="review-create"
    >
      <div className="sazo-account-screen-content sazo-review-content">
        <section className="sazo-review-notice">
          <MessageSquareText aria-hidden size={30} />
          <h2>{t("sazo.account.reviewCreate.noticeTitle")}</h2>
          <ul>
            <li>{t("sazo.account.reviewCreate.reviewed")}</li>
            <li>{t("sazo.account.reviewCreate.notDelivered")}</li>
          </ul>
        </section>
        <section className="sazo-account-empty-state sazo-recorded-empty-state">
          <FilePenLine aria-hidden size={44} strokeWidth={1.45} />
          <h2>{t("sazo.account.reviewCreate.empty")}</h2>
        </section>
      </div>
    </AccountViewFrame>
  );
}

export function ReviewHistoryView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.reviewHistory.title")}
      view="review-history"
    >
      <div className="sazo-account-screen-content sazo-review-content">
        <p className="sazo-review-total">
          {t("sazo.account.reviewHistory.count", { count: 0 })}
        </p>
        <section className="sazo-account-empty-state sazo-recorded-empty-state">
          <FileText aria-hidden size={44} strokeWidth={1.45} />
          <h2>{t("sazo.account.reviewHistory.empty")}</h2>
        </section>
      </div>
    </AccountViewFrame>
  );
}

export function DeliveryView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.delivery.title")}
      view="delivery"
    >
      <div className="sazo-account-screen-content sazo-delivery-content">
        <section className="sazo-account-empty-state sazo-recorded-empty-state">
          <MapPin aria-hidden size={44} strokeWidth={1.45} />
          <h2>{t("sazo.account.delivery.empty")}</h2>
        </section>
      </div>
      <button
        className="sazo-account-fixed-action"
        onClick={() => {
          dispatch({ type: "navigate", view: "address" });
        }}
        type="button"
      >
        {t("sazo.account.delivery.add")}
      </button>
    </AccountViewFrame>
  );
}

export function AddressView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    dispatch({ type: "navigate", view: "delivery" });
  };

  return (
    <AccountViewFrame
      backView="delivery"
      dispatch={dispatch}
      title={t("sazo.account.address.title")}
      view="address"
    >
      <form
        className="sazo-account-screen-content sazo-address-form"
        onSubmit={handleSubmit}
      >
        <p className="sazo-address-intro">{t("sazo.account.address.intro")}</p>
        <label htmlFor="sazo-address-label">{t("sazo.account.address.label")}</label>
        <input
          defaultValue={t("sazo.account.address.home")}
          id="sazo-address-label"
          type="text"
        />
        <fieldset>
          <legend>{t("sazo.account.address.name")}</legend>
          <input aria-label={t("sazo.account.address.familyName")} type="text" />
          <input aria-label={t("sazo.account.address.givenName")} type="text" />
        </fieldset>
        <label htmlFor="sazo-address-phone">{t("sazo.account.address.phone")}</label>
        <div className="sazo-address-phone">
          <span>JP +81</span>
          <input
            defaultValue={sazoAccountFixture.phone}
            id="sazo-address-phone"
            type="tel"
          />
        </div>
        <label htmlFor="sazo-address-postal">{t("sazo.account.address.postal")}</label>
        <input id="sazo-address-postal" inputMode="numeric" type="text" />
        <label htmlFor="sazo-address-city">{t("sazo.account.address.city")}</label>
        <input id="sazo-address-city" type="text" />
        <label htmlFor="sazo-address-street">{t("sazo.account.address.street")}</label>
        <input id="sazo-address-street" type="text" />
        <button className="sazo-account-fixed-action" type="submit">
          {t("sazo.account.address.next")}
        </button>
      </form>
    </AccountViewFrame>
  );
}

export function NotificationsView({ dispatch }: AccountViewProps) {
  const [filter, setFilter] = useState<"all" | "agent" | "shipping" | "guide">(
    "all",
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [enabled, setEnabled] = useState({ email: true, mobile: true });
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);

  const updates = [
    {
      id: "jordan",
      product: {
        image: "/sazo-commerce/reference/air-jordan-1-retro-high-og.png",
        name: "Air Jordan 1 Retro High OG",
      },
      filter: "agent" as const,
      status: "購入可能になりました",
      detail: "関税込み R$ 789・7〜10日で到着予定",
      time: "たった今",
      timeline: "販売元・規制・関税を確認しました",
      timelineTime: "今日",
    },
    {
      id: "switch",
      product: {
        image: "/sazo-commerce/reference/nintendo-switch-oled.png",
        name: "Nintendo Switch OLED",
      },
      filter: "shipping" as const,
      status: "日本から発送されました",
      detail: "配送状況はマイページで確認できます",
      time: "昨日",
    },
  ];
  const visibleUpdates = updates.filter(
    (update) => filter === "all" || update.filter === filter,
  );

  return (
    <section className="sazo-notifications-view" data-view-content="notifications">
      <header className="sazo-notifications-header">
        <button
          aria-label="J-Planet ホーム"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          <JplanetLogo />
        </button>
        <h1>通知</h1>
        <button
          aria-expanded={settingsOpen}
          aria-label="通知設定を開く"
          onClick={() => {
            setSettingsOpen((current) => !current);
          }}
          type="button"
        >
          <Settings aria-hidden size={25} strokeWidth={2} />
        </button>
      </header>

      <main className="sazo-notifications-reference-content">
        <section
          className="sazo-notifications-intro"
          aria-labelledby="sazo-notifications-heading"
        >
          <h2 id="sazo-notifications-heading">お知らせ</h2>
          <p>購入に関する変化をまとめてお知らせします。</p>
        </section>

        <div
          aria-label="通知を絞り込む"
          className="sazo-notifications-reference-tabs"
          role="tablist"
        >
          {(
            [
              ["all", "すべて"],
              ["agent", "エージェント"],
            ["shipping", "配送"],
            ["guide", "ご案内"],
            ] as const
          ).map(([value, label]) => (
            <button
              aria-selected={filter === value}
              key={value}
              onClick={() => {
                setFilter(value);
              }}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <section
          className="sazo-notifications-updates"
          aria-labelledby="sazo-notifications-updates-heading"
        >
          <h2 id="sazo-notifications-updates-heading">購入のアップデート</h2>
          <ol>
            {visibleUpdates.map((update) => (
              <li className="sazo-notifications-update" key={update.id}>
                <span className="sazo-notifications-timeline" aria-hidden>
                  <i />
                  <b />
                </span>
                <button
                  aria-label={`${update.product.name}の詳細を開く`}
                  data-testid={`sazo-notification-${update.id}`}
                  onClick={() => {
                    setSelectedUpdate(update.id);
                    if (update.id === "switch") {
                      dispatch({
                        type: "open-product",
                        productId: "jplanet-nintendo-switch-oled",
                      });
                      return;
                    }
                    dispatch({ type: "navigate", view: "agent-hub" });
                  }}
                  type="button"
                >
                  <img alt="" src={update.product.image} />
                  <span className="sazo-notifications-update-copy">
                    <strong>{update.product.name}</strong>
                    <b>
                      <PackageCheck aria-hidden size={18} />
                      {update.status}
                    </b>
                    <small>{update.detail}</small>
                    <em>
                      {selectedUpdate === update.id ? "詳細を開いています" : update.time}
                    </em>
                  </span>
                  <ChevronRight aria-hidden size={23} />
                </button>
                {update.timeline === undefined ? null : (
                  <div className="sazo-notifications-timeline-detail">
                    <i aria-hidden />
                    <span>
                      <strong>{update.timeline}</strong>
                      <small>{update.timelineTime}</small>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="sazo-notifications-reference-settings">
          <button
            aria-expanded={settingsOpen}
            aria-label="通知設定"
            onClick={() => {
              setSettingsOpen((current) => !current);
            }}
            type="button"
          >
            <Bell aria-hidden size={25} strokeWidth={1.7} />
            <span>通知設定</span>
            <ChevronRight aria-hidden size={21} />
          </button>
          {settingsOpen ? (
            <div className="sazo-notifications-settings-panel">
              {(["email", "mobile"] as const).map((channel) => (
                <button
                  aria-checked={enabled[channel]}
                  aria-label={channel === "email" ? "メール通知" : "携帯通知"}
                  key={channel}
                  onClick={() => {
                    setEnabled((current) => ({
                      ...current,
                      [channel]: !current[channel],
                    }));
                  }}
                  role="switch"
                  type="button"
                >
                  <span>{channel === "email" ? "メール通知" : "携帯通知"}</span>
                  <i />
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </section>
  );
}

export function SupportView() {
  const { t } = useTranslation();

  return (
    <section className="sazo-support-view" data-view-content="support">
      <h1 className="sazo-visually-hidden">{t("sazo.account.support.title")}</h1>
      <div className="sazo-support-content">
        <section className="sazo-support-hero">
          <CircleHelp aria-hidden size={42} />
          <h2>{t("sazo.account.support.heading")}</h2>
          <p>{t("sazo.account.support.intro")}</p>
          <label className="sazo-support-search">
            <Search aria-hidden size={21} />
            <span className="sazo-visually-hidden">
              {t("sazo.account.support.searchLabel")}
            </span>
            <input
              placeholder={t("sazo.account.support.searchPlaceholder")}
              type="search"
            />
          </label>
        </section>
        <section className="sazo-support-section">
          <h2>{t("sazo.account.support.faq")}</h2>
          {(["order", "payment", "shipping"] as const).map((topic) => (
            <button key={topic} type="button">
              <span>{t(`sazo.account.support.topics.${topic}`)}</span>
              <ChevronRight aria-hidden size={20} />
            </button>
          ))}
        </section>
        <section className="sazo-support-section">
          <h2>{t("sazo.account.support.customerSupport")}</h2>
          <p className="sazo-support-hours">{t("sazo.account.support.weekday")}</p>
          <p className="sazo-support-hours">{t("sazo.account.support.weekend")}</p>
          <p className="sazo-support-reply">{t("sazo.account.support.reply")}</p>
          <button type="button">
            <Headphones aria-hidden size={22} />
            <span>{t("sazo.account.support.chatNow")}</span>
            <ChevronRight aria-hidden size={20} />
          </button>
        </section>
        <section className="sazo-support-section">
          <h2>{t("sazo.account.support.guide")}</h2>
          <button type="button">
            <ShieldCheck aria-hidden size={22} />
            <span>{t("sazo.account.support.guideLink")}</span>
            <ChevronRight aria-hidden size={20} />
          </button>
        </section>
      </div>
      <AccountLegalFooter />
    </section>
  );
}

export function CardsView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.cards.title")}
      view="cards"
    >
      <div className="sazo-cards-content">
        <section className="sazo-account-empty-state">
          <CreditCard aria-hidden size={42} strokeWidth={1.5} />
          <h2>{t("sazo.cards.empty")}</h2>
        </section>
      </div>
    </AccountViewFrame>
  );
}
