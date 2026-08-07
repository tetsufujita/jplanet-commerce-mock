import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
} from "react";
import { LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { SazoAction } from "@/sazo-commerce/model";

const mobileViewportQuery = "(max-width: 767px)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export interface ChatPanelProps {
  dispatch: Dispatch<SazoAction>;
}

function getServerMediaQuerySnapshot() {
  return false;
}

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => undefined;
      }

      const mediaQuery = window.matchMedia(query);
      const handleChange = () => {
        notify();
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    },
    [query],
  );
  const getSnapshot = useCallback(
    () =>
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia(query).matches
        : false,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerMediaQuerySnapshot);
}

function useMobileViewport() {
  return useMediaQuery(mobileViewportQuery);
}

function usePrefersReducedMotion() {
  return useMediaQuery(reducedMotionQuery);
}

export function ChatPanel({ dispatch }: ChatPanelProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const mobile = useMobileViewport();
  const reducedMotion = usePrefersReducedMotion();
  const duration = reducedMotion ? 0 : mobile ? 0.18 : 0.22;
  const close = useCallback(() => {
    dispatch({ type: "close-overlay" });
  }, [dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 360);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const previousActive =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.querySelector<HTMLElement>(
      '[data-overlay-background="true"]',
    );
    const previousAriaHidden = background?.getAttribute("aria-hidden") ?? null;
    const backgroundWasInert = background?.hasAttribute("inert") ?? false;
    const previousOverflow = document.body.style.overflow;

    background?.setAttribute("aria-hidden", "true");
    background?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    panelRef.current
      ?.querySelector<HTMLElement>(focusableSelector)
      ?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (first === undefined || last === undefined) {
        event.preventDefault();

        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (background !== null) {
        if (previousAriaHidden === null) {
          background.removeAttribute("aria-hidden");
        } else {
          background.setAttribute("aria-hidden", previousAriaHidden);
        }

        if (!backgroundWasInert) {
          background.removeAttribute("inert");
        }
      }

      previousActive?.focus({ preventScroll: true });
    };
  }, [close]);

  const initial = mobile ? { opacity: 0, y: 18 } : { x: "100%" };
  const animate = mobile ? { opacity: 1, y: 0 } : { x: 0 };
  const exit = mobile ? { opacity: 0, y: 18 } : { x: "100%" };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="sazo-chat-backdrop"
      data-testid="sazo-chat-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          close();
        }
      }}
      role="presentation"
      transition={{ duration }}
    >
      <motion.div
        animate={animate}
        aria-labelledby="sazo-chat-title"
        aria-modal="true"
        className="sazo-chat-panel"
        data-motion-duration={String(duration)}
        data-motion-mode={mobile ? "mobile" : "desktop"}
        exit={exit}
        initial={initial}
        ref={panelRef}
        role="dialog"
        transition={{ duration, ease: "easeOut" }}
      >
        <header className="sazo-chat-header">
          <div>
            <MessageCircle aria-hidden size={25} strokeWidth={1.8} />
            <h1 id="sazo-chat-title">{t("sazo.chat.title")}</h1>
          </div>
          <button
            aria-label={t("sazo.chat.close")}
            className="sazo-overlay-close"
            data-testid="chat-close"
            onClick={close}
            type="button"
          >
            <X aria-hidden size={25} strokeWidth={1.8} />
          </button>
        </header>

        <div aria-live="polite" className="sazo-chat-history">
          {loading ? (
            <div className="sazo-chat-status" role="status">
              <LoaderCircle aria-hidden className="sazo-chat-loader" size={28} />
              <span>{t("sazo.chat.loading")}</span>
            </div>
          ) : (
            <div className="sazo-chat-empty">
              <MessageCircle aria-hidden size={38} strokeWidth={1.4} />
              <h2>{t("sazo.chat.emptyTitle")}</h2>
              <p>{t("sazo.chat.emptyBody")}</p>
            </div>
          )}
        </div>

        <form
          className="sazo-chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="sazo-visually-hidden" htmlFor="sazo-chat-message">
            {t("sazo.chat.messageLabel")}
          </label>
          <textarea
            id="sazo-chat-message"
            placeholder={t("sazo.chat.placeholder")}
            rows={2}
          />
          <button aria-label={t("sazo.chat.send")} disabled type="submit">
            <Send aria-hidden size={21} />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
