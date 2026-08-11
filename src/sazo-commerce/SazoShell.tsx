import type { Dispatch, ReactNode } from "react";
import {
  Bell,
  Bookmark,
  ChevronDown,
  ClipboardPaste,
  Heart,
  Home,
  MessageCircle,
  Search,
  ShoppingCart,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  SazoAccountView,
  SazoAction,
  SazoState,
  SazoView,
} from "@/sazo-commerce/model";
import { JplanetLogo } from "@/sazo-commerce/JplanetLogo";

interface NavigationItem {
  icon?: LucideIcon;
  translationKey: string;
  view?: SazoView;
}

const desktopNavigation = [
  { translationKey: "sazo.navigation.home", view: "home" },
  { translationKey: "sazo.navigation.service", view: "service" },
  { translationKey: "sazo.navigation.brands", view: "brands" },
  { translationKey: "sazo.navigation.categories", view: "categories" },
  { translationKey: "sazo.navigation.reviews", view: "reviews" },
  { translationKey: "sazo.navigation.help", view: "support" },
  { translationKey: "sazo.navigation.news" },
] satisfies readonly NavigationItem[];

const mobileSecondaryNavigation = [
  { translationKey: "sazo.navigation.home", view: "home" },
  { translationKey: "sazo.navigation.service", view: "service" },
  { translationKey: "sazo.navigation.brands", view: "brands" },
  { translationKey: "sazo.navigation.categories", view: "categories" },
  { translationKey: "sazo.navigation.reviews", view: "reviews" },
  { translationKey: "sazo.navigation.help", view: "support" },
  { translationKey: "sazo.navigation.news" },
] satisfies readonly NavigationItem[];

export interface SazoShellProps {
  children?: ReactNode;
  dispatch: Dispatch<SazoAction>;
  state: SazoState;
}

interface NavigationButtonProps {
  active?: boolean;
  className?: string;
  dispatch: Dispatch<SazoAction>;
  icon?: LucideIcon;
  label: string;
  state: SazoState;
  testId?: string;
  view?: SazoView;
}

function NavigationButton({
  active,
  className = "sazo-nav-button",
  dispatch,
  icon: Icon,
  label,
  state,
  testId,
  view,
}: NavigationButtonProps) {
  const isNavigable = view !== undefined;

  return (
    <button
      aria-pressed={isNavigable ? (active ?? state.view === view) : undefined}
      className={className}
      data-testid={testId}
      onClick={
        isNavigable
          ? () => {
              dispatch({ type: "navigate", view });
            }
          : undefined
      }
      type="button"
    >
      {Icon === undefined ? null : <Icon aria-hidden size={20} strokeWidth={1.8} />}
      <span>{label}</span>
    </button>
  );
}

interface ControlButtonProps {
  className: string;
  expanded?: boolean;
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  pressed?: boolean;
  testId?: string;
}

function ControlButton({
  className,
  expanded,
  icon: Icon,
  label,
  onPress,
  pressed,
  testId,
}: ControlButtonProps) {
  return (
    <button
      aria-expanded={expanded}
      aria-pressed={pressed}
      className={className}
      data-testid={testId}
      onClick={onPress}
      type="button"
    >
      <Icon aria-hidden size={20} strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}

interface WordmarkProps {
  dispatch: Dispatch<SazoAction>;
  homeLabel: string;
}

function Wordmark({ dispatch, homeLabel }: WordmarkProps) {
  return (
    <button
      aria-label={homeLabel}
      className="sazo-wordmark"
      onClick={() => {
        dispatch({ type: "navigate", view: "home" });
      }}
      type="button"
    >
      <JplanetLogo />
    </button>
  );
}

interface ShellFooterProps {
  copyright: string;
}

function ShellFooter({ copyright }: ShellFooterProps) {
  return (
    <footer className="sazo-footer">
      <small>{copyright}</small>
    </footer>
  );
}

export function SazoShell({ children, dispatch, state }: SazoShellProps) {
  const { t } = useTranslation();
  const loginExpanded = state.overlay === "login";
  const serviceView = state.view === "service";
  const agentHubView = state.view === "agent-hub";
  const dedicatedMobileHeader = agentHubView || state.view === "beauty" || state.view === "cart";
  const accountDetailViews = new Set<SazoAccountView>([
    "mypage",
    "favorites",
    "profile",
    "cards",
    "orders",
    "coupons",
    "points",
    "review-create",
    "review-history",
    "delivery",
    "address",
    "notifications",
  ]);
  const accountView = accountDetailViews.has(state.view as SazoAccountView);
  const accountAvailable = state.authenticated || accountView || state.view === "support";
  const myPageSectionActive =
    (accountView && state.view !== "favorites") || state.view === "support";

  return (
    <div className="sazo-shell-background" data-overlay-background="true">
      <div className="sazo-desktop-shell" data-shell="desktop">
        <div className="sazo-desktop-header-band">
          <div className="sazo-desktop-header-card">
            <header className="sazo-desktop-header">
              <Wordmark dispatch={dispatch} homeLabel={t("sazo.brand.homeLabel")} />

              <div className="sazo-search" role="search">
                <label className="sazo-visually-hidden" htmlFor="sazo-desktop-search">
                  {t("sazo.search.label")}
                </label>
                <ClipboardPaste aria-hidden size={21} strokeWidth={1.7} />
                <input
                  id="sazo-desktop-search"
                  placeholder={t("sazo.search.placeholder")}
                  type="search"
                />
                <ChevronDown aria-hidden size={14} strokeWidth={2} />
                <Search aria-hidden size={23} strokeWidth={1.8} />
              </div>

              <div
                aria-label={t("sazo.actions.topActionsLabel")}
                className="sazo-top-actions"
                role="group"
              >
                <NavigationButton
                  className="sazo-top-action"
                  dispatch={dispatch}
                  icon={Bookmark}
                  label={t("sazo.navigation.favorites")}
                  state={state}
                  view="favorites"
                />
                <ControlButton
                  className="sazo-top-action"
                  icon={ShoppingCart}
                  label={t("sazo.actions.cart")}
                  onPress={() => {
                    dispatch({ type: "navigate", view: "cart" });
                  }}
                />
                <ControlButton
                  className="sazo-top-action"
                  icon={Bell}
                  label={t("sazo.navigation.notification")}
                  onPress={() => {
                    dispatch({ type: "navigate", view: "notifications" });
                  }}
                />
                {accountAvailable ? (
                  <NavigationButton
                    active={myPageSectionActive}
                    className="sazo-top-action"
                    dispatch={dispatch}
                    icon={UserRound}
                    label={t("sazo.navigation.mypage")}
                    state={state}
                    view="mypage"
                  />
                ) : (
                  <ControlButton
                    className="sazo-top-action"
                    expanded={loginExpanded}
                    icon={UserRound}
                    label={t("sazo.actions.login")}
                    onPress={() => {
                      dispatch({ type: "open-login" });
                    }}
                    testId="login-launcher"
                  />
                )}
                <button
                  aria-label={t("sazo.actions.language")}
                  className="sazo-top-action sazo-language-action"
                  type="button"
                >
                  <span aria-hidden className="sazo-language-flag">
                    🇯🇵
                  </span>
                </button>
              </div>
            </header>

            <nav
              aria-hidden={serviceView}
              aria-label={t("sazo.navigation.desktopLabel")}
              className="sazo-desktop-nav"
              data-behavior="sticky"
            >
              {desktopNavigation.map((item) => (
                <NavigationButton
                  className="sazo-secondary-button"
                  dispatch={dispatch}
                  key={item.translationKey}
                  label={t(item.translationKey)}
                  state={state}
                  testId={item.view === "reviews" ? "nav-reviews" : undefined}
                  view={item.view}
                />
              ))}
            </nav>
          </div>
        </div>

        <main className="sazo-main sazo-content-main">{children}</main>
        <ShellFooter copyright={t("sazo.footer.copyright")} />
      </div>

      <div className="sazo-mobile-shell" data-shell="mobile">
        {dedicatedMobileHeader ? null : (
          <header className="sazo-mobile-header">
            <div className="sazo-mobile-header-primary">
              <Wordmark dispatch={dispatch} homeLabel={t("sazo.brand.homeLabel")} />
              <div
                aria-label="モバイルヘッダー操作"
                className="sazo-mobile-header-actions"
                role="group"
              >
                <button
                  aria-label={t("sazo.actions.language")}
                  className="sazo-mobile-header-action sazo-language-action"
                  type="button"
                >
                  <span aria-hidden className="sazo-language-flag">
                    🇯🇵
                  </span>
                </button>
                <button
                  aria-label={t("sazo.actions.cart")}
                  className="sazo-mobile-header-action"
                  onClick={() => {
                    dispatch({ type: "navigate", view: "cart" });
                  }}
                  type="button"
                >
                  <ShoppingCart aria-hidden size={23} strokeWidth={2.2} />
                </button>
                <button
                  aria-label={t("sazo.navigation.mypage")}
                  className="sazo-mobile-header-action"
                  onClick={() => {
                    if (accountAvailable) {
                      dispatch({ type: "navigate", view: "mypage" });
                      return;
                    }

                    dispatch({ type: "open-login" });
                  }}
                  type="button"
                >
                  <UserRound aria-hidden size={23} strokeWidth={2.1} />
                </button>
              </div>
            </div>
            {state.view === "home" ? null : (
              <nav
                aria-label={t("sazo.navigation.mobileSecondaryLabel")}
                className="sazo-mobile-secondary-nav"
              >
                {mobileSecondaryNavigation.map((item) => (
                  <NavigationButton
                    className="sazo-mobile-secondary-button"
                    dispatch={dispatch}
                    key={item.translationKey}
                    label={t(item.translationKey)}
                    state={state}
                    view={item.view}
                  />
                ))}
              </nav>
            )}
          </header>
        )}

        <main className="sazo-main sazo-mobile-main" />
        <ShellFooter copyright={t("sazo.footer.copyright")} />

        <nav
          aria-hidden={serviceView}
          aria-label={t("sazo.navigation.mobileLabel")}
          className="sazo-mobile-nav"
          data-behavior="fixed"
        >
          <NavigationButton
            dispatch={dispatch}
            icon={Home}
            label={t("sazo.navigation.home")}
            state={state}
            view="home"
          />
          <NavigationButton
            dispatch={dispatch}
            icon={Bell}
            label={t("sazo.navigation.notification")}
            state={state}
            view="notifications"
          />
          <NavigationButton
            className="sazo-nav-button sazo-agent-nav-button"
            dispatch={dispatch}
            icon={Sparkles}
            label={t("sazo.agent.navigation")}
            state={state}
            view="agent-hub"
          />
          <NavigationButton
            dispatch={dispatch}
            icon={Heart}
            label={t("sazo.navigation.favorites")}
            state={state}
            view="favorites"
          />
          {accountAvailable ? (
            <NavigationButton
              active={myPageSectionActive}
              dispatch={dispatch}
              icon={UserRound}
              label={t("sazo.navigation.mypage")}
              state={state}
              view="mypage"
            />
          ) : (
            <ControlButton
              className="sazo-nav-button"
              expanded={loginExpanded}
              icon={UserRound}
              label={t("sazo.navigation.mypage")}
              onPress={() => {
                dispatch({ type: "open-login" });
              }}
            />
          )}
        </nav>
      </div>

      <button
        aria-expanded={state.overlay === "chat"}
        aria-label={t("sazo.actions.chat")}
        className="sazo-chat-button"
        data-testid="chat-launcher"
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
