// server/services/visualService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { GLOBALS, resolveAiModelId } = require('../config/globals');
const {
  resolvePipelineParameters,
  resolveSceneMediaType
} = require('../config/params/pipelineRegistry');
const { normalizeKey, retryWithBackoff } = require('../utils/sharedHelpers');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const IMAGE_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');
const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';

if (!fs.existsSync(IMAGE_OUTPUT_DIR)) {
  fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });
}

const PRESETS_ALLOWING_IMAGE_TEXT = new Set(['mr_beast']);
const ALLOWED_ASPECT_RATIOS = new Set(['16:9', '9:16', '1:1']);

function extractModelString(candidate, fallback = DEFAULT_IMAGE_MODEL) {
  let extracted = '';
  if (typeof candidate === 'string' && candidate.trim()) {
    extracted = candidate.trim();
  } else if (candidate && typeof candidate === 'object') {
    const nested =
      candidate.defaultModelId ||
      candidate.modelId ||
      candidate.model ||
      candidate.fallbackModelId ||
      candidate.id ||
      candidate.name;
    if (typeof nested === 'string' && nested.trim()) {
      extracted = nested.trim();
    }
  }

  if (!extracted) return fallback;
  if (extracted.startsWith('imagen-')) return DEFAULT_IMAGE_MODEL;
  return extracted.replace(/^models\//, '');
}

function ensurePayloadResolvedParams(payload = {}) {
  const base = payload && typeof payload === 'object' ? { ...payload } : {};
  const resolvedParams =
    base.resolvedParams && typeof base.resolvedParams === 'object'
      ? base.resolvedParams
      : resolvePipelineParameters(base);
  return { ...base, resolvedParams };
}

function normalizeAspectRatio(rawRatio, fallback = '9:16') {
  const candidate = String(rawRatio || '').trim();
  if (ALLOWED_ASPECT_RATIOS.has(candidate)) {
    return candidate;
  }
  return ALLOWED_ASPECT_RATIOS.has(fallback) ? fallback : '9:16';
}

function normalizePresetForVisual(rawPreset) {
  return normalizeKey(
    rawPreset,
    GLOBALS.PRESET_ALIASES,
    GLOBALS.BASE_PRESET_MODIFIERS,
    'default'
  );
}

function resolveJobId(masterPayload, scenes) {
  if (masterPayload?.meta?.jobId) {
    return masterPayload.meta.jobId;
  }
  const firstAudioFile = scenes.find((s) => s?.audio?.fileName)?.audio?.fileName;
  if (firstAudioFile) {
    const match = firstAudioFile.match(/^(.+)_scene_\d+\.[^.]+$/);
    if (match?.[1]) return match[1];
  }
  return `job_${Date.now()}`;
}

function buildSceneImagePrompt(
  scene,
  structuredScript,
  {
    styleModifier = '',
    presetKey = 'default',
    resolvedStyle = null,
    resolvedFormat = null,
    mediaType = 'static_image'
  } = {}
) {
  const stylePrefix = [
    resolvedStyle?.promptAnchor,
    resolvedStyle?.lightingAndTexture
  ]
    .filter(Boolean)
    .join('. ');

  const sceneAction =
    scene.visualPrompt ||
    scene.imagePrompt ||
    '';

  const bibleSummary = structuredScript?.characterAndStyleBible || '';

  const parts = [];

  if (stylePrefix) {
    parts.push(`Mandatory visual style: ${stylePrefix}`);
  }

  if (bibleSummary) {
    parts.push(`Character & world consistency: ${bibleSummary}`);
  }

  if (sceneAction) {
    parts.push(`Scene ${scene.sceneNumber || ''} (${scene.role || 'body'}) action: ${sceneAction}`);
  }

  if (styleModifier) {
    parts.push(`Style override: ${styleModifier}`);
  }

  if (resolvedFormat?.promptFraming) {
    parts.push(`Framing: ${resolvedFormat.promptFraming}`);
  }

  if (mediaType === 'motion_image') {
    parts.push(
      'Composition ready for smooth subtle camera motion or parallax while keeping key subjects intact'
    );
  } else if (mediaType === 'video_clip') {
    parts.push(
      'Strong keyframe composition with clear subject posture and room for natural action'
    );
  }

  const normalizedPreset = normalizePresetForVisual(presetKey);
  const allowsText =
    typeof resolvedStyle?.allowTextInImage === 'boolean'
      ? resolvedStyle.allowTextInImage || PRESETS_ALLOWING_IMAGE_TEXT.has(normalizedPreset)
      : PRESETS_ALLOWING_IMAGE_TEXT.has(normalizedPreset);

  if (!allowsText) {
    parts.push(
      'Visual composition rule: purely visual scene with no text, no words, no letters, no captions, no banners, and no UI overlays inside the image'
    );
  }

  if (resolvedStyle?.promptAnchor) {
    parts.push(`Final art style lock: ${resolvedStyle.promptAnchor}`);
  }

  const avoidStyles = structuredScript?.styleGuide?.avoidStyles;
  if (avoidStyles) {
    parts.push(`Strictly avoid: ${avoidStyles}`);
  }

  return parts.filter(Boolean).join('. ');
}

async function generateSceneImage({
  prompt,
  aspectRatio = '9:16',
  jobId,
  sceneNumber,
  modelId = null,
  maxRetries = 3,
  retryDelayMs = 1500
}) {
  const explicitClean = extractModelString(modelId, '');
  const resolvedFromGlobals = resolveAiModelId('image', {
    explicitModelId: explicitClean || null
  });
  const resolvedImageModel = extractModelString(
    explicitClean || resolvedFromGlobals,
    DEFAULT_IMAGE_MODEL
  );

  const { result } = await retryWithBackoff(
    async ({ attempt }) => {
      if (attempt === 1) {
        console.log(`   🎨 [${resolvedImageModel}] Generando escena ${sceneNumber} (${aspectRatio})...`);
      } else {
        console.log(
          `   🔁 [${resolvedImageModel}] Reintento ${attempt}/${maxRetries} para escena ${sceneNumber} (${aspectRatio})...`
        );
      }

      const response = await ai.models.generateContent({
        model: resolvedImageModel,
        contents: prompt,
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((part) => part.inlineData && part.inlineData.data);

      if (!imagePart) {
        throw new Error(`Gemini no devolvió datos de imagen para la escena ${sceneNumber}.`);
      }

      const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const fileName = `${jobId}_scene_${sceneNumber}.jpg`;
      const filePath = path.join(IMAGE_OUTPUT_DIR, fileName);

      fs.writeFileSync(filePath, buffer);

      return {
        fileName,
        imageUrl: `/images/${fileName}`,
        provider: resolvedImageModel,
        aspectRatio,
        promptUsed: prompt
      };
    },
    {
      maxRetries,
      baseDelayMs: retryDelayMs,
      timeoutMs: 30000,
      label: `gemini_image_scene_${sceneNumber}`
    }
  );

  return result;
}

async function generateAllScenesVisuals(rawPayload) {
  const masterPayload = ensurePayloadResolvedParams(
    rawPayload?.payload || rawPayload?.data || rawPayload
  );
  const resolvedParams = masterPayload.resolvedParams;
  const resolvedFormat = resolvedParams?.format || null;
  const resolvedVisualFormat = resolvedParams?.visualFormat || null;
  const resolvedStyle = resolvedVisualFormat?.style || null;
  const resolvedMediaMode = resolvedVisualFormat?.mediaMode || null;

  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);

  if (!structuredScript || !Array.isArray(structuredScript.scenes)) {
    throw new Error('El payload no contiene llmDirective.structuredScript.scenes válido.');
  }

  const jobId = resolveJobId(masterPayload, structuredScript.scenes);

  const aspectRatio = normalizeAspectRatio(
    resolvedFormat?.aspectRatio ||
      masterPayload?.videoConfig?.aspectRatio ||
      masterPayload?.aspectRatio ||
      masterPayload?.meta?.aspectRatio ||
      masterPayload?.userInputs?.aspectRatio ||
      masterPayload?.visualConfig?.aspectRatio ||
      masterPayload?.config?.aspectRatio ||
      '9:16'
  );

  const styleModifier =
    masterPayload?.visualConfig?.stylePromptModifier ||
    masterPayload?.userInputs?.visualStyleModifier ||
    '';

  const presetKey =
    resolvedParams?.preset?.key ||
    masterPayload?.videoConfig?.preset ||
    masterPayload?.userInputs?.preset ||
    masterPayload?.video?.preset ||
    'default';

  const normalizedPreset = normalizePresetForVisual(presetKey);
  const explicitOverride = extractModelString(
    masterPayload?.visualConfig?.modelId ||
      masterPayload?.visual?.modelId ||
      masterPayload?.userInputs?.imageModelId,
    ''
  );
  const fromResolvedParams = extractModelString(resolvedParams?.models?.image, '');
  const fromGlobals = extractModelString(
    resolveAiModelId('image', {
      explicitModelId: explicitOverride || null,
      preset: normalizedPreset
    }),
    ''
  );

  const resolvedImageModel = extractModelString(
    explicitOverride || fromResolvedParams || fromGlobals,
    DEFAULT_IMAGE_MODEL
  );

  console.log(
    `🚀 [Visuals] Generando ${structuredScript.scenes.length} imágenes con ${resolvedImageModel} (Aspect Ratio: ${aspectRatio} | Style: ${resolvedStyle?.key || 'default'} | MediaMode: ${resolvedMediaMode?.key || 'static_only'}) para Job: ${jobId}...`
  );

  const updatedScenes = [];

  for (const scene of structuredScript.scenes) {
    const resolvedMediaType = resolveSceneMediaType(
      resolvedMediaMode || {},
      scene.role || 'body',
      scene.mediaType || null
    );

    const enhancedPrompt = buildSceneImagePrompt(scene, structuredScript, {
      styleModifier,
      presetKey,
      resolvedStyle,
      resolvedFormat,
      mediaType: resolvedMediaType
    });

    console.log(
      `   ✨ Prompt enriquecido escena ${scene.sceneNumber} [${resolvedMediaType}]: "${enhancedPrompt.slice(0, 80)}..."`
    );

    const visualResult = await generateSceneImage({
      prompt: enhancedPrompt,
      aspectRatio,
      jobId,
      sceneNumber: scene.sceneNumber,
      modelId: resolvedImageModel
    });

    updatedScenes.push({
      ...scene,
      mediaType: resolvedMediaType,
      visual: {
        ...visualResult,
        mediaType: resolvedMediaType
      }
    });
  }

  console.log(
    `✅ [Visuals] Todas las imágenes generadas con éxito aplicando el estilo y formato dinámico.`
  );

  return {
    ...masterPayload,
    aspectRatio,
    meta: {
      ...(masterPayload.meta || {}),
      jobId,
      aspectRatio,
      visualStyle: resolvedStyle?.key || masterPayload?.meta?.visualStyle || null,
      mediaMode: resolvedMediaMode?.key || masterPayload?.meta?.mediaMode || null
    },
    videoConfig: {
      ...(masterPayload.videoConfig || {}),
      aspectRatio,
      visualStyle: resolvedStyle?.key || masterPayload?.videoConfig?.visualStyle || null,
      mediaMode: resolvedMediaMode?.key || masterPayload?.videoConfig?.mediaMode || null
    },
    visual: {
      ...(masterPayload.visual || {}),
      provider: resolvedImageModel,
      jobId,
      aspectRatio,
      visualStyle: resolvedStyle?.key || null,
      mediaMode: resolvedMediaMode?.key || null,
      styleModifier: styleModifier || null,
      styleAnchor: structuredScript?.styleGuide?.styleAnchor || null,
      avoidStyles: structuredScript?.styleGuide?.avoidStyles || null
    },
    ...(masterPayload.llmDirective
      ? {
          llmDirective: {
            ...masterPayload.llmDirective,
            structuredScript: {
              ...structuredScript,
              scenes: updatedScenes
            }
          }
        }
      : {}),
    ...(masterPayload.structuredScript
      ? {
          structuredScript: {
            ...structuredScript,
            scenes: updatedScenes
          }
        }
      : {}),
    ...(Array.isArray(masterPayload.scenes) ? { scenes: updatedScenes } : {})
  };
}

module.exports = {
  generateSceneImage,
  generateAllScenesVisuals
};
