// server/routes/pipeline.routes.js
const express = require('express');
const router = express.Router();
const { runCompletePipeline } = require('../services/pipelineService');

router.post('/generate-video-project', async (req, res) => {
  try {
    const masterPayload = req.body;
    const result = await runCompletePipeline(masterPayload);

    return res.status(200).json({
      success: true,
      message: 'Pipeline ejecutado de punta a punta y guardado en MongoDB',
      payload: result
    });
  } catch (error) {
    console.error('❌ Error en el Pipeline Principal:', error);
    return res.status(500).json({
      success: false,
      error: 'Error ejecutando el pipeline completo',
      details: error.message
    });
  }
});

module.exports = router;
