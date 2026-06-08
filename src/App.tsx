import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { defaultLocale, isLocale } from "@/i18n/createI18n";
import { HomePage } from "@/pages/HomePage";

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
      <Route path="/:locale" element={<LocalizedHomeRoute />} />
      <Route path="*" element={<Navigate to={`/${defaultLocale}`} replace />} />
    </Routes>
  );
}
