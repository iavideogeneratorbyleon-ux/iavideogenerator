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
  login: (email: string) => Promise<void>;
  logout: () => void;
  deductCredit: (amount?: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cempa_user_session';
// Ajusta la URL base de tu backend de Express según corresponda
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  // 🛜 Conexión real con MongoDB a través de Express
  const login = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación con el servidor');
      }

      const data = await response.json();
      
      // data.user debe contener la estructura de MongoDB: { name, email, credits, plan }
      const loggedUser: UserProfile = {
        name: data.user.name,
        email: data.user.email,
        credits: data.user.credits,
        plan: data.user.plan,
      };

      setUser(loggedUser);
    } catch (error) {
      console.error('Error conectando con MongoDB via Express:', error);
      // Fallback local por si el backend no está corriendo en desarrollo local
      const mockName = email.split('@')[0] || 'Creator';
      const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      
      const fallbackUser: UserProfile = {
        name: formattedName,
        email,
        credits: 1, // Crédito gratis inicial
        plan: 'lite',
      };
      setUser(fallbackUser);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deductCredit = async (amount = 1): Promise<boolean> => {
    if (!user || user.credits < amount) return false;

    try {
      // Opcional: Sincronizar el descuento de créditos con tu backend y MongoDB
      const response = await fetch(`${API_URL}/user/deduct-credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount }),
      });

      if (!response.ok) {
        console.error('No se pudo descontar el crédito en el servidor');
        return false;
      }

      // Actualizamos estado localmente
      setUser((prev) => (prev ? { ...prev, credits: prev.credits - amount } : null));
      return true;
    } catch (error) {
      console.error('Error de red al descontar crédito:', error);
      // Fallback local optimista
      setUser((prev) => (prev ? { ...prev, credits: prev.credits - amount } : null));
      return true;
    }
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
