import React from 'react';
import styles from './VideoShowcaseModal.module.css';

export interface VideoShowcaseItem {
  id: string;
  title: string;
  format: '9:16' | '16:9';
  videoUrl: string;
  thumbnail: string;
  prompt: string;
  voice: string;
  tone: string;
  style: string;
}

interface ModalProps {
  item: VideoShowcaseItem | null;
  onClose: () => void;
  onUseRecipe: () => void;
}

export default function VideoShowcaseModal({ item, onClose, onUseRecipe }: ModalProps) {
  if (!item) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modalContainer}>
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
        >
          ✕
        </button>

        {/* Lado Izquierdo: Video / Player */}
        <div className={styles.playerSide}>
          <div className={`${item.format === '9:16' ? styles.playerBoxVertical : styles.playerBoxLandscape}`}>
            <span className={styles.playerText}>▶ Preview: {item.title}</span>
          </div>
        </div>

        {/* Lado Derecho: Receta de Creación IA */}
        <div className={styles.contentSide}>
          <div className="space-y-4">
            <div>
              <span className={styles.recipeBadge}>
                Receta del Video
              </span>
              <h3 className={styles.modalTitle}>{item.title}</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className={styles.promptCard}>
                <span className={styles.sectionLabel}>Prompt Inicial:</span>
                <p className={styles.promptText}>"{item.prompt}"</p>
              </div>

              <div className={styles.gridTwoCols}>
                <div className={styles.metaCard}>
                  <span className={styles.sectionLabel}>Voz ElevenLabs</span>
                  <span className={styles.metaValueBrand}>{item.voice}</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.sectionLabel}>Formato</span>
                  <span className={styles.metaValueBrand}>{item.format}</span>
                </div>
              </div>

              <div className={styles.gridTwoCols}>
                <div className={styles.metaCard}>
                  <span className={styles.sectionLabel}>Tono</span>
                  <span className={styles.metaValueMain}>{item.tone}</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.sectionLabel}>Estilo Visual</span>
                  <span className={styles.metaValueMain}>{item.style}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onUseRecipe}
            className={styles.actionBtn}
          >
            Usar este estilo en el Wizard →
          </button>
        </div>

      </div>
    </div>
  );
}
