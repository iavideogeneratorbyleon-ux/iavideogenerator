import type { WizardData } from './WizardStep1';

interface Step2Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep2({ data, onUpdate, onNext, onPrev }: Step2Props) {
  // Voces simuladas inspiradas en ElevenLabs
  const voices = [
    { id: 'carlos', name: 'Carlos (Narrativo)', accent: 'Español (Latino)', gender: 'Masculino', desc: 'Profundo, cálido y excelente para documentales o explicaciones corporativas.' },
    { id: 'sofia', name: 'Sofía (Comercial)', accent: 'Español (España)', gender: 'Femenino', desc: 'Dinámica, clara y persuasiva, ideal для anuncios y redes sociales.' },
    { id: 'alex', name: 'Alex (Joven / Casual)', accent: 'Español (Neutro)', gender: 'Masculino', desc: 'Fresco, cercano y energético para contenido de estilo lifestyle.' },
  ];

  const handleSelectVoice = (voiceId: string) => {
    onUpdate({ voiceId });
  };

  return (
    <div className="flex flex-col justify-between flex-1">
      {/* Sección principal */}
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-2 text-text-main">
            Elige la voz de tu video
          </h1>
          <p className="text-xs md:text-sm text-text-muted leading-relaxed">
            Selecciona la locución de IA impulsada por ElevenLabs que mejor se adapte a la personalidad de tu marca.
          </p>
        </div>

        {/* Listado de Voces */}
        <div className="space-y-3">
          {voices.map((voice) => {
            const isSelected = data.voiceId === voice.id;
            return (
              <div
                key={voice.id}
                onClick={() => handleSelectVoice(voice.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-bg-surface border-brand-primary ring-1 ring-brand-primary shadow-md shadow-brand-primary/10'
                    : 'bg-bg-main/50 border-border-subtle hover:bg-bg-surface hover:border-text-muted/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-main">{voice.name}</span>
                    <span className="text-[10px] bg-bg-surface text-text-muted px-2 py-0.5 rounded-full border border-border-subtle">
                      {voice.accent}
                    </span>
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-brand-primary bg-brand-primary' : 'border-border-subtle'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-snug">{voice.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones de navegación inferiores */}
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
          disabled={!data.voiceId}
          onClick={onNext}
          className="w-full md:w-auto md:min-w-[180px] bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          Siguiente: Estilo Visual
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
