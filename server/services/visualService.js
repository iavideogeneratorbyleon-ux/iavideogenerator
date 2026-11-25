// visualService.js  // server/services/visualService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { GLOBALS, resolveAiModelId } = require('../config/globals');
const { normalizeKey, retryWithBackoff } = require('../utils/sharedHelpers');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const IMAGE_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(IMAGE_OUTPUT_DIR)) {
  fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });
}

const PRESETS_ALLOWING_IMAGE_TEXT = new Set(['mr_beast']);
const ALLOWED_ASPECT_RATIOS = new Set(['16:9', '9:16', '1:1']);

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

function buildSceneImagePrompt(scene, structuredScript, styleModifier, presetKey = 'default') {
  const basePrompt =
    scene.imagePrompt ||
    [structuredScript.characterAndStyleBible, scene.visualPrompt].filter(Boolean).join(' | ') ||
    scene.visualPrompt ||
    '';

  const parts = [basePrompt];

  if (styleModifier) {
    parts.push(`Style override: ${styleModifier}`);
  }

  const normalizedPreset = normalizePresetForVisual(presetKey);
  const allowsText = PRESETS_ALLOWING_IMAGE_TEXT.has(normalizedPreset);

  if (!allowsText) {
    parts.push(
      'Visual composition rule: purely visual scene with no text, no words, no letters, no captions, no banners, and no UI overlays inside the image'
    );
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
  const resolvedImageModel =
    resolveAiModelId('image', { explicitModelId: modelId }) || 'gemini-2.5-flash-image';

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
            aspectRatio: aspectRatio // Soporta '9:16', '16:9', '1:1'
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
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;
  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);

  if (!structuredScript || !Array.isArray(structuredScript.scenes)) {
    throw new Error('El payload no contiene llmDirective.structuredScript.scenes válido.');
  }

  const jobId = resolveJobId(masterPayload, structuredScript.scenes);

  // 🔍 Extracción dinámica y robusta del Aspect Ratio desde cualquier nivel del payload
  const aspectRatio = normalizeAspectRatio(
    masterPayload?.videoConfig?.aspectRatio ||
      masterPayload?.aspectRatio ||
      masterPayload?.meta?.aspectRatio ||
      masterPayload?.userInputs?.aspectRatio ||
      masterPayload?.visualConfig?.aspectRatio ||
      masterPayload?.config?.aspectRatio ||
      '9:16'
  );

  // 🎨 Extracción del Modificador de Estilo Visual (ej. vector, cinematic, etc.)
  const styleModifier =
    masterPayload?.visualConfig?.stylePromptModifier ||
    masterPayload?.userInputs?.visualStyleModifier ||
    '';

  const presetKey =
    masterPayload?.videoConfig?.preset ||
    masterPayload?.userInputs?.preset ||
    masterPayload?.video?.preset ||
    'default';

  const normalizedPreset = normalizePresetForVisual(presetKey);
  const resolvedImageModel = resolveAiModelId('image', {
    explicitModelId:
      masterPayload?.visualConfig?.modelId ||
      masterPayload?.visual?.modelId ||
      masterPayload?.userInputs?.imageModelId,
    preset: normalizedPreset
  }) || 'gemini-2.5-flash-image';

  console.log(
    `🚀 [Visuals] Generando ${structuredScript.scenes.length} imágenes con ${resolvedImageModel} (Aspect Ratio: ${aspectRatio}) para Job: ${jobId}...`
  );

  const updatedScenes = [];

  for (const scene of structuredScript.scenes) {
    const enhancedPrompt = buildSceneImagePrompt(
      scene,
      structuredScript,
      styleModifier,
      presetKey
    );

    console.log(
      `   ✨ Prompt enriquecido escena ${scene.sceneNumber}: "${enhancedPrompt.slice(0, 80)}..."`
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
      visual: visualResult
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
      aspectRatio
    },
    videoConfig: {
      ...(masterPayload.videoConfig || {}),
      aspectRatio
    },
    visual: {
      ...(masterPayload.visual || {}),
      provider: resolvedImageModel,
      jobId,
      aspectRatio,
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
