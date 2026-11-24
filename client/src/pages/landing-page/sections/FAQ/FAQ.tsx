import { useState } from 'react';
import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './FAQ.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

interface FAQProps {
  items?: FaqItem[];
}

const DEFAULT_FAQ: FaqItem[] = [
  {
    id: 'faq-1',
    question: {
      en: 'Can I switch between light and dark themes?',
      es: '¿Puedo cambiar entre tema claro y oscuro?',
    },
    answer: {
      en: 'Yes. Global CSS variables with warm sand and carbon variants keep every surface and prompt legible across both modes.',
      es: 'Sí. Las variables globales CSS con variantes arena cálida y carbón mantienen la legibilidad en ambos modos.',
    },
  },
  {
    id: 'faq-2',
    question: {
      en: 'How does dynamic content management work?',
      es: '¿Cómo funciona la gestión dinámica de contenido?',
    },
    answer: {
      en: 'Sections and items can be loaded from your control panel endpoint with local defaults as instant fallback.',
      es: 'Las secciones y elementos pueden cargarse desde tu endpoint del panel con valores locales como respaldo inmediato.',
    },
  },
];

function FAQ({ items = DEFAULT_FAQ }: FAQProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="faq" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.landing.faq.eyebrow}</span>
          <h2 className={styles.title}>{t.landing.faq.title}</h2>
          <p className={styles.subtitle}>{t.landing.faq.subtitle}</p>
        </div>

        <div className={styles.list}>
          {items.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className={styles.trigger}
                >
                  <span className={styles.question}>{faq.question[lang]}</span>
                  <span className={styles.indicator}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className={styles.answer}>{faq.answer[lang]}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { FAQ, DEFAULT_FAQ, type FAQProps, type FaqItem };
export default FAQ;
