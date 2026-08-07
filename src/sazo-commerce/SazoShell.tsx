import type { ComponentType, Dispatch, ReactNode } from "react";
import {
  Grid3X3,
  Heart,
  Home,
  Info,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SazoAction, SazoState, SazoView } from "@/sazo-commerce/model";

interface NavigationItem {
  icon: ComponentType<{ "aria-hidden": true; size: number; strokeWidth: number }>;
  translationKey: string;
  view: SazoView;
}

const desktopNavigation = [
  { icon: Info, translationKey: "sazo.navigation.service", view: "service" },
  { icon: Sparkles, translationKey: "sazo.navigation.brands", view: "brands" },
  { icon: Grid3X3, translationKey: "sazo.navigation.categories", view: "categories" },
  { icon: MessageCircle, translationKey: "sazo.navigation.reviews", view: "reviews" },
] satisfies readonly NavigationItem[];

const mobileNavigation = [
  { icon: Home, translationKey: "sazo.navigation.home", view: "home" },
  { icon: Grid3X3, translationKey: "sazo.navigation.categories", view: "categories" },
  { icon: Heart, translationKey: "sazo.navigation.favorites", view: "favorites" },
  { icon: UserRound, translationKey: "sazo.navigation.mypage", view: "mypage" },
] satisfies readonly NavigationItem[];

export interface SazoShellProps {
  children?: ReactNode;
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

interface NavigationButtonProps {
  dispatch: Dispatch<SazoAction>;
  icon: NavigationItem["icon"];
  label: string;
  state: SazoState;
  view: SazoView;
}

function NavigationButton({
  dispatch,
  icon: Icon,
  label,
  state,
  view,
}: NavigationButtonProps) {
  return (
    <button
      aria-pressed={state.view === view}
      className="sazo-nav-button"
      onClick={() => {
        dispatch({ type: "navigate", view });
      }}
      type="button"
    >
      <Icon aria-hidden size={20} strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}

export function SazoShell({ children, dispatch, state }: SazoShellProps) {
  const { t } = useTranslation();

  return (
    <div
      className="sazo-root"
      data-auth-step={state.authStep}
      data-overlay={state.overlay}
      data-view={state.view}
    >
      <header className="sazo-desktop-header" data-shell="desktop">
        <button
          aria-label={t("sazo.brand.homeLabel")}
          className="sazo-wordmark"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          {t("sazo.brand.wordmark")}
        </button>

        <div className="sazo-search" role="search">
          <label className="sazo-visually-hidden" htmlFor="sazo-desktop-search">
            {t("sazo.search.label")}
          </label>
          <Search aria-hidden size={20} strokeWidth={1.8} />
          <input
            id="sazo-desktop-search"
            placeholder={t("sazo.search.placeholder")}
            type="search"
          />
        </div>

        <nav aria-label={t("sazo.navigation.desktopLabel")} className="sazo-desktop-nav">
          {desktopNavigation.map((item) => (
            <NavigationButton
              dispatch={dispatch}
              icon={item.icon}
              key={item.view}
              label={t(item.translationKey)}
              state={state}
              view={item.view}
            />
          ))}
        </nav>

        <div className="sazo-account-actions">
          <NavigationButton
            dispatch={dispatch}
            icon={Heart}
            label={t("sazo.navigation.favorites")}
            state={state}
            view="favorites"
          />
          <button
            className="sazo-login-button"
            onClick={() => {
              dispatch({ type: "open-login" });
            }}
            type="button"
          >
            <UserRound aria-hidden size={20} strokeWidth={1.8} />
            <span>{t("sazo.actions.login")}</span>
          </button>
        </div>
      </header>

      <header className="sazo-mobile-header" data-shell="mobile">
        <button
          aria-label={t("sazo.brand.homeLabel")}
          className="sazo-wordmark"
          onClick={() => {
            dispatch({ type: "navigate", view: "home" });
          }}
          type="button"
        >
          {t("sazo.brand.wordmark")}
        </button>
        <div className="sazo-mobile-actions">
          <button
            aria-label={t("sazo.search.label")}
            className="sazo-icon-button"
            onClick={() => {
              dispatch({ type: "navigate", view: "catalog" });
            }}
            type="button"
          >
            <Search aria-hidden size={22} strokeWidth={1.8} />
          </button>
          <button
            aria-label={t("sazo.actions.login")}
            className="sazo-icon-button"
            onClick={() => {
              dispatch({ type: "open-login" });
            }}
            type="button"
          >
            <UserRound aria-hidden size={22} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="sazo-main" id="sazo-main">
        {children}
      </main>

      <footer className="sazo-footer">
        <small>{t("sazo.footer.copyright")}</small>
      </footer>

      <nav
        aria-label={t("sazo.navigation.mobileLabel")}
        className="sazo-mobile-nav"
        data-shell="mobile"
      >
        {mobileNavigation.map((item) => (
          <NavigationButton
            dispatch={dispatch}
            icon={item.icon}
            key={item.view}
            label={t(item.translationKey)}
            state={state}
            view={item.view}
          />
        ))}
      </nav>

      <button
        aria-label={t("sazo.actions.chat")}
        className="sazo-chat-button"
        onClick={() => {
          dispatch({ type: "open-chat" });
        }}
        type="button"
      >
        <MessageCircle aria-hidden size={26} strokeWidth={1.8} />
      </button>
    </div>
  );
}
