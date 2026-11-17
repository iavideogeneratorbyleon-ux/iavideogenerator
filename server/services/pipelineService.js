// server/services/pipelineService.js
const { generateStructuredScript } = require('./llmService');
const { generateAllScenesAudio } = require('./audioService');
const { generateAllScenesVisuals } = require('./visualService');
const { selectBackgroundMusic } = require('./musicService');
const { renderFinalVideo } = require('./renderService');
const VideoProject = require('../models/VideoProject');

async function runCompletePipeline(masterPayload) {
  const jobId = masterPayload?.meta?.jobId || `job_${Date.now()}`;
  masterPayload.meta = { ...masterPayload.meta, jobId };

  console.log(`🚀 [Pipeline Master] Iniciando flujo completo de 5 pasos para Job ID: ${jobId}`);

  // 1. Paso de IA: Generar guion estructurado con Gemini
  console.log(`1️⃣ Ejecutando Gemini (Generación de guion)...`);
  let currentPayload = await generateStructuredScript(masterPayload);

  // 2. Paso de Audio: Generar los MP3 por escena con ElevenLabs (respetando el voiceId seleccionado)
  console.log(`2️⃣ Ejecutando ElevenLabs (Síntesis de voz)...`);
  currentPayload = await generateAllScenesAudio(currentPayload);

  // 3. Paso de Visuales: Renderizar imágenes por escena con Gemini 2.5
  console.log(`3️⃣ Ejecutando Gemini 2.5 (Generación de visuales)...`);
  currentPayload = await generateAllScenesVisuals(currentPayload);

  // 4. Paso de Música: Seleccionar y preparar pista de fondo
  console.log(`4️⃣ Ejecutando selector de música de fondo...`);
  currentPayload = await selectBackgroundMusic(currentPayload);

  // 5. Paso de FFmpeg: Ensamblaje final de video con Ken Burns, subtítulos y marca de agua
  console.log(`5️⃣ Ejecutando FFmpeg (Renderizado de video final)...`);
  const renderResult = await renderFinalVideo(currentPayload);

  // Inyectar resultados del render al payload final
  currentPayload.renderResult = renderResult;

  // Paso de Persistencia Final: Guardar proyecto completo en MongoDB Atlas
  console.log(`💾 Guardando proyecto finalizado en MongoDB Atlas...`);
  const savedProject = await VideoProject.findOneAndUpdate(
    { jobId },
    { 
      ...currentPayload, 
      status: 'completed',
      videoUrl: renderResult.videoUrl,
      createdAt: new Date()
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`✅ [Pipeline Master] ¡Video y proyecto ${jobId} completados con éxito!`);
  return savedProject;
}

module.exports = {
  runCompletePipeline
};
