// common.js
import axios from "axios";

const isDev = import.meta.env.DEV;

// En dev el baseURL es el prefijo que Vite proxyea.
// En prod usamos base_url() expuesto desde CI.
const baseURL = isDev
  ? '/api/'                              // Vite proxy
  : (window.__BASE_URL__ || '/');        // mismo origen en prod

export const api = axios.create({
  baseURL,                 // 👆 base coherente por entorno
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" }
});
