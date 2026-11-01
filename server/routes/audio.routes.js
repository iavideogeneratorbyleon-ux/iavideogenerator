const express = require('express');
const router = express.Router();
const { generateAudioStream } = require('../services/elevenlabs.service');

router.post('/generate', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'El campo "text" es obligatorio.' });
        }

        console.log(`🎙️ Recibida solicitud para generar audio: "${text}"`);

        const audioStream = await generateAudioStream(text);

        // Indicamos que la respuesta es un archivo de audio MP3
        res.setHeader('Content-Type', 'audio/mpeg');

        // Enviamos el stream directamente al cliente
        audioStream.pipe(res);

    } catch (error) {
        console.error('❌ Error en el endpoint /generate:', error.message);
        res.status(500).json({ error: 'Error interno al generar el audio.' });
    }
});

module.exports = router;
