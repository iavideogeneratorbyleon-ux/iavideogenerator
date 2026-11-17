export type UserPlan = 'free_trial' | 'pro' | 'enterprise';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type VoiceId = 'carlos' | 'sofia' | 'alex' | 'valeria' | 'mateo' | 'elena';
export type VisualStyle = '3d' | 'cinematic' | 'anime' | 'minimalist';
export type MusicStyle = 'lofi' | 'energetic' | 'cinematic' | 'corporate' | 'none';

export interface WizardFormValues {
  rawContent: string;
  tone: string;
  voiceId: VoiceId;
  aspectRatio: AspectRatio;
  visualStyle: VisualStyle;
  musicStyle: MusicStyle;
  subtitlesEnabled: boolean;
}

export interface GenerateVideoResponse {
  success: boolean;
  videoFileName: string;
  videoUrl: string;
  renderedAt: string;
}
