import { useState, useEffect } from 'react';
import { useAuth } from './components/auth/AuthContext';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/landing/NavBar';
import AuthModal from './components/auth/AuthModal';
// 1. Importa tu contenedor del Wizard (ajusta la ruta según dónde lo tengas guardado, ej: ./components/wizard/WizardContainer)
import WizardContainer from './components/wizard/WizardContainer'; 

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // 🛡️ REGLA UX: Si el usuario cierra sesión mientras el Wizard está abierto, cerramos el Wizard automáticamente
  useEffect(() => {
    if (!isAuthenticated && isWizardOpen) {
      setIsWizardOpen(false);
    }
  }, [isAuthenticated, isWizardOpen]);

  // 2. Si el wizard está abierto, renderizamos el Wizard real en lugar de una pantalla negra
  if (isWizardOpen) {
    return (
      <div className="min-h-screen bg-[#0b0f19]">
        {/* Mantenemos la Navbar arriba o el botón de salida dentro del Wizard */}
        <Navbar 
          onStartWizard={() => setIsWizardOpen(false)} // Opcional: si dan click aquí pueden salir o reiniciar
          onOpenAuthModal={(mode) => setAuthModalMode(mode)} 
        />

        {/* Aquí va tu contenedor de Wizard del Paso 1 al Paso 5 */}
        <WizardContainer 
          onClose={() => setIsWizardOpen(false)} 
          wizardMode={user?.plan === 'pro' ? 'pro' : 'lite'} 
          onComplete={() => {
            setIsWizardOpen(false);
            // Aquí después podemos manejar la redirección al dashboard o éxito
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navbar 
        onStartWizard={() => setIsWizardOpen(true)} 
        onOpenAuthModal={(mode) => setAuthModalMode(mode)} 
      />

      {isAuthenticated ? (
        <Dashboard onStartWizard={() => setIsWizardOpen(true)} />
      ) : (
        <LandingPage onStartWizard={() => setIsWizardOpen(true)} />
      )}

      {authModalMode && (
        <AuthModal 
          mode={authModalMode} 
          onClose={() => setAuthModalMode(null)} 
        />
      )}
    </div>
  );
}
