import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Features.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface FeatureItem {
  id: string;
  badge?: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
}

interface FeaturesProps {
  items?: FeatureItem[];
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'dual-mode',
    badge: { en: 'UI System', es: 'Sistema UI' },
    title: {
      en: 'Dual-Mode Warm & Carbon Contrast',
      es: 'Contraste Dual Cálido y Carbón',
    },
    description: {
      en: 'Switch seamlessly between warm sand surfaces and rich carbon panels with cempasúchil accents.',
      es: 'Alterna entre superficies arena cálidas y paneles carbón con acentos cempasúchil.',
    },
  },
  {
    id: 'cursor-focus',
    badge: { en: 'UX', es: 'UX' },
    title: {
      en: 'High-Visibility Prompt Focus',
      es: 'Foco de Prompt de Alta Visibilidad',
    },
    description: {
      en: 'Elevated input surfaces and marigold caret indicators ensure you never lose where to type.',
      es: 'Superficies elevadas y cursor cempasúchil visible para saber siempre dónde escribir.',
    },
  },
  {
    id: 'dynamic-sections',
    badge: { en: 'CMS Ready', es: 'Dinámico' },
    title: {
      en: 'Control-Panel Driven Sections',
      es: 'Secciones Controladas desde Panel',
    },
    description: {
      en: 'Enable, reorder, or update reviews, pricing, and FAQs dynamically without editing JSX.',
      es: 'Activa, reordena o actualiza reseñas, precios y preguntas desde el panel sin tocar código.',
    },
  },
];

function Features({ items = DEFAULT_FEATURES }: FeaturesProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.landing.features.eyebrow}</span>
          <h2 className={styles.title}>{t.landing.features.title}</h2>
          <p className={styles.subtitle}>{t.landing.features.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.id} className={styles.card}>
              {item.badge && (
                <span className={styles.badge}>{item.badge[lang]}</span>
              )}
              <h3 className={styles.cardTitle}>{item.title[lang]}</h3>
              <p className={styles.cardDescription}>{item.description[lang]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Features, DEFAULT_FEATURES, type FeaturesProps, type FeatureItem };
export default Features;
