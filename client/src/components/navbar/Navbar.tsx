import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../hooks/useTranslations';
import styles from './Navbar.module.css';

export type ProductGroup = 'main' | 'extra';

export interface ProductMenuItem {
  id: string;
  group: ProductGroup;
  name: { en: string; es: string };
  summary: { en: string; es: string };
  highlights: { en: string[]; es: string[] };
}

export interface WorkspaceHamburgerMenuConfig {
  activeSection: 'studio-lite' | 'dashboard' | 'text-to-speech';
  videosCount: number;
  planLabel: string;
  userSummary: string;
  onSelectSection: (
    section: 'studio-lite' | 'dashboard' | 'text-to-speech'
  ) => void;
  onOpenUpgrade: () => void;
  onBackToLanding?: () => void;
  onSignOut: () => void;
}

export const MAIN_STUDIO_PRODUCTS: ProductMenuItem[] = [
  {
    id: 'studio-lite',
    group: 'main',
    name: { en: 'Studio Lite', es: 'Studio Lite' },
    summary: {
      en: 'Guided 5-step creation flow to turn ideas or scripts into videos quickly.',
      es: 'Flujo guiado en 5 pasos para convertir ideas o guiones en video rápido.',
    },
    highlights: {
      en: [
        'Presets, visual formats, aspect ratio, voice, and duration in one flow',
        'Automatic plan policy and credit validation',
        'Direct handoff into your workspace projects',
      ],
      es: [
        'Presets, formatos visuales, encuadre, voz y duración en un flujo',
        'Validación automática de políticas de plan y créditos',
        'Guardado directo en los proyectos de tu espacio de trabajo',
      ],
    },
  },
  {
    id: 'director-studio',
    group: 'main',
    name: { en: 'Director Studio', es: 'Director Studio' },
    summary: {
      en: 'Scene-by-scene creative direction with finer pacing and visual control.',
      es: 'Dirección creativa escena por escena con mayor control de ritmo y estilo.',
    },
    highlights: {
      en: [
        'Multi-scene structure and narrative pacing controls',
        'Consistent visual identity and voice direction',
        'Built for creators needing deeper editorial polish',
      ],
      es: [
        'Estructura multiescena y control narrativo del ritmo',
        'Identidad visual y dirección de voz consistentes',
        'Pensado para creadores que buscan mayor acabado editorial',
      ],
    },
  },
  {
    id: 'studio-blueprints',
    group: 'main',
    name: { en: 'Studio Blueprints', es: 'Studio Blueprints' },
    summary: {
      en: 'Reusable production frameworks and templates for repeatable formats.',
      es: 'Estructuras y plantillas reutilizables para formatos recurrentes.',
    },
    highlights: {
      en: [
        'Standardized structures for recurring series and campaigns',
        'Faster setup without rebuilding from scratch',
        'Aligned with team and multi-video workflows',
      ],
      es: [
        'Estructuras estandarizadas para series y campañas recurrentes',
        'Configuración ágil sin empezar desde cero cada vez',
        'Ideal para flujos constantes y escalables',
      ],
    },
  },
  {
    id: 'studio-memories',
    group: 'main',
    name: { en: 'Studio Memories', es: 'Studio Memories' },
    summary: {
      en: 'Persistent brand, style, and story memory across future productions.',
      es: 'Memoria persistente de estilo, marca y contexto entre producciones.',
    },
    highlights: {
      en: [
        'Retains preferred tones, formats, and recurring references',
        'Keeps continuity across episodes and updates',
        'Reduces repetitive prompt setup',
      ],
      es: [
        'Conserva tonos, formatos y referencias recurrentes',
        'Mantiene continuidad entre piezas y entregas',
        'Evita repetir configuraciones base en cada proyecto',
      ],
    },
  },
];

export const EXTRA_TOOL_PRODUCTS: ProductMenuItem[] = [
  {
    id: 'text-to-speech',
    group: 'extra',
    name: { en: 'Text to Speech', es: 'Text to Speech' },
    summary: {
      en: 'Convert written scripts into natural spoken narration tracks.',
      es: 'Convierte guiones escritos en locuciones naturales de voz.',
    },
    highlights: {
      en: [
        'Fast script-to-audio drafting',
        'Multiple voice tones and pacing options',
        'Ready to pair with video scenes',
      ],
      es: [
        'Paso rápido de texto a pista de audio',
        'Distintos tonos de voz y ritmos de lectura',
        'Listo para integrarse con tus escenas de video',
      ],
    },
  },
  {
    id: 'text-to-image',
    group: 'extra',
    name: { en: 'Text to Image', es: 'Text to Image' },
    summary: {
      en: 'Generate concept frames, thumbnails, and visual assets from prompts.',
      es: 'Genera cuadros conceptuales, portadas y recursos visuales desde texto.',
    },
    highlights: {
      en: [
        'Supports editorial, realistic, and stylized looks',
        'Useful for storyboarding and visual exploration',
        'Export-ready visual concepts',
      ],
      es: [
        'Soporta estilos editoriales, realistas y creativos',
        'Útil para previsualización y exploración visual',
        'Conceptos visuales listos para usar',
      ],
    },
  },
  {
    id: 'image-to-video',
    group: 'extra',
    name: { en: 'Image to Video', es: 'Image to Video' },
    summary: {
      en: 'Bring still images to life with subtle camera motion and depth.',
      es: 'Da movimiento de cámara y profundidad a imágenes fijas.',
    },
    highlights: {
      en: [
        'Turns static visuals into dynamic motion clips',
        'Controlled framing for social and editorial formats',
        'Smooth transition between still and motion',
      ],
      es: [
        'Convierte imágenes estáticas en clips con movimiento',
        'Encuadres adaptados a formatos verticales y horizontales',
        'Transición natural entre imagen fija y movimiento',
      ],
    },
  },
  {
    id: 'ai-voiceover',
    group: 'extra',
    name: { en: 'AI Voiceover', es: 'AI Voiceover' },
    summary: {
      en: 'Polished voice tracks tailored for explainers, promos, and shorts.',
      es: 'Locuciones cuidadas pensadas para explicativos, promos y shorts.',
    },
    highlights: {
      en: [
        'Clear vocal delivery for storytelling',
        'Consistent cadence across segments',
        'Quick iteration on script edits',
      ],
      es: [
        'Dicción clara para narrativa y explicación',
        'Cadencia uniforme a lo largo del guion',
        'Ajustes rápidos ante cambios de texto',
      ],
    },
  },
  {
    id: 'background-music',
    group: 'extra',
    name: { en: 'Background Music', es: 'Background Music' },
    summary: {
      en: 'Mood-matched ambient and rhythmic beds to support your video.',
      es: 'Bases musicales y ambientales acordes al tono de cada video.',
    },
    highlights: {
      en: [
        'Matches calm, energetic, or dramatic moods',
        'Balances underneath voice narration',
        'Enhances retention across short and long cuts',
      ],
      es: [
        'Se adapta a tonos calmados, dinámicos o dramáticos',
        'Acompaña sin opacar la voz principal',
        'Aporta cohesión sonora a tus piezas',
      ],
    },
  },
];

export interface NavbarProps {
  activeView: 'landing' | 'workspace';
  credits: number;
  onSelectBrand: () => void;
  onToggleView: () => void;
  onNavigateSection: (section: 'products' | 'plans' | 'pricing') => void;
  onSelectProduct: (product: ProductMenuItem) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenPlansModal: () => void;
  onSignOut: () => void;
  workspaceMenu?: WorkspaceHamburgerMenuConfig;
}

const NAVBAR_COPY = {
  en: {
    products: 'Products',
    mainGroup: 'Main Studio',
    extraGroup: 'Extra Tools',
    plans: 'Plans',
    pricing: 'Pricing',
    workspace: 'Workspace',
    landing: 'Landing',
    light: 'Light',
    dark: 'Dark',
    themeLabel: 'Theme',
    languageLabel: 'Language',
    login: 'Log in',
    signup: 'Sign up',
    signOut: 'Sign out',
    credits: 'credits',
    balance: 'Balance',
    upgrade: 'Upgrade',
    menuLabel: 'Toggle navigation menu',
  },
  es: {
    products: 'Productos',
    mainGroup: 'Estudio Principal',
    extraGroup: 'Herramientas Extra',
    plans: 'Planes',
    pricing: 'Precios',
    workspace: 'Workspace',
    landing: 'Inicio',
    light: 'Claro',
    dark: 'Oscuro',
    themeLabel: 'Tema',
    languageLabel: 'Idioma',
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    signOut: 'Cerrar sesión',
    credits: 'créditos',
    balance: 'Saldo',
    upgrade: 'Mejorar',
    menuLabel: 'Abrir o cerrar menú de navegación',
  },
} as const;

export default function Navbar({
  activeView,
  credits,
  onSelectBrand,
  onToggleView,
  onNavigateSection,
  onSelectProduct,
  onOpenLogin,
  onOpenSignup,
  onOpenPlansModal,
  onSignOut,
  workspaceMenu,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [isProductsOpen, setIsProductsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileProductsExpanded, setIsMobileProductsExpanded] =
    useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileWrapperRef = useRef<HTMLDivElement | null>(null);

  const lang = language === 'es' ? 'es' : 'en';
  const copy = NAVBAR_COPY[lang];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProductsOpen(false);
      }
      if (
        mobileWrapperRef.current &&
        !mobileWrapperRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProductsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const userWithAvatar = user as
    | { name?: string; email?: string; avatarUrl?: string; picture?: string }
    | null;
  const avatarSrc = userWithAvatar?.avatarUrl || userWithAvatar?.picture || '';
  const displayInitial = (
    userWithAvatar?.name ||
    userWithAvatar?.email ||
    'U'
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleProductClick = (product: ProductMenuItem) => {
    setIsProductsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileProductsExpanded(false);
    onSelectProduct(product);
  };

  const handleSectionClick = (section: 'products' | 'plans' | 'pricing') => {
    setIsProductsOpen(false);
    setIsMobileMenuOpen(false);
    onNavigateSection(section);
  };

  return (
    <header className={styles.navbar}>
      <button
        type="button"
        onClick={() => {
          setIsProductsOpen(false);
          setIsMobileMenuOpen(false);
          onSelectBrand();
        }}
        className={styles.brandBtn}
      >
        Cempai.ai
      </button>

      <nav
        className={styles.desktopCenterNav}
        aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}
      >
        <div ref={dropdownRef} className={styles.dropdownWrap}>
          <button
            type="button"
            aria-expanded={isProductsOpen}
            aria-haspopup="menu"
            onClick={() => setIsProductsOpen((prev) => !prev)}
            className={`${styles.centerLink} ${
              isProductsOpen ? styles.centerLinkActive : ''
            }`}
          >
            <span>{copy.products}</span>
            <span
              aria-hidden="true"
              className={`${styles.chevron} ${
                isProductsOpen ? styles.chevronOpen : ''
              }`}
            >
              ▾
            </span>
          </button>

          {isProductsOpen && (
            <div className={styles.dropdownMenu} role="menu">
              <div className={styles.dropdownColumn}>
                <span className={styles.dropdownHeading}>{copy.mainGroup}</span>
                {MAIN_STUDIO_PRODUCTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleProductClick(item)}
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownItemTitle}>
                      {item.name[lang]}
                    </span>
                    <span className={styles.dropdownItemDesc}>
                      {item.summary[lang]}
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.dropdownColumn}>
                <span className={styles.dropdownHeading}>{copy.extraGroup}</span>
                {EXTRA_TOOL_PRODUCTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleProductClick(item)}
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownItemTitle}>
                      {item.name[lang]}
                    </span>
                    <span className={styles.dropdownItemDesc}>
                      {item.summary[lang]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSectionClick('plans')}
          className={styles.centerLink}
        >
          {copy.plans}
        </button>

        <button
          type="button"
          onClick={() => handleSectionClick('pricing')}
          className={styles.centerLink}
        >
          {copy.pricing}
        </button>
      </nav>

      <div className={styles.desktopRightControls}>
        {isAuthenticated && (
          <button
            type="button"
            onClick={onToggleView}
            className={styles.utilityBtn}
          >
            {activeView === 'landing' ? copy.workspace : copy.landing}
          </button>
        )}

        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={onOpenPlansModal}
              className={styles.creditsPill}
              title={
                lang === 'es'
                  ? 'Ver planes y créditos'
                  : 'View plans and credits'
              }
            >
              <span>⚡ {credits}</span>
              <span>{copy.credits}</span>
            </button>

            <span
              className={styles.avatarBadge}
              title={userWithAvatar?.name || userWithAvatar?.email || 'User'}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={userWithAvatar?.name || 'Avatar'}
                  className={styles.avatarImg}
                />
              ) : (
                displayInitial
              )}
            </span>

            <button
              type="button"
              onClick={onSignOut}
              className={styles.signOutBtn}
            >
              {copy.signOut}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenLogin}
              className={styles.loginBtn}
            >
              {copy.login}
            </button>

            <button
              type="button"
              onClick={onOpenSignup}
              className={styles.signupBtn}
            >
              {copy.signup}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className={styles.utilityBtn}
        >
          {theme === 'dark' ? `☀️ ${copy.light}` : `🌙 ${copy.dark}`}
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className={styles.utilityBtn}
        >
          {language === 'en' ? 'ES' : 'EN'}
        </button>
      </div>

      <div ref={mobileWrapperRef} className={styles.mobileRightBar}>
        {isAuthenticated && (
          <button
            type="button"
            onClick={onOpenPlansModal}
            className={styles.creditsPill}
          >
            <span>⚡ {credits}</span>
          </button>
        )}

        <button
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-label={copy.menuLabel}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`${styles.hamburgerBtn} ${
            isMobileMenuOpen ? styles.hamburgerBtnActive : ''
          }`}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {isMobileMenuOpen && (
          <div className={styles.mobileSheetMenu} role="menu">
            <div className={styles.mobileSummaryCard}>
              <div className={styles.mobileBalanceHeader}>
                <span className={styles.mobileBalanceTitle}>
                  ⚡ {copy.balance}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (workspaceMenu) {
                      workspaceMenu.onOpenUpgrade();
                    } else {
                      onOpenPlansModal();
                    }
                  }}
                  className={styles.mobileUpgradeChip}
                >
                  {copy.upgrade}
                </button>
              </div>

              <div className={styles.mobileBalanceRow}>
                <span>{copy.credits}</span>
                <strong>{credits}</strong>
              </div>

              {workspaceMenu && (
                <div className={styles.mobileWorkspaceBox}>
                  <span className={styles.mobileWorkspaceCaption}>
                    {lang === 'es' ? 'Espacio activo' : 'Current workspace'}
                  </span>
                  <div className={styles.mobileWorkspaceTitle}>
                    {userWithAvatar?.name || 'Cempai Workspace'}
                  </div>
                  <span className={styles.mobileWorkspacePlan}>
                    {workspaceMenu.planLabel}
                  </span>
                </div>
              )}
            </div>

            {workspaceMenu && (
              <div className={styles.mobileMenuGroup}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    workspaceMenu.onSelectSection('studio-lite');
                  }}
                  className={`${styles.mobileListRow} ${
                    workspaceMenu.activeSection === 'studio-lite'
                      ? styles.mobileListRowActive
                      : ''
                  }`}
                >
                  <span>Studio Lite</span>
                  <span className={styles.mobileRowChevron}>›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    workspaceMenu.onSelectSection('dashboard');
                  }}
                  className={`${styles.mobileListRow} ${
                    workspaceMenu.activeSection === 'dashboard'
                      ? styles.mobileListRowActive
                      : ''
                  }`}
                >
                  <span>
                    {lang === 'es' ? 'Panel' : 'Dashboard'} (
                    {workspaceMenu.videosCount})
                  </span>
                  <span className={styles.mobileRowChevron}>›</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    workspaceMenu.onSelectSection('text-to-speech');
                  }}
                  className={`${styles.mobileListRow} ${
                    workspaceMenu.activeSection === 'text-to-speech'
                      ? styles.mobileListRowActive
                      : ''
                  }`}
                >
                  <span>Text to Speech</span>
                  <span className={styles.mobileRowChevron}>›</span>
                </button>

                {workspaceMenu.onBackToLanding && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      workspaceMenu.onBackToLanding?.();
                    }}
                    className={styles.mobileListRow}
                  >
                    <span>{lang === 'es' ? 'Inicio' : 'Home'}</span>
                    <span className={styles.mobileRowChevron}>›</span>
                  </button>
                )}
              </div>
            )}

            <div className={styles.mobileMenuGroup}>
              <button
                type="button"
                onClick={() =>
                  setIsMobileProductsExpanded((prev) => !prev)
                }
                className={styles.mobileListRow}
              >
                <span>{copy.products}</span>
                <span className={styles.mobileRowChevron}>
                  {isMobileProductsExpanded ? '▾' : '›'}
                </span>
              </button>

              {isMobileProductsExpanded && (
                <div className={styles.mobileNestedGroup}>
                  <span className={styles.mobileNestedHeading}>
                    {copy.mainGroup}
                  </span>
                  {MAIN_STUDIO_PRODUCTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleProductClick(item)}
                      className={styles.mobileNestedRow}
                    >
                      {item.name[lang]}
                    </button>
                  ))}

                  <span className={styles.mobileNestedHeading}>
                    {copy.extraGroup}
                  </span>
                  {EXTRA_TOOL_PRODUCTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleProductClick(item)}
                      className={styles.mobileNestedRow}
                    >
                      {item.name[lang]}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSectionClick('plans')}
                className={styles.mobileListRow}
              >
                <span>{copy.plans}</span>
                <span className={styles.mobileRowChevron}>›</span>
              </button>

              <button
                type="button"
                onClick={() => handleSectionClick('pricing')}
                className={styles.mobileListRow}
              >
                <span>{copy.pricing}</span>
                <span className={styles.mobileRowChevron}>›</span>
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleView();
                  }}
                  className={styles.mobileListRow}
                >
                  <span>
                    {activeView === 'landing' ? copy.workspace : copy.landing}
                  </span>
                  <span className={styles.mobileRowChevron}>›</span>
                </button>
              )}
            </div>

            <div className={styles.mobileMenuGroup}>
              <button
                type="button"
                onClick={toggleTheme}
                className={styles.mobileListRow}
              >
                <span>{copy.themeLabel}</span>
                <span className={styles.mobileRowMeta}>
                  {theme === 'dark' ? copy.light : copy.dark} ›
                </span>
              </button>

              <button
                type="button"
                onClick={toggleLanguage}
                className={styles.mobileListRow}
              >
                <span>{copy.languageLabel}</span>
                <span className={styles.mobileRowMeta}>
                  {language === 'en' ? 'ES' : 'EN'} ›
                </span>
              </button>
            </div>

            <div className={styles.mobileMenuGroup}>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (workspaceMenu) {
                      workspaceMenu.onSignOut();
                    } else {
                      onSignOut();
                    }
                  }}
                  className={styles.mobileListRow}
                >
                  <span>{copy.signOut}</span>
                  <span className={styles.mobileRowChevron}>›</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className={styles.mobileListRow}
                  >
                    <span>{copy.login}</span>
                    <span className={styles.mobileRowChevron}>›</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSignup();
                    }}
                    className={`${styles.mobileListRow} ${styles.mobileAccentRow}`}
                  >
                    <span>{copy.signup}</span>
                    <span className={styles.mobileRowChevron}>›</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
