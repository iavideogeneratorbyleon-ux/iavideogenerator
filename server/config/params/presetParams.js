// server/config/params/presetParams.js
const {
  PRESET_ALIASES: LEGACY_PRESET_ALIASES,
  BASE_PRESET_MODIFIERS,
  PRESET_VOICE_SETTINGS,
  PRESET_VOICE_TAGS
} = require('../globals');

const VARIANT_MODIFIERS = {
  // Cinematic variants
  cinematic_documentary: {
    label: 'Cinematic Documentary',
    toneSuffix: 'grounded in real-world observation with cinematic depth',
    cameraMotion: 'documentary_pan',
    colorMood: 'authentic_film'
  },
  epic_cinematic: {
    label: 'Epic Cinematic',
    toneSuffix: 'grand, sweeping, heroic scale',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'rich_cinema'
  },
  film_noir: {
    label: 'Film Noir',
    toneSuffix: 'moody, shadow-driven, high-contrast detective atmosphere',
    cameraMotion: 'suspense_creep',
    colorMood: 'dark_shadow'
  },
  golden_hour: {
    label: 'Golden Hour',
    toneSuffix: 'warm sunset light, nostalgic and evocative',
    cameraMotion: 'gentle_push',
    colorMood: 'warm_editorial'
  },
  dramatic_storytelling: {
    label: 'Dramatic Storytelling',
    toneSuffix: 'emotionally charged narrative arc',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'rich_cinema'
  },

  // Educational variants
  educational_explainer: {
    label: 'Educational Explainer',
    toneSuffix: 'step-by-step clarity and structured explanation',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'crisp_informative'
  },
  science_explained: {
    label: 'Science Explained',
    toneSuffix: 'analytical, curious, precision-focused explanation',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'crisp_informative'
  },
  history_explained: {
    label: 'History Explained',
    toneSuffix: 'chronological clarity with historical context',
    cameraMotion: 'documentary_pan',
    colorMood: 'authentic_film'
  },
  animated_infographic: {
    label: 'Animated Infographic',
    toneSuffix: 'data-driven, visual hierarchy and concise takeaways',
    cameraMotion: 'tech_pan_zoom',
    colorMood: 'crisp_informative'
  },
  whiteboard_explanation: {
    label: 'Whiteboard Explanation',
    toneSuffix: 'clean visual breakdown and straightforward teaching',
    cameraMotion: 'gentle_push',
    colorMood: 'clean_neutral'
  },

  // Storytelling variants
  epic_story: {
    label: 'Epic Story',
    toneSuffix: 'large-scale narrative stakes and vivid progression',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'rich_cinema'
  },
  fantasy_adventure: {
    label: 'Fantasy Adventure',
    toneSuffix: 'imaginative world-building and quest momentum',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'rich_cinema'
  },
  emotional_story: {
    label: 'Emotional Story',
    toneSuffix: 'intimate, human, heartfelt progression',
    cameraMotion: 'gentle_push',
    colorMood: 'warm_editorial'
  },
  mystery: {
    label: 'Mystery',
    toneSuffix: 'suspenseful clues and unanswered tension',
    cameraMotion: 'suspense_creep',
    colorMood: 'dark_shadow'
  },
  dark_mystery: {
    label: 'Dark Mystery',
    toneSuffix: 'eerie, enigmatic, unsettling investigative tension',
    cameraMotion: 'mystery_creep',
    colorMood: 'dark_shadow'
  },
  netflix_thriller: {
    label: 'Netflix Thriller / Series',
    toneSuffix: 'serialized hook, cliffhanger pacing and dramatic tension',
    cameraMotion: 'suspense_creep',
    colorMood: 'series_moody'
  },
  historical_story: {
    label: 'Historical Story',
    toneSuffix: 'period-aware storytelling with human stakes',
    cameraMotion: 'documentary_pan',
    colorMood: 'authentic_film'
  },

  // Animated & entertainment variants
  anime_cinematic: {
    label: 'Anime Cinematic',
    toneSuffix: 'expressive anime drama and atmospheric pacing',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'vibrant_social'
  },
  '3d_animated_story': {
    label: '3D Animated Story',
    toneSuffix: 'lively 3D character-driven narrative',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'crisp_informative'
  },
  cartoon_comedy: {
    label: 'Cartoon Comedy',
    toneSuffix: 'playful, witty, upbeat comedic timing',
    cameraMotion: 'dynamic_punch',
    colorMood: 'vibrant_social'
  },
  manga_action: {
    label: 'Manga Action',
    toneSuffix: 'high-impact, punchy, dramatic action beats',
    cameraMotion: 'high_energy_zoom',
    colorMood: 'punchy_high_contrast'
  },
  claymation_story: {
    label: 'Claymation Story',
    toneSuffix: 'tactile, charming, handcrafted stop-motion feel',
    cameraMotion: 'gentle_push',
    colorMood: 'warm_editorial'
  },

  // Commercial & product variants
  product_showcase: {
    label: 'Product Showcase',
    toneSuffix: 'highlighting product craftsmanship, detail and value',
    cameraMotion: 'luxury_glide',
    colorMood: 'warm_editorial'
  },
  luxury_brand: {
    label: 'Luxury Brand',
    toneSuffix: 'refined, prestigious, high-craft brand poise',
    cameraMotion: 'luxury_glide',
    colorMood: 'warm_editorial'
  },
  brand_promotion: {
    label: 'Brand Promotion',
    toneSuffix: 'distinctive brand identity and clear value proposition',
    cameraMotion: 'gentle_push',
    colorMood: 'crisp_informative'
  },
  product_explainer: {
    label: 'Product Explainer',
    toneSuffix: 'clear problem-solution flow and practical benefits',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'crisp_informative'
  },
  lifestyle_advertisement: {
    label: 'Lifestyle Advertisement',
    toneSuffix: 'aspirational everyday context and emotional resonance',
    cameraMotion: 'luxury_glide',
    colorMood: 'warm_editorial'
  },

  // Viral & social variants
  tiktok_viral: {
    label: 'TikTok Viral',
    toneSuffix: 'immediate hook, conversational energy and fast cuts',
    cameraMotion: 'dynamic_punch',
    colorMood: 'vibrant_social'
  },
  instagram_reels: {
    label: 'Instagram Reels',
    toneSuffix: 'visually punchy, trendy and engaging short-form flow',
    cameraMotion: 'dynamic_punch',
    colorMood: 'vibrant_social'
  },
  youtube_shorts: {
    label: 'YouTube Shorts',
    toneSuffix: 'high-retention hook and tight payoff',
    cameraMotion: 'dynamic_punch',
    colorMood: 'vibrant_social'
  },
  fast_facts: {
    label: 'Fast Facts',
    toneSuffix: 'rapid-fire interesting facts with zero fluff',
    cameraMotion: 'high_energy_zoom',
    colorMood: 'punchy_high_contrast'
  },
  trending_edit: {
    label: 'Trending Edit',
    toneSuffix: 'snappy rhythm and modern social momentum',
    cameraMotion: 'dynamic_punch',
    colorMood: 'vibrant_social'
  },
  mr_beast: {
    label: 'MrBeast High Energy',
    toneSuffix: 'high stakes, rapid escalation and bold energy',
    cameraMotion: 'high_energy_zoom',
    colorMood: 'punchy_high_contrast'
  },

  // Motivational variants
  motivational_speech: {
    label: 'Motivational Speech',
    toneSuffix: 'inspiring, resolute and emotionally uplifting cadence',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'warm_editorial'
  },
  success_mindset: {
    label: 'Success Mindset',
    toneSuffix: 'disciplined, focused and action-oriented encouragement',
    cameraMotion: 'gentle_push',
    colorMood: 'rich_cinema'
  },
  life_lessons: {
    label: 'Life Lessons',
    toneSuffix: 'reflective wisdom and grounded personal insight',
    cameraMotion: 'slow_drift',
    colorMood: 'warm_editorial'
  },
  inspirational_journey: {
    label: 'Inspirational Journey',
    toneSuffix: 'progressive arc from struggle to breakthrough',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'warm_editorial'
  },

  // Tech & futuristic variants
  tech_modern: {
    label: 'Tech Modern',
    toneSuffix: 'crisp contemporary technology and practical clarity',
    cameraMotion: 'tech_pan_zoom',
    colorMood: 'clean_futuristic'
  },
  futuristic_technology: {
    label: 'Futuristic Technology',
    toneSuffix: 'forward-looking breakthroughs and next-gen concepts',
    cameraMotion: 'tech_pan_zoom',
    colorMood: 'clean_futuristic'
  },
  cyberpunk: {
    label: 'Cyberpunk',
    toneSuffix: 'neon-lit, gritty high-tech urban tension',
    cameraMotion: 'dynamic_punch',
    colorMood: 'series_moody'
  },
  ai_innovation: {
    label: 'AI & Innovation',
    toneSuffix: 'intelligent systems, automation and future workflows',
    cameraMotion: 'tech_pan_zoom',
    colorMood: 'clean_futuristic'
  },
  sci_fi_documentary: {
    label: 'Sci-Fi Documentary',
    toneSuffix: 'speculative science grounded in plausible exploration',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'clean_futuristic'
  },
  digital_world: {
    label: 'Digital World',
    toneSuffix: 'connected networks, data flows and virtual spaces',
    cameraMotion: 'tech_pan_zoom',
    colorMood: 'clean_futuristic'
  },

  // Travel & nature variants
  documentary: {
    label: 'Documentary',
    toneSuffix: 'investigative, authentic and real-world grounded',
    cameraMotion: 'documentary_pan',
    colorMood: 'authentic_film'
  },
  travel_cinematic: {
    label: 'Travel Cinematic',
    toneSuffix: 'evocative destination atmosphere and scenic discovery',
    cameraMotion: 'cinematic_dolly',
    colorMood: 'warm_editorial'
  },
  nature_documentary: {
    label: 'Nature Documentary',
    toneSuffix: 'observational natural world and calm wonder',
    cameraMotion: 'documentary_pan',
    colorMood: 'authentic_film'
  },
  adventure: {
    label: 'Adventure',
    toneSuffix: 'bold exploration, movement and discovery',
    cameraMotion: 'dynamic_punch',
    colorMood: 'rich_cinema'
  },
  city_exploration: {
    label: 'City Exploration',
    toneSuffix: 'urban rhythm, street character and local culture',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'balanced_natural'
  },
  wildlife_documentary: {
    label: 'Wildlife Documentary',
    toneSuffix: 'patient observation and raw natural behavior',
    cameraMotion: 'documentary_pan',
    colorMood: 'authentic_film'
  },

  // Corporate & professional variants
  corporate_presentation: {
    label: 'Corporate Presentation',
    toneSuffix: 'structured, executive clarity and professional poise',
    cameraMotion: 'gentle_push',
    colorMood: 'clean_neutral'
  },
  business_overview: {
    label: 'Business Overview',
    toneSuffix: 'clear commercial metrics, strategy and execution',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'crisp_informative'
  },
  startup_pitch: {
    label: 'Startup Pitch',
    toneSuffix: 'compelling problem, vision and traction narrative',
    cameraMotion: 'gentle_push',
    colorMood: 'crisp_informative'
  },
  professional_training: {
    label: 'Professional Training',
    toneSuffix: 'clear instructional steps and workplace readiness',
    cameraMotion: 'smooth_pan_zoom',
    colorMood: 'clean_neutral'
  },
  company_profile: {
    label: 'Company Profile',
    toneSuffix: 'credible organization overview, culture and mission',
    cameraMotion: 'gentle_push',
    colorMood: 'clean_neutral'
  }
};

const PRESET_CATALOG = {
  default: {
    key: 'default',
    order: 0,
    label: 'Default',
    variants: [],
    scriptDirective: {
      tone: 'balanced, clear, engaging',
      pacing: 'medium',
      hookStyle: 'direct curiosity question or clear premise',
      ctaStyle: 'clean, natural call to action'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.default,
      modifiers: BASE_PRESET_MODIFIERS.default,
      tags: PRESET_VOICE_TAGS.default
    },
    visualDirective: {
      preferredMediaMode: 'static_only',
      motionIntensity: 'moderate',
      compositionHint: 'clear focal subject, balanced framing, natural lighting'
    },
    renderDirective: {
      cameraMotion: 'gentle_push',
      colorMood: 'balanced_natural',
      eqFilter: null
    },
    musicDirective: {
      category: 'default',
      baseVolume: 0.18,
      duckingEnabled: true,
      fadeOutSeconds: 2
    },
    subtitlePresetKey: 'default'
  },

  cinematic: {
    key: 'cinematic',
    order: 1,
    label: 'Cinematográficos',
    variants: [
      'cinematic_documentary',
      'epic_cinematic',
      'film_noir',
      'golden_hour',
      'dramatic_storytelling'
    ],
    scriptDirective: {
      tone: 'dramatic, evocative, atmospheric, story-driven',
      pacing: 'dramatic_arc',
      hookStyle: 'high-stakes scene or emotionally charged opening',
      ctaStyle: 'resonant final image + follow for more'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.cinematic,
      modifiers: BASE_PRESET_MODIFIERS.cinematic,
      tags: PRESET_VOICE_TAGS.cinematic
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_clips',
      motionIntensity: 'cinematic_sweep',
      compositionHint: 'cinema lighting, shallow depth of field, wide atmospheric framing'
    },
    renderDirective: {
      cameraMotion: 'cinematic_dolly',
      colorMood: 'rich_cinema',
      eqFilter: null
    },
    musicDirective: {
      category: 'cinematic',
      baseVolume: 0.21,
      duckingEnabled: true,
      fadeOutSeconds: 2.5
    },
    subtitlePresetKey: 'cinematic'
  },

  educational: {
    key: 'educational',
    order: 2,
    label: 'Educativos y explicativos',
    variants: [
      'educational_explainer',
      'science_explained',
      'history_explained',
      'animated_infographic',
      'whiteboard_explanation'
    ],
    scriptDirective: {
      tone: 'clear, structured, informative, accessible',
      pacing: 'steady_explained',
      hookStyle: 'counterintuitive fact or big-picture question',
      ctaStyle: 'takeaway summary + prompt to follow or explore more'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.educational,
      modifiers: BASE_PRESET_MODIFIERS.educational,
      tags: PRESET_VOICE_TAGS.educational
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_motion',
      motionIntensity: 'controlled_clarity',
      compositionHint: 'scene-organized visuals, diagrams/icons clarity, clean focal hierarchy'
    },
    renderDirective: {
      cameraMotion: 'smooth_pan_zoom',
      colorMood: 'crisp_informative',
      eqFilter: null
    },
    musicDirective: {
      category: 'educational',
      baseVolume: 0.19,
      duckingEnabled: true,
      fadeOutSeconds: 2
    },
    subtitlePresetKey: 'educational'
  },

  storytelling: {
    key: 'storytelling',
    order: 3,
    label: 'Storytelling y narrativos',
    variants: [
      'epic_story',
      'fantasy_adventure',
      'emotional_story',
      'mystery',
      'dark_mystery',
      'netflix_thriller',
      'historical_story'
    ],
    scriptDirective: {
      tone: 'narrative-driven with beginning, development and resolution',
      pacing: 'dramatic_arc',
      hookStyle: 'compelling premise, conflict or mystery hook',
      ctaStyle: 'memorable resolution or next-chapter cliffhanger'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.netflix,
      modifiers: BASE_PRESET_MODIFIERS.netflix,
      tags: PRESET_VOICE_TAGS.netflix
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_clips',
      motionIntensity: 'tense_cinema',
      compositionHint: 'character and setting continuity, narrative progression, atmospheric depth'
    },
    renderDirective: {
      cameraMotion: 'cinematic_dolly',
      colorMood: 'series_moody',
      eqFilter: null
    },
    musicDirective: {
      category: 'storytelling',
      baseVolume: 0.2,
      duckingEnabled: true,
      fadeOutSeconds: 2.5
    },
    subtitlePresetKey: 'netflix'
  },

  animated_entertainment: {
    key: 'animated_entertainment',
    order: 4,
    label: 'Animación y entretenimiento',
    variants: [
      'anime_cinematic',
      '3d_animated_story',
      'cartoon_comedy',
      'manga_action',
      'claymation_story'
    ],
    scriptDirective: {
      tone: 'expressive, lively, character-driven and entertaining',
      pacing: 'fast_snappy',
      hookStyle: 'playful, bold or visually dynamic opening',
      ctaStyle: 'fun closing beat + follow for more episodes'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.tiktok_viral,
      modifiers: BASE_PRESET_MODIFIERS.tiktok_viral,
      tags: PRESET_VOICE_TAGS.tiktok_viral
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_motion',
      motionIntensity: 'dynamic',
      compositionHint: 'stylized characters, expressive staging, visual continuity per animation medium'
    },
    renderDirective: {
      cameraMotion: 'dynamic_punch',
      colorMood: 'vibrant_social',
      eqFilter: null
    },
    musicDirective: {
      category: 'animated_entertainment',
      baseVolume: 0.21,
      duckingEnabled: true,
      fadeOutSeconds: 1.5
    },
    subtitlePresetKey: 'tiktok_viral'
  },

  commercial_product: {
    key: 'commercial_product',
    order: 5,
    label: 'Publicidad y productos',
    variants: [
      'product_showcase',
      'luxury_brand',
      'brand_promotion',
      'product_explainer',
      'lifestyle_advertisement'
    ],
    scriptDirective: {
      tone: 'persuasive, clear, benefit-oriented and polished',
      pacing: 'composed_elegance',
      hookStyle: 'key product benefit, desire or pain-point hook',
      ctaStyle: 'clear action step or brand invitation'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.luxury_brand,
      modifiers: BASE_PRESET_MODIFIERS.luxury_brand,
      tags: PRESET_VOICE_TAGS.luxury_brand
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_motion',
      motionIntensity: 'refined_glide',
      compositionHint: 'clean hero subject, commercial lighting, clear benefit focal points'
    },
    renderDirective: {
      cameraMotion: 'luxury_glide',
      colorMood: 'warm_editorial',
      eqFilter: null
    },
    musicDirective: {
      category: 'commercial_product',
      baseVolume: 0.18,
      duckingEnabled: true,
      fadeOutSeconds: 2
    },
    subtitlePresetKey: 'luxury_brand'
  },

  viral_social: {
    key: 'viral_social',
    order: 6,
    label: 'Redes sociales y contenido viral',
    variants: [
      'tiktok_viral',
      'instagram_reels',
      'youtube_shorts',
      'fast_facts',
      'trending_edit',
      'mr_beast'
    ],
    scriptDirective: {
      tone: 'punchy, fast-paced, conversational and high-retention',
      pacing: 'rapid_escalation',
      hookStyle: 'immediate pattern-interrupt in the first 2 seconds',
      ctaStyle: 'fast loop, comment prompt or follow push'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.mr_beast,
      modifiers: BASE_PRESET_MODIFIERS.mr_beast,
      tags: PRESET_VOICE_TAGS.mr_beast
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_full_mix',
      motionIntensity: 'high_energy',
      compositionHint: 'frequent visual shifts, bold focal subject, tight short-form framing'
    },
    renderDirective: {
      cameraMotion: 'high_energy_zoom',
      colorMood: 'punchy_high_contrast',
      eqFilter: null
    },
    musicDirective: {
      category: 'viral_social',
      baseVolume: 0.22,
      duckingEnabled: true,
      fadeOutSeconds: 1.5
    },
    subtitlePresetKey: 'mr_beast'
  },

  motivational: {
    key: 'motivational',
    order: 7,
    label: 'Motivacionales e inspiracionales',
    variants: [
      'motivational_speech',
      'success_mindset',
      'life_lessons',
      'inspirational_journey'
    ],
    scriptDirective: {
      tone: 'emotional, uplifting, resolute and progressive',
      pacing: 'dramatic_arc',
      hookStyle: 'resonant truth, mindset shift or uphill challenge',
      ctaStyle: 'empowering closing takeaway + follow for daily inspiration'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.cinematic,
      modifiers: BASE_PRESET_MODIFIERS.cinematic,
      tags: PRESET_VOICE_TAGS.cinematic
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_clips',
      motionIntensity: 'cinematic_sweep',
      compositionHint: 'aspirational imagery, rising light/momentum, strong focal presence'
    },
    renderDirective: {
      cameraMotion: 'cinematic_dolly',
      colorMood: 'warm_editorial',
      eqFilter: null
    },
    musicDirective: {
      category: 'motivational',
      baseVolume: 0.21,
      duckingEnabled: true,
      fadeOutSeconds: 2.5
    },
    subtitlePresetKey: 'cinematic'
  },

  tech_futuristic: {
    key: 'tech_futuristic',
    order: 8,
    label: 'Tecnológicos y futuristas',
    variants: [
      'tech_modern',
      'futuristic_technology',
      'cyberpunk',
      'ai_innovation',
      'sci_fi_documentary',
      'digital_world'
    ],
    scriptDirective: {
      tone: 'sharp, forward-looking, analytical and futuristic',
      pacing: 'crisp_modern',
      hookStyle: 'technological shift, AI breakthrough or future scenario',
      ctaStyle: 'forward-looking insight + follow for tech breakdowns'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.tech_modern,
      modifiers: BASE_PRESET_MODIFIERS.tech_modern,
      tags: PRESET_VOICE_TAGS.tech_modern
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_motion',
      motionIntensity: 'crisp_tech',
      compositionHint: 'futuristic environments, digital/data motifs, sharp contrast'
    },
    renderDirective: {
      cameraMotion: 'tech_pan_zoom',
      colorMood: 'clean_futuristic',
      eqFilter: null
    },
    musicDirective: {
      category: 'tech_futuristic',
      baseVolume: 0.19,
      duckingEnabled: true,
      fadeOutSeconds: 2
    },
    subtitlePresetKey: 'tech_modern'
  },

  travel_nature: {
    key: 'travel_nature',
    order: 9,
    label: 'Viajes, naturaleza y experiencias',
    variants: [
      'documentary',
      'travel_cinematic',
      'nature_documentary',
      'adventure',
      'city_exploration',
      'wildlife_documentary'
    ],
    scriptDirective: {
      tone: 'immersive, observational, experiential and evocative',
      pacing: 'measured_investigative',
      hookStyle: 'evocative landscape, place or journey moment',
      ctaStyle: 'inviting travel/nature reflection + follow for more destinations'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.documentary,
      modifiers: BASE_PRESET_MODIFIERS.documentary,
      tags: PRESET_VOICE_TAGS.documentary
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_clips',
      motionIntensity: 'authentic_documentary',
      compositionHint: 'wide landscapes, aerial/environmental scale, smooth transitions'
    },
    renderDirective: {
      cameraMotion: 'documentary_pan',
      colorMood: 'authentic_film',
      eqFilter: null
    },
    musicDirective: {
      category: 'travel_nature',
      baseVolume: 0.2,
      duckingEnabled: true,
      fadeOutSeconds: 2.5
    },
    subtitlePresetKey: 'documentary'
  },

  corporate_pro: {
    key: 'corporate_pro',
    order: 10,
    label: 'Corporativos y profesionales',
    variants: [
      'corporate_presentation',
      'business_overview',
      'startup_pitch',
      'professional_training',
      'company_profile'
    ],
    scriptDirective: {
      tone: 'formal, structured, credible and business-focused',
      pacing: 'steady_explained',
      hookStyle: 'clear business objective, market opportunity or core value',
      ctaStyle: 'professional next step or organizational takeaway'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.educational,
      modifiers: BASE_PRESET_MODIFIERS.educational,
      tags: PRESET_VOICE_TAGS.educational
    },
    visualDirective: {
      preferredMediaMode: 'hybrid_stills_motion',
      motionIntensity: 'controlled_clarity',
      compositionHint: 'clean layout, consistent color palette, structured visual clarity'
    },
    renderDirective: {
      cameraMotion: 'smooth_pan_zoom',
      colorMood: 'clean_neutral',
      eqFilter: null
    },
    musicDirective: {
      category: 'corporate_pro',
      baseVolume: 0.16,
      duckingEnabled: true,
      fadeOutSeconds: 2
    },
    subtitlePresetKey: 'educational'
  },

  minimalist: {
    key: 'minimalist',
    order: 11,
    label: 'Minimalista',
    variants: [],
    scriptDirective: {
      tone: 'calm, concise, intentional and unhurried',
      pacing: 'slow_deliberate',
      hookStyle: 'single crisp observation or quiet paradox',
      ctaStyle: 'short, understated closing thought'
    },
    voice: {
      settings: PRESET_VOICE_SETTINGS.minimalist,
      modifiers: BASE_PRESET_MODIFIERS.minimalist,
      tags: PRESET_VOICE_TAGS.minimalist
    },
    visualDirective: {
      preferredMediaMode: 'static_only',
      motionIntensity: 'subtle',
      compositionHint: 'generous negative space, clean lines, minimal clutter'
    },
    renderDirective: {
      cameraMotion: 'slow_drift',
      colorMood: 'clean_neutral',
      eqFilter: null
    },
    musicDirective: {
      category: 'minimalist',
      baseVolume: 0.16,
      duckingEnabled: true,
      fadeOutSeconds: 2.5
    },
    subtitlePresetKey: 'minimalist'
  }
};

const PRESET_ALIAS_MAP = {
  ...(LEGACY_PRESET_ALIASES || {}),
  // Cinematic
  cinematografico: 'cinematic',
  cinematograficos: 'cinematic',
  cinematic_documentary: 'cinematic',
  epic_cinematic: 'cinematic',
  film_noir: 'cinematic',
  golden_hour: 'cinematic',
  dramatic_storytelling: 'cinematic',

  // Educational
  educativos: 'educational',
  educativos_y_explicativos: 'educational',
  educational_explainer: 'educational',
  science_explained: 'educational',
  history_explained: 'educational',
  animated_infographic: 'educational',
  whiteboard_explanation: 'educational',

  // Storytelling
  storytelling_y_narrativos: 'storytelling',
  narrative: 'storytelling',
  epic_story: 'storytelling',
  fantasy_adventure: 'storytelling',
  emotional_story: 'storytelling',
  mystery: 'storytelling',
  dark_mystery: 'storytelling',
  netflix: 'storytelling',
  netflix_thriller: 'storytelling',
  historical_story: 'storytelling',

  // Animated & entertainment
  animacion: 'animated_entertainment',
  animacion_y_entretenimiento: 'animated_entertainment',
  animation: 'animated_entertainment',
  anime_cinematic: 'animated_entertainment',
  '3d_animated_story': 'animated_entertainment',
  cartoon_comedy: 'animated_entertainment',
  manga_action: 'animated_entertainment',
  claymation_story: 'animated_entertainment',

  // Commercial & product
  publicidad: 'commercial_product',
  publicidad_y_productos: 'commercial_product',
  commercial: 'commercial_product',
  product_showcase: 'commercial_product',
  luxury_brand: 'commercial_product',
  brand_promotion: 'commercial_product',
  product_explainer: 'commercial_product',
  lifestyle_advertisement: 'commercial_product',

  // Viral & social
  redes_sociales: 'viral_social',
  redes_sociales_y_contenido_viral: 'viral_social',
  viral_social: 'viral_social',
  tiktok_viral: 'viral_social',
  instagram_reels: 'viral_social',
  youtube_shorts: 'viral_social',
  fast_facts: 'viral_social',
  trending_edit: 'viral_social',
  mr_beast: 'viral_social',

  // Motivational
  motivacionales: 'motivational',
  motivacionales_e_inspiracionales: 'motivational',
  inspirational: 'motivational',
  motivational_speech: 'motivational',
  success_mindset: 'motivational',
  life_lessons: 'motivational',
  inspirational_journey: 'motivational',

  // Tech & futuristic
  tecnologicos: 'tech_futuristic',
  tecnologicos_y_futuristas: 'tech_futuristic',
  tech_modern: 'tech_futuristic',
  futuristic_technology: 'tech_futuristic',
  cyberpunk: 'tech_futuristic',
  ai_innovation: 'tech_futuristic',
  sci_fi_documentary: 'tech_futuristic',
  digital_world: 'tech_futuristic',

  // Travel & nature
  viajes: 'travel_nature',
  viajes_naturaleza_y_experiencias: 'travel_nature',
  travel: 'travel_nature',
  nature: 'travel_nature',
  documentary: 'travel_nature',
  travel_cinematic: 'travel_nature',
  nature_documentary: 'travel_nature',
  adventure: 'travel_nature',
  city_exploration: 'travel_nature',
  wildlife_documentary: 'travel_nature',

  // Corporate & professional
  corporativos: 'corporate_pro',
  corporativos_y_profesionales: 'corporate_pro',
  corporate: 'corporate_pro',
  corporate_presentation: 'corporate_pro',
  business_overview: 'corporate_pro',
  startup_pitch: 'corporate_pro',
  professional_training: 'corporate_pro',
  company_profile: 'corporate_pro'
};

function normalizePresetKey(rawPreset = 'default') {
  const cleaned = String(rawPreset || 'default')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const aliased =
    PRESET_ALIAS_MAP[cleaned] ||
    PRESET_ALIAS_MAP[cleaned.replace(/_/g, '-')] ||
    PRESET_ALIAS_MAP[cleaned.replace(/-/g, '_')] ||
    cleaned;

  return Object.prototype.hasOwnProperty.call(PRESET_CATALOG, aliased)
    ? aliased
    : 'default';
}

function resolveVariantKey(rawVariant = null) {
  if (!rawVariant) return null;
  const cleaned = String(rawVariant)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return Object.prototype.hasOwnProperty.call(VARIANT_MODIFIERS, cleaned)
    ? cleaned
    : null;
}

function resolvePresetParams(rawPreset = 'default', { overrides = {}, rawVariant = null } = {}) {
  const safeOverrides = overrides && typeof overrides === 'object' ? overrides : {};
  const cleanedRaw = String(rawPreset || 'default')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const key = normalizePresetKey(cleanedRaw);
  const variantKey = resolveVariantKey(rawVariant || cleanedRaw);
  const variant = variantKey ? VARIANT_MODIFIERS[variantKey] : null;

  const base = PRESET_CATALOG[key];
  const custom = safeOverrides[key] || {};

  const tone = variant?.toneSuffix
    ? `${base.scriptDirective.tone}, ${variant.toneSuffix}`
    : base.scriptDirective.tone;

  return {
    ...base,
    ...custom,
    activeVariant: variantKey,
    activeVariantLabel: variant?.label || null,
    scriptDirective: {
      ...base.scriptDirective,
      ...(custom.scriptDirective || {}),
      tone
    },
    voice: {
      ...base.voice,
      ...(custom.voice || {}),
      settings: {
        ...base.voice.settings,
        ...(custom.voice?.settings || {})
      },
      modifiers: {
        ...base.voice.modifiers,
        ...(custom.voice?.modifiers || {})
      },
      tags: {
        ...base.voice.tags,
        ...(custom.voice?.tags || {})
      }
    },
    visualDirective: {
      ...base.visualDirective,
      ...(custom.visualDirective || {})
    },
    renderDirective: {
      ...base.renderDirective,
      ...(custom.renderDirective || {}),
      cameraMotion:
        custom.renderDirective?.cameraMotion ||
        variant?.cameraMotion ||
        base.renderDirective.cameraMotion,
      colorMood:
        custom.renderDirective?.colorMood ||
        variant?.colorMood ||
        base.renderDirective.colorMood
    },
    musicDirective: {
      ...base.musicDirective,
      ...(custom.musicDirective || {})
    }
  };
}

module.exports = {
  PRESET_CATALOG,
  VARIANT_MODIFIERS,
  PRESET_ALIAS_MAP,
  normalizePresetKey,
  resolveVariantKey,
  resolvePresetParams
};
