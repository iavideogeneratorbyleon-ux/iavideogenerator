import { useTranslation } from '../../hooks/useTranslations';
import { type LegalDocType } from '../terms-modal/TermsModal';
import styles from './TermsAcceptanceBox.module.css';

export interface TermsAcceptanceBoxProps {
  accepted: boolean;
  showError?: boolean;
  onChange: (accepted: boolean) => void;
  onOpenDoc: (docType: LegalDocType) => void;
}

export function TermsAcceptanceBox({
  accepted,
  showError = false,
  onChange,
  onOpenDoc,
}: TermsAcceptanceBoxProps) {
  const { language } = useTranslation();
  const isSpanish = language === 'es';

  return (
    <div
      className={`${styles.termsBox} ${
        showError && !accepted ? styles.termsBoxError : ''
      }`}
    >
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          className={styles.checkboxInput}
        />
        <span>
          {isSpanish ? 'Acepto los ' : 'I accept the '}
          <button
            type="button"
            onClick={() => onOpenDoc('terms')}
            className={styles.docLink}
          >
            {isSpanish ? 'Términos de Servicio' : 'Terms of Service'}
          </button>
          {isSpanish ? ' y la ' : ' and the '}
          <button
            type="button"
            onClick={() => onOpenDoc('policy')}
            className={styles.docLink}
          >
            {isSpanish
              ? 'Política de Generación de Contenido con IA'
              : 'AI Content Generation Policy'}
          </button>
          {isSpanish
            ? ' antes de generar mi video.'
            : ' before generating my video.'}
        </span>
      </label>

      {showError && !accepted && (
        <p className={styles.validationMsg} role="alert">
          {isSpanish
            ? 'Debes aceptar los Términos de Servicio y la Política de IA para continuar.'
            : 'You must accept the Terms of Service and AI Content Policy to continue.'}
        </p>
      )}
    </div>
  );
}

export default TermsAcceptanceBox;
