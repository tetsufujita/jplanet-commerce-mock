import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { ImagePlus, Link, Search, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AgentEntryIntent } from "@/sazo-commerce/model";

export type AgentComposerMode = "url" | "image" | "product-name";

export interface MobileAgentComposerProps {
  entryIntent: AgentEntryIntent | null;
  onEntryIntentConsumed: () => void;
  seedProductName: string | null;
}

interface ComposerImage {
  file: File;
  url: string;
}

export const MobileAgentComposer = forwardRef<HTMLDivElement, MobileAgentComposerProps>(
  function MobileAgentComposer(
    { entryIntent, onEntryIntentConsumed, seedProductName },
    forwardedRef,
  ) {
    const { t } = useTranslation();
    const [mode, setMode] = useState<AgentComposerMode>(
      entryIntent === "image-picker" ? "image" : "product-name",
    );
    const [draft, setDraft] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageUrlRef = useRef<string | null>(null);
    const consumedIntentRef = useRef<AgentEntryIntent | null>(null);
    const shouldOpenImagePickerRef = useRef(false);
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
      if (entryIntent === "image-picker") {
        setMode("image");
        shouldOpenImagePickerRef.current = true;
      }
      onEntryIntentConsumed();
    }, [entryIntent, onEntryIntentConsumed]);

    useEffect(() => {
      if (mode !== "image" || !shouldOpenImagePickerRef.current) {
        return;
      }

      shouldOpenImagePickerRef.current = false;
      fileInputRef.current?.click();
    }, [mode]);

    useEffect(() => {
      if (seedProductName === null) {
        return;
      }

      setMode("product-name");
      setDraft(seedProductName);
    }, [seedProductName]);

    useEffect(() => {
      return () => {
        replaceImage(null);
      };
    }, [replaceImage]);

    const chooseMode = (nextMode: AgentComposerMode) => {
      setMode(nextMode);
      setError(null);
      setSubmitted(false);
    };

    const openImagePicker = () => {
      fileInputRef.current?.click();
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
    };

    const imageInputId = "sazo-mobile-agent-image";
    const textInputId = "sazo-mobile-agent-draft";
    const isImageMode = mode === "image";

    return (
      <div className="sazo-mobile-agent-composer" ref={forwardedRef}>
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
            <h1>{t("sazo.agentHub.composer.title")}</h1>
            <p>{t("sazo.agentHub.composer.intro")}</p>
          </div>
        </header>

        <ol className="sazo-mobile-agent-composer-steps">
          <li>{t("sazo.agentHub.composer.stepUrl")}</li>
          <li>{t("sazo.agentHub.composer.stepName")}</li>
        </ol>

        <div
          aria-label={t("sazo.agentHub.composer.modesLabel")}
          className="sazo-mobile-agent-composer-modes"
          role="group"
        >
          <button
            aria-pressed={mode === "url"}
            onClick={() => {
              chooseMode("url");
            }}
            type="button"
          >
            <Link aria-hidden="true" size={18} />
            {t("sazo.agentHub.composer.urlMode")}
          </button>
          <button
            aria-pressed={isImageMode}
            onClick={() => {
              chooseMode("image");
            }}
            type="button"
          >
            <ImagePlus aria-hidden="true" size={18} />
            {t("sazo.agentHub.composer.imageMode")}
          </button>
          <button
            aria-pressed={mode === "product-name"}
            onClick={() => {
              chooseMode("product-name");
            }}
            type="button"
          >
            <Search aria-hidden="true" size={18} />
            {t("sazo.agentHub.composer.productMode")}
          </button>
        </div>

        <form className="sazo-mobile-agent-composer-form" onSubmit={submit}>
          {isImageMode ? (
            <div className="sazo-mobile-agent-composer-image">
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
                {t("sazo.agentHub.composer.selectImage")}
              </label>
              {imageUrl === null || imageFile === null ? (
                <button onClick={openImagePicker} type="button">
                  {t("sazo.agentHub.composer.selectImage")}
                </button>
              ) : (
                <>
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
                      setError(null);
                      setSubmitted(false);
                    }}
                    type="button"
                  >
                    {t("sazo.agentHub.composer.removeImage")}
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <label className="sazo-visually-hidden" htmlFor={textInputId}>
                {t("sazo.agentHub.composer.draftLabel")}
              </label>
              <textarea
                id={textInputId}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setSubmitted(false);
                }}
                placeholder={t(
                  mode === "url"
                    ? "sazo.agentHub.composer.urlPlaceholder"
                    : "sazo.agentHub.composer.productPlaceholder",
                )}
                rows={4}
                value={draft}
              />
            </>
          )}

          {error === null ? null : <p role="status">{error}</p>}
          {submitted ? (
            <p role="status">{t("sazo.agentHub.composer.submitted")}</p>
          ) : null}
          <button disabled={!canSubmit} type="submit">
            <Sparkles aria-hidden="true" size={19} />
            {t("sazo.agentHub.composer.submit")}
          </button>
        </form>
      </div>
    );
  },
);
