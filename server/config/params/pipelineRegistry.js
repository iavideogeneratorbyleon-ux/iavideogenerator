// server/config/params/pipelineRegistry.js
const { PLAN_POLICIES, PRODUCTS, AI_MODELS, VOICE_CATALOG } = require('../globals');
const { FORMAT_CATALOG, resolveFormatParams } = require('./formatParams');
const {
  VISUAL_STYLE_CATALOG,
  VISUAL_MEDIA_MODES,
  normalizeVisualStyleKey,
  normalizeVisualMediaModeKey,
  resolveVisualFormatParams,
  resolveSceneMediaType
} = require('./visualFormatParams');
const {
  PRESET_CATALOG,
  VARIANT_MODIFIERS,
  normalizePresetKey,
  resolvePresetParams
} = require('./presetParams');
const {
  SUBTITLE_STYLE_CATALOG,
  SUBTITLE_SYNC_RULES,
  resolveSubtitleParams
} = require('./subtitleParams');
const {
  DURATION_SCRIPT_PROFILES,
  AUDIO_MIX_DEFAULTS,
  SFX_CONFIG_DEFAULTS,
  resolveVoiceAndScriptParams
} = require('./voiceAndScriptParams');

function sanitizePlainObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) {
    // Evitar claves numéricas corruptas producidas al hacer spread de un string
    if (/^\d+$/.test(k) && typeof v === 'string' && v.length === 1) {
      continue;
    }
    cleaned[k] = v;
  }
  return cleaned;
}

function extractModelIdString(modelEntry, fallback = '') {
  if (typeof modelEntry === 'string' && modelEntry.trim()) {
    return modelEntry.trim();
  }
  if (modelEntry && typeof modelEntry === 'object') {
    const candidate =
      modelEntry.defaultModelId ||
      modelEntry.modelId ||
      modelEntry.model ||
      modelEntry.fallbackModelId ||
      modelEntry.id ||
      modelEntry.name;
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return fallback;
}

function enforcePlanConstraints({
  userPlan = 'free_trial',
  presetKey = 'default',
  visualStyleKey = 'realistic',
  mediaModeKey = 'static_only',
  resolution = '720p',
  mode = 'idea'
} = {}) {
  const policy = PLAN_POLICIES[userPlan] || PLAN_POLICIES.free_trial;

  const allowedPreset =
    policy.allowedPresets === 'all' ||
    (Array.isArray(policy.allowedPresets) && policy.allowedPresets.includes(presetKey))
      ? presetKey
      : policy.allowedPresets?.[0] || 'default';

  const allowedVisualStyle =
    policy.allowedVisualStyles === 'all' ||
    (Array.isArray(policy.allowedVisualStyles) &&
      policy.allowedVisualStyles.includes(visualStyleKey))
      ? visualStyleKey
      : policy.allowedVisualStyles?.[0] || 'realistic';

  const allowedResolution =
    Array.isArray(policy.allowedResolutions) &&
    policy.allowedResolutions.includes(resolution)
      ? resolution
      : policy.allowedResolutions?.[0] || '720p';

  const allowedMediaMode =
    policy.allowedMediaModes === 'all' ||
    !Array.isArray(policy.allowedMediaModes)
      ? mediaModeKey
      : policy.allowedMediaModes.includes(mediaModeKey)
        ? mediaModeKey
        : policy.allowedMediaModes[0] || 'static_only';

  const isCustomScriptMode = mode === 'custom_script' || mode === 'script';
  const allowedMode =
    isCustomScriptMode && !policy.allowCustomScript ? 'idea' : mode;

  return {
    policy,
    presetKey: allowedPreset,
    visualStyleKey: allowedVisualStyle,
    mediaModeKey: allowedMediaMode,
    resolution: allowedResolution,
    mode: allowedMode
  };
}

function resolvePipelineParameters(rawPayload = {}, adminOverrides = {}) {
  const payload = sanitizePlainObject(rawPayload);
  const meta = sanitizePlainObject(payload.meta);
  const userInputs = sanitizePlainObject(payload.userInputs);
  const videoConfig = sanitizePlainObject(payload.videoConfig);
  const voiceConfig = sanitizePlainObject(payload.voiceConfig);
  const rawVoiceObj = sanitizePlainObject(payload.voice);

  const userPlan = Object.prototype.hasOwnProperty.call(PLAN_POLICIES, meta.userPlan)
    ? meta.userPlan
    : 'free_trial';
  const product = Object.prototype.hasOwnProperty.call(PRODUCTS, meta.product || payload.product)
    ? meta.product || payload.product
    : 'studio_lite';

  const rawPreset =
    videoConfig.preset || userInputs.preset || meta.preset || 'default';
  const rawVariant =
    videoConfig.presetVariant || userInputs.presetVariant || meta.presetVariant || null;

  const requestedPresetKey = normalizePresetKey(rawPreset);
  const presetPreview = resolvePresetParams(requestedPresetKey, {
    overrides: adminOverrides.presets || {},
    rawVariant
  });

  const requestedVisualStyle = normalizeVisualStyleKey(
    videoConfig.visualStyle || userInputs.visualStyle || meta.visualStyle || 'realistic'
  );

  const requestedMediaMode = normalizeVisualMediaModeKey(
    videoConfig.mediaMode ||
      userInputs.mediaMode ||
      meta.mediaMode ||
      presetPreview.visualDirective?.preferredMediaMode ||
      'static_only'
  );

  const requestedResolution =
    videoConfig.resolution || meta.resolution || '720p';
  const requestedAspectRatio =
    videoConfig.aspectRatio || payload.aspectRatio || meta.aspectRatio || '9:16';
  const requestedMode =
    userInputs.mode || meta.mode || 'idea';

  const constrained = enforcePlanConstraints({
    userPlan,
    presetKey: requestedPresetKey,
    visualStyleKey: requestedVisualStyle,
    mediaModeKey: requestedMediaMode,
    resolution: requestedResolution,
    mode: requestedMode
  });

  const format = resolveFormatParams({
    aspectRatio: requestedAspectRatio,
    resolution: constrained.resolution,
    overrides: adminOverrides.formats || {}
  });

  const preset = resolvePresetParams(constrained.presetKey, {
    overrides: adminOverrides.presets || {},
    rawVariant
  });

  const visualFormat = resolveVisualFormatParams({
    visualStyle: constrained.visualStyleKey,
    mediaMode: constrained.mediaModeKey,
    styleOverrides: adminOverrides.visualStyles || {},
    modeOverrides: adminOverrides.mediaModes || {}
  });

  const subtitles = resolveSubtitleParams({
    preset: preset.key,
    variant: preset.activeVariant,
    aspectRatio: format.aspectRatio,
    resolution: format.resolution,
    plan: userPlan,
    explicitStyle: userInputs.subtitleStyle || videoConfig.subtitleStyle || null,
    styleOverrides: adminOverrides.subtitles?.styles || {},
    syncOverrides: adminOverrides.subtitles?.sync || {}
  });

  const voiceKey =
    typeof payload.voice === 'string'
      ? payload.voice
      : rawVoiceObj.key || rawVoiceObj.name || userInputs.voice || null;
  const voiceId =
    rawVoiceObj.id || voiceConfig.voiceId || userInputs.voiceId || null;

  const voiceAndScript = resolveVoiceAndScriptParams({
    language: userInputs.language || meta.language || payload.language || 'en',
    userPlan,
    preset: preset.key,
    rawVariant: preset.activeVariant,
    voiceKey,
    voiceId,
    explicitModelId: voiceConfig.modelId || rawVoiceObj.modelId || null,
    durationSec:
      userInputs.durationSec ||
      meta.targetDurationSeconds ||
      videoConfig.durationSec ||
      30,
    mode: constrained.mode,
    mediaModeKey: visualFormat.mediaMode.key,
    overrides: adminOverrides.voiceAndScript || {}
  });

  const rawResolvedImageId = extractModelIdString(
    AI_MODELS?.image?.byPreset?.[preset.key],
    extractModelIdString(AI_MODELS?.image, 'gemini-2.5-flash-image')
  );
  const resolvedImageModelId = rawResolvedImageId.startsWith('imagen-')
    ? 'gemini-2.5-flash-image'
    : rawResolvedImageId;

  return {
    meta: {
      userPlan,
      product,
      watermarkRequired: Boolean(constrained.policy.watermarkRequired),
      allowsCustomOverrides: Boolean(
        constrained.policy.allowCustomOverrides && PRODUCTS[product]?.allowsCustomOverrides
      )
    },
    format,
    preset,
    visualFormat,
    subtitles,
    voiceAndScript,
    models: {
      llm: extractModelIdString(AI_MODELS?.llm, 'gemini-2.5-flash'),
      tts: extractModelIdString(AI_MODELS?.tts, ''),
      stt: extractModelIdString(AI_MODELS?.stt, ''),
      image: resolvedImageModelId
    }
  };
}

function buildNormalizedPipelinePayload(rawPayload = {}, adminOverrides = {}) {
  const payload = sanitizePlainObject(rawPayload);
  const resolved = resolvePipelineParameters(payload, adminOverrides);
  const resolvedTitle =
    payload.title ||
    payload.structuredScript?.title ||
    payload.llmDirective?.structuredScript?.title ||
    'Studio Lite Video';

  return {
    ...payload,
    title: resolvedTitle,
    aspectRatio: resolved.format.aspectRatio,
    meta: {
      ...sanitizePlainObject(payload.meta),
      userPlan: resolved.meta.userPlan,
      product: resolved.meta.product,
      preset: resolved.preset.key,
      presetVariant: resolved.preset.activeVariant,
      visualStyle: resolved.visualFormat.style.key,
      mediaMode: resolved.visualFormat.mediaMode.key,
      aspectRatio: resolved.format.aspectRatio,
      resolution: resolved.format.resolution,
      language: resolved.voiceAndScript.language,
      targetDurationSeconds: resolved.voiceAndScript.script.durationSeconds,
      watermarkRequired: resolved.meta.watermarkRequired
    },
    videoConfig: {
      ...sanitizePlainObject(payload.videoConfig),
      aspectRatio: resolved.format.aspectRatio,
      resolution: resolved.format.resolution,
      width: resolved.format.width,
      height: resolved.format.height,
      preset: resolved.preset.key,
      presetVariant: resolved.preset.activeVariant,
      visualStyle: resolved.visualFormat.style.key,
      mediaMode: resolved.visualFormat.mediaMode.key,
      subtitleStyle: resolved.subtitles.styleKey
    },
    voice: {
      ...sanitizePlainObject(typeof payload.voice === 'object' ? payload.voice : {}),
      ...resolved.voiceAndScript.voice
    },
    voiceConfig: {
      ...sanitizePlainObject(payload.voiceConfig),
      voiceKey: resolved.voiceAndScript.voice.key,
      voiceId: resolved.voiceAndScript.voice.id,
      modelId: resolved.voiceAndScript.voice.modelId,
      settings: resolved.voiceAndScript.voice.settings
    },
    resolvedParams: resolved
  };
}

function getAdminParameterSchema() {
  return {
    formats: FORMAT_CATALOG,
    visualStyles: VISUAL_STYLE_CATALOG,
    visualMediaModes: VISUAL_MEDIA_MODES,
    presets: PRESET_CATALOG,
    presetVariants: VARIANT_MODIFIERS,
    subtitles: {
      styles: SUBTITLE_STYLE_CATALOG,
      sync: SUBTITLE_SYNC_RULES
    },
    voiceAndScript: {
      voices: VOICE_CATALOG,
      durationProfiles: DURATION_SCRIPT_PROFILES,
      audioMixDefaults: AUDIO_MIX_DEFAULTS,
      sfxDefaults: SFX_CONFIG_DEFAULTS
    },
    plans: PLAN_POLICIES,
    models: AI_MODELS
  };
}

module.exports = {
  resolvePipelineParameters,
  buildNormalizedPipelinePayload,
  resolveSceneMediaType,
  getAdminParameterSchema
};
