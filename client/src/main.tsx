import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/auth/AuthContext';
import { LanguageProvider } from './components/landing/LanguageContext'; // Asegúrate de importar tu provider de idioma
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);

