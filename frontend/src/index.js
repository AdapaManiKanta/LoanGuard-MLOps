import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { register as registerSW } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA offline support & install prompt
registerSW();

// Capture the browser's install prompt so App can trigger it
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e; // accessible from anywhere via window
});

reportWebVitals();
