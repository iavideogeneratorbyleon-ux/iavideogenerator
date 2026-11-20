// server/routes/render.routes.js
const express = require('express');
const router = express.Router();
const { renderFinalVideo } = require('../services/renderService');

// POST /api/render/video-generator
router.post('/video-generator', async (req, res) => {
  try {
    const rawPayload = req.body;

    if (!rawPayload || typeof rawPayload !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un payload JSON válido con escenas, audio y visual.'
      });
    }

    const result = await renderFinalVideo(rawPayload);

    return res.status(200).json({
      success: true,
      step: 4,
      videoFileName: result.videoFileName,
      videoUrl: result.videoUrl,
      resolution: result.resolution,
      subtitlesEnabled: result.subtitlesEnabled,
      watermark: result.watermark,
      renderedAt: result.renderedAt,
      payload: result.payload
    });
  } catch (error) {
    console.error('❌ [Router Step 4 Render] Error:', error);
    return res.status(500).json({
      success: false,
      step: 4,
      error: error.message || 'Error interno al renderizar el video del Paso 4.'
    });
  }
});

module.exports = router;
