// server/config/params/voiceAndScriptParams.js
const {
  VOICE_CATALOG,
  STUDIO_LITE_VOICES_BY_LANG,
  VOICE_PRESET_OVERRIDES,
  SAFETY_LIMITS,
  PLAN_POLICIES,
  resolveVoiceModelId,
  modelSupportsAudioTags
} = require('../globals');
const { resolvePresetParams } = require('./presetParams');

const DURATION_SCRIPT_PROFILES = {
  30: {
    durationSeconds: 30,
    recommendedScenes: { min: 4, max: 5, target: 5 },
    wordsPerMinuteTarget: 145,
    maxTotalWords: 78,
    minTotalWords: 55,
    endingBufferSeconds: 1.5,
    maxSfxCues: 2,
    sceneSplitRatios: { hook: 0.2, body: 0.65, cta: 0.15 }
  },
  60: {
    durationSeconds: 60,
    recommendedScenes: { min: 6, max: 8, target: 7 },
    wordsPerMinuteTarget: 145,
    maxTotalWords: 155,
    minTotalWords: 115,
    endingBufferSeconds: 1.5,
    maxSfxCues: 4,
    sceneSplitRatios: { hook: 0.15, body: 0.72, cta: 0.13 }
  },
  90: {
    durationSeconds: 90,
    recommendedScenes: { min: 8, max: 12, target: 10 },
    wordsPerMinuteTarget: 145,
    maxTotalWords: 230,
    minTotalWords: 175,
    endingBufferSeconds: 2.0,
    maxSfxCues: 6,
    sceneSplitRatios: { hook: 0.12, body: 0.76, cta: 0.12 }
  }
};

const AUDIO_MIX_DEFAULTS = {
  fadeInSeconds: 1.0,
  fadeOutSeconds: 2.0,
  duckingEnabled: true,
  duckedVolumeRatio: 0.42,
  voiceNormalizationLufs: -14
};

const SFX_CONFIG_DEFAULTS = {
  allowedCategories: ['whoosh', 'impact', 'ambient', 'ui_click', 'riser', 'foley_subtle'],
  allowedTimings: ['on_enter', 'mid_scene', 'on_beat'],
  defaultGain: 0.18,
  minGain: 0.08,
  maxGain: 0.28,
  enabledMediaModes: [
    'motion_images_only',
    'video_clips_only',
    'hybrid_stills_motion',
    'hybrid_stills_clips',
    'hybrid_full_mix'
  ],
  disabledPresets: ['minimalist'],
  categoriesByPreset: {
    cinematic: ['whoosh', 'impact', 'riser', 'ambient'],
    storytelling: ['ambient', 'riser', 'impact', 'foley_subtle'],
    viral_social: ['whoosh', 'impact', 'ui_click', 'riser'],
    animated_entertainment: ['whoosh', 'impact', 'foley_subtle'],
    tech_futuristic: ['ui_click', 'whoosh', 'riser', 'ambient'],
    travel_nature: ['ambient', 'foley_subtle', 'whoosh'],
    educational: ['ui_click', 'whoosh'],
    commercial_product: ['whoosh', 'riser', 'foley_subtle'],
    motivational: ['riser', 'impact', 'whoosh'],
    corporate_pro: ['ui_click', 'whoosh'],
    default: ['whoosh', 'ambient']
  }
};

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Number(num.toFixed(3))));
}

function normalizeLanguage(rawLang = 'en') {
  return String(rawLang || 'en').trim().toLowerCase().startsWith('es') ? 'es' : 'en';
}

function resolveVoiceEntry({ voiceKey, voiceId, language = 'en', userPlan = 'free_trial' } = {}) {
  const lang = normalizeLanguage(language);
  const policy = PLAN_POLICIES[userPlan] || PLAN_POLICIES.free_trial;
  const allowPro = Boolean(policy.allowProVoices);

  let entry = null;

  if (voiceKey && typeof voiceKey === 'string' && VOICE_CATALOG[voiceKey]) {
    entry = VOICE_CATALOG[voiceKey];
  } else if (voiceId && typeof voiceId === 'string') {
    entry = Object.values(VOICE_CATALOG).find((v) => v.id === voiceId) || null;
  }

  if (!entry || entry.language !== lang || (entry.tier === 'pro' && !allowPro)) {
    const allowedKeys = (STUDIO_LITE_VOICES_BY_LANG[lang] || []).filter((k) => {
      const candidate = VOICE_CATALOG[k];
      return candidate && (candidate.tier === 'free' || allowPro);
    });
    const fallbackKey = allowedKeys[0] || (lang === 'es' ? 'es_voice_1' : 'en_voice_1');
    entry = VOICE_CATALOG[fallbackKey];
  }

  return {
    key: entry.name,
    id: entry.id,
    voiceName: entry.voiceName,
    language: entry.language,
    profile: entry.profile,
    tier: entry.tier,
    accent: entry.accent
  };
}

function resolveDurationProfile(rawDurationSec = 30, userPlan = 'free_trial') {
  const policy = PLAN_POLICIES[userPlan] || PLAN_POLICIES.free_trial;
  const allowed =
    Array.isArray(policy.allowedDurationsSec) && policy.allowedDurationsSec.length
      ? policy.allowedDurationsSec
      : [30];
  const requested = Number(rawDurationSec) || policy.defaultDurationSeconds || 30;
  const chosenDuration = allowed.includes(requested)
    ? requested
    : allowed[allowed.length - 1] || 30;

  return DURATION_SCRIPT_PROFILES[chosenDuration] || DURATION_SCRIPT_PROFILES[30];
}

function resolveSfxDirective({
  presetKey = 'default',
  mediaModeKey = 'static_only',
  durationProfile = DURATION_SCRIPT_PROFILES[30],
  overrides = {}
} = {}) {
  const cfg = {
    ...SFX_CONFIG_DEFAULTS,
    ...(overrides || {})
  };

  const presetDisabled = (cfg.disabledPresets || []).includes(presetKey);
  const modeEnabled = (cfg.enabledMediaModes || []).includes(mediaModeKey);
  const enabled =
    typeof overrides?.enabled === 'boolean'
      ? overrides.enabled
      : !presetDisabled && modeEnabled;

  const preferredCategories =
    cfg.categoriesByPreset?.[presetKey] ||
    cfg.categoriesByPreset?.default ||
    cfg.allowedCategories;

  return {
    enabled,
    maxCuesPerVideo: enabled ? (overrides?.maxCuesPerVideo ?? durationProfile.maxSfxCues ?? 2) : 0,
    preferredCategories,
    allowedTimings: cfg.allowedTimings,
    defaultGain: clampNumber(cfg.defaultGain, cfg.minGain, cfg.maxGain, 0.18),
    minGain: cfg.minGain,
    maxGain: cfg.maxGain,
    priorityRule: 'voice_first_sfx_accent_music_ducked'
  };
}

function resolveVoiceAndScriptParams({
  language = 'en',
  userPlan = 'free_trial',
  preset = 'default',
  rawVariant = null,
  voiceKey = null,
  voiceId = null,
  explicitModelId = null,
  durationSec = 30,
  mode = 'idea',
  mediaModeKey = 'static_only',
  overrides = {}
} = {}) {
  const lang = normalizeLanguage(language);
  const presetCfg = resolvePresetParams(preset, { rawVariant });
  const voiceMeta = resolveVoiceEntry({
    voiceKey,
    voiceId,
    language: lang,
    userPlan
  });

  const modelId = resolveVoiceModelId({
    explicitModelId,
    preset: presetCfg.key,
    userPlan
  });
  const supportsTags = modelSupportsAudioTags(modelId);

  const baseVoice = presetCfg.voice?.settings || {};
  const modifiers = presetCfg.voice?.modifiers || {};
  const perVoiceOverride =
    VOICE_PRESET_OVERRIDES[voiceMeta.key]?.[presetCfg.activeVariant] ||
    VOICE_PRESET_OVERRIDES[voiceMeta.key]?.[presetCfg.key] ||
    {};
  const adminVoiceOverride = overrides?.voice || {};

  const rawSpeed =
    perVoiceOverride.speed ??
    Number(baseVoice.speed ?? SAFETY_LIMITS.voiceSpeed.defaultValue) +
      Number(modifiers.speedDelta || 0);
  const rawStability =
    perVoiceOverride.stability ??
    Number(baseVoice.stability ?? SAFETY_LIMITS.voiceStability.defaultValue) +
      Number(modifiers.stabilityDelta || 0);
  const rawStyle =
    perVoiceOverride.style ??
    Number(baseVoice.style ?? SAFETY_LIMITS.voiceStyle.defaultValue) +
      Number(modifiers.styleDelta || 0);
  const rawSimilarity =
    perVoiceOverride.similarity_boost ??
    baseVoice.similarity_boost ??
    SAFETY_LIMITS.voiceSimilarity.defaultValue;

  const finalSettings = {
    speed: clampNumber(
      adminVoiceOverride.speed ?? rawSpeed,
      SAFETY_LIMITS.voiceSpeed.min,
      SAFETY_LIMITS.voiceSpeed.max,
      SAFETY_LIMITS.voiceSpeed.defaultValue
    ),
    stability: clampNumber(
      adminVoiceOverride.stability ?? rawStability,
      SAFETY_LIMITS.voiceStability.min,
      SAFETY_LIMITS.voiceStability.max,
      SAFETY_LIMITS.voiceStability.defaultValue
    ),
    style: clampNumber(
      adminVoiceOverride.style ?? rawStyle,
      SAFETY_LIMITS.voiceStyle.min,
      SAFETY_LIMITS.voiceStyle.max,
      SAFETY_LIMITS.voiceStyle.defaultValue
    ),
    similarity_boost: clampNumber(
      adminVoiceOverride.similarity_boost ?? rawSimilarity,
      SAFETY_LIMITS.voiceSimilarity.min,
      SAFETY_LIMITS.voiceSimilarity.max,
      SAFETY_LIMITS.voiceSimilarity.defaultValue
    ),
    use_speaker_boost:
      adminVoiceOverride.use_speaker_boost ?? baseVoice.use_speaker_boost ?? true
  };

  const durationProfile = resolveDurationProfile(durationSec, userPlan);
  const endingBufferSeconds = clampNumber(
    overrides?.endingBufferSeconds ?? durationProfile.endingBufferSeconds,
    SAFETY_LIMITS.endingBufferSeconds.min,
    SAFETY_LIMITS.endingBufferSeconds.max,
    SAFETY_LIMITS.endingBufferSeconds.defaultValue
  );

  const audioMix = {
    ...AUDIO_MIX_DEFAULTS,
    fadeOutSeconds:
      presetCfg.musicDirective?.fadeOutSeconds ?? AUDIO_MIX_DEFAULTS.fadeOutSeconds,
    duckingEnabled:
      presetCfg.musicDirective?.duckingEnabled ?? AUDIO_MIX_DEFAULTS.duckingEnabled,
    baseMusicVolume: presetCfg.musicDirective?.baseVolume ?? 0.18,
    ...(overrides?.audioMix || {})
  };

  const sfxDirective = resolveSfxDirective({
    presetKey: presetCfg.key,
    mediaModeKey,
    durationProfile,
    overrides: overrides?.sfx
  });

  return {
    language: lang,
    mode: mode === 'script' ? 'script' : 'idea',
    voice: {
      ...voiceMeta,
      modelId,
      supportsAudioTags: supportsTags,
      settings: finalSettings,
      tags: supportsTags ? presetCfg.voice?.tags || {} : null
    },
    script: {
      ...durationProfile,
      endingBufferSeconds,
      tone: presetCfg.scriptDirective.tone,
      pacing: presetCfg.scriptDirective.pacing,
      hookStyle: presetCfg.scriptDirective.hookStyle,
      ctaStyle: presetCfg.scriptDirective.ctaStyle,
      keepCleanVoiceoverText: true,
      includeSpokenTextWithTags: supportsTags
    },
    audioMix,
    sfxDirective
  };
}

module.exports = {
  DURATION_SCRIPT_PROFILES,
  AUDIO_MIX_DEFAULTS,
  SFX_CONFIG_DEFAULTS,
  resolveVoiceEntry,
  resolveDurationProfile,
  resolveSfxDirective,
  resolveVoiceAndScriptParams
};
