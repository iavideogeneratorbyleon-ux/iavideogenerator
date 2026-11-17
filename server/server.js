// Solución compatible con versiones de Node.js para crypto.getRandomValues
const { webcrypto } = require('crypto');
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
} else if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes'); // <--- 1. Importa las rutas de video
const llmRoutes = require('./routes/llm.routes');
const audioRoutes = require('./routes/audio.routes');
const pipelineRoutes = require('./routes/pipeline.routes');
const visualRoutes = require('./routes/visual.routes');
const studioLiteRoutes = require('./routes/studioLite');

const app = express();
const PORT = process.env.PORT || 3030;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB Atlas (cempa-dara-cluster)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('📦 Conectado exitosamente a MongoDB Atlas (cempa-data-cluster)'))
.catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes); // <--- 2. Monta las rutas en /api/videos
app.use('/api/llm', llmRoutes); //Monta las rutas del llm en /api/llm
app.use('/api/audio', audioRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/visual', visualRoutes);
app.use('/api/studio-lite', studioLiteRoutes);

app.get('/', (req, res) => {
  res.send('API de cempa.ai funcionando al 100% 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
