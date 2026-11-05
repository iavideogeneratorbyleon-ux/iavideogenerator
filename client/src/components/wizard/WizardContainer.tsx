import { useState } from 'react';
import WizardStep1, { type WizardData } from './WizardStep1';
import WizardStep2 from './WizardStep2';

export default function WizardContainer() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<WizardData>({
    scriptIdea: '',
    tone: 'professional',
    voiceId: '',
  });

  const updateFormData = (fields: Partial<WizardData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const toneLabels: Record<string, string> = {
    professional: 'Profesional',
    dynamic: 'Dinámico',
    casual: 'Casual',
  };

  const voiceLabels: Record<string, string> = {
    carlos: 'Carlos (Narrativo)',
    sofia: 'Sofía (Comercial)',
    alex: 'Alex (Joven / Casual)',
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-5xl md:bg-bg-surface md:border md:border-border-subtle md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* COLUMNA IZQUIERDA: Wizard Steps */}
        <div className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col justify-between">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="text-xs text-text-muted hover:text-brand-primary transition-colors flex items-center gap-1 cursor-pointer mr-2"
                  >
                    ← Atrás
                  </button>
                )}
                <span className="text-xs font-bold tracking-wider text-brand-primary uppercase">
                  Paso {currentStep} de 4
                </span>
              </div>
              <span className="text-xs text-text-muted font-medium">
                {currentStep * 25}% Completado
              </span>
            </div>

            <div className="w-full bg-bg-main h-2 rounded-full overflow-hidden border border-border-subtle/30">
              <div
                className="bg-brand-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${currentStep * 25}%` }}
              />
            </div>
          </div>

          {currentStep === 1 && (
            <WizardStep1
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <WizardStep2
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {currentStep >= 3 && (
            <div className="py-12 text-center text-text-muted flex-1 flex flex-col items-center justify-center space-y-4">
              <p className="text-lg font-semibold text-text-main">Paso {currentStep}: Próximamente</p>
              <button
                onClick={prevStep}
                className="bg-bg-main border border-border-subtle text-text-main px-4 py-2 rounded-xl text-xs hover:border-brand-primary transition-colors cursor-pointer"
              >
                Volver atrás
              </button>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Panel Lateral de Resumen en Vivo */}
        <div className="hidden md:flex md:w-80 lg:w-96 bg-bg-main/60 border-l border-border-subtle p-6 lg:p-8 flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full border border-brand-primary/20">
                Vista Previa en Vivo
              </span>
              <h2 className="text-lg font-bold text-text-main mt-3">Tu Proyecto</h2>
              <p className="text-xs text-text-muted">Resumen de los parámetros de tu video.</p>
            </div>

            {/* Resumen Idea */}
            <div className="bg-bg-surface/80 border border-border-subtle rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Concepto</span>
              <p className="text-xs text-text-main line-clamp-3 leading-relaxed">
                {formData.scriptIdea ? formData.scriptIdea : <span className="italic text-text-muted">Sin definir...</span>}
              </p>
            </div>

            {/* Resumen Tono */}
            <div className="bg-bg-surface/80 border border-border-subtle rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Tono</span>
              <p className="text-xs font-bold text-brand-primary capitalize">
                {toneLabels[formData.tone] || formData.tone}
              </p>
            </div>

            {/* Resumen Voz */}
            <div className="bg-bg-surface/80 border border-border-subtle rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Locutor ElevenLabs</span>
              <p className="text-xs font-bold text-brand-primary">
                {formData.voiceId ? voiceLabels[formData.voiceId] : <span className="italic text-text-muted font-normal">No seleccionada</span>}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-subtle/40 text-center">
            <p className="text-[10px] text-text-muted">
              Motor de IA Cempasúchil • Paso {currentStep} de 4
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
