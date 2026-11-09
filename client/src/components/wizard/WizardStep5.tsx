import { useState } from 'react';
import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import styles from './WizardStep5.module.css';

interface Step5Props {
  data: WizardData;
  onPrev: () => void;
  toneLabels: Record<string, string>;
  voiceLabels: Record<string, string>;
  styleLabels: Record<string, string>;
  onOpenAuthModal: (mode: 'login' | 'signup') => void; // Dispara el registro para crédito gratis
  onOpenPricingModal: () => void; // Dispara el modal de compra/planes Pro
}

export default function WizardStep5({ 
  data, 
  onPrev, 
  toneLabels, 
  voiceLabels, 
  styleLabels,
  onOpenAuthModal,
  onOpenPricingModal
}: Step5Props) {
  const { lang, t } = useLanguage();
  const { isAuthenticated, user, deductCredit } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false); // Estado para las 3 opciones

  const musicLabels: Record<string, string> = {
    none: lang === 'en' ? 'No background music' : 'Sin música de fondo',
    lofi: lang === 'en' ? 'Lo-Fi / Chill' : 'Lo-Fi / Relajante',
    epic: lang === 'en' ? 'Epic / Cinematic' : 'Épico / Cinematográfico',
    upbeat: lang === 'en' ? 'Upbeat / Corporate' : 'Animado / Corporativo',
    tech: lang === 'en' ? 'Cyberpunk / Tech' : 'Cyberpunk / Tech',
  };

  const handleGenerateClick = () => {
    // 1. Si el usuario NO está registrado, mostramos el modal con las 3 opciones
    if (!isAuthenticated) {
      setShowConversionModal(true);
      return;
    }

    // 2. Si está registrado pero tiene 0 créditos
    if (!user || user.credits < 1) {
      onOpenPricingModal();
      return;
    }

    // 3. Usuario registrado con créditos suficientes -> Descuenta 1 y genera
    const success = deductCredit(1);
    if (success) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setIsCompleted(true);
      }, 3500);
    } else {
      onOpenPricingModal();
    }
  };

  if (isCompleted) {
    return (
      <div className={styles.completedContainer}>
        <div className={styles.successIconWrapper}>✨</div>
        <div className={styles.completedTextGroup}>
          <h1 className={styles.completedTitle}>{t('step4_success_title')}</h1>
          <p className={styles.completedSub}>
            {lang === 'en' 
              ? 'Your video has been generated successfully!' 
              : '¡Tu video ha sido generado con éxito!'}
          </p>
        </div>
        <div style={{ paddingTop: '1rem' }}>
          <button type="button" onClick={() => window.location.reload()} className={styles.primaryActionBtn}>
            {t('step4_create_another_btn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>{t('step4_title')}</h1>
          <p className={styles.headingSub}>{t('step4_sub')}</p>
        </div>

        {/* Sumario limpio de las elecciones del usuario */}
        <div className={styles.summaryCardBox}>
          <div className={styles.summarySection}>
            <span className={styles.labelTitle}>
              {data.scriptIdea && data.scriptIdea.length > 150 
                ? (lang === 'en' ? 'My Own Script (Custom)' : 'Mi Propio Guion (Personalizado)')
                : t('step4_concept_label')}
            </span>
            <p className={styles.conceptText}>
              {data.scriptIdea || t('summary_undefined')}
            </p>
          </div>

          <div className={styles.gridTwoCols}>
            <div>
              <span className={styles.labelTitle}>{t('step4_tone_label')}</span>
              <p className={styles.itemValue}>{toneLabels[data.tone] || data.tone || t('summary_undefined')}</p>
            </div>
            <div>
              <span className={styles.labelTitle}>{t('step4_format_label')}</span>
              <p className={styles.itemValue}>{data.aspectRatio || '9:16'}</p>
            </div>
          </div>

          <div className={styles.gridTwoColsLast}>
            <div>
              <span className={styles.labelTitle}>{t('step4_voice_label')}</span>
              <p className={styles.itemValue}>{data.voiceId ? (voiceLabels[data.voiceId] || data.voiceId) : t('summary_unselected')}</p>
            </div>
            <div>
              <span className={styles.labelTitle}>{lang === 'en' ? 'Background Music' : 'Música de Fondo'}</span>
              <p className={styles.itemValue}>{musicLabels[data.musicStyle || 'none'] || data.musicStyle}</p>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className={styles.labelTitle}>{t('step4_style_label')}</span>
            <p className={styles.itemValue}>{data.visualStyle ? (styleLabels[data.visualStyle] || data.visualStyle) : t('summary_undefined')}</p>
          </div>
        </div>

        <div className={styles.creditsNotice}>
          <span className={styles.creditsEmoji}>⚡</span>
          <div className={styles.creditsInfo}>
            <p className={styles.creditsTitle}>
              {isAuthenticated ? `Créditos: ${user?.credits ?? 0}` : (lang === 'en' ? 'Ready to Generate' : 'Listo para Generar')}
            </p>
            <p className={styles.creditsDesc}>
              {isAuthenticated ? 'Se descontará 1 crédito de tu balance.' : 'Haz clic en generar para reclamar tu video gratis o elegir un plan.'}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerAction}>
        <button type="button" onClick={onPrev} disabled={isGenerating} className={styles.backBtn}>
          {t('step4_back_btn')}
        </button>
        <button type="button" disabled={isGenerating} onClick={handleGenerateClick} className={styles.generateBtn}>
          {isGenerating ? (
            <>
              <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('step4_generating_btn')}
            </>
          ) : (
            <>{lang === 'en' ? 'Generate Video Now' : 'Generar Video Ahora'}</>
          )}
        </button>
      </div>

      {/* MODAL DE CONVERSIÓN (Las 3 opciones para usuarios no registrados al hacer clic en generar) */}
      {showConversionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
            padding: '2rem', maxWidth: '500px', width: '100%', color: '#fff', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'center' }}>
              {lang === 'en' ? 'Unlock Your Video Generation' : 'Desbloquea la Generación de tu Video'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', lineHeight: '1.4' }}>
              {lang === 'en' 
                ? 'Your project is ready! Choose how you want to proceed:' 
                : '¡Tu proyecto está listo! Elige cómo deseas proceder:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Opción 1: Registrarse y usar opción gratuita */}
              <button 
                type="button"
                onClick={() => { setShowConversionModal(false); onOpenAuthModal('signup'); }}
                style={{
                  background: '#ff6b00', border: 'none', color: '#fff', padding: '0.85rem 1rem',
                  borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span>🎁 {lang === 'en' ? 'Sign up & Claim Free Video' : 'Registrarse y Reclamar Video Gratis'}</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>$0</span>
              </button>

              {/* Opción 2: Comprar un video sin cuenta o suscripción */}
              <button 
                type="button"
                onClick={() => { setShowConversionModal(false); onOpenPricingModal(); }}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.85rem 1rem',
                  borderRadius: '0.75rem', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span>⚡ {lang === 'en' ? 'Buy Single Video Pass' : 'Comprar Pase de 1 Video'}</span>
                <span style={{ color: '#ff6b00', fontWeight: '700' }}>$4.99</span>
              </button>

              {/* Opción 3: Suscripción Pro */}
              <button 
                type="button"
                onClick={() => { setShowConversionModal(false); onOpenPricingModal(); }}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.85rem 1rem',
                  borderRadius: '0.75rem', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span>👑 {lang === 'en' ? 'Upgrade to Pro Creator' : 'Suscribirse a Pro Creator'}</span>
                <span style={{ color: '#ff6b00', fontWeight: '700' }}>$29/mo</span>
              </button>
            </div>

            <button 
              type="button"
              onClick={() => setShowConversionModal(false)}
              style={{
                background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem',
                cursor: 'pointer', marginTop: '0.5rem', textAlign: 'center'
              }}
            >
              {lang === 'en' ? 'Cancel / Keep Editing' : 'Cancelar / Seguir Editando'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
