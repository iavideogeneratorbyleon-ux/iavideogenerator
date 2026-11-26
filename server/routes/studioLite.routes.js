// server/routes/studioLite.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { resolvePipelineParameters } = require('../config/params/pipelineRegistry');
const { runCompletePipeline } = require('../services/pipelineService');
const { getJobUsage } = require('../services/usageCostService');

router.post('/generate-video', async (req, res) => {
  const body = req.body || {};
  const jobId =
    body.meta?.jobId ||
    body.jobId ||
    `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  try {
    const userInputs = {
      ...(body.userInputs || {}),
      mode: body.userInputs?.mode || body.mode || 'idea',
      rawContent: body.userInputs?.rawContent ?? body.rawContent ?? '',
      tone:
        body.userInputs?.tone ||
        body.voiceConfig?.tone ||
        body.voice?.tone ||
        body.tone ||
        'storytelling',
      hook: body.userInputs?.hook ?? body.hook ?? '',
      cta: body.userInputs?.cta ?? body.cta ?? '',
      aspectRatio:
        body.userInputs?.aspectRatio ||
        body.visualConfig?.aspectRatio ||
        body.visual?.aspectRatio ||
        body.video?.aspectRatio ||
        body.aspectRatio ||
        '9:16',
      preset:
        body.userInputs?.preset ||
        body.videoConfig?.preset ||
        body.preset ||
        body.video?.preset ||
        'default',
      voiceId:
        body.userInputs?.voiceId ||
        body.voiceConfig?.voiceId ||
        body.voice?.voiceId ||
        process.env.ELEVENLABS_DEFAULT_VOICE_ID
    };

    const masterPayload = {
      ...body,
      product: 'studio_lite',
      userId: body.userId || body.meta?.userId || null,
      meta: {
        ...(body.meta || {}),
        jobId,
        product: 'studio_lite',
        userPlan:
          body.meta?.userPlan ||
          body.userPlan ||
          body.llmDirective?.planApplied ||
          'free_trial',
        language:
          body.meta?.language ||
          body.userInputs?.language ||
          body.llmDirective?.language ||
          'en',
        targetDurationSeconds:
          body.meta?.targetDurationSeconds ??
          body.targetDurationSeconds ??
          body.durationSeconds
      },
      userInputs,
      videoConfig: {
        ...(body.videoConfig || {}),
        preset: userInputs.preset,
        resolution: body.videoConfig?.resolution || body.video?.resolution,
        subtitles: {
          ...(typeof body.videoConfig?.subtitles === 'object'
            ? body.videoConfig.subtitles
            : {}),
          enabled:
            typeof body.videoConfig?.subtitles?.enabled === 'boolean'
              ? body.videoConfig.subtitles.enabled
              : typeof body.videoConfig?.subtitles === 'boolean'
                ? body.videoConfig.subtitles
                : typeof body.video?.subtitles?.enabled === 'boolean'
                  ? body.video.subtitles.enabled
                  : true
        }
      },
      visualConfig: {
        ...(body.visualConfig || {}),
        aspectRatio: userInputs.aspectRatio
      },
      voiceConfig: {
        ...(body.voiceConfig || {}),
        voiceId: userInputs.voiceId
      }
    };

    // Modo rápido de inspección de parámetros sin disparar generación de medios ni render
    if (body.dryRun === true) {
      const resolvedParams = resolvePipelineParameters(masterPayload);
      return res.status(200).json({
        success: true,
        dryRun: true,
        jobId,
        product: 'studio_lite',
        resolvedParams
      });
    }

    const result = await runCompletePipeline(masterPayload);
    const usageSummary = getJobUsage(jobId);

    const finalVideoFileName =
      result?.video?.fileName || `${jobId}_final_with_music.mp4`;
    const finalVideoUrl =
      result?.video?.videoUrl || `/videos/${finalVideoFileName}`;

    return res.status(200).json({
      success: true,
      jobId,
      product: 'studio_lite',
      videoFileName: finalVideoFileName,
      videoUrl: finalVideoUrl,
      musicApplied: Boolean(result?.music?.applied),
      trackKey: result?.music?.trackKey || null,
      duckingEnabled: Boolean(result?.music?.duckingEnabled),
      resolvedParams: result?.resolvedParams || null,
      usageSummary,
      payload: result
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
