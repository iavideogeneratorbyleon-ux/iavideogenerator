import React, { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth, type AuthUser } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import { type PlanTier } from '../wizard/wizardStorage';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
  selectedPlan?: PlanTier;
  onLoginSuccess?: () => void;
}

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'http://localhost:3030';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const syncCreditsAndFinish = (
    userObj: Record<string, unknown>,
    resolvedPlan: PlanTier
  ) => {
    if (typeof userObj.credits === 'number') {
      window.dispatchEvent(
        new CustomEvent('cempa:credits-updated', {
          detail: { credits: userObj.credits },
        })
      );
    }

    const userProfile: AuthUser = {
      id: String(
        userObj.id || userObj._id || userObj.email || 'cempa-user'
      ),
      name:
        String(userObj.name || '').trim() ||
        (typeof userObj.email === 'string'
          ? userObj.email.split('@')[0]
          : isEn
          ? 'User'
          : 'Usuario'),
      email: String(userObj.email || email),
      avatarUrl:
        typeof userObj.avatarUrl === 'string'
          ? userObj.avatarUrl
          : typeof userObj.picture === 'string'
          ? userObj.picture
          : undefined,
      provider:
        userObj.provider === 'google' ? 'google' : 'email',
    };

    completeAuth(userProfile, resolvedPlan);
    onLoginSuccess?.();
    onClose();
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tokenResponse.access_token,
            plan: targetPlan,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          const userObj = (data.user || data) as Record<string, unknown>;
          const resolvedPlan =
            (typeof userObj.plan === 'string'
              ? (userObj.plan as PlanTier)
              : targetPlan) || targetPlan;
          syncCreditsAndFinish(
            { ...userObj, provider: 'google' },
            resolvedPlan
          );
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
        const res = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, plan: targetPlan }),
        });

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
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

        const userObj = (data.user || data) as Record<string, unknown>;
        const resolvedPlan =
          (typeof userObj.plan === 'string'
            ? (userObj.plan as PlanTier)
            : targetPlan) || targetPlan;
        syncCreditsAndFinish(
          { ...userObj, provider: 'email' },
          resolvedPlan
        );
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
        `${API_BASE_URL}/api/auth/verify-and-register`,
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

      const userObj = (data.user || data) as Record<string, unknown>;
      const resolvedPlan =
        (typeof userObj.plan === 'string'
          ? (userObj.plan as PlanTier)
          : targetPlan) || targetPlan;

      setVerifyStatus('success');

      setTimeout(() => {
        syncCreditsAndFinish(
          { ...userObj, name: userObj.name || name.trim(), provider: 'email' },
          resolvedPlan
        );
      }, 1200);
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
      const res = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, plan: targetPlan }),
      });
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
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={
        isRegistering
          ? isEn
            ? 'Create account'
            : 'Crear cuenta'
          : isEn
          ? 'Sign in'
          : 'Iniciar sesión'
      }
    >
      <div className={styles.card}>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label={isEn ? 'Close modal' : 'Cerrar modal'}
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
              className={styles.backLink}
            >
              ← {isEn ? 'Change email' : 'Cambiar correo'}
            </button>

            <span className={styles.kicker}>CEMPA.AI · ACCOUNT VERIFICATION</span>
            <h2 className={styles.title}>
              {isEn ? 'Verify your email' : 'Verifica tu correo'}
            </h2>
            <p className={styles.subtitle}>
              {isEn
                ? 'We sent a 6-digit code to '
                : 'Enviamos un código de 6 dígitos a '}
              <strong>{email}</strong>
            </p>

            {verifyStatus === 'verifying' && (
              <div className={styles.alertInfo}>
                {isEn
                  ? 'Verifying your email code...'
                  : 'Verificando tu código de correo...'}
              </div>
            )}

            {verifyStatus === 'success' && (
              <div className={styles.alertSuccess}>
                ✓{' '}
                {isEn
                  ? 'Email verified! Setting up your account...'
                  : '¡Correo verificado! Preparando tu cuenta...'}
              </div>
            )}

            {error && <div className={styles.alertError}>✕ {error}</div>}

            <form onSubmit={handleVerifySubmit} className={styles.formStack}>
              <div>
                <label className={styles.fieldLabel}>
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
                  className={styles.inputControl}
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>
                  {isEn ? 'Verification Code' : 'Código de Verificación'}
                </label>
                <div className={styles.otpRow} onPaste={handleOtpPaste}>
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
                      className={styles.otpInput}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || verifyStatus === 'success'}
                className={`${styles.submitBtn} ${
                  verifyStatus === 'success' ? styles.submitBtnSuccess : ''
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

            <div className={styles.footerSwitch}>
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
                  className={styles.inlineAction}
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
            <span className={styles.kicker}>CEMPA.AI · ACCOUNT</span>
            <h2 className={styles.title}>
              {isRegistering
                ? isEn
                  ? 'Create your Cempa.ai account'
                  : 'Crea tu cuenta en Cempa.ai'
                : isEn
                ? 'Sign In'
                : 'Iniciar Sesión'}
            </h2>
            <p className={styles.subtitle}>
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
              className={styles.googleBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>
                {isEn ? 'or with email' : 'o con tu correo'}
              </span>
            </div>

            {error && <div className={styles.alertError}>{error}</div>}

            <form onSubmit={handleCredentialsSubmit} className={styles.formStack}>
              <div>
                <label className={styles.fieldLabel}>
                  {isEn ? 'Email Address' : 'Correo electrónico'}
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={styles.inputControl}
                />
              </div>

              <div>
                <label className={styles.fieldLabel}>
                  {isEn ? 'Password' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required
                  autoComplete={
                    isRegistering ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.inputControl}
                />
              </div>

              {isRegistering && (
                <div>
                  <label className={styles.fieldLabel}>
                    {isEn ? 'Confirm Password' : 'Confirmar Contraseña'}
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.inputControl}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
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

            <div className={styles.footerSwitch}>
              {isRegistering ? (
                <p>
                  {isEn ? 'Already have an account? ' : '¿Ya tienes cuenta? '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setError('');
                    }}
                    className={styles.inlineAction}
                  >
                    {isEn ? 'Sign in here' : 'Inicia sesión aquí'}
                  </button>
                </p>
              ) : (
                <p>
                  {isEn ? "Don't have an account? " : '¿No tienes cuenta? '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError('');
                    }}
                    className={styles.inlineAction}
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
