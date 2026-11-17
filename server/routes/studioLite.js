// server/routes/studioLite.js
const express = require('express');
const router = express.Router();

const { generateStructuredScript } = require('../services/llmService'); // ✅ Corregido aquí
const { generateAllScenesAudio } = require('../services/audioService'); 
const { generateAllScenesVisuals } = require('../services/visualService'); 
const { selectBackgroundMusic } = require('../services/musicService');
const VideoProject = require('../models/VideoProject'); 

router.post('/generate', async (req, res) => {
  try {
    const { topic, language = 'en', targetAudience = 'US General', aspectRatio = '9:16' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'El campo "topic" es obligatorio.' });
    }

    const jobId = `job_${Date.now()}`;
    console.log(`\n🚀 [Studio Lite Pipeline] Iniciando flujo maestro para Job ID: ${jobId}`);
    console.log(`   📌 Tema: "${topic}" | Idioma: ${language} | Aspecto: ${aspectRatio}`);

    // Construimos el payload inicial que espera tu llmService.js
    const initialPayload = {
      meta: {
        jobId,
        language,
        userPlan: 'lite'
      },
      userInputs: {
        mode: 'idea',
        rawContent: topic,
        tone: 'dynamic',
        visualStyle: 'cinematic',
        language
      },
      config: {
        aspectRatio
      }
    };

    // Paso 1: Generar Guion Estructurado (Usando tu llmService existente)
    console.log('\n--- PASO 1/4: Generando Guion ---');
    const scriptPayload = await generateStructuredScript(initialPayload);

    // Paso 2: Generar Locución por Escena (ElevenLabs)
    console.log('\n--- PASO 2/4: Generando Locución (Audio) ---');
    const audioPayload = await generateAllScenesAudio(scriptPayload);

    // Paso 3: Generar Imágenes Fieles al Prompt (Gemini 2.5 Flash Image)
    console.log('\n--- PASO 3/4: Generando Visuales (Imágenes IA) ---');
    const visualPayload = await generateAllScenesVisuals(audioPayload);

    // Paso 4: Seleccionar Música de Fondo y Consolidar Payload Maestro
    console.log('\n--- PASO 4/4: Integrando Música y Consolidando Payload ---');
    const backgroundMusic = selectBackgroundMusic(topic);

    const masterVideoPayload = {
      jobId, // 👈 ¡Agregado aquí en la raíz para cumplir con el esquema de Mongoose!
      ...visualPayload, // Ya trae meta, config, y llmDirective con structuredScript enriquecido
      audioLayer: {
        backgroundMusic,
        mixSettings: {
          voiceVolume: 1.0,
          musicVolume: backgroundMusic.volume,
          duckingEnabled: backgroundMusic.ducking
        }
      }
    };


    // Guardar en MongoDB Atlas
    console.log('\n💾 Guardando proyecto maestro en MongoDB Atlas...');
    const newProject = new VideoProject(masterVideoPayload);
    await newProject.save();

    console.log(`✨ [Studio Lite] Pipeline ejecutado y guardado con éxito para el Job: ${jobId}`);

    return res.status(200).json({
      success: true,
      message: 'Pipeline completo de Studio Lite ejecutado con éxito.',
      jobId,
      data: masterVideoPayload
    });

  } catch (error) {
    console.error('❌ Error en el Pipeline de Studio Lite:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno ejecutando el pipeline de Studio Lite.',
      details: error.message
    });
  }
});

module.exports = router;
