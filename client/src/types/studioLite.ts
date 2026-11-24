import { type AspectRatio, type PlanKey, type SupportedLanguage, type VideoResolution } from './common';
import { type PresetKey } from '../config/presets';
import { type VisualStyleKey } from '../config/visualStyles';

export type StudioLiteMode = 'idea' | 'script';

export interface MasterVideoMeta {
  jobId?: string;
  userPlan: PlanKey;
  language: SupportedLanguage;
  preset: PresetKey;
  visualStyle: VisualStyleKey;
  voice: string;
  voiceName?: string;
  targetDurationSeconds: number;
}

export interface MasterVideoUserInputs {
  mode: StudioLiteMode;
  language: SupportedLanguage;
  preset: PresetKey;
  visualStyle: VisualStyleKey;
  voice: string;
  voiceName?: string;
  tone?: string;
  aspectRatio: AspectRatio;
  rawContent: string;
  selectedHookId?: string;
  selectedCtaId?: string;
}

export interface MasterVideoConfig {
  preset: PresetKey;
  resolution: VideoResolution;
  watermark?: boolean;
  subtitles: {
    enabled: boolean;
  };
}

export interface MasterVideoOrchestration {
  pacing?: string;
  endingBufferSeconds?: number;
  planApplied?: PlanKey;
}

export interface SceneItem {
  sceneNumber: number;
  voiceoverText: string;
  visual?: {
    imageUrl?: string;
    prompt?: string;
  };
  audio?: {
    audioUrl?: string;
    duration?: number;
  };
}

export interface MasterVideoPayload {
  jobId?: string;
  meta: MasterVideoMeta;
  userInputs: MasterVideoUserInputs;
  videoConfig: MasterVideoConfig;
  orchestration?: MasterVideoOrchestration;
  structuredScript?: {
    scenes: SceneItem[];
    endingBufferSeconds?: number;
  };
}

export interface RenderedVideoResult {
  jobId: string;
  fileName: string;
  videoUrl: string;
  preset: PresetKey;
  presetLabel: string;
  resolution: VideoResolution;
  width: number;
  height: number;
  fps: number;
  aspectRatio: AspectRatio;
  watermark: boolean;
  renderedAt: string;
}

export interface StudioLiteRenderResponse {
  success: boolean;
  videoUrl: string;
  videoFileName: string;
  preset: PresetKey;
  resolution: VideoResolution;
  watermark: boolean;
  payload: MasterVideoPayload & { video?: RenderedVideoResult };
  error?: string;
}
