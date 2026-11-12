const express = require('express');
const router = express.Router();
const Video = require('../models/Videos');
const User = require('../models/User');

// 1. Guardar video al terminar el Wizard y descontar créditos de Studio Lite
router.post('/save', async (req, res) => {
  try {
    const { email, title, mode, aspectRatio, userId } = req.body;

    let validUserId = userId;
    let user = null;

    if (validUserId) {
      user = await User.findById(validUserId);
    }
    
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) validUserId = user._id;
    }

    if (!user || !validUserId) {
      return res.status(400).json({ error: 'No se pudo asociar un usuario válido' });
    }

    // Costo del video en Studio Lite (ej. 30 créditos de los 50 iniciales)
    const COSTO_VIDEO_LITE = 30;

    if (user.credits < COSTO_VIDEO_LITE) {
      return res.status(403).json({ 
        error: 'Créditos insuficientes', 
        remainingCredits: user.credits,
        needsUpgrade: true 
      });
    }

    // Descontar los créditos de la generación
    user.credits -= COSTO_VIDEO_LITE;
    await user.save();

    // Guardar el video asociado
    const newVideo = new Video({
      userId: validUserId,
      email: user.email,
      title: title || 'Studio Lite Video',
      mode: mode || 'idea',
      aspectRatio: aspectRatio || '9:16'
    });

    await newVideo.save();
    return res.status(201).json({ 
      success: true, 
      video: newVideo, 
      remainingCredits: user.credits 
    });
} catch (error) {
  console.error('❌ ERROR DETALLADO AL GUARDAR VIDEO:', error.message);
  console.error(error); // <--- Esto imprimirá el rastro exacto en la terminal de tu servidor
  return res.status(500).json({ error: 'Error al guardar el video', details: error.message });
}

});

// 2. Obtener los videos del usuario para el Dashboard
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const videos = await Video.find({ email }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    return res.status(500).json({ error: 'Error al obtener los videos' });
  }
});

module.exports = router;
