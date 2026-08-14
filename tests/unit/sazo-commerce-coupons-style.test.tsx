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

    const header = container.querySelector<HTMLElement>(".sazo-coupon-center-header");
    const tabs = container.querySelector<HTMLElement>(".sazo-coupon-tabs");
    const actions = container.querySelector<HTMLElement>(".sazo-coupon-actions");
    const list = container.querySelector<HTMLElement>(".sazo-coupon-ticket-list");
    const card = container.querySelector<HTMLElement>(".sazo-coupon-ticket");

    expect(screen.getByRole("heading", { level: 1, name: "クーポン" })).toBeTruthy();
    if (
      header === null ||
      tabs === null ||
      actions === null ||
      list === null ||
      card === null
    ) {
      throw new Error("Missing CouponsView layout element");
    }

    expect(getComputedStyle(header).display).toBe("grid");
    expect(getComputedStyle(tabs).display).toBe("flex");
    expect(getComputedStyle(actions).display).toBe("grid");
    expect(getComputedStyle(list).display).toBe("grid");
    expect(getComputedStyle(card).display).toBe("grid");
  });
});
