import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './HowItWorks.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface StepItem {
  id: string;
  step: string;
  title: LocalizedText;
  description: LocalizedText;
}

interface HowItWorksProps {
  items?: StepItem[];
}

const DEFAULT_STEPS: StepItem[] = [
  {
    id: 'step-1',
    step: '01',
    title: { en: 'Write Your Prompt', es: 'Escribe tu Prompt' },
    description: {
      en: 'Start in the high-contrast composer with an idea, script, or quick starter prompt.',
      es: 'Empieza en el compositor de alto contraste con una idea, guion o prompt rápido.',
    },
  },
  {
    id: 'step-2',
    step: '02',
    title: { en: 'Shape Style & Flow', es: 'Define Estilo y Flujo' },
    description: {
      en: 'Choose your studio mode, visual tone, and narration settings with clear hierarchy.',
      es: 'Elige tu modo de estudio, tono visual y ajustes de narración con jerarquía clara.',
    },
  },
  {
    id: 'step-3',
    step: '03',
    title: { en: 'Generate & Publish', es: 'Genera y Publica' },
    description: {
      en: 'Review your output and manage landing sections or showcase items from your panel.',
      es: 'Revisa el resultado y administra secciones o elementos desde tu panel.',
    },
  },
];

function HowItWorks({ items = DEFAULT_STEPS }: HowItWorksProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.landing.howItWorks.eyebrow}</span>
          <h2 className={styles.title}>{t.landing.howItWorks.title}</h2>
          <p className={styles.subtitle}>{t.landing.howItWorks.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.id} className={styles.stepCard}>
              <span className={styles.stepNumber}>{item.step}</span>
              <h3 className={styles.stepTitle}>{item.title[lang]}</h3>
              <p className={styles.stepDescription}>{item.description[lang]}</p>
              <div className={styles.stepLine} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks, DEFAULT_STEPS, type HowItWorksProps, type StepItem };
export default HowItWorks;
