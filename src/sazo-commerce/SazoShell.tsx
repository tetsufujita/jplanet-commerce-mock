import type { Dispatch, ReactNode } from "react";
import {
  Bell,
  Camera,
  Tag,
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
  label?: string;
  translationKey: string;
  view?: SazoView;
}

const desktopNavigation = [
  { translationKey: "sazo.navigation.home", view: "home" },
  { label: "ブランド", translationKey: "sazo.navigation.brands", view: "brands" },
  { translationKey: "sazo.agent.navigation", view: "agent-hub" },
  { translationKey: "sazo.navigation.notification", view: "notifications" },
  { translationKey: "sazo.navigation.mypage", view: "mypage" },
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
  const couponView = state.view === "coupons";
  const brandDetailView = state.view === "brand-detail";
  const dedicatedMobileHeader =
    agentHubView ||
    couponView ||
    state.view === "beauty" ||
    state.view === "cart" ||
    state.view === "checkout" ||
    state.view === "brands" ||
    brandDetailView;
  const accountDetailViews = new Set<SazoAccountView>([
    "mypage",
    "favorites",
    "profile",
    "cards",
    "orders",
    "order-detail",
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
    (accountView && state.view !== "notifications") ||
    state.view === "support";
  const postPurchaseView =
    state.view === "mypage" ||
    state.view === "orders" ||
    state.view === "order-detail" ||
    couponView ||
    brandDetailView;

  return (
    <div className="sazo-shell-background" data-overlay-background="true">
      <div className="sazo-desktop-shell" data-shell="desktop">
        <div className="sazo-desktop-header-band">
          <div className="sazo-desktop-header-card">
            <header className="sazo-desktop-header">
              <Wordmark dispatch={dispatch} homeLabel={t("sazo.brand.homeLabel")} />

              <nav
                aria-label={t("sazo.navigation.desktopLabel")}
                className="sazo-desktop-nav"
                data-behavior="sticky"
              >
                {desktopNavigation.map((item) => (
                  <NavigationButton
                    className="sazo-secondary-button"
                    dispatch={dispatch}
                    key={item.translationKey}
                    label={item.label ?? t(item.translationKey)}
                    state={state}
                    view={item.view}
                  />
                ))}
              </nav>

              <div
                aria-label={t("sazo.actions.topActionsLabel")}
                className="sazo-top-actions"
                role="group"
              >
                <button
                  aria-label="AI検索を開く"
                  className="sazo-desktop-agent-search"
                  onClick={() => {
                    dispatch({ type: "open-agent-hub", intent: "compose" });
                  }}
                  type="button"
                >
                  <Search aria-hidden size={18} strokeWidth={2} />
                  <span>AI検索</span>
                </button>
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
                <span aria-label="未読の通知 1件" className="sazo-desktop-notification-badge">
                  1
                </span>
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
              </div>
            </header>
          </div>
        </div>

        <main className="sazo-main sazo-content-main">{children}</main>
        <ShellFooter copyright={t("sazo.footer.copyright")} />
      </div>

      <div className="sazo-mobile-shell" data-shell="mobile">
        {dedicatedMobileHeader ? null : (
          <header className="sazo-mobile-header" data-sazo-topbar="true">
            <div
              className="sazo-mobile-header-primary sazo-mobile-header-primary--commerce"
              data-sazo-topbar-primary
            >
              <div className="sazo-mobile-agent-searchbar" role="search">
                <button
                  aria-label={t("sazo.agentHub.composer.draftLabel")}
                  className="sazo-mobile-agent-search-trigger"
                  data-shell-search-button
                  onClick={() => {
                    dispatch({ type: "open-agent-hub", intent: "compose" });
                  }}
                  type="button"
                >
                  <Search aria-hidden size={23} strokeWidth={2.1} />
                  <span>{t("sazo.agentHub.composer.inputPlaceholder")}</span>
                </button>
                <button
                  aria-label={t("sazo.agentHub.composer.takePhoto")}
                  className="sazo-mobile-header-camera"
                  data-shell-camera-button
                  onClick={() => {
                    dispatch({ type: "open-agent-hub", intent: "camera" });
                  }}
                  type="button"
                >
                  <Camera aria-hidden size={25} strokeWidth={2} />
                </button>
              </div>
              <div
                aria-label="モバイルヘッダー操作"
                className="sazo-mobile-header-actions"
                role="group"
              >
                <button
                  aria-label={t("sazo.actions.cart")}
                  className="sazo-mobile-header-action"
                  data-shell-cart-button
                  onClick={() => {
                    dispatch({ type: "navigate", view: "cart" });
                  }}
                  type="button"
                >
                  <ShoppingCart aria-hidden size={23} strokeWidth={2.2} />
                  <span aria-hidden="true" data-shell-cart-badge>
                    {state.cartItems.length}
                  </span>
                </button>
                <button
                  aria-expanded={state.overlay === "chat"}
                  aria-label={t("sazo.actions.chat")}
                  className="sazo-mobile-header-action sazo-mobile-header-chat"
                  data-shell-chat-button
                  onClick={() => {
                    dispatch({ type: "open-chat" });
                  }}
                  type="button"
                >
                  <MessageCircle aria-hidden size={25} strokeWidth={1.9} />
                </button>
              </div>
            </div>
            <nav
              aria-label={t("sazo.navigation.mobileSecondaryLabel")}
              className="sazo-mobile-secondary-nav"
              data-sazo-topbar-nav
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
          </header>
        )}

        <main className="sazo-main sazo-mobile-main" />
        <ShellFooter copyright={t("sazo.footer.copyright")} />

        {postPurchaseView ? null : (
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
            icon={Tag}
            label="ブランド"
            state={state}
            view="brands"
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
            icon={Bell}
            label={t("sazo.navigation.notification")}
            state={state}
            view="notifications"
          />
          {accountAvailable ? (
            <NavigationButton
              active={myPageSectionActive}
              className="sazo-nav-button sazo-mypage-nav-button"
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
        )}
      </div>

      {postPurchaseView || state.view === "brands" ? null : (
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
      )}
    </div>
  );
}
