import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./components/auth/AuthContext";
import { LanguageProvider } from "./components/landing/LanguageContext"; // Asegúrate de importar tu provider de idioma
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
