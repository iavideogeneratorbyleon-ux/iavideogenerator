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

const CREDIT_CONFIG = {
  freeTrialInitialCredits: 50,
  videoCreditCost: 30,
  minCreditsToGenerate: 30,
  byPlan: {
    free_trial: {
      initialCredits: 50,
      videoCreditCost: 30,
      minCreditsToGenerate: 30,
      unlimitedCredits: false
    },
    pay_per_video: {
      initialCredits: 0,
      videoCreditCost: 30,
      minCreditsToGenerate: 30,
      unlimitedCredits: false
    },
    pro: {
      initialCredits: 0,
      videoCreditCost: 30,
      minCreditsToGenerate: 30,
      unlimitedCredits: false
    },
    unlimited: {
      initialCredits: 0,
      videoCreditCost: 0,
      minCreditsToGenerate: 0,
      unlimitedCredits: true
    }
  }
};

const PLAN_POLICIES = {
  free_trial: {
    key: 'free_trial',
    allowProVoices: false,
    allowCustomOverrides: false,
    allowCustomScript: false,
    allowedDurationsSec: [30],
    maxDurationSeconds: 30,
    defaultDurationSeconds: 30,
    sceneRange: '4 to 5',
    allowedPresets: ['default', 'educational', 'minimalist'],
    allowedVisualStyles: ['realistic', 'minimalist_flat'],
    allowedResolutions: ['720p'],
    watermarkRequired: true
  },
  pay_per_video: {
    key: 'pay_per_video',
    allowProVoices: true,
    allowCustomOverrides: false,
    allowCustomScript: true,
    allowedDurationsSec: [30, 60, 90],
    maxDurationSeconds: 90,
    defaultDurationSeconds: 60,
    sceneRange: '6 to 8',
    allowedPresets: 'all',
    allowedVisualStyles: 'all',
    allowedResolutions: ['720p', '1080p'],
    watermarkRequired: false
  },
  pro: {
    key: 'pro',
    allowProVoices: true,
    allowCustomOverrides: true,
    allowCustomScript: true,
    allowedDurationsSec: [30, 60, 90],
    maxDurationSeconds: 90,
    defaultDurationSeconds: 60,
    sceneRange: '8 to 10',
    allowedPresets: 'all',
    allowedVisualStyles: 'all',
    allowedResolutions: ['720p', '1080p'],
    watermarkRequired: false
  },
  unlimited: {
    key: 'unlimited',
    allowProVoices: true,
    allowCustomOverrides: true,
    allowCustomScript: true,
    allowedDurationsSec: [30, 60, 90],
    maxDurationSeconds: 90,
    defaultDurationSeconds: 90,
    sceneRange: '8 to 12',
    allowedPresets: 'all',
    allowedVisualStyles: 'all',
    allowedResolutions: ['720p', '1080p'],
    watermarkRequired: false
  }
};

// Configuración global centralizada para todos los modelos de IA del pipeline.
const AI_MODELS = {
  llm: {
    provider: 'google-gemini',
    defaultModelId: process.env.GEMINI_SCRIPT_MODEL || 'gemini-3.8-flash',
    fallbackModelId: process.env.GEMINI_SCRIPT_FALLBACK_MODEL || 'gemini-3.8-flash',
    byPreset: {}
  },
  tts: {
    provider: 'elevenlabs',
    defaultModelId: process.env.ELEVENLABS_TTS_MODEL || 'eleven_v4',
    fallbackModelId: process.env.ELEVENLABS_TTS_FALLBACK_MODEL || 'eleven_v4',
    tagSupportedModels: ['eleven_v4', 'eleven_v4_turbo', 'eleven-v4', 'eleven-v4-turbo'],
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
  },
  stt: {
    provider: 'elevenlabs',
    defaultModelId: process.env.ELEVENLABS_STT_MODEL || 'scribe_v3',
    fallbackModelId: process.env.ELEVENLABS_STT_FALLBACK_MODEL || 'scribe_v3'
  },
  image: {
    provider: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
    defaultModelId: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
    fallbackModelId: process.env.GEMINI_IMAGE_FALLBACK_MODEL || 'gemini-2.5-flash-image',
    byPreset: {}
  }
};

// Compatibilidad con código previo que lea VOICE_MODEL_CONFIG directamente
const VOICE_MODEL_CONFIG = AI_MODELS.tts;

// Estilos visuales de subtítulos por preset (base inspirada en dark_mystery con identidad propia por preset)
const PRESET_SUBTITLE_STYLES = {
  dark_mystery: {
    effectStyle: 'mystery_cinema',
    style: 'mystery_cinema',
    fontFamily: 'Cinzel',
    fontWeight: '600',
    fontFile: null,
    rgba: [242, 231, 214, 255],
    outlineRgba: [6, 6, 8, 250],
    boxRgba: [8, 8, 12, 0],
    showBox: false,
    fontScale: 1.0,
    bottomRatio9x16: 0.84,
    bottomRatioDefault: 0.88,
    maxLineWidthRatio: 0.82,
    lineGapScale: 1.45
  },
  cinematic: {
    effectStyle: 'cinematic_film',
    style: 'cinematic_film',
    fontFamily: 'Cormorant Garamond',
    fontWeight: '600',
    fontFile: null,
    rgba: [248, 236, 210, 255],
    outlineRgba: [10, 10, 12, 245],
    boxRgba: [12, 10, 8, 0],
    showBox: false,
    fontScale: 1.02,
    bottomRatio9x16: 0.84,
    bottomRatioDefault: 0.88,
    maxLineWidthRatio: 0.84,
    lineGapScale: 1.4
  },
  netflix: {
    effectStyle: 'netflix_series',
    style: 'netflix_series',
    fontFamily: 'Bebas Neue',
    fontWeight: '700',
    fontFile: null,
    rgba: [255, 250, 242, 255],
    outlineRgba: [0, 0, 0, 245],
    boxRgba: [0, 0, 0, 0],
    showBox: false,
    fontScale: 1.03,
    bottomRatio9x16: 0.84,
    bottomRatioDefault: 0.88,
    maxLineWidthRatio: 0.84,
    lineGapScale: 1.35
  },
  documentary: {
    effectStyle: 'documentary_clean',
    style: 'documentary_clean',
    fontFamily: 'Source Sans 3',
    fontWeight: '600',
    fontFile: null,
    rgba: [244, 246, 248, 255],
    outlineRgba: [12, 14, 18, 240],
    boxRgba: [10, 12, 16, 0],
    showBox: false,
    fontScale: 0.99,
    bottomRatio9x16: 0.85,
    bottomRatioDefault: 0.89,
    maxLineWidthRatio: 0.85,
    lineGapScale: 1.4
  },
  educational: {
    effectStyle: 'educational_clarity',
    style: 'educational_clarity',
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    fontFile: null,
    rgba: [255, 255, 255, 255],
    outlineRgba: [15, 23, 42, 245],
    boxRgba: [15, 23, 42, 0],
    showBox: false,
    fontScale: 1.05,
    bottomRatio9x16: 0.83,
    bottomRatioDefault: 0.87,
    maxLineWidthRatio: 0.85,
    lineGapScale: 1.4
  },
  minimalist: {
    effectStyle: 'minimalist_editorial',
    style: 'minimalist_editorial',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontFile: null,
    rgba: [245, 245, 245, 255],
    outlineRgba: [20, 20, 20, 225],
    boxRgba: [18, 18, 18, 0],
    showBox: false,
    fontScale: 0.97,
    bottomRatio9x16: 0.85,
    bottomRatioDefault: 0.89,
    maxLineWidthRatio: 0.8,
    lineGapScale: 1.5
  },
  luxury_brand: {
    effectStyle: 'luxury_champagne',
    style: 'luxury_champagne',
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontFile: null,
    rgba: [246, 224, 168, 255],
    outlineRgba: [18, 15, 10, 240],
    boxRgba: [16, 14, 10, 0],
    showBox: false,
    fontScale: 1.0,
    bottomRatio9x16: 0.84,
    bottomRatioDefault: 0.88,
    maxLineWidthRatio: 0.82,
    lineGapScale: 1.45
  },
  tech_modern: {
    effectStyle: 'tech_cyan_sharp',
    style: 'tech_cyan_sharp',
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    fontFile: null,
    rgba: [186, 242, 255, 255],
    outlineRgba: [8, 14, 24, 245],
    boxRgba: [8, 16, 28, 0],
    showBox: false,
    fontScale: 1.04,
    bottomRatio9x16: 0.83,
    bottomRatioDefault: 0.87,
    maxLineWidthRatio: 0.85,
    lineGapScale: 1.35
  },
  tiktok_viral: {
    effectStyle: 'viral_punch',
    style: 'viral_punch',
    fontFamily: 'Montserrat',
    fontWeight: '800',
    fontFile: null,
    rgba: [255, 255, 255, 255],
    outlineRgba: [0, 0, 0, 255],
    boxRgba: [20, 10, 35, 0],
    showBox: false,
    fontScale: 1.14,
    bottomRatio9x16: 0.82,
    bottomRatioDefault: 0.86,
    maxLineWidthRatio: 0.86,
    lineGapScale: 1.3
  },
  mr_beast: {
    effectStyle: 'mr_beast_bold',
    style: 'mr_beast_bold',
    fontFamily: 'Anton',
    fontWeight: '900',
    fontFile: null,
    rgba: [255, 238, 45, 255],
    outlineRgba: [0, 0, 0, 255],
    boxRgba: [0, 0, 0, 0],
    showBox: false,
    fontScale: 1.18,
    bottomRatio9x16: 0.82,
    bottomRatioDefault: 0.86,
    maxLineWidthRatio: 0.86,
    lineGapScale: 1.3
  },
  default: {
    effectStyle: 'standard_enhanced',
    style: 'standard_enhanced',
    fontFamily: 'Inter',
    fontWeight: '600',
    fontFile: null,
    rgba: [248, 246, 242, 255],
    outlineRgba: [10, 10, 12, 240],
    boxRgba: [10, 10, 12, 0],
    showBox: false,
    fontScale: 1.0,
    bottomRatio9x16: 0.84,
    bottomRatioDefault: 0.88,
    maxLineWidthRatio: 0.84,
    lineGapScale: 1.4
  }
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

function resolveAiModelId(category = 'llm', { explicitModelId, preset, userPlan } = {}) {
  const cfg = AI_MODELS[category] || {};
  if (explicitModelId && String(explicitModelId).trim()) {
    return String(explicitModelId).trim();
  }
  if (preset && cfg.byPreset?.[preset]) {
    return cfg.byPreset[preset];
  }
  if (userPlan && cfg.byPlan?.[userPlan]) {
    return cfg.byPlan[userPlan];
  }
  return cfg.defaultModelId || cfg.fallbackModelId || null;
}

function resolveVoiceModelId({ explicitModelId, preset, userPlan } = {}) {
  return (
    resolveAiModelId('tts', { explicitModelId, preset, userPlan }) ||
    VOICE_MODEL_CONFIG.defaultModelId ||
    VOICE_MODEL_CONFIG.fallbackModelId ||
    'eleven_v4'
  );
}

function modelSupportsAudioTags(modelId) {
  const normalized = String(modelId || '').trim().toLowerCase();
  if (!normalized) return false;
  const supported =
    AI_MODELS.tts?.tagSupportedModels || VOICE_MODEL_CONFIG.tagSupportedModels || [];
  return supported.some((m) => m.toLowerCase() === normalized);
}

function getPresetSubtitleStyle(rawPreset = 'default') {
  const cleaned = String(rawPreset || 'default')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const aliased =
    PRESET_ALIASES[cleaned] ||
    PRESET_ALIASES[cleaned.replace(/_/g, '-')] ||
    PRESET_ALIASES[cleaned.replace(/-/g, '_')] ||
    cleaned;

  if (Object.prototype.hasOwnProperty.call(PRESET_SUBTITLE_STYLES, aliased)) {
    return PRESET_SUBTITLE_STYLES[aliased];
  }
  return PRESET_SUBTITLE_STYLES.default;
}

const GLOBALS = {
  ALL_PRODUCTS,
  PRODUCTS,
  CREDIT_CONFIG,
  PLAN_POLICIES,
  AI_MODELS,
  VOICE_MODEL_CONFIG,
  PRESET_SUBTITLE_STYLES,
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
  CREDIT_CONFIG,
  PLAN_POLICIES,
  AI_MODELS,
  VOICE_MODEL_CONFIG,
  PRESET_SUBTITLE_STYLES,
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
  resolveAiModelId,
  resolveVoiceModelId,
  modelSupportsAudioTags,
  getPresetSubtitleStyle
};
