// server/routes/studioLite.js
const express = require('express');
const router = express.Router();

const { generateStructuredScript } = require('../services/llmService');
const { generateAllScenesAudio } = require('../services/audioService');
const { generateAllScenesVisuals } = require('../services/visualService');
const { selectBackgroundMusic } = require('../services/musicService');
const { renderFinalVideo } = require('../services/renderService');
const VideoProject = require('../models/VideoProject');

router.post('/generate', async (req, res) => {
  try {
    // Recibimos el masterVideoPayload completo enviado desde el Wizard (Step 5) o Postman
    const masterPayload = req.body;

    if (!masterPayload || !masterPayload.userInputs || !masterPayload.userInputs.rawContent) {
      return res.status(400).json({ success: false, error: 'El payload maestro está incompleto o no contiene rawContent.' });
    }

    const jobId = `job_${Date.now()}`;
    // Inyectamos el jobId en la raíz y en meta por compatibilidad con Mongoose
    masterPayload.jobId = jobId;
    if (!masterPayload.meta) masterPayload.meta = {};
    masterPayload.meta.jobId = jobId;
    masterPayload.meta.status = 'processing';

    // 🔍 INSPECCIÓN DINÁMICA DE TODOS LOS PARÁMETROS DEL USUARIO
    console.log(`\n🚀 [Studio Lite Pipeline] Iniciando flujo maestro para Job ID: ${jobId}`);
    console.log(`   📌 Contenido: "${masterPayload.userInputs.rawContent.slice(0, 40)}..."`);
    console.log(`   🎛️ Parámetros dinámicos -> Tono: [${masterPayload.userInputs.tone}] | Voz: [${masterPayload.userInputs.voiceId}]`);
    console.log(`   🎨 Estilo Visual: [${masterPayload.userInputs.visualStyle || masterPayload.visualConfig?.styleKey}] | Música: [${masterPayload.userInputs.musicStyle || masterPayload.musicConfig?.styleKey}]`);
    console.log(`   📝 Subtítulos habilitados: [${masterPayload.userInputs.subtitlesEnabled ?? masterPayload.subtitlesConfig?.enabled}] | Plan: [${masterPayload.meta.userPlan}]`);

    // Paso 1: Generar Guion Estructurado (Gemini con Directivas del Payload)
    console.log('\n--- PASO 1/5: Generando Guion Estructurado ---');
    const scriptPayload = await generateStructuredScript(masterPayload);

    // Paso 2: Generar Locución por Escena (ElevenLabs usando la voz elegida de forma dinámica)
    console.log('\n--- PASO 2/5: Generando Locución (Audio) ---');
    const audioPayload = await generateAllScenesAudio(scriptPayload);

    // Paso 3: Generar Imágenes Fieles al Prompt (Gemini 2.5 aplicando el estilo visual del payload)
    console.log('\n--- PASO 3/5: Generando Visuales (Imágenes IA) ---');
    const visualPayload = await generateAllScenesVisuals(audioPayload);

    // Paso 4: Seleccionar Música de Fondo de forma dinámica
    console.log('\n--- PASO 4/5: Integrando Música de Fondo ---');
    const musicStyleChoice =
      masterPayload.userInputs?.musicStyle ||
      masterPayload.musicConfig?.styleKey ||
      'default';

    const backgroundMusic = selectBackgroundMusic(musicStyleChoice);

    visualPayload.audioLayer = {
      backgroundMusic,
      mixSettings: {
        voiceVolume: 1.0,
        musicVolume: backgroundMusic.volume,
        duckingEnabled: backgroundMusic.ducking
      }
    };

    // Paso 5: Renderizar Video Final MP4 (FFmpeg aplicando subtítulos y marca de agua si es free)
    console.log('\n--- PASO 5/5: Renderizando Video Final MP4 ---');
    const renderResult = await renderFinalVideo(visualPayload);

    visualPayload.finalVideo = renderResult;
    visualPayload.meta.status = 'completed';

    // Guardar proyecto consolidado en MongoDB Atlas
    console.log('\n💾 Guardando proyecto maestro final en MongoDB Atlas...');
    const newProject = new VideoProject(visualPayload);
    await newProject.save();

    console.log(`✨ [Studio Lite] Pipeline completado con éxito para el Job: ${jobId}`);

    return res.status(200).json({
      success: true,
      message: 'Video generado y renderizado con éxito de punta a punta.',
      jobId,
      videoUrl: renderResult.videoUrl,
      data: visualPayload
    });

  } catch (error) {
    console.error('❌ Error crítico en el Pipeline de Studio Lite:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno ejecutando el pipeline de Studio Lite.',
      details: error.message
    });
  }
});

module.exports = router;
