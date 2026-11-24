import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { type AspectRatio, type PresetKey } from '../config/presets';
import { type VisualStyleKey } from '../config/visualStyles';

export type StudioLiteInputMode = 'idea' | 'script';
export type RenderJobStatus = 'idle' | 'generating' | 'completed' | 'error';

export interface StudioLiteDraft {
  mode: StudioLiteInputMode;
  preset: PresetKey;
  visualStyle: VisualStyleKey;
  aspectRatio: AspectRatio;
  voiceId: string;
  rawContent: string;
  selectedHookId?: string;
  selectedCtaId?: string;
  targetDurationSeconds: number;
  subtitlesEnabled: boolean;
}

interface StudioLiteContextValue {
  draft: StudioLiteDraft;
  updateDraft: (patch: Partial<StudioLiteDraft>) => void;
  resetDraft: () => void;
  jobId: string | null;
  setJobId: (id: string | null) => void;
  status: RenderJobStatus;
  setStatus: (status: RenderJobStatus) => void;
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
}

const DEFAULT_DRAFT: StudioLiteDraft = {
  mode: 'idea',
  preset: 'cinematic',
  visualStyle: 'cinematic_film',
  aspectRatio: '9:16',
  voiceId: 'en_voice_1',
  rawContent: '',
  targetDurationSeconds: 28,
  subtitlesEnabled: true
};

const StudioLiteContext = createContext<StudioLiteContextValue | undefined>(undefined);

export function StudioLiteProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<StudioLiteDraft>(DEFAULT_DRAFT);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderJobStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateDraft = (patch: Partial<StudioLiteDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
    setJobId(null);
    setStatus('idle');
    setVideoUrl(null);
    setErrorMessage(null);
  };

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      resetDraft,
      jobId,
      setJobId,
      status,
      setStatus,
      videoUrl,
      setVideoUrl,
      errorMessage,
      setErrorMessage
    }),
    [draft, jobId, status, videoUrl, errorMessage]
  );

  return <StudioLiteContext.Provider value={value}>{children}</StudioLiteContext.Provider>;
}

export function useStudioLite() {
  const ctx = useContext(StudioLiteContext);
  if (!ctx) throw new Error('useStudioLite must be used within StudioLiteProvider');
  return ctx;
}
