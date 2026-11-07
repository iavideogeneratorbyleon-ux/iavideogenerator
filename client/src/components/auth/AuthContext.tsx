import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  credits: number;
  plan: 'free' | 'pro' | 'unlimited';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  deductCredit: (amount?: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Simulación de Login
  const login = (email: string) => {
    const mockName = email.split('@')[0] || 'Creator';
    setUser({
      name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
      email,
      credits: 50, // Créditos iniciales de regalo
      plan: 'free',
    });
  };

  // Simulación de Logout
  const logout = () => {
    setUser(null);
  };

  // Descontar créditos al generar un video
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
