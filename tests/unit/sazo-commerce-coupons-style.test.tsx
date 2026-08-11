// @vitest-environment jsdom

import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n } from "@/i18n/createI18n";
import { CouponsView } from "@/sazo-commerce/AccountViews";
import type { SazoAction } from "@/sazo-commerce/model";

const couponStyles = readFileSync(
  resolve(process.cwd(), "src/sazo-commerce/coupons.css"),
  "utf8",
);

afterEach(() => {
  cleanup();
  document.head.querySelector("[data-coupon-test-styles]")?.remove();
});

const noDispatch = (_action: SazoAction) => undefined;

describe("CouponsView presentation", () => {
  it("loads the scoped layout needed to make coupon content usable", async () => {
    const i18n = await createI18n("ja");
    const style = document.createElement("style");
    style.dataset.couponTestStyles = "true";
    style.textContent = couponStyles;
    document.head.append(style);
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <div className="sazo-root" data-view="coupons">
          <CouponsView dispatch={noDispatch} />
        </div>
      </I18nextProvider>,
    );

    const header = container.querySelector<HTMLElement>(".sazo-account-header");
    const content = container.querySelector<HTMLElement>(".sazo-account-screen-content");
    const registerFields = container.querySelector<HTMLElement>(
      ".sazo-coupon-register > div",
    );
    const count = container.querySelector<HTMLElement>(".sazo-coupon-count");
    const card = container.querySelector<HTMLElement>(".sazo-coupon-card");

    expect(screen.getByRole("heading", { level: 1, name: "クーポン" })).toBeTruthy();
    if (
      header === null ||
      content === null ||
      registerFields === null ||
      count === null ||
      card === null
    ) {
      throw new Error("Missing CouponsView layout element");
    }

    expect(getComputedStyle(header).display).toBe("grid");
    expect(getComputedStyle(content).marginLeft).toBe("auto");
    expect(getComputedStyle(registerFields).display).toBe("grid");
    expect(getComputedStyle(count).display).toBe("flex");
    expect(getComputedStyle(card).display).toBe("grid");
  });
});
