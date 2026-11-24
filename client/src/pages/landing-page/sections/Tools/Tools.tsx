import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Tools.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface ToolItem {
  id: string;
  code: string;
  title: LocalizedText;
  description: LocalizedText;
  meta: LocalizedText;
}

interface ToolsProps {
  items?: ToolItem[];
}

const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'prompt-engine',
    code: 'PR',
    title: { en: 'Prompt Refinement', es: 'Refinamiento de Prompt' },
    description: {
      en: 'Shape rough concepts into structured scenes with high-contrast focus.',
      es: 'Transforma ideas iniciales en escenas estructuradas con foco claro.',
    },
    meta: { en: 'Instant iteration', es: 'Iteración inmediata' },
  },
  {
    id: 'voice-sync',
    code: 'VX',
    title: { en: 'Voice & Narration', es: 'Voz y Narración' },
    description: {
      en: 'Pair natural speech pacing with multi-language scripts and hooks.',
      es: 'Combina un ritmo de locución natural con guiones y ganchos.',
    },
    meta: { en: 'Multi-voice ready', es: 'Multivoz listo' },
  },
  {
    id: 'scene-board',
    code: 'SB',
    title: { en: 'Scene & Story Flow', es: 'Flujo de Escenas' },
    description: {
      en: 'Organize openings, transitions, and closings without losing momentum.',
      es: 'Organiza aperturas, transiciones y cierres sin perder ritmo.',
    },
    meta: { en: 'Modular blocks', es: 'Bloques modulares' },
  },
];

function Tools({ items = DEFAULT_TOOLS }: ToolsProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="tools" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.landing.tools.eyebrow}</span>
          <h2 className={styles.title}>{t.landing.tools.title}</h2>
          <p className={styles.subtitle}>{t.landing.tools.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {items.map((tool) => (
            <article key={tool.id} className={styles.card}>
              <span className={styles.iconBadge}>{tool.code}</span>
              <h3 className={styles.cardTitle}>{tool.title[lang]}</h3>
              <p className={styles.cardDescription}>{tool.description[lang]}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardDot} />
                <span>{tool.meta[lang]}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Tools, DEFAULT_TOOLS, type ToolsProps, type ToolItem };
export default Tools;
