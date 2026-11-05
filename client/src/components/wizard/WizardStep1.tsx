import React from 'react';

// Exportamos explícitamente el tipo con 'export type'
export type WizardData = {
  scriptIdea: string;
  tone: string;
  voiceId?: string;
};


interface Step1Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
}

export default function WizardStep1({ data, onUpdate, onNext }: Step1Props) {
  const tones = [
    { id: 'professional', label: 'Profesional', desc: 'Serio, claro y enfocado en negocios' },
    { id: 'dynamic', label: 'Dinámico', desc: 'Rápido, entretenido y con ritmo alto' },
    { id: 'casual', label: 'Casual', desc: 'Cercano, amigable y conversacional' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.scriptIdea.trim()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between flex-1">
      {/* Sección principal del contenido */}
      <div className="space-y-6 md:space-y-8">
        
        {/* Encabezado de la sección */}
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-2 text-text-main">
            ¿De qué tratará tu video?
          </h1>
          <p className="text-xs md:text-sm text-text-muted leading-relaxed">
            Describe la idea o concepto principal. La IA estructurará el guion optimizado para tu audiencia.
          </p>
        </div>

        {/* Input / Textarea del prompt */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Idea o Guion Inicial
          </label>
          <textarea
            rows={4}
            value={data.scriptIdea}
            onChange={(e) => onUpdate({ scriptIdea: e.target.value })}
            placeholder="Ej. Un video corto explicando las ventajas de nuestra nueva aplicación móvil para emprendedores..."
            className="w-full bg-bg-main border border-border-subtle rounded-xl p-3.5 md:p-4 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm resize-none"
            required
          />
        </div>

        {/* Selector de Tono */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Tono de Comunicación
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tones.map((tone) => {
              const isSelected = data.tone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => onUpdate({ tone: tone.id })}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-bg-surface border-brand-primary ring-1 ring-brand-primary shadow-md shadow-brand-primary/10'
                      : 'bg-bg-main/50 border-border-subtle hover:bg-bg-surface hover:border-text-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold text-text-main">{tone.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-border-subtle'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-snug">{tone.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Acción principal */}
      <div className="pt-6 mt-8 border-t border-border-subtle/60 flex justify-end">
        <button
          type="submit"
          disabled={!data.scriptIdea.trim()}
          className="w-full md:w-auto md:min-w-[200px] bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          Siguiente: Voz y Estilo
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
