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
    netflix: 'eleven_v4',
    documentary: 'eleven_v4',
    educational: 'eleven_v4',
    minimalist: 'eleven_v4',
    luxury_brand: 'eleven_v4',
    tech_modern: 'eleven_v4',
    tiktok_viral: 'eleven_v4',
    mr_beast: 'eleven_v4',
    default: 'eleven_v4'
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

// Parámetros base de voz por preset (10 presets + default), alineados con SAFETY_LIMITS
const PRESET_VOICE_SETTINGS = {
  dark_mystery: {
    speed: 0.96,
    stability: 0.39,
    style: 0.40,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  cinematic: {
    speed: 0.96,
    stability: 0.43,
    style: 0.34,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  netflix: {
    speed: 0.97,
    stability: 0.44,
    style: 0.30,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  documentary: {
    speed: 0.95,
    stability: 0.52,
    style: 0.22,
    similarity_boost: 0.80,
    use_speaker_boost: true
  },
  educational: {
    speed: 0.97,
    stability: 0.56,
    style: 0.15,
    similarity_boost: 0.80,
    use_speaker_boost: true
  },
  minimalist: {
    speed: 0.96,
    stability: 0.55,
    style: 0.12,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  luxury_brand: {
    speed: 0.94,
    stability: 0.54,
    style: 0.24,
    similarity_boost: 0.80,
    use_speaker_boost: true
  },
  tech_modern: {
    speed: 1.01,
    stability: 0.50,
    style: 0.22,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  tiktok_viral: {
    speed: 1.04,
    stability: 0.43,
    style: 0.32,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  mr_beast: {
    speed: 1.06,
    stability: 0.42,
    style: 0.36,
    similarity_boost: 0.78,
    use_speaker_boost: true
  },
  default: {
    speed: 0.98,
    stability: 0.48,
    style: 0.20,
    similarity_boost: 0.78,
    use_speaker_boost: true
  }
};

// Etiquetas orientativas para Eleven v4 por preset (10 presets + default)
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
  netflix: {
    hook: '[dramatic, hooked] [emphasis]',
    body: '[measured, engaging] [clear]',
    cta: '[intriguing, steady]'
  },
  minimalist: {
    hook: '[calm, clear] [measured]',
    body: '[serene, steady] [unhurried]',
    cta: '[calm, intentional]'
  },
  luxury_brand: {
    hook: '[refined, poised] [emphasis]',
    body: '[smooth, measured] [warm]',
    cta: '[composed, confident]'
  },
  tech_modern: {
    hook: '[crisp, forward-looking] [emphasis]',
    body: '[clear, articulate] [steady]',
    cta: '[confident, direct]'
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
  cinematic_film: {
    key: 'cinematic_film',
    label: 'Cinematic Film',
    promptAnchor: 'Feature film cinematography, rich color grading, subtle lens flare, atmospheric lighting, shallow depth of field'
  },
  '3d_render': {
    key: '3d_render',
    label: '3D Render',
    promptAnchor: 'High-detail 3D CGI render, subsurface scattering, studio and volumetric lighting, clean stylized depth'
  },
  anime: {
    key: 'anime',
    label: 'Anime',
    promptAnchor: 'High-craft Japanese anime illustration style, expressive lighting, clean linework, rich atmospheric backgrounds'
  },
  comic: {
    key: 'comic',
    label: 'Comic',
    promptAnchor: 'Graphic novel comic art style, bold ink outlines, halftone shading, dramatic panel composition'
  },
  minimalist_flat: {
    key: 'minimalist_flat',
    label: 'Minimalist Editorial',
    promptAnchor: 'Clean minimalist visual composition, uncluttered framing, refined studio lighting, crisp geometric balance'
  },
  retro_vintage: {
    key: 'retro_vintage',
    label: 'Retro Vintage',
    promptAnchor: 'Vintage analog aesthetic, warm faded film tones, subtle grain, nostalgic lighting and classic framing'
  },
  surreal_editorial: {
    key: 'surreal_editorial',
    label: 'Surreal Editorial',
    promptAnchor: 'Surrealist editorial art direction, imaginative composition, dramatic contrast, dreamlike atmosphere'
  }
};


// Ajustes finos opcionales por voz cuando una voz específica necesita matizarse en algún preset
// Overrides de respaldo por voz (es_voice_1..6 y en_voice_1..6) en presets clave
const VOICE_PRESET_OVERRIDES = {
  // --- ESPAÑOL (es) ---
  es_voice_1: { // Issac - flexible_dynamic
    minimalist: { speed: 0.95, stability: 0.56, style: 0.14 },
    luxury_brand: { speed: 0.94, stability: 0.54, style: 0.22 }
  },
  es_voice_2: { // Gaby - flexible_conversational
    dark_mystery: { stability: 0.42, style: 0.34 },
    luxury_brand: { speed: 0.94, stability: 0.56, style: 0.20 }
  },
  es_voice_3: { // Atonio - flexible_clear
    dark_mystery: { stability: 0.40, style: 0.38 },
    mr_beast: { speed: 1.03, stability: 0.46, style: 0.30 }
  },
  es_voice_4: { // Tom - flexible_narrative
    mr_beast: { speed: 1.01, stability: 0.48, style: 0.26 },
    tiktok_viral: { speed: 1.00, stability: 0.48, style: 0.25 }
  },
  es_voice_5: { // David - flexible_polished
    mr_beast: { speed: 1.02, stability: 0.47, style: 0.28 },
    tiktok_viral: { speed: 1.01, stability: 0.47, style: 0.26 }
  },
  es_voice_6: { // Norah - flexible_warm
    mr_beast: { speed: 1.00, stability: 0.49, style: 0.25 },
    tiktok_viral: { speed: 1.00, stability: 0.48, style: 0.24 }
  },

  // --- INGLÉS (en) ---
  en_voice_1: { // Liam - flexible_dynamic
    minimalist: { speed: 0.95, stability: 0.56, style: 0.14 },
    luxury_brand: { speed: 0.94, stability: 0.54, style: 0.22 }
  },
  en_voice_2: { // Ivy - flexible_conversational
    dark_mystery: { stability: 0.42, style: 0.34 },
    luxury_brand: { speed: 0.94, stability: 0.56, style: 0.20 }
  },
  en_voice_3: { // David - flexible_clear
    dark_mystery: { stability: 0.40, style: 0.38 },
    mr_beast: { speed: 1.03, stability: 0.46, style: 0.30 }
  },
  en_voice_4: { // Piksel - flexible_narrative
    mr_beast: { speed: 1.01, stability: 0.48, style: 0.26 },
    tiktok_viral: { speed: 1.00, stability: 0.48, style: 0.25 }
  },
  en_voice_5: { // Stu G - flexible_polished
    mr_beast: { speed: 1.02, stability: 0.47, style: 0.28 },
    tiktok_viral: { speed: 1.01, stability: 0.47, style: 0.26 }
  },
  en_voice_6: { // Belle B - flexible_warm
    mr_beast: { speed: 1.00, stability: 0.49, style: 0.25 },
    tiktok_viral: { speed: 1.00, stability: 0.48, style: 0.24 }
  }
};

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
