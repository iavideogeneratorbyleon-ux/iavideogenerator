import { useState } from "react";
import LandingPage from "./components/landing/LandingPage";
import WizardContainer from "./components/wizard/WizardContainer";
import { LanguageProvider } from "./components/landing/LanguageContext";
import { AuthProvider } from "./components/auth/AuthContext";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "wizard">(
    "landing"
  );

  return (
    <AuthProvider>
      <LanguageProvider>
        {currentView === "landing" ? (
          <LandingPage onStartWizard={() => setCurrentView("wizard")} />
        ) : (
          <WizardContainer />
        )}
      </LanguageProvider>
    </AuthProvider>
  );
}