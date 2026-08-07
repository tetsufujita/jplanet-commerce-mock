import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SyntheticEvent,
} from "react";
import { Apple, Mail, Ticket, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { sazoCountryOptions } from "@/sazo-commerce/fixtures";
import type { SazoAction, SazoAuthStep } from "@/sazo-commerce/model";

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export interface AuthFlowProps {
  authStep: SazoAuthStep;
  dispatch: Dispatch<SazoAction>;
}

interface ProviderButtonProps {
  icon: "apple" | "google" | "mail";
  label: string;
  onPress: () => void;
}

function ProviderButton({ icon, label, onPress }: ProviderButtonProps) {
  return (
    <button className="sazo-auth-provider" onClick={onPress} type="button">
      <span aria-hidden className="sazo-auth-provider-icon">
        {icon === "apple" ? <Apple size={22} strokeWidth={2.2} /> : null}
        {icon === "google" ? "G" : null}
        {icon === "mail" ? <Mail size={22} strokeWidth={2.2} /> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function AuthFlow({ authStep, dispatch }: AuthFlowProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [birthday, setBirthday] = useState("");
  const [country, setCountry] = useState("JP");
  const [phone, setPhone] = useState("");
  const [optOut, setOptOut] = useState(false);
  const close = useCallback(() => {
    dispatch({ type: "close-overlay" });
  }, [dispatch]);
  const continueToBirthday = useCallback(() => {
    dispatch({ type: "advance-auth", step: "birthday" });
  }, [dispatch]);

  useEffect(() => {
    const previousActive =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.querySelector<HTMLElement>(".sazo-root");
    const previousAriaHidden = background?.getAttribute("aria-hidden") ?? null;
    const backgroundWasInert = background?.hasAttribute("inert") ?? false;
    const previousOverflow = document.body.style.overflow;

    background?.setAttribute("aria-hidden", "true");
    background?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    dialogRef.current
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
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
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

  const handleBirthdaySubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    dispatch({ type: "advance-auth", step: "phone" });
  };
  const handlePhoneSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    dispatch({ type: "navigate", view: "mypage" });
  };

  return (
    <div
      className="sazo-auth-backdrop"
      data-testid="sazo-auth-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          close();
        }
      }}
      role="presentation"
    >
      <div
        aria-labelledby="sazo-auth-title"
        aria-modal="true"
        className="sazo-auth-dialog"
        data-auth-step={authStep}
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label={t("sazo.auth.close")}
          className="sazo-overlay-close"
          onClick={close}
          type="button"
        >
          <X aria-hidden size={26} strokeWidth={1.8} />
        </button>

        {authStep === "provider" ? (
          <div className="sazo-auth-content sazo-auth-provider-content">
            <h1 id="sazo-auth-title">{t("sazo.auth.provider.title")}</h1>
            <p>{t("sazo.auth.provider.intro")}</p>

            <div className="sazo-auth-coupon-callout">
              <Ticket aria-hidden size={22} strokeWidth={2} />
              <span>{t("sazo.auth.provider.couponCallout")}</span>
            </div>
            <button
              className="sazo-auth-coupon-button"
              onClick={continueToBirthday}
              type="button"
            >
              {t("sazo.auth.provider.couponCta")}
            </button>
            <p className="sazo-auth-reward-divider">
              <span>{t("sazo.auth.provider.webReward")}</span>
            </p>

            <div className="sazo-auth-providers">
              <ProviderButton
                icon="google"
                label={t("sazo.auth.provider.google")}
                onPress={continueToBirthday}
              />
              <ProviderButton
                icon="apple"
                label={t("sazo.auth.provider.apple")}
                onPress={continueToBirthday}
              />
              <ProviderButton
                icon="mail"
                label={t("sazo.auth.provider.email")}
                onPress={continueToBirthday}
              />
            </div>
          </div>
        ) : null}

        {authStep === "birthday" ? (
          <form
            className="sazo-auth-content sazo-auth-form"
            onSubmit={handleBirthdaySubmit}
          >
            <h1 id="sazo-auth-title">{t("sazo.auth.birthday.title")}</h1>
            <p className="sazo-auth-progress">{t("sazo.auth.birthday.progress")}</p>
            <label htmlFor="sazo-auth-birthday">{t("sazo.auth.birthday.label")}</label>
            <input
              autoComplete="bday"
              id="sazo-auth-birthday"
              inputMode="numeric"
              onChange={(event) => {
                setBirthday(event.target.value);
              }}
              placeholder={t("sazo.auth.birthday.placeholder")}
              type="text"
              value={birthday}
            />
            <small>{t("sazo.auth.birthday.help")}</small>
            <button className="sazo-auth-next" type="submit">
              {t("sazo.auth.next")}
            </button>
          </form>
        ) : null}

        {authStep === "phone" ? (
          <form className="sazo-auth-content sazo-auth-form" onSubmit={handlePhoneSubmit}>
            <h1 id="sazo-auth-title">{t("sazo.auth.phone.title")}</h1>
            <p className="sazo-auth-progress">{t("sazo.auth.phone.progress")}</p>
            <p className="sazo-auth-explanation">{t("sazo.auth.phone.explanation")}</p>

            <label htmlFor="sazo-auth-country">{t("sazo.auth.phone.countryLabel")}</label>
            <div className="sazo-auth-phone-row">
              <select
                id="sazo-auth-country"
                onChange={(event) => {
                  setCountry(event.target.value);
                }}
                value={country}
              >
                {sazoCountryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} +{option.dialingCode}
                  </option>
                ))}
              </select>
              <label className="sazo-visually-hidden" htmlFor="sazo-auth-phone">
                {t("sazo.auth.phone.numberLabel")}
              </label>
              <input
                autoComplete="tel-national"
                id="sazo-auth-phone"
                inputMode="numeric"
                onChange={(event) => {
                  setPhone(event.target.value);
                }}
                placeholder={t("sazo.auth.phone.placeholder")}
                type="tel"
                value={phone}
              />
            </div>

            <label htmlFor="sazo-auth-birthday-confirm">
              {t("sazo.auth.birthday.label")}
            </label>
            <input
              id="sazo-auth-birthday-confirm"
              onChange={(event) => {
                setBirthday(event.target.value);
              }}
              placeholder={t("sazo.auth.birthday.placeholder")}
              type="text"
              value={birthday}
            />
            <small>{t("sazo.auth.birthday.help")}</small>
            <p className="sazo-auth-consent-copy">{t("sazo.auth.phone.consent")}</p>
            <label className="sazo-auth-opt-out" htmlFor="sazo-auth-opt-out">
              <input
                checked={optOut}
                id="sazo-auth-opt-out"
                onChange={(event) => {
                  setOptOut(event.target.checked);
                }}
                type="checkbox"
              />
              <span>{t("sazo.auth.phone.optOut")}</span>
            </label>
            <button className="sazo-auth-next" type="submit">
              {t("sazo.auth.next")}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
