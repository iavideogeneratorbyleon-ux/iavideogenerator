import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  credits: number;
  plan: 'lite' | 'pro' | 'unlimited';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  deductCredit: (amount?: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cempa_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Simulación de Login
  const login = (email: string) => {
    const mockName = email.split('@')[0] || 'Creator';
    const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);

    // 🔴 CAMBIA AQUÍ MANUALMENTE EL PLAN PARA TUS PRUEBAS ('lite' o 'pro')
    const currentTestPlan: 'lite' | 'pro' = 'pro'; 

    const newUser: UserProfile = {
      name: formattedName,
      email,
      credits: currentTestPlan === 'pro' ? 50 : 10,
      plan: currentTestPlan,
    };

    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deductCredit = (amount = 1) => {
    if (!user || user.credits < amount) return false;
    setUser((prev) => (prev ? { ...prev, credits: prev.credits - amount } : null));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        deductCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
