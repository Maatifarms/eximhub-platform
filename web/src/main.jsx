import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HelmetProvider } from 'react-helmet-async';

console.log('Main.jsx: Starting React mount...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Main.jsx: Root element not found!');
} else {
  console.log('Main.jsx: Root element found, rendering...');
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  );
}
