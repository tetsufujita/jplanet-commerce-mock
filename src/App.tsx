import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { defaultLocale, isLocale } from "@/i18n/createI18n";
import { HomePage } from "@/pages/HomePage";

const ShopifyJpPage = lazy(() =>
  import("@/shopify-jp/ShopifyJpPage").then((m) => ({ default: m.ShopifyJpPage })),
);

const StripeJpPage = lazy(() =>
  import("@/stripe-jp/StripeJpPage").then((m) => ({ default: m.StripeJpPage })),
);

const AndesStatsPreview = lazy(() =>
  import("@/preview-stats/AndesStatsPreview").then((m) => ({
    default: m.AndesStatsPreview,
  })),
);

const SazoCommercePage = lazy(() =>
  import("@/sazo-commerce/SazoCommercePage").then((module) => ({
    default: module.SazoCommercePage,
  })),
);

function LocalizedHomeRoute() {
  const { locale } = useParams();
  const { i18n } = useTranslation();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;

  useEffect(() => {
    document.documentElement.lang = activeLocale;

    if (i18n.language !== activeLocale) {
      void i18n.changeLanguage(activeLocale);
    }
  }, [activeLocale, i18n]);

  if (!isLocale(locale)) {
    return <Navigate to={`/${defaultLocale}`} replace />;
  }

  return <HomePage />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLocale}`} replace />} />
      <Route
        path="/shopify-jp"
        element={
          <Suspense fallback={null}>
            <ShopifyJpPage />
          </Suspense>
        }
      />
      <Route
        path="/stripe-jp"
        element={
          <Suspense fallback={null}>
            <StripeJpPage />
          </Suspense>
        }
      />
      <Route
        path="/preview/stats"
        element={
          <Suspense fallback={null}>
            <AndesStatsPreview />
          </Suspense>
        }
      />
      <Route
        path="/sazo-commerce-mock/*"
        element={
          <Suspense fallback={null}>
            <SazoCommercePage />
          </Suspense>
        }
      />
      <Route path="/:locale" element={<LocalizedHomeRoute />} />
      <Route path="*" element={<Navigate to={`/${defaultLocale}`} replace />} />
    </Routes>
  );
}
