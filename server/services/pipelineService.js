// server/services/pipelineService.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { GLOBALS, resolveVoiceModelId } = require('../config/globals');
const { normalizeKey, resolvePlanPolicy } = require('../utils/sharedHelpers');
const {
  buildNormalizedPipelinePayload,
  resolvePipelineParameters
} = require('../config/params/pipelineRegistry');
const { generateStructuredScript } = require('./llmService');
const { generateAllScenesAudio, transcribeMergedJobAudio } = require('./audioService');
const { generateAllScenesVisuals } = require('./visualService');
const musicService = require('./musicService');
const { renderFinalVideo } = require('./renderService');
const { initJobUsage, recordStepUsage, getJobUsage } = require('./usageCostService');
const Video = require('../models/Video');

const ALLOWED_ASPECT_RATIOS = new Set(['16:9', '9:16', '1:1']);

function normalizeAspectRatio(rawRatio, fallback = '9:16') {
  const candidate = String(rawRatio || '').trim();
  if (ALLOWED_ASPECT_RATIOS.has(candidate)) {
    return candidate;
  }
  return ALLOWED_ASPECT_RATIOS.has(fallback) ? fallback : '9:16';
}

function resolveOptionalVideoService() {
  const candidateFiles = ['./videoService', './videoGeneratorService'];
  for (const relPath of candidateFiles) {
    try {
      const fullPath = path.resolve(__dirname, `${relPath}.js`);
      if (fs.existsSync(fullPath)) {
        const mod = require(relPath);
        const fn =
          mod?.generateVideo ||
          mod?.generateSceneVideos ||
          mod?.generateVideoClips ||
          mod?.renderBaseVideo ||
          (typeof mod === 'function' ? mod : null);
        if (typeof fn === 'function') {
          return fn;
        }
      }
    } catch (_) {
      // Si no existe o no exporta función compatible, continuamos con el flujo actual
    }
  }
  return null;
}

function ensureResolvedParams(payload, adminOverrides = {}) {
  const nextPayload = payload && typeof payload === 'object' ? { ...payload } : {};
  const resolvedParams =
    nextPayload.resolvedParams && typeof nextPayload.resolvedParams === 'object'
      ? nextPayload.resolvedParams
      : resolvePipelineParameters(nextPayload, adminOverrides);

  return {
    ...nextPayload,
    resolvedParams
  };
}

function syncVideoUrlIntoPayload(payload, fallbackResult = null, adminOverrides = {}) {
  const nextPayload = ensureResolvedParams(payload, adminOverrides);
  const existingVideoObj =
    nextPayload.video && typeof nextPayload.video === 'object'
      ? { ...nextPayload.video }
      : {};

  const resolvedUrl =
    existingVideoObj.videoUrl ||
    existingVideoObj.url ||
    nextPayload.videoUrl ||
    fallbackResult?.video?.videoUrl ||
    fallbackResult?.videoUrl ||
    nextPayload?.renderResult?.videoUrl ||
    null;

  if (resolvedUrl) {
    existingVideoObj.videoUrl = resolvedUrl;
  }

  nextPayload.video = existingVideoObj;
  return nextPayload;
}

function sanitizeVideoPersistencePayload(rawUpdate = {}) {
  const sanitized = rawUpdate && typeof rawUpdate === 'object' ? { ...rawUpdate } : {};
  const candidateUserId =
    sanitized.userId ?? sanitized?.meta?.userId ?? sanitized?.user?._id ?? null;
  const candidateEmail =
    (typeof sanitized.email === 'string' && sanitized.email) ||
    (typeof sanitized.userEmail === 'string' && sanitized.userEmail) ||
    (typeof sanitized?.user?.email === 'string' && sanitized.user.email) ||
    (typeof candidateUserId === 'string' && candidateUserId.includes('@')
      ? candidateUserId
      : '');

  if (candidateEmail && !sanitized.email) {
    sanitized.email = candidateEmail.trim().toLowerCase();
  }

  if (
    candidateUserId &&
    typeof candidateUserId === 'object' &&
    typeof candidateUserId.toString === 'function' &&
    mongoose.Types.ObjectId.isValid(candidateUserId.toString())
  ) {
    sanitized.userId = candidateUserId.toString();
  } else if (
    typeof candidateUserId === 'string' &&
    mongoose.Types.ObjectId.isValid(candidateUserId)
  ) {
    sanitized.userId = candidateUserId;
  } else {
    delete sanitized.userId;
  }

  return sanitized;
}

async function runCompletePipeline(masterPayload = {}) {
  const rawInput =
    masterPayload && typeof masterPayload === 'object' ? masterPayload : {};
  const adminOverrides =
    rawInput.adminOverrides && typeof rawInput.adminOverrides === 'object'
      ? rawInput.adminOverrides
      : {};

  const normalizedBase = buildNormalizedPipelinePayload(rawInput, adminOverrides);
  const jobId = normalizedBase?.meta?.jobId || `job_${Date.now()}`;
  const resolvedParams = normalizedBase.resolvedParams;

  const normalizedPlan =
    resolvedParams?.meta?.userPlan ||
    normalizeKey(rawInput?.meta?.userPlan, {}, GLOBALS.PLAN_POLICIES, 'free_trial');
  const normalizedProduct =
    resolvedParams?.meta?.product ||
    normalizeKey(
      rawInput?.meta?.product || rawInput?.product,
      {},
      GLOBALS.PRODUCTS,
      'studio_lite'
    );
  const normalizedPreset = resolvedParams?.preset?.key || 'default';
  const normalizedVisualStyle = resolvedParams?.visualFormat?.style?.key || 'realistic';
  const normalizedMediaMode = resolvedParams?.visualFormat?.mediaMode?.key || 'static_only';
  const planPolicy = resolvePlanPolicy(normalizedPlan);

  const resolvedAspectRatio = normalizeAspectRatio(
    resolvedParams?.format?.aspectRatio ||
      normalizedBase?.videoConfig?.aspectRatio ||
      planPolicy?.defaultAspectRatio ||
      '9:16'
  );

  const defaultVoiceModelId =
    resolvedParams?.voiceAndScript?.voice?.modelId ||
    resolveVoiceModelId({
      explicitModelId:
        normalizedBase?.voiceConfig?.modelId || normalizedBase?.voice?.modelId,
      preset: normalizedPreset,
      userPlan: normalizedPlan
    });

  let currentPayload = {
    ...normalizedBase,
    aspectRatio: resolvedAspectRatio,
    meta: {
      ...normalizedBase.meta,
      jobId,
      userPlan: normalizedPlan,
      product: normalizedProduct,
      preset: normalizedPreset,
      visualStyle: normalizedVisualStyle,
      mediaMode: normalizedMediaMode,
      aspectRatio: resolvedAspectRatio
    },
    videoConfig: {
      ...(normalizedBase.videoConfig || {}),
      aspectRatio: resolvedAspectRatio,
      visualStyle: normalizedVisualStyle,
      mediaMode: normalizedMediaMode
    },
    voiceConfig: {
      ...(normalizedBase.voiceConfig || {}),
      modelId: defaultVoiceModelId
    },
    resolvedParams
  };

  initJobUsage(jobId, {
    userId: currentPayload?.meta?.userId || currentPayload?.userId || null,
    userPlan: normalizedPlan,
    product: normalizedProduct
  });

  console.log(
    `🚀 [Pipeline Master] Iniciando flujo completo para Job ID: ${jobId} | Producto: [${normalizedProduct}] | Plan: [${normalizedPlan}] | Preset: [${normalizedPreset}] | Style: [${normalizedVisualStyle}] | MediaMode: [${normalizedMediaMode}] | AspectRatio: [${resolvedAspectRatio}] | VoiceModel: [${defaultVoiceModelId}] (maxDur=${planPolicy.maxDurationSeconds}s)`
  );

  // 1. Paso de IA: Generar guion estructurado con Gemini (voiceoverText limpio + spokenText con tags + mediaType + sfxCue)
  console.log(`1️⃣ Ejecutando Gemini (Generación de guion)...`);
  const llmStart = Date.now();
  currentPayload = ensureResolvedParams(
    await generateStructuredScript(currentPayload),
    adminOverrides
  );
  const generatedScenes =
    currentPayload?.llmDirective?.structuredScript?.scenes || [];
  const activeSfxCount = generatedScenes.filter(
    (sc) => sc?.sfxCue?.enabled === true
  ).length;
  const usageMeta =
    currentPayload?.llmDirective?.usageMetadata ||
    currentPayload?.llmDirective?.usage ||
    {};
  const scriptTokens = Number(
    usageMeta.totalTokens ??
      (Number(usageMeta.inputTokens || 0) + Number(usageMeta.outputTokens || 0))
  );
  recordStepUsage(jobId, 'script_generation', {
    provider: currentPayload?.llmDirective?.provider || 'google-gemini',
    model: currentPayload?.llmDirective?.model || 'gemini-3.8-flash',
    llmTokens: Number.isFinite(scriptTokens) ? scriptTokens : 0,
    inputTokens: Number(usageMeta.inputTokens || 0),
    outputTokens: Number(usageMeta.outputTokens || 0),
    sfxCuesCount: activeSfxCount,
    latencyMs: Date.now() - llmStart
  });

  // 2. Paso de Audio: Generar los MP3 por escena con ElevenLabs (preservando etiquetas en spokenText)
  console.log(`2️⃣ Ejecutando ElevenLabs (Síntesis de voz)...`);
  const audioStart = Date.now();
  currentPayload = ensureResolvedParams(
    await generateAllScenesAudio(currentPayload),
    adminOverrides
  );
  const audioScenes =
    currentPayload?.llmDirective?.structuredScript?.scenes ||
    currentPayload?.scenes ||
    [];
  const ttsChars = audioScenes.reduce(
    (acc, sc) => acc + String(sc?.voiceoverText || '').length,
    0
  );
  recordStepUsage(jobId, 'audio_synthesis', {
    provider: 'elevenlabs',
    model:
      currentPayload?.voice?.modelId ||
      currentPayload?.llmDirective?.voiceModelId ||
      defaultVoiceModelId,
    ttsCharacters: ttsChars,
    latencyMs: Date.now() - audioStart
  });

  // 3. Paso de Visuales: Renderizar imágenes por escena con Gemini 2.5
  console.log(`3️⃣ Ejecutando Gemini 2.5 (Generación de visuales)...`);
  const visualStart = Date.now();
  currentPayload = ensureResolvedParams(
    await generateAllScenesVisuals(currentPayload),
    adminOverrides
  );
  const visualScenes =
    currentPayload?.llmDirective?.structuredScript?.scenes ||
    currentPayload?.scenes ||
    [];
  recordStepUsage(jobId, 'visual_generation', {
    provider: 'google-gemini',
    model: currentPayload?.visual?.provider || 'gemini-2.5-flash-image',
    imagesGenerated: visualScenes.length,
    latencyMs: Date.now() - visualStart
  });

  // 3.5 Paso opcional de Generación de Video Base (si existe servicio de video y aún no hay video.videoUrl)
  currentPayload = syncVideoUrlIntoPayload(currentPayload, null, adminOverrides);
  const optionalVideoFn = resolveOptionalVideoService();
  if (!currentPayload?.video?.videoUrl && typeof optionalVideoFn === 'function') {
    console.log(`🎬 Ejecutando generador de video base antes de música...`);
    const videoGenStart = Date.now();
    const videoGenResult = await optionalVideoFn(currentPayload);
    currentPayload = syncVideoUrlIntoPayload(
      videoGenResult?.payload || videoGenResult || currentPayload,
      videoGenResult,
      adminOverrides
    );
    recordStepUsage(jobId, 'video_generation', {
      provider: currentPayload?.video?.provider || 'video-generator',
      model: currentPayload?.video?.model || 'default',
      videoClipsGenerated: visualScenes.length,
      latencyMs: Date.now() - videoGenStart
    });
  }

  // 4. Paso de Música: Seleccionar y aplicar/preparar pista de fondo
  console.log(`4️⃣ Ejecutando selector de música de fondo...`);
  const musicFn =
    musicService.applyBackgroundMusic || musicService.selectBackgroundMusic;
  if (typeof musicFn === 'function') {
    const musicStart = Date.now();
    const musicResult = await musicFn(currentPayload);
    currentPayload = syncVideoUrlIntoPayload(
      musicResult?.payload || musicResult || currentPayload,
      musicResult,
      adminOverrides
    );
    recordStepUsage(jobId, 'background_music', {
      provider: 'ffmpeg-music',
      model: currentPayload?.music?.trackKey || 'default',
      musicMixed: Boolean(
        currentPayload?.music?.applied ?? musicResult?.musicApplied
      ),
      latencyMs: Date.now() - musicStart
    });
  }

  // 5. Paso de FFmpeg: Ensamblaje final de video con movimiento, subtítulos limpios y buffer final
  console.log(`5️⃣ Ejecutando FFmpeg (Renderizado de video final)...`);
  const renderStart = Date.now();
  let renderResult = await renderFinalVideo(currentPayload);
  const scriptDuration = Number(
    currentPayload?.llmDirective?.structuredScript?.totalDurationSeconds ||
      currentPayload?.resolvedParams?.voiceAndScript?.script?.durationSeconds ||
      currentPayload?.meta?.targetDurationSeconds ||
      0
  );
  const endingBuffer = Number(
    currentPayload?.resolvedParams?.voiceAndScript?.script?.endingBufferSeconds ??
      currentPayload?.orchestration?.endingBufferSeconds ??
      currentPayload?.llmDirective?.structuredScript?.endingBufferSeconds ??
      0
  );
  const estimatedRenderSeconds = Math.max(0, scriptDuration + endingBuffer);
  recordStepUsage(jobId, 'video_render', {
    provider: 'ffmpeg',
    model: renderResult?.resolution || currentPayload?.resolvedParams?.format?.resolution || '1080p',
    videoClipsGenerated: visualScenes.length,
    renderDurationSeconds: estimatedRenderSeconds,
    latencyMs: Date.now() - renderStart
  });

  // Inyectar resultados del render al payload final
  const { payload: _omitRenderPayload, ...cleanRenderResult } = renderResult || {};
  currentPayload.renderResult = cleanRenderResult;
  if (renderResult?.payload && typeof renderResult.payload === 'object') {
    currentPayload = ensureResolvedParams(
      {
        ...renderResult.payload,
        renderResult: cleanRenderResult
      },
      adminOverrides
    );
  }
  delete currentPayload.config;
  delete currentPayload.visualConfig;
  if (currentPayload.userInputs && typeof currentPayload.userInputs === 'object') {
    currentPayload.userInputs = {
      ...currentPayload.userInputs,
      aspectRatio: resolvedAspectRatio
    };
  }
  currentPayload = syncVideoUrlIntoPayload(currentPayload, renderResult, adminOverrides);
  if (renderResult?.videoFileName && currentPayload.video) {
    currentPayload.video.fileName = renderResult.videoFileName;
  }

  // 5.5 Mezclar música de fondo sobre el video ya renderizado si quedó diferida o pendiente
  const shouldApplyMusicAfterRender =
    typeof musicService.applyBackgroundMusic === 'function' &&
    Boolean(currentPayload?.video?.videoUrl) &&
    (currentPayload?.music?.deferredUntilRender === true ||
      (currentPayload?.music?.enabled !== false && !currentPayload?.music?.applied));

  if (shouldApplyMusicAfterRender) {
    console.log(`🎵 Aplicando mezcla de música de fondo sobre el video renderizado...`);
    const musicPostStart = Date.now();
    const musicPostResult = await musicService.applyBackgroundMusic(currentPayload);

    currentPayload = syncVideoUrlIntoPayload(
      musicPostResult?.payload || musicPostResult || currentPayload,
      musicPostResult,
      adminOverrides
    );

    if (musicPostResult?.videoUrl) {
      renderResult = {
        ...renderResult,
        videoUrl: musicPostResult.videoUrl,
        videoFileName: musicPostResult.videoFileName || renderResult.videoFileName,
        musicApplied: Boolean(musicPostResult.musicApplied)
      };
      const { payload: _omitPostRenderPayload, ...cleanPostRenderResult } = renderResult;
      currentPayload.renderResult = cleanPostRenderResult;
    }

    recordStepUsage(jobId, 'background_music_mix', {
      provider: 'ffmpeg-music',
      model: currentPayload?.music?.trackKey || 'default',
      musicMixed: Boolean(
        currentPayload?.music?.applied ?? musicPostResult?.musicApplied
      ),
      latencyMs: Date.now() - musicPostStart
    });
  }

  // Paso de Persistencia Final: Guardar proyecto completo en MongoDB Atlas
  console.log(`💾 Guardando proyecto finalizado en MongoDB Atlas...`);
  const jobUsage = getJobUsage(jobId);
  const finalAspectRatio = normalizeAspectRatio(
    currentPayload?.resolvedParams?.format?.aspectRatio ||
      currentPayload?.videoConfig?.aspectRatio ||
      currentPayload?.aspectRatio ||
      resolvedAspectRatio
  );
  const persistenceDoc = sanitizeVideoPersistencePayload({
    ...currentPayload,
    aspectRatio: finalAspectRatio,
    ...(jobUsage ? { usage: jobUsage } : {}),
    status: 'completed',
    videoUrl: renderResult.videoUrl,
    createdAt: new Date()
  });

  const savedProject = await Video.findOneAndUpdate(
    { jobId },
    persistenceDoc,
    { upsert: true, returnDocument: 'after' }
  );

  console.log(
    `✅ [Pipeline Master] ¡Video y proyecto ${jobId} completados con éxito!`
  );
  return savedProject;
}

module.exports = {
  runCompletePipeline,
  transcribeMergedJobAudio
};
