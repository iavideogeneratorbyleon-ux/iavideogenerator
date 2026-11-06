import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import VideoShowcaseModal, { type VideoShowcaseItem } from './VideoShowcaseModal';
import PricingSection from './PricingSection';

interface LandingPageProps {
  onStartWizard: () => void;
}

export default function LandingPage({ onStartWizard }: LandingPageProps) {
  const { lang, setLang, t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcaseItem | null>(null);

  // Muestra de videos interactivos
  const showcaseVideos: VideoShowcaseItem[] = [
    {
      id: '1',
      title: 'Estrategia de Finanzas Personales',
      format: '9:16',
      videoUrl: '',
      thumbnail: '',
      prompt: 'Video corto explicando cómo ahorrar un 20% de los ingresos mensuales con la regla 50/30/20',
      voice: 'Carlos (Narrativo)',
      tone: 'Profesional',
      style: 'Cinematográfico',
    },
    {
      id: '2',
      title: 'Lanzamiento de Producto Tech',
      format: '16:9',
      videoUrl: '',
      thumbnail: '',
      prompt: 'Anuncio dinámico promocionando audífonos inalámbricos de alta definición',
      voice: 'Sofía (Comercial)',
      tone: 'Dinámico',
      style: 'Render 3D',
    },
    {
      id: '3',
      title: 'Consejos de Estilo de Vida',
      format: '9:16',
      videoUrl: '',
      thumbnail: '',
      prompt: 'Rutina matutina de 5 minutos para maximizar la productividad diaria',
      voice: 'Alex (Joven / Casual)',
      tone: 'Casual',
      style: 'Vector Minimalista',
    },
  ];

  // Reviews simuladas
  const reviews = [
    {
      name: 'Sarah Jenkins',
      role: 'Content Creator (US)',
      avatar: '👩‍💻',
      text: 'Cempasúchil completely changed how I produce Reels. The ElevenLabs integration is seamlessly voice-synced!',
      rating: 5,
    },
    {
      name: 'Miguel Ángel R.',
      role: 'Agencia de Marketing',
      avatar: '👨‍💼',
      text: 'Poder elegir entre pago por video o suscripción nos da una flexibilidad increíble para campañas con clientes.',
      rating: 5,
    },
    {
      name: 'David K.',
      role: 'Tech YouTuber',
      avatar: '🚀',
      text: 'The 16:9 horizontal format with AI rendering saved me days of editing for my tutorials.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans selection:bg-brand-primary selection:text-white">
      
      {/* Navbar con Selector de Idioma */}
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
          
          <div className="flex items-center gap-4">
            {/* Toggle de Idioma EN / ES */}
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-subtle hover:border-brand-primary/50 text-text-muted hover:text-text-main transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>🌐</span>
              <span className="uppercase">{lang}</span>
            </button>

            <button
              onClick={onStartWizard}
              className="bg-brand-primary hover:bg-brand-hover text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
            >
              {t('nav_create')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 px-3.5 py-1.5 rounded-full text-brand-primary text-xs font-semibold">
            <span>✨</span> {t('hero_badge')}
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text-main leading-tight">
            {t('hero_title_1')} <br />
            <span className="text-brand-primary">{t('hero_title_2')}</span>
          </h1>

          <p className="text-sm md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('hero_sub')}
          </p>

          <div className="pt-4">
            <button
              onClick={onStartWizard}
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-hover text-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-brand-primary/25 text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer mx-auto"
            >
              {t('hero_cta')} →
            </button>
          </div>
        </div>
      </section>

      {/* Galería Showcase Interactiva */}
      <section className="py-20 border-t border-border-subtle/40 bg-bg-surface/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main">
              {t('showcase_title')}
            </h2>
            <p className="text-xs md:text-sm text-text-muted max-w-lg mx-auto">
              {t('showcase_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-2xl p-4 cursor-pointer transition-all shadow-md hover:shadow-xl hover:shadow-brand-primary/5 flex flex-col justify-between"
              >
                <div className="aspect-video bg-bg-main rounded-xl border border-border-subtle/60 flex items-center justify-center relative overflow-hidden group-hover:border-brand-primary/50 transition-colors">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🎬</span>
                  <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-brand-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                      Ver Receta IA
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-main group-hover:text-brand-primary transition-colors">
                      {video.title}
                    </span>
                    <span className="text-[10px] bg-bg-main px-2 py-0.5 rounded border border-border-subtle text-text-muted font-mono">
                      {video.format}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-2">
                    {video.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Reviews (Carrusel / Grid) */}
      <section className="py-20 border-t border-border-subtle/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main">
              {t('reviews_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, index) => (
              <div key={index} className="bg-bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rev.avatar}</span>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">{rev.name}</h4>
                    <p className="text-[10px] text-text-muted">{rev.role}</p>
                  </div>
                </div>
                <div className="flex text-brand-primary text-xs">
                  {'★'.repeat(rev.rating)}
                </div>
                <p className="text-xs text-text-muted leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Precios */}
      <PricingSection onSelectPlan={onStartWizard} />

      {/* Footer */}
      <footer className="border-t border-border-subtle/40 py-10 text-center text-xs text-text-muted">
        <p>© 2026 Cempasúchil.ai • All rights reserved.</p>
      </footer>

      {/* Modal de Receta en Video */}
      <VideoShowcaseModal
        item={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onUseRecipe={() => {
          setSelectedVideo(null);
          onStartWizard();
        }}
      />

    </div>
  );
}
