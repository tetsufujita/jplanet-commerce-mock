import { useState, type Dispatch, type ReactNode, type SyntheticEvent } from "react";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FilePenLine,
  FileText,
  Headphones,
  House,
  ImagePlus,
  LogOut,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  Truck,
  UserRoundPen,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { sazoAccountFixture } from "@/sazo-commerce/fixtures";
import type { SazoAccountView, SazoAction, SazoView } from "@/sazo-commerce/model";
import "@/sazo-commerce/coupons.css";

interface AccountViewProps {
  dispatch: Dispatch<SazoAction>;
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
  view?: SazoView;
}

function AccountLink({ dispatch, icon: Icon, label, view }: AccountLinkProps) {
  return (
    <button
      className="sazo-account-link"
      onClick={
        view === undefined
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

export function MyPageView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="home"
      dispatch={dispatch}
      title={t("sazo.account.mypage.title")}
      view="mypage"
    >
      <div className="sazo-account-content sazo-mypage-content">
        <section className="sazo-member-summary">
          <button
            className="sazo-member-name"
            onClick={() => {
              dispatch({ type: "navigate", view: "profile" });
            }}
            type="button"
          >
            <span aria-hidden className="sazo-member-avatar">
              {sazoAccountFixture.displayName.slice(0, 1)}
            </span>
            <strong>
              {t("sazo.account.mypage.memberGreeting", {
                name: sazoAccountFixture.displayName,
              })}
            </strong>
            <ChevronRight aria-hidden size={22} />
          </button>
          <div className="sazo-member-balances">
            <div>
              <CircleDollarSign aria-hidden size={25} />
              <strong>{sazoAccountFixture.points}</strong>
              <span>{t("sazo.account.mypage.points")}</span>
            </div>
            <div>
              <Ticket aria-hidden size={25} />
              <strong>{sazoAccountFixture.coupons}</strong>
              <span>{t("sazo.account.mypage.coupons")}</span>
            </div>
          </div>
          <button
            className="sazo-order-summary"
            onClick={() => {
              dispatch({ type: "navigate", view: "orders" });
            }}
            type="button"
          >
            <Truck aria-hidden size={24} />
            <span>{t("sazo.account.mypage.allOrders")}</span>
            <ChevronRight aria-hidden size={22} />
          </button>
        </section>

        <section className="sazo-account-group">
          <h2>{t("sazo.account.mypage.shopping")}</h2>
          <AccountLink
            dispatch={dispatch}
            icon={ClipboardList}
            label={t("sazo.account.mypage.orderHistory")}
            view="orders"
          />
          <AccountLink
            dispatch={dispatch}
            icon={Bookmark}
            label={t("sazo.navigation.favorites")}
            view="favorites"
          />
          <AccountLink
            dispatch={dispatch}
            icon={Ticket}
            label={t("sazo.account.mypage.coupon")}
            view="coupons"
          />
          <AccountLink
            dispatch={dispatch}
            icon={CircleDollarSign}
            label={t("sazo.account.mypage.point")}
            view="points"
          />
        </section>

        <section className="sazo-account-group">
          <h2>{t("sazo.account.mypage.review")}</h2>
          <AccountLink
            dispatch={dispatch}
            icon={FilePenLine}
            label={t("sazo.account.mypage.createReview")}
            view="review-create"
          />
          <AccountLink
            dispatch={dispatch}
            icon={FileText}
            label={t("sazo.account.mypage.createdReviews")}
            view="review-history"
          />
        </section>

        <section className="sazo-account-group">
          <h2>{t("sazo.account.mypage.settings")}</h2>
          <AccountLink
            dispatch={dispatch}
            icon={UserRoundPen}
            label={t("sazo.account.mypage.editProfile")}
            view="profile"
          />
          <AccountLink
            dispatch={dispatch}
            icon={CreditCard}
            label={t("sazo.account.mypage.cards")}
            view="cards"
          />
          <AccountLink
            dispatch={dispatch}
            icon={Truck}
            label={t("sazo.account.mypage.delivery")}
            view="delivery"
          />
          <AccountLink
            dispatch={dispatch}
            icon={Bell}
            label={t("sazo.account.mypage.notifications")}
            view="notifications"
          />
          <button
            className="sazo-account-support"
            onClick={() => {
              dispatch({ type: "navigate", view: "support" });
            }}
            type="button"
          >
            <Headphones aria-hidden size={22} />
            <span>{t("sazo.account.mypage.support")}</span>
          </button>
          <button className="sazo-account-logout" type="button">
            <LogOut aria-hidden size={20} />
            <span>{t("sazo.account.mypage.logout")}</span>
          </button>
        </section>
      </div>
    </AccountViewFrame>
  );
}

type FavoriteTab = "product" | "brand" | "review";

const favoriteTabs = [
  "product",
  "brand",
  "review",
] as const satisfies readonly FavoriteTab[];

export function FavoritesView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FavoriteTab>("product");

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.favorites.title")}
      view="favorites"
    >
      <div className="sazo-favorites-content">
        <div
          aria-label={t("sazo.favorites.tabsLabel")}
          className="sazo-favorite-tabs"
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
            </button>
          ))}
        </div>

        <div className="sazo-favorite-toolbar">
          <div className="sazo-favorite-filters">
            <button aria-pressed="true" type="button">
              {t("sazo.favorites.filters.all")}
            </button>
            {tab === "product" ? (
              <>
                <button aria-pressed="false" type="button">
                  {t("sazo.favorites.filters.regular")}
                </button>
                <button aria-pressed="false" type="button">
                  {t("sazo.favorites.filters.limited")}
                </button>
              </>
            ) : null}
          </div>
          <label className="sazo-visually-hidden" htmlFor="sazo-favorite-sort">
            {t("sazo.favorites.sort.label")}
          </label>
          <select id="sazo-favorite-sort">
            <option>{t("sazo.favorites.sort.latest")}</option>
            <option>{t("sazo.favorites.sort.price")}</option>
            <option>{t("sazo.favorites.sort.name")}</option>
          </select>
        </div>

        <section className="sazo-account-empty-state">
          <PackageCheck aria-hidden size={40} strokeWidth={1.5} />
          <h2>{t(`sazo.favorites.empty.${tab}.title`)}</h2>
          <p>{t(`sazo.favorites.empty.${tab}.body`)}</p>
          {tab === "brand" ? (
            <button
              onClick={() => {
                dispatch({ type: "navigate", view: "brands" });
              }}
              type="button"
            >
              {t("sazo.favorites.empty.brand.cta")}
            </button>
          ) : null}
          {tab === "review" ? (
            <button
              onClick={() => {
                dispatch({ type: "navigate", view: "reviews" });
              }}
              type="button"
            >
              {t("sazo.favorites.empty.review.cta")}
            </button>
          ) : null}
        </section>
      </div>
    </AccountViewFrame>
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
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.orders.title")}
      view="orders"
    >
      <div className="sazo-account-screen-content sazo-orders-content">
        <div aria-label={t("sazo.account.orders.tabsLabel")} className="sazo-account-tabs" role="tablist">
          <button aria-selected="true" role="tab" type="button">
            {t("sazo.account.orders.tabs.all")}
          </button>
          <button aria-selected="false" role="tab" type="button">
            {t("sazo.account.orders.tabs.payment")}
          </button>
          <button aria-selected="false" role="tab" type="button">
            {t("sazo.account.orders.tabs.shipping")}
          </button>
        </div>
        <div className="sazo-orders-filters">
          <label htmlFor="sazo-orders-period">{t("sazo.account.orders.period")}</label>
          <select id="sazo-orders-period">
            <option>{t("sazo.account.orders.periodOption")}</option>
          </select>
          <button type="button">
            <Search aria-hidden size={18} />
            {t("sazo.account.orders.search")}
          </button>
        </div>
        <section className="sazo-account-empty-state sazo-recorded-empty-state">
          <ClipboardList aria-hidden size={44} strokeWidth={1.45} />
          <h2>{t("sazo.account.orders.emptyTitle")}</h2>
          <p>{t("sazo.account.orders.emptyBody")}</p>
        </section>
      </div>
    </AccountViewFrame>
  );
}

export function CouponsView({ dispatch }: AccountViewProps) {
  const { t } = useTranslation();

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.coupons.title")}
      view="coupons"
    >
      <div className="sazo-account-screen-content sazo-coupons-content">
        <form
          className="sazo-coupon-register"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label htmlFor="sazo-coupon-number">{t("sazo.account.coupons.registerTitle")}</label>
          <div>
            <input
              aria-label={t("sazo.account.coupons.numberLabel")}
              id="sazo-coupon-number"
              placeholder={t("sazo.account.coupons.numberPlaceholder")}
              type="text"
            />
            <button type="submit">{t("sazo.account.coupons.register")}</button>
          </div>
        </form>
        <div className="sazo-coupon-count">
          <span>{t("sazo.account.coupons.available")}</span>
          <strong>{sazoAccountFixture.coupons}</strong>
        </div>
        <article className="sazo-coupon-card">
          <div className="sazo-coupon-card-icon">
            <Ticket aria-hidden size={28} />
          </div>
          <div>
            <strong>{t("sazo.account.coupons.discount")}</strong>
            <h2>{t("sazo.account.coupons.name")}</h2>
            <p>{t("sazo.account.coupons.expiry")}</p>
          </div>
        </article>
      </div>
    </AccountViewFrame>
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
        <div aria-label={t("sazo.account.points.tabsLabel")} className="sazo-account-tabs" role="tablist">
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
      <form className="sazo-account-screen-content sazo-address-form" onSubmit={handleSubmit}>
        <p className="sazo-address-intro">{t("sazo.account.address.intro")}</p>
        <label htmlFor="sazo-address-label">{t("sazo.account.address.label")}</label>
        <input defaultValue={t("sazo.account.address.home")} id="sazo-address-label" type="text" />
        <fieldset>
          <legend>{t("sazo.account.address.name")}</legend>
          <input aria-label={t("sazo.account.address.familyName")} type="text" />
          <input aria-label={t("sazo.account.address.givenName")} type="text" />
        </fieldset>
        <label htmlFor="sazo-address-phone">{t("sazo.account.address.phone")}</label>
        <div className="sazo-address-phone">
          <span>JP +81</span>
          <input defaultValue={sazoAccountFixture.phone} id="sazo-address-phone" type="tel" />
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
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState({ email: true, mobile: true });
  const [filter, setFilter] = useState<"all" | "orders" | "announcements">("all");
  const [allRead, setAllRead] = useState(false);

  const notices = [
    {
      id: "order",
      kind: "orders" as const,
      icon: PackageCheck,
      title: t("sazo.account.notifications.demo.orderTitle"),
      body: t("sazo.account.notifications.demo.orderBody"),
      meta: t("sazo.account.notifications.demo.orderMeta"),
    },
    {
      id: "documents",
      kind: "orders" as const,
      icon: FileText,
      title: t("sazo.account.notifications.demo.documentsTitle"),
      body: t("sazo.account.notifications.demo.documentsBody"),
      meta: t("sazo.account.notifications.demo.documentsMeta"),
    },
    {
      id: "announcement",
      kind: "announcements" as const,
      icon: Bell,
      title: t("sazo.account.notifications.demo.announcementTitle"),
      body: t("sazo.account.notifications.demo.announcementBody"),
      meta: t("sazo.account.notifications.demo.announcementMeta"),
    },
  ];
  const visibleNotices = notices.filter(
    (notice) => filter === "all" || notice.kind === filter,
  );

  return (
    <AccountViewFrame
      backView="mypage"
      dispatch={dispatch}
      title={t("sazo.account.notifications.title")}
      view="notifications"
    >
      <div className="sazo-account-screen-content sazo-notifications-content">
        <section aria-labelledby="sazo-notifications-heading" className="sazo-notifications-feed">
          <div className="sazo-notifications-feed-heading">
            <div>
              <span className="sazo-notifications-eyebrow">J-PLANET</span>
              <h2 id="sazo-notifications-heading">{t("sazo.account.notifications.noticeHeading")}</h2>
            </div>
            <button
              className="sazo-notifications-read-all"
              onClick={() => {
                setAllRead(true);
              }}
              type="button"
            >
              {t("sazo.account.notifications.readAll")}
            </button>
          </div>
          <div aria-label={t("sazo.account.notifications.filterLabel")} className="sazo-notifications-filters">
            {([
              ["all", t("sazo.account.notifications.filters.all")],
              ["orders", t("sazo.account.notifications.filters.orders")],
              ["announcements", t("sazo.account.notifications.filters.announcements")],
            ] as const).map(([value, label]) => (
              <button
                aria-pressed={filter === value}
                className="sazo-notifications-filter"
                key={value}
                onClick={() => {
                  setFilter(value);
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sazo-notifications-list">
            {visibleNotices.map((notice) => {
              const Icon = notice.icon;
              return (
                <button
                  className={`sazo-notification-card${allRead ? " is-read" : ""}`}
                  data-notification-kind={notice.kind}
                  data-testid={`sazo-notification-${notice.id}`}
                  key={notice.id}
                  onClick={() => {
                    dispatch({ type: "navigate", view: "mypage" });
                  }}
                  type="button"
                >
                  <span className="sazo-notification-card-icon" aria-hidden>
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <span className="sazo-notification-card-copy">
                    <strong>{notice.title}</strong>
                    <span>{notice.body}</span>
                    <small>{notice.meta}</small>
                  </span>
                  {!allRead ? <span aria-label={t("sazo.account.notifications.unread")} className="sazo-notification-unread" /> : null}
                  <ChevronRight aria-hidden className="sazo-notification-card-chevron" size={19} />
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label={t("sazo.account.notifications.settingsHeading")} className="sazo-notification-settings">
          {(["email", "mobile"] as const).map((channel) => (
            <div className="sazo-notification-row" key={channel}>
              <div>
                <strong>{t(`sazo.account.notifications.${channel}.title`)}</strong>
                <p>{t(`sazo.account.notifications.${channel}.body`)}</p>
              </div>
              <button
                aria-checked={enabled[channel]}
                aria-label={t(`sazo.account.notifications.${channel}.title`)}
                className="sazo-notification-switch"
                onClick={() => {
                  setEnabled((current) => ({
                    ...current,
                    [channel]: !current[channel],
                  }));
                }}
                role="switch"
                type="button"
              >
                <span />
              </button>
            </div>
          ))}
        </section>
      </div>
    </AccountViewFrame>
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
            <span className="sazo-visually-hidden">{t("sazo.account.support.searchLabel")}</span>
            <input placeholder={t("sazo.account.support.searchPlaceholder")} type="search" />
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
