// // server/routes/llm.routes.js
// const express = require('express');
// const { generateStructuredScript } = require('../services/llmService.js');

// const router = express.Router();

// // Endpoint para procesar el Master JSON y generar el guion estructurado con LLM
// router.post('/generate-script', async (req, res) => {
//   try {
//     const masterPayload = req.body;

//     if (!masterPayload || !masterPayload.userInputs?.rawContent) {
//       return res.status(400).json({ error: 'Payload de video inválido o vacío.' });
//     }

//     console.log(`🎬 Iniciando pipeline LLM para usuario ${masterPayload.meta?.userId || 'anónimo'} (Plan: ${masterPayload.meta?.userPlan || 'free_trial'})`);

//     // Ejecutamos el servicio LLM que enriquece el payload con título y escenas
//     const enrichedPayload = await generateStructuredScript(masterPayload);

//     console.log('✅ Guion y título generados con éxito:', enrichedPayload.llmDirective.structuredScript.title);

//     return res.status(200).json({
//       success: true,
//       payload: enrichedPayload,
//     });
//   } catch (error) {
//     console.error('❌ Error en /api/llm/generate-script:', error);
//     return res.status(500).json({ error: 'Error procesando la generación del guion con IA.' });
//   }
// });

// module.exports = router;
// server/routes/llm.routes.js (Ejemplo de endpoint solo para pruebas de Gemini)
const express = require('express');
const router = express.Router();
const { generateStructuredScript } = require('../services/llmService');

router.post('/generate-script', async (req, res) => {
  try {
    const result = await generateStructuredScript(req.body);
    return res.status(200).json({ success: true, payload: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

