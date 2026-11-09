import { useState, useEffect } from 'react';
import { useAuth } from './components/auth/AuthContext';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/landing/NavBar';
import AuthModal from './components/auth/AuthModal';
import WizardContainer from './components/wizard/WizardContainer'; 

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      {/* Navbar global siempre disponible */}
      <Navbar 
        onStartWizard={handleOpenWizard} 
        onOpenAuthModal={(mode) => setAuthModalMode(mode)} 
      />

      {/* Si el wizard está abierto, lo mostramos por encima de todo */}
      {isWizardOpen ? (
        <WizardContainer 
          onClose={() => setIsWizardOpen(false)} 
          wizardMode={user?.plan === 'pro' ? 'pro' : 'lite'} 
          onComplete={() => setIsWizardOpen(false)} 
        />
      ) : (
        /* Si no está abierto el wizard, mostramos Dashboard o Landing según autenticación */
        isAuthenticated ? (
          <Dashboard onStartWizard={handleOpenWizard} />
        ) : (
          <LandingPage onStartWizard={handleOpenWizard} />
        )
      )}

      {/* Modal de Autenticación Global */}
      {authModalMode && (
        <AuthModal 
          mode={authModalMode} 
          onClose={() => setAuthModalMode(null)} 
        />
      )}
    </div>
  );
}
