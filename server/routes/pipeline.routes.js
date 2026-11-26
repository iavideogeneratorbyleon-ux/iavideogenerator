// server/routes/pipeline.routes.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { runCompletePipeline } = require('../services/pipelineService');
const { getJobUsage } = require('../services/usageCostService');

router.post('/generate-video-project', async (req, res) => {
  const body = req.body || {};
  const jobId =
    body.meta?.jobId ||
    body.jobId ||
    `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  try {
    const masterPayload = {
      ...body,
      product: body.product || body.meta?.product || 'studio_lite',
      meta: {
        ...(body.meta || {}),
        jobId,
        product: body.product || body.meta?.product || 'studio_lite'
      }
    };

    const result = await runCompletePipeline(masterPayload);
    const usageSummary = getJobUsage(jobId);

    return res.status(200).json({
      success: true,
      jobId,
      message: 'Pipeline ejecutado de punta a punta y guardado en MongoDB',
      videoUrl: result?.video?.videoUrl || null,
      resolvedParams: result?.resolvedParams || null,
      usageSummary,
      payload: result
    });
  } catch (error) {
    console.error(`❌ Error en el Pipeline Principal (${jobId}):`, error);
    return res.status(500).json({
      success: false,
      jobId,
      error: 'Error ejecutando el pipeline completo',
      details: error.message
    });
  }
});

module.exports = router;
