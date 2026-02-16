// src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App.jsx";

// Importa estilos como string (para inyectarlos en el shadow)
import baseStyles from "./index.css?inline";
import driverStyles from "driver.js/dist/driver.css?inline";
import sonnerStyles from "sonner/dist/styles.css?inline";

function mirrorHeadStylesIntoShadow(shadowRoot) {
  const map = new Map(); // originalNode -> clonedNode

  const ensureClone = (node) => {
    // Solo <style> y <link rel="stylesheet">
    const isStyle = node instanceof HTMLStyleElement;
    const isLink =
      node instanceof HTMLLinkElement &&
      node.rel === "stylesheet" &&
      node.href;

    if (!isStyle && !isLink) return;

    let clone = map.get(node);
    if (!clone) {
      clone = node.cloneNode(true);

      // Marca para debug
      clone.setAttribute("data-shadow-mirror", "1");

      shadowRoot.appendChild(clone);
      map.set(node, clone);
    } else {
      // Mantén sincronizado
      if (isStyle) {
        // Si el original cambia su CSS, actualiza el clonado
        if (clone.textContent !== node.textContent) {
          clone.textContent = node.textContent || "";
        }
      } else if (isLink) {
        // Si cambia href (raro), sincroniza
        if (clone.href !== node.href) clone.href = node.href;
      }
    }
  };

  const syncAll = () => {
    document.head.childNodes.forEach((n) => ensureClone(n));
  };

  // 1) Copia lo que ya existe
  syncAll();

  // 2) Observa cambios en head (incluye cambios de texto dentro de <style>)
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes.forEach((n) => ensureClone(n));
        // si se removió uno, opcionalmente también lo removemos del shadow
        m.removedNodes.forEach((n) => {
          const clone = map.get(n);
          if (clone) {
            clone.remove();
            map.delete(n);
          }
        });
      }

      if (m.type === "characterData") {
        // cuando cambia el texto dentro de <style>
        const styleEl = m.target?.parentNode;
        if (styleEl instanceof HTMLStyleElement) ensureClone(styleEl);
      }
    }

    // Por si algo actualiza style sin characterData detectable (casos edge)
    syncAll();
  });

  mo.observe(document.head, {
    childList: true,
    subtree: true,        // necesario para ver cambios dentro de <style>
    characterData: true,  // necesario para textContent updates
  });

  return () => mo.disconnect();
}

function mirrorGooberIntoShadow(shadowRoot) {
  let clone = null;

  const sync = () => {
    const goober = document.head.querySelector("style#_goober");
    if (!goober) return;

    if (!clone) {
      clone = goober.cloneNode(true);
      clone.setAttribute("data-shadow-mirror", "goober");
      shadowRoot.appendChild(clone);
    } else {
      const next = goober.textContent || "";
      if (clone.textContent !== next) clone.textContent = next;
    }
  };

  // 1) intenta sincronizar ya
  sync();

  // 2) observa cambios (porque goober actualiza el textContent)
  const mo = new MutationObserver(() => sync());
  mo.observe(document.head, { childList: true, subtree: true, characterData: true });

  return () => mo.disconnect();
}


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
    mirrorGooberIntoShadow(host.__shadowRoot);
    //mirrorHeadStylesIntoShadow(host.__shadowRoot);
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
