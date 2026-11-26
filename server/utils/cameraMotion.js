// utils/cameraMotion.js
const { PRESET_VARIANTS, normalizePresetToken, resolveBasePresetKey } = require('../config/globals');

const CAMERA_MOTION_PROFILES = {
  punch_zoom_in: {
    baseZoom: 1.02,
    zoomDelta: 0.16,
    panXAmplitude: 0.08,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.44,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeOut'
  },
  clean_zoom_out: {
    baseZoom: 1.15,
    zoomDelta: -0.13,
    panXAmplitude: 0.05,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.015,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeOut'
  },
  dynamic_pan: {
    baseZoom: 1.07,
    zoomDelta: 0.05,
    panXAmplitude: 0.15,
    panXCycles: 0.85,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.03,
    panYCycles: 0.6,
    panYPhase: Math.PI / 2,
    easing: 'easeInOut'
  },
  smooth_drift: {
    baseZoom: 1.03,
    zoomDelta: 0.1,
    panXAmplitude: 0.08,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  slow_zoom_in: {
    baseZoom: 1.02,
    zoomDelta: 0.11,
    panXAmplitude: 0.06,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },

  // Dedicated motion profiles per sub-preset / category across the 10 preset families
  epic_sweep: {
    baseZoom: 1.03,
    zoomDelta: 0.13,
    panXAmplitude: 0.11,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  documentary_glide: {
    baseZoom: 1.01,
    zoomDelta: 0.085,
    panXAmplitude: 0.045,
    panXCycles: 0.4,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.015,
    panYCycles: 0.4,
    panYPhase: 0,
    easing: 'linear'
  },
  noir_drift: {
    baseZoom: 1.02,
    zoomDelta: 0.095,
    panXAmplitude: 0.065,
    panXCycles: 0.45,
    panXPhase: Math.PI / 6,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.45,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  golden_dolly: {
    baseZoom: 1.02,
    zoomDelta: 0.11,
    panXAmplitude: 0.085,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: Math.PI / 4,
    easing: 'easeInOut'
  },
  dramatic_push: {
    baseZoom: 1.02,
    zoomDelta: 0.14,
    panXAmplitude: 0.07,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeOut'
  },
  explainer_pull: {
    baseZoom: 1.15,
    zoomDelta: -0.12,
    panXAmplitude: 0.04,
    panXCycles: 0.4,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.015,
    panYCycles: 0.4,
    panYPhase: 0,
    easing: 'easeOut'
  },
  science_reveal: {
    baseZoom: 1.14,
    zoomDelta: -0.11,
    panXAmplitude: 0.055,
    panXCycles: 0.5,
    panXPhase: Math.PI / 4,
    basePanY: 0.49,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  history_pan: {
    baseZoom: 1.06,
    zoomDelta: 0.06,
    panXAmplitude: 0.12,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.015,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'linear'
  },
  infographic_step: {
    baseZoom: 1.04,
    zoomDelta: 0.09,
    panXAmplitude: 0.09,
    panXCycles: 0.75,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  whiteboard_pan: {
    baseZoom: 1.05,
    zoomDelta: 0.07,
    panXAmplitude: 0.11,
    panXCycles: 0.6,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.015,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'linear'
  },
  adventure_drift: {
    baseZoom: 1.03,
    zoomDelta: 0.12,
    panXAmplitude: 0.11,
    panXCycles: 0.65,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  emotional_push: {
    baseZoom: 1.01,
    zoomDelta: 0.1,
    panXAmplitude: 0.05,
    panXCycles: 0.4,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.015,
    panYCycles: 0.4,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  anime_glide: {
    baseZoom: 1.03,
    zoomDelta: 0.12,
    panXAmplitude: 0.1,
    panXCycles: 0.6,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeOut'
  },
  '3d_orbit': {
    baseZoom: 1.05,
    zoomDelta: 0.09,
    panXAmplitude: 0.13,
    panXCycles: 0.75,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.025,
    panYCycles: 0.5,
    panYPhase: Math.PI / 2,
    easing: 'easeInOut'
  },
  comedy_pop: {
    baseZoom: 1.03,
    zoomDelta: 0.15,
    panXAmplitude: 0.1,
    panXCycles: 0.8,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.7,
    panYPhase: 0,
    easing: 'easeOut'
  },
  action_punch: {
    baseZoom: 1.04,
    zoomDelta: 0.16,
    panXAmplitude: 0.11,
    panXCycles: 0.85,
    panXPhase: 0,
    basePanY: 0.46,
    panYAmplitude: 0.03,
    panYCycles: 0.75,
    panYPhase: 0,
    easing: 'easeOut'
  },
  clay_wobble: {
    baseZoom: 1.04,
    zoomDelta: 0.08,
    panXAmplitude: 0.075,
    panXCycles: 0.6,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.6,
    panYPhase: Math.PI / 4,
    easing: 'easeInOut'
  },
  showcase_arc: {
    baseZoom: 1.04,
    zoomDelta: 0.1,
    panXAmplitude: 0.095,
    panXCycles: 0.55,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  luxury_silk: {
    baseZoom: 1.02,
    zoomDelta: 0.08,
    panXAmplitude: 0.065,
    panXCycles: 0.45,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.012,
    panYCycles: 0.45,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  brand_glide: {
    baseZoom: 1.02,
    zoomDelta: 0.09,
    panXAmplitude: 0.07,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.015,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  lifestyle_drift: {
    baseZoom: 1.02,
    zoomDelta: 0.095,
    panXAmplitude: 0.085,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  viral_snap: {
    baseZoom: 1.06,
    zoomDelta: 0.11,
    panXAmplitude: 0.14,
    panXCycles: 0.85,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.6,
    panYPhase: 0,
    easing: 'easeOut'
  },
  shorts_punch: {
    baseZoom: 1.04,
    zoomDelta: 0.15,
    panXAmplitude: 0.1,
    panXCycles: 0.75,
    panXPhase: 0,
    basePanY: 0.46,
    panYAmplitude: 0.025,
    panYCycles: 0.6,
    panYPhase: 0,
    easing: 'easeOut'
  },
  fast_pan: {
    baseZoom: 1.07,
    zoomDelta: 0.07,
    panXAmplitude: 0.15,
    panXCycles: 0.9,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.6,
    panYPhase: 0,
    easing: 'linear'
  },
  ascend_push: {
    baseZoom: 1.02,
    zoomDelta: 0.13,
    panXAmplitude: 0.06,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeOut'
  },
  tech_scan: {
    baseZoom: 1.12,
    zoomDelta: -0.09,
    panXAmplitude: 0.085,
    panXCycles: 0.65,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'linear'
  },
  cyber_pan: {
    baseZoom: 1.07,
    zoomDelta: 0.09,
    panXAmplitude: 0.14,
    panXCycles: 0.8,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.03,
    panYCycles: 0.6,
    panYPhase: Math.PI / 2,
    easing: 'easeInOut'
  },
  scifi_drift: {
    baseZoom: 1.03,
    zoomDelta: 0.1,
    panXAmplitude: 0.08,
    panXCycles: 0.5,
    panXPhase: Math.PI / 4,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  aerial_glide: {
    baseZoom: 1.03,
    zoomDelta: 0.11,
    panXAmplitude: 0.12,
    panXCycles: 0.55,
    panXPhase: 0,
    basePanY: 0.47,
    panYAmplitude: 0.025,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  nature_pan: {
    baseZoom: 1.02,
    zoomDelta: 0.09,
    panXAmplitude: 0.09,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'linear'
  },
  city_pan: {
    baseZoom: 1.05,
    zoomDelta: 0.08,
    panXAmplitude: 0.12,
    panXCycles: 0.65,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  wildlife_stalk: {
    baseZoom: 1.02,
    zoomDelta: 0.11,
    panXAmplitude: 0.075,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.48,
    panYAmplitude: 0.02,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeInOut'
  },
  corporate_steady: {
    baseZoom: 1.02,
    zoomDelta: 0.065,
    panXAmplitude: 0.045,
    panXCycles: 0.4,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.01,
    panYCycles: 0.4,
    panYPhase: 0,
    easing: 'linear'
  },
  pitch_push: {
    baseZoom: 1.03,
    zoomDelta: 0.11,
    panXAmplitude: 0.06,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.49,
    panYAmplitude: 0.015,
    panYCycles: 0.5,
    panYPhase: 0,
    easing: 'easeOut'
  }
};

const BASE_PRESET_MOTION_MAP = {
  netflix: 'dramatic_push',
  mr_beast: 'punch_zoom_in',
  tiktok_viral: 'dynamic_pan',
  luxury: 'luxury_silk',
  luxury_brand: 'luxury_silk',
  tech: 'tech_scan',
  tech_modern: 'tech_scan',
  dark_mystery: 'noir_drift',
  documentary: 'documentary_glide',
  cinematic: 'smooth_drift',
  educational: 'explainer_pull',
  minimalist: 'corporate_steady',
  default: 'slow_zoom_in'
};

function resolveMotionType(presetOrMotion = 'slow_zoom_in', variant = null) {
  const variantToken = variant ? normalizePresetToken(variant) : null;
  if (variantToken && PRESET_VARIANTS[variantToken]?.motion) {
    return PRESET_VARIANTS[variantToken].motion;
  }

  const token = normalizePresetToken(presetOrMotion);
  if (PRESET_VARIANTS[token]?.motion) {
    return PRESET_VARIANTS[token].motion;
  }
  if (CAMERA_MOTION_PROFILES[token]) {
    return token;
  }
  const baseKey = resolveBasePresetKey(token);
  return BASE_PRESET_MOTION_MAP[baseKey] || 'slow_zoom_in';
}

function getMotionProfile(motionType = 'slow_zoom_in', variant = null) {
  const resolvedType = resolveMotionType(motionType, variant);
  return CAMERA_MOTION_PROFILES[resolvedType] || CAMERA_MOTION_PROFILES.slow_zoom_in;
}

function applyEasing(t = 0, easing = 'easeInOut') {
  const x = Math.max(0, Math.min(1, Number(t) || 0));
  switch (easing) {
    case 'linear':
      return x;
    case 'easeOut':
      return 1 - Math.pow(1 - x, 2);
    case 'easeInOut':
    default:
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }
}

function clampSafeRatio(value, min = 0.28, max = 0.72) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.5;
  return Math.max(min, Math.min(max, num));
}

function sampleCameraState({
  motionType = 'slow_zoom_in',
  variant = null,
  t = 0,
  sceneIndex = 0,
  safeZones = null,
  globalStartSec = 0,
  globalEndSec = null,
  totalVideoDuration = null
}) {
  const clampedT = Math.max(0, Math.min(1, Number(t) || 0));
  const profile = getMotionProfile(motionType, variant);
  const easedT = applyEasing(clampedT, profile.easing);

  const hasNegativeZoom = Number(profile.zoomDelta) < 0;
  const reverseDirection = sceneIndex % 2 === 1;
  const effectiveZoomT = hasNegativeZoom
    ? easedT
    : reverseDirection
      ? 1 - easedT * 0.85
      : easedT;

  const z = Math.max(1.0, profile.baseZoom + profile.zoomDelta * effectiveZoomT);

  const xDir = sceneIndex % 2 === 0 ? 1 : -1;
  const yDir = sceneIndex % 2 === 0 ? -1 : 1;

  const safeTotalDur =
    totalVideoDuration && Number(totalVideoDuration) > 0
      ? Number(totalVideoDuration)
      : null;
  const globalBias = safeTotalDur
    ? ((Number(globalStartSec) || 0) / safeTotalDur) * 0.15
    : 0;

  const xWave =
    profile.panXAmplitude && profile.panXCycles
      ? xDir *
        profile.panXAmplitude *
        Math.sin(
          2 * Math.PI * profile.panXCycles * easedT + (profile.panXPhase || 0) + globalBias
        )
      : 0;

  const topSafe = Number(safeZones?.topMarginRatio) || 0.08;
  const bottomSafe = Number(safeZones?.bottomMarginRatio) || 0.12;
  const safeMinY = Math.max(0.28, Math.min(0.45, 0.5 - (0.5 - topSafe) * 0.45));
  const safeMaxY = Math.min(0.72, Math.max(0.55, 0.5 + (0.5 - bottomSafe) * 0.45));

  const yWave =
    profile.panYAmplitude && profile.panYCycles
      ? yDir *
        profile.panYAmplitude *
        Math.sin(2 * Math.PI * profile.panYCycles * easedT + (profile.panYPhase || 0))
      : 0;

  return {
    z,
    xRatio: clampSafeRatio(0.5 + xWave, 0.28, 0.72),
    yRatio: clampSafeRatio(profile.basePanY + yWave, safeMinY, safeMaxY)
  };
}

function buildMotionFilter({
  width,
  height,
  duration,
  fps,
  motionType = 'slow_zoom_in',
  variant = null,
  sceneIndex = 0,
  safeZones = null,
  globalStartSec = 0,
  globalEndSec = null,
  totalVideoDuration = null
}) {
  const safeFps = Math.max(15, Number(fps) || 30);
  const totalFrames = Math.max(2, Math.round(Math.max(1, Number(duration) || 4) * safeFps));

  const preScaleW = Math.round(width * 1.3);
  const preScaleH = Math.round(height * 1.3);

  const startState = sampleCameraState({
    motionType,
    variant,
    t: 0,
    sceneIndex,
    safeZones,
    globalStartSec,
    globalEndSec,
    totalVideoDuration
  });
  const endState = sampleCameraState({
    motionType,
    variant,
    t: 1,
    sceneIndex,
    safeZones,
    globalStartSec,
    globalEndSec,
    totalVideoDuration
  });

  const denom = Math.max(1, totalFrames - 1);
  const progressExpr = `(on/${denom})`;

  const zExpr = `'(${startState.z.toFixed(5)}+(${(endState.z - startState.z).toFixed(5)})*${progressExpr})'`;
  const xExpr = `'(iw-ow)*(${startState.xRatio.toFixed(5)}+(${(endState.xRatio - startState.xRatio).toFixed(5)})*${progressExpr})'`;
  const yExpr = `'(ih-oh)*(${startState.yRatio.toFixed(5)}+(${(endState.yRatio - startState.yRatio).toFixed(5)})*${progressExpr})'`;

  return [
    `scale=${preScaleW}:${preScaleH}:force_original_aspect_ratio=increase`,
    `crop=${preScaleW}:${preScaleH}:(iw-${preScaleW})/2:(ih-${preScaleH})/2`,
    `zoompan=z=${zExpr}:x=${xExpr}:y=${yExpr}:d=${totalFrames}:s=${width}x${height}:fps=${safeFps}`
  ].join(',');
}

function buildBaseVideoFilter({
  width,
  height,
  duration,
  fps,
  presetConfig,
  presetKey = null,
  variant = null,
  sceneIndex = 0,
  safeZones = null,
  applyCameraMotion = true,
  globalStartSec = 0,
  globalEndSec = null,
  totalVideoDuration = null
}) {
  const safeFps = Math.max(15, Number(fps) || 30);
  const resolvedSource = variant || presetKey || presetConfig?.motion || presetConfig?.key || 'default';
  const parts = [];

  if (applyCameraMotion) {
    parts.push(
      buildMotionFilter({
        width,
        height,
        duration,
        fps: safeFps,
        motionType: resolvedSource,
        variant,
        sceneIndex,
        safeZones,
        globalStartSec,
        globalEndSec,
        totalVideoDuration
      })
    );
  } else {
    parts.push(
      `fps=${safeFps}`,
      `scale=${width}:${height}:force_original_aspect_ratio=increase`,
      `crop=${width}:${height}:(iw-${width})/2:(ih-${height})/2`
    );
  }

  if (presetConfig?.eqFilter) {
    parts.push(presetConfig.eqFilter);
  }

  return parts.join(',');
}

module.exports = {
  CAMERA_MOTION_PROFILES,
  BASE_PRESET_MOTION_MAP,
  resolveMotionType,
  getMotionProfile,
  sampleCameraState,
  buildMotionFilter,
  buildBaseVideoFilter
};
