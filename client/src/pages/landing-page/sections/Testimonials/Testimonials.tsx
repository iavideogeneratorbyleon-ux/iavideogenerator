import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Testimonials.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface TestimonialItem {
  id: string;
  author: string;
  role: LocalizedText;
  quote: LocalizedText;
  rating: number;
  featured?: boolean;
}

interface TestimonialsProps {
  items?: TestimonialItem[];
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-1',
    author: 'María G.',
    role: { en: 'Content Creator', es: 'Creadora de Contenido' },
    quote: {
      en: 'The prompt workspace is super clear—I immediately know where to write and iterate.',
      es: 'El espacio del prompt es clarísimo; al instante sé dónde escribir e iterar.',
    },
    rating: 5,
    featured: true,
  },
  {
    id: 'rev-2',
    author: 'David K.',
    role: { en: 'Creative Producer', es: 'Productor Creativo' },
    quote: {
      en: 'Warm cempasúchil contrast feels distinct and much easier on the eyes than flat black tools.',
      es: 'El contraste cálido cempasúchil tiene identidad propia y cansa mucho menos que el negro plano.',
    },
    rating: 5,
  },
  {
    id: 'rev-3',
    author: 'Ana R.',
    role: { en: 'Brand Strategist', es: 'Estratega de Marca' },
    quote: {
      en: 'Being able to manage sections and reviews from one place saves hours every week.',
      es: 'Poder administrar secciones y reseñas desde un solo lugar nos ahorra horas cada semana.',
    },
    rating: 5,
  },
];

function Testimonials({ items = DEFAULT_TESTIMONIALS }: TestimonialsProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.landing.testimonials.eyebrow}</span>
          <h2 className={styles.title}>{t.landing.testimonials.title}</h2>
          <p className={styles.subtitle}>{t.landing.testimonials.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {items.map((review) => {
            const stars = '★'.repeat(Math.max(1, Math.min(5, review.rating)));
            return (
              <article
                key={review.id}
                className={`${styles.card} ${review.featured ? styles.cardFeatured : ''}`}
              >
                <div>
                  <div className={styles.rating}>{stars}</div>
                  <p className={styles.quote}>“{review.quote[lang]}”</p>
                </div>

                <div className={styles.authorRow}>
                  <div className={styles.avatar}>{review.author.charAt(0)}</div>
                  <div>
                    <p className={styles.authorName}>{review.author}</p>
                    <p className={styles.authorRole}>{review.role[lang]}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export {
  Testimonials,
  DEFAULT_TESTIMONIALS,
  type TestimonialsProps,
  type TestimonialItem,
};
export default Testimonials;
