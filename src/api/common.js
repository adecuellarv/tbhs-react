import axios from "axios";
export const BASE_URL = ''

const env = 'prod'
export const detectApiBase = () => {
  // Si la URL actual contiene /tbhs-actions (caso local), úsalo.
  // Si no, usa raíz (caso QA).
  if(env === 'local'){
    return 'http://localhost:8888/tbhs-actions'
  }
  if(env === 'dev'){
    return '/tbhs-actions'
  }
  if(env === 'prod'){
    return 'https://thebesthairsalon.com.mx'
  }
  const hasPrefix = window.location.pathname.startsWith("/tbhs-actions/");
  const prefix = hasPrefix ? "/tbhs-actions" : "https://thebesthairsalon.com.mx";
  return `${prefix}`; // luego en .get() usa rutas absolutas /apis/...*/
}

export const api = axios.create({
  baseURL: detectApiBase(),             // mismo origen
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" }
});




///tbhs-actions
//package-json
//dev "homepage": "/tbhs-actions",
//production "homepage": "/chatbot",