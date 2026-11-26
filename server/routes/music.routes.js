// server/routes/music.routes.js
const express = require('express');
const router = express.Router();
const { resolvePipelineParameters } = require('../config/params/pipelineRegistry');
const { applyBackgroundMusic, MUSIC_CATALOG } = require('../services/musicService');
const { recordStepUsage } = require('../services/usageCostService');

router.get('/catalog', (_req, res) => {
  return res.json({
    success: true,
    tracks: Object.values(MUSIC_CATALOG)
  });
});

router.post('/add-music', async (req, res) => {
  const body = req.body || {};
  const jobId = body.meta?.jobId || body.jobId || null;

  try {
    const resolvedParams =
      body.resolvedParams || resolvePipelineParameters(body);

    const payload = {
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

    const result = await applyBackgroundMusic(payload);

    if (jobId) {
      const sfxCuesCount = Number(
        result?.sfxCuesCount ??
          result?.payload?.music?.sfxCuesCount ??
          0
      );

      recordStepUsage(
        jobId,
        'step5_music',
        {
          provider: 'ffmpeg_music',
          musicMixed: Boolean(result.musicApplied),
          sfxCuesCount
        },
        {
          userId: body.userId || body.meta?.userId || null,
          userPlan: resolvedParams?.meta?.userPlan || body.userPlan || 'free_trial',
          product: payload.meta.product
        }
      );
    }

    return res.json({
      success: true,
      ...(jobId ? { jobId } : {}),
      videoFileName: result.videoFileName,
      videoUrl: result.videoUrl,
      musicApplied: result.musicApplied,
      trackKey: result.trackKey,
      duckingEnabled: result.duckingEnabled,
      resolvedParams: result?.payload?.resolvedParams || resolvedParams,
      payload: result.payload
    });
  } catch (error) {
    console.error('❌ Error en /add-music:', error);
    return res.status(500).json({
      success: false,
      ...(jobId ? { jobId } : {}),
      error: error.message || 'Error al mezclar la música de fondo.'
    });
  }
});

module.exports = router;
