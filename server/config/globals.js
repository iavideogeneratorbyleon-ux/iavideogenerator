// server/config/globals.js

const ALL_PRODUCTS = ['studio_lite', 'director_studio', 'blueprints', 'memories'];

const PRODUCTS = {
  studio_lite: {
    key: 'studio_lite',
    label: 'Studio Lite',
    allowsCustomOverrides: false
  },
  director_studio: {
    key: 'director_studio',
    label: 'Director Studio',
    allowsCustomOverrides: true
  },
  blueprints: {
    key: 'blueprints',
    label: 'Studio Blueprints',
    allowsCustomOverrides: true
  },
  memories: {
    key: 'memories',
    label: 'Memories & Stories',
    allowsCustomOverrides: true
  }
};

const PLAN_POLICIES = {
  free_trial: {
    key: 'free_trial',
    allowProVoices: false,
    allowCustomOverrides: false,
    allowCustomScript: false,
    maxDurationSeconds: 30,
    defaultDurationSeconds: 28,
    sceneRange: '4 to 5'
  },
  pay_per_video: {
    key: 'pay_per_video',
    allowProVoices: true,
    allowCustomOverrides: false,
    allowCustomScript: true,
    maxDurationSeconds: 60,
    defaultDurationSeconds: 45,
    sceneRange: '6 to 8'
  },
  pro: {
    key: 'pro',
    allowProVoices: true,
    allowCustomOverrides: true,
    allowCustomScript: true,
    maxDurationSeconds: 70,
    defaultDurationSeconds: 50,
    sceneRange: '8 to 10'
  },
  unlimited: {
    key: 'unlimited',
    allowProVoices: true,
    allowCustomOverrides: true,
    allowCustomScript: true,
    maxDurationSeconds: 90,
    defaultDurationSeconds: 60,
    sceneRange: '8 to 12'
  }
};

// Configuración global dinámica para el modelo de voz de ElevenLabs.
// Cambia `defaultModelId` aquí para afectar todo el pipeline sin tocar los servicios.
const VOICE_MODEL_CONFIG = {
  defaultModelId: 'eleven_v4',
  fallbackModelId: 'eleven_v4',
  tagSupportedModels: ['eleven_v4', 'eleven_v4_turbo', 'eleven-v4', 'eleven-v4-turbo'],
  // Overrides opcionales por preset o plan si necesitas un modelo específico en algún caso
  byPreset: {
    dark_mystery: 'eleven_v4',
    cinematic: 'eleven_v4',
    documentary: 'eleven_v4',
    educational: 'eleven_v4'
  },
  byPlan: {}
};

// 6 voces flexibles en Español (es) + 6 voces flexibles en Inglés (en) para Studio Lite.
// El usuario elige la voz y luego el preset; la adaptación al preset ocurre en audioService/llmService.
const VOICE_CATALOG = {
  // --- ESPAÑOL (es) - 6 voces flexibles ---
  es_voice_1: {
    id: 'QmPfzE500cXXHM9uQKGc',
    name: 'es_voice_1',
    voiceName: 'Issac',
    language: 'es',
    profile: 'flexible_dynamic',
    tier: 'free',
    accent: 'es',
    products: ALL_PRODUCTS
  },
  es_voice_2: {
    id: 'p5EUznrYaWnafKvUkNiR',
    name: 'es_voice_2',
    voiceName: 'Gaby',
    language: 'es',
    profile: 'flexible_conversational',
    tier: 'free',
    accent: 'es',
    products: ALL_PRODUCTS
  },
  es_voice_3: {
    id: 'htFfPSZGJwjBv1CL0aMD',
    name: 'es_voice_3',
    voiceName: 'Atonio',
    language: 'es',
    profile: 'flexible_clear',
    tier: 'free',
    accent: 'es',
    products: ALL_PRODUCTS
  },
  es_voice_4: {
    id: 'p1Q3ihQuPjyyENa1RGtl',
    name: 'es_voice_4',
    voiceName: 'Tom',
    language: 'es',
    profile: 'flexible_narrative',
    tier: 'pro',
    accent: 'es',
    products: ALL_PRODUCTS
  },
  es_voice_5: {
    id: 'dQ0C8BEdKF2odmELvNee',
    name: 'es_voice_5',
    voiceName: 'David',
    language: 'es',
    profile: 'flexible_polished',
    tier: 'pro',
    accent: 'es',
    products: ALL_PRODUCTS
  },
  es_voice_6: {
    id: 'kcQkGnn0HAT2JRDQ4Ljp',
    name: 'es_voice_6',
    voiceName: 'Norah',
    language: 'es',
    profile: 'flexible_warm',
    tier: 'pro',
    accent: 'es',
    products: ALL_PRODUCTS
  },

  // --- INGLÉS (en) - 6 voces flexibles ---
  en_voice_1: {
    id: 'FSZ4QLofSALZxepAyq63',
    name: 'en_voice_1',
    voiceName: 'Liam',
    language: 'en',
    profile: 'flexible_dynamic',
    tier: 'free',
    accent: 'en',
    products: ALL_PRODUCTS
  },
  en_voice_2: {
    id: 'MClEFoImJXBTgLwdLI5n',
    name: 'en_voice_2',
    voiceName: 'Ivy',
    language: 'en',
    profile: 'flexible_conversational',
    tier: 'free',
    accent: 'en',
    products: ALL_PRODUCTS
  },
  en_voice_3: {
    id: 'gSaBu1pZi4Eb56QGbOoS',
    name: 'en_voice_3',
    voiceName: 'David',
    language: 'en',
    profile: 'flexible_clear',
    tier: 'free',
    accent: 'en',
    products: ALL_PRODUCTS
  },
  en_voice_4: {
    id: 'iq1GS1mcjc63xtqTrsFh',
    name: 'en_voice_4',
    voiceName: 'Piksel',
    language: 'en',
    profile: 'flexible_narrative',
    tier: 'pro',
    accent: 'en',
    products: ALL_PRODUCTS
  },
  en_voice_5: {
    id: 'lJ00RZOOoE490i3hnZDL',
    name: 'en_voice_5',
    voiceName: 'Stu G',
    language: 'en',
    profile: 'flexible_polished',
    tier: 'pro',
    accent: 'en',
    products: ALL_PRODUCTS
  },
  en_voice_6: {
    id: 'SQQyvkXssth4s6HD2OuR',
    name: 'en_voice_6',
    voiceName: 'Belle B',
    language: 'en',
    profile: 'flexible_warm',
    tier: 'pro',
    accent: 'en',
    products: ALL_PRODUCTS
  }
};

const STUDIO_LITE_VOICES_BY_LANG = {
  es: [
    'es_voice_1',
    'es_voice_2',
    'es_voice_3',
    'es_voice_4',
    'es_voice_5',
    'es_voice_6'
  ],
  en: [
    'en_voice_1',
    'en_voice_2',
    'en_voice_3',
    'en_voice_4',
    'en_voice_5',
    'en_voice_6'
  ]
};

function getStudioLiteVoices(language = 'en', userPlan = 'free_trial') {
  const langKey = String(language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  const policyKey = Object.prototype.hasOwnProperty.call(PLAN_POLICIES, userPlan)
    ? userPlan
    : 'free_trial';
  const allowProVoices = Boolean(PLAN_POLICIES[policyKey]?.allowProVoices);

  return (STUDIO_LITE_VOICES_BY_LANG[langKey] || []).map((key) => {
    const voice = VOICE_CATALOG[key];
    return {
      key,
      ...voice,
      availableForPlan: voice.tier === 'free' || allowProVoices
    };
  });
}

const VOICE_MAP = Object.fromEntries(
  Object.entries(VOICE_CATALOG)
    .filter(([, meta]) => Boolean(meta.id))
    .map(([key, meta]) => [key, meta.id])
);

const TONE_ALIASES = {
  professional: 'direct',
  casual: 'storytelling'
};

const PRESET_ALIASES = {
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

const BASE_PRESET_MODIFIERS = {
  netflix: { speedDelta: -0.02, stabilityDelta: -0.04, styleDelta: 0.08 },
  tiktok_viral: { speedDelta: 0.04, stabilityDelta: -0.05, styleDelta: 0.1 },
  mr_beast: { speedDelta: 0.05, stabilityDelta: -0.04, styleDelta: 0.12 },
  cinematic: { speedDelta: -0.03, stabilityDelta: -0.05, styleDelta: 0.1 },
  documentary: { speedDelta: -0.04, stabilityDelta: 0.02, styleDelta: 0.04 },
  educational: { speedDelta: -0.02, stabilityDelta: 0.05, styleDelta: -0.04 },
  minimalist: { speedDelta: -0.01, stabilityDelta: 0.04, styleDelta: -0.05 },
  luxury_brand: { speedDelta: -0.03, stabilityDelta: 0.03, styleDelta: 0.06 },
  tech_modern: { speedDelta: 0.02, stabilityDelta: 0.0, styleDelta: 0.04 },
  dark_mystery: { speedDelta: -0.05, stabilityDelta: -0.06, styleDelta: 0.12 },
  default: { speedDelta: 0.0, stabilityDelta: 0.0, styleDelta: 0.0 }
};

// Etiquetas orientativas para Eleven v4 por preset (usadas por llmService al generar el guion)
const PRESET_VOICE_TAGS = {
  dark_mystery: {
    hook: '[dark narrator voice] [emphasis]',
    body: '[measured, steady] [low, eerie]',
    cta: '[whisper, slowly] [lower tone]'
  },
  documentary: {
    hook: '[calm, investigative] [emphasis]',
    body: '[measured, steady] [clear]',
    cta: '[reflective, steady]'
  },
  cinematic: {
    hook: '[dramatic, atmospheric] [emphasis]',
    body: '[measured] [tense]',
    cta: '[low, slowly] [pause]'
  },
  educational: {
    hook: '[clear, engaging]',
    body: '[articulate, steady] [emphasis]',
    cta: '[clear, encouraging]'
  },
  tiktok_viral: {
    hook: '[upbeat, engaging] [emphasis]',
    body: '[energetic, conversational]',
    cta: '[engaging, natural]'
  },
  mr_beast: {
    hook: '[high energy, punchy] [emphasis]',
    body: '[fast, exciting] [emphasis]',
    cta: '[energetic, direct]'
  },
  default: {
    hook: '[engaging]',
    body: '[steady]',
    cta: '[steady]'
  }
};

// Estilos visuales separables de los presets narrativos (para imagen/render)
const VISUAL_STYLES = {
  realistic: {
    key: 'realistic',
    label: 'Realistic',
    promptAnchor: 'Photorealistic cinematic live-action photography, natural textures, authentic lighting, crisp depth of field'
  },
  '3d_render': {
    key: '3d_render',
    label: '3D Render',
    promptAnchor: 'High-detail 3D CGI render, subsurface scattering, studio and volumetric lighting, clean stylized depth'
  },
  comic: {
    key: 'comic',
    label: 'Comic',
    promptAnchor: 'Graphic novel comic art style, bold ink outlines, halftone shading, dramatic panel composition'
  }
};

// Ajustes finos opcionales por voz cuando una voz específica necesita matizarse en algún preset
const VOICE_PRESET_OVERRIDES = {};

const SAFETY_LIMITS = {
  voiceStability: { min: 0.2, max: 0.9, defaultValue: 0.48 },
  voiceSimilarity: { min: 0.2, max: 1.0, defaultValue: 0.78 },
  voiceStyle: { min: 0.0, max: 0.85, defaultValue: 0.2 },
  voiceSpeed: { min: 0.7, max: 1.2, defaultValue: 0.98 },
  endingBufferSeconds: { min: 1, max: 4, defaultValue: 1.5 }
};

function resolveVoiceModelId({ explicitModelId, preset, userPlan } = {}) {
  if (explicitModelId && String(explicitModelId).trim()) {
    return String(explicitModelId).trim();
  }
  if (preset && VOICE_MODEL_CONFIG.byPreset?.[preset]) {
    return VOICE_MODEL_CONFIG.byPreset[preset];
  }
  if (userPlan && VOICE_MODEL_CONFIG.byPlan?.[userPlan]) {
    return VOICE_MODEL_CONFIG.byPlan[userPlan];
  }
  return VOICE_MODEL_CONFIG.defaultModelId || VOICE_MODEL_CONFIG.fallbackModelId || 'eleven_v4';
}

function modelSupportsAudioTags(modelId) {
  const normalized = String(modelId || '').trim().toLowerCase();
  if (!normalized) return false;
  return VOICE_MODEL_CONFIG.tagSupportedModels.some((m) => m.toLowerCase() === normalized);
}

const GLOBALS = {
  ALL_PRODUCTS,
  PRODUCTS,
  PLAN_POLICIES,
  VOICE_MODEL_CONFIG,
  VOICE_CATALOG,
  STUDIO_LITE_VOICES_BY_LANG,
  VOICE_MAP,
  TONE_ALIASES,
  PRESET_ALIASES,
  BASE_PRESET_MODIFIERS,
  PRESET_VOICE_TAGS,
  VISUAL_STYLES,
  VOICE_PRESET_OVERRIDES,
  SAFETY_LIMITS
};

module.exports = {
  GLOBALS,
  ALL_PRODUCTS,
  PRODUCTS,
  PLAN_POLICIES,
  VOICE_MODEL_CONFIG,
  VOICE_CATALOG,
  STUDIO_LITE_VOICES_BY_LANG,
  VOICE_MAP,
  TONE_ALIASES,
  PRESET_ALIASES,
  BASE_PRESET_MODIFIERS,
  PRESET_VOICE_TAGS,
  VISUAL_STYLES,
  VOICE_PRESET_OVERRIDES,
  SAFETY_LIMITS,
  getStudioLiteVoices,
  resolveVoiceModelId,
  modelSupportsAudioTags
};
