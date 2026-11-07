import { useState } from 'react';
import { useLanguage } from '../landing/LanguageContext';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  mode?: 'login' | 'signup'; // <-- Cambiado de initialMode a mode
  onClose: () => void;
}

export default function AuthModal({ mode: initialMode = 'login', onClose }: AuthModalProps) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${mode === 'login' ? 'Iniciando sesión:' : 'Registrando:'} ${email}`);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            Cempa<span className={styles.highlight}>.ai</span>
          </div>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? (lang === 'en' ? 'Welcome back! Please enter your details.' : '¡Bienvenido de nuevo! Ingresa tus datos.')
              : (lang === 'en' ? 'Create an account to start generating.' : 'Crea una cuenta para comenzar a generar.')}
          </p>
        </div>

        {/* Tab Selector */}
        <div className={styles.tabContainer}>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
          >
            {lang === 'en' ? 'Log In' : 'Iniciar Sesión'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
          >
            {lang === 'en' ? 'Sign Up' : 'Registrarse'}
          </button>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => alert('Google OAuth workflow')}
          className={styles.socialBtn}
        >
          <span>🌐</span>
          <span>{lang === 'en' ? 'Continue with Google' : 'Continuar con Google'}</span>
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>
            {lang === 'en' ? 'or email' : 'o correo'}
          </span>
          <div className={styles.dividerLine} />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {lang === 'en' ? 'Email Address' : 'Correo Electrónico'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {lang === 'en' ? 'Password' : 'Contraseña'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            {mode === 'login'
              ? (lang === 'en' ? 'Log In to Cempa.ai' : 'Iniciar Sesión en Cempa.ai')
              : (lang === 'en' ? 'Create Free Account' : 'Crear Cuenta Gratis')}
          </button>
        </form>

      </div>
    </div>
  );
}
