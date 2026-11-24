import React, { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth, type AuthUser } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import { type PlanTier } from '../wizard/wizardStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
  selectedPlan?: PlanTier;
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode = 'signup',
  selectedPlan,
  onLoginSuccess,
}) => {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [isRegistering, setIsRegistering] = useState(mode === 'signup');
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');

  // Campos Paso 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Campos Paso 2 (Verificación y Nombre)
  const [name, setName] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error'
  >('idle');

  const { completeAuth, selectedPlanForAuth } = useAuth();
  const targetPlan = selectedPlan ?? selectedPlanForAuth ?? 'free_trial';

  useEffect(() => {
    if (isOpen) {
      setIsRegistering(mode === 'signup');
      setStep('credentials');
      setError('');
      setVerifyStatus('idle');
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen, mode]);

  // Temporizador para reenvío de código
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handlePostAuthSuccess = () => {
    onLoginSuccess?.();
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
          body: JSON.stringify({
            token: tokenResponse.access_token,
            plan: targetPlan,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          const userObj = data.user || data;
          const userProfile: AuthUser = {
            id: String(userObj.id || userObj._id || userObj.email || 'google-user'),
            name:
              userObj.name ||
              userObj.email?.split('@')[0] ||
              (isEn ? 'User' : 'Usuario'),
            email: userObj.email,
            avatarUrl: userObj.avatarUrl || userObj.picture,
            provider: 'google',
          };

          completeAuth(userProfile, (userObj.plan as PlanTier) || targetPlan);
          handlePostAuthSuccess();
        } else {
          setError(
            data.message ||
              (isEn
                ? 'Error authenticating with Google'
                : 'Error al autenticar con Google')
          );
        }
      } catch {
        setError(
          isEn
            ? 'Server connection error'
            : 'Error de conexión con el servidor backend'
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError(
        isEn
          ? 'Google authentication was cancelled or failed'
          : 'La autenticación con Google fue cancelada o falló'
      );
    },
  });

  if (!isOpen) return null;

  // Paso 1: Solicitar envío de código OTP o Iniciar Sesión normal
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError(
        isEn ? 'Passwords do not match' : 'Las contraseñas no coinciden'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        isEn
          ? 'Password must be at least 6 characters'
          : 'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const res = await fetch(
          'http://localhost:3030/api/auth/send-verification',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, plan: targetPlan }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              (isEn
                ? 'Could not send verification code'
                : 'No se pudo enviar el código de verificación')
          );
        }

        if (!name) {
          const suggestedName = email.split('@')[0].replace(/[._-]/g, ' ');
          setName(
            suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1)
          );
        }

        setResendCooldown(60);
        setVerifyStatus('idle');
        setStep('verify');
      } else {
        const res = await fetch('http://localhost:3030/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              (isEn ? 'Invalid credentials' : 'Credenciales inválidas')
          );
        }

        const userObj = data.user || data;
        const userProfile: AuthUser = {
          id: String(userObj.id || userObj._id || email),
          name: userObj.name || email.split('@')[0],
          email: userObj.email || email,
          avatarUrl: userObj.avatarUrl,
          provider: 'email',
        };

        completeAuth(userProfile, (userObj.plan as PlanTier) || targetPlan);
        handlePostAuthSuccess();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEn
          ? 'Error processing request'
          : 'Error al procesar la solicitud';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de las 6 casillas del código OTP
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (verifyStatus === 'error') {
      setVerifyStatus('idle');
      setError('');
    }

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  // Paso 2: Validar código OTP, guardar nombre y crear usuario definitivo
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length < 6) {
      setVerifyStatus('error');
      setError(
        isEn
          ? 'Please enter the 6-digit code'
          : 'Ingresa el código completo de 6 dígitos'
      );
      return;
    }

    if (!name.trim()) {
      setVerifyStatus('error');
      setError(isEn ? 'Please enter your name' : 'Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    setVerifyStatus('verifying');

    try {
      const res = await fetch(
        'http://localhost:3030/api/auth/verify-and-register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            code,
            name: name.trim(),
            plan: targetPlan,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            (isEn ? 'Invalid or expired code' : 'Código inválido o expirado')
        );
      }

      const userObj = data.user || data;
      const userProfile: AuthUser = {
        id: String(userObj.id || userObj._id || email),
        name: userObj.name || name.trim(),
        email: userObj.email || email,
        avatarUrl: userObj.avatarUrl,
        provider: 'email',
      };

      setVerifyStatus('success');

      setTimeout(() => {
        completeAuth(userProfile, (userObj.plan as PlanTier) || targetPlan);
        handlePostAuthSuccess();
      }, 1800);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEn
          ? 'Verification failed'
          : 'Error al verificar la cuenta';
      setVerifyStatus('error');
      setError(message);
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setVerifyStatus('idle');
    setLoading(true);
    try {
      const res = await fetch(
        'http://localhost:3030/api/auth/send-verification',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, plan: targetPlan }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isEn
          ? 'Error resending code'
          : 'Error al reenviar el código';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {isRegistering && step === 'verify' ? (
          <div>
            <button
              type="button"
              disabled={loading || verifyStatus === 'success'}
              onClick={() => {
                setStep('credentials');
                setError('');
                setVerifyStatus('idle');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-3 transition-colors disabled:opacity-50"
            >
              ← {isEn ? 'Change email' : 'Cambiar correo'}
            </button>

            <h2 className="text-2xl font-bold text-center mb-2">
              {isEn ? 'Verify your email' : 'Verifica tu correo'}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              {isEn
                ? 'We sent a 6-digit code to '
                : 'Enviamos un código de 6 dígitos a '}
              <span className="text-white font-semibold">{email}</span>
            </p>

            {verifyStatus === 'verifying' && (
              <div className="bg-orange-500/10 border border-orange-500/40 text-orange-300 text-sm p-3 rounded-xl mb-4 flex items-center justify-center gap-2.5">
                <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <span>
                  {isEn
                    ? 'Verifying your email code...'
                    : 'Verificando tu código de correo...'}
                </span>
              </div>
            )}

            {verifyStatus === 'success' && (
              <div className="bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 text-sm p-3 rounded-xl mb-4 flex items-center justify-center gap-2 font-medium">
                <span>✓</span>
                <span>
                  {isEn
                    ? 'Email verified! Setting up your account...'
                    : '¡Correo verificado! Preparando tu cuenta...'}
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                ✕ {error}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  {isEn ? 'Your Name' : 'Tu Nombre'}
                </label>
                <input
                  type="text"
                  required
                  disabled={loading || verifyStatus === 'success'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isEn ? 'How should we call you?' : '¿Cómo te llamas?'
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 text-center">
                  {isEn ? 'Verification Code' : 'Código de Verificación'}
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={loading || verifyStatus === 'success'}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-11 h-12 text-center text-lg font-bold bg-slate-800/80 border rounded-xl text-white focus:outline-none transition disabled:opacity-60 ${
                        verifyStatus === 'success'
                          ? 'border-emerald-500 text-emerald-300'
                          : verifyStatus === 'error'
                          ? 'border-red-500/70 focus:border-red-500'
                          : 'border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verifyStatus === 'success'}
                className={`w-full font-semibold py-3 rounded-xl shadow-lg transition disabled:opacity-80 ${
                  verifyStatus === 'success'
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
                }`}
              >
                {verifyStatus === 'success'
                  ? isEn
                    ? 'Verified ✓'
                    : 'Verificado ✓'
                  : loading
                  ? isEn
                    ? 'Verifying...'
                    : 'Verificando...'
                  : isEn
                  ? 'Verify & Continue'
                  : 'Verificar y Continuar'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              {resendCooldown > 0 ? (
                <span>
                  {isEn
                    ? `Resend code in ${resendCooldown}s`
                    : `Reenviar código en ${resendCooldown}s`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || verifyStatus === 'success'}
                  className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition disabled:opacity-50"
                >
                  {isEn
                    ? "Didn't receive it? Resend code"
                    : '¿No lo recibiste? Reenviar código'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">
              {isRegistering
                ? isEn
                  ? 'Create your cempa.ai account'
                  : 'Crea tu cuenta en cempa.ai'
                : isEn
                ? 'Sign In'
                : 'Iniciar Sesión'}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              {isRegistering
                ? isEn
                  ? `Selected plan: ${targetPlan}. Complete sign up to continue.`
                  : `Plan elegido: ${targetPlan}. Completa tu registro para continuar.`
                : isEn
                ? 'Enter your credentials to access your projects'
                : 'Ingresa tus credenciales para acceder a tus proyectos'}
            </p>

            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/50 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition shadow-sm mb-5 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-1.5-1-3.2-1-5z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              {isEn ? 'Continue with Google' : 'Continuar con Google'}
            </button>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider absolute">
                {isEn ? 'or with email' : 'o con tu correo'}
              </span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  {isEn ? 'Email Address' : 'Correo electrónico'}
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  {isEn ? 'Password' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    {isEn ? 'Confirm Password' : 'Confirmar Contraseña'}
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
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
                  ? isEn
                    ? 'Processing...'
                    : 'Procesando...'
                  : isRegistering
                  ? isEn
                    ? 'Continue'
                    : 'Continuar'
                  : isEn
                  ? 'Sign In'
                  : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isRegistering ? (
                <p>
                  {isEn ? 'Already have an account? ' : '¿Ya tienes cuenta? '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setError('');
                    }}
                    className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition"
                  >
                    {isEn ? 'Sign in here' : 'Inicia sesión aquí'}
                  </button>
                </p>
              ) : (
                <p>
                  {isEn
                    ? "Don't have an account? "
                    : '¿No tienes cuenta? '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError('');
                    }}
                    className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition"
                  >
                    {isEn ? 'Sign up free' : 'Regístrate gratis'}
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
