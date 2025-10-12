import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css'
import App from './App.jsx'

const bootstrap = window.__BOOTSTRAP__ || {}
const baseUrl   = window.__BASE_URL__ || "/"

createRoot(document.getElementById('agenda-root')).render(
  <StrictMode>
    <Provider store={store}>
      <App bootstrap={bootstrap} baseUrl={baseUrl}  />
    </Provider>
  </StrictMode>,
)
