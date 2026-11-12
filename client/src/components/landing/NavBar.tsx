import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { useAuth } from '../auth/AuthContext';
import Logo from '../brand/Logo';

interface NavbarProps {
  onStartWizard: () => void;
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
  onGoHome?: () => void;
}

export default function Navbar({ onStartWizard, onOpenAuthModal, onGoHome }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Referencia para detectar clics fuera del navbar
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDropdownOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWizardClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDropdownOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    onStartWizard();
  };

  const handleAuthClick = (mode: 'login' | 'signup', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMobileMenuOpen(false);
    if (onOpenAuthModal) onOpenAuthModal(mode);
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 w-full bg-[#0b0f19] border-b border-white/10 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 md:py-4 box-border">
        
        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
          <Logo size="md" />
        </div>

        {/* MENÚ CENTRAL: Productos y Precios (Solo Escritorio) */}
        <nav className="hidden md:flex items-center gap-6">
          <div 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button 
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Products ▾' : 'Productos ▾'}
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#1e293b] border border-white/10 p-2 shadow-2xl z-50 flex flex-col gap-1">
                <div 
                  onClick={handleWizardClick}
                  className="p-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">
                      {lang === 'en' ? '💡 Idea / Script to Video' : '💡 Idea / Guion a Video'}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff6b00]/20 text-[#ff6b00]">
                      {lang === 'en' ? 'Active' : 'Activo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {lang === 'en' ? 'Create reels & shorts from text or ideas.' : 'Crea reels y shorts desde texto o ideas.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg opacity-50 cursor-default">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">
                      {lang === 'en' ? '🔗 URL / Article to Video' : '🔗 URL / Artículo a Video'}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-400">
                      {lang === 'en' ? 'Soon' : 'Pronto'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {lang === 'en' ? 'Turn blogs into engaging explainers.' : 'Convierte blogs en videos explicativos.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {lang === 'en' ? 'Pricing' : 'Precios'}
          </a>
        </nav>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Idioma */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLang(lang === "en" ? "es" : "en"); }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#1e293b] px-2.5 py-1.5 text-xs font-semibold text-white uppercase hover:bg-slate-700 transition-all sm:px-3 sm:py-2 sm:text-sm"
          >
            <span>{lang === "en" ? "🇺🇸" : "🇲🇽"}</span>
            <span>{lang}</span>
          </button>

          {/* ESTADO SI EL USUARIO ESTÁ LOGUEADO (Escritorio) */}
          {isAuthenticated && user ? (
            <div className="relative flex items-center gap-3">
              {/* Badge de Créditos */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-3 py-1.5 rounded-lg text-xs font-bold text-[#ff6b00]">
                <span>⚡</span>
                <span>{user.credits} {lang === 'en' ? 'credits' : 'créditos'}</span>
              </div>

              {/* Avatar y Menú de Perfil */}
              <div 
                className="relative py-1"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-[#ff6b00] text-white font-bold flex items-center justify-center text-sm shadow-md hover:opacity-90 transition-opacity"
                >
                  {user.name.charAt(0)}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50">
                    <div className="w-56 rounded-xl bg-[#1e293b] border border-white/10 p-2 shadow-2xl flex flex-col gap-1">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      <button 
                        type="button"
                        onClick={handleWizardClick} 
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        {lang === 'en' ? '🎬 My Projects' : '🎬 Mis Proyectos'}
                      </button>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserMenuOpen(false);
                          logout();
                        }} 
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        {lang === 'en' ? 'Log Out' : 'Cerrar Sesión'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ESTADO SI EL USUARIO NO ESTÁ LOGUEADO (Escritorio) */
            <>
              <button
                type="button"
                onClick={(e) => handleAuthClick('login', e)}
                className="hidden md:inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors sm:text-sm"
              >
                {lang === 'en' ? 'Log In' : 'Iniciar Sesión'}
              </button>

              <button
                type="button"
                onClick={(e) => handleAuthClick('signup', e)}
                className="hidden md:inline-flex rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors sm:text-sm"
              >
                {lang === 'en' ? 'Sign Up' : 'Registrarse'}
              </button>
            </>
          )}

          {/* CTA Crear Video (Solo visible si NO está logueado) */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={handleWizardClick}
              className="hidden md:inline-flex whitespace-nowrap rounded-lg bg-[#ff6b00] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[#e05d00] active:scale-95 transition-all"
            >
              {t("nav_create") || (lang === 'en' ? 'Create Video' : 'Crear Video')}
            </button>
          )}

          {/* Botón Hamburguesa (SOLO MÓVIL) */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
            className="md:hidden inline-flex items-center justify-center rounded-lg bg-[#1e293b] p-2 text-white hover:bg-slate-700 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="text-base leading-none">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0b0f19] border-b border-white/10 p-5 shadow-2xl flex flex-col gap-3 z-50 box-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b00]">
            {lang === 'en' ? 'Products & Solutions' : 'Productos y Soluciones'}
          </span>
          
          <div 
            onClick={handleWizardClick}
            className="text-sm font-bold text-[#ff6b00] py-2 border-b border-white/5 cursor-pointer"
          >
            {lang === 'en' ? '💡 Idea / Script to Video (Active)' : '💡 Idea / Guion a Video (Activo)'}
          </div>

          <a 
            href="#pricing" 
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }} 
            className="text-sm font-medium text-slate-200 py-2 border-b border-white/5"
          >
            {lang === 'en' ? '🏷️ Pricing Plans' : '🏷️ Planes y Precios'}
          </a>

          {/* CTA Crear Video Móvil (Solo visible si NO está logueado) */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={handleWizardClick}
              className="w-full rounded-lg bg-[#ff6b00] py-2.5 text-xs font-bold text-white shadow-md my-1"
            >
              {lang === 'en' ? '🚀 Create Video Now' : '🚀 Crear Video Ahora'}
            </button>
          )}

          {/* Estado de Autenticación en Menú Móvil */}
          {!isAuthenticated ? (
            <div className="flex gap-3 pt-3 border-t border-white/10 mt-1">
              <button
                type="button"
                onClick={(e) => handleAuthClick('login', e)}
                className="flex-1 rounded-lg bg-[#1e293b] py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                {lang === 'en' ? 'Log In' : 'Iniciar Sesión'}
              </button>
              <button
                type="button"
                onClick={(e) => handleAuthClick('signup', e)}
                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                {lang === 'en' ? 'Sign Up' : 'Registrarse'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3 border-t border-white/10 mt-1">
              <div className="flex items-center justify-between bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-3 py-2 rounded-lg text-xs font-bold text-[#ff6b00]">
                <span>⚡ {lang === 'en' ? 'Available Credits' : 'Créditos Disponibles'}</span>
                <span>{user?.credits}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-lg bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-semibold text-red-400"
              >
                {lang === 'en' ? 'Log Out' : 'Cerrar Sesión'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
