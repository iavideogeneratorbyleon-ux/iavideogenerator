import { useLanguage } from './LanguageContext';

interface PricingProps {
  onSelectPlan: () => void;
}

export default function PricingSection({ onSelectPlan }: PricingProps) {
  const { t } = useLanguage();

  return (
    <section className="py-20 border-t border-border-subtle/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-text-main">
            {t('pricing_title')}
          </h2>
          <p className="text-xs md:text-sm text-text-muted max-w-xl mx-auto">
            {t('pricing_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Opción 1: Single Pass / Pay-Per-Video */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all">
            <div className="space-y-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Sin Suscripción</span>
              <h3 className="text-xl font-bold text-text-main">{t('pay_per_video')}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-text-main">$4.99</span>
                <span className="text-xs text-text-muted">/ video</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('pay_per_video_desc')}
              </p>
              <ul className="text-xs space-y-2 text-text-main pt-2">
                <li className="flex items-center gap-2">✓ 1 Video HD completo</li>
                <li className="flex items-center gap-2">✓ Voces ElevenLabs incluidas</li>
                <li className="flex items-center gap-2">✓ Exportación sin marca de agua</li>
              </ul>
            </div>
            <button
              onClick={onSelectPlan}
              className="mt-6 w-full bg-bg-main border border-border-subtle hover:border-brand-primary text-text-main font-semibold py-3 rounded-xl transition-all text-xs cursor-pointer"
            >
              Comprar 1 Video
            </button>
          </div>

          {/* Opción 2: Plan Pro Creadores (Destacado) */}
          <div className="bg-bg-surface border-2 border-brand-primary rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-brand-primary/10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
              Más Popular
            </div>
            <div className="space-y-4 mt-2">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Suscripción Mensual</span>
              <h3 className="text-xl font-bold text-text-main">Pro Creator</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-text-main">$29</span>
                <span className="text-xs text-text-muted">/ mes</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Para creadores y marcas que publican contenido semanalmente en TikTok y Reels.
              </p>
              <ul className="text-xs space-y-2 text-text-main pt-2">
                <li className="flex items-center gap-2">✓ 15 Videos HD al mes</li>
                <li className="flex items-center gap-2">✓ Soporte prioritario ElevenLabs</li>
                <li className="flex items-center gap-2">✓ Renderizado ultra rápido</li>
                <li className="flex items-center gap-2">✓ Acceso a todos los estilos visuales</li>
              </ul>
            </div>
            <button
              onClick={onSelectPlan}
              className="mt-6 w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-primary/20 transition-all text-xs cursor-pointer"
            >
              Probar Plan Pro
            </button>
          </div>

          {/* Opción 3: Créditos Gratis de Prueba */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all">
            <div className="space-y-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Prueba Gratuita</span>
              <h3 className="text-xl font-bold text-text-main">Free Pass</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-text-main">$0</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {t('free_credits')}
              </p>
              <ul className="text-xs space-y-2 text-text-main pt-2">
                <li className="flex items-center gap-2">✓ 1 Crédito de prueba gratis</li>
                <li className="flex items-center gap-2">✓ Acceso a todas las herramientas</li>
                <li className="flex items-center gap-2">✓ Sin tarjeta de crédito requerida</li>
              </ul>
            </div>
            <button
              onClick={onSelectPlan}
              className="mt-6 w-full bg-bg-main border border-border-subtle hover:border-brand-primary text-text-main font-semibold py-3 rounded-xl transition-all text-xs cursor-pointer"
            >
              Comenzar Gratis
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
