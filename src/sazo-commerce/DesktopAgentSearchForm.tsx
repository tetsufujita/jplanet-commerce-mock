import { ArrowRight, Camera } from "lucide-react";
import { useState, type Dispatch, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { SazoAction } from "@/sazo-commerce/model";

interface DesktopAgentSearchFormProps {
  className?: string;
  dispatch: Dispatch<SazoAction>;
}

/** Desktop-only entry point to the existing agent-search → product-detail flow. */
export function DesktopAgentSearchForm({
  className,
  dispatch,
}: DesktopAgentSearchFormProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const summary = draft.trim();

    if (summary.length === 0) {
      dispatch({ type: "open-agent-hub", intent: "compose" });
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
      onSubmit={submit}
      role="search"
    >
      <input
        aria-label={t("sazo.desktopHome.searchInputLabel")}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        placeholder={t("sazo.desktopHome.searchPlaceholder")}
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
        <ArrowRight aria-hidden size={21} strokeWidth={2.4} />
      </button>
    </form>
  );
}
