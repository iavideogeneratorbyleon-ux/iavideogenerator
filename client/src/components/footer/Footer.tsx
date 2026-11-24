import { useTranslation } from '../../hooks/useTranslations';
import styles from './footer.module.css';

interface FooterProps {
  onNavigate?: (targetIdOrRoute: string) => void;
}

function Footer({ onNavigate }: FooterProps) {
  const { t, language } = useTranslation();
  const isSpanish = language === 'es';
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (target: string) => {
    onNavigate?.(target);
  };

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topGrid}>
          <div className={styles.brandBlock}>
            <div className={styles.brandWordmark}>
              <span className={styles.brandDot} />
              <span>{t.common.appName}</span>
            </div>
            <p className={styles.brandDescription}>
              {isSpanish
                ? 'Espacio creativo con contraste cálido cempasúchil y superficies duales para crear, iterar y publicar sin fricción.'
                : 'High-contrast creative workspace with warm cempasúchil accents and dual surfaces for fast creation and publishing.'}
            </p>
          </div>

          <div>
            <h3 className={styles.columnTitle}>
              {isSpanish ? 'Producto' : 'Product'}
            </h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="#products"
                  onClick={() => handleLinkClick('#products')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Productos' : 'Products'}
                </a>
              </li>
              <li>
                <a
                  href="#tools"
                  onClick={() => handleLinkClick('#tools')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Herramientas' : 'Tools'}
                </a>
              </li>
              <li>
                <a
                  href="#showcase"
                  onClick={() => handleLinkClick('#showcase')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Muestra' : 'Showcase'}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={() => handleLinkClick('#pricing')}
                  className={styles.footerLink}
                >
                  {t.nav.pricing}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.columnTitle}>
              {isSpanish ? 'Flujo' : 'Workflow'}
            </h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="#how-it-works"
                  onClick={() => handleLinkClick('#how-it-works')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Cómo Funciona' : 'How It Works'}
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={() => handleLinkClick('#features')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Características' : 'Features'}
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  onClick={() => handleLinkClick('#testimonials')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Testimonios' : 'Testimonials'}
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={() => handleLinkClick('#faq')}
                  className={styles.footerLink}
                >
                  {isSpanish ? 'Preguntas Frecuentes' : 'FAQ'}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={styles.columnTitle}>
              {isSpanish ? 'Espacio' : 'Workspace'}
            </h3>
            <ul className={styles.linkList}>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('studio-lite')}
                  className={styles.footerLink}
                >
                  {t.nav.studioLite}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick('dashboard')}
                  className={styles.footerLink}
                >
                  {t.nav.dashboard}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} {t.common.appName}.{' '}
            {isSpanish
              ? 'Todos los derechos reservados.'
              : 'All rights reserved.'}
          </p>

          <span className={styles.statusPill}>
            <span className={styles.statusPulse} />
            <span>
              {isSpanish
                ? 'Modo Dual · Cempasúchil UI'
                : 'Dual Mode · Cempasúchil UI'}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export { Footer, type FooterProps };
export default Footer;
