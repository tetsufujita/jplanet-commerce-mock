// @vitest-environment jsdom

import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    const cardBody = container.querySelector<HTMLElement>(".sazo-coupon-ticket-body");
    const cardFooter = container.querySelector<HTMLElement>(".sazo-coupon-ticket-footer");

    expect(screen.getByRole("heading", { level: 1, name: "クーポン" })).toBeTruthy();
    if (
      header === null ||
      tabs === null ||
      actions === null ||
      list === null ||
      card === null ||
      cardBody === null ||
      cardFooter === null
    ) {
      throw new Error("Missing CouponsView layout element");
    }

    expect(getComputedStyle(header).display).toBe("grid");
    expect(getComputedStyle(tabs).display).toBe("flex");
    expect(getComputedStyle(actions).display).toBe("grid");
    expect(getComputedStyle(list).display).toBe("grid");
    expect(getComputedStyle(cardBody).display).toBe("grid");
    expect(getComputedStyle(cardFooter).display).toBe("grid");
    expect(card.querySelector(".sazo-coupon-ticket-actions")).toBeNull();
    expect(couponStyles).not.toContain("border-left: 1px dashed");
    expect(couponStyles).toContain(".sazo-coupon-ticket::before");
    expect(couponStyles).toContain("border-top: 1px dashed #dce3ec");
  });

  it("keeps ticket actions distinct and derives urgency and quantity from the coupon fixtures", async () => {
    const i18n = await createI18n("ja");
    render(
      <I18nextProvider i18n={i18n}>
        <CouponsView dispatch={noDispatch} />
      </I18nextProvider>,
    );

    expect(screen.getAllByTestId("jplanet-coupon-ticket")).toHaveLength(4);
    expect(screen.getByText("残り3枚")).toBeTruthy();
    expect(screen.getByText("残り1時間")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "利用条件" })[0]!);
    expect(screen.getByRole("dialog", { name: "国際送料 R$30 OFFの利用条件" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    fireEvent.click(screen.getByRole("button", { name: "コードを入力" }));
    expect(screen.getByRole("form", { name: "クーポンコードを入力" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    fireEvent.click(screen.getByRole("button", { name: "クーポンを探す" }));
    expect(screen.getByRole("heading", { level: 1, name: "クーポンを探す" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    fireEvent.click(screen.getByRole("button", { name: "利用履歴" }));
    expect(screen.getByRole("heading", { level: 1, name: "利用履歴" })).toBeTruthy();
  });
});
