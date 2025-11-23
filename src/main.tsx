import React from "react";
import ReactDOM from "react-dom/client";
import App from "@components/App";
import "./globals.css";
import "./styles/analysis-common.css";

/**
 * Main React entry point
 * Initializes the React application with root element from index.html
 */
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
