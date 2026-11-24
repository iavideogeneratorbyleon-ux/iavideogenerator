import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Products.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface ProductCardItem {
  id: string;
  tag: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  badge?: LocalizedText;
}

interface ProductsProps {
  items?: ProductCardItem[];
}

const DEFAULT_PRODUCTS: ProductCardItem[] = [
  {
    id: 'studio-lite',
    tag: { en: '01 · FAST FLOW', es: '01 · FLUJO RÁPIDO' },
    title: { en: 'Studio Lite', es: 'Studio Lite' },
    description: {
      en: 'Turn a prompt or visual idea into structured motion scenes with guided presets.',
      es: 'Convierte un prompt o idea visual en escenas animadas con presets guiados.',
    },
    badge: { en: 'Popular', es: 'Popular' },
  },
  {
    id: 'director-studio',
    tag: { en: '02 · FULL CONTROL', es: '02 · CONTROL TOTAL' },
    title: { en: 'Director Studio', es: 'Director Studio' },
    description: {
      en: 'Shape pacing, voices, and multi-scene narratives with deeper creative control.',
      es: 'Define ritmo, voces y narrativas multiescena con control creativo profundo.',
    },
  },
  {
    id: 'blueprints',
    tag: { en: '03 · REUSABLE SYSTEMS', es: '03 · SISTEMAS REUTILIZABLES' },
    title: { en: 'Studio Blueprints', es: 'Studio Blueprints' },
    description: {
      en: 'Save repeatable visual structures and templates to scale consistent productions.',
      es: 'Guarda estructuras visuales y plantillas repetibles para escalar producciones.',
    },
  },
];

function Products({ items = DEFAULT_PRODUCTS }: ProductsProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="products" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t.landing.products.eyebrow}</span>
            <h2 className={styles.title}>
              {t.landing.products.titleStart}{' '}
              <span className={styles.titleHighlight}>
                {t.landing.products.titleHighlight}
              </span>
            </h2>
          </div>
          <p className={styles.subtitle}>{t.landing.products.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.id} className={styles.card}>
              <div>
                <div className={styles.cardTop}>
                  <span className={styles.tag}>{item.tag[lang]}</span>
                  {item.badge && (
                    <span className={styles.badge}>{item.badge[lang]}</span>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{item.title[lang]}</h3>
                <p className={styles.cardDescription}>{item.description[lang]}</p>
              </div>

              <div className={styles.accentBar} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Products, DEFAULT_PRODUCTS, type ProductsProps, type ProductCardItem };
export default Products;
