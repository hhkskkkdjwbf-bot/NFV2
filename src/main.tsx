import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Cache content-hashed assets for repeat visits and offline resilience.
// GitHub Pages controls HTTP cache headers, so this adds a browser-managed layer.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const registerNameForgeWorker = () => {
    const baseUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    const workerUrl = new URL('sw.js', baseUrl);
    void navigator.serviceWorker.register(workerUrl, { scope: baseUrl.pathname }).catch((error: unknown) => {
      if (import.meta.env.DEV) console.warn('NameForge offline cache registration failed', error);
    });
  };

  if (document.readyState === 'complete') {
    registerNameForgeWorker();
  } else {
    window.addEventListener('load', registerNameForgeWorker, { once: true });
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
