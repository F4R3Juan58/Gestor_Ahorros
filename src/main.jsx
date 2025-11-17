import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { FinanceProvider } from "./context/FinanceContext";
import { SettingsProvider } from "./context/SettingsContext"; // ⬅️ IMPORTANTE

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SettingsProvider>   {/* ⬅️ ENVOLVER TODA LA APP */}
      <BrowserRouter>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </BrowserRouter>
    </SettingsProvider>
  </React.StrictMode>
);
