import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx'; // ✅ Use App, not Dashboard

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);