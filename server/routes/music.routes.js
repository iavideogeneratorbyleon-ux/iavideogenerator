// server/routes/music.routes.js
const express = require('express');
const router = express.Router();
const { applyBackgroundMusic, MUSIC_CATALOG } = require('../services/musicService');

router.get('/catalog', (_req, res) => {
  return res.json({
    success: true,
    tracks: Object.values(MUSIC_CATALOG)
  });
});

router.post('/add-music', async (req, res) => {
  try {
    const result = await applyBackgroundMusic(req.body);
    return res.json({
      success: true,
      videoFileName: result.videoFileName,
      videoUrl: result.videoUrl,
      musicApplied: result.musicApplied,
      trackKey: result.trackKey,
      duckingEnabled: result.duckingEnabled,
      payload: result.payload
    });
  } catch (error) {
    console.error('❌ Error en /add-music:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al mezclar la música de fondo.'
    });
  }
});

module.exports = router;
