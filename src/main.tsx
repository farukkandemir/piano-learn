import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { LibraryProvider } from "./contexts/LibraryContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <NuqsAdapter>
        <ThemeProvider>
          <LibraryProvider>
            <Toaster position="top-center" duration={3000} richColors />
            <App />
          </LibraryProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </BrowserRouter>
  </StrictMode>
);
