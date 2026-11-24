import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Showcase.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface ShowcaseItem {
  id: string;
  tag: LocalizedText;
  metric: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
}

interface ShowcaseProps {
  items?: ShowcaseItem[];
}

const DEFAULT_SHOWCASE: ShowcaseItem[] = [
  {
    id: 'golden-story',
    tag: { en: 'STORYTELLING', es: 'NARRATIVA' },
    metric: { en: '00:45 · 16:9', es: '00:45 · 16:9' },
    title: { en: 'Warm Editorial Narrative', es: 'Narrativa Editorial Cálida' },
    description: {
      en: 'Balanced amber lighting, paced narration, and clean scene transitions.',
      es: 'Iluminación ámbar equilibrada, narración pausada y transiciones limpias.',
    },
  },
  {
    id: 'product-launch',
    tag: { en: 'PRODUCT DEMO', es: 'LANZAMIENTO' },
    metric: { en: '00:30 · 9:16', es: '00:30 · 9:16' },
    title: { en: 'High-Contrast Feature Spot', es: 'Spot de Alto Contraste' },
    description: {
      en: 'Punchy hook, crisp typography hierarchy, and direct call to action.',
      es: 'Gancho directo, jerarquía tipográfica clara y llamado a la acción.',
    },
  },
  {
    id: 'personal-arc',
    tag: { en: 'PERSONAL ARC', es: 'HISTORIA PERSONAL' },
    metric: { en: '01:00 · 1:1', es: '01:00 · 1:1' },
    title: { en: 'Memory & Milestone Reel', es: 'Crónica e Hitos' },
    description: {
      en: 'Weaves moments and voiceover into an expressive visual progression.',
      es: 'Entrelaza momentos y locución en una progresión visual expresiva.',
    },
  },
];

function Showcase({ items = DEFAULT_SHOWCASE }: ShowcaseProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="showcase" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t.landing.showcase.eyebrow}</span>
            <h2 className={styles.title}>{t.landing.showcase.title}</h2>
          </div>
          <p className={styles.subtitle}>{t.landing.showcase.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.stage}>
                <span className={styles.stageTag}>{item.tag[lang]}</span>
                <span className={styles.stageMetric}>{item.metric[lang]}</span>
              </div>
              <div className={styles.body}>
                <h3 className={styles.cardTitle}>{item.title[lang]}</h3>
                <p className={styles.cardDescription}>{item.description[lang]}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Showcase, DEFAULT_SHOWCASE, type ShowcaseProps, type ShowcaseItem };
export default Showcase;
