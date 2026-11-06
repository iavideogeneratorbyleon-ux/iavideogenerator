interface LandingPageProps {
  onStartWizard: () => void;
}

export default function LandingPage({ onStartWizard }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans selection:bg-brand-primary selection:text-white">
      
      {/* Navbar Superior */}
      <header className="border-b border-border-subtle/40 bg-bg-main/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 text-white font-bold text-lg">
              C
            </div>
            <span className="font-extrabold text-lg tracking-tight text-text-main">
              Cempasúchil<span className="text-brand-primary">.ai</span>
            </span>
          </div>
          
          <button
            onClick={onStartWizard}
            className="bg-brand-primary hover:bg-brand-hover text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
          >
            Crear Video Gratis
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          
          {/* Etiqueta de novedad */}
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 px-3.5 py-1.5 rounded-full text-brand-primary text-xs font-semibold">
            <span>✨</span> Impulsado por IA de última generación
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text-main leading-tight">
            Crea videos profesionales <br />
            <span className="text-brand-primary">en cuestión de minutos</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-sm md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Transforma cualquier idea en videos optimizados para Reels, TikTok y YouTube con locuciones de ElevenLabs y renderizado inteligente sin complicaciones.
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartWizard}
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-hover text-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-brand-primary/25 text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              Comenzar a Crear Ahora
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* Sección de Características (Features) */}
      <section className="py-20 border-t border-border-subtle/40 bg-bg-surface/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main">
              Todo lo que necesitas para destacar
            </h2>
            <p className="text-xs md:text-sm text-text-muted">
              Una suite completa de herramientas creativas potenciadas por inteligencia artificial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4 hover:border-brand-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-xl">
                🎙️
              </div>
              <h3 className="text-base font-bold text-text-main">Voces Ultra Realistas</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Integra locuciones naturales impulsadas por ElevenLabs adaptadas al tono exacto de tu marca y audiencia.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4 hover:border-brand-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-xl">
                📱
              </div>
              <h3 className="text-base font-bold text-text-main">Formatos Multiplataforma</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Exporta instantáneamente en formato vertical (9:16) para TikTok y Reels, u horizontal (16:9) para YouTube.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4 hover:border-brand-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-xl">
                ⚡
              </div>
              <h3 className="text-base font-bold text-text-main">Generación en Tiempo Real</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Visualiza los cambios de tu proyecto en el panel lateral interactivo y obtén resultados listos para publicar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle/40 py-10 text-center text-xs text-text-muted">
        <p>© 2026 Cempasúchil.ai • Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}
