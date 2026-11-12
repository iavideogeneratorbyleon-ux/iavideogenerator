import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../landing/LanguageContext';
import UpgradeModal from '../upgrate-modal/UpgrateModal'; // <--- Importamos el componente modal creado

interface DashboardProps {
  onStartWizard: () => void;
}

interface VideoItem {
  _id: string;
  title: string;
  mode: string;
  aspectRatio: string;
  createdAt: string;
}

export default function Dashboard({ onStartWizard }: DashboardProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estado para controlar la visibilidad del UpgradeModal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:3030/api/videos/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.videos)) {
            setVideos(data.videos);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error al cargar videos del usuario:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Validamos si el usuario tiene menos de 30 créditos (el costo de un video Lite)
  const currentCredits = user?.credits ?? 0;
  const needsMoreCredits = currentCredits < 30;

  // Función manejadora para el botón de crear video con validación de créditos
  const handleCreateVideoClick = () => {
    if (needsMoreCredits) {
      // En lugar de un alert simple, abrimos el UpgradeModal con las opciones de pago
      setIsUpgradeModalOpen(true);
      return;
    }
    onStartWizard();
  };

  const handleSelectPlan = (planName: string) => {
    alert(
      lang === 'en'
        ? `Selected plan: ${planName}. (Here you will integrate Stripe/PayPal)`
        : `Plan seleccionado: ${planName}. (Aquí integrarás Stripe/PayPal)`
    );
    setIsUpgradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Bienvenida personalizada */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b]/50 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {lang === 'en' ? `Welcome back, ${user?.name}!` : `¡Bienvenido de nuevo, ${user?.name}!`} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {lang === 'en' 
                ? 'Ready to create your next viral video with AI?' 
                : '¿Listo para crear tu próximo video viral con IA?'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateVideoClick}
            className="rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#e05d00] transition-all"
          >
            {lang === 'en' ? '🚀 Create New Video' : '🚀 Crear Nuevo Video'}
          </button>
        </div>

        {/* Resumen de cuenta / Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e293b] border border-white/10 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'en' ? 'Credits Available' : 'Créditos Disponibles'}
              </span>
              <div className="text-2xl font-black text-[#ff6b00] mt-2 flex items-center gap-2">
                <span>⚡</span> {currentCredits}
              </div>
            </div>
            {needsMoreCredits && (
              <span className="text-[11px] text-amber-400 mt-3 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                {lang === 'en' ? 'Need 30 credits to generate a new video' : 'Se necesitan 30 créditos para generar un nuevo video'}
              </span>
            )}
          </div>

          <div className="bg-[#1e293b] border border-white/10 p-5 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Current Plan' : 'Plan Actual'}
            </span>
            <div className="text-2xl font-black text-white mt-2 uppercase">
              {user?.plan || 'Free'}
            </div>
          </div>

          <div className="bg-[#1e293b] border border-white/10 p-5 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Generated Videos' : 'Videos Generados'}
            </span>
            <div className="text-2xl font-black text-white mt-2">
              {videos.length}
            </div>
          </div>
        </div>

        {/* Sección de Proyectos Recientes */}
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">
            {lang === 'en' ? 'Your Projects' : 'Tus Proyectos'}
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {lang === 'en' ? 'Loading projects...' : 'Cargando proyectos...'}
            </div>
          ) : videos.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🎬</span>
              <p className="text-sm font-semibold text-slate-300">
                {lang === 'en' ? 'No videos generated yet' : 'Aún no has generado ningún video'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                {lang === 'en' 
                  ? 'Start your first idea using our video generation wizard.' 
                  : 'Comienza tu primera idea usando nuestro asistente de generación.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div 
                  key={video._id} 
                  className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#ff6b00]/20 text-[#ff6b00] text-xs font-bold px-2.5 py-1 rounded-md">
                        {video.aspectRatio || '9:16'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-base line-clamp-2">
                      {video.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(lang === 'en' ? 'Downloading video...' : 'Descargando video...')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    📥 {lang === 'en' ? 'Download' : 'Descargar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Componente UpgradeModal integrado */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
}
