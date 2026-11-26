// server/routes/llm.routes.js
const express = require('express');
const router = express.Router();
const { resolvePipelineParameters } = require('../config/params/pipelineRegistry');
const { generateStructuredScript } = require('../services/llmService');
const { initJobUsage, recordStepUsage } = require('../services/usageCostService');

router.post('/generate-script', async (req, res) => {
  const body = req.body || {};
  const sourcePayload = body.payload || body.data || body;
  const jobId =
    body.meta?.jobId ||
    body.jobId ||
    sourcePayload.meta?.jobId ||
    sourcePayload.jobId ||
    null;

  try {
    const resolvedParams =
      sourcePayload.resolvedParams ||
      body.resolvedParams ||
      resolvePipelineParameters(sourcePayload);

    const product =
      body.product ||
      body.meta?.product ||
      sourcePayload.product ||
      sourcePayload.meta?.product ||
      resolvedParams?.meta?.product ||
      'studio_lite';
    const userId =
      body.userId ||
      body.meta?.userId ||
      sourcePayload.userId ||
      sourcePayload.meta?.userId ||
      null;
    const userPlan =
      resolvedParams?.meta?.userPlan ||
      sourcePayload.meta?.userPlan ||
      body.meta?.userPlan ||
      body.userPlan ||
      'free_trial';

    const payload = {
      ...sourcePayload,
      resolvedParams,
      meta: {
        ...(sourcePayload.meta || {}),
        ...(body.meta || {}),
        ...(jobId ? { jobId } : {}),
        product,
        userPlan
      }
    };

    const llmStart = Date.now();
    const result = await generateStructuredScript(payload);

    if (jobId) {
      initJobUsage(jobId, { userId, userPlan, product });
      const scenes = result?.llmDirective?.structuredScript?.scenes || [];
      const usageMeta =
        result?.llmDirective?.usageMetadata || result?.llmDirective?.usage || {};
      const totalTokens = Number(
        usageMeta.totalTokens ??
          (Number(usageMeta.inputTokens || 0) + Number(usageMeta.outputTokens || 0))
      );

      recordStepUsage(
        jobId,
        'script_generation',
        {
          provider: result?.llmDirective?.provider || 'google-gemini',
          model:
            result?.llmDirective?.model ||
            resolvedParams?.models?.llm ||
            'gemini-3.8-flash',
          llmTokens: Number.isFinite(totalTokens) ? totalTokens : 0,
          inputTokens: Number(usageMeta.inputTokens || 0),
          outputTokens: Number(usageMeta.outputTokens || 0),
          scenesCount: scenes.length,
          latencyMs: Date.now() - llmStart
        },
        { userId, userPlan, product }
      );
    }

    return res.status(200).json({
      success: true,
      ...(jobId ? { jobId } : {}),
      resolvedParams: result?.resolvedParams || resolvedParams,
      payload: result
    });
  } catch (error) {
    console.error('❌ Error en /api/llm/generate-script:', error);
    return res.status(500).json({
      success: false,
      ...(jobId ? { jobId } : {}),
      error: error.message
    });
  }
});

module.exports = router;
