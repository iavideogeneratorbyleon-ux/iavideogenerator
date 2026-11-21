// server/routes/studioLite.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { generateStructuredScript } = require('../services/llmService');
const { generateAllScenesAudio } = require('../services/audioService');
const { generateAllScenesVisuals } = require('../services/visualService');
const { renderFinalVideo, PRESET_CONFIGS } = require('../services/renderService');
const { applyBackgroundMusic } = require('../services/musicService');
const {
  initJobUsage,
  recordStepUsage,
  getJobUsage
} = require('../services/usageCostService');

const PAID_PLANS = new Set(['pay_per_video', 'pro', 'unlimited', 'admin']);
const ALLOWED_DURATIONS_PAID = new Set([30, 60, 90]);
const VALID_PRESET_KEYS = new Set(Object.keys(PRESET_CONFIGS));

const PRESET_VISUAL_MODIFIERS = {
  netflix:
    'cinematic drama lighting, rich contrast, filmic depth, composed framing',
  mr_beast:
    'high-energy expressive composition, vibrant lighting, bold subject focus, dynamic punch',
  tiktok_viral:
    'snappy vertical social framing, crisp subject focus, lively visual energy',
  luxury:
    'refined editorial aesthetic, warm highlights, clean luxury atmosphere',
  tech:
    'modern sleek environment, crisp geometric framing, clean studio lighting',
  default:
    'clean cinematic framing, natural lighting, clear focal subject'
};

function normalizePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== 'string') return 'default';
  const cleaned = rawPreset.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (cleaned === 'mrbeast' || cleaned === 'mr_beast') return 'mr_beast';
  if (cleaned === 'tiktok' || cleaned === 'tiktok_viral' || cleaned === 'viral') {
    return 'tiktok_viral';
  }
  return VALID_PRESET_KEYS.has(cleaned) ? cleaned : 'default';
}

function resolvePipelineConfig(body = {}) {
  const incomingPlan =
    body.meta?.userPlan ||
    body.userPlan ||
    body.llmDirective?.planApplied ||
    'free_trial';
  const userPlan = PAID_PLANS.has(incomingPlan) ? incomingPlan : 'free_trial';
  const isPaidPlan = PAID_PLANS.has(userPlan);

  // Duración: free_trial = 30s fijo; planes de pago = 30, 60 o 90s
  const rawDuration = Number(
    body.meta?.targetDurationSeconds ??
      body.targetDurationSeconds ??
      body.durationSeconds ??
      (isPaidPlan ? 60 : 30)
  );

  let appliedDuration = 30;
  let durationAdjustedReason = null;

  if (!isPaidPlan) {
    appliedDuration = 30;
    if (rawDuration !== 30) {
      durationAdjustedReason =
        'El plan free_trial permite únicamente videos de 30 segundos.';
    }
  } else if (ALLOWED_DURATIONS_PAID.has(rawDuration)) {
    appliedDuration = rawDuration;
  } else {
    appliedDuration = 60;
    durationAdjustedReason =
      'Duración no válida para plan de pago; se aplicó 60s por defecto (permitidos: 30, 60, 90).';
  }

  // Medio por escena: 'image' o 'video_clip' (solo planes de pago)
  const requestedMediaMode =
    body.sceneMediaMode ||
    body.meta?.sceneMediaMode ||
    body.visual?.sceneMediaMode ||
    'image';

  let appliedMediaMode = 'image';
  let mediaModeAdjustedReason = null;

  if (requestedMediaMode === 'video_clip') {
    if (isPaidPlan) {
      appliedMediaMode = 'video_clip';
    } else {
      appliedMediaMode = 'image';
      mediaModeAdjustedReason =
        'Los clips de video por escena están disponibles solo en planes de pago; se usó image.';
    }
  }

  const preset = normalizePreset(
    body.videoConfig?.preset ||
      body.preset ||
      body.userInputs?.preset ||
      body.video?.preset ||
      'default'
  );

  const aspectRatio =
    body.userInputs?.aspectRatio ||
    body.visualConfig?.aspectRatio ||
    body.visual?.aspectRatio ||
    body.video?.aspectRatio ||
    body.aspectRatio ||
    '9:16';

  const requestedResolution =
    body.videoConfig?.resolution || body.video?.resolution || '1080p';
  const resolution = isPaidPlan
    ? requestedResolution === '720p'
      ? '720p'
      : '1080p'
    : '720p';

  const watermark = !isPaidPlan;

  const subtitlesEnabled =
    typeof body.videoConfig?.subtitles?.enabled === 'boolean'
      ? body.videoConfig.subtitles.enabled
      : typeof body.video?.subtitles?.enabled === 'boolean'
      ? body.video.subtitles.enabled
      : true;

  const musicEnabled =
    typeof body.musicConfig?.enabled === 'boolean'
      ? body.musicConfig.enabled
      : typeof body.music?.enabled === 'boolean'
      ? body.music.enabled
      : true;

  const customMusicUrl = isPaidPlan
    ? body.musicConfig?.customMusicUrl || null
    : null;

  const customMusicBlockedReason =
    !isPaidPlan && body.musicConfig?.customMusicUrl
      ? 'La pista de música personalizada (customMusicUrl) es exclusiva para planes de pago; se usará el catálogo.'
      : null;

  return {
    userPlan,
    isPaidPlan,
    language:
      body.meta?.language ||
      body.userInputs?.language ||
      body.llmDirective?.language ||
      'en',
    aspectRatio,
    duration: {
      requested: rawDuration,
      applied: appliedDuration,
      adjustedReason: durationAdjustedReason
    },
    sceneMedia: {
      requested: requestedMediaMode,
      applied: appliedMediaMode,
      adjustedReason: mediaModeAdjustedReason
    },
    orchestration: {
      endingBufferSeconds: Number(
        body.orchestration?.endingBufferSeconds ??
          body.structuredScript?.endingBufferSeconds ??
          1.5
      ),
      pacing: body.orchestration?.pacing || 'balanced'
    },
    videoConfig: {
      ...(body.videoConfig || {}),
      preset,
      resolution,
      watermark,
      subtitles: {
        ...(body.videoConfig?.subtitles || {}),
        enabled: subtitlesEnabled
      }
    },
    musicConfig: {
      enabled: musicEnabled,
      track: body.musicConfig?.track || body.music?.trackKey || null,
      customMusicUrl,
      customMusicBlockedReason,
      volume:
        body.musicConfig?.volume ??
        (typeof body.music?.baseVolume === 'number' ? body.music.baseVolume : 0.24),
      ducking:
        typeof body.musicConfig?.ducking === 'boolean'
          ? body.musicConfig.ducking
          : typeof body.music?.duckingEnabled === 'boolean'
          ? body.music.duckingEnabled
          : true,
      fadeOutSeconds:
        body.musicConfig?.fadeOutSeconds ??
        (typeof body.music?.fadeOutSeconds === 'number'
          ? body.music.fadeOutSeconds
          : 2)
    }
  };
}

router.post('/generate-video', async (req, res) => {
  const body = req.body || {};
  const jobId =
    body.meta?.jobId ||
    body.jobId ||
    `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  try {
    const cfg = resolvePipelineConfig(body);

    initJobUsage(jobId, {
      userId: body.userId || null,
      userPlan: cfg.userPlan
    });

    const userInputs = {
      ...(body.userInputs || {}),
      mode: body.userInputs?.mode || 'idea',
      rawContent: body.userInputs?.rawContent || body.rawContent || '',
      tone:
        body.userInputs?.tone ||
        body.voiceConfig?.tone ||
        body.voice?.tone ||
        body.tone ||
        'storytelling',
      hook: body.userInputs?.hook || '',
      cta: body.userInputs?.cta || '',
      aspectRatio: cfg.aspectRatio,
      preset: cfg.videoConfig.preset,
      voiceId:
        body.userInputs?.voiceId ||
        body.voiceConfig?.voiceId ||
        body.voice?.voiceId ||
        process.env.ELEVENLABS_DEFAULT_VOICE_ID
    };

    const stylePromptModifier =
      body.visualConfig?.stylePromptModifier ||
      body.userInputs?.visualStyleModifier ||
      PRESET_VISUAL_MODIFIERS[cfg.videoConfig.preset] ||
      PRESET_VISUAL_MODIFIERS.default;

    let currentPayload = {
      ...body,
      meta: {
        ...(body.meta || {}),
        userPlan: cfg.userPlan,
        language: cfg.language,
        targetDurationSeconds: cfg.duration.applied,
        jobId
      },
      userInputs,
      orchestration: cfg.orchestration,
      videoConfig: cfg.videoConfig,
      visualConfig: {
        ...(body.visualConfig || {}),
        aspectRatio: cfg.aspectRatio,
        stylePromptModifier
      },
      voiceConfig: {
        ...(body.voiceConfig || {}),
        voiceId: userInputs.voiceId
      }
    };

    // --- PASO 1: Guion estructurado (llmService.generateStructuredScript) ---
    currentPayload = await generateStructuredScript(currentPayload);

    const scriptScenes =
      currentPayload?.llmDirective?.structuredScript?.scenes || [];
    recordStepUsage(jobId, 'step1_script', {
      provider: currentPayload?.llmDirective?.provider || 'google-gemini',
      model: currentPayload?.llmDirective?.model || 'gemini-3.8-flash',
      llmTokens: 0,
      scenesCount: scriptScenes.length
    });

    // --- PASO 2: Voz en off por escena (audioService.generateAllScenesAudio) ---
    currentPayload = await generateAllScenesAudio(currentPayload);

    const audioScenes =
      currentPayload?.llmDirective?.structuredScript?.scenes ||
      currentPayload?.scenes ||
      [];
    const totalChars = audioScenes.reduce(
      (acc, sc) => acc + String(sc?.voiceoverText || '').length,
      0
    );

    recordStepUsage(jobId, 'step2_voice', {
      provider: currentPayload?.voice?.provider || 'elevenlabs',
      model: currentPayload?.voice?.modelId || 'eleven_turbo_v2_5',
      ttsCharacters: totalChars
    });

    // --- PASO 3: Visuales por escena (imagen o clip en planes de pago) ---
    if (cfg.sceneMedia.applied === 'video_clip') {
      return res.status(400).json({
        success: false,
        jobId,
        error:
          'Solicitaste sceneMediaMode="video_clip" para un plan de pago, pero visualService.js aún no tiene implementado un generador de clips por escena.'
      });
    }

    currentPayload = await generateAllScenesVisuals(currentPayload);

    const visualScenes =
      currentPayload?.llmDirective?.structuredScript?.scenes ||
      currentPayload?.scenes ||
      [];

    recordStepUsage(jobId, 'step3_visual_images', {
      provider: currentPayload?.visual?.provider || 'gemini-2.5-flash-image',
      model: currentPayload?.visual?.provider || 'gemini-2.5-flash-image',
      imagesGenerated: visualScenes.length
    });

    // --- PASO 4: Renderizado de video (renderService.renderFinalVideo) ---
    const renderResult = await renderFinalVideo(currentPayload);
    currentPayload = renderResult?.payload || currentPayload;

    recordStepUsage(jobId, 'step4_render', {
      provider: 'ffmpeg_render',
      renderDurationSeconds: cfg.duration.applied
    });

    // --- PASO 5: Música de fondo, Ducking y Fade-Out (musicService.applyBackgroundMusic) ---
    let musicApplied = false;
    let trackKey = cfg.musicConfig.track || null;
    let duckingEnabled = Boolean(cfg.musicConfig.ducking);

    if (cfg.musicConfig.enabled) {
      const musicResult = await applyBackgroundMusic({
        ...currentPayload,
        musicConfig: cfg.musicConfig
      });

      currentPayload = musicResult?.payload || currentPayload;
      musicApplied = Boolean(
        musicResult?.musicApplied ?? currentPayload?.music?.applied
      );
      trackKey =
        musicResult?.trackKey ?? currentPayload?.music?.trackKey ?? trackKey;
      duckingEnabled =
        typeof musicResult?.duckingEnabled === 'boolean'
          ? musicResult.duckingEnabled
          : Boolean(currentPayload?.music?.duckingEnabled);

      recordStepUsage(jobId, 'step5_music', {
        provider: 'ffmpeg_music',
        musicMixed: musicApplied
      });
    }

    const usageSummary = getJobUsage(jobId);
    const finalVideoFileName =
      currentPayload?.video?.fileName || `${jobId}_final_with_music.mp4`;
    const finalVideoUrl =
      currentPayload?.video?.videoUrl || `/videos/${finalVideoFileName}`;

    return res.json({
      success: true,
      videoFileName: finalVideoFileName,
      videoUrl: finalVideoUrl,
      musicApplied,
      trackKey,
      duckingEnabled,
      appliedSettings: {
        userPlan: cfg.userPlan,
        aspectRatio: cfg.aspectRatio,
        duration: cfg.duration,
        sceneMedia: cfg.sceneMedia,
        videoConfig: cfg.videoConfig,
        musicConfig: cfg.musicConfig
      },
      usageSummary,
      payload: currentPayload
    });
  } catch (error) {
    console.error(`❌ Error en /api/studio-lite/generate-video (${jobId}):`, error);
    return res.status(500).json({
      success: false,
      jobId,
      error: error.message || 'Error al generar el video en studioLite.'
    });
  }
});

module.exports = router;
