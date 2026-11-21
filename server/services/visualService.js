// visualService.js  // server/services/visualService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const IMAGE_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(IMAGE_OUTPUT_DIR)) {
  fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });
}

const PRESETS_ALLOWING_IMAGE_TEXT = new Set(['mr_beast']);

function normalizePresetForVisual(rawPreset) {
  if (!rawPreset || typeof rawPreset !== 'string') return 'default';
  const cleaned = rawPreset.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (cleaned === 'mrbeast' || cleaned === 'mr_beast') return 'mr_beast';
  if (cleaned === 'tiktok' || cleaned === 'tiktok_viral' || cleaned === 'viral') {
    return 'tiktok_viral';
  }
  return cleaned;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateSceneImage({
  prompt,
  aspectRatio = '9:16',
  jobId,
  sceneNumber,
  maxRetries = 3,
  retryDelayMs = 1500
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (attempt === 1) {
      console.log(`   🎨 [Gemini Image] Generando escena ${sceneNumber} (${aspectRatio})...`);
    } else {
      console.log(
        `   🔁 [Gemini Image] Reintento ${attempt}/${maxRetries} para escena ${sceneNumber} (${aspectRatio})...`
      );
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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
        provider: 'gemini-2.5-flash-image',
        aspectRatio,
        promptUsed: prompt
      };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(retryDelayMs * attempt);
      }
    }
  }

  throw lastError;
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
  const aspectRatio =
    masterPayload?.userInputs?.aspectRatio ||
    masterPayload?.visualConfig?.aspectRatio ||
    masterPayload?.config?.aspectRatio ||
    '9:16';

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

  console.log(
    `🚀 [Visuals] Generando ${structuredScript.scenes.length} imágenes con Gemini (Aspect Ratio: ${aspectRatio}) para Job: ${jobId}...`
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
      sceneNumber: scene.sceneNumber
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
    meta: {
      ...(masterPayload.meta || {}),
      jobId
    },
    visual: {
      ...(masterPayload.visual || {}),
      provider: 'gemini-2.5-flash-image',
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
