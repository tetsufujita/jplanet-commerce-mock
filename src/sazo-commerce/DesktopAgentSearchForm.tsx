import { ArrowRight, Camera, Search } from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useTranslation } from "react-i18next";
import type { SazoAction } from "@/sazo-commerce/model";

interface DesktopAgentSearchDraftContextValue {
  draft: string;
  setDraft: (draft: string) => void;
}

const DesktopAgentSearchDraftContext = createContext<DesktopAgentSearchDraftContextValue | null>(null);

interface DesktopAgentSearchDraftProviderProps extends DesktopAgentSearchDraftContextValue {
  children: ReactNode;
}

/** Shares the visible AI-search draft between the home Lens and sticky header. */
export function DesktopAgentSearchDraftProvider({
  children,
  draft,
  setDraft,
}: DesktopAgentSearchDraftProviderProps) {
  const value = useMemo(() => ({ draft, setDraft }), [draft, setDraft]);

  return (
    <DesktopAgentSearchDraftContext.Provider value={value}>
      {children}
    </DesktopAgentSearchDraftContext.Provider>
  );
}

interface DesktopAgentSearchFormProps {
  className?: string;
  dispatch: Dispatch<SazoAction>;
  historyControls?: string;
  historyExpanded?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  liquidGlass?: boolean;
  mode?: "url" | "image" | "product";
  onInputActivate?: () => void;
  onDraftChange?: (draft: string) => void;
  onEscape?: () => void;
  submitIcon?: "arrow" | "search";
  testId?: string;
}

/** Desktop-only entry point to the existing agent-search → product-detail flow. */
export function DesktopAgentSearchForm({
  className,
  dispatch,
  historyControls,
  historyExpanded,
  inputRef,
  liquidGlass = false,
  mode = "url",
  onInputActivate,
  onDraftChange,
  onEscape,
  submitIcon = "arrow",
  testId,
}: DesktopAgentSearchFormProps) {
  const { t } = useTranslation();
  const sharedDraft = useContext(DesktopAgentSearchDraftContext);
  const [localDraft, setLocalDraft] = useState("");
  const draft = sharedDraft?.draft ?? localDraft;
  const setDraft = sharedDraft?.setDraft ?? setLocalDraft;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const summary = draft.trim();

    if (summary.length === 0) {
      dispatch({ type: "open-agent-hub", intent: mode === "image" ? "camera" : "compose" });
      return;
    }

    dispatch({
      type: "start-agent-search",
      request: { imageName: null, summary },
    });
  };

  return (
    <form
      aria-label={t("sazo.desktopHome.searchFormLabel")}
      className={className}
      data-agent-input-mode={mode}
      data-agent-lens-liquid-glass={liquidGlass ? "input" : undefined}
      data-testid={testId}
      onSubmit={submit}
      role="search"
    >
      <input
        aria-controls={historyControls}
        aria-expanded={historyControls ? historyExpanded : undefined}
        aria-label={t("sazo.desktopHome.searchInputLabel")}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          onDraftChange?.(nextDraft);
        }}
        onClick={onInputActivate}
        onFocus={onInputActivate}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onEscape?.();
          }
        }}
        placeholder={t("sazo.desktopHome.searchPlaceholder")}
        ref={inputRef}
        type="text"
        value={draft}
      />
      <button
        aria-label={t("sazo.agentHub.composer.takePhoto")}
        className="sazo-desktop-agent-search-camera"
        onClick={() => {
          dispatch({ type: "open-agent-hub", intent: "camera" });
        }}
        type="button"
      >
        <Camera aria-hidden size={20} strokeWidth={2.1} />
      </button>
      <button
        aria-label={t("sazo.desktopHome.searchSubmit")}
        className="sazo-desktop-agent-search-submit"
        type="submit"
      >
        {submitIcon === "search" ? (
          <Search aria-hidden size={20} strokeWidth={2.2} />
        ) : (
          <ArrowRight aria-hidden size={21} strokeWidth={2.4} />
        )}
      </button>
    </form>
  );
}
