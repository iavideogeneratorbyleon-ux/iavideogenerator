import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../landing/LanguageContext';

interface DashboardProps {
  onStartWizard: () => void;
}

export default function Dashboard({ onStartWizard }: DashboardProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();

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
            onClick={onStartWizard}
            className="rounded-xl bg-[#ff6b00] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#e05d00] transition-all"
          >
            {lang === 'en' ? '🚀 Create New Video' : '🚀 Crear Nuevo Video'}
          </button>
        </div>

        {/* Resumen de cuenta / Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e293b] border border-white/10 p-5 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Credits Available' : 'Créditos Disponibles'}
            </span>
            <div className="text-2xl font-black text-[#ff6b00] mt-2 flex items-center gap-2">
              <span>⚡</span> {user?.credits}
            </div>
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
              0
            </div>
          </div>
        </div>

        {/* Sección de Proyectos Recientes */}
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">
            {lang === 'en' ? 'Your Projects' : 'Tus Proyectos'}
          </h2>
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
        </div>

      </div>
    </div>
  );
}
