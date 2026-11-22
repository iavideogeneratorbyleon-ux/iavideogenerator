// server/utils/sharedHelpers.js
const { GLOBALS } = require('../config/globals');

function clampNumber(value, min, max, fallbackOrDecimals = 2) {
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    const fallbackNum = Number(fallbackOrDecimals);
    if (!Number.isNaN(fallbackNum) && Number.isFinite(fallbackNum)) {
      return Number(Math.min(max, Math.max(min, fallbackNum)).toFixed(2));
    }
    return min;
  }
  const decimals =
    typeof fallbackOrDecimals === 'number' && Number.isInteger(fallbackOrDecimals) && fallbackOrDecimals >= 0 && fallbackOrDecimals <= 6
      ? fallbackOrDecimals
      : 2;
  return Number(Math.min(max, Math.max(min, num)).toFixed(decimals));
}

function normalizeKey(rawValue, aliases = {}, catalog = {}, fallback = 'default') {
  if (!rawValue || typeof rawValue !== 'string') {
    return fallback;
  }

  const cleaned = rawValue.trim().toLowerCase().replace(/\s+/g, '_');
  const aliased =
    aliases[cleaned] || aliases[cleaned.replace(/_/g, '-')] || aliases[cleaned.replace(/-/g, '_')] || cleaned;

  if (catalog && Object.prototype.hasOwnProperty.call(catalog, aliased)) {
    return aliased;
  }

  return fallback;
}

function sanitizePlainText(text = '') {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/\s+/g, ' ')
    .replace(/\b(\d+)\s*min\b/gi, '$1 minutes')
    .replace(/\b(\d+)\s*mins\b/gi, '$1 minutes')
    .replace(/\b(\d+)\s*hrs?\b/gi, '$1 hours')
    .replace(/&/g, ' and ')
    .replace(/%/g, ' percent')
    .replace(/\$(\d+)/g, '$1 dollars')
    .trim();
}

function resolvePlanPolicy(userPlan = 'free_trial') {
  const key = normalizeKey(userPlan, {}, GLOBALS.PLAN_POLICIES, 'free_trial');
  return GLOBALS.PLAN_POLICIES[key] || GLOBALS.PLAN_POLICIES.free_trial;
}

function buildUsageRecord({
  provider,
  model,
  operation,
  latencyMs = 0,
  inputUnits = 0,
  outputUnits = 0,
  estimatedCostUsd = 0,
  requestId = null,
  extra = {}
}) {
  return {
    provider,
    model,
    operation,
    latencyMs: Number(latencyMs) || 0,
    inputUnits: Number(inputUnits) || 0,
    outputUnits: Number(outputUnits) || 0,
    estimatedCostUsd: Number(estimatedCostUsd) || 0,
    requestId: requestId || null,
    timestamp: new Date().toISOString(),
    ...extra
  };
}

async function retryWithBackoff(
  fn,
  {
    maxRetries = 3,
    baseDelayMs = 800,
    timeoutMs = 30000,
    label = 'external_call'
  } = {}
) {
  const startAll = Date.now();
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const attemptStart = Date.now();

    try {
      const result = await fn({ attempt, signal: controller.signal });
      clearTimeout(timeoutId);
      return {
        result,
        attempts: attempt,
        latencyMs: Date.now() - startAll
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      const elapsed = Date.now() - attemptStart;

      if (attempt < maxRetries) {
        const waitMs = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️ [${label}] Intento ${attempt}/${maxRetries} fallido tras ${elapsed}ms (${error.message}). Reintentando en ${waitMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError || new Error(`[${label}] Falló tras ${maxRetries} intentos.`);
}

module.exports = {
  clampNumber,
  normalizeKey,
  sanitizePlainText,
  resolvePlanPolicy,
  buildUsageRecord,
  retryWithBackoff
};
