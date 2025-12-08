import React from "react";
import ReactDOM from "react-dom/client";
import App from "@components/App";
import { ThemeProvider } from "@components/ThemeProvider";
import "./globals.css";
import "./styles/analysis-common.css";

/**
 * Register Service Worker for offline caching
 */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Registered:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available
                console.log("[SW] New version available");
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("[SW] Registration failed:", error);
      });
  });
}

/**
 * Main React entry point
 * Initializes the React application with root element from index.html
 */
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
