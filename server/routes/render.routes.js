// server/routes/render.routes.js
const express = require('express');
const router = express.Router();
const { resolvePipelineParameters } = require('../config/params/pipelineRegistry');
const { renderFinalVideo } = require('../services/renderService');
const { recordStepUsage } = require('../services/usageCostService');

// POST /api/render/video-generator
router.post('/video-generator', async (req, res) => {
  const rawPayload = req.body;

  if (!rawPayload || typeof rawPayload !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Se requiere un payload JSON válido con escenas, audio y visual.'
    });
  }

  const jobId = rawPayload.meta?.jobId || rawPayload.jobId || null;

  try {
    const resolvedParams =
      rawPayload.resolvedParams || resolvePipelineParameters(rawPayload);

    const payload = {
      ...rawPayload,
      resolvedParams,
      meta: {
        ...(rawPayload.meta || {}),
        ...(jobId ? { jobId } : {}),
        product:
          rawPayload.product ||
          rawPayload.meta?.product ||
          resolvedParams?.meta?.product ||
          'studio_lite'
      }
    };

    const result = await renderFinalVideo(payload);

    if (jobId) {
      const renderSeconds = Number(
        result?.durationSeconds ||
          result?.payload?.video?.durationSeconds ||
          resolvedParams?.format?.targetDurationSeconds ||
          0
      );

      recordStepUsage(
        jobId,
        'step4_render',
        {
          provider: 'ffmpeg_render',
          renderDurationSeconds: renderSeconds
        },
        {
          userId: rawPayload.userId || rawPayload.meta?.userId || null,
          userPlan:
            resolvedParams?.meta?.userPlan || rawPayload.userPlan || 'free_trial',
          product: payload.meta.product
        }
      );
    }

    return res.status(200).json({
      success: true,
      step: 4,
      ...(jobId ? { jobId } : {}),
      videoFileName: result.videoFileName,
      videoUrl: result.videoUrl,
      resolution: result.resolution,
      subtitlesEnabled: result.subtitlesEnabled,
      watermark: result.watermark,
      renderedAt: result.renderedAt,
      resolvedParams: result?.payload?.resolvedParams || resolvedParams,
      payload: result.payload
    });
  } catch (error) {
    console.error('❌ [Router Step 4 Render] Error:', error);
    return res.status(500).json({
      success: false,
      step: 4,
      ...(jobId ? { jobId } : {}),
      error: error.message || 'Error interno al renderizar el video del Paso 4.'
    });
  }
});

module.exports = router;
