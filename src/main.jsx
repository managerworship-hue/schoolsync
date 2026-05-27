import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registo do Service Worker para suporte PWA (Offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('SchoolSync PWA: Service Worker ativado com sucesso em ', reg.scope);
      })
      .catch((err) => {
        console.error('SchoolSync PWA: Falha ao registar o Service Worker:', err);
      });
  });
}
