const CAMERA_MOTION_PROFILES = {
  punch_zoom_in: {
    baseZoom: 1.02,
    zoomDelta: 0.16,
    panXAmplitude: 0.08,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.38,
    panYAmplitude: 0,
    panYCycles: 0
  },
  clean_zoom_out: {
    baseZoom: 1.15,
    zoomDelta: -0.13,
    panXAmplitude: 0.04,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.5,
    panYAmplitude: 0,
    panYCycles: 0
  },
  dynamic_pan: {
    baseZoom: 1.07,
    zoomDelta: 0.04,
    panXAmplitude: 0.32,
    panXCycles: 1,
    panXPhase: 0,
    basePanY: 0.5,
    panYAmplitude: 0.06,
    panYCycles: 0.5,
    panYPhase: Math.PI / 2
  },
  smooth_drift: {
    baseZoom: 1.02,
    zoomDelta: 0.07,
    panXAmplitude: 0.14,
    panXCycles: 1,
    panXPhase: 0,
    basePanY: 0.5,
    panYAmplitude: -0.04,
    panYCycles: 0.5,
    panYPhase: 0
  },
  slow_zoom_in: {
    baseZoom: 1.01,
    zoomDelta: 0.1,
    panXAmplitude: 0.06,
    panXCycles: 0.5,
    panXPhase: 0,
    basePanY: 0.5,
    panYAmplitude: 0,
    panYCycles: 0
  }
};

function getMotionProfile(motionType = 'slow_zoom_in') {
  return CAMERA_MOTION_PROFILES[motionType] || CAMERA_MOTION_PROFILES.slow_zoom_in;
}

function sampleGlobalCameraState({ motionType = 'slow_zoom_in', u = 0 }) {
  const clampedU = Math.max(0, Math.min(1, Number(u) || 0));
  const profile = getMotionProfile(motionType);

  const z = profile.baseZoom + profile.zoomDelta * clampedU;

  const xWave =
    profile.panXAmplitude && profile.panXCycles
      ? profile.panXAmplitude *
        Math.sin(2 * Math.PI * profile.panXCycles * clampedU + (profile.panXPhase || 0))
      : 0;

  const yWave =
    profile.panYAmplitude && profile.panYCycles
      ? profile.panYAmplitude *
        Math.sin(2 * Math.PI * profile.panYCycles * clampedU + (profile.panYPhase || 0))
      : 0;

  return {
    z,
    xRatio: 0.5 + xWave,
    yRatio: profile.basePanY + yWave
  };
}

function buildMotionFilter({
  width,
  height,
  duration,
  fps,
  motionType = 'slow_zoom_in',
  globalStartSec = 0,
  globalEndSec = null,
  totalVideoDuration = null
}) {
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const preScaleW = Math.round(width * 1.25);
  const preScaleH = Math.round(height * 1.25);

  const safeTotalDur = Math.max(
    Number(totalVideoDuration) || Number(duration) || 1,
    Number(globalEndSec) || Number(duration) || 1
  );
  const uStart = Math.max(0, Math.min(1, Number(globalStartSec || 0) / safeTotalDur));
  const uEnd = Math.max(
    uStart,
    Math.min(
      1,
      (Number(globalEndSec) ?? Number(globalStartSec || 0) + Number(duration || 1)) / safeTotalDur
    )
  );

  const startState = sampleGlobalCameraState({ motionType, u: uStart });
  const endState = sampleGlobalCameraState({ motionType, u: uEnd });

  const denom = Math.max(1, totalFrames - 1);
  const progressExpr = `(on/${denom})`;

  const zExpr = `'(${startState.z.toFixed(5)} + (${(endState.z - startState.z).toFixed(5)})*${progressExpr})'`;
  const xExpr = `'(iw-ow)*(${startState.xRatio.toFixed(5)} + (${(endState.xRatio - startState.xRatio).toFixed(5)})*${progressExpr})'`;
  const yExpr = `'(ih-oh)*(${startState.yRatio.toFixed(5)} + (${(endState.yRatio - startState.yRatio).toFixed(5)})*${progressExpr})'`;

  return `scale=${preScaleW}:${preScaleH}:force_original_aspect_ratio=increase,crop=${preScaleW}:${preScaleH},zoompan=z=${zExpr}:x=${xExpr}:y=${yExpr}:d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
}

function buildBaseVideoFilter({
  width,
  height,
  duration,
  fps,
  presetConfig,
  globalStartSec = 0,
  globalEndSec = null,
  totalVideoDuration = null
}) {
  const parts = [
    buildMotionFilter({
      width,
      height,
      duration,
      fps,
      motionType: presetConfig?.motion || 'slow_zoom_in',
      globalStartSec,
      globalEndSec,
      totalVideoDuration
    })
  ];

  if (presetConfig?.eqFilter) {
    parts.push(presetConfig.eqFilter);
  }

  return parts.join(',');
}

module.exports = {
  CAMERA_MOTION_PROFILES,
  getMotionProfile,
  sampleGlobalCameraState,
  buildMotionFilter,
  buildBaseVideoFilter
};
