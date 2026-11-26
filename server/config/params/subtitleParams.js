// server/config/params/subtitleParams.js
const { resolveFormatParams } = require('./formatParams');
const { normalizePresetKey, resolveVariantKey } = require('./presetParams');
const {
  SUBTITLE_STYLE_CATALOG,
  resolveSubtitleStyle,
  getPresetSubtitleStyle
} = require('../../utils/subtitleStyles');

const VARIANT_SUBTITLE_OVERRIDES = Object.entries(SUBTITLE_STYLE_CATALOG).reduce(
  (acc, [presetKey, entry]) => {
    if (entry?.base) {
      acc[presetKey] = entry.base;
    }
    if (entry?.variants && typeof entry.variants === 'object') {
      for (const [variantKey, variantCfg] of Object.entries(entry.variants)) {
        acc[variantKey] = {
          ...(entry.base || {}),
          ...variantCfg
        };
      }
    }
    return acc;
  },
  {}
);

const SUBTITLE_SYNC_RULES = {
  enabledByDefault: true,
  stripVoiceTags: true,
  maxCharsPerLineByRatio: {
    '9:16': 26,
    '1:1': 32,
    '16:9': 44
  },
  maxLinesPerCue: 2,
  maxWordsPerCueByPreset: {
    viral_social: 4,
    tiktok_viral: 4,
    mr_beast: 3,
    animated_entertainment: 5,
    educational: 6,
    documentary: 6,
    cinematic: 6,
    default: 7
  },
  minCueDurationSec: 0.45,
  maxCueDurationSec: 4.2,
  gapMergeThresholdSec: 0.12
};

function resolveSubtitleStyleKey({ preset = 'default', variant = null, explicitStyle = null } = {}) {
  if (explicitStyle) {
    const cleanedExplicit = String(explicitStyle).trim().toLowerCase().replace(/\s+/g, '_');
    const matchedKey = Object.keys(VARIANT_SUBTITLE_OVERRIDES).find(
      (k) =>
        k === cleanedExplicit ||
        VARIANT_SUBTITLE_OVERRIDES[k]?.style === cleanedExplicit ||
        VARIANT_SUBTITLE_OVERRIDES[k]?.effectStyle === cleanedExplicit
    );
    if (matchedKey) return matchedKey;
  }

  const variantKey = resolveVariantKey(variant || preset);
  if (variantKey && VARIANT_SUBTITLE_OVERRIDES[variantKey]) {
    return variantKey;
  }

  const presetKey = normalizePresetKey(preset);
  return Object.prototype.hasOwnProperty.call(VARIANT_SUBTITLE_OVERRIDES, presetKey)
    ? presetKey
    : 'default';
}

function resolveSubtitleParams({
  preset = 'default',
  variant = null,
  aspectRatio = '9:16',
  resolution = '720p',
  plan = 'free_trial',
  explicitStyle = null,
  styleOverrides = {},
  syncOverrides = {}
} = {}) {
  const formatCfg = resolveFormatParams({ aspectRatio, resolution });
  const isVertical = formatCfg.aspectRatio === '9:16';

  const normalizedPresetKey = normalizePresetKey(preset);
  const resolvedVariant = resolveVariantKey(variant || preset) || variant || null;

  const resolvedPack = resolveSubtitleStyle({
    preset: normalizedPresetKey,
    presetVariant: resolvedVariant,
    aspectRatio: formatCfg.aspectRatio,
    resolution: formatCfg.resolution,
    plan
  });

  const styleKey = resolveSubtitleStyleKey({
    preset: normalizedPresetKey,
    variant: resolvedVariant,
    explicitStyle
  });

  const baseStyle =
    VARIANT_SUBTITLE_OVERRIDES[styleKey] ||
    resolvedPack.style ||
    getPresetSubtitleStyle('default');

  const mergedStyle = {
    ...baseStyle,
    ...(styleOverrides[styleKey] || styleOverrides[normalizedPresetKey] || {})
  };

  const bottomRatio = isVertical
    ? mergedStyle.bottomRatio9x16 ?? formatCfg.safeZones?.subtitleBottomRatio ?? 0.84
    : mergedStyle.bottomRatioDefault ?? formatCfg.safeZones?.subtitleBottomRatio ?? 0.88;

  const maxLineWidthRatio = Math.min(
    mergedStyle.maxLineWidthRatio ?? 0.84,
    formatCfg.safeZones?.subtitleMaxWidthRatio ?? 0.84
  );

  const sync = {
    ...SUBTITLE_SYNC_RULES,
    ...(resolvedPack.sync || {}),
    ...syncOverrides,
    maxCharsPerLine:
      syncOverrides.maxCharsPerLine ||
      SUBTITLE_SYNC_RULES.maxCharsPerLineByRatio[formatCfg.aspectRatio] ||
      32,
    maxWordsPerCue:
      syncOverrides.maxWordsPerCue ||
      SUBTITLE_SYNC_RULES.maxWordsPerCueByPreset[normalizedPresetKey] ||
      resolvedPack.sync?.maxWordsPerCue ||
      SUBTITLE_SYNC_RULES.maxWordsPerCueByPreset.default
  };

  return {
    styleKey,
    variantKey: resolvedPack.variantKey,
    aspectRatio: formatCfg.aspectRatio,
    resolution: formatCfg.resolution,
    style: {
      ...mergedStyle,
      bottomRatio,
      maxLineWidthRatio
    },
    sync,
    videoMeta: resolvedPack.videoMeta
  };
}

module.exports = {
  SUBTITLE_STYLE_CATALOG,
  VARIANT_SUBTITLE_OVERRIDES,
  SUBTITLE_SYNC_RULES,
  resolveSubtitleStyleKey,
  resolveSubtitleParams
};
