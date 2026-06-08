import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { createI18n, getLocaleFromPath } from "@/i18n/createI18n";
import "@/styles/globals.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element not found");
}

const appRoot = rootElement;

async function bootstrap() {
  const i18n = await createI18n(getLocaleFromPath(window.location.pathname));

  createRoot(appRoot).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </StrictMode>,
  );
}

void bootstrap();
