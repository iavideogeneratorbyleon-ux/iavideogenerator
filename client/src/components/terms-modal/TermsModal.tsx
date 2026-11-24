import React from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import styles from './TermsModal.module.css';

export type LegalDocType = 'terms' | 'policy';

export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (type: LegalDocType) => void;
  type: LegalDocType;
}

const MODAL_COPY = {
  en: {
    kicker: 'CEMPA.AI · LEGAL & COMPLIANCE',
    termsTitle: 'Terms of Service',
    policyTitle: 'AI Content Generation Policy',
    acceptAndClose: 'Accept & Close',
    closeLabel: 'Close modal',
    paragraphs: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.',
      'Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.',
      'Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.',
    ],
  },
  es: {
    kicker: 'CEMPA.AI · LEGAL Y POLÍTICAS',
    termsTitle: 'Términos de Servicio',
    policyTitle: 'Política de Generación de Contenido con IA',
    acceptAndClose: 'Aceptar y Cerrar',
    closeLabel: 'Cerrar modal',
    paragraphs: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.',
      'Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.',
      'Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.',
    ],
  },
} as const;

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  type,
}) => {
  const { language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const copy = MODAL_COPY[lang];

  if (!isOpen) return null;

  const title = type === 'terms' ? copy.termsTitle : copy.policyTitle;

  const handleAcceptClick = () => {
    onAccept?.(type);
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>{copy.kicker}</span>
            <h2 className={styles.title}>{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            className={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        <div className={styles.bodyCopy}>
          {copy.paragraphs.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleAcceptClick}
            className={styles.acceptBtn}
          >
            {copy.acceptAndClose}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
