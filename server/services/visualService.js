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

  // Extraemos la parte que contiene la imagen en Base64
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

  const jobId = masterPayload?.meta?.jobId || `job_${Date.now()}`;
  const aspectRatio = masterPayload?.config?.aspectRatio || '9:16';

  console.log(`🚀 [Visuals] Generando ${structuredScript.scenes.length} imágenes con Gemini para Job: ${jobId}...`);

  const updatedScenes = [];

  for (const scene of structuredScript.scenes) {
    const visualResult = await generateSceneImage({
      prompt: scene.visualPrompt,
      aspectRatio,
      jobId,
      sceneNumber: scene.sceneNumber
    });

    updatedScenes.push({
      ...scene,
      visual: visualResult
    });
  }

  console.log(`✅ [Visuals] Todas las imágenes generadas con éxito.`);

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
