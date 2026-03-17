import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('Main.jsx: Starting React mount...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Main.jsx: Root element not found!');
} else {
  console.log('Main.jsx: Root element found, rendering...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
