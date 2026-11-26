// server/routes/audio.routes.js
const express = require('express');
const router = express.Router();
const { resolvePipelineParameters } = require('../config/params/pipelineRegistry');
const { generateAllScenesAudio } = require('../services/audioService');
const { recordStepUsage } = require('../services/usageCostService');

router.post('/generate-audio', async (req, res) => {
  const body = req.body || {};
  const jobId = body.meta?.jobId || body.jobId || null;

  try {
    const resolvedParams =
      body.resolvedParams || resolvePipelineParameters(body);

    const masterPayload = {
      ...body,
      resolvedParams,
      meta: {
        ...(body.meta || {}),
        ...(jobId ? { jobId } : {}),
        product:
          body.product ||
          body.meta?.product ||
          resolvedParams?.meta?.product ||
          'studio_lite'
      }
    };

    const enrichedPayload = await generateAllScenesAudio(masterPayload);

    if (jobId) {
      const scenes =
        enrichedPayload?.llmDirective?.structuredScript?.scenes ||
        enrichedPayload?.scenes ||
        [];
      const totalChars = scenes.reduce(
        (acc, sc) => acc + String(sc?.voiceoverText || '').length,
        0
      );
      const totalAudioSec = scenes.reduce(
        (acc, sc) =>
          acc +
          Number(
            sc?.audioDurationSeconds ??
              sc?.durationSeconds ??
              sc?.duration ??
              0
          ),
        0
      );

      recordStepUsage(
        jobId,
        'step2_voice',
        {
          provider: enrichedPayload?.voice?.provider || 'elevenlabs',
          model:
            enrichedPayload?.voice?.modelId ||
            resolvedParams?.voiceAndScript?.ttsModelId ||
            'eleven_multilingual_v2',
          ttsCharacters: totalChars,
          audioSeconds: Number(totalAudioSec.toFixed(2))
        },
        {
          userId: body.userId || body.meta?.userId || null,
          userPlan: resolvedParams?.meta?.userPlan || body.userPlan || 'free_trial',
          product: masterPayload.meta.product
        }
      );
    }

    return res.status(200).json({
      success: true,
      ...(jobId ? { jobId } : {}),
      resolvedParams: enrichedPayload?.resolvedParams || resolvedParams,
      payload: enrichedPayload
    });
  } catch (error) {
    console.error('❌ Error en /api/audio/generate-audio:', error);
    return res.status(500).json({
      success: false,
      ...(jobId ? { jobId } : {}),
      error: 'Error generando los audios con ElevenLabs',
      details: error.message
    });
  }
});

module.exports = router;
