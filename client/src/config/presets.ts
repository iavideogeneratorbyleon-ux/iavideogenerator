// client/src/config/presets.ts
export const PRESET_KEYS = [
  'dark_mystery',
  'cinematic',
  'netflix',
  'documentary',
  'educational',
  'minimalist',
  'luxury_brand',
  'tech_modern',
  'tiktok_viral',
  'mr_beast',
  'default'
] as const;

export type PresetKey = (typeof PRESET_KEYS)[number];

export const PRESET_ALIASES: Record<string, PresetKey> = {
  tiktok: 'tiktok_viral',
  viral: 'tiktok_viral',
  mrbeast: 'mr_beast',
  'luxury-brand': 'luxury_brand',
  luxury: 'luxury_brand',
  'tech-modern': 'tech_modern',
  tech: 'tech_modern',
  'dark-mystery': 'dark_mystery',
  mystery: 'dark_mystery',
  documental: 'documentary',
  doc: 'documentary',
  cine: 'cinematic',
  dramatic: 'cinematic',
  educativo: 'educational',
  explainer: 'educational'
};

export const ASPECT_RATIOS = ['9:16', '16:9', '1:1'] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];
