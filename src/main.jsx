import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './spiritual.css'
import './spiritual-v2.css'
import './samvaad-theme.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service worker: production only. Registering one in dev fights with Vite's
// HMR and serves stale modules. BASE_URL keeps this correct under subpath
// hosting (GitHub Pages), where the app is not at the domain root.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href)
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('[pwa] Service worker registration failed:', err)
    })
  })
}
