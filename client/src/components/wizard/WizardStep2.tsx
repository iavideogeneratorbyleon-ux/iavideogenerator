import { useState, useRef } from 'react';
import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext'; // <--- 1. Importamos el AuthContext
import styles from './WizardStep2.module.css';
import { STUDIO_LITE_VOICES } from '../../config/voices';

interface Step2Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: 'lite' | 'pro';
}

export default function WizardStep2({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev, 
  wizardMode = 'lite' 
}: Step2Props) {
  const { lang, t } = useLanguage();
  const { user } = useAuth(); // <--- 2. Extraemos el usuario autenticado para validar su plan real

  // 3. Verificamos si el usuario es Pro o tiene un plan de pago activo (según tu modelo de datos de usuario)
  const isPaidUser = wizardMode === 'pro' || ['pro', 'unlimited', 'pay_per_video'].includes((user as any)?.plan);

  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'es'>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Resto del componente sigue igual...


  const filteredVoices = STUDIO_LITE_VOICES.filter((voice) => {
    if (selectedLanguage === 'all') return true;
    return voice.language === selectedLanguage;
  });

  // Manejador para reproducir o pausar el preview de la voz
  const handleTogglePlayPreview = (e: React.MouseEvent, voice: any) => {
    e.stopPropagation(); // Evita que se seleccione la tarjeta al hacer clic en Play

    if (playingVoiceId === voice.id) {
      // Si ya se está reproduciendo esta, la pausamos
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoiceId(null);
    } else {
      // Si hay otro audio sonando, lo detenemos
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Reproducimos la nueva muestra (puedes usar un archivo local o una URL de prueba)
      const sampleUrl = voice.previewSample || `/audio/voices/${voice.id}.mp3`;
      const audio = new Audio(sampleUrl);
      audioRef.current = audio;

      setPlayingVoiceId(voice.id);

      audio.play().catch((err) => {
        console.warn('⚠️ No se encontró archivo de preview local para esta voz, simulando reproducción...', err);
        // Fallback simulado si el archivo .mp3 aún no existe en public/audio/voices/
        setTimeout(() => setPlayingVoiceId(null), 3000);
      });

      audio.onended = () => {
        setPlayingVoiceId(null);
        audioRef.current = null;
      };
    }
  };

  const handleSelectVoice = (voiceId: string, isProOnly?: boolean) => {
    if (isProOnly && !isPaidUser) return; // Bloquea selección si es de pago y el usuario es free_trial
    onUpdate({ voiceId });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {t('step2_title') || 'Choose your AI Voice'}
          </h1>
          <p className={styles.headingSub}>
            {t('step2_sub') || 'Listen to samples and pick the ideal tone for your video.'}
          </p>
        </div>

        {/* Filtros rápidos por idioma */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setSelectedLanguage('all')}
            style={{
              background: selectedLanguage === 'all' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${selectedLanguage === 'all' ? '#FF6B00' : 'rgba(255, 255, 255, 0.08)'}`,
              color: selectedLanguage === 'all' ? '#FF6B00' : '#94A3B8',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {lang === 'en' ? 'All Languages' : 'Todos los Idiomas'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('en')}
            style={{
              background: selectedLanguage === 'en' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${selectedLanguage === 'en' ? '#FF6B00' : 'rgba(255, 255, 255, 0.08)'}`,
              color: selectedLanguage === 'en' ? '#FF6B00' : '#94A3B8',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🇺🇸 English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('es')}
            style={{
              background: selectedLanguage === 'es' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(30, 41, 59, 0.4)',
              border: `1px solid ${selectedLanguage === 'es' ? '#FF6B00' : 'rgba(255, 255, 255, 0.08)'}`,
              color: selectedLanguage === 'es' ? '#FF6B00' : '#94A3B8',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🇪🇸 Español
          </button>
        </div>

        {/* Lista de Voces con Botón Play/Stop y Restricción de Plan */}
        <div className={styles.voicesList} style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {filteredVoices.map((voice) => {
            const isSelected = data.voiceId === voice.id;
            const isLocked = voice.isProOnly && !isPaidUser;
            const isPlaying = playingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                onClick={() => handleSelectVoice(voice.id, voice.isProOnly)}
                style={{
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
                className={`${styles.voiceCard} ${isSelected ? styles.voiceCardSelected : ''}`}
              >
                <div className={styles.voiceHeader} style={{ alignItems: 'center' }}>
                  <div className={styles.voiceInfoGroup}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.voiceName}>{voice.name}</span>
                      {voice.isProOnly && (
                        <span style={{ 
                          background: 'linear-gradient(135deg, #FF6B00, #F59E0B)', 
                          color: '#FFF', 
                          fontSize: '0.6rem', 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '0.25rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em'
                        }}>
                          PRO / PAY-PER-VIDEO 🔒
                        </span>
                      )}
                    </div>
                    <span className={styles.voiceAccentBadge}>
                      {voice.accent} • {voice.tone}
                    </span>
                  </div>

                  {/* Botón de Play / Stop y Radio de selección */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={(e) => handleTogglePlayPreview(e, voice)}
                      title={isPlaying ? 'Pausar muestra' : 'Escuchar muestra de voz'}
                      style={{
                        background: isPlaying ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isPlaying ? '⏹️' : '▶️'}
                    </button>

                    {!isLocked ? (
                      <span className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}>
                        {isSelected && <span className={styles.radioDot} />}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem' }}>🔒</span>
                    )}
                  </div>
                </div>
                <p className={styles.voiceDesc}>{voice.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.footerAction}>
        <button type="button" onClick={onPrev} className={styles.backBtn}>
          {t('step2_back_btn') || 'Back'}
        </button>
        <button type="button" disabled={!data.voiceId} onClick={onNext} className={styles.nextBtn}>
          {t('step2_next_btn') || 'Next'}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
