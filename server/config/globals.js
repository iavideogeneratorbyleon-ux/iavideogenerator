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
    allowedPresets: ['default', 'cinematic', 'educational', 'minimalist'],
    allowedVisualStyles: ['realistic', 'cartoon_2d', 'minimalist_flat'],
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

// Centralized global configuration for all AI models across the pipeline.
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
    provider: process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002',
    defaultModelId: process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002',
    fallbackModelId: process.env.GEMINI_IMAGE_FALLBACK_MODEL || 'imagen-3.0-generate-002',
    byPreset: {}
  }
};

// Backward compatibility for existing code reading VOICE_MODEL_CONFIG directly
const VOICE_MODEL_CONFIG = AI_MODELS.tts;

// 6 flexible voices in Spanish (es) + 6 flexible voices in English (en) for Studio Lite.
// The user picks the voice and then the preset; preset adaptation happens in audioService/llmService.
const VOICE_CATALOG = {
  // --- SPANISH (es) - 6 flexible voices ---
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

  // --- ENGLISH (en) - 6 flexible voices ---
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

// Merged 10 preset categories and sub-preset variants aligned with base presets
const PRESET_CATEGORIES = {
  cinematographic: {
    key: 'cinematographic',
    label: 'Cinematographic',
    basePreset: 'cinematic',
    description:
      'Cinema lighting, depth of field, smooth camera movements, curated composition, elegant transitions, and emotional music.',
    subPresets: [
      'Cinematic Documentary',
      'Epic Cinematic',
      'Film Noir',
      'Golden Hour',
      'Dramatic Storytelling'
    ]
  },
  educational_and_explanatory: {
    key: 'educational_and_explanatory',
    label: 'Educational & Explanatory',
    basePreset: 'educational',
    description:
      'Scene-organized information, charts, diagrams, highlighted text, clear narration, and pacing designed for easy learning.',
    subPresets: [
      'Educational Explainer',
      'Science Explained',
      'History Explained',
      'Animated Infographic',
      'Whiteboard Explanation'
    ]
  },
  storytelling_and_narrative: {
    key: 'storytelling_and_narrative',
    label: 'Storytelling & Narrative',
    basePreset: 'cinematic',
    description:
      'Setup, rising action, and resolution with character and setting continuity, narrative music, and pacing shifts to sustain engagement.',
    subPresets: [
      'Epic Story',
      'Fantasy Adventure',
      'Emotional Story',
      'Mystery',
      'Historical Story'
    ]
  },
  animation_and_entertainment: {
    key: 'animation_and_entertainment',
    label: 'Animation & Entertainment',
    basePreset: 'tiktok_viral',
    description:
      'Stylized characters, expressive staging, dynamic motion, visual continuity, and signature effects for each animation style.',
    subPresets: [
      'Anime Cinematic',
      '3D Animated Story',
      'Cartoon Comedy',
      'Manga Action',
      'Claymation Story'
    ]
  },
  marketing_and_product: {
    key: 'marketing_and_product',
    label: 'Marketing & Product',
    basePreset: 'luxury_brand',
    description:
      'Product showcase, close-up shots, commercial lighting, promotional callouts, key benefits, and clear call to action.',
    subPresets: [
      'Product Showcase',
      'Luxury Commercial',
      'Brand Promotion',
      'Product Explainer',
      'Lifestyle Advertisement'
    ]
  },
  social_and_viral: {
    key: 'social_and_viral',
    label: 'Social & Viral',
    basePreset: 'tiktok_viral',
    description:
      'Immediate hook, fast cuts, eye-catching captions, frequent visual shifts, high-energy music, and strong CTA.',
    subPresets: [
      'TikTok Viral',
      'Instagram Reels',
      'YouTube Shorts',
      'Fast Facts',
      'Trending Edit'
    ]
  },
  motivational_and_inspirational: {
    key: 'motivational_and_inspirational',
    label: 'Motivational & Inspirational',
    basePreset: 'cinematic',
    description:
      'Emotional narration, rising music, aspirational imagery, standout lines, and progressive momentum.',
    subPresets: [
      'Motivational Speech',
      'Success Mindset',
      'Life Lessons',
      'Inspirational Journey'
    ]
  },
  technology_and_futuristic: {
    key: 'technology_and_futuristic',
    label: 'Technology & Futuristic',
    basePreset: 'tech_modern',
    description:
      'Neon lighting, digital interfaces, tech effects, data animations, futuristic environments, and electronic music.',
    subPresets: [
      'Futuristic Technology',
      'Cyberpunk',
      'AI & Innovation',
      'Sci-Fi Documentary',
      'Digital World'
    ]
  },
  travel_and_nature: {
    key: 'travel_and_nature',
    label: 'Travel & Nature',
    basePreset: 'documentary',
    description:
      'Wide shots, aerial views, fluid camera movement, scenic landscapes, ambient music, and smooth transitions.',
    subPresets: [
      'Travel Cinematic',
      'Nature Documentary',
      'Adventure',
      'City Exploration',
      'Wildlife Documentary'
    ]
  },
  corporate_and_business: {
    key: 'corporate_and_business',
    label: 'Corporate & Business',
    basePreset: 'minimalist',
    description:
      'Clean design, professional typography, consistent colors, data visuals, formal narration, and structured clarity.',
    subPresets: [
      'Corporate Presentation',
      'Business Overview',
      'Startup Pitch',
      'Professional Training',
      'Company Profile'
    ]
  }
};

const PRESET_VARIANTS = {
  // 1. Cinematographic
  cinematic_documentary: {
    key: 'cinematic_documentary',
    label: 'Cinematic Documentary',
    category: 'cinematographic',
    basePreset: 'documentary',
    visualStyle: 'cinematic_film',
    motion: 'documentary_glide'
  },
  epic_cinematic: {
    key: 'epic_cinematic',
    label: 'Epic Cinematic',
    category: 'cinematographic',
    basePreset: 'cinematic',
    visualStyle: 'cinematic_film',
    motion: 'epic_sweep'
  },
  film_noir: {
    key: 'film_noir',
    label: 'Film Noir',
    category: 'cinematographic',
    basePreset: 'dark_mystery',
    visualStyle: 'retro_vintage',
    motion: 'noir_drift'
  },
  golden_hour: {
    key: 'golden_hour',
    label: 'Golden Hour',
    category: 'cinematographic',
    basePreset: 'cinematic',
    visualStyle: 'realistic',
    motion: 'golden_dolly'
  },
  dramatic_storytelling: {
    key: 'dramatic_storytelling',
    label: 'Dramatic Storytelling',
    category: 'cinematographic',
    basePreset: 'cinematic',
    visualStyle: 'cinematic_film',
    motion: 'dramatic_push'
  },

  // 2. Educational & Explanatory
  educational_explainer: {
    key: 'educational_explainer',
    label: 'Educational Explainer',
    category: 'educational_and_explanatory',
    basePreset: 'educational',
    visualStyle: 'minimalist_flat',
    motion: 'explainer_pull'
  },
  science_explained: {
    key: 'science_explained',
    label: 'Science Explained',
    category: 'educational_and_explanatory',
    basePreset: 'educational',
    visualStyle: '3d_render',
    motion: 'science_reveal'
  },
  history_explained: {
    key: 'history_explained',
    label: 'History Explained',
    category: 'educational_and_explanatory',
    basePreset: 'documentary',
    visualStyle: 'retro_vintage',
    motion: 'history_pan'
  },
  animated_infographic: {
    key: 'animated_infographic',
    label: 'Animated Infographic',
    category: 'educational_and_explanatory',
    basePreset: 'educational',
    visualStyle: 'minimalist_flat',
    motion: 'infographic_step'
  },
  whiteboard_explanation: {
    key: 'whiteboard_explanation',
    label: 'Whiteboard Explanation',
    category: 'educational_and_explanatory',
    basePreset: 'educational',
    visualStyle: 'minimalist_flat',
    motion: 'whiteboard_pan'
  },

  // 3. Storytelling & Narrative
  epic_story: {
    key: 'epic_story',
    label: 'Epic Story',
    category: 'storytelling_and_narrative',
    basePreset: 'cinematic',
    visualStyle: 'cinematic_film',
    motion: 'epic_sweep'
  },
  fantasy_adventure: {
    key: 'fantasy_adventure',
    label: 'Fantasy Adventure',
    category: 'storytelling_and_narrative',
    basePreset: 'cinematic',
    visualStyle: 'surreal_editorial',
    motion: 'adventure_drift'
  },
  emotional_story: {
    key: 'emotional_story',
    label: 'Emotional Story',
    category: 'storytelling_and_narrative',
    basePreset: 'cinematic',
    visualStyle: 'cinematic_film',
    motion: 'emotional_push'
  },
  mystery: {
    key: 'mystery',
    label: 'Mystery',
    category: 'storytelling_and_narrative',
    basePreset: 'dark_mystery',
    visualStyle: 'cinematic_film',
    motion: 'noir_drift'
  },
  historical_story: {
    key: 'historical_story',
    label: 'Historical Story',
    category: 'storytelling_and_narrative',
    basePreset: 'documentary',
    visualStyle: 'retro_vintage',
    motion: 'history_pan'
  },

  // 4. Animation & Entertainment
  anime_cinematic: {
    key: 'anime_cinematic',
    label: 'Anime Cinematic',
    category: 'animation_and_entertainment',
    basePreset: 'cinematic',
    visualStyle: 'anime',
    motion: 'anime_glide'
  },
  '3d_animated_story': {
    key: '3d_animated_story',
    label: '3D Animated Story',
    category: 'animation_and_entertainment',
    basePreset: 'educational',
    visualStyle: '3d_render',
    motion: '3d_orbit'
  },
  cartoon_comedy: {
    key: 'cartoon_comedy',
    label: 'Cartoon Comedy',
    category: 'animation_and_entertainment',
    basePreset: 'mr_beast',
    visualStyle: 'comic',
    motion: 'comedy_pop'
  },
  manga_action: {
    key: 'manga_action',
    label: 'Manga Action',
    category: 'animation_and_entertainment',
    basePreset: 'mr_beast',
    visualStyle: 'comic',
    motion: 'action_punch'
  },
  claymation_story: {
    key: 'claymation_story',
    label: 'Claymation Story',
    category: 'animation_and_entertainment',
    basePreset: 'minimalist',
    visualStyle: '3d_render',
    motion: 'clay_wobble'
  },

  // 5. Marketing & Product
  product_showcase: {
    key: 'product_showcase',
    label: 'Product Showcase',
    category: 'marketing_and_product',
    basePreset: 'luxury_brand',
    visualStyle: '3d_render',
    motion: 'showcase_arc'
  },
  luxury_commercial: {
    key: 'luxury_commercial',
    label: 'Luxury Commercial',
    category: 'marketing_and_product',
    basePreset: 'luxury_brand',
    visualStyle: 'cinematic_film',
    motion: 'luxury_silk'
  },
  brand_promotion: {
    key: 'brand_promotion',
    label: 'Brand Promotion',
    category: 'marketing_and_product',
    basePreset: 'luxury_brand',
    visualStyle: 'realistic',
    motion: 'brand_glide'
  },
  product_explainer: {
    key: 'product_explainer',
    label: 'Product Explainer',
    category: 'marketing_and_product',
    basePreset: 'tech_modern',
    visualStyle: '3d_render',
    motion: 'explainer_pull'
  },
  lifestyle_advertisement: {
    key: 'lifestyle_advertisement',
    label: 'Lifestyle Advertisement',
    category: 'marketing_and_product',
    basePreset: 'luxury_brand',
    visualStyle: 'realistic',
    motion: 'lifestyle_drift'
  },

  // 6. Social & Viral
  instagram_reels: {
    key: 'instagram_reels',
    label: 'Instagram Reels',
    category: 'social_and_viral',
    basePreset: 'tiktok_viral',
    visualStyle: 'realistic',
    motion: 'viral_snap'
  },
  youtube_shorts: {
    key: 'youtube_shorts',
    label: 'YouTube Shorts',
    category: 'social_and_viral',
    basePreset: 'mr_beast',
    visualStyle: 'realistic',
    motion: 'shorts_punch'
  },
  fast_facts: {
    key: 'fast_facts',
    label: 'Fast Facts',
    category: 'social_and_viral',
    basePreset: 'tiktok_viral',
    visualStyle: 'minimalist_flat',
    motion: 'fast_pan'
  },
  trending_edit: {
    key: 'trending_edit',
    label: 'Trending Edit',
    category: 'social_and_viral',
    basePreset: 'tiktok_viral',
    visualStyle: 'cinematic_film',
    motion: 'viral_snap'
  },

  // 7. Motivational & Inspirational
  motivational_speech: {
    key: 'motivational_speech',
    label: 'Motivational Speech',
    category: 'motivational_and_inspirational',
    basePreset: 'cinematic',
    visualStyle: 'cinematic_film',
    motion: 'ascend_push'
  },
  success_mindset: {
    key: 'success_mindset',
    label: 'Success Mindset',
    category: 'motivational_and_inspirational',
    basePreset: 'luxury_brand',
    visualStyle: 'realistic',
    motion: 'ascend_push'
  },
  life_lessons: {
    key: 'life_lessons',
    label: 'Life Lessons',
    category: 'motivational_and_inspirational',
    basePreset: 'documentary',
    visualStyle: 'realistic',
    motion: 'documentary_glide'
  },
  inspirational_journey: {
    key: 'inspirational_journey',
    label: 'Inspirational Journey',
    category: 'motivational_and_inspirational',
    basePreset: 'cinematic',
    visualStyle: 'cinematic_film',
    motion: 'epic_sweep'
  },

  // 8. Technology & Futuristic
  futuristic_technology: {
    key: 'futuristic_technology',
    label: 'Futuristic Technology',
    category: 'technology_and_futuristic',
    basePreset: 'tech_modern',
    visualStyle: '3d_render',
    motion: 'tech_scan'
  },
  cyberpunk: {
    key: 'cyberpunk',
    label: 'Cyberpunk',
    category: 'technology_and_futuristic',
    basePreset: 'tech_modern',
    visualStyle: 'surreal_editorial',
    motion: 'cyber_pan'
  },
  ai_and_innovation: {
    key: 'ai_and_innovation',
    label: 'AI & Innovation',
    category: 'technology_and_futuristic',
    basePreset: 'tech_modern',
    visualStyle: '3d_render',
    motion: 'tech_scan'
  },
  sci_fi_documentary: {
    key: 'sci_fi_documentary',
    label: 'Sci-Fi Documentary',
    category: 'technology_and_futuristic',
    basePreset: 'documentary',
    visualStyle: 'cinematic_film',
    motion: 'scifi_drift'
  },
  digital_world: {
    key: 'digital_world',
    label: 'Digital World',
    category: 'technology_and_futuristic',
    basePreset: 'tech_modern',
    visualStyle: '3d_render',
    motion: '3d_orbit'
  },

  // 9. Travel & Nature
  travel_cinematic: {
    key: 'travel_cinematic',
    label: 'Travel Cinematic',
    category: 'travel_and_nature',
    basePreset: 'cinematic',
    visualStyle: 'realistic',
    motion: 'aerial_glide'
  },
  nature_documentary: {
    key: 'nature_documentary',
    label: 'Nature Documentary',
    category: 'travel_and_nature',
    basePreset: 'documentary',
    visualStyle: 'realistic',
    motion: 'nature_pan'
  },
  adventure: {
    key: 'adventure',
    label: 'Adventure',
    category: 'travel_and_nature',
    basePreset: 'cinematic',
    visualStyle: 'realistic',
    motion: 'adventure_drift'
  },
  city_exploration: {
    key: 'city_exploration',
    label: 'City Exploration',
    category: 'travel_and_nature',
    basePreset: 'documentary',
    visualStyle: 'realistic',
    motion: 'city_pan'
  },
  wildlife_documentary: {
    key: 'wildlife_documentary',
    label: 'Wildlife Documentary',
    category: 'travel_and_nature',
    basePreset: 'documentary',
    visualStyle: 'realistic',
    motion: 'wildlife_stalk'
  },

  // 10. Corporate & Business
  corporate_presentation: {
    key: 'corporate_presentation',
    label: 'Corporate Presentation',
    category: 'corporate_and_business',
    basePreset: 'minimalist',
    visualStyle: 'minimalist_flat',
    motion: 'corporate_steady'
  },
  business_overview: {
    key: 'business_overview',
    label: 'Business Overview',
    category: 'corporate_and_business',
    basePreset: 'minimalist',
    visualStyle: 'minimalist_flat',
    motion: 'corporate_steady'
  },
  startup_pitch: {
    key: 'startup_pitch',
    label: 'Startup Pitch',
    category: 'corporate_and_business',
    basePreset: 'tech_modern',
    visualStyle: 'minimalist_flat',
    motion: 'pitch_push'
  },
  professional_training: {
    key: 'professional_training',
    label: 'Professional Training',
    category: 'corporate_and_business',
    basePreset: 'educational',
    visualStyle: 'minimalist_flat',
    motion: 'explainer_pull'
  },
  company_profile: {
    key: 'company_profile',
    label: 'Company Profile',
    category: 'corporate_and_business',
    basePreset: 'luxury_brand',
    visualStyle: 'realistic',
    motion: 'brand_glide'
  }
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
  mystery: 'mystery',
  documental: 'documentary',
  doc: 'documentary',
  cine: 'cinematic',
  dramatic: 'cinematic',
  educativo: 'educational',
  explainer: 'educational',

  // Category & sub-preset aliases across the 10 preset families
  cinematographic: 'cinematic',
  cinematic_documentary: 'cinematic_documentary',
  epic_cinematic: 'epic_cinematic',
  film_noir: 'film_noir',
  golden_hour: 'golden_hour',
  dramatic_storytelling: 'dramatic_storytelling',
  educational_and_explanatory: 'educational',
  educational_explainer: 'educational_explainer',
  science_explained: 'science_explained',
  history_explained: 'history_explained',
  animated_infographic: 'animated_infographic',
  whiteboard_explanation: 'whiteboard_explanation',
  storytelling_and_narrative: 'cinematic',
  epic_story: 'epic_story',
  fantasy_adventure: 'fantasy_adventure',
  emotional_story: 'emotional_story',
  historical_story: 'historical_story',
  animation_and_entertainment: 'tiktok_viral',
  anime_cinematic: 'anime_cinematic',
  '3d_animated_story': '3d_animated_story',
  cartoon_comedy: 'cartoon_comedy',
  manga_action: 'manga_action',
  claymation_story: 'claymation_story',
  marketing_and_product: 'luxury_brand',
  product_showcase: 'product_showcase',
  luxury_commercial: 'luxury_commercial',
  brand_promotion: 'brand_promotion',
  product_explainer: 'product_explainer',
  lifestyle_advertisement: 'lifestyle_advertisement',
  social_and_viral: 'tiktok_viral',
  instagram_reels: 'instagram_reels',
  youtube_shorts: 'youtube_shorts',
  fast_facts: 'fast_facts',
  trending_edit: 'trending_edit',
  motivational_and_inspirational: 'cinematic',
  motivational_speech: 'motivational_speech',
  success_mindset: 'success_mindset',
  life_lessons: 'life_lessons',
  inspirational_journey: 'inspirational_journey',
  technology_and_futuristic: 'tech_modern',
  futuristic_technology: 'futuristic_technology',
  cyberpunk: 'cyberpunk',
  ai_and_innovation: 'ai_and_innovation',
  'ai_&_innovation': 'ai_and_innovation',
  sci_fi_documentary: 'sci_fi_documentary',
  digital_world: 'digital_world',
  travel_and_nature: 'documentary',
  travel_cinematic: 'travel_cinematic',
  nature_documentary: 'nature_documentary',
  adventure: 'adventure',
  city_exploration: 'city_exploration',
  wildlife_documentary: 'wildlife_documentary',
  corporate_and_business: 'minimalist',
  corporate_presentation: 'corporate_presentation',
  business_overview: 'business_overview',
  startup_pitch: 'startup_pitch',
  professional_training: 'professional_training',
  company_profile: 'company_profile'
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

// Base voice settings per preset (10 presets + default), aligned with SAFETY_LIMITS
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

// Guidance tags for Eleven v4 per preset (10 presets + default)
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

// Visual styles decoupled from narrative presets (for image generation and rendering)
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

// Optional fine-tuning overrides per voice when a specific voice needs adjustment for a preset
const VOICE_PRESET_OVERRIDES = {
  // --- SPANISH (es) ---
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

  // --- ENGLISH (en) ---
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

function normalizePresetToken(rawPreset = 'default') {
  const cleaned = String(rawPreset || 'default')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return (
    PRESET_ALIASES[cleaned] ||
    PRESET_ALIASES[cleaned.replace(/_/g, '-')] ||
    PRESET_ALIASES[cleaned.replace(/-/g, '_')] ||
    cleaned ||
    'default'
  );
}

function getPresetVariant(rawPreset = 'default') {
  const normalized = normalizePresetToken(rawPreset);
  return PRESET_VARIANTS[normalized] || null;
}

function resolveBasePresetKey(rawPreset = 'default') {
  const normalized = normalizePresetToken(rawPreset);
  if (PRESET_VARIANTS[normalized]) {
    return PRESET_VARIANTS[normalized].basePreset;
  }
  if (Object.prototype.hasOwnProperty.call(PRESET_VOICE_SETTINGS, normalized)) {
    return normalized;
  }
  return 'default';
}

const GLOBALS = {
  ALL_PRODUCTS,
  PRODUCTS,
  CREDIT_CONFIG,
  PLAN_POLICIES,
  AI_MODELS,
  VOICE_MODEL_CONFIG,
  VOICE_CATALOG,
  STUDIO_LITE_VOICES_BY_LANG,
  VOICE_MAP,
  TONE_ALIASES,
  PRESET_CATEGORIES,
  PRESET_VARIANTS,
  PRESET_ALIASES,
  BASE_PRESET_MODIFIERS,
  PRESET_VOICE_SETTINGS,
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
  VOICE_CATALOG,
  STUDIO_LITE_VOICES_BY_LANG,
  VOICE_MAP,
  TONE_ALIASES,
  PRESET_CATEGORIES,
  PRESET_VARIANTS,
  PRESET_ALIASES,
  BASE_PRESET_MODIFIERS,
  PRESET_VOICE_SETTINGS,
  PRESET_VOICE_TAGS,
  VISUAL_STYLES,
  VOICE_PRESET_OVERRIDES,
  SAFETY_LIMITS,
  getStudioLiteVoices,
  resolveAiModelId,
  resolveVoiceModelId,
  modelSupportsAudioTags,
  normalizePresetToken,
  getPresetVariant,
  resolveBasePresetKey
};
