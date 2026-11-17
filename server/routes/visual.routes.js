// server/routes/visual.routes.js
const express = require('express');
const router = express.Router();
const { generateAllScenesVisuals } = require('../services/visualService');

router.post('/generate-images', async (req, res) => {
  try {
    const enrichedPayload = await generateAllScenesVisuals(req.body);
    return res.status(200).json({
      success: true,
      payload: enrichedPayload
    });
  } catch (error) {
    console.error('❌ Error en /api/visual/generate-images:', error);
    return res.status(500).json({
      success: false,
      error: 'Error generando imágenes por escena',
      details: error.message
    });
  }
});

module.exports = router;
