import React, { useState } from 'react';
import type { WizardData } from './WizardStep1';

interface Step4Props {
  data: WizardData;
  onPrev: () => void;
  toneLabels: Record<string, string>;
  voiceLabels: Record<string, string>;
  styleLabels: Record<string, string>;
}

export default function WizardStep4({ data, onPrev, toneLabels, voiceLabels, styleLabels }: Step4Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulamos un proceso de renderizado con IA de 3 segundos
    setTimeout(() => {
      setIsGenerating(false);
      setIsCompleted(true);
    }, 3000);
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-brand-primary/20 border border-brand-primary/40 rounded-full flex items-center justify-center text-brand-primary text-2xl shadow-xl shadow-brand-primary/10">
          ✨
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-main">
            ¡Tu video se está generando!
          </h1>
          <p className="text-xs md:text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
            El motor de Cempasúchil IA ha comenzado el renderizado. Te avisaremos en cuanto esté listo para descargar o compartir.
          </p>
        </div>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-brand-primary hover:bg-brand-hover text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-brand-primary/20 text-sm cursor-pointer"
          >
            Crear otro video
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between flex-1">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-2 text-text-main">
            Resumen de tu proyecto
          </h1>
          <p className="text-xs md:text-sm text-text-muted leading-relaxed">
            Revisa que todos los parámetros sean correctos antes de activar la generación con Inteligencia Artificial.
          </p>
        </div>

        {/* Tarjeta de Resumen Detallado */}
        <div className="bg-bg-main/70 border border-border-subtle rounded-xl p-5 space-y-4">
          
          <div className="space-y-1 pb-3 border-b border-border-subtle/50">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Idea / Concepto</span>
            <p className="text-xs md:text-sm text-text-main leading-relaxed">
              {data.scriptIdea || 'Sin definir'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border-subtle/50">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Tono</span>
              <p className="text-xs font-bold text-brand-primary mt-0.5">
                {toneLabels[data.tone] || data.tone}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Formato (Aspect Ratio)</span>
              <p className="text-xs font-bold text-brand-primary mt-0.5">
                {data.aspectRatio || '9:16'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Locutor ElevenLabs</span>
              <p className="text-xs font-bold text-brand-primary mt-0.5">
                {data.voiceId ? voiceLabels[data.voiceId] : 'No seleccionado'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Estilo Visual</span>
              <p className="text-xs font-bold text-brand-primary mt-0.5">
                {data.visualStyle ? styleLabels[data.visualStyle] : 'Sin definir'}
              </p>
            </div>
          </div>

        </div>

        {/* Aviso de Créditos */}
        <div className="flex items-center gap-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4">
          <span className="text-lg">⚡</span>
          <div className="text-xs">
            <p className="font-bold text-text-main">Costo estimado: 1 Crédito de IA</p>
            <p className="text-text-muted">El proceso tomará aproximadamente entre 30 y 60 segundos.</p>
          </div>
        </div>
      </div>

      {/* Botones de Navegación y Generación */}
      <div className="pt-6 mt-8 border-t border-border-subtle/60 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={isGenerating}
          className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors px-4 py-3 cursor-pointer disabled:opacity-50"
        >
          ← Regresar
        </button>
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="w-full md:w-auto md:min-w-[220px] bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando Video...
            </>
          ) : (
            <>
              🚀 Generar Video con IA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
