// server/services/usageCostService.js
const { GLOBALS } = require('../config/globals');
const { clampNumber, normalizeKey, buildUsageRecord } = require('../utils/sharedHelpers');

const usageRecords = new Map();

// Tarifas estimadas de referencia (ajustables por .env y reemplazables si el proveedor devuelve costo real)
const DEFAULT_RATES = {
  llmPer1kTokens: clampNumber(process.env.COST_LLM_PER_1K_TOKENS, 0, 100, 0.002),
  ttsPer1kChars: clampNumber(process.env.COST_TTS_PER_1K_CHARS, 0, 100, 0.015),
  imagePerUnit: clampNumber(process.env.COST_IMAGE_PER_UNIT, 0, 100, 0.02),
  videoClipPerSecond: clampNumber(process.env.COST_VIDEO_CLIP_PER_SEC, 0, 100, 0.08),
  renderPerSecond: clampNumber(process.env.COST_RENDER_PER_SEC, 0, 100, 0.001),
  musicMixPerJob: clampNumber(process.env.COST_MUSIC_MIX_PER_JOB, 0, 100, 0.002)
};

function roundCost(value) {
  return clampNumber(value, 0, 1000000, 6);
}

function initJobUsage(jobId, meta = {}) {
  const normalizedPlan = normalizeKey(
    meta.userPlan,
    {},
    GLOBALS.PLAN_POLICIES,
    'free_trial'
  );
  const normalizedProduct = normalizeKey(
    meta.product,
    {},
    GLOBALS.PRODUCTS,
    'studio_lite'
  );

  const record = {
    jobId,
    userId: meta.userId || null,
    userPlan: normalizedPlan,
    product: normalizedProduct,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: {},
    totals: {
      llmTokens: 0,
      ttsCharacters: 0,
      imagesGenerated: 0,
      videoClipsGenerated: 0,
      audioSeconds: 0,
      estimatedCostUsd: 0,
      reportedCostUsd: 0,
      finalCostUsd: 0
    }
  };
  usageRecords.set(jobId, record);
  return record;
}

function recalculateTotals(record) {
  let llmTokens = 0;
  let ttsCharacters = 0;
  let imagesGenerated = 0;
  let videoClipsGenerated = 0;
  let audioSeconds = 0;
  let estimatedCostUsd = 0;
  let reportedCostUsd = 0;

  for (const step of Object.values(record.steps)) {
    llmTokens += Number(step.metrics?.llmTokens || 0);
    ttsCharacters += Number(step.metrics?.ttsCharacters || 0);
    imagesGenerated += Number(step.metrics?.imagesGenerated || 0);
    videoClipsGenerated += Number(step.metrics?.videoClipsGenerated || 0);
    audioSeconds += Number(step.metrics?.audioSeconds || 0);

    if (typeof step.reportedCostUsd === 'number' && !Number.isNaN(step.reportedCostUsd)) {
      reportedCostUsd += step.reportedCostUsd;
    }
    estimatedCostUsd += Number(step.estimatedCostUsd || 0);
  }

  record.totals = {
    llmTokens,
    ttsCharacters,
    imagesGenerated,
    videoClipsGenerated,
    audioSeconds: Number(audioSeconds.toFixed(2)),
    estimatedCostUsd: roundCost(estimatedCostUsd),
    reportedCostUsd: roundCost(reportedCostUsd),
    finalCostUsd: roundCost(reportedCostUsd > 0 ? reportedCostUsd : estimatedCostUsd)
  };
  record.updatedAt = new Date().toISOString();
}

function recordStepUsage(jobId, stepName, rawUsage = {}, meta = {}) {
  const record = usageRecords.get(jobId) || initJobUsage(jobId, meta);

  const llmTokens = Number(rawUsage.llmTokens || rawUsage.totalTokens || 0);
  const ttsCharacters = Number(rawUsage.ttsCharacters || rawUsage.characters || 0);
  const imagesGenerated = Number(rawUsage.imagesGenerated || 0);
  const videoClipsGenerated = Number(rawUsage.videoClipsGenerated || 0);
  const clipDurationSeconds = Number(rawUsage.clipDurationSeconds || 0);
  const renderDurationSeconds = Number(rawUsage.renderDurationSeconds || 0);
  const audioSeconds = Number(rawUsage.audioSeconds || 0);

  const calculatedEstimate =
    (llmTokens / 1000) * DEFAULT_RATES.llmPer1kTokens +
    (ttsCharacters / 1000) * DEFAULT_RATES.ttsPer1kChars +
    imagesGenerated * DEFAULT_RATES.imagePerUnit +
    (videoClipsGenerated > 0
      ? (clipDurationSeconds > 0 ? clipDurationSeconds : videoClipsGenerated * 5) *
        DEFAULT_RATES.videoClipPerSecond
      : 0) +
    renderDurationSeconds * DEFAULT_RATES.renderPerSecond +
    (rawUsage.musicMixed ? DEFAULT_RATES.musicMixPerJob : 0);

  const reportedCost =
    typeof rawUsage.costUsd === 'number'
      ? rawUsage.costUsd
      : typeof rawUsage.reportedCostUsd === 'number'
      ? rawUsage.reportedCostUsd
      : null;

  const finalEstimatedCostUsd = roundCost(
    typeof rawUsage.estimatedCostUsd === 'number'
      ? rawUsage.estimatedCostUsd
      : calculatedEstimate
  );

  const usageTelemetry = buildUsageRecord({
    provider: rawUsage.provider || null,
    model: rawUsage.model || null,
    operation: stepName,
    latencyMs: rawUsage.latencyMs || 0,
    inputUnits: rawUsage.inputUnits || llmTokens || ttsCharacters || 0,
    outputUnits: rawUsage.outputUnits || imagesGenerated || videoClipsGenerated || 0,
    estimatedCostUsd: finalEstimatedCostUsd,
    requestId: rawUsage.requestId || null
  });

  record.steps[stepName] = {
    provider: rawUsage.provider || null,
    model: rawUsage.model || null,
    metrics: {
      llmTokens,
      ttsCharacters,
      imagesGenerated,
      videoClipsGenerated,
      clipDurationSeconds,
      renderDurationSeconds,
      audioSeconds
    },
    estimatedCostUsd: finalEstimatedCostUsd,
    reportedCostUsd: reportedCost !== null ? roundCost(reportedCost) : null,
    telemetry: usageTelemetry,
    recordedAt: usageTelemetry.timestamp
  };

  recalculateTotals(record);
  return record;
}

function getJobUsage(jobId) {
  return usageRecords.get(jobId) || null;
}

function listAllUsage() {
  const jobs = Array.from(usageRecords.values());
  const grandTotalEstimatedUsd = roundCost(
    jobs.reduce((acc, j) => acc + (j.totals?.estimatedCostUsd || 0), 0)
  );
  const grandTotalReportedUsd = roundCost(
    jobs.reduce((acc, j) => acc + (j.totals?.reportedCostUsd || 0), 0)
  );
  const grandTotalFinalUsd = roundCost(
    jobs.reduce((acc, j) => acc + (j.totals?.finalCostUsd || 0), 0)
  );

  return {
    totalJobs: jobs.length,
    grandTotalEstimatedUsd,
    grandTotalReportedUsd,
    grandTotalFinalUsd,
    jobs
  };
}

module.exports = {
  initJobUsage,
  recordStepUsage,
  getJobUsage,
  listAllUsage
};
