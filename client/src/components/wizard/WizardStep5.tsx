import { useState } from 'react';
import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { savePendingDraft } from './wizardStorage';
import styles from './WizardStep5.module.css';

interface Step5Props {
  data: WizardData;
  onPrev: () => void;
  toneLabels: Record<string, string>;
  voiceLabels: Record<string, string>;
  styleLabels: Record<string, string>;
  onStartProcessing?: () => void; // <--- Añadido para activar la pantalla de procesamiento dinámico
  onOpenAuthModal: (mode: 'login' | 'signup', onSuccess?: () => void) => void;
  onOpenPricingModal: () => void;
  onOpenTermsModal?: (type: 'terms' | 'policy') => void;
}

export default function WizardStep5({ 
  data, 
  onPrev, 
  toneLabels, 
  voiceLabels, 
  styleLabels,
  onStartProcessing,
  onOpenAuthModal,
  onOpenPricingModal,
  onOpenTermsModal
}: Step5Props) {
  const { lang, t } = useLanguage();
  const { isAuthenticated, user, deductCredit } = useAuth();
  
  const [showConversionModal, setShowConversionModal] = useState(false);

  // Estados para la casilla de Términos y Condiciones y control local por si no viene por props
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [internalLegalModal, setInternalLegalModal] = useState<'terms' | 'policy' | null>(null);

  const handleOpenTerms = (type: 'terms' | 'policy') => {
    if (onOpenTermsModal) {
      onOpenTermsModal(type);
    } else {
      setInternalLegalModal(type);
    }
  };

  const musicLabels: Record<string, string> = {
    none: lang === 'en' ? 'No background music' : 'Sin música de fondo',
    lofi: lang === 'en' ? 'Lo-Fi / Chill' : 'Lo-Fi / Relajante',
    epic: lang === 'en' ? 'Epic / Cinematic' : 'Épico / Cinematográfico',
    upbeat: lang === 'en' ? 'Upbeat / Corporate' : 'Animado / Corporativo',
    tech: lang === 'en' ? 'Cyberpunk / Tech' : 'Cyberpunk / Tech',
  };

  const handleGenerateClick = async () => {
    if (!isAuthenticated || !user) {
      setShowConversionModal(true);
      return;
    }

    if (user.credits < 1) {
      onOpenPricingModal();
      return;
    }

    const success = await deductCredit(0);
    if (success) {
      if (onStartProcessing) {
        onStartProcessing(); // <--- Dispara la pantalla de progreso dinámico en el WizardContainer
      }
    } else {
      onOpenPricingModal();
    }
  };

  // 🎁 Opción 1: Guardar borrador y abrir modal de registro pasando la acción de auto-generar
  const handleClaimFreeVideo = () => {
    savePendingDraft(data);
    setShowConversionModal(false);
    // Al registrarse con éxito, el sistema reanudará inmediatamente la generación del video
    onOpenAuthModal('signup', () => {
      handleGenerateClick();
    });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>{t('step4_title')}</h1>
          <p className={styles.headingSub}>{t('step4_sub')}</p>
        </div>

        {/* Sumario de selecciones */}
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

        {/* Checkbox de Términos y Condiciones */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '0.75rem', 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0.75rem'
        }}>
          <input
            type="checkbox"
            id="terms-checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            style={{ marginTop: '0.2rem', width: '1rem', height: '1rem', accentColor: '#ff6b00', cursor: 'pointer' }}
          />
          <label htmlFor="terms-checkbox" style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
            {lang === 'en' ? (
              <>
                I have read and agree to the{' '}
                <span 
                  onClick={(e) => { e.preventDefault(); handleOpenTerms('terms'); }} 
                  style={{ color: '#ff6b00', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Terms of Service
                </span>{' '}
                and{' '}
                <span 
                  onClick={(e) => { e.preventDefault(); handleOpenTerms('policy'); }} 
                  style={{ color: '#ff6b00', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  AI Content Generation Policy
                </span>.
              </>
            ) : (
              <>
                He leído y acepto los{' '}
                <span 
                  onClick={(e) => { e.preventDefault(); handleOpenTerms('terms'); }} 
                  style={{ color: '#ff6b00', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Términos de Servicio
                </span>{' '}
                y la{' '}
                <span 
                  onClick={(e) => { e.preventDefault(); handleOpenTerms('policy'); }} 
                  style={{ color: '#ff6b00', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Política de Generación de Contenido con IA
                </span>.
              </>
            )}
          </label>
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
        <button type="button" onClick={onPrev} className={styles.backBtn}>
          {t('step4_back_btn')}
        </button>
        <button 
          type="button" 
          disabled={!acceptedTerms} 
          onClick={handleGenerateClick} 
          className={styles.generateBtn}
          style={{ opacity: !acceptedTerms ? 0.5 : 1, cursor: !acceptedTerms ? 'not-allowed' : 'pointer' }}
        >
          <>{lang === 'en' ? 'Generate Video Now' : 'Generar Video Ahora'}</>
        </button>
      </div>

      {/* Modal de Conversión (Las 3 opciones) */}
      {showConversionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
            padding: '2rem', maxWidth: '460px', width: '100%', color: '#fff', 
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'center', margin: 0 }}>
              {lang === 'en' ? 'Unlock Your Video Generation' : 'Desbloquea la Generación de tu Video'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', lineHeight: '1.4', margin: 0 }}>
              {lang === 'en' 
                ? 'Your project is ready! Choose how you want to proceed:' 
                : '¡Tu proyecto está listo! Elige cómo deseas proceder:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Opción 1: Sign up & Claim Free Video */}
              <button 
                type="button"
                onClick={handleClaimFreeVideo}
                style={{
                  background: '#ff6b00', border: 'none', color: '#fff', padding: '0.85rem 1rem',
                  borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span>🎁 {lang === 'en' ? 'Sign up & Claim Free Video' : 'Registrarse y Reclamar Video Gratis'}</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>$0</span>
              </button>

              {/* Opción 2: Buy Single Video Pass */}
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

              {/* Opción 3: Pro Subscription */}
              <button 
                type="button"
                onClick={() => { setShowConversionModal(false); onOpenPricingModal(); }}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.85rem 1rem',
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
                cursor: 'pointer', marginTop: '0.25rem', textAlign: 'center'
              }}
            >
              {lang === 'en' ? 'Cancel / Keep Editing' : 'Cancelar / Seguir Editando'}
            </button>
          </div>
        </div>
      )}

      {/* Modal interno de respaldo por si no se pasa por props */}
      {!onOpenTermsModal && internalLegalModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10001,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
            padding: '2rem', maxWidth: '600px', width: '100%', color: '#fff', 
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                {internalLegalModal === 'terms' ? (lang === 'en' ? 'Terms of Service' : 'Términos de Servicio') : (lang === 'en' ? 'AI Content Generation Policy' : 'Política de Generación de Contenido con IA')}
              </h2>
              <button 
                type="button"
                onClick={() => setInternalLegalModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
              <p>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                type="button" 
                onClick={() => setInternalLegalModal(null)}
                style={{
                  background: 'linear-gradient(to right, #f97316, #f59e0b)', border: 'none', color: '#fff',
                  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                {lang === 'en' ? 'Accept & Close' : 'Aceptar y Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
