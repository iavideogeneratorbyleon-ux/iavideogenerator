import type { WizardData } from './WizardStep1';

interface Step3Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep3({ data, onUpdate, onNext, onPrev }: Step3Props) {
  const aspectRatios = [
    { id: '9:16', label: 'Vertical (9:16)', tag: 'Reels / TikTok / Shorts', icon: '📱' },
    { id: '16:9', label: 'Horizontal (16:9)', tag: 'YouTube / TV', icon: '🖥️' },
    { id: '1:1', label: 'Cuadrado (1:1)', tag: 'Feed Instagram / LinkedIn', icon: '⏹️' },
  ];

  const visualStyles = [
    { id: 'cinematic', label: 'Cinematográfico', desc: 'Realismo alto, iluminación dramática' },
    { id: '3d-render', label: 'Render 3D', desc: 'Estilo animación 3D moderno y colorido' },
    { id: 'vector', label: 'Vector Minimalista', desc: 'Líneas limpias y estilo gráfico corporativo' },
  ];

  return (
    <div className="flex flex-col justify-between flex-1">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-2 text-text-main">
            Estilo Visual y Formato
          </h1>
          <p className="text-xs md:text-sm text-text-muted leading-relaxed">
            Define la proporción del video según la plataforma donde lo vas a publicar y su apariencia artística.
          </p>
        </div>

        {/* Selector de Aspect Ratio */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Orientación del Video
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aspectRatios.map((ratio) => {
              const isSelected = data.aspectRatio === ratio.id;
              return (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => onUpdate({ aspectRatio: ratio.id })}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-bg-surface border-brand-primary ring-1 ring-brand-primary shadow-md shadow-brand-primary/10'
                      : 'bg-bg-main/50 border-border-subtle hover:bg-bg-surface hover:border-text-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">{ratio.icon}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-border-subtle'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{ratio.label}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{ratio.tag}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de Estilo Visual */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Estilo de Renderizado IA
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {visualStyles.map((style) => {
              const isSelected = data.visualStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onUpdate({ visualStyle: style.id })}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-bg-surface border-brand-primary ring-1 ring-brand-primary shadow-md shadow-brand-primary/10'
                      : 'bg-bg-main/50 border-border-subtle hover:bg-bg-surface hover:border-text-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold text-text-main">{style.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-border-subtle'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-snug">{style.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botones de Navegación */}
      <div className="pt-6 mt-8 border-t border-border-subtle/60 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors px-4 py-3 cursor-pointer"
        >
          ← Regresar
        </button>
        <button
          type="button"
          disabled={!data.aspectRatio || !data.visualStyle}
          onClick={onNext}
          className="w-full md:w-auto md:min-w-[180px] bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          Siguiente: Resumen Final
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
