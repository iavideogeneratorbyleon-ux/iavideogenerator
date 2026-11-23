// server/services/pipelineService.js
const fs = require('fs');
const path = require('path');
const { GLOBALS, resolveVoiceModelId } = require('../config/globals');
const { normalizeKey, resolvePlanPolicy } = require('../utils/sharedHelpers');
const { generateStructuredScript } = require('./llmService');
const { generateAllScenesAudio, transcribeMergedJobAudio } = require('./audioService');
const { generateAllScenesVisuals } = require('./visualService');
const musicService = require('./musicService');
const { renderFinalVideo } = require('./renderService');
const { initJobUsage, recordStepUsage, getJobUsage } = require('./usageCostService');
const VideoProject = require('../models/VideoProject');

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

function syncVideoUrlIntoPayload(payload, fallbackResult = null) {
  const nextPayload = payload && typeof payload === 'object' ? { ...payload } : {};
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

async function runCompletePipeline(masterPayload = {}) {
  const safePayload =
    masterPayload && typeof masterPayload === 'object' ? masterPayload : {};
  const jobId = safePayload?.meta?.jobId || `job_${Date.now()}`;
  const normalizedPlan = normalizeKey(
    safePayload?.meta?.userPlan,
    {},
    GLOBALS.PLAN_POLICIES,
    'free_trial'
  );
  const normalizedProduct = normalizeKey(
    safePayload?.meta?.product || safePayload?.product,
    {},
    GLOBALS.PRODUCTS,
    'studio_lite'
  );
  const rawPreset =
    safePayload?.meta?.preset ||
    safePayload?.userInputs?.preset ||
    safePayload?.videoConfig?.preset ||
    'default';
  const normalizedPreset = normalizeKey(
    rawPreset,
    GLOBALS.PRESET_ALIASES || {},
    GLOBALS.BASE_PRESET_MODIFIERS || {},
    'default'
  );
  const planPolicy = resolvePlanPolicy(normalizedPlan);

  const defaultVoiceModelId = resolveVoiceModelId({
    explicitModelId:
      safePayload?.voiceConfig?.modelId || safePayload?.voice?.modelId,
    preset: normalizedPreset,
    userPlan: normalizedPlan
  });

  safePayload.meta = {
    ...safePayload.meta,
    jobId,
    userPlan: normalizedPlan,
    product: normalizedProduct,
    preset: normalizedPreset
  };
  safePayload.voiceConfig = {
    ...(safePayload.voiceConfig || {}),
    modelId: defaultVoiceModelId
  };

  initJobUsage(jobId, {
    userId: safePayload?.meta?.userId || safePayload?.userId || null,
    userPlan: normalizedPlan,
    product: normalizedProduct
  });

  console.log(
    `🚀 [Pipeline Master] Iniciando flujo completo para Job ID: ${jobId} | Producto: [${normalizedProduct}] | Plan: [${normalizedPlan}] | Preset: [${normalizedPreset}] | VoiceModel: [${defaultVoiceModelId}] (maxDur=${planPolicy.maxDurationSeconds}s)`
  );

  // 1. Paso de IA: Generar guion estructurado con Gemini (voiceoverText limpio + spokenText con tags)
  console.log(`1️⃣ Ejecutando Gemini (Generación de guion)...`);
  const llmStart = Date.now();
  let currentPayload = await generateStructuredScript(safePayload);
  recordStepUsage(jobId, 'script_generation', {
    provider: 'google-gemini',
    model: currentPayload?.llmDirective?.model || 'gemini-3.8-flash',
    latencyMs: Date.now() - llmStart
  });

  // 2. Paso de Audio: Generar los MP3 por escena con ElevenLabs (preservando etiquetas en spokenText)
  console.log(`2️⃣ Ejecutando ElevenLabs (Síntesis de voz)...`);
  const audioStart = Date.now();
  currentPayload = await generateAllScenesAudio(currentPayload);
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
  currentPayload = await generateAllScenesVisuals(currentPayload);
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
  currentPayload = syncVideoUrlIntoPayload(currentPayload);
  const optionalVideoFn = resolveOptionalVideoService();
  if (!currentPayload?.video?.videoUrl && typeof optionalVideoFn === 'function') {
    console.log(`🎬 Ejecutando generador de video base antes de música...`);
    const videoGenStart = Date.now();
    const videoGenResult = await optionalVideoFn(currentPayload);
    currentPayload = syncVideoUrlIntoPayload(
      videoGenResult?.payload || videoGenResult || currentPayload,
      videoGenResult
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
      musicResult
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
      currentPayload?.meta?.targetDurationSeconds ||
      0
  );
  const endingBuffer = Number(
    currentPayload?.orchestration?.endingBufferSeconds ||
      currentPayload?.llmDirective?.structuredScript?.endingBufferSeconds ||
      0
  );
  const estimatedRenderSeconds = Math.max(0, scriptDuration + endingBuffer);
  recordStepUsage(jobId, 'video_render', {
    provider: 'ffmpeg',
    model: renderResult?.resolution || '1080p',
    videoClipsGenerated: visualScenes.length,
    renderDurationSeconds: estimatedRenderSeconds,
    latencyMs: Date.now() - renderStart
  });

  // Inyectar resultados del render al payload final
  currentPayload.renderResult = renderResult;
  if (renderResult?.payload && typeof renderResult.payload === 'object') {
    currentPayload = {
      ...renderResult.payload,
      renderResult
    };
  }
  currentPayload = syncVideoUrlIntoPayload(currentPayload, renderResult);
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
      musicPostResult
    );

    if (musicPostResult?.videoUrl) {
      renderResult = {
        ...renderResult,
        videoUrl: musicPostResult.videoUrl,
        videoFileName: musicPostResult.videoFileName || renderResult.videoFileName,
        musicApplied: Boolean(musicPostResult.musicApplied)
      };
      currentPayload.renderResult = renderResult;
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
  const savedProject = await VideoProject.findOneAndUpdate(
    { jobId },
    {
      ...currentPayload,
      ...(jobUsage ? { usage: jobUsage } : {}),
      status: 'completed',
      videoUrl: renderResult.videoUrl,
      createdAt: new Date()
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(
    `✅ [Pipeline Master] ¡Video y proyecto ${jobId} completados con éxito!`
  );
  return savedProject;
}

module.exports = {
  runCompletePipeline
};
