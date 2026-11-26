// server/services/motionService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { apiVersion: 'v1beta' }
});

const VIDEO_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos');
const MOCK_VIDEO_DIR = path.join(__dirname, '..', 'public', 'mock-videos');
const DEFAULT_MOTION_MODEL = 'gemini-omni-1.2-flash';

[VIDEO_OUTPUT_DIR, MOCK_VIDEO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const PRICING_PER_1M = {
  inputTextImage: Number(process.env.GEMINI_OMNI_INPUT_PER_1M || 0.30),
  outputTextThought: Number(process.env.GEMINI_OMNI_OUTPUT_TEXT_PER_1M || 2.50),
  outputVideo: Number(process.env.GEMINI_OMNI_OUTPUT_VIDEO_PER_1M || 5.00)
};

function isMockMotionEnabled() {
  return String(process.env.USE_MOCK_MOTION || '').trim().toLowerCase() === 'true';
}

function resolveMimeType(filePath) {
  const ext = path.extname(filePath || '').toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function calculateUsageAndCost(usage = {}) {
  const inputByModality = Array.isArray(usage.input_tokens_by_modality)
    ? usage.input_tokens_by_modality
    : [];
  const outputByModality = Array.isArray(usage.output_tokens_by_modality)
    ? usage.output_tokens_by_modality
    : [];

  const getModalityTokens = (arr, modality) =>
    arr.find((m) => m.modality === modality)?.tokens || 0;

  const inputImageTokens = getModalityTokens(inputByModality, 'image');
  const inputTextTokens = getModalityTokens(inputByModality, 'text');
  const totalInputTokens = usage.total_input_tokens || inputImageTokens + inputTextTokens;

  const outputVideoTokens = getModalityTokens(outputByModality, 'video');
  const outputTextTokens = getModalityTokens(outputByModality, 'text');
  const thoughtTokens = usage.total_thought_tokens || 0;
  const totalOutputTokens =
    (usage.total_output_tokens || outputVideoTokens + outputTextTokens) + thoughtTokens;

  const inputCostUsd = (totalInputTokens / 1_000_000) * PRICING_PER_1M.inputTextImage;
  const outputVideoCostUsd = (outputVideoTokens / 1_000_000) * PRICING_PER_1M.outputVideo;
  const outputTextThoughtCostUsd =
    ((outputTextTokens + thoughtTokens) / 1_000_000) * PRICING_PER_1M.outputTextThought;

  const totalCostUsd = inputCostUsd + outputVideoCostUsd + outputTextThoughtCostUsd;

  return {
    tokens: {
      inputImage: inputImageTokens,
      inputText: inputTextTokens,
      totalInput: totalInputTokens,
      outputVideo: outputVideoTokens,
      outputText: outputTextTokens,
      thought: thoughtTokens,
      totalOutput: totalOutputTokens,
      total: usage.total_tokens || totalInputTokens + totalOutputTokens
    },
    costUsd: {
      input: Number(inputCostUsd.toFixed(6)),
      outputVideo: Number(outputVideoCostUsd.toFixed(6)),
      outputTextThought: Number(outputTextThoughtCostUsd.toFixed(6)),
      total: Number(totalCostUsd.toFixed(6))
    },
    ratesPer1MUsed: PRICING_PER_1M
  };
}

function buildZeroUsageCost() {
  return {
    tokens: {
      inputImage: 0,
      inputText: 0,
      totalInput: 0,
      outputVideo: 0,
      outputText: 0,
      thought: 0,
      totalOutput: 0,
      total: 0
    },
    costUsd: {
      input: 0,
      outputVideo: 0,
      outputTextThought: 0,
      total: 0
    },
    ratesPer1MUsed: PRICING_PER_1M
  };
}

function extractVideoOutput(response) {
  const ov = response?.output_video;
  if (ov) {
    if (typeof ov === 'string') {
      if (ov.startsWith('http://') || ov.startsWith('https://')) {
        return { kind: 'uri', uri: ov, mimeType: 'video/mp4' };
      }
      return { kind: 'base64', data: ov, mimeType: 'video/mp4' };
    }
    if (typeof ov === 'object') {
      const data = ov.data || ov.base64 || ov.bytes || ov.video_bytes;
      if (data) {
        return { kind: 'base64', data, mimeType: ov.mime_type || ov.mimeType || 'video/mp4' };
      }
      const uri = ov.uri || ov.url || ov.file_uri;
      if (uri) {
        return { kind: 'uri', uri, mimeType: ov.mime_type || ov.mimeType || 'video/mp4' };
      }
    }
  }

  const outputs = Array.isArray(response?.outputs) ? response.outputs : [];
  for (const item of outputs) {
    if (item?.type === 'video' && item?.data) {
      return { kind: 'base64', data: item.data, mimeType: item.mime_type || 'video/mp4' };
    }
    if (item?.type === 'video' && (item?.uri || item?.url)) {
      return { kind: 'uri', uri: item.uri || item.url, mimeType: item.mime_type || 'video/mp4' };
    }
  }
  return null;
}

function findAvailableMockClips() {
  const candidateDirs = [
    process.env.MOCK_MOTION_SOURCE_DIR,
    MOCK_VIDEO_DIR,
    VIDEO_OUTPUT_DIR
  ].filter(Boolean);

  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.mp4'))
      .filter((f) => dir !== VIDEO_OUTPUT_DIR || f.includes('_motion.mp4'))
      .map((f) => path.join(dir, f));

    if (files.length > 0) {
      return files;
    }
  }
  return [];
}

async function generateMockMotionClip({
  jobId,
  sceneNumber,
  aspectRatio = '9:16',
  motionPrompt = ''
}) {
  const mockPool = findAvailableMockClips();
  if (!mockPool.length) {
    throw new Error(
      'USE_MOCK_MOTION=true está activo pero no hay clips .mp4 de muestra en server/public/mock-videos ni en MOCK_MOTION_SOURCE_DIR.'
    );
  }

  const idx = (Math.max(1, Number(sceneNumber) || 1) - 1) % mockPool.length;
  const sourceClip = mockPool[idx];
  const fileName = `${jobId}_scene_${sceneNumber}_motion.mp4`;
  const filePath = path.join(VIDEO_OUTPUT_DIR, fileName);

  fs.copyFileSync(sourceClip, filePath);

  console.log(
    `   🧪 [MOCK Motion] Escena ${sceneNumber} usando clip local (${path.basename(sourceClip)}) -> ${fileName} ($0.00)`
  );

  return {
    fileName,
    filePath,
    clipUrl: `/videos/${fileName}`,
    videoUrl: `/videos/${fileName}`,
    provider: 'mock-motion-cache',
    model: 'mock-motion-cache',
    aspectRatio,
    motionPromptUsed: motionPrompt,
    isMock: true,
    usageCost: buildZeroUsageCost()
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateMotionClipFromImage({
  imagePath,
  motionPrompt,
  aspectRatio = '9:16',
  jobId,
  sceneNumber,
  modelId = DEFAULT_MOTION_MODEL,
  maxRetries = 1,
  retryDelayMs = 2000
}) {
  if (isMockMotionEnabled()) {
    return generateMockMotionClip({
      jobId,
      sceneNumber,
      aspectRatio,
      motionPrompt
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Falta GEMINI_API_KEY en el entorno.');
  }
  if (!imagePath || !fs.existsSync(imagePath)) {
    throw new Error(`No existe la imagen base en disco para animar la escena ${sceneNumber}: ${imagePath}`);
  }

  const cleanModel = String(
    modelId || process.env.GEMINI_MOTION_IMAGE_MODEL || DEFAULT_MOTION_MODEL
  )
    .trim()
    .replace(/^models\//, '');

  const mimeType = resolveMimeType(imagePath);
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  const fileName = `${jobId}_scene_${sceneNumber}_motion.mp4`;
  const filePath = path.join(VIDEO_OUTPUT_DIR, fileName);

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt === 0) {
        console.log(
          `   🎞️ [${cleanModel}] Animando motion_image escena ${sceneNumber} (${aspectRatio})...`
        );
      } else {
        console.log(
          `   🔁 [${cleanModel}] Reintento ${attempt}/${maxRetries} motion_image escena ${sceneNumber}...`
        );
      }

      const response = await ai.interactions.create({
        model: cleanModel,
        input: [
          {
            type: 'image',
            data: base64Image,
            mime_type: mimeType
          },
          {
            type: 'text',
            text: motionPrompt
          }
        ],
        response_modalities: ['video']
      });

      const videoPayload = extractVideoOutput(response);
      if (!videoPayload) {
        throw new Error(
          `Sin salida de video en interactions.create (${cleanModel}) para escena ${sceneNumber}. ID: ${response?.id || 'N/A'}`
        );
      }

      if (videoPayload.kind === 'base64') {
        fs.writeFileSync(filePath, Buffer.from(videoPayload.data, 'base64'));
      } else if (videoPayload.kind === 'uri') {
        const res = await fetch(videoPayload.uri, {
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
        });
        if (!res.ok) {
          throw new Error(`Error al descargar video desde URI (${res.status}) en escena ${sceneNumber}.`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
      }

      const usageCost = calculateUsageAndCost(response?.usage);

      console.log(
        `   💰 [${fileName}] Tokens: ${usageCost.tokens.total} (video: ${usageCost.tokens.outputVideo}) | Costo est.: $${usageCost.costUsd.total}`
      );

      return {
        fileName,
        filePath,
        clipUrl: `/videos/${fileName}`,
        videoUrl: `/videos/${fileName}`,
        provider: cleanModel,
        model: cleanModel,
        interactionId: response?.id || null,
        aspectRatio,
        motionPromptUsed: motionPrompt,
        isMock: false,
        usageCost
      };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  throw lastError;
}

async function generateMotionBatch({
  jobId,
  scenes = [],
  aspectRatio = '9:16',
  concurrency = Number(process.env.MOTION_CONCURRENCY || 2),
  maxRetries = 1,
  modelId = DEFAULT_MOTION_MODEL
}) {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return {
      jobId,
      totalScenes: 0,
      succeeded: 0,
      failed: 0,
      elapsedMs: 0,
      isMock: isMockMotionEnabled(),
      usageCostSummary: {
        tokens: { input: 0, outputVideo: 0, thought: 0, total: 0 },
        costUsd: { input: 0, outputVideo: 0, outputTextThought: 0, total: 0 },
        avgCostPerClipUsd: 0
      },
      resultsBySceneNumber: {}
    };
  }

  const safeConcurrency = Math.max(1, Math.min(Number(concurrency) || 2, 4));
  const results = new Array(scenes.length);
  let cursor = 0;
  const startedAt = Date.now();

  async function worker() {
    while (cursor < scenes.length) {
      const idx = cursor++;
      const scene = scenes[idx];
      const sceneNumber = scene.sceneNumber ?? idx + 1;

      try {
        const clip = await generateMotionClipFromImage({
          imagePath: scene.imagePath,
          motionPrompt: scene.motionPrompt,
          aspectRatio,
          jobId,
          sceneNumber,
          modelId: scene.modelId || modelId,
          maxRetries
        });
        results[idx] = { ok: true, sceneNumber, clip };
      } catch (err) {
        console.warn(
          `   ⚠️ [MotionBatch] Falló animación escena ${sceneNumber}, usará imagen estática de respaldo:`,
          err?.message || err
        );
        results[idx] = { ok: false, sceneNumber, error: err?.message || String(err) };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(safeConcurrency, scenes.length) },
    () => worker()
  );
  await Promise.all(workers);

  const succeededItems = results.filter((r) => r?.ok);
  const resultsBySceneNumber = {};
  succeededItems.forEach((item) => {
    resultsBySceneNumber[item.sceneNumber] = item.clip;
  });

  const usageCostSummary = succeededItems.reduce(
    (acc, item) => {
      const t = item.clip?.usageCost?.tokens || {};
      const c = item.clip?.usageCost?.costUsd || {};
      acc.tokens.input += t.totalInput || 0;
      acc.tokens.outputVideo += t.outputVideo || 0;
      acc.tokens.thought += t.thought || 0;
      acc.tokens.total += t.total || 0;
      acc.costUsd.input += c.input || 0;
      acc.costUsd.outputVideo += c.outputVideo || 0;
      acc.costUsd.outputTextThought += c.outputTextThought || 0;
      acc.costUsd.total += c.total || 0;
      return acc;
    },
    {
      tokens: { input: 0, outputVideo: 0, thought: 0, total: 0 },
      costUsd: { input: 0, outputVideo: 0, outputTextThought: 0, total: 0 }
    }
  );

  usageCostSummary.costUsd.input = Number(usageCostSummary.costUsd.input.toFixed(6));
  usageCostSummary.costUsd.outputVideo = Number(usageCostSummary.costUsd.outputVideo.toFixed(6));
  usageCostSummary.costUsd.outputTextThought = Number(
    usageCostSummary.costUsd.outputTextThought.toFixed(6)
  );
  usageCostSummary.costUsd.total = Number(usageCostSummary.costUsd.total.toFixed(6));
  usageCostSummary.avgCostPerClipUsd = succeededItems.length
    ? Number((usageCostSummary.costUsd.total / succeededItems.length).toFixed(6))
    : 0;

  return {
    jobId,
    totalScenes: scenes.length,
    succeeded: succeededItems.length,
    failed: scenes.length - succeededItems.length,
    concurrencyUsed: safeConcurrency,
    elapsedMs: Date.now() - startedAt,
    isMock: isMockMotionEnabled(),
    usageCostSummary,
    resultsBySceneNumber
  };
}

module.exports = {
  generateMotionClipFromImage,
  generateMotionBatch,
  isMockMotionEnabled
};
