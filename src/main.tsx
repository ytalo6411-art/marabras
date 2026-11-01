import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Elemento #root não encontrado no index.html');
}

createRoot(container).render(
  <StrictMode>
    <I18nProvider><App /></I18nProvider>
  </StrictMode>,
);

// Registro do Service Worker (PWA). Em desenvolvimento fica desabilitado
// para não cachear assets durante o hot reload.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[ATHLETIX] Falha ao registrar o Service Worker:', err);
    });
  });
}
