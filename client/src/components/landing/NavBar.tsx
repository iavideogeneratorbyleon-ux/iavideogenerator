import { useLanguage } from "./LanguageContext";
import Logo from "../brand/Logo";

interface NavbarProps {
  onStartWizard: () => void;
}

export default function Navbar({ onStartWizard }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bg-surface bg-bg-main/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 md:py-4">
        {/* Contenedor del Logo */}
        <div className="flex-shrink-0">
          <Logo size="md" />
        </div>

        {/* Acciones de la Navbar (Idioma y Botón Principal) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Botón de Selector de Idioma */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-bg-surface border border-transparent px-2.5 py-1.5 font-sans text-xs font-semibold text-text-main uppercase transition-all hover:bg-bg-hover sm:px-3.5 sm:py-2 sm:text-sm"
            aria-label="Change language"
          >
            {/* Cambia la bandera dinámicamente según el idioma actual */}
            <span className="text-sm sm:text-base">
              {lang === "en" ? "🇺🇸" : "🇲🇽"}
            </span>
            <span>{lang}</span>
          </button>

          {/* Botón de Llamado a la Acción (CTA) */}
          <button
            type="button"
            onClick={onStartWizard}
            className="whitespace-nowrap rounded-lg bg-brand-primary px-3.5 py-1.5 font-sans text-xs font-bold text-text-main shadow-md transition-all hover:bg-brand-hover active:scale-95 sm:px-5 sm:py-2 sm:text-sm"
          >
            {t("nav_create")}
          </button>
        </div>
      </div>
    </header>
  );
}
