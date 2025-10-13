// common.js
import axios from "axios";

const isDev = import.meta.env && import.meta.env.DEV;

const prodBase =
  (typeof window !== 'undefined' && window.__API_BASE__) || // ej: .../tbhs-actions/index.php/
  (typeof window !== 'undefined' && window.__BASE_URL__)  || // ej: .../tbhs-actions/
  '/';

export const api = axios.create({
  baseURL: isDev ? '/api/' : prodBase,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" }
});
