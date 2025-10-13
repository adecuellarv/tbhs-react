// src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import App from "./App.jsx";
// Opcional si usas rutas y no tienes rewrites en Apache/Nginx:
// import { HashRouter } from "react-router-dom";

function mount() {
  // Prioriza el id que pusiste en la vista; fallback al anterior
  const el =
    document.getElementById("root-tbhs") ||
    document.getElementById("agenda-root");

  if (!el) {
    console.error("No encontré #root-tbhs ni #agenda-root en el DOM.");
    return;
  }

  // Datos que inyectas desde la vista de CodeIgniter
  const bootstrap = window.__BOOTSTRAP__ || {};
  const baseUrl = window.__BASE_URL__ || "/";

  // Evita crear múltiples roots si el script se carga dos veces
  if (!el.__reactRoot) {
    el.__reactRoot = createRoot(el);
  }

  el.__reactRoot.render(
    <StrictMode>
      <Provider store={store}>
        {/* Si usas rutas en el cliente sin rewrites, descomenta: */}
        {/* <HashRouter> */}
          <App bootstrap={bootstrap} baseUrl={baseUrl} />
        {/* </HashRouter> */}
      </Provider>
    </StrictMode>
  );
}

// Monta cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
