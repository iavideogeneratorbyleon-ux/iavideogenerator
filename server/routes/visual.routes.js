// server/routes/visual.routes.js
const express = require('express');
const router = express.Router();
const { resolvePipelineParameters } = require('../config/params/pipelineRegistry');
const { generateAllScenesVisuals } = require('../services/visualService');
const { recordStepUsage } = require('../services/usageCostService');

router.post('/generate-images', async (req, res) => {
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

    const enrichedPayload = await generateAllScenesVisuals(payload);

    if (jobId) {
      const scenes =
        enrichedPayload?.llmDirective?.structuredScript?.scenes ||
        enrichedPayload?.scenes ||
        [];

      const videoClipsCount = scenes.filter(
        (sc) => sc?.mediaType === 'video_clip' || Boolean(sc?.videoClipUrl || sc?.videoClipPath)
      ).length;
      const imagesCount = Math.max(0, scenes.length - videoClipsCount);

      recordStepUsage(
        jobId,
        'step3_visual_images',
        {
          provider:
            enrichedPayload?.visual?.provider ||
            resolvedParams?.models?.imageModel ||
            'gemini-2.5-flash-image',
          model:
            enrichedPayload?.visual?.model ||
            resolvedParams?.models?.imageModel ||
            'gemini-2.5-flash-image',
          imagesGenerated: imagesCount,
          videoClipsGenerated: videoClipsCount
        },
        {
          userId: body.userId || body.meta?.userId || null,
          userPlan: resolvedParams?.meta?.userPlan || body.userPlan || 'free_trial',
          product: payload.meta.product
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
    console.error('❌ Error en /api/visual/generate-images:', error);
    return res.status(500).json({
      success: false,
      ...(jobId ? { jobId } : {}),
      error: 'Error generando visuales por escena',
      details: error.message
    });
  }
});

module.exports = router;
