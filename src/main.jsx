// src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App.jsx";

// Importa estilos como string (para inyectarlos en el shadow)
import baseStyles from "./index.css?inline";
import driverStyles from "driver.js/dist/driver.css?inline";

// Función para inyectar estilos dentro del Shadow DOM
function injectStyles(shadowRoot) {
  const style = document.createElement("style");
  style.textContent = baseStyles + driverStyles;
  shadowRoot.appendChild(style);
}

// Montaje principal
function mount() {
  const host =
    document.getElementById("root-tbhs") ||
    document.getElementById("agenda-root");

  if (!host) {
    console.error("No encontré #root-tbhs ni #agenda-root en el DOM.");
    return;
  }

  // Crear Shadow DOM si no existe
  if (!host.__shadowRoot) {
    host.__shadowRoot = host.attachShadow({ mode: "open" });
    injectStyles(host.__shadowRoot); // inyecta estilos al shadow
  }

  // Crear nodo dentro del shadow
  let mountPoint = host.__shadowRoot.querySelector("#react-shadow-root");
  if (!mountPoint) {
    mountPoint = document.createElement("div");
    mountPoint.id = "react-shadow-root";
    host.__shadowRoot.appendChild(mountPoint);
  }

  // Evita múltiples roots
  if (!mountPoint.__reactRoot) {
    mountPoint.__reactRoot = createRoot(mountPoint);
  }

  const bootstrap = window.__BOOTSTRAP__ || {};
  const baseUrl = window.__BASE_URL__ || "/";

  mountPoint.__reactRoot.render(
    <StrictMode>
      <Provider store={store}>
        <App
          bootstrap={bootstrap}
          baseUrl={baseUrl}
          shadowRoot={host.__shadowRoot} // pasamos el shadowRoot como prop
        />
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
