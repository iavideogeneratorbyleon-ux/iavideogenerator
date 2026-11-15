// server/services/pipelineService.js
const { generateStructuredScript } = require('./llmService');
const { generateAllScenesAudio } = require('./audioService');
const VideoProject = require('../models/VideoProject');

async function runCompletePipeline(masterPayload) {
  const jobId = masterPayload?.meta?.jobId || `job_${Date.now()}`;
  masterPayload.meta = { ...masterPayload.meta, jobId };

  console.log(`🚀 [Pipeline Master] Iniciando flujo completo para Job ID: ${jobId}`);

  // 1. Paso de IA: Generar guion estructurado con Gemini (en inglés)
  console.log(`1️⃣ Ejecutando Gemini (Generación de guion)...`);
  const scriptEnrichedPayload = await generateStructuredScript(masterPayload);

  // 2. Paso de Audio: Generar los MP3 por escena con ElevenLabs
  console.log(`2️⃣ Ejecutando ElevenLabs (Síntesis de voz)...`);
  const audioEnrichedPayload = await generateAllScenesAudio(scriptEnrichedPayload);

  // 3. Paso de Persistencia: Guardar o actualizar en MongoDB Atlas
  console.log(`3️⃣ Guardando metadatos y rutas en MongoDB Atlas...`);
  
  const savedProject = await VideoProject.findOneAndUpdate(
    { jobId },
    { 
      ...audioEnrichedPayload, 
      status: 'audio_generated',
      createdAt: new Date()
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`✅ [Pipeline Master] Proyecto ${jobId} procesado y guardado con éxito.`);
  return savedProject;
}

module.exports = {
  runCompletePipeline
};
