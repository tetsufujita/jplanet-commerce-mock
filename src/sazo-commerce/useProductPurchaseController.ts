import type { Dispatch } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { calculateProductTotal, formatYen } from "@/sazo-commerce/fixtures";
import type { ProductDetail } from "@/sazo-commerce/fixtures";
import type { SazoAction } from "@/sazo-commerce/model";

export type PurchaseIntent = "cart" | "buy";

export interface PurchaseFeedback {
  kind: "error" | "success";
  message: string;
}

export interface ProductPurchaseController {
  feedback: PurchaseFeedback | null;
  formattedTotal: string;
  imageCheck: boolean;
  productAmount: number;
  quantity: number;
  requestGuideOpen: boolean;
  requestText: string;
  selectedOption: string;
  setImageCheck: (checked: boolean) => void;
  setRequestText: (value: string) => void;
  selectOption: (value: string) => void;
  decrementQuantity: () => void;
  incrementQuantity: () => void;
  removeSelection: () => void;
  toggleRequestGuide: () => void;
  purchase: (intent: PurchaseIntent, focusInvalid: () => void) => void;
}

export interface UseProductPurchaseControllerOptions {
  detail: ProductDetail;
  dispatch: Dispatch<SazoAction>;
}

export function useProductPurchaseController({
  detail,
  dispatch,
}: UseProductPurchaseControllerOptions): ProductPurchaseController {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [requestText, setRequestTextState] = useState("");
  const [imageCheck, setImageCheckState] = useState(false);
  const [feedback, setFeedback] = useState<PurchaseFeedback | null>(null);
  const [requestGuideOpen, setRequestGuideOpen] = useState(false);
  const totalAmount =
    selectedOption === ""
      ? 0
      : calculateProductTotal(
          detail.unitPriceAmount,
          quantity,
          detail.localDistributionFeeAmount,
        );
  const productAmount = detail.unitPriceAmount * quantity;
  const formattedTotal = totalAmount === 0 ? String(totalAmount) : formatYen(totalAmount);

  const selectOption = (value: string) => {
    setSelectedOption(value);
    setFeedback(null);
    if (value === "") {
      setQuantity(1);
    }
  };

  const decrementQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
    setFeedback(null);
  };

  const incrementQuantity = () => {
    setQuantity((current) => current + 1);
    setFeedback(null);
  };

  const removeSelection = () => {
    setSelectedOption("");
    setQuantity(1);
    setFeedback(null);
  };

  const purchase = (intent: PurchaseIntent, focusInvalid: () => void) => {
    if (selectedOption === "") {
      setFeedback({
        kind: "error",
        message: t("sazo.views.productDetail.feedback.optionRequired"),
      });
      focusInvalid();
      return;
    }

    if (intent === "cart") {
      setFeedback({
        kind: "success",
        message: t("sazo.views.productDetail.feedback.cartAdded"),
      });
      return;
    }

    setFeedback({
      kind: "success",
      message: t("sazo.views.productDetail.feedback.proceeding"),
    });
    dispatch({ type: "open-login" });
  };

  return {
    decrementQuantity,
    feedback,
    formattedTotal,
    imageCheck,
    incrementQuantity,
    productAmount,
    purchase,
    quantity,
    removeSelection,
    requestGuideOpen,
    requestText,
    selectedOption,
    selectOption,
    setImageCheck: setImageCheckState,
    setRequestText: setRequestTextState,
    toggleRequestGuide: () => {
      setRequestGuideOpen((current) => !current);
    },
  };
}
