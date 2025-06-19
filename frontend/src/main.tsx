import "./styles/globals.css";
import "./styles/index.scss";
import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppContextProvider } from "./contexts/AppContextProvider";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AppContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppContextProvider>
  </React.StrictMode>,
);
