import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registo do Service Worker para suporte PWA (Offline) e Atualização Automática
if ('serviceWorker' in navigator) {
  let registration = null;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        registration = reg;
        console.log('SchoolSync PWA: Service Worker ativado com sucesso em ', reg.scope);
        
        // Sincroniza e verifica atualizações no Render imediatamente ao iniciar
        reg.update();
      })
      .catch((err) => {
        console.error('SchoolSync PWA: Falha ao registar o Service Worker:', err);
      });
  });

  // Função para verificar atualizações no servidor (Render) de forma proativa
  const checkUpdates = () => {
    if (registration) {
      console.log('SchoolSync PWA: A verificar atualizações automáticas...');
      registration.update().catch((err) => {
        console.warn('SchoolSync PWA: Não foi possível verificar atualizações de rede:', err);
      });
    }
  };

  // Verifica sempre que o utilizador volta a abrir/focar a aplicação no ecrã inicial (Home Screen)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkUpdates();
    }
  });

  window.addEventListener('focus', checkUpdates);
  window.addEventListener('online', checkUpdates);

  // Atualização Automática: Recarrega a página ao detetar que uma nova versão do build está pronta no Render
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
