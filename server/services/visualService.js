// server/services/visualService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const IMAGE_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(IMAGE_OUTPUT_DIR)) {
  fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });
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

function buildSceneImagePrompt(scene, structuredScript, styleModifier) {
  const basePrompt =
    scene.imagePrompt ||
    [structuredScript.characterAndStyleBible, scene.visualPrompt].filter(Boolean).join(' | ') ||
    scene.visualPrompt ||
    '';

  const parts = [basePrompt];

  if (styleModifier) {
    parts.push(`Style override: ${styleModifier}`);
  }

  const avoidStyles = structuredScript?.styleGuide?.avoidStyles;
  if (avoidStyles) {
    parts.push(`Strictly avoid: ${avoidStyles}`);
  }

  return parts.filter(Boolean).join('. ');
}

async function generateSceneImage({ prompt, aspectRatio = '9:16', jobId, sceneNumber }) {
  console.log(`   🎨 [Gemini Image] Generando escena ${sceneNumber} (${aspectRatio})...`);

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
    provider: 'gemini-2.5-flash-image'
  };
}

async function generateAllScenesVisuals(rawPayload) {
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;
  const structuredScript = masterPayload?.llmDirective?.structuredScript;

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

  console.log(
    `🚀 [Visuals] Generando ${structuredScript.scenes.length} imágenes con Gemini (Aspect Ratio: ${aspectRatio}) para Job: ${jobId}...`
  );

  const updatedScenes = [];

  for (const scene of structuredScript.scenes) {
    const enhancedPrompt = buildSceneImagePrompt(scene, structuredScript, styleModifier);

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
    llmDirective: {
      ...masterPayload.llmDirective,
      structuredScript: {
        ...structuredScript,
        scenes: updatedScenes
      }
    }
  };
}

module.exports = {
  generateSceneImage,
  generateAllScenesVisuals
};
