// server/routes/studioLite.js
const express = require('express');
const router = express.Router();

const { generateStructuredScript } = require('../services/llmService');
const { generateAllScenesAudio } = require('../services/audioService');
const { generateAllScenesVisuals } = require('../services/visualService');
const { selectBackgroundMusic } = require('../services/musicService');
const { renderFinalVideo } = require('../services/renderService');
const VideoProject = require('../models/VideoProject');
const Video = require('../models/Videos'); // Asegúrate de tener este modelo requerido arriba
// Importamos tu modelo de Usuario para gestionar los créditos en MongoDB
const User = require('../models/User'); // Ajusta la ruta si tu modelo se llama distinto (ej. require('../models/userModel'))

router.post('/generate', async (req, res) => {
  try {
    // Recibimos el masterVideoPayload completo enviado desde el Wizard (Step 5) o Postman
    const masterPayload = req.body;

    if (!masterPayload || !masterPayload.userInputs || !masterPayload.userInputs.rawContent) {
      return res.status(400).json({ success: false, error: 'El payload maestro está incompleto o no contiene rawContent.' });
    }

    const userId = masterPayload.userId || masterPayload.meta?.userId;
    const userPlan = masterPayload.userPlan || masterPayload.meta?.userPlan || 'free_trial';
    const COSTO_CREDITOS = 30;

    // ⚡ VALIDACIÓN DE CRÉDITOS EN MONGODB (Búsqueda segura contra CastError)
    let dbUser = null;
    if (userId) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }

      if (!dbUser) {
        dbUser = await User.findOne({
          $or: [{ email: userId }, { id: userId }] // <-- Sin _id aquí para evitar el CastError
        });
      }
      

      // Fallback por si acaso el ID no matchea de ninguna forma exacta
      if (!dbUser) {
        dbUser = await User.findOne().sort({ createdAt: -1 });
      }

      if (dbUser) {
        // Si el usuario es free_trial y tiene menos de 30 créditos, frenamos antes de gastar recursos de IA
        if (userPlan !== 'pro' && (dbUser.credits ?? 50) < COSTO_CREDITOS) {
          return res.status(400).json({
            success: false,
            error: 'Créditos insuficientes. Necesitas al menos 30 créditos para generar este video.'
          });
        }
      }
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
    console.log(`   🎨 Estilo Visual: [${masterPayload.userInputs.visualStyle || masterPayload.musicConfig?.styleKey}] | Música: [${masterPayload.userInputs.musicStyle || masterPayload.musicConfig?.styleKey}]`);
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

    // 🛡️ Asegurar campos obligatorios requeridos por los esquemas de Mongoose
    const resolvedUserId = dbUser ? dbUser._id : (userId || 'usr_default');
    visualPayload.userId = resolvedUserId;
    visualPayload.meta.userId = resolvedUserId;
    if (dbUser?.email) {
      visualPayload.email = dbUser.email;
    }

    // Guardar proyecto consolidado en MongoDB Atlas
    console.log('\n💾 Guardando proyecto maestro final en MongoDB Atlas...');
    const newProject = new VideoProject(visualPayload);
    await newProject.save();

    // Guardar en la colección 'Video' para que aparezca instantáneamente en el Dashboard
    const newVideoDoc = new Video({
      userId: resolvedUserId,
      email: dbUser?.email || masterPayload.meta?.email || 'usuario@cempai.com',
      title: masterPayload.userInputs?.rawContent || 'Studio Lite Video',
      videoUrl: renderResult.videoUrl,
      videoFileName: renderResult.fileName || 'cempai_video.mp4',
      aspectRatio: masterPayload.userInputs?.aspectRatio || '9:16',
      createdAt: new Date()
    });

    await newVideoDoc.save();
    console.log(`💾 [Generate Endpoint] Video guardado en la colección 'Video' para el Dashboard (Email: ${newVideoDoc.email})`);

    // ⚡ DESCUENTO Y ACTUALIZACIÓN DE CRÉDITOS EN MONGODB
    let remainingCredits = null;
    if (dbUser) {
      const currentCredits = dbUser.credits ?? 50; // Respetamos tus 50 créditos iniciales de registro
      remainingCredits = Math.max(0, currentCredits - COSTO_CREDITOS);

      await User.updateOne(
        { _id: dbUser._id },
        { $set: { credits: remainingCredits } }
      );
      console.log(`⚡ [Créditos] Usuario ${dbUser._id} actualizado. Créditos restantes: ${remainingCredits}`);
    }

    console.log(`✨ [Studio Lite] Pipeline completado con éxito para el Job: ${jobId}`);

    return res.status(200).json({
      success: true,
      message: 'Video generado y renderizado con éxito de punta a punta.',
      jobId,
      videoUrl: renderResult.videoUrl,
      videoFileName: renderResult.fileName || 'cempai_video.mp4',
      remainingCredits, // Enviamos el saldo actualizado al frontend
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

// ==========================================
// 🧪 ENDPOINT ÚNICO DE PRUEBA (MOCK DB + FRONTEND)
// ==========================================
router.post('/generate-mock', async (req, res) => {
  try {
    const masterPayload = req.body;
    const userId = masterPayload.userId || masterPayload.meta?.userId;
    const COSTO_CREDITOS = 30;

    console.log(`\n🧪 [Mock Endpoint] Recibiendo petición de prueba para el Wizard...`);

    // 1. Buscar usuario real en MongoDB de forma segura (evita que explote si el ID es un string tipo 'usr_web_001')
    let dbUser = null;
    if (userId) {
      // Intentamos buscar por _id solo si tiene formato válido de MongoDB (24 caracteres hex)
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }

      // Si no se encontró por ObjectId válido, buscamos por email o tomamos el usuario más reciente registrado para la prueba
      if (!dbUser) {
        dbUser = await User.findOne({
          $or: [{ email: userId }, { id: userId }]
        });
      }

      // Fallback amigable para pruebas: si aún no aparece, tomamos el usuario más reciente de la base de datos
      if (!dbUser) {
        dbUser = await User.findOne().sort({ createdAt: -1 });
      }
    }


    // 2. Simular un tiempo de respuesta realista (3 segundos de los pasos)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockVideoUrl = '/videos/sample-solar-wind.mp4'; // Asegúrate de tener este archivo en tu carpeta pública
    const mockFileName = 'cempai_mock_video.mp4';
    const jobId = `mock_job_${Date.now()}`;

    // 3. Inyectar datos simulados y asegurar el userId en el payload para el modelo VideoProject
    masterPayload.jobId = jobId;
    masterPayload.userId = dbUser ? dbUser._id : (userId || 'usr_default');

    if (!masterPayload.meta) masterPayload.meta = {};
    masterPayload.meta.jobId = jobId;
    masterPayload.meta.userId = masterPayload.userId;
    masterPayload.meta.status = 'completed';

    masterPayload.finalVideo = {
      videoUrl: mockVideoUrl,
      fileName: mockFileName,
    };

    if (dbUser?.email) {
      masterPayload.email = dbUser.email;
    }

    // 💾 4. Guardar proyecto en MongoDB Atlas para que aparezca en el Dashboard
    const newProject = new VideoProject(masterPayload);
    await newProject.save();
    console.log(`💾 [Mock Endpoint] Proyecto falso guardado en MongoDB con ID: ${newProject._id}`);

    // Aseguramos que el documento Video también lleve el userId correcto
    const resolvedUserId = dbUser ? dbUser._id : (userId || 'usr_default');

    const newVideoDoc = new Video({
      userId: resolvedUserId, // <--- ¡Faltaba este campo requerido por el modelo Video!
      email: dbUser?.email || masterPayload.meta?.email || 'usuario@cempai.com',
      title: masterPayload.userInputs?.rawContent || 'Studio Lite Video',
      videoUrl: mockVideoUrl,
      videoFileName: mockFileName,
      aspectRatio: masterPayload.userInputs?.aspectRatio || '9:16',
      createdAt: new Date()
    });

    await newVideoDoc.save();
    console.log(`💾 [Mock Endpoint] Video guardado en la colección 'Video' para el Dashboard (Email: ${newVideoDoc.email})`);



    // ⚡ 5. Descontar los 30 créditos en MongoDB (de 50 a 20)
    let remainingCredits = 20;
    if (dbUser) {
      const currentCredits = dbUser.credits ?? 50;
      remainingCredits = Math.max(0, currentCredits - COSTO_CREDITOS);

      await User.updateOne(
        { _id: dbUser._id },
        { $set: { credits: remainingCredits } }
      );
      console.log(`⚡ [Mock Endpoint] Créditos actualizados en BD. Restantes: ${remainingCredits}`);
    }

    // 6. Responder al Frontend con la estructura idéntica a una ejecución real
    return res.status(200).json({
      success: true,
      message: 'Video de prueba generado con éxito mediante endpoint mock.',
      jobId,
      videoUrl: mockVideoUrl,
      videoFileName: mockFileName,
      remainingCredits,
      data: masterPayload
    });

  } catch (error) {
    console.error('❌ Error crítico en el endpoint mock:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno en el mock endpoint.',
      details: error.message
    });
  }
});

module.exports = router;
