import { useState, type Dispatch, type ReactNode, type SyntheticEvent } from "react";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FilePenLine,
  FileText,
  Headphones,
  House,
  ImagePlus,
  LogOut,
  PackageCheck,
  ShoppingCart,
  Ticket,
  Truck,
  UserRoundPen,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { sazoAccountFixture } from "@/sazo-commerce/fixtures";
import type { SazoAction, SazoView } from "@/sazo-commerce/model";
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
        <button aria-label={t("sazo.views.common.cart")} type="button">
          <ShoppingCart aria-hidden size={25} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

interface AccountViewFrameProps extends AccountHeaderProps {
  children: ReactNode;
  view: Exclude<
    SazoView,
    "home" | "service" | "brands" | "categories" | "catalog" | "reviews" | "ranking"
  >;
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
          <button className="sazo-order-summary" type="button">
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
          />
          <AccountLink
            dispatch={dispatch}
            icon={CircleDollarSign}
            label={t("sazo.account.mypage.point")}
          />
        </section>

        <section className="sazo-account-group">
          <h2>{t("sazo.account.mypage.review")}</h2>
          <AccountLink
            dispatch={dispatch}
            icon={FilePenLine}
            label={t("sazo.account.mypage.createReview")}
          />
          <AccountLink
            dispatch={dispatch}
            icon={FileText}
            label={t("sazo.account.mypage.createdReviews")}
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
          />
          <AccountLink
            dispatch={dispatch}
            icon={Bell}
            label={t("sazo.account.mypage.notifications")}
          />
          <button className="sazo-account-support" type="button">
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
          <input aria-label={t("sazo.profile.phone.inputLabel")} readOnly type="tel" />
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
