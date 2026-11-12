import { useState, useEffect, useRef } from 'react';
import { useAuth } from './components/auth/AuthContext';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/landing/NavBar';
import AuthModal from './components/auth/AuthModal';
import WizardContainer from './components/wizard/WizardContainer'; 
import { getPendingDraft, clearPendingDraft } from './components/wizard/wizardStorage';

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // 🧭 Estado para controlar si el usuario logueado ve la Landing o su Dashboard
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  // 🛡️ Referencia para detectar exclusivamente cuando ocurre un Sign Out real
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    // Si el usuario ESTABA autenticado (true) y AHORA NO lo está (false), se hizo Sign Out
    if (prevAuthRef.current && !isAuthenticated) {
      setIsWizardOpen(false);
      clearPendingDraft();
      setCurrentView('landing');
    }
    // Actualizamos la referencia con el estado actual
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // 🎁 Auto-claim: Si el usuario completa el registro y tenía un borrador pendiente, reabrimos el Wizard y lo mandaremos al Dashboard al terminar
  useEffect(() => {
    if (isAuthenticated) {
      const pendingDraft = getPendingDraft();
      if (pendingDraft) {
        setIsWizardOpen(true);
      }
    }
  }, [isAuthenticated]);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navbar 
        onStartWizard={handleOpenWizard} 
        onOpenAuthModal={(mode) => setAuthModalMode(mode)} 
        onGoHome={() => setCurrentView('landing')}
        onGoDashboard={() => setCurrentView('dashboard')}
      />

      {isWizardOpen ? (
        <WizardContainer 
          onClose={() => {
            setIsWizardOpen(false);
            clearPendingDraft();
          }} 
          wizardMode={user?.plan === 'pro' ? 'pro' : 'lite'} 
          onComplete={() => {
            setIsWizardOpen(false);
            clearPendingDraft();
            setCurrentView('dashboard'); // <--- 🚀 Al terminar de generar el video, lo mandamos al Dashboard
          }} 
          onOpenAuthModal={(mode) => setAuthModalMode(mode)}
          onOpenPricingModal={() => {
            setIsWizardOpen(false);
            window.location.hash = '#pricing';
          }}
        />
      ) : (
        isAuthenticated && currentView === 'dashboard' ? (
          <Dashboard onStartWizard={handleOpenWizard} />
        ) : (
          <LandingPage onStartWizard={handleOpenWizard} />
        )
      )}

      {authModalMode && (
        <AuthModal 
          isOpen={authModalMode !== null}
          mode={authModalMode} 
          onClose={() => setAuthModalMode(null)} 
        />
      )}
    </div>
  );
}
