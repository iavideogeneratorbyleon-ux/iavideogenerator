import React, { useState, useEffect } from 'react';
import { useAuth, type UserProfile } from './AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../landing/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode = 'signup', onLoginSuccess }) => {
  const { lang } = useLanguage(); 
  const [isRegistering, setIsRegistering] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Extraemos login, register y setUser del AuthContext
  const { login, register, setUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsRegistering(mode === 'signup');
      setError('');
    }
  }, [isOpen, mode]);

  const handlePostAuthSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    onClose();
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3030/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await res.json();

        if (res.ok) {
          const userObj = data.user || data;
          const userProfile: UserProfile = {
            name: userObj.name || userObj.email?.split('@')[0] || 'User',
            email: userObj.email,
            avatarUrl: userObj.avatarUrl || userObj.picture,
            credits: userObj.credits ?? 1,
            plan: userObj.plan || 'lite',
          };

          setUser(userProfile); // Actualiza la Navbar y el estado global al instante
          handlePostAuthSuccess();
        } else {
          setError(data.message || (lang === 'en' ? 'Error authenticating with Google' : 'Error al autenticar con Google'));
        }
      } catch (err: any) {
        setError(lang === 'en' ? 'Server connection error' : 'Error de conexión con el servidor backend');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError(lang === 'en' ? 'Google authentication was cancelled or failed' : 'La autenticación con Google fue cancelada o falló');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError(lang === 'en' ? 'Passwords do not match' : 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError(lang === 'en' ? 'Password must be at least 6 characters' : 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await register(email, password, confirmPassword);
      } else {
        await login(email, password);
      }
      handlePostAuthSuccess();
    } catch (err: any) {
      setError(err.message || (lang === 'en' ? 'Error processing request' : 'Error al procesar la solicitud'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">
          {isRegistering 
            ? (lang === 'en' ? 'Create your cempa.ai account' : 'Crea tu cuenta en cempa.ai') 
            : (lang === 'en' ? 'Sign In' : 'Iniciar Sesión')}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          {isRegistering
            ? (lang === 'en' ? 'Get 1 free credit to generate your first video' : 'Obtén 1 crédito gratis para generar tu primer video')
            : (lang === 'en' ? 'Enter your credentials to access your projects' : 'Ingresa tus credenciales para acceder a tus proyectos')}
        </p>

        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/50 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition shadow-sm mb-5 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-1.5-1-3.2-1-5z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          {lang === 'en' ? 'Continue with Google' : 'Continuar con Google'}
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider absolute">
            {lang === 'en' ? 'or with email' : 'o con tu correo'}
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              {lang === 'en' ? 'Email Address' : 'Correo electrónico'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              {lang === 'en' ? 'Password' : 'Contraseña'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                {lang === 'en' ? 'Confirm Password' : 'Confirmar Contraseña'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition disabled:opacity-50 mt-2"
          >
            {loading
              ? (lang === 'en' ? 'Processing...' : 'Procesando...')
              : isRegistering
              ? (lang === 'en' ? 'Sign Up & Claim Credit' : 'Registrarse y Reclamar Crédito')
              : (lang === 'en' ? 'Sign In' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isRegistering ? (
            <p>
              {lang === 'en' ? 'Already have an account? ' : '¿Ya tienes cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition"
              >
                {lang === 'en' ? 'Sign in here' : 'Inicia sesión aquí'}
              </button>
            </p>
          ) : (
            <p>
              {lang === 'en' ? "Don't have an account? " : '¿No tienes cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition"
              >
                {lang === 'en' ? 'Sign up free' : 'Regístrate gratis'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
