import styles from './Logo.module.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export default function Logo({ size = 'md', showSlogan = false }: LogoProps) {
  const iconSizeClass = size === 'sm' ? styles.iconSm : size === 'lg' ? styles.iconLg : styles.iconMd;
  const titleSizeClass = size === 'sm' ? styles.titleSm : size === 'lg' ? styles.titleLg : styles.titleMd;

  return (
    <div className={styles.container}>
      {/* Isotipo: Símbolo moderno de Cempa.ai */}
      <div className={`${styles.icon} ${iconSizeClass}`}>
        C
      </div>
      
      <div className={styles.textWrapper}>
        <span className={`${styles.brandTitle} ${titleSizeClass}`}>
          Cempa<span className={styles.accent}>.ai</span>
        </span>
        {showSlogan && (
          <span className={styles.slogan}>
            Your ideas, brought to brilliant life.
          </span>
        )}
      </div>
    </div>
  );
}
