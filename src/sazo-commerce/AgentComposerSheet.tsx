import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SyntheticEvent,
} from "react";
import { ImagePlus, Link, Search, Sparkles, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { SazoAction } from "@/sazo-commerce/model";

export interface AgentComposerSheetProps {
  dispatch: Dispatch<SazoAction>;
}

export function AgentComposerSheet({ dispatch }: AgentComposerSheetProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const canSubmit = draft.trim().length > 0 || fileName !== null;

  const close = useCallback(() => {
    dispatch({ type: "close-overlay" });
  }, [dispatch]);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    dispatch({ type: "navigate", view: "catalog" });
  };

  useEffect(() => {
    const previousActive =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const background = document.querySelector<HTMLElement>(".sazo-shell-background");
    const backgroundHadInert = background?.hasAttribute("inert") ?? false;
    const previousInertValue = background?.getAttribute("inert") ?? "";

    document.body.style.overflow = "hidden";
    background?.setAttribute("inert", "");
    inputRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (dialog === null) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled]):not([tabindex="-1"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      const active = document.activeElement;

      if (first === undefined || last === undefined) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });

        return;
      }

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (backgroundHadInert) {
        background?.setAttribute("inert", previousInertValue);
      } else {
        background?.removeAttribute("inert");
      }
      previousActive?.focus({ preventScroll: true });
    };
  }, [close]);

  const transition = { duration: reduceMotion ? 0 : 0.2, ease: "easeOut" as const };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="sazo-agent-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) close();
      }}
      role="presentation"
      transition={transition}
    >
      <motion.div
        animate={{ y: 0 }}
        aria-labelledby="sazo-agent-title"
        aria-modal="true"
        className="sazo-agent-sheet"
        exit={{ y: reduceMotion ? 0 : 24 }}
        initial={{ y: reduceMotion ? 0 : 24 }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        transition={transition}
      >
        <div className="sazo-agent-handle" aria-hidden="true" />
        <header className="sazo-agent-header">
          <div>
            <span className="sazo-agent-icon" aria-hidden="true">
              <img
                alt=""
                aria-hidden
                data-jplanet-sakura-mark
                height={42}
                src="/sazo-commerce/jplanet-sakura-mark.png"
                width={42}
              />
            </span>
            <div>
              <p>{t("sazo.agent.eyebrow")}</p>
              <h1 id="sazo-agent-title">{t("sazo.agent.title")}</h1>
            </div>
          </div>
          <button
            aria-label={t("sazo.agent.close")}
            className="sazo-agent-close"
            onClick={close}
            type="button"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </header>

        <div
          aria-label={t("sazo.agent.inputMethods")}
          className="sazo-agent-chips"
          role="group"
        >
          <button
            onClick={() => {
              inputRef.current?.focus();
            }}
            type="button"
          >
            <Link aria-hidden="true" size={18} />
            {t("sazo.agent.pasteUrl")}
          </button>
          <button
            onClick={() => {
              fileRef.current?.click();
            }}
            type="button"
          >
            <ImagePlus aria-hidden="true" size={18} />
            {t("sazo.agent.addImage")}
          </button>
          <button
            onClick={() => {
              inputRef.current?.focus();
            }}
            type="button"
          >
            <Search aria-hidden="true" size={18} />
            {t("sazo.agent.productName")}
          </button>
        </div>

        <form className="sazo-agent-form" onSubmit={submit}>
          <label className="sazo-visually-hidden" htmlFor="sazo-agent-draft">
            {t("sazo.agent.draftLabel")}
          </label>
          <textarea
            id="sazo-agent-draft"
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder={t("sazo.agent.placeholder")}
            ref={inputRef}
            rows={4}
            value={draft}
          />
          <input
            accept="image/*"
            aria-hidden="true"
            className="sazo-agent-file-input"
            hidden
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? null);
            }}
            ref={fileRef}
            tabIndex={-1}
            type="file"
          />
          {fileName !== null ? <p className="sazo-agent-file-name">{fileName}</p> : null}
          <button className="sazo-agent-submit" disabled={!canSubmit} type="submit">
            <Sparkles aria-hidden="true" size={19} />
            {t("sazo.agent.submit")}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
