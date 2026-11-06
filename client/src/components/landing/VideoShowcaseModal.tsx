
export interface VideoShowcaseItem {
  id: string;
  title: string;
  format: '9:16' | '16:9';
  videoUrl: string;
  thumbnail: string;
  prompt: string;
  voice: string;
  tone: string;
  style: string;
}

interface ModalProps {
  item: VideoShowcaseItem | null;
  onClose: () => void;
  onUseRecipe: () => void;
}

export default function VideoShowcaseModal({ item, onClose, onUseRecipe }: ModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-surface border border-border-subtle rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-bg-main/80 text-text-muted hover:text-white flex items-center justify-center border border-border-subtle cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* Lado Izquierdo: Video / Player */}
        <div className="md:w-1/2 bg-black flex items-center justify-center p-4 min-h-[300px]">
          <div className={`relative w-full ${item.format === '9:16' ? 'max-w-[240px] aspect-[9/16]' : 'aspect-video'} bg-bg-main rounded-xl overflow-hidden border border-border-subtle flex items-center justify-center`}>
            <span className="text-xs text-text-muted">▶ Preview: {item.title}</span>
          </div>
        </div>

        {/* Lado Derecho: Receta de Creación IA */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                Receta del Video
              </span>
              <h3 className="text-xl font-extrabold text-text-main mt-2">{item.title}</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-bg-main/60 p-3 rounded-xl border border-border-subtle space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-semibold">Prompt Inicial:</span>
                <p className="text-text-main italic">"{item.prompt}"</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg-main/60 p-2.5 rounded-xl border border-border-subtle">
                  <span className="text-[10px] text-text-muted uppercase font-semibold block">Voz ElevenLabs</span>
                  <span className="font-bold text-brand-primary">{item.voice}</span>
                </div>
                <div className="bg-bg-main/60 p-2.5 rounded-xl border border-border-subtle">
                  <span className="text-[10px] text-text-muted uppercase font-semibold block">Formato</span>
                  <span className="font-bold text-brand-primary">{item.format}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg-main/60 p-2.5 rounded-xl border border-border-subtle">
                  <span className="text-[10px] text-text-muted uppercase font-semibold block">Tono</span>
                  <span className="font-bold text-text-main">{item.tone}</span>
                </div>
                <div className="bg-bg-main/60 p-2.5 rounded-xl border border-border-subtle">
                  <span className="text-[10px] text-text-muted uppercase font-semibold block">Estilo Visual</span>
                  <span className="font-bold text-text-main">{item.style}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onUseRecipe}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-primary/20 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            Usar este estilo en el Wizard →
          </button>
        </div>

      </div>
    </div>
  );
}
