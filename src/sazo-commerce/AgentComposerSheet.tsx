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
import type { SazoAction } from "@/sazo-commerce/model";

export interface AgentComposerSheetProps {
  dispatch: Dispatch<SazoAction>;
}

export function AgentComposerSheet({ dispatch }: AgentComposerSheetProps) {
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
    document.body.style.overflow = "hidden";
    inputRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
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
        transition={transition}
      >
        <div className="sazo-agent-handle" aria-hidden="true" />
        <header className="sazo-agent-header">
          <div>
            <span className="sazo-agent-icon" aria-hidden="true">
              <Sparkles size={20} strokeWidth={2} />
            </span>
            <div>
              <p>J-Planet AI</p>
              <h1 id="sazo-agent-title">J-Planet AIエージェント</h1>
            </div>
          </div>
          <button
            aria-label="閉じる"
            className="sazo-agent-close"
            onClick={close}
            type="button"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </header>

        <p className="sazo-agent-intro">
          欲しい商品のURL・画像・名前を送ると、ぴったりのアイテムを探します。
        </p>

        <div className="sazo-agent-chips" aria-label="入力方法">
          <button
            onClick={() => {
              inputRef.current?.focus();
            }}
            type="button"
          >
            <Link aria-hidden="true" size={18} />
            URLを貼る
          </button>
          <button
            onClick={() => {
              fileRef.current?.click();
            }}
            type="button"
          >
            <ImagePlus aria-hidden="true" size={18} />
            画像を追加
          </button>
          <button
            onClick={() => {
              inputRef.current?.focus();
            }}
            type="button"
          >
            <Search aria-hidden="true" size={18} />
            商品名で相談
          </button>
        </div>

        <form className="sazo-agent-form" onSubmit={submit}>
          <label className="sazo-visually-hidden" htmlFor="sazo-agent-draft">
            探したい商品
          </label>
          <textarea
            id="sazo-agent-draft"
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder="商品URLを貼る、または欲しいものを入力"
            ref={inputRef}
            rows={4}
            value={draft}
          />
          <input
            accept="image/*"
            aria-label="画像を追加"
            className="sazo-agent-file-input"
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? null);
            }}
            ref={fileRef}
            type="file"
          />
          {fileName !== null ? <p className="sazo-agent-file-name">{fileName}</p> : null}
          <button className="sazo-agent-submit" disabled={!canSubmit} type="submit">
            <Sparkles aria-hidden="true" size={19} />
            AIに探してもらう
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
