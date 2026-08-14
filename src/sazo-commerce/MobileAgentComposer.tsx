import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { ArrowRight, Camera, ImagePlus, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AgentEntryIntent } from "@/sazo-commerce/model";

export type AgentComposerMode = "text" | "image";

export interface AgentComposerSeedRequest {
  revision: number;
  value: string;
}

export interface AgentComposerSubmission {
  imageName: string | null;
  summary: string;
}

export interface MobileAgentComposerProps {
  entryIntent: AgentEntryIntent | null;
  onEntryIntentConsumed: () => void;
  onSubmitted?: (submission: AgentComposerSubmission) => void;
  presentation?: "default" | "agent-hub";
  seedRequest: AgentComposerSeedRequest | null;
}

interface ComposerImage {
  file: File;
  url: string;
}

export const MobileAgentComposer = forwardRef<HTMLDivElement, MobileAgentComposerProps>(
  function MobileAgentComposer(
    {
      entryIntent,
      onEntryIntentConsumed,
      onSubmitted,
      presentation = "default",
      seedRequest,
    },
    forwardedRef,
  ) {
    const { t } = useTranslation();
    const [mode, setMode] = useState<AgentComposerMode>("text");
    const [menuOpen, setMenuOpen] = useState(false);
    const [draft, setDraft] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);
    const imageUrlRef = useRef<string | null>(null);
    const consumedIntentRef = useRef<AgentEntryIntent | null>(null);
    const pendingImageInputRef = useRef<"camera" | "gallery" | null>(null);
    const canSubmit = draft.trim().length > 0 || imageFile !== null;

    const replaceImage = useCallback((nextImage: ComposerImage | null) => {
      const currentUrl = imageUrlRef.current;

      if (currentUrl !== null && currentUrl !== nextImage?.url) {
        URL.revokeObjectURL(currentUrl);
      }

      imageUrlRef.current = nextImage?.url ?? null;
      setImageFile(nextImage?.file ?? null);
      setImageUrl(nextImage?.url ?? null);
    }, []);

    useEffect(() => {
      if (entryIntent === null) {
        consumedIntentRef.current = null;

        return;
      }

      if (consumedIntentRef.current === entryIntent) {
        return;
      }

      consumedIntentRef.current = entryIntent;
      if (entryIntent === "image-picker" || entryIntent === "camera") {
        setMode("image");
        pendingImageInputRef.current = entryIntent === "camera" ? "camera" : "gallery";
      }
      onEntryIntentConsumed();
    }, [entryIntent, onEntryIntentConsumed]);

    useEffect(() => {
      if (mode !== "image" || pendingImageInputRef.current === null) {
        return;
      }

      const input =
        pendingImageInputRef.current === "camera" ? cameraInputRef : fileInputRef;

      pendingImageInputRef.current = null;
      input.current?.click();
    }, [mode]);

    useEffect(() => {
      if (seedRequest === null) {
        return;
      }

      setMode("text");
      setDraft(seedRequest.value);
    }, [seedRequest]);

    useEffect(() => {
      return () => {
        replaceImage(null);
      };
    }, [replaceImage]);

    const openImagePicker = () => {
      fileInputRef.current?.click();
    };

    const openCamera = () => {
      cameraInputRef.current?.click();
    };

    const changeImage = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file === undefined) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError(t("sazo.agentHub.composer.invalidImage"));
        event.target.value = "";

        return;
      }

      setMode("image");
      replaceImage({ file, url: URL.createObjectURL(file) });
      setError(null);
      setSubmitted(false);
      event.target.value = "";
    };

    const submit = (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) {
        return;
      }

      setSubmitted(true);
      onSubmitted?.({
        imageName: imageFile?.name ?? null,
        summary: draft.trim() || imageFile?.name || "画像の商品",
      });
    };

    const imageInputId = "sazo-mobile-agent-image";
    const cameraInputId = "sazo-mobile-agent-camera";
    const textInputId = "sazo-mobile-agent-draft";

    return (
      <div
        className="sazo-mobile-agent-composer"
        data-presentation={presentation}
        ref={forwardedRef}
      >
        <header className="sazo-mobile-agent-composer-header">
          <img
            alt=""
            aria-hidden="true"
            data-jplanet-sakura-mark
            height={42}
            src="/sazo-commerce/jplanet-sakura-mark.png"
            width={42}
          />
          <div>
            <h1>
              {presentation === "agent-hub"
                ? t("sazo.agentHub.composer.purchaseTitle")
                : t("sazo.agentHub.composer.title")}
            </h1>
            {presentation === "agent-hub" ? null : <p>{t("sazo.agentHub.composer.purchaseIntro")}</p>}
          </div>
        </header>

        <form className="sazo-mobile-agent-composer-form" onSubmit={submit}>
          <input
            accept="image/*"
            aria-hidden="true"
            hidden
            id={imageInputId}
            onChange={changeImage}
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
          />
          <label className="sazo-visually-hidden" htmlFor={imageInputId}>
            {t("sazo.agentHub.composer.selectPhoto")}
          </label>
          <input
            accept="image/*"
            aria-hidden="true"
            capture="environment"
            hidden
            id={cameraInputId}
            onChange={changeImage}
            ref={cameraInputRef}
            tabIndex={-1}
            type="file"
          />
          <label className="sazo-visually-hidden" htmlFor={cameraInputId}>
            {t("sazo.agentHub.composer.takePhoto")}
          </label>

          <div className="sazo-mobile-agent-composer-input-shell">
            {presentation === "agent-hub" ? null : (
              <button
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={t("sazo.agentHub.composer.menuLabel")}
                className="sazo-mobile-agent-composer-plus"
                onClick={() => {
                  setMenuOpen((open) => !open);
                }}
                type="button"
              >
                <Plus aria-hidden="true" size={21} />
              </button>
            )}
            <label className="sazo-visually-hidden" htmlFor={textInputId}>
              {t("sazo.agentHub.composer.draftLabel")}
            </label>
            <textarea
              id={textInputId}
              onChange={(event) => {
                setDraft(event.target.value);
                setSubmitted(false);
              }}
              placeholder={
                presentation === "agent-hub"
                  ? t("sazo.agentHub.composer.agentHubPlaceholder")
                  : t("sazo.agentHub.composer.inputPlaceholder")
              }
              ref={textInputRef}
              rows={1}
              value={draft}
            />
            {presentation === "agent-hub" ? (
              <button
                aria-label={t("sazo.agentHub.composer.takePhoto")}
                className="sazo-mobile-agent-composer-camera"
                onClick={openCamera}
                type="button"
              >
                <Camera aria-hidden="true" size={20} strokeWidth={2.1} />
              </button>
            ) : null}
            <button
              aria-label={t("sazo.agentHub.composer.send")}
              className="sazo-mobile-agent-composer-submit"
              disabled={!canSubmit}
              type="submit"
            >
              <ArrowRight
                aria-hidden="true"
                className="sazo-mobile-agent-composer-ai-mark"
                data-testid="composer-ai-mark"
                size={18}
                strokeWidth={2.8}
              />
              <span>{t("sazo.agentHub.composer.send")}</span>
            </button>
          </div>

          {menuOpen ? (
            <div
              aria-label={t("sazo.agentHub.composer.menuLabel")}
              className="sazo-mobile-agent-composer-menu"
              role="menu"
            >
              <button
                onClick={() => {
                  setMode("image");
                  setMenuOpen(false);
                  openCamera();
                }}
                role="menuitem"
                type="button"
              >
                <Camera aria-hidden="true" size={18} />
                {t("sazo.agentHub.composer.takePhoto")}
              </button>
              <button
                onClick={() => {
                  setMode("image");
                  setMenuOpen(false);
                  openImagePicker();
                }}
                role="menuitem"
                type="button"
              >
                <ImagePlus aria-hidden="true" size={18} />
                {t("sazo.agentHub.composer.selectPhoto")}
              </button>
            </div>
          ) : null}

          {imageUrl !== null && imageFile !== null ? (
            <div className="sazo-mobile-agent-composer-image">
              <img
                alt={t("sazo.agentHub.composer.selectedImageAlt", {
                  name: imageFile.name,
                })}
                src={imageUrl}
              />
              <p>{imageFile.name}</p>
              <button onClick={openImagePicker} type="button">
                {t("sazo.agentHub.composer.replaceImage")}
              </button>
              <button
                onClick={() => {
                  replaceImage(null);
                  setMode("text");
                  setError(null);
                  setSubmitted(false);
                }}
                type="button"
              >
                <X aria-hidden="true" size={17} />
                {t("sazo.agentHub.composer.removeImage")}
              </button>
            </div>
          ) : null}

          {error === null ? null : <p role="status">{error}</p>}
          {submitted ? (
            <p role="status">{t("sazo.agentHub.composer.submitted")}</p>
          ) : null}
        </form>
      </div>
    );
  },
);
