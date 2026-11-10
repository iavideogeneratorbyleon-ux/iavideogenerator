import React from 'react';
import { useLanguage } from '../landing/LanguageContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'policy';
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const title = type === 'terms' 
    ? (lang === 'en' ? 'Terms of Service' : 'Términos de Servicio')
    : (lang === 'en' ? 'AI Content Generation Policy' : 'Política de Generación de Contenido con IA');

  return (
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
            {title}
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Contenido con Lorem Ipsum temporal */}
        <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
          </p>
          <p>
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.
          </p>
          <p>
            Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            type="button" 
            onClick={onClose}
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
  );
};
