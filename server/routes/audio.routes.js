// server/routes/audio.routes.js
const express = require('express');
const router = express.Router();
const { generateAllScenesAudio } = require('../services/audioService');

router.post('/generate-audio', async (req, res) => {
  try {
    const masterPayload = req.body;
    const enrichedPayload = await generateAllScenesAudio(masterPayload);
    return res.status(200).json(enrichedPayload);
  } catch (error) {
    console.error('❌ Error en /api/audio/generate-audio:', error);
    return res.status(500).json({
      error: 'Error generando los audios con ElevenLabs',
      details: error.message
    });
  }
});

module.exports = router;
